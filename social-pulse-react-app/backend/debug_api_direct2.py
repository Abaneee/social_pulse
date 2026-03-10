import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_pulse.settings')
django.setup()

import pandas as pd
from api.ml_engine import get_dashboard_data, get_insights, train_lightgbm, train_catboost

# Use a confirmed real dataset file
file_path = r'C:\Users\abane\Music\MY_PROJECTS\DA_Webbased_proj\social_pulse\social-pulse-react-app\backend\media\datasets\social_media_engagement_data.csv'

print("Testing with Dataset:", file_path)

try:
    df = pd.read_csv(file_path)
    res = get_dashboard_data(df)
    print("DASHBOARD SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    df = pd.read_csv(file_path)
    res = get_insights(df, 'X', 'image')
    print("INSIGHTS SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    df = pd.read_csv(file_path)
    res = train_lightgbm(df)
    print("LIGHTGBM SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    df = pd.read_csv(file_path)
    res = train_catboost(df)
    print("CATBOOST SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
