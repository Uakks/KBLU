from django.shortcuts import redirect, render

# Create your views here.
from rest_framework import viewsets, permissions, filters
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

