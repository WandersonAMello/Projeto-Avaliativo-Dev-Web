🧾 README.md — Sistema de Achados e Perdidos (Django + DRF + Ionic)
📌 1. Visão Geral

Este projeto implementa um sistema de Achados e Perdidos utilizado por alunos e funcionários da faculdade.
Ele possui três interfaces:

Web (Django + Templates + Bootstrap local)

API REST (Django REST Framework usando Generic Views)

Aplicativo Mobile (Ionic + Angular)

O foco do sistema é permitir o cadastro, listagem e atualização de status de itens encontrados ou perdidos no campus, garantindo simplicidade, segurança e proteção de mídia.

📌 2. Funcionalidades Principais

Autenticação de usuário

Cadastro de itens encontrados

Upload seguro de foto

Listagem pública dos itens ativos

Filtro por bloco/local

Página dedicada aos itens cadastrados pelo usuário

Edição, exclusão e mudança de status (somente pelo autor)

Exibição de WhatsApp para contato

Cálculo de dias em custódia

App mobile integrado via API REST

📘 3. Requisitos Funcionais (RF)
ID	Nome	Descrição
RF-001	Autenticação	O sistema deve permitir login com usuário e senha.
RF-002	Cadastro de Usuário	Qualquer pessoa da faculdade pode criar conta.
RF-003	Listagem Pública	Exibir os itens mais recentes cadastrados por qualquer usuário.
RF-004	Filtro por Local	Filtrar itens por local onde foi achado ou entregue.
RF-005	Cadastro de Item	Usuário cadastra item com descrição, local e foto opcional.
RF-006	Controle de Itens do Usuário	O usuário pode editar, excluir ou alterar status apenas dos seus itens.
RF-007	Status do Item	Ativo, Devolvido, Oculto.
RF-008	Contato	Exibir número de WhatsApp do autor do item.
RF-009	Dias em Custódia	Backend calcula dias desde a data de encontro.
RF-010	Upload de Mídia Seguro	Upload via multipart/form-data e acesso bloqueado ao MEDIA_URL.
RF-011	Foto Segura	Imagem só pode ser acessada pela view FotoItem.
📘 4. Requisitos Não Funcionais (RNF)
ID	Categoria	Descrição
RNF-001	Arquitetura	API REST usando apenas Generic Views explícitas.
RNF-002	Rotas	Rotas manuais no urls.py.
RNF-003	Segurança de Mídia	Sem exposição direta do diretório de mídia.
RNF-004	FotoItem	Implementar view customizada com FileResponse.
RNF-005	Templates Web	CRUD herdando de LoginRequiredMixin.
RNF-006	Estilo	Bootstrap local em /static/bootstrap/.
RNF-007	Mobile	App Ionic consumindo a API.
RNF-008	TDD	Todo o sistema deve ser coberto por testes automatizados.
🧩 5. Modelo de Dados
Modelo Item
class Item(models.Model):
    descricao = models.CharField(max_length=255)
    local = models.CharField(max_length=50, choices=LOCAL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativo')
    data_encontro = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    foto = models.ImageField(upload_to='itens/', null=True, blank=True)

🛰 6. API REST (DRF)
🔧 6.1 Serializers
class ItemSerializer(serializers.ModelSerializer):
    nome_local = serializers.SerializerMethodField()
    nome_status = serializers.SerializerMethodField()
    dias_custodia = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id', 'descricao', 'local', 'status',
            'nome_local', 'nome_status',
            'data_encontro', 'dias_custodia',
            'foto'
        ]

    def get_nome_local(self, obj):
        return obj.get_local_display()

    def get_nome_status(self, obj):
        return obj.get_status_display()

    def get_dias_custodia(self, obj):
        return (date.today() - obj.data_encontro).days

🔧 6.2 Views (Generic Views)
class ListaItensAPIView(ListAPIView):
    queryset = Item.objects.filter(status='ativo').order_by('-id')
    serializer_class = ItemSerializer

class CadastrarItemAPIView(CreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class ExcluirItemAPIView(DestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

🔧 6.3 View FotoItem
class FotoItem(View):
    def get(self, request, pk):
        item = get_object_or_404(Item, pk=pk)

        if not item.foto:
            raise Http404("Foto não encontrada")

        return FileResponse(item.foto.open('rb'), content_type='image/jpeg')

🔧 6.4 Rotas
urlpatterns = [
    path('itens/', ListaItensAPIView.as_view()),
    path('itens/cadastrar/', CadastrarItemAPIView.as_view()),
    path('itens/<int:pk>/excluir/', ExcluirItemAPIView.as_view()),
    path('foto/<int:pk>/', FotoItem.as_view()),
]

🎨 7. Templates Django (Bootstrap local)
static/bootstrap/css/bootstrap.min.css
static/bootstrap/js/bootstrap.bundle.min.js
templates/base.html
templates/itens/listar.html
templates/itens/criar.html
templates/itens/meus_itens.html
templates/itens/editar.html


(Você me avisa se quiser que eu gere todo o HTML completo.)

🧪 8. Plano de TDD
Testes de Modelo

cálculo de dias

constraints de status

permissões (usuário autor)

Testes de API

GET /api/itens/

POST /api/itens/cadastrar/

DELETE /api/itens/<id>/excluir/

GET /api/foto/<id>/

Testes de Template

verificação de HTML

permissão LoginRequiredMixin

teste de formulário e pós-submit

📌 9. Estrutura Final do Projeto
achados/
    api/
        serializers.py
        views.py
        urls.py
    web/
        views.py
        urls.py
        forms.py
    templates/
        base.html
        itens/
    static/
        bootstrap/
            css/
            js/
    tests/
        test_model.py
        test_api.py
        test_views.py

🟦 10. User Stories para o Trello (Prontas)
📌 Lista: Backlog do Produto

US-001 — Login

Como usuário, quero entrar no sistema para acessar meus itens.

US-002 — Criar Conta

Como usuário, quero me cadastrar para usar o sistema.

US-003 — Listar Itens Recentes

Como usuário, quero ver os itens mais recentes.

US-004 — Filtrar por Local

Como usuário, quero filtrar itens por bloco/local.

US-005 — Cadastrar Item

Quero cadastrar itens perdidos com foto e descrição.

US-006 — Ver Meus Itens

Quero acessar meus itens para gerenciá-los.

US-007 — Atualizar Status

Quero marcar itens como devolvidos ou ocultos.

US-008 — Apagar Item

Quero excluir um item meu.

US-009 — Visualizar Foto Segura

Quero abrir a foto do item de forma segura.

US-010 — Contato WhatsApp

Quero ver o número do autor para combinar a entrega.