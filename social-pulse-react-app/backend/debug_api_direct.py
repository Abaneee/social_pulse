import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_pulse.settings')
django.setup()

from api.models import Dataset
import pandas as pd
from api.ml_engine import get_dashboard_data, get_insights, train_lightgbm, train_catboost

try:
    d = Dataset.objects.last()
    print("Testing with Dataset:", d.file.path)
    df = pd.read_csv(d.file.path)

    try:
        res = get_dashboard_data(df)
        print("DASHBOARD SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()

    df = pd.read_csv(d.file.path)
    try:
        res = get_insights(df, 'X', 'image')
        print("INSIGHTS SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()

    df = pd.read_csv(d.file.path)
    try:
        res = train_lightgbm(df)
        print("LIGHTGBM SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()

    df = pd.read_csv(d.file.path)
    try:
        res = train_catboost(df)
        print("CATBOOST SUCCESS")
    except Exception as e:
        import traceback
        traceback.print_exc()
except Exception as main_e:
    print("Error initializing dataset:", main_e)
