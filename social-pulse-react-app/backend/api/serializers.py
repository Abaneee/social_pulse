"""
DRF Serializers for Social Pulse API.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Dataset, PreprocessingLog, EDAHistory, MLModel

User = get_user_model()


# ── Auth Serializers ──

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    company_name = serializers.CharField(required=False, allow_blank=True, default='')
    role = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'company_name', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            company_name=validated_data.get('company_name', ''),
            role=validated_data.get('role', ''),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'company_name', 'role', 'date_joined']
        read_only_fields = ['id', 'date_joined']


# ── Dataset Serializers ──

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = [
            'id', 'original_filename', 'row_count', 'column_count',
            'columns', 'is_active', 'uploaded_at'
        ]


class DatasetUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.endswith('.csv'):
            raise serializers.ValidationError('Only CSV files are accepted.')
        if value.size > 52428800:  # 50 MB
            raise serializers.ValidationError('File size must be under 50 MB.')
        return value


# ── Processing Serializers ──

class PreprocessingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreprocessingLog
        fields = [
            'id', 'cleaning_steps_applied', 'rows_removed',
            'rows_after', 'processed_at'
        ]


class ProcessOptionsSerializer(serializers.Serializer):
    removeNulls = serializers.BooleanField(required=False, default=False)
    deduplicate = serializers.BooleanField(required=False, default=False)
    standardizeDates = serializers.BooleanField(required=False, default=False)


# ── EDA Serializers ──

class EDAHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EDAHistory
        fields = ['id', 'report_json', 'generated_at']


# ── ML Serializers ──

class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = [
            'id', 'model_type', 'metrics', 'feature_columns', 'trained_at'
        ]


class TrainRequestSerializer(serializers.Serializer):
    model_type = serializers.ChoiceField(
        choices=['regression', 'classification', 'both'],
        default='both'
    )


class InsightsRequestSerializer(serializers.Serializer):
    platform = serializers.CharField(required=False, allow_blank=True, default='')
    content_type = serializers.CharField(required=False, allow_blank=True, default='')
