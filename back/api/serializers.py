from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Swipe, Chat, Message

class ProfileModelSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Profile
        fields = [
            'id','user','username','full_name','university','major',
            'location','gender','age','profile_picture',
            'preferred_gender','preferred_age_min','preferred_age_max',
            'preferred_university','preferred_major'
        ]

class SwipeModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Swipe
        fields = ['id','from_profile','to_profile','decision','timestamp']

class ChatModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id','user1','user2','created_at']

class MessageModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id','chat','sender','content','timestamp','read']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(
            username=data['username'],
            password=data['password']
        )
        if user and user.is_active:
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid credentials")


class OAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


class PreferenceSerializer(serializers.Serializer):
    preferred_gender = serializers.ChoiceField(choices=Profile.GENDER_CHOICES)
    preferred_age_min = serializers.IntegerField()
    preferred_age_max = serializers.IntegerField()
    preferred_university = serializers.CharField(
        allow_blank=True, allow_null=True, required=False
    )
    preferred_major = serializers.CharField(
        allow_blank=True, allow_null=True, required=False
    )


class ProfileCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    university = serializers.CharField(max_length=255)
    major = serializers.CharField(max_length=255)
    location = serializers.CharField(max_length=255)
    gender = serializers.ChoiceField(choices=Profile.GENDER_CHOICES)
    age = serializers.IntegerField()
    profile_picture = serializers.URLField(
        required=False, allow_blank=True, allow_null=True
    )
    preferred_gender = serializers.ChoiceField(choices=Profile.GENDER_CHOICES)
    preferred_age_min = serializers.IntegerField()
    preferred_age_max = serializers.IntegerField()
    preferred_university = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    preferred_major = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        profile = Profile.objects.create(
            user=user,
            username=validated_data['username'],
            full_name=validated_data['full_name'],
            university=validated_data['university'],
            major=validated_data['major'],
            location=validated_data['location'],
            gender=validated_data['gender'],
            age=validated_data['age'],
            profile_picture=validated_data.get('profile_picture'),
            preferred_gender=validated_data['preferred_gender'],
            preferred_age_min=validated_data['preferred_age_min'],
            preferred_age_max=validated_data['preferred_age_max'],
            preferred_university=validated_data.get('preferred_university'),
            preferred_major=validated_data.get('preferred_major'),
        )
        return profile
