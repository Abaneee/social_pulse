import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_pulse.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
import json

User = get_user_model()
user = User.objects.first()

client = APIClient()
client.force_authenticate(user=user)

print("--- TESTING DASHBOARD ---")
resp = client.get('/dashboard/')
print("Status:", resp.status_code)
if resp.status_code != 200:
    print("Content:", resp.content.decode())

print("\n--- TESTING ML STUDIO ---")
resp = client.post('/train/', data=json.dumps({"model_type": "both"}), content_type="application/json")
print("Status:", resp.status_code)
if resp.status_code != 200:
    print("Content:", resp.content.decode())

print("\n--- TESTING INSIGHTS ---")
resp = client.post('/predict/insights/', data=json.dumps({"platform": "X", "content_type": "image"}), content_type="application/json")
print("Status:", resp.status_code)
if resp.status_code != 200:
    print("Content:", resp.content.decode())
