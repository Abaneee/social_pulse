"""
Models for Social Pulse API.
Custom User, Dataset, PreprocessingLog, EDAHistory, MLModel.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom user with UUID PK and email as primary identifier."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    company_name = models.CharField(max_length=255, blank=True, default='')
    role = models.CharField(max_length=100, blank=True, default='')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Dataset(models.Model):
    """Uploaded CSV dataset linked to a user."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    file = models.FileField(upload_to='datasets/')
    original_filename = models.CharField(max_length=255, default='')
    row_count = models.IntegerField(default=0)
    column_count = models.IntegerField(default=0)
    columns = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        # Ensure only one active dataset per user
        if self.is_active:
            Dataset.objects.filter(user=self.user, is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.original_filename} ({self.user.email})"


class PreprocessingLog(models.Model):
    """Stores cleaning steps applied to a dataset."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.OneToOneField(Dataset, on_delete=models.CASCADE, related_name='preprocessing_log')
    cleaning_steps_applied = models.JSONField(default=list)
    rows_removed = models.IntegerField(default=0)
    rows_after = models.IntegerField(default=0)
    processed_file = models.FileField(upload_to='processed/', blank=True, null=True)
    processed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Log for {self.dataset.original_filename}"


class EDAHistory(models.Model):
    """Stores EDA report JSON for a dataset."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='eda_reports')
    report_json = models.JSONField(default=dict)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"EDA for {self.dataset.original_filename} at {self.generated_at}"


class MLModel(models.Model):
    """Stores a trained ML model and its metrics."""

    class ModelType(models.TextChoices):
        REGRESSION_LGBM = 'regression_lgbm', 'LightGBM Regression'
        CLASSIFICATION_CATBOOST = 'classification_catboost', 'CatBoost Classification'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='ml_models')
    model_type = models.CharField(max_length=30, choices=ModelType.choices)
    model_file = models.FileField(upload_to='models/', blank=True, null=True)
    metrics = models.JSONField(default=dict)
    feature_columns = models.JSONField(default=list)
    trained_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['dataset', 'model_type']

    def __str__(self):
        return f"{self.get_model_type_display()} for {self.dataset.original_filename}"
