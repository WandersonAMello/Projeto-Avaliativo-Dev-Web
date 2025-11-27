# core/objetos/tests.py
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from datetime import date, timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import Objeto
from .forms import FormularioObjeto

class TestesModelObjeto(TestCase):
    """
    Testes Unitários: Lógica do Banco de Dados.
    """
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='123')
        self.objeto = Objeto.objects.create(
            dono=self.user,
            descricao="Carteira de Couro",
            local="BLOCO_A",
            tipo="CARTEIRA",
            situacao="PERDIDO",
            data_encontro=date.today() - timedelta(days=5),
            status="ATIVO"
        )

    def test_criacao_objeto(self):
        """Valido se os campos foram salvos corretamente."""
        self.assertEqual(self.objeto.descricao, "Carteira de Couro")

    def test_calculo_dias_custodia(self):
        """Valido o cálculo de dias."""
        self.assertEqual(self.objeto.dias_em_custodia(), 5)

class TestesViewListarObjetos(TestCase):
    """
    Testes de Integração (Web): Listagem e Filtros.
    """
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='123')
        self.client.force_login(self.user)
        self.url = reverse('listar_objetos')
        
        # Crio dois objetos em locais diferentes para testar o filtro
        Objeto.objects.create(
            dono=self.user,
            descricao="Item Bloco A",
            local="BLOCO_A", # Alvo do filtro
            tipo="OUTRO",
            situacao="ACHADO",
            status="ATIVO"
        )
        Objeto.objects.create(
            dono=self.user,
            descricao="Item Bloco B",
            local="BLOCO_B", # Não deve aparecer no filtro
            tipo="OUTRO",
            situacao="ACHADO",
            status="ATIVO"
        )

    def test_get_todos(self):
        """Acesso a lista sem filtros e verifico se aparecem os dois itens."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        # Como ambos são 'ACHADO', devem estar na lista de achados
        self.assertEqual(len(response.context['achados']), 2)

    def test_filtros_funcionais(self):
        """
        Simulo o uso do filtro de LOCAL na URL.
        Espero que a lista retorne apenas o item do BLOCO_A.
        """
        # Faço a requisição passando ?local=BLOCO_A
        response = self.client.get(self.url, {'local': 'BLOCO_A'})
        
        self.assertEqual(response.status_code, 200)
        
        # A lista de achados deve ter apenas 1 item (o do Bloco A)
        achados = response.context['achados']
        self.assertEqual(len(achados), 1)
        self.assertEqual(achados[0].descricao, "Item Bloco A")

class TestesViewCriarObjeto(TestCase):
    """
    Testes de Integração (Web): Criação.
    """
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='123')
        self.client.force_login(self.user)
        self.url = reverse('criar_objeto')

    def test_post_criar(self):
        """Simulo o envio do formulário de cadastro."""
        dados = {
            'descricao': 'Notebook Dell',
            'local': 'BIBLIOTECA',
            'tipo': 'ELETRONICOS',
            'situacao': 'PERDIDO',
            'status': 'ATIVO',
            'data_encontro': date.today(),
            'contato': '99 9999-9999'
        }
        response = self.client.post(self.url, dados)
        self.assertEqual(response.status_code, 302) # Redirecionou
        self.assertEqual(Objeto.objects.count(), 1)

class TestesViewEditarObjeto(TestCase):
    """
    Testes de Integração (Web): Edição de Objetos.
    Aqui testo se consigo alterar dados e se a segurança (apenas dono) funciona.
    """
    def setUp(self):
        self.user = User.objects.create_user(username='dono', password='123')
        self.outro_user = User.objects.create_user(username='intruso', password='123')
        
        # Crio um objeto pertencente ao usuário 'dono'
        self.objeto = Objeto.objects.create(
            dono=self.user,
            descricao="Descrição Original",
            local="BLOCO_A",
            tipo="OUTRO",
            situacao="ACHADO",
            status="ATIVO",
            data_encontro=date.today()
        )
        self.url = reverse('editar_objeto', args=[self.objeto.id])

    def test_edicao_pelo_dono(self):
        """
        Eu logo como o dono e tento alterar a descrição do item.
        Deve funcionar e salvar no banco.
        """
        self.client.force_login(self.user)
        
        # Dados novos para edição
        dados_editados = {
            'descricao': 'Descrição Alterada', # Mudança aqui
            'local': 'BLOCO_B',                # Mudança aqui
            'tipo': 'OUTRO',
            'situacao': 'ACHADO',
            'status': 'ATIVO',
            'data_encontro': date.today(),
            'contato': 'novo contato'
        }
        
        response = self.client.post(self.url, dados_editados)
        
        # Verifica redirecionamento para 'meus_objetos' (302)
        self.assertEqual(response.status_code, 302)
        
        # Recarrega o objeto do banco e verifica se mudou
        self.objeto.refresh_from_db()
        self.assertEqual(self.objeto.descricao, 'Descrição Alterada')
        self.assertEqual(self.objeto.local, 'BLOCO_B')

    def test_tentativa_edicao_por_outro_usuario(self):
        """
        Eu logo como um 'intruso' e tento editar o item do 'dono'.
        O sistema deve bloquear (Erro 404, pois o objeto não existe para mim).
        """
        self.client.force_login(self.outro_user)
        
        # Tenta acessar a página de edição (GET)
        response = self.client.get(self.url)
        
        # Como filtramos get_queryset(dono=request.user), o Django retorna 404 Not Found
        self.assertEqual(response.status_code, 404)

class TestesAPIObjetos(APITestCase):
    """
    Testes de API (Mobile).
    """
    def setUp(self):
        self.user = User.objects.create_user(username='apiuser', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.url = reverse('api-criar-objeto')

    def test_api_criar_objeto(self):
        """Testa o cadastro via JSON."""
        dados = {
            'descricao': 'Celular Samsung',
            'local': 'BLOCO_C',
            'tipo': 'ELETRONICOS',
            'situacao': 'ACHADO',
            'status': 'ATIVO',
            'data_encontro': date.today(),
            'contato': 'Sem contato'
        }
        response = self.client.post(self.url, dados, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)