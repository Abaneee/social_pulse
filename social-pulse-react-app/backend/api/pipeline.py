"""
Data preprocessing pipeline for Social Pulse.
Handles CSV cleaning, null handling, date parsing, and standardization.
"""
import os
import pandas as pd
import numpy as np
from django.conf import settings


def preprocess_csv(file_path, options=None):
    """
    Preprocess a raw social media CSV file.

    Args:
        file_path: Path to the raw CSV file
        options: dict with keys removeNulls, deduplicate, standardizeDates

    Returns:
        dict with processed_file_path, stats, preview_data, columns, data_health
    """
    if options is None:
        options = {}

    df = pd.read_csv(file_path)
    original_rows = len(df)
    cleaning_steps = []

    # ─── Step 1: Basic Column Normalization ───
    df.columns = df.columns.str.strip()

    # ─── Step 2: Date Handling ───
    if 'Date' in df.columns:
        try:
            df['Date'] = pd.to_datetime(df['Date'], dayfirst=True, errors='coerce')
            df['Day_of_Week'] = df['Date'].dt.dayofweek
            df['Month'] = df['Date'].dt.month
            cleaning_steps.append('parse_dates')
        except Exception:
            pass

    if options.get('standardizeDates', False) and 'Date' in df.columns:
        df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')
        cleaning_steps.append('standardize_dates')

    # ─── Step 3: Extract Time features ───
    if 'Time' in df.columns:
        try:
            time_series = pd.to_datetime(df['Time'], format='%H:%M', errors='coerce')
            df['Hour'] = time_series.dt.hour
            if df['Hour'].isna().all():
                df['Hour'] = pd.to_numeric(df['Time'], errors='coerce')
            cleaning_steps.append('extract_hour')
        except Exception:
            df['Hour'] = pd.to_numeric(df['Time'], errors='coerce')
    elif 'hour' in df.columns:
        df['Hour'] = pd.to_numeric(df['hour'], errors='coerce')

    # ─── Step 4: Standardize Platform Names ───
    if 'Platform' in df.columns:
        platform_map = {
            'twitter': 'X', 'Twitter': 'X', 'TWITTER': 'X', 'x': 'X',
        }
        df['Platform'] = df['Platform'].replace(platform_map)
        cleaning_steps.append('standardize_platforms')

    # ─── Step 5: Handle Nulls ───
    if options.get('removeNulls', False):
        critical_cols = []
        for col in ['Engagement_Rate', 'Platform']:
            if col in df.columns:
                critical_cols.append(col)

        if critical_cols:
            df = df.dropna(subset=critical_cols)
            cleaning_steps.append('drop_null_targets')

        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if df[col].isna().any():
                df[col] = df[col].fillna(df[col].median())
        cleaning_steps.append('fill_median')

    # ─── Step 6: Deduplicate ───
    if options.get('deduplicate', False):
        before_dedup = len(df)
        df = df.drop_duplicates()
        if len(df) < before_dedup:
            cleaning_steps.append('deduplicate')

    # ─── Step 7: Ensure numeric types ───
    numeric_columns = [
        'Likes', 'Comments', 'Shares', 'Saves', 'Reach',
        'Engagement_Rate', 'Caption_Length', 'Hashtag_count'
    ]
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # ─── Step 8: Calculate Engagement Rate if missing ───
    # Engagement Rate = ((Likes + Comments + Shares + Saves) / Reach) * 100
    if 'Engagement_Rate' not in df.columns and 'Reach' in df.columns:
        # Check if we have interaction columns
        interactions = df['Likes'] if 'Likes' in df.columns else 0
        if 'Comments' in df.columns:
            interactions += df['Comments']
        if 'Shares' in df.columns:
            interactions += df['Shares']
        if 'Saves' in df.columns:
            interactions += df['Saves']
        
        # Calculate
        df['Engagement_Rate'] = (interactions / df['Reach']) * 100
        df['Engagement_Rate'] = df['Engagement_Rate'].fillna(0).replace([float('inf'), -float('inf')], 0)
        cleaning_steps.append('calculate_engagement')

    # ─── Save processed file ───
    rows_removed = original_rows - len(df)

    processed_dir = os.path.join(settings.MEDIA_ROOT, 'processed')
    os.makedirs(processed_dir, exist_ok=True)

    base_name = os.path.basename(file_path)
    processed_name = f"processed_{base_name}"
    processed_path = os.path.join(processed_dir, processed_name)

    df.to_csv(processed_path, index=False)

    # ─── Build preview data ───
    preview_df = df.head(10).copy()
    for col in preview_df.select_dtypes(include=['datetime64']).columns:
        preview_df[col] = preview_df[col].astype(str)
    preview_data = preview_df.fillna('').to_dict(orient='records')

    # ─── Data health calculation ───
    total_cells = df.shape[0] * df.shape[1]
    null_count = int(df.isna().sum().sum())
    health_percentage = round(((total_cells - null_count) / total_cells * 100), 1) if total_cells > 0 else 0

    return {
        'processed_file_path': processed_path,
        'processed_file_relative': f"processed/{processed_name}",
        'cleaning_steps': cleaning_steps,
        'rows_removed': rows_removed,
        'rows_after': len(df),
        'columns': list(df.columns),
        'column_count': len(df.columns),
        'preview_data': preview_data,
        'data_health': {
            'percentage': health_percentage,
            'totalRows': len(df),
            'totalColumns': len(df.columns),
            'nullCount': null_count,
        }
    }


def get_data_preview(file_path, n_rows=5):
    """Read a CSV and return first N rows as list of dicts."""
    try:
        df = pd.read_csv(file_path, nrows=n_rows)
        for col in df.select_dtypes(include=['datetime64']).columns:
            df[col] = df[col].astype(str)
        return df.fillna('').to_dict(orient='records'), list(df.columns)
    except Exception:
        return [], []


def get_full_dataframe(file_path):
    """Load and return a full DataFrame from CSV."""
    return pd.read_csv(file_path)


def compute_data_health(file_path):
    """Compute data health metrics for a CSV file."""
    df = pd.read_csv(file_path)
    total_cells = df.shape[0] * df.shape[1]
    null_count = int(df.isna().sum().sum())
    health = round(((total_cells - null_count) / total_cells * 100), 1) if total_cells > 0 else 0

    return {
        'percentage': health,
        'totalRows': len(df),
        'totalColumns': len(df.columns),
        'nullCount': null_count,
    }
