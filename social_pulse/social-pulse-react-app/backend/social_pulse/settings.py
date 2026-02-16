"""
Django settings for Social Pulse project.
"""
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-social-pulse-dev-key')

# DEBUG is False on Render, True locally
DEBUG = 'RENDER' not in os.environ

ALLOWED_HOSTS = ['*']

# ── Installed Apps ──
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    # Local
    'api',
]

# ── Middleware ──
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Crucial for Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'social_pulse.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'social_pulse.wsgi.application'

# ── Database (FIXED) ──
# 1. Parse the database URL safely
# ── Database (TiDB Cloud SSL Fix) ──

# 1. Parse the database URL
db_config = dj_database_url.config(
    default=os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
    conn_max_age=600,
    ssl_require=True
)

# 2. SANITIZE: Remove invalid 'sslmode' if present
if 'OPTIONS' in db_config and 'sslmode' in db_config['OPTIONS']:
    del db_config['OPTIONS']['sslmode']

# 3. CONFIGURE SSL: TiDB Cloud Serverless requires a secure connection.
# We add the 'ssl' key which mysqlclient uses to enable TLS.
if 'sqlite' not in db_config['ENGINE']:
    if 'OPTIONS' not in db_config:
        db_config['OPTIONS'] = {}
    
    # Render and TiDB Serverless work best with this configuration:
    db_config['OPTIONS']['ssl'] = {
        'ca': '/etc/ssl/certs/ca-certificates.crt' # Standard path on Render/Ubuntu
    }

DATABASES = {
    'default': db_config
}
# ── Auth ──
AUTH_USER_MODEL = 'api.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ── Internationalization ──
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ── Static & Media ──
STATIC_URL = '/static/'

# Django now knows where to put files during deployment.
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Optional: If you have a global static folder
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Enable WhiteNoise to compress and serve static files efficiently
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── DRF ──
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ),
}

# ── Simple JWT ──
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ── CORS ──
CORS_ALLOWED_ORIGINS = [
    "https://socialpuls.vercel.app",          # Frontend Production
    "https://social-pulse-mxgn.onrender.com",# Backend Self
    "https://social-pulse-n4r7.onrender.com", 
    "http://localhost:5173",                  # Local React
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "https://socialpuls.vercel.app",
    "https://social-pulse-mxgn.onrender.com",
]

CORS_ALLOW_CREDENTIALS = True

# ── File Upload Limits ──
DATA_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 52428800  # 50 MB