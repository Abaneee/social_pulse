"""
URL routing for Social Pulse API.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/user/', views.user_profile_view, name='user_profile'),

    # Dataset
    path('upload/', views.upload_dataset_view, name='upload_dataset'),
    path('datasets/', views.list_datasets_view, name='list_datasets'),
    path('datasets/<uuid:dataset_id>/activate/', views.activate_dataset_view, name='activate_dataset'),

    # Processing
    path('process/', views.process_data_view, name='process_data'),

    # EDA
    path('eda/', views.eda_report_view, name='eda_report'),

    # ML Training
    path('train/', views.train_model_view, name='train_model'),

    # Insights / Predictions
    path('predict/insights/', views.predict_insights_view, name='predict_insights'),

    # Dashboard
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # Filter Options
    path('filters/', views.filter_options_view, name='filter_options'),
]
