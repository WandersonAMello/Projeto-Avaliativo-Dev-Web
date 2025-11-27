"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# Importa as views de autenticação do core/views.py
from core.views import (
    Login,
    Logout,
    CadastroUsuario,      # Cadastro Web (HTML)
    LoginAPI,
    CadastroUsuarioAPI    # Cadastro API (Mobile JSON)
)

urlpatterns = [
    # --- 1. Administrativo ---
    path('admin/', admin.site.urls),

    # --- 2. Autenticação WEB (Navegador) ---
    path('login/', Login.as_view(), name='login'),
    path('logout/', Logout.as_view(), name='logout'),
    path('cadastro/', CadastroUsuario.as_view(), name='cadastro'),

    # --- 3. Autenticação API (Mobile/Ionic) ---
    # Rota para Login (Retorna Token)
    path('api/login/', LoginAPI.as_view(), name='api-login'),
    
    # Rota para Cadastro Rápido (Cria Usuário)
    path('api/cadastro/', CadastroUsuarioAPI.as_view(), name='api-cadastro'),

    # --- 4. Aplicação Principal (Objetos) ---
    # Inclui as URLs do app objetos (onde está a rota segura de fotos)
    path('objetos/', include('objetos.urls')),
    
    # Redireciona a raiz ('/') para a lista de objetos
    path('', include('objetos.urls')),
]