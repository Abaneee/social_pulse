"""
API Views for Social Pulse.
All endpoints for auth, upload, preprocessing, EDA, ML training, insights, and dashboard.
"""
import os
import json
import pandas as pd
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Dataset, PreprocessingLog, EDAHistory, MLModel
from .serializers import (
    RegisterSerializer, UserSerializer,
    DatasetSerializer, DatasetUploadSerializer,
    ProcessOptionsSerializer, PreprocessingLogSerializer,
    EDAHistorySerializer, MLModelSerializer,
    TrainRequestSerializer, InsightsRequestSerializer,
)
from .pipeline import preprocess_csv, get_data_preview, compute_data_health, get_full_dataframe
from .ml_engine import train_lightgbm, train_catboost, get_insights, get_dashboard_data

User = get_user_model()


# ══════════════════════════════════════════════
#  AUTH ENDPOINTS
# ══════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login with email + password, return JWT tokens."""
    email = request.data.get('email', '')
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.check_password(password):
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Get current user profile."""
    return Response(UserSerializer(request.user).data)


# ══════════════════════════════════════════════
#  DATASET ENDPOINTS
# ══════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_dataset_view(request):
    """Upload a CSV file, create a Dataset record, return preview and health."""
    serializer = DatasetUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    uploaded_file = serializer.validated_data['file']

    # Save dataset record
    dataset = Dataset(
        user=request.user,
        file=uploaded_file,
        original_filename=uploaded_file.name,
        is_active=True,
    )
    dataset.save()

    # Read the saved file to compute stats
    file_path = dataset.file.path
    try:
        df = pd.read_csv(file_path)
        dataset.row_count = len(df)
        dataset.column_count = len(df.columns)
        dataset.columns = list(df.columns)
        dataset.save()

        # Build preview
        preview_df = df.head(5).copy()
        for col in preview_df.select_dtypes(include=['datetime64']).columns:
            preview_df[col] = preview_df[col].astype(str)
        preview_data = preview_df.fillna('').to_dict(orient='records')

        # Data health
        health = compute_data_health(file_path)

        return Response({
            'dataset': DatasetSerializer(dataset).data,
            'preview': preview_data,
            'dataHealth': health,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        dataset.delete()
        return Response(
            {'error': f'Failed to parse CSV: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_datasets_view(request):
    """List all datasets for the current user."""
    datasets = Dataset.objects.filter(user=request.user)
    return Response(DatasetSerializer(datasets, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_dataset_view(request, dataset_id):
    """Set a dataset as active for the current user."""
    try:
        dataset = Dataset.objects.get(id=dataset_id, user=request.user)
    except Dataset.DoesNotExist:
        return Response(
            {'error': 'Dataset not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    dataset.is_active = True
    dataset.save()

    return Response({
        'message': 'Dataset activated.',
        'dataset': DatasetSerializer(dataset).data,
    })


def _get_active_dataset(user):
    """Helper: get the active dataset for a user, or None."""
    return Dataset.objects.filter(user=user, is_active=True).first()


def _get_data_file_path(dataset):
    """Helper: get the best available data file (processed or raw)."""
    try:
        log = dataset.preprocessing_log
        if log.processed_file and os.path.exists(log.processed_file.path):
            return log.processed_file.path
    except PreprocessingLog.DoesNotExist:
        pass
    return dataset.file.path


# ══════════════════════════════════════════════
#  PREPROCESSING ENDPOINT
# ══════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_data_view(request):
    """Preprocess the active dataset with given cleaning options."""
    dataset = _get_active_dataset(request.user)
    if not dataset:
        return Response(
            {'error': 'No active dataset. Please upload and activate a dataset first.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = ProcessOptionsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    options = serializer.validated_data
    file_path = dataset.file.path

    try:
        result = preprocess_csv(file_path, options)

        # Save or update preprocessing log
        log, created = PreprocessingLog.objects.update_or_create(
            dataset=dataset,
            defaults={
                'cleaning_steps_applied': result['cleaning_steps'],
                'rows_removed': result['rows_removed'],
                'rows_after': result['rows_after'],
                'processed_file': result['processed_file_relative'],
            }
        )

        # Update dataset column info
        dataset.row_count = result['rows_after']
        dataset.column_count = result['column_count']
        dataset.columns = result['columns']
        dataset.save()

        return Response({
            'message': 'Data processed successfully.',
            'preprocessing': PreprocessingLogSerializer(log).data,
            'preview': result['preview_data'],
            'dataHealth': result['data_health'],
        })

    except Exception as e:
        return Response(
            {'error': f'Preprocessing failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ══════════════════════════════════════════════
#  EDA ENDPOINT
# ══════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def eda_report_view(request):
    """Generate EDA report JSON using ydata-profiling for the active dataset."""
    dataset = _get_active_dataset(request.user)
    if not dataset:
        return Response(
            {'error': 'No active dataset.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file_path = _get_data_file_path(dataset)

    try:
        df = pd.read_csv(file_path)

        # Generate profiling report
        try:
            from ydata_profiling import ProfileReport
            profile = ProfileReport(
                df,
                title="Social Pulse EDA",
                minimal=True,
                explorative=False,
            )
            report_json = json.loads(profile.to_json())
        except ImportError:
            # Fallback: manual EDA if ydata-profiling not available
            report_json = _manual_eda(df)

        # Save EDA history
        eda = EDAHistory.objects.create(
            dataset=dataset,
            report_json=report_json,
        )

        return Response({
            'eda': EDAHistorySerializer(eda).data,
        })

    except Exception as e:
        return Response(
            {'error': f'EDA generation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _manual_eda(df):
    """Fallback manual EDA when ydata-profiling is not installed."""
    import numpy as np
    report = {
        'table': {
            'n': len(df),
            'n_var': len(df.columns),
            'n_cells_missing': int(df.isna().sum().sum()),
            'n_duplicates': int(df.duplicated().sum()),
            'p_cells_missing': round(float(df.isna().sum().sum() / (len(df) * len(df.columns)) * 100), 2),
        },
        'variables': {},
    }

    for col in df.columns:
        col_data = df[col]
        var_info = {
            'type': str(col_data.dtype),
            'n_missing': int(col_data.isna().sum()),
            'p_missing': round(float(col_data.isna().mean() * 100), 2),
            'n_distinct': int(col_data.nunique()),
            'count': int(col_data.count()),
        }

        if pd.api.types.is_numeric_dtype(col_data):
            desc = col_data.describe()
            var_info.update({
                'mean': round(float(desc.get('mean', 0)), 4),
                'std': round(float(desc.get('std', 0)), 4),
                'min': round(float(desc.get('min', 0)), 4),
                'max': round(float(desc.get('max', 0)), 4),
                'median': round(float(col_data.median()), 4),
            })
        else:
            top_values = col_data.value_counts().head(5)
            var_info['top_values'] = {str(k): int(v) for k, v in top_values.items()}

        report['variables'][col] = var_info

    return report


# ══════════════════════════════════════════════
#  ML TRAINING ENDPOINT
# ══════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_model_view(request):
    """Train ML models on the active dataset."""
    dataset = _get_active_dataset(request.user)
    if not dataset:
        return Response(
            {'error': 'No active dataset.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = TrainRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    model_type = serializer.validated_data.get('model_type', 'both')
    file_path = _get_data_file_path(dataset)

    try:
        df = pd.read_csv(file_path)
        results = {}

        # Train LightGBM Regression
        if model_type in ('regression', 'both'):
            try:
                lgbm_result = train_lightgbm(df)
                MLModel.objects.update_or_create(
                    dataset=dataset,
                    model_type=MLModel.ModelType.REGRESSION_LGBM,
                    defaults={
                        'model_file': lgbm_result['model_relative'],
                        'metrics': lgbm_result['metrics'],
                        'feature_columns': lgbm_result['feature_columns'],
                    }
                )
                results['regression'] = {
                    'title': 'LightGBM Regression',
                    'subtitle': 'Predict Engagement Rate',
                    'metrics': lgbm_result['metrics'],
                    'feature_columns': lgbm_result['feature_columns'],
                    'training_samples': lgbm_result['training_samples'],
                    'test_samples': lgbm_result['test_samples'],
                }
            except Exception as e:
                results['regression'] = {'error': str(e)}

        # Train CatBoost Classification
        if model_type in ('classification', 'both'):
            try:
                catboost_result = train_catboost(df)
                MLModel.objects.update_or_create(
                    dataset=dataset,
                    model_type=MLModel.ModelType.CLASSIFICATION_CATBOOST,
                    defaults={
                        'model_file': catboost_result['model_relative'],
                        'metrics': catboost_result['metrics'],
                        'feature_columns': catboost_result['feature_columns'],
                    }
                )
                results['classification'] = {
                    'title': 'CatBoost Classification',
                    'subtitle': 'Predict Engagement Category',
                    'metrics': catboost_result['metrics'],
                    'feature_columns': catboost_result['feature_columns'],
                    'class_names': catboost_result['class_names'],
                    'training_samples': catboost_result['training_samples'],
                    'test_samples': catboost_result['test_samples'],
                }
            except Exception as e:
                results['classification'] = {'error': str(e)}

        return Response({
            'message': 'Training complete.',
            'results': results,
        })

    except Exception as e:
        return Response(
            {'error': f'Training failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ══════════════════════════════════════════════
#  INSIGHTS / PREDICTION ENDPOINT
# ══════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_insights_view(request):
    """Generate dynamic insights for a given platform + content type."""
    dataset = _get_active_dataset(request.user)
    if not dataset:
        return Response(
            {'error': 'No active dataset.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = InsightsRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    platform = serializer.validated_data.get('platform', '')
    content_type = serializer.validated_data.get('content_type', '')

    file_path = _get_data_file_path(dataset)

    try:
        df = pd.read_csv(file_path)
        insights = get_insights(df, platform, content_type)

        return Response({
            'insights': insights,
            'filters': {
                'platform': platform,
                'content_type': content_type,
            }
        })

    except Exception as e:
        return Response(
            {'error': f'Insights generation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ══════════════════════════════════════════════
#  DASHBOARD ENDPOINT
# ══════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """Get aggregated dashboard data for VisionDeck."""
    dataset = _get_active_dataset(request.user)
    if not dataset:
        return Response(
            {'error': 'No active dataset.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file_path = _get_data_file_path(dataset)

    try:
        df = pd.read_csv(file_path)
        dashboard = get_dashboard_data(df)

        return Response(dashboard)

    except Exception as e:
        return Response(
            {'error': f'Dashboard data failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ══════════════════════════════════════════════
#  FILTER OPTIONS ENDPOINT
# ══════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def filter_options_view(request):
    """Get unique platform and content type values from active dataset."""
    dataset = _get_active_dataset(request.user)
    if not dataset:
        return Response(
            {'error': 'No active dataset.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file_path = _get_data_file_path(dataset)

    try:
        df = pd.read_csv(file_path)

        platforms = []
        content_types = []

        for col in ['Platform', 'platform']:
            if col in df.columns:
                platforms = sorted(df[col].dropna().unique().tolist())
                break

        for col in ['Content_Type', 'content_type']:
            if col in df.columns:
                content_types = sorted(df[col].dropna().unique().tolist())
                break

        return Response({
            'platforms': platforms,
            'content_types': content_types,
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
