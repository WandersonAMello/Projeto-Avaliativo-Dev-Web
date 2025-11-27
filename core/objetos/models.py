# objetos/models.py
import os
from django.db import models
from django.contrib.auth import get_user_model
from datetime import date
from .consts import STATUS_CHOICES, LOCAL_CHOICES, TIPO_CHOICES, SITUACAO_CHOICES

User = get_user_model()

class Objeto (models.Model):
    descricao = models.CharField(max_length=100)
    situacao = models.CharField(max_length=10, choices=SITUACAO_CHOICES, default='ACHADO')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='OUTRO')
    local = models.CharField(max_length=20, choices=LOCAL_CHOICES)
    data_encontro = models.DateField(default=date.today)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVO')
    contato = models.CharField(max_length=20, blank=True, null=True, help_text="WhatsApp para contato")
    foto = models.ImageField(upload_to='objetos/fotos', blank=True, null=True)
    dono = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.descricao} ({self.get_tipo_display()})" # Opcional: mostrar o tipo no print

    def dias_em_custodia(self):
        delta = date.today() - self.data_encontro
        return delta.days

    def get_nome_arquivo_foto(self):
        if self.foto:
            return os.path.basename(self.foto.name)
        return None