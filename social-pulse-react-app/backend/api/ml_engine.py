"""
Machine Learning engine for Social Pulse.
Handles LightGBM regression, CatBoost classification, and dynamic insights.
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
from django.conf import settings

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_squared_error, r2_score,
    accuracy_score, f1_score,
)
from sklearn.preprocessing import LabelEncoder


def _prepare_features(df):
    """
    Prepare feature matrix from the dataframe.
    Returns X (DataFrame), feature_columns (list)
    """
    feature_cols = []
    df_features = pd.DataFrame()

    # Numerical features
    for col in ['Caption_Length', 'Hashtag_count', 'Hour', 'Day_of_Week']:
        if col in df.columns:
            df_features[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            feature_cols.append(col)

    # Also check lowercase/alternate names
    alt_map = {
        'caption_length': 'Caption_Length',
        'hashtag_count': 'Hashtag_count',
        'hour': 'Hour',
        'day_of_week': 'Day_of_Week',
    }
    for alt, canonical in alt_map.items():
        if canonical not in df_features.columns and alt in df.columns:
            df_features[canonical] = pd.to_numeric(df[alt], errors='coerce').fillna(0)
            feature_cols.append(canonical)

    # One-Hot Encode categorical features
    for cat_col in ['Platform', 'Content_Type']:
        col_to_use = cat_col if cat_col in df.columns else cat_col.lower() if cat_col.lower() in df.columns else None
        if col_to_use:
            dummies = pd.get_dummies(df[col_to_use], prefix=cat_col)
            df_features = pd.concat([df_features, dummies], axis=1)

    feature_cols = list(df_features.columns)
    return df_features, feature_cols


def train_lightgbm(df):
    """Train a LightGBM regressor to predict Engagement_Rate."""
    import lightgbm as lgb

    target_col = None
    for candidate in ['Engagement_Rate', 'engagement_rate']:
        if candidate in df.columns:
            target_col = candidate
            break

    if target_col is None:
        raise ValueError("Target column 'Engagement_Rate' not found in dataset.")

    y = pd.to_numeric(df[target_col], errors='coerce').fillna(0)
    X, feature_columns = _prepare_features(df)

    if X.empty or len(feature_columns) == 0:
        raise ValueError("No valid features found for training.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = lgb.LGBMRegressor(
        n_estimators=100, learning_rate=0.1, max_depth=6,
        num_leaves=31, random_state=42, verbose=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    models_dir = os.path.join(settings.MEDIA_ROOT, 'models')
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, 'lgbm_regression.pkl')
    joblib.dump({'model': model, 'feature_columns': feature_columns}, model_path)

    return {
        'model_path': model_path,
        'model_relative': 'models/lgbm_regression.pkl',
        'metrics': {
            'mse': round(mse, 4),
            'rmse': round(rmse, 4),
            'r2_score': round(r2, 4),
        },
        'feature_columns': feature_columns,
        'training_samples': len(X_train),
        'test_samples': len(X_test),
    }


def train_catboost(df):
    """Train a CatBoost classifier to predict engagement category (Low/Average/High)."""
    from catboost import CatBoostClassifier

    target_col = None
    for candidate in ['Engagement_Rate', 'engagement_rate']:
        if candidate in df.columns:
            target_col = candidate
            break

    if target_col is None:
        raise ValueError("Target column 'Engagement_Rate' not found in dataset.")

    engagement = pd.to_numeric(df[target_col], errors='coerce').fillna(0)

    def categorize(val):
        if val < 2:
            return 'Low'
        elif val <= 8:
            return 'Average'
        else:
            return 'High'

    y_labels = engagement.apply(categorize)
    le = LabelEncoder()
    y = le.fit_transform(y_labels)

    X, feature_columns = _prepare_features(df)

    if X.empty or len(feature_columns) == 0:
        raise ValueError("No valid features found for training.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = CatBoostClassifier(
        iterations=100, learning_rate=0.1, depth=6,
        random_seed=42, verbose=0, loss_function='MultiClass',
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test).flatten()
    accuracy = float(accuracy_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred, average='weighted'))

    class_names = le.inverse_transform(sorted(set(y)))

    models_dir = os.path.join(settings.MEDIA_ROOT, 'models')
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, 'catboost_classification.pkl')
    joblib.dump({
        'model': model, 'feature_columns': feature_columns,
        'label_encoder': le, 'class_names': list(class_names),
    }, model_path)

    return {
        'model_path': model_path,
        'model_relative': 'models/catboost_classification.pkl',
        'metrics': {
            'accuracy': round(accuracy * 100, 2),
            'f1_score': round(f1, 4),
        },
        'feature_columns': feature_columns,
        'class_names': list(class_names),
        'training_samples': len(X_train),
        'test_samples': len(X_test),
    }


def get_insights(df, platform='', content_type=''):
    """Generate dynamic insights for a given platform and content type."""
    filtered = df.copy()

    platform_col = 'Platform' if 'Platform' in df.columns else 'platform' if 'platform' in df.columns else None
    ctype_col = 'Content_Type' if 'Content_Type' in df.columns else 'content_type' if 'content_type' in df.columns else None

    if platform and platform_col and platform in df[platform_col].values:
        filtered = filtered[filtered[platform_col] == platform]
    if content_type and ctype_col and content_type in df[ctype_col].values:
        filtered = filtered[filtered[ctype_col] == content_type]

    if len(filtered) == 0:
        filtered = df.copy()

    eng_col = 'Engagement_Rate' if 'Engagement_Rate' in filtered.columns else 'engagement_rate' if 'engagement_rate' in filtered.columns else None
    insights = {}

    # 1. Best Time to Post
    hour_col = 'Hour' if 'Hour' in filtered.columns else 'hour' if 'hour' in filtered.columns else None
    if hour_col and eng_col:
        hour_eng = filtered.groupby(hour_col)[eng_col].mean().sort_values(ascending=False)
        top_hours = hour_eng.head(3)
        insights['best_times'] = [
            {'hour': int(h), 'avg_engagement': round(float(v), 2)}
            for h, v in top_hours.items()
        ]
    else:
        insights['best_times'] = []

    # 2. Best Day
    day_col = 'Day_of_Week' if 'Day_of_Week' in filtered.columns else 'day_of_week' if 'day_of_week' in filtered.columns else None
    if day_col and eng_col:
        day_names_map = {0: 'Mon', 1: 'Tue', 2: 'Wed', 3: 'Thu', 4: 'Fri', 5: 'Sat', 6: 'Sun'}
        day_eng = filtered.groupby(day_col)[eng_col].mean().sort_values(ascending=False)
        best_day_val = day_eng.index[0] if len(day_eng) > 0 else 0
        try:
            best_day_name = day_names_map.get(int(best_day_val), str(best_day_val))
        except (ValueError, TypeError):
            best_day_name = str(best_day_val)

        insights['best_day'] = {
            'day': best_day_name,
            'avg_engagement': round(float(day_eng.iloc[0]), 2) if len(day_eng) > 0 else 0,
        }
    else:
        insights['best_day'] = {'day': 'N/A', 'avg_engagement': 0}

    # 3. Best Caption Length Strategy
    caption_col = 'Caption_Length' if 'Caption_Length' in filtered.columns else 'caption_length' if 'caption_length' in filtered.columns else None
    if caption_col and eng_col:
        # Create bins for analysis without modifying original df permanently
        temp_df = filtered[[caption_col, eng_col]].copy()
        
        def get_len_cat(x):
            try:
                val = float(x)
                if val < 50: return 'Short (<50 chars)'
                elif val <= 150: return 'Medium (50-150 chars)'
                else: return 'Long (>150 chars)'
            except:
                return 'Medium (50-150 chars)'

        temp_df['Length_Cat'] = temp_df[caption_col].apply(get_len_cat)
        cap_eng = temp_df.groupby('Length_Cat')[eng_col].mean().sort_values(ascending=False)
        
        if len(cap_eng) > 0:
            insights['best_caption_length'] = cap_eng.index[0]
        else:
            insights['best_caption_length'] = 'Medium (50-150 chars)'
    else:
        insights['best_caption_length'] = 'Medium (50-150 chars)'

    # 3. Best Hashtags
    hashtag_col = 'Hashtags' if 'Hashtags' in filtered.columns else 'hashtag' if 'hashtag' in filtered.columns else None
    if hashtag_col and eng_col:
        hashtag_df = filtered[[hashtag_col, eng_col]].copy()
        hashtag_df[hashtag_col] = hashtag_df[hashtag_col].astype(str)
        hashtag_df = hashtag_df.assign(
            **{hashtag_col: hashtag_df[hashtag_col].str.split(r'[\s,]+')},
        ).explode(hashtag_col)
        hashtag_df = hashtag_df[hashtag_df[hashtag_col].str.strip() != '']
        hashtag_df[hashtag_col] = hashtag_df[hashtag_col].str.strip()

        if len(hashtag_df) > 0:
            hashtag_eng = hashtag_df.groupby(hashtag_col)[eng_col].agg(['mean', 'count'])
            hashtag_eng = hashtag_eng[hashtag_eng['count'] >= 1].sort_values('mean', ascending=False)
            top_hashtags = hashtag_eng.head(5)
            insights['best_hashtags'] = [
                {'hashtag': str(h), 'avg_engagement': round(float(row['mean']), 2), 'count': int(row['count'])}
                for h, row in top_hashtags.iterrows()
            ]
        else:
            insights['best_hashtags'] = []
    else:
        insights['best_hashtags'] = []

    # 4. Predicted Engagement using LightGBM
    insights['predicted_engagement'] = None
    try:
        model_path = os.path.join(settings.MEDIA_ROOT, 'models', 'lgbm_regression.pkl')
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            model = model_data['model']
            feature_columns = model_data['feature_columns']

            input_row = {}
            for col in feature_columns:
                if col.startswith('Platform_'):
                    plat_name = col.replace('Platform_', '')
                    input_row[col] = 1.0 if platform and plat_name == platform else 0.0
                elif col.startswith('Content_Type_'):
                    ct_name = col.replace('Content_Type_', '')
                    input_row[col] = 1.0 if content_type and ct_name == content_type else 0.0
                else:
                    if col in filtered.columns:
                        val = pd.to_numeric(filtered[col], errors='coerce').median()
                        input_row[col] = float(val) if not np.isnan(val) else 0.0
                    else:
                        input_row[col] = 0.0

            input_df = pd.DataFrame([input_row])[feature_columns]
            prediction = model.predict(input_df)[0]
            insights['predicted_engagement'] = round(float(prediction), 2)
    except Exception:
        insights['predicted_engagement'] = None

    # 5. Engagement Distribution
    if eng_col:
        engagement_vals = pd.to_numeric(filtered[eng_col], errors='coerce').dropna()
        dist = {}
        for val in engagement_vals:
            bucket = int(val // 2) * 2
            key = f"{bucket}-{bucket + 2}%"
            dist[key] = dist.get(key, 0) + 1

        insights['engagement_distribution'] = [
            {'range': k, 'count': v}
            for k, v in sorted(dist.items(), key=lambda x: x[0])
        ]
    else:
        insights['engagement_distribution'] = []

    # 6. Top Performing Posts
    if eng_col:
        engagement_numeric = pd.to_numeric(filtered[eng_col], errors='coerce')
        top_indices = engagement_numeric.nlargest(5).index
        top_posts = []
        for idx in top_indices:
            row = filtered.loc[idx]
            post = {
                'platform': str(row.get(platform_col or 'Platform', 'Unknown')),
                'content_type': str(row.get(ctype_col or 'Content_Type', 'Unknown')),
                'engagement_rate': round(float(row.get(eng_col, 0)), 2),
            }
            if 'Reach' in filtered.columns:
                post['reach'] = int(float(row.get('Reach', 0)))
            top_posts.append(post)
        insights['top_posts'] = top_posts
    else:
        insights['top_posts'] = []

    # 7. Platform Engagement
    if platform_col and eng_col:
        plat_eng = filtered.groupby(platform_col)[eng_col].mean()
        insights['platform_engagement'] = [
            {'platform': str(p), 'engagement': round(float(v), 2)}
            for p, v in plat_eng.items()
        ]
    else:
        insights['platform_engagement'] = []

    return insights


def get_dashboard_data(df):
    """Compute aggregated dashboard data for VisionDeck."""
    eng_col = 'Engagement_Rate' if 'Engagement_Rate' in df.columns else 'engagement_rate' if 'engagement_rate' in df.columns else None
    platform_col = 'Platform' if 'Platform' in df.columns else 'platform' if 'platform' in df.columns else None
    ctype_col = 'Content_Type' if 'Content_Type' in df.columns else 'content_type' if 'content_type' in df.columns else None
    date_col = 'Date' if 'Date' in df.columns else 'date' if 'date' in df.columns else None
    reach_col = 'Reach' if 'Reach' in df.columns else 'reach' if 'reach' in df.columns else None
    hashtag_col = 'Hashtags' if 'Hashtags' in df.columns else 'hashtag' if 'hashtag' in df.columns else None
    hour_col = 'Hour' if 'Hour' in df.columns else 'hour' if 'hour' in df.columns else None

    result = {}

    # Content Type Distribution (pie chart)
    if ctype_col:
        ct_counts = df[ctype_col].value_counts()
        result['pieData'] = [{'name': str(k), 'value': int(v)} for k, v in ct_counts.items()]
    else:
        result['pieData'] = []

    # Reach Over Time (area chart)
    if date_col and reach_col:
        df_copy = df.copy()
        df_copy[reach_col] = pd.to_numeric(df_copy[reach_col], errors='coerce').fillna(0)
        reach_by_date = df_copy.groupby(date_col)[reach_col].sum().reset_index()
        reach_by_date = reach_by_date.sort_values(date_col).head(20)
        result['areaData'] = [
            {'date': str(row[date_col]), 'reach': int(row[reach_col])}
            for _, row in reach_by_date.iterrows()
        ]
    else:
        result['areaData'] = []

    # Engagement by Platform (bar chart)
    if platform_col and eng_col:
        plat_eng = df.groupby(platform_col)[eng_col].mean()
        result['barData'] = [
            {'platform': str(p), 'engagement': round(float(v), 2)}
            for p, v in plat_eng.items()
        ]
    else:
        result['barData'] = []

    # KPIs
    kpis = {}
    if reach_col:
        kpis['totalReach'] = int(pd.to_numeric(df[reach_col], errors='coerce').fillna(0).sum())
    else:
        kpis['totalReach'] = 0

    if eng_col:
        eng_vals = pd.to_numeric(df[eng_col], errors='coerce').fillna(0)
        kpis['avgEngagement'] = round(float(eng_vals.mean()), 2)
    else:
        kpis['avgEngagement'] = 0

    if hashtag_col:
        hashtag_counts = df[hashtag_col].value_counts()
        kpis['topHashtag'] = str(hashtag_counts.index[0]) if len(hashtag_counts) > 0 else '#trending'
    else:
        kpis['topHashtag'] = '#trending'

    if hour_col and eng_col:
        hour_eng = df.groupby(hour_col)[eng_col].mean()
        if len(hour_eng) > 0:
            peak = hour_eng.idxmax()
            kpis['peakTime'] = f"{int(peak)}:00"
        else:
            kpis['peakTime'] = '12:00'
    else:
        kpis['peakTime'] = '12:00'

    result['kpis'] = kpis

    return result
