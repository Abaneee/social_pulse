from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Define a simple home view directly here
def home(request):
    return JsonResponse({
        "status": "online",
        "message": "Social Pulse Backend is running successfully 🚀"
    })

urlpatterns = [
    # 1. Root URL check (http://your-site.com/)
    path('', home, name='home'),

    # 2. Admin Interface
    path('admin/', admin.site.urls),

    # 3. API Routes (Connecting /auth/register/ directly)
    path('', include('api.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)