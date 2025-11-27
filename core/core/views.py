# -*- coding: utf-8 -*-
from django.shortcuts import render, redirect
from django.views import View
from django.views.generic import CreateView
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse_lazy
from django.contrib.auth.models import User  # Import necessário para o QuerySet

# Imports do Django Rest Framework
from rest_framework import generics  # Import necessário para CreateAPIView
from rest_framework.permissions import AllowAny  # Import necessário para liberar acesso
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

# Imports Locais
from .serializers import SerializadorUsuario
from .forms import FormularioCadastro

class Login(View):
    """
    Class-based view para autenticação de usuários (Web).
    """
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')  # Corrigido: Redireciona para a raiz (lista de objetos)
        return render(request, 'autenticacao.html', {})

    def post(self, request):
        usuario = request.POST.get('username') #  O name no HTML  'username'
        senha = request.POST.get('password')   #  O name no HTML  'password'

        user = authenticate(request, username=usuario, password=senha)
        
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect('/')  # Corrigido: Redireciona para a raiz
        
        return render(request, 'autenticacao.html', {'mensagem': 'Login inválido!'})

class Logout(View):
    """
    Class-based view para logout de usuários.
    """
    def get(self, request):
        logout(request)
        return redirect('/login/')  # Redireciona para o login após sair

class LoginAPI(ObtainAuthToken):
    """
    View para autenticação via API REST (Retorna Token).
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'id': user.id,
            'nome': user.username, # Ajustado para username (ou first_name se preferires)
            'email': user.email,
            'token': token.key
        })

class CadastroUsuario(CreateView):
    """
    Cadastro via Navegador (Web)
    """
    template_name = 'cadastro.html'
    form_class = FormularioCadastro
    success_url = reverse_lazy('login')

class CadastroUsuarioAPI(generics.CreateAPIView):
    """
    View para criar novos usuários via API (Mobile).
    Permite acesso público (AllowAny).
    """
    queryset = User.objects.all()
    serializer_class = SerializadorUsuario
    permission_classes = [AllowAny]