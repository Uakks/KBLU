from django.db import models
import uuid

# Create your models here.  

# User, chat, message,
# 1. User
from django.contrib.auth.models import User

# 2. Profile
class Profile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=255)
    university = models.CharField(max_length=255)
    major = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES)
    age = models.PositiveIntegerField()
    profile_picture = models.URLField(blank=True, null=True)

    preferred_gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    preferred_age_min = models.PositiveIntegerField()
    preferred_age_max = models.PositiveIntegerField()
    preferred_university = models.CharField(max_length=255, blank=True, null=True)
    preferred_major = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username

# 3. Swipe
class Swipe(models.Model):
    DECISION_CHOICES = [
        ('like', 'Like'),
        ('reject', 'Reject'),
    ]

    from_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='swipes_sent')
    to_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='swipes_received')
    decision = models.CharField(max_length=6, choices=DECISION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"from {self.from_profile} to {self.to_profile} decision:{self.decision} time:{self.timestamp}"
    # class Meta:
    #     unique_together = ('from_profile', 'to_profile')  # Prevent duplicate swipes

# 4. Chat
class Chat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user1 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='chats_as_user1')
    user2 = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='chats_as_user2')
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.id} - {self.user1} & {self.user2} at {self.created_at}"
    class Meta:
        unique_together = ('user1', 'user2')  # Prevent duplicate chat threads

# 5. Message
class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender} in Chat {self.chat.id}: {self.content[:30]}... at {self.timestamp} (Read: {self.read})"
