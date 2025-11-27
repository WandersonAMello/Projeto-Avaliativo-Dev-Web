from django.urls import path
from .views import (
    # Views Web (HTML)
    ListarObjetos, ListarMeusObjetos, CriarObjeto, EditarObjeto, DeletarObjeto,
    FotoObjeto, alternar_status_ajax,
    
    # Views API (Mobile JSON)
    APIListarObjetos, APIListarMeusObjetos, APICriarObjeto, 
    APIEditarObjeto, APIDeletarObjeto, APIAlternarStatus
)

urlpatterns = [
    # ==========================================================
    # 1. INTERFACE WEB (Navegador)
    # ==========================================================
    path('', ListarObjetos.as_view(), name='listar_objetos'),
    path('meus-itens/', ListarMeusObjetos.as_view(), name='meus_objetos'),
    path('criar/', CriarObjeto.as_view(), name='criar_objeto'),
    path('editar/<int:pk>/', EditarObjeto.as_view(), name='editar_objeto'),
    path('deletar/<int:pk>/', DeletarObjeto.as_view(), name='deletar_objeto'),
    
    # Funcionalidade AJAX (Botão na Web)
    path('ajax/alternar-status/<int:pk>/', alternar_status_ajax, name='alternar_status_ajax'),

    # ==========================================================
    # 2. API REST (Aplicativo Mobile)
    # ==========================================================
    # GET: Lista todos os objetos ativos (com filtros ?local=... &tipo=...)
    path('api/', APIListarObjetos.as_view(), name='api-listar-objetos'),
    
    # GET: Lista apenas os objetos do usuário logado
    path('api/meus-itens/', APIListarMeusObjetos.as_view(), name='api-meus-objetos'),
    
    # POST: Cria um novo objeto
    path('api/criar/', APICriarObjeto.as_view(), name='api-criar-objeto'),
    
    # PUT/PATCH: Edita um objeto existente (apenas dono)
    path('api/editar/<int:pk>/', APIEditarObjeto.as_view(), name='api-editar-objeto'),
    
    # DELETE: Remove um objeto (apenas dono)
    path('api/deletar/<int:pk>/', APIDeletarObjeto.as_view(), name='api-deletar-objeto'),
    
    # POST: Alterna status entre ATIVO/DEVOLVIDO (apenas dono)
    path('api/status/<int:pk>/', APIAlternarStatus.as_view(), name='api-alternar-status'),

    # ==========================================================
    # 3. ARQUIVOS E FOTOS
    # ==========================================================
    # Visualização segura de imagens
    path('fotos/<str:arquivo>', FotoObjeto.as_view(), name='foto-objeto'),
]