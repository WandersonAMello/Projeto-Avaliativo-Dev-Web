# -*- coding: utf-8 -*-
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from objetos.models import Objeto
from objetos.forms import FormularioObjeto
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy

from django.http import FileResponse, Http404, JsonResponse
from django.views.generic import View
from django.views.decorators.http import require_POST
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView, RetrieveUpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions
from objetos.serializers import SerializadorObjeto

from .consts import LOCAL_CHOICES, TIPO_CHOICES

class ListarObjetos(LoginRequiredMixin, ListView):
    """
    View para listar instâncias de Objetos.
    """
    model = Objeto
    template_name = 'objetos/listar_objetos.html'
    context_object_name = 'objetos'

    def get_queryset(self):
        # 1. Começa com todos os objetos ATIVOS
        queryset = Objeto.objects.filter(status='ATIVO')

        # 2. Aplica o Filtro de LOCAL
        local_filtro = self.request.GET.get('local')
        if local_filtro:
            queryset = queryset.filter(local=local_filtro)

        # 3. Aplica o Filtro de TIPO
        tipo_filtro = self.request.GET.get('tipo')
        if tipo_filtro:
            queryset = queryset.filter(tipo=tipo_filtro)

        # 4. Aplica o Filtro de DATA
        data_filtro = self.request.GET.get('data')
        if data_filtro:
            queryset = queryset.filter(data_encontro=data_filtro)

        # 5. Retorna ordenado pela data (mais recente primeiro)
        return queryset.order_by('-data_encontro')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Separação para as abas (Achados vs Perdidos)
        # self.object_list já contém os dados filtrados pelo get_queryset acima
        context['achados'] = self.object_list.filter(situacao='ACHADO')
        context['perdidos'] = self.object_list.filter(situacao='PERDIDO')
        
        context['lista_locais'] = LOCAL_CHOICES
        context['lista_tipos'] = TIPO_CHOICES
        return context

class ListarMeusObjetos(LoginRequiredMixin, ListView):
    """
    View para listar APENAS os objetos do usuário logado.
    Aqui ele poderá gerenciar (editar/excluir).
    """
    model = Objeto
    template_name = 'objetos/meus_objetos.html'
    context_object_name = 'objetos'

    def get_queryset(self):
        # Filtra pelo dono atual e ordena pelo mais recente
        return Objeto.objects.filter(dono=self.request.user).order_by('-data_encontro')

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
    success_url = reverse_lazy('meus_objetos')

    def get_queryset(self):
        # Garante que o usuário só edita os SEUS objetos
        return Objeto.objects.filter(dono=self.request.user)

class DeletarObjeto(LoginRequiredMixin, DeleteView):
    """
    View para deletar instâncias de Objetos.
    """
    model = Objeto
    template_name = 'objetos/deletar_objeto.html'
    success_url = reverse_lazy('listar_objetos')

    def get_queryset(self):
        # Garante que o usuário só Deleta os SEUS objetos
        return Objeto.objects.filter(dono=self.request.user)

@login_required
@require_POST # Só aceita requisições tipo POST (segurança)
def alternar_status_ajax(request, pk):
    """
    View para alternar o status do objeto via AJAX (sem recarregar página).
    """
    objeto = get_object_or_404(Objeto, pk=pk)

    # Segurança: Garante que só o dono pode alterar
    if objeto.dono != request.user:
        return JsonResponse({'erro': 'Permissão negada.'}, status=403)

    # Lógica de alternância
    novo_status = 'DEVOLVIDO' if objeto.status == 'ATIVO' else 'ATIVO'
    objeto.status = novo_status
    objeto.save()

    # Retorna o novo status em JSON para o JavaScript atualizar a tela
    return JsonResponse({
        'novo_status': novo_status,
        'status_display': objeto.get_status_display()
    })
    
class APIListarObjetos(ListAPIView):
    """
    View para listar instâncias de Objetos (por meio da API REST).
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Objeto.objects.filter(status='ATIVO').order_by('-data_encontro')

class APICriarObjeto(CreateAPIView):
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

class APIListarObjetos(ListAPIView):
    """
    Lista todos os objetos públicos (status 'ATIVO').
    Suporta filtros por ?local=... e ?tipo=... na URL.
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 1. Busca apenas objetos ativos
        queryset = Objeto.objects.filter(status='ATIVO')

        # 2. Verifica se o mobile enviou filtros
        local = self.request.query_params.get('local')
        tipo = self.request.query_params.get('tipo')
        
        # 3. Aplica os filtros se existirem
        if local:
            queryset = queryset.filter(local=local)
        if tipo:
            queryset = queryset.filter(tipo=tipo)

        # 4. Retorna ordenado pelo mais recente
        return queryset.order_by('-data_encontro')

class APIListarMeusObjetos(ListAPIView):
    """
    Lista APENAS os objetos criados pelo usuário logado.
    Usado na tela 'Meus Itens' do aplicativo.
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filtra pelo dono (usuário do token)
        return Objeto.objects.filter(dono=self.request.user).order_by('-data_encontro')

class APICriarObjeto(CreateAPIView):
    """
    Cadastra um novo objeto via JSON.
    Define automaticamente o dono como o usuário logado.
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Salva o objeto preenchendo o campo 'dono' automaticamente
        serializer.save(dono=self.request.user)

class APIEditarObjeto(RetrieveUpdateAPIView):
    """
    Permite ver detalhes (GET) e atualizar dados (PUT/PATCH) de um objeto.
    Segurança: Só permite se o objeto pertencer ao usuário.
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Garante que o usuário só pode editar os seus próprios itens
        return Objeto.objects.filter(dono=self.request.user)

class APIDeletarObjeto(DestroyAPIView):
    """
    Deleta um objeto do banco de dados.
    Segurança: Só permite se o objeto pertencer ao usuário.
    """
    serializer_class = SerializadorObjeto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Garante que o usuário só pode deletar os seus próprios itens
        return Objeto.objects.filter(dono=self.request.user)

class APIAlternarStatus(APIView):
    """
    Endpoint personalizado para alternar entre 'ATIVO' e 'DEVOLVIDO'.
    Funciona como um interruptor (toggle).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Busca o objeto ou retorna 404 se não existir
        objeto = get_object_or_404(Objeto, pk=pk)
        
        # Verificação de segurança manual: É o dono?
        if objeto.dono != request.user:
            return Response(
                {'erro': 'Você não tem permissão para alterar este item.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Lógica de alternância (Toggle)
        if objeto.status == 'ATIVO':
            objeto.status = 'DEVOLVIDO'
        else:
            objeto.status = 'ATIVO'
            
        objeto.save()
        
        # Retorna o novo estado para o App atualizar a tela
        return Response({
            'novo_status': objeto.status, 
            'status_display': objeto.get_status_display()
        })