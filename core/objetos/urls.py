from django.urls import path
from .views import APIListarCriarObjetos, APIDeletarObjeto, FotoObjeto

urlpatterns = [
    # Rota para:
    # GET: Listar todos os objetos (usado no carregarDados)
    # POST: Criar novo objeto (usado no novoRegistro)
    path('api/', APIListarCriarObjetos.as_view(), name='api-listar-criar-objetos'),

    # Rota para:
    # DELETE: Excluir um objeto pelo ID (pk)
    path('api/<int:pk>/', APIDeletarObjeto.as_view(), name='api-deletar-objeto'),

    # Rota para servir a imagem: /objetos/fotos/nome_do_arquivo.jpg
    path('fotos/<str:arquivo>', FotoObjeto.as_view(), name='foto-objeto'),
]