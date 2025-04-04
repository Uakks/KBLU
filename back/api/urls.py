from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, SwipeViewSet, ChatViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'swipes', SwipeViewSet)
router.register(r'chats', ChatViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]

