from django.contrib import admin
# from models import *
# your_app/admin.py
from django.contrib import admin
from .models import Profile, Swipe, Chat, Message


# Register your models here.
# admin.site.register()

admin.site.register(Profile)
admin.site.register(Swipe)
admin.site.register(Chat)
admin.site.register(Message)