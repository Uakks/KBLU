from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User

from rest_framework import generics
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile, Swipe, Chat, Message
from .serializers import (
    CurrentUserSerializer, ProfileModelSerializer, ProfileCreateSerializer,
    LoginSerializer, OAuthSerializer, PreferenceSerializer,
    SwipeModelSerializer, ChatModelSerializer, MessageModelSerializer
)

@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_logout(request):
    # print("Raw body  :", request.body)
    # print("Parsed data:", request.data)
    token = request.data.get('refresh')
    if not token:
        return Response({'detail': 'Refresh token required'},
                        status=status.HTTP_400_BAD_REQUEST)
    try:
        RefreshToken(token).blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'detail': 'Invalid token'},
                        status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def auth_oauth(request):
    serializer = OAuthSerializer(data=request.data)
    if serializer.is_valid():
        return Response({'detail': 'Not implemented'},
                        status=status.HTTP_501_NOT_IMPLEMENTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Profile.objects.all()

        name = request.query_params.get('name')
        if name:
            qs = qs.filter(
                Q(username__icontains=name) |
                Q(full_name__icontains=name)
            )
        major = request.query_params.get('major')
        if major:
            qs = qs.filter(major__icontains=major)
        university = request.query_params.get('university')
        if university:
            qs = qs.filter(university__icontains=university)
        username = request.query_params.get('username')
        if username:
            qs = qs.filter(username__icontains=username)
            
        serializer = ProfileModelSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProfileCreateSerializer(data=request.data)
        if serializer.is_valid():
            profile = serializer.save()
            out = ProfileModelSerializer(profile)
            return Response(out.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Profile, id=pk)

    def get(self, request, profile_id):
        p = self.get_object(profile_id)
        return Response(ProfileModelSerializer(p).data)

    def put(self, request, profile_id):
        p = self.get_object(profile_id)
        if p.user != request.user:
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = ProfileModelSerializer(p, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, profile_id):
        p = self.get_object(profile_id)
        if p.user != request.user:
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = ProfileModelSerializer(p, data=request.data,
                                            partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, profile_id):
        p = self.get_object(profile_id)
        if p.user != request.user:
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)

        p.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PreferencesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, profile_id):
        p = get_object_or_404(Profile, id=profile_id)
        if p.user != request.user:
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            for k, v in serializer.validated_data.items():
                setattr(p, k, v)
            p.save()
            return Response(ProfileModelSerializer(p).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    patch = put 


class SwipeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SwipeModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        from_id = request.data.get('from_profile')
        to_id = request.data.get('to_profile')
        decision = request.data.get('decision')
        if not all([from_id, to_id, decision]):
            return Response(
                {'detail': 'from_profile, to_profile and decision required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        swipe = get_object_or_404(
            Swipe, from_profile_id=from_id, to_profile_id=to_id
        )
        swipe.decision = decision
        swipe.save()
        return Response(SwipeModelSerializer(swipe).data)


class MatchesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = get_object_or_404(Profile, user=request.user)
        liked_ids = Swipe.objects.filter(
            from_profile=me, decision='like'
        ).values_list('to_profile_id', flat=True)
        mutual = Swipe.objects.filter(
            from_profile_id__in=liked_ids,
            to_profile=me,
            decision='like'
        ).values_list('from_profile_id', flat=True)
        qs = Profile.objects.filter(id__in=mutual)
        return Response(ProfileModelSerializer(qs, many=True).data)


class ChatListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = get_object_or_404(Profile, user=request.user)
        qs = Chat.objects.filter(Q(user1=me) | Q(user2=me))
        return Response(ChatModelSerializer(qs, many=True).data)

    def post(self, request):
        me = get_object_or_404(Profile, user=request.user)
        other_id = request.data.get('user2')
        other = get_object_or_404(Profile, id=other_id)

        chat = Chat.objects.filter(user1=me, user2=other).first()
        if not chat:
            chat = Chat.objects.create(user1=me, user2=other)
        return Response(ChatModelSerializer(chat).data,
                        status=status.HTTP_201_CREATED)


class MessageListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)
        msgs = chat.messages.all()
        return Response(MessageModelSerializer(msgs, many=True).data)

    def post(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)
        sender = get_object_or_404(Profile, user=request.user)
        content = request.data.get('content')
        if not content:
            return Response({'detail': 'Content required'},
                            status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(chat=chat,
                                     sender=sender,
                                     content=content)
        return Response(MessageModelSerializer(msg).data,
                        status=status.HTTP_201_CREATED)


class MessageDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, chat_id, message_id):
        chat = get_object_or_404(Chat, id=chat_id)
        msg = get_object_or_404(Message, id=message_id, chat=chat)
        if msg.sender.user != request.user:
            return Response({'detail': 'Forbidden'},
                            status=status.HTTP_403_FORBIDDEN)
        msg.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)