from django.test import TestCase
from datetime import datetime, timedelta
from objetos.models import Objeto

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