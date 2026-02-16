from django.contrib import admin
from .models import User, Dataset, PreprocessingLog, EDAHistory, MLModel


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'username', 'company_name', 'role', 'date_joined']
    search_fields = ['email', 'username']


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'user', 'row_count', 'is_active', 'uploaded_at']
    list_filter = ['is_active', 'uploaded_at']
    search_fields = ['original_filename']


@admin.register(PreprocessingLog)
class PreprocessingLogAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'rows_removed', 'rows_after', 'processed_at']


@admin.register(EDAHistory)
class EDAHistoryAdmin(admin.ModelAdmin):
    list_display = ['dataset', 'generated_at']


@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin):
    list_display = ['model_type', 'dataset', 'trained_at']
    list_filter = ['model_type']
