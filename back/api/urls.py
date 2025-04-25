from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path('api/', include(router.urls)),
    path('accounts/', include('django.contrib.auth.urls')),
]

