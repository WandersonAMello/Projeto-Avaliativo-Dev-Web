# core/objetos/tests.py
import os
from datetime import date, timedelta
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile

# Imports necessários para testar a API
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

# Imports do projeto
from .models import Objeto
from .forms import FormularioObjeto

# ==============================================================================
# 1. TESTES DE MODELO (BANCO DE DADOS)
# ==============================================================================

class TestesModelObjeto(TestCase):
    """
    Testa a lógica interna do banco de dados (sem envolver navegador ou views).
    """
    def setUp(self):
        # Cria um usuário e um objeto básico para usar nos testes
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
        """Verifica se os dados foram salvos corretamente no banco."""
        self.assertEqual(self.objeto.descricao, "Carteira de Couro")

    def test_calculo_dias_custodia(self):
        """Verifica se o método que calcula dias passados está correto."""
        # Se foi encontrado há 5 dias, o resultado deve ser 5
        self.assertEqual(self.objeto.dias_em_custodia(), 5)


# ==============================================================================
# 2. TESTES DAS VIEWS WEB (INTERFACE HTML)
# ==============================================================================

class TestesViewListarObjetos(TestCase):
    """
    Testa a View 'ListarObjetos' (Página Inicial Pública).
    """
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='123')
        self.client.force_login(self.user) # Login obrigatório
        self.url = reverse('listar_objetos')
        
        # Cria dois objetos: um no Bloco A e outro no Bloco B
        Objeto.objects.create(dono=self.user, descricao="Item A", local="BLOCO_A", situacao="ACHADO")
        Objeto.objects.create(dono=self.user, descricao="Item B", local="BLOCO_B", situacao="ACHADO")

    def test_exibir_todos(self):
        """Sem filtros, deve mostrar os 2 itens."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['achados']), 2)

    def test_filtro_local(self):
        """Ao filtrar por BLOCO_A, só deve aparecer 1 item."""
        response = self.client.get(self.url, {'local': 'BLOCO_A'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['achados']), 1)
        self.assertEqual(response.context['achados'][0].descricao, "Item A")


class TestesViewListarMeusObjetos(TestCase):
    """
    Testa a View 'ListarMeusObjetos' (Gerenciamento do Usuário).
    """
    def setUp(self):
        self.meu_usuario = User.objects.create_user(username='eu', password='123')
        self.outro_usuario = User.objects.create_user(username='outro', password='123')
        
        # Cria um item para cada usuário
        Objeto.objects.create(dono=self.meu_usuario, descricao="Meu Item", local="BLOCO_A")
        Objeto.objects.create(dono=self.outro_usuario, descricao="Item do Outro", local="BLOCO_A")
        
        self.url = reverse('meus_objetos')

    def test_ver_apenas_meus_itens(self):
        """Eu só devo ver o 'Meu Item' na lista."""
        self.client.force_login(self.meu_usuario)
        response = self.client.get(self.url)
        
        objetos_na_tela = response.context['objetos']
        self.assertEqual(len(objetos_na_tela), 1)
        self.assertEqual(objetos_na_tela[0].descricao, "Meu Item")


class TestesViewCriarObjeto(TestCase):
    """
    Testa a View 'CriarObjeto'.
    """
    def setUp(self):
        self.user = User.objects.create_user(username='teste', password='123')
        self.client.force_login(self.user)
        self.url = reverse('criar_objeto')

    def test_get_formulario(self):
        """
        Verifica se a página carrega (GET) e se entrega o formulário correto no contexto.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        
        # Verifica se 'form' existe e é uma instância de FormularioObjeto
        self.assertIsInstance(response.context.get('form'), FormularioObjeto)

    def test_post_criar_sucesso(self):
        """Envia o formulário e verifica se salvou e redirecionou."""
        dados = {
            'descricao': 'Notebook Dell',
            'local': 'BLOCO_A',
            'tipo': 'ELETRONICOS',
            'situacao': 'PERDIDO',
            'status': 'ATIVO',
            'data_encontro': date.today(),
            'contato': '99 9999-9999'
        }
        response = self.client.post(self.url, dados)
        
        # Verifica se redirecionou para a lista (código 302) e para a URL correta
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('listar_objetos'))
        
        # Confirma que salvou no banco
        self.assertEqual(Objeto.objects.count(), 1)
        self.assertEqual(Objeto.objects.first().descricao, 'Notebook Dell')


class TestesViewEditarObjeto(TestCase):
    """
    Testa a View 'EditarObjeto'.
    """
    def setUp(self):
        self.dono = User.objects.create_user(username='dono', password='123')
        self.intruso = User.objects.create_user(username='intruso', password='123')
        self.objeto = Objeto.objects.create(dono=self.dono, descricao="Original", local="BLOCO_A")
        self.url = reverse('editar_objeto', args=[self.objeto.id])

    def test_get_formulario_edicao(self):
        """
        Verifica se a página de edição carrega com o formulário correto.
        """
        self.client.force_login(self.dono)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, 200)
        
        # Verifica se o formulário passado é do tipo correto
        self.assertIsInstance(response.context.get('form'), FormularioObjeto)
        # Verifica se o formulário veio preenchido com os dados do objeto
        self.assertEqual(response.context['form'].instance, self.objeto)

    def test_post_dono_edita_sucesso(self):
        """O dono altera a descrição com sucesso."""
        self.client.force_login(self.dono)
        dados = {
            'descricao': 'Editado',
            'local': 'BLOCO_A',
            'tipo': 'OUTRO',
            'situacao': 'ACHADO',
            'status': 'ATIVO',
            'data_encontro': date.today()
        }
        response = self.client.post(self.url, dados)
        
        # Verifica redirecionamento para 'meus_objetos'
        self.assertRedirects(response, reverse('meus_objetos'))
        
        self.objeto.refresh_from_db()
        self.assertEqual(self.objeto.descricao, 'Editado')

    def test_intruso_nao_pode_editar(self):
        """Outro usuário recebe erro 404 ao tentar editar."""
        self.client.force_login(self.intruso)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 404)


class TestesViewDeletarObjeto(TestCase):
    """
    Testa a View 'DeletarObjeto'.
    """
    def setUp(self):
        self.dono = User.objects.create_user(username='dono', password='123')
        self.objeto = Objeto.objects.create(dono=self.dono, descricao="Lixo", local="BLOCO_A")
        self.url = reverse('deletar_objeto', args=[self.objeto.id])

    def test_dono_pode_deletar(self):
        """O dono confirma a exclusão e o item some."""
        self.client.force_login(self.dono)
        response = self.client.post(self.url) # POST confirma deleção
        
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, reverse('listar_objetos'))
        self.assertEqual(Objeto.objects.count(), 0)


class TestesViewAlternarStatusAjax(TestCase):
    """
    Testa a View AJAX 'alternar_status_ajax' (Botão de Devolvido).
    """
    def setUp(self):
        self.dono = User.objects.create_user(username='dono', password='123')
        self.objeto = Objeto.objects.create(dono=self.dono, status="ATIVO", local="BLOCO_A")
        self.url = reverse('alternar_status_ajax', args=[self.objeto.id])

    def test_ajax_alternar(self):
        """Clica no botão (POST) e status muda para DEVOLVIDO."""
        self.client.force_login(self.dono)
        response = self.client.post(self.url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['novo_status'], 'DEVOLVIDO')
        
        self.objeto.refresh_from_db()
        self.assertEqual(self.objeto.status, 'DEVOLVIDO')


class TestesViewFotoObjeto(TestCase):
    """
    Testa a View 'FotoObjeto' (Download seguro de imagens).
    """
    def setUp(self):
        self.user = User.objects.create_user(username='foto_user', password='123')
        # Cria uma imagem falsa na memória (GIF de 1px)
        img = SimpleUploadedFile('teste.gif', b'GIF89a...', content_type='image/gif')
        self.objeto = Objeto.objects.create(dono=self.user, descricao="Com Foto", local="BLOCO_A", foto=img)
        self.nome_arquivo = os.path.basename(self.objeto.foto.name)

    def tearDown(self):
        # Limpa o arquivo físico após o teste
        if self.objeto.foto:
            self.objeto.foto.delete()

    def test_acesso_foto(self):
        """Se o arquivo existe, deve retornar status 200."""
        url = reverse('foto-objeto', args=[self.nome_arquivo])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)


# ==============================================================================
# 3. TESTES DAS VIEWS API (MOBILE)
# ==============================================================================

class TestesAPIListarObjetos(APITestCase):
    """Testa a View da API: Listagem Pública."""
    def setUp(self):
        self.user = User.objects.create_user(username='api', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        # Cria item
        Objeto.objects.create(dono=self.user, descricao="Celular", local="BLOCO_A", status="ATIVO")

    def test_api_listar(self):
        """Deve retornar a lista em JSON."""
        url = reverse('api-listar-objetos')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class TestesAPIListarMeusObjetos(APITestCase):
    """Testa a View da API: Meus Objetos."""
    def setUp(self):
        self.user = User.objects.create_user(username='api', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        
        Objeto.objects.create(dono=self.user, descricao="Meu", local="BLOCO_A") # Meu
        
        outro = User.objects.create_user(username='outro', password='123')
        Objeto.objects.create(dono=outro, descricao="Outro", local="BLOCO_A") # Não é meu

    def test_api_meus_itens(self):
        """Deve retornar apenas o item 'Meu'."""
        url = reverse('api-meus-objetos')
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['descricao'], "Meu")


class TestesAPICriarObjeto(APITestCase):
    """Testa a View da API: Criação."""
    def setUp(self):
        self.user = User.objects.create_user(username='api', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_api_criar(self):
        """Envia JSON e verifica se criou no banco."""
        url = reverse('api-criar-objeto')
        dados = {
            'descricao': 'Item API',
            'local': 'BLOCO_A',
            'tipo': 'OUTRO',
            'situacao': 'ACHADO',
            'data_encontro': '2023-01-01'
        }
        response = self.client.post(url, dados)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Objeto.objects.filter(descricao='Item API').exists())


class TestesAPIEditarObjeto(APITestCase):
    """Testa a View da API: Edição."""
    def setUp(self):
        self.user = User.objects.create_user(username='api', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.objeto = Objeto.objects.create(dono=self.user, descricao="Antigo", local="BLOCO_A")

    def test_api_editar(self):
        """Envia PATCH para alterar descrição."""
        url = reverse('api-editar-objeto', args=[self.objeto.id])
        response = self.client.patch(url, {'descricao': 'Novo Nome'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.objeto.refresh_from_db()
        self.assertEqual(self.objeto.descricao, 'Novo Nome')


class TestesAPIDeletarObjeto(APITestCase):
    """Testa a View da API: Deleção."""
    def setUp(self):
        self.user = User.objects.create_user(username='api', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.objeto = Objeto.objects.create(dono=self.user, local="BLOCO_A")

    def test_api_deletar(self):
        """Envia DELETE e verifica se sumiu."""
        url = reverse('api-deletar-objeto', args=[self.objeto.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Objeto.objects.count(), 0)


class TestesAPIAlternarStatus(APITestCase):
    """Testa a View da API: Alternar Status."""
    def setUp(self):
        self.user = User.objects.create_user(username='api', password='123')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.objeto = Objeto.objects.create(dono=self.user, status="ATIVO", local="BLOCO_A")

    def test_api_status_toggle(self):
        """POST deve mudar de ATIVO para DEVOLVIDO."""
        url = reverse('api-alternar-status', args=[self.objeto.id])
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['novo_status'], 'DEVOLVIDO')