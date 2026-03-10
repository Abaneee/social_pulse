import pandas as pd
import numpy as np

def calculate_mis_kpis(df):
    """
    Calculate high-level business KPIs from a social media dataset.
    
    Expected columns (variations handled):
    - Engagement_Rate / engagement_rate
    - Reach / reach
    - Platform / platform
    - Date / date
    - ROI / roi (optional)
    """
    kpis = {}
    
    # 1. Total Engagement Score (Sum of engagement rates)
    eng_col = 'Engagement_Rate' if 'Engagement_Rate' in df.columns else 'engagement_rate' if 'engagement_rate' in df.columns else None
    if eng_col:
        kpis['total_engagement'] = round(float(df[eng_col].sum()), 2)
        kpis['avg_engagement'] = round(float(df[eng_col].mean()), 2)
    else:
        kpis['total_engagement'] = 0
        kpis['avg_engagement'] = 0
        
    # 2. Total Reach
    reach_col = 'Reach' if 'Reach' in df.columns else 'reach' if 'reach' in df.columns else None
    if reach_col:
        kpis['total_reach'] = int(df[reach_col].sum())
    else:
        kpis['total_reach'] = 0
        
    # 3. Average ROI (Mocking if missing, or calculating if exists)
    roi_col = 'ROI' if 'ROI' in df.columns else 'roi' if 'roi' in df.columns else None
    if roi_col:
        kpis['avg_roi'] = round(float(df[roi_col].mean()), 2)
    else:
        # Business logic: Engagement * 0.5 as a proxy for ROI if not present
        if eng_col:
            kpis['avg_roi'] = round(float(df[eng_col].mean() * 0.5), 2)
        else:
            kpis['avg_roi'] = 0
            
    # 4. Top Performing Platform
    platform_col = 'Platform' if 'Platform' in df.columns else 'platform' if 'platform' in df.columns else None
    if platform_col and eng_col:
        plat_performance = df.groupby(platform_col)[eng_col].mean().sort_values(ascending=False)
        if not plat_performance.empty:
            kpis['top_platform'] = plat_performance.index[0]
            kpis['top_platform_score'] = round(float(plat_performance.iloc[0]), 2)
        else:
            kpis['top_platform'] = "N/A"
            kpis['top_platform_score'] = 0
    else:
        kpis['top_platform'] = "N/A"
        kpis['top_platform_score'] = 0
        
    # 5. Performance Trend (Last 2 periods comparison)
    date_col = 'Date' if 'Date' in df.columns else 'date' if 'date' in df.columns else None
    if date_col and eng_col:
        df['dt'] = pd.to_datetime(df[date_col], errors='coerce')
        df_sorted = df.dropna(subset=['dt']).sort_values('dt')
        if len(df_sorted) > 10:
            mid = len(df_sorted) // 2
            prev_half = df_sorted.iloc[:mid][eng_col].mean()
            recent_half = df_sorted.iloc[mid:][eng_col].mean()
            growth = ((recent_half - prev_half) / prev_half * 100) if prev_half != 0 else 0
            kpis['growth_rate'] = round(float(growth), 2)
        else:
            kpis['growth_rate'] = 0
    else:
        kpis['growth_rate'] = 0
        
    return kpis

def get_platform_summaries(df):
    """Get summarized performance table for the MIS report."""
    platform_col = 'Platform' if 'Platform' in df.columns else 'platform' if 'platform' in df.columns else None
    eng_col = 'Engagement_Rate' if 'Engagement_Rate' in df.columns else 'engagement_rate' if 'engagement_rate' in df.columns else None
    reach_col = 'Reach' if 'Reach' in df.columns else 'reach' if 'reach' in df.columns else None
    
    if not platform_col or not eng_col:
        return []
        
    summary = df.groupby(platform_col).agg({
        eng_col: ['mean', 'max'],
        reach_col: 'sum' if reach_col else 'count'
    }).reset_index()
    
    summary.columns = ['Platform', 'Avg Engagement', 'Max Engagement', 'Total Reach']
    return summary.to_dict(orient='records')
