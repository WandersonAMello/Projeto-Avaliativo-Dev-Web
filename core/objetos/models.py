from django.db import models
from datetime import date
from objetos.consts import OPCOES_LOCAL, OPCOES_ESTADO


class Objeto(models.Model):

    descricao = models.CharField(max_length=100)
    local = models.CharField(max_length=20, choices=OPCOES_LOCAL)
    data_encontro = models.DateField(default=date.today)
    estado = models.CharField(max_length=20, choices=OPCOES_ESTADO)
    foto = models.ImageField(upload_to='objetos/fotos', blank=True, null=True)
    entregue = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.descricao} ({self.get_local_display()})"

    def dias_em_custodia(self):
        """Retorna o número de dias que o objeto está guardado."""
        delta = date.today() - self.data_encontro
        return delta.days