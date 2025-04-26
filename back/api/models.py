from django.db import models
import uuid

# Create your models here.  

# User, chat, message,
# 1. User
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver


# 2. Profile
class Profile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        # ('other', 'Other'),
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

    def clean(self):
        super().clean()
        if self.age < 12:
            raise ValidationError({'age': 'Only 12+'})
        if self.preferred_age_max < self.preferred_age_min:
            raise ValidationError({'preferred_age_max': 'Preffered maximum age should be higher than minimum age'})
        if self.preferred_age_min < 0:
            raise ValidationError({'preferred_age_min': 'Preffered minimum age should be higher than 0'})

    def save(self, *args, **kwargs):
        # run all field & model validation, including our clean()
        self.full_clean()
        super().save(*args, **kwargs)
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

@receiver(post_save, sender=Swipe)
def create_chat_on_match(sender, instance: Swipe, created, **kwargs):
    """
    When A swipes 'like' on B, check if B already swiped 'like' on A;
    if so, create a Chat (if it doesn't already exist).
    """
    if not created or instance.decision != 'like':
        return

    a = instance.from_profile
    b = instance.to_profile

    # Has B already liked A?
    if Swipe.objects.filter(
        from_profile=b,
        to_profile=a,
        decision='like'
    ).exists():
        # Normalize ordering so (user1,user2) is unique:
        user1, user2 = sorted([a, b], key=lambda p: str(p.id))

        # Create the Chat if it doesn't exist yet:
        Chat.objects.get_or_create(user1=user1, user2=user2)