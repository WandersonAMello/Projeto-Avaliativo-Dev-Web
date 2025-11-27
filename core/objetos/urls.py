from django.urls import path
from .views import (
    ListarObjetos, ListarMeusObjetos, CriarObjeto, EditarObjeto, DeletarObjeto,
    APIListarObjetos, APICriarObjeto, APIDeletarObjeto,
    FotoObjeto, alternar_status_ajax
)

urlpatterns = [
    # --- Interface Web (HTML) ---
    path('', ListarObjetos.as_view(), name='listar_objetos'),
    path('criar/', CriarObjeto.as_view(), name='criar_objeto'),
    path('editar/<int:pk>/', EditarObjeto.as_view(), name='editar_objeto'),
    path('deletar/<int:pk>/', DeletarObjeto.as_view(), name='deletar_objeto'),

    path('meus-itens/', ListarMeusObjetos.as_view(), name='meus_objetos'),
    path('ajax/alternar-status/<int:pk>/', alternar_status_ajax, name='alternar_status_ajax'),
    # --- API REST (Mobile) ---
    # Rota apenas para GET (Listar)
    path('api/', APIListarObjetos.as_view(), name='api-listar-objetos'),
    
    # Rota apenas para POST (Criar)
    path('api/criar/', APICriarObjeto.as_view(), name='api-criar-objeto'),
    
    # Rota para DELETE
    path('api/<int:pk>/', APIDeletarObjeto.as_view(), name='api-deletar-objeto'),

    # --- Fotos Seguras ---
    path('fotos/<str:arquivo>', FotoObjeto.as_view(), name='foto-objeto'),
]