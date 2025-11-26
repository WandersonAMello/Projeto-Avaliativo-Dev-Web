# -*- coding: utf-8 -*-

from django.shortcuts import render, redirect
from django.views import View
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse_lazy

from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response

from .forms import FormularioCadastro
class Login(View):
    """
    Class-based view para autenticação de usuários.
    """
    def get(self, request):
        contexto = {}
        if request.user.is_authenticated:
            return redirect('/home')  # Redireciona para a página de  se o usuário já estiver autenticado
        else:
            return render(request, 'autenticacao.html', contexto)

    def post(self, request):

        # Obtém as credenciais do formulário
        usuario = request.POST.get('usuario', None)
        senha = request.POST.get('senha', None)

        # Verifica se as credenciais são válidas
        user = authenticate(request, username=usuario, password=senha)
        if user is not None:

            #verifica se o usuário está ativo no sistema
            if user.is_active:
                login(request, user)
                return redirect('/home')  # Redireciona para a página de veículos após o login bem-sucedido

        return render(request, 'autenticacao.html', {'mensagem': 'Login invalido!'})

class Logout(View):
    """
    Class-based view para logout de usuários.
    """
    def get(self, request):
        logout(request)
        return redirect('/')  # Redireciona para a rota inicial após o logout

class LoginAPI(ObtainAuthToken):
    """
    View para autenticação via API REST.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={
                'request': request
            }
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'id': user.id,
            'nome':user.first_name,
            'email': user.email,
            'token': token.key
        })

class CadastroUsuario(CreateView):
    template_name = 'cadastro.html'
    form_class = FormularioCadastro
    success_url = reverse_lazy('login')