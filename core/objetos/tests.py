from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import date, datetime, timedelta
from django.urls import reverse
from .models import Objeto

class ObjetoModelTest(TestCase):

    def setUp(self):
        self.objeto = Objeto.objects.create(
            descricao="Guarda-chuva Preto",
            local="BLOCO_A",
            data_encontro=datetime.now().date() - timedelta(days=5), # Encontrado há 5 dias
            estado="BOM"
        )

    def test_criacao_objeto(self):
        """Testa se o objeto foi criado corretamente"""
        self.assertEqual(self.objeto.descricao, "Guarda-chuva Preto")

    def test_calculo_dias_custodia(self):
        """
        Testa a regra de negócio: o sistema deve calcular
        há quantos dias o item está no achados e perdidos.
        """
        # Como criamos com data de 5 dias atrás, esperamos que retorne 5
        self.assertEqual(self.objeto.dias_em_custodia(), 5)

class ObjetoLogicaTest(TestCase):
    def test_calculo_dias_perdido(self):
        """Testa se o sistema calcula corretamente os dias desde que foi achado"""
        # Cenário: Objeto encontrado há 3 dias
        data_passada = date.today() - timedelta(days=3)
        objeto = Objeto.objects.create(
            descricao="Chave do Carro",
            local="ESTACIONAMENTO",
            data_encontro=data_passada,
            estado="BOM"
        )
        # Verificação
        self.assertEqual(objeto.dias_em_custodia(), 3)

class ObjetoAPITest(APITestCase):
    def test_api_deve_aceitar_novos_objetos(self):
        """Testa se o App consegue enviar (POST) um novo objeto"""
        url = reverse('api-listar-criar-objetos')
        dados = {
            'descricao': 'Garrafa Azul',
            'local': 'BIBLIOTECA',
            'estado': 'NOVO',
            'data_encontro': date.today() # Envia como string YYYY-MM-DD automaticamente
        }
        response = self.client.post(url, dados, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Objeto.objects.count(), 1)
        # Verifica se o campo calculado aparece na resposta, mesmo não estando no banco
        self.assertIn('dias_custodia', response.data)