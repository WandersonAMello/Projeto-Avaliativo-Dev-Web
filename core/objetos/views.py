# -*- coding: utf-8 -*-
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from objetos.models import Objeto
from objetos.forms import FormularioObjeto
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy

from django.http import FileResponse, Http404
from django.views.generic import View
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.generics import ListAPIView, DestroyAPIView
from objetos.serializers import SerializadorObjeto
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions

class ListarObjetos(LoginRequiredMixin, ListView):
    """
    View para listar instâncias de Objetos.
    """
    model = Objeto
    template_name = 'objetos/listar_objetos.html'
    context_object_name = 'objetos'

    def get_queryset(self):
        return Objeto.objects.filter(status='ATIVO').order_by('-data_encontro')

class CriarObjeto(LoginRequiredMixin, CreateView):
    """
    View para criar instâncias de Objetos.
    """
    model = Objeto
    form_class = FormularioObjeto
    template_name = 'objetos/criar_objeto.html'
    success_url = reverse_lazy('listar_objetos')

    def form_valid(self, form):
        form.instance.dono = self.request.user
        return super().form_valid(form)

class EditarObjeto(LoginRequiredMixin, UpdateView):
    """
    View para editar instâncias de Objetos.
    """
    model = Objeto
    form_class = FormularioObjeto
    template_name = 'objetos/editar_objeto.html'
    success_url = reverse_lazy('listar_objetos')

class DeletarObjeto(LoginRequiredMixin, DeleteView):
    """
    View para deletar instâncias de Objetos.
    """
    model = Objeto
    template_name = 'objetos/deletar_objeto.html'
    success_url = reverse_lazy('listar_objetos')

class APIListarObjetos(ListAPIView):
    """
    View para listar instâncias de Objetos (por meio da API REST).
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Objeto.objects.filter(status='ATIVO').order_by('-data_encontro')

class APICriarObjeto(CreateView):
    """
    View para criar instâncias de Objetos (por meio da API REST).
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Objeto.objects.all()

class APIDeletarObjeto(DestroyAPIView):
    """
    View para deletar instâncias de Objetos (por meio da API REST).
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Objeto.objects.all()

class FotoObjeto(View):
    """
    View segura para servir imagens dos objetos.
    A imagem é servida apenas se existir um Objeto com essa foto.
    """
    def get(self, request, arquivo):
        try:
            # Busca o objeto que tem essa foto específica
            # O caminho no banco é 'objetos/fotos/nome_arquivo.jpg'
            objeto = Objeto.objects.get(foto='objetos/fotos/{}'.format(arquivo))

            # Retorna o arquivo como stream
            return FileResponse(objeto.foto)
        except ObjectDoesNotExist:
            raise Http404("Foto não encontrada ou acesso negado")
        except Exception as exeption:
            raise exeption