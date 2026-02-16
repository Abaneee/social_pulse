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
    
    # Generate Scatter Data (Actual vs Predicted) - Limit to 200 points for performance
    scatter_data = []
    indices = np.random.choice(len(y_test), size=min(len(y_test), 200), replace=False)
    y_test_arr = y_test.to_numpy()
    for i in indices:
        scatter_data.append({
            'actual': round(float(y_test_arr[i]), 2),
            'predicted': round(float(y_pred[i]), 2),
        })

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
        'visualization': {'scatter_data': scatter_data}
    }


def train_catboost(df):
    """Train a CatBoost classifier to predict engagement category (Low/Average/High)."""
    from catboost import CatBoostClassifier
    from sklearn.metrics import confusion_matrix

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
    
    # Generate Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    confusion_data = []
    for i, row in enumerate(cm):
        row_data = {'name': str(class_names[i])}
        for j, val in enumerate(row):
            row_data[str(class_names[j])] = int(val)
        confusion_data.append(row_data)

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
        'visualization': {'confusion_matrix': confusion_data}
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

    # 5. Predicted Class using CatBoost
    insights['predicted_class'] = None
    try:
        model_path = os.path.join(settings.MEDIA_ROOT, 'models', 'catboost_classification.pkl')
        if os.path.exists(model_path):
            model_data = joblib.load(model_path)
            model = model_data['model']
            feature_columns = model_data['feature_columns']
            le = model_data.get('label_encoder') 
            # Note: newer CatBoost might handle labels internally, but we use what we saved

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
            # Predict class index
            class_idx = model.predict(input_df)[0]
            
            # If we saved label encoder, use it to get string label
            if le:
                 # Check if class_idx is inside an array (CatBoost sometimes returns [[idx]])
                if isinstance(class_idx, (list, np.ndarray)):
                    class_idx = class_idx[0]
                
                insights['predicted_class'] = le.inverse_transform([int(class_idx)])[0]
            else:
                 insights['predicted_class'] = str(class_idx)

    except Exception as e:
        print(f"Classification prediction error: {e}")
        insights['predicted_class'] = None

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

    # 8. Average Reach
    reach_col = 'Reach' if 'Reach' in filtered.columns else 'reach' if 'reach' in filtered.columns else None
    if reach_col:
        insights['average_reach'] = round(float(filtered[reach_col].mean()), 2)
    else:
        insights['average_reach'] = 0

    return insights


def get_dashboard_data(df, platform=None):
    """Compute aggregated dashboard data for VisionDeck (8 Charts)."""
    # Normalize columns
    df.columns = [c.strip() for c in df.columns]
    
    # Identify columns
    eng_col = next((c for c in df.columns if c.lower() == 'engagement_rate'), None)
    reach_col = next((c for c in df.columns if c.lower() == 'reach'), None)
    platform_col = next((c for c in df.columns if c.lower() == 'platform'), None)
    
    # Get all platforms BEFORE filtering
    all_platforms = []
    if platform_col:
        all_platforms = sorted(df[platform_col].unique().tolist())

    # Filter by Platform if specified
    if platform and platform != 'All' and platform_col:
        df = df[df[platform_col] == platform]

    ctype_col = next((c for c in df.columns if c.lower() == 'content_type'), 'Content_Type')
    date_col = next((c for c in df.columns if c.lower() == 'date' or c.lower() == 'posted_date'), None)
    hashtag_col = next((c for c in df.columns if c.lower().startswith('hashtag')), None)
    
    # Ensure numeric types
    if eng_col:
        df[eng_col] = pd.to_numeric(df[eng_col], errors='coerce').fillna(0)
    if reach_col:
        df[reach_col] = pd.to_numeric(df[reach_col], errors='coerce').fillna(0)
    
    # Parse Date if exists
    if date_col:
        df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
        df['Month'] = df[date_col].dt.strftime('%b')
        df['DayOfWeek'] = df[date_col].dt.day_name()
        # For sorting
        df['MonthNum'] = df[date_col].dt.month
        df['DayNum'] = df[date_col].dt.dayofweek

    result = {}

    # 1. Pie Chart: Engagement Rate by Content Type (Split by Platform)
    # We'll return a structure: { 'All': [...], 'Instagram': [...], ... }
    # NOTE: Since we are now filtering globally, 'All' key will contain data for the selected platform context
    pie_data = {}
    if ctype_col and eng_col:
        # Global
        global_group = df.groupby(ctype_col)[eng_col].mean().reset_index()
        pie_data['All'] = [
            {'name': row[ctype_col], 'value': round(row[eng_col], 2)} 
            for _, row in global_group.iterrows()
        ]
        
        # Per Platform
        if platform_col:
            platforms = df[platform_col].unique()
            for p in platforms:
                p_df = df[df[platform_col] == p]
                p_group = p_df.groupby(ctype_col)[eng_col].mean().reset_index()
                pie_data[str(p)] = [
                    {'name': row[ctype_col], 'value': round(row[eng_col], 2)} 
                    for _, row in p_group.iterrows()
                ]
    result['pieData'] = pie_data

    # 2. Bar Chart: Engagement Rate by Day of Week
    if 'DayOfWeek' in df.columns and eng_col:
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_group = df.groupby('DayOfWeek')[eng_col].mean().reindex(day_order).reset_index()
        result['barDayData'] = [
            {'day': row['DayOfWeek'], 'engagement': round(row[eng_col], 2)}
            for _, row in day_group.iterrows()
        ]
    else:
        result['barDayData'] = []

    # 3. Line Chart: Engagement Rate by Month
    if 'Month' in df.columns and eng_col:
        month_group = df.groupby(['MonthNum', 'Month'])[eng_col].mean().reset_index().sort_values('MonthNum')
        result['lineMonthData'] = [
            {'month': row['Month'], 'engagement': round(row[eng_col], 2)}
            for _, row in month_group.iterrows()
        ]
    else:
        result['lineMonthData'] = []

    # 4. Vertical Bar Chart: Reach by Hashtags
    if hashtag_col and reach_col:
        # Split hashtags if they are comma separated
        hashtag_df = df[[hashtag_col, reach_col]].dropna().copy()
        hashtag_df['tags'] = hashtag_df[hashtag_col].astype(str).str.split(r'[\s,]+')
        exploded = hashtag_df.explode('tags')
        exploded['tags'] = exploded['tags'].str.strip()
        exploded = exploded[exploded['tags'].str.len() > 1] # Filter valid tags
        
        tag_reach = exploded.groupby('tags')[reach_col].sum().sort_values(ascending=False).head(10).reset_index()
        result['barHashtagData'] = [
            {'hashtag': row['tags'], 'reach': int(row[reach_col])}
            for _, row in tag_reach.iterrows()
        ]
    else:
        result['barHashtagData'] = []

    # 5. Scatter Chart: Engagement vs Reach (Extra)
    if eng_col and reach_col:
        # Sample down if too large
        sample_df = df.sample(min(len(df), 200)) if len(df) > 200 else df
        result['scatterData'] = [
            {'x': int(row[reach_col]), 'y': round(row[eng_col], 2), 'name': str(row[ctype_col]) if ctype_col else 'Post'}
            for _, row in sample_df.iterrows()
        ]
    else:
        result['scatterData'] = []
    
    # 6. Bar Chart: Top 5 Posts by Engagement (Extra)
    if eng_col:
        top_posts = df.nlargest(5, eng_col)
        result['topPostsData'] = []
        for _, row in top_posts.iterrows():
            name = f"{row[platform_col]} - {row[ctype_col]}" if platform_col and ctype_col else "Post"
            result['topPostsData'].append({
                'name': name,
                'engagement': round(row[eng_col], 2)
            })
    else:
        result['topPostsData'] = []

    # 7. Line Chart: Reach Trends (Extra / Replacement for old Area)
    if date_col and reach_col:
        reach_trend = df.groupby(date_col)[reach_col].sum().reset_index().sort_values(date_col)
        result['areaReachData'] = [
            {'date': row[date_col].strftime('%Y-%m-%d'), 'reach': int(row[reach_col])}
            for _, row in reach_trend.iterrows()
        ]
    else:
        result['areaReachData'] = []

    # 8. Bar Chart: Hourly Engagement (Extra)
    hour_col = next((c for c in df.columns if c.lower() == 'hour'), None)
    if hour_col and eng_col:
        hour_group = df.groupby(hour_col)[eng_col].mean().reset_index().sort_values(hour_col)
        result['barHourData'] = [
            {'hour': f"{int(row[hour_col])}:00", 'engagement': round(row[eng_col], 2)}
            for _, row in hour_group.iterrows()
        ]
    else:
        result['barHourData'] = []

    # KPIs (Keep existing logic mostly)
    kpis = {}
    kpis['totalReach'] = int(df[reach_col].sum()) if reach_col else 0
    kpis['avgEngagement'] = round(df[eng_col].mean(), 2) if eng_col else 0
    kpis['topHashtag'] = result['barHashtagData'][0]['hashtag'] if result['barHashtagData'] else 'N/A'
    
    # Peak Time
    if hour_col and eng_col:
         peak_hour = df.groupby(hour_col)[eng_col].mean().idxmax()
         kpis['peakTime'] = f"{int(peak_hour)}:00"
    else:
         kpis['peakTime'] = 'N/A'

    result['kpis'] = kpis
    result['platforms'] = all_platforms

    return result
