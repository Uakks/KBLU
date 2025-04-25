from django.urls import path
from .views import (
    CurrentUserView, auth_login, auth_logout, auth_oauth,
    ProfileListCreateAPIView, ProfileDetailAPIView,
    PreferencesAPIView, SwipeAPIView, MatchesAPIView,
    ChatListCreateAPIView, MessageListCreateAPIView, MessageDetailAPIView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('api/auth/login/',   auth_login,  name='auth-login'),
    path('api/auth/logout/',  auth_logout, name='auth-logout'),
    path('api/auth/oauth/',   auth_oauth,  name='auth-oauth'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/profiles/',             ProfileListCreateAPIView.as_view(),
         name='profile-list-create'),
    path('api/profiles/<uuid:profile_id>/', ProfileDetailAPIView.as_view(),
         name='profile-detail'),

    path('api/preferences/<uuid:profile_id>/',
         PreferencesAPIView.as_view(), name='preferences'),

    path('api/swipes/',   SwipeAPIView.as_view(),   name='swipe'),
    path('api/matches/',  MatchesAPIView.as_view(), name='matches'),

    path('api/chats/',                          ChatListCreateAPIView.as_view(),
         name='chat-list-create'),
    path('api/chats/<uuid:chat_id>/messages/',  MessageListCreateAPIView.as_view(),
         name='message-list-create'),
    path('api/chats/<uuid:chat_id>/messages/<int:message_id>/',
         MessageDetailAPIView.as_view(),      name='message-detail'),
         
    path('api/me/', CurrentUserView.as_view(), name='current-user'),
]
