# objetos/models.py
from django.db import models
from django.contrib.auth import get_user_model
from datetime import date
from .consts import STATUS_CHOICES

User = get_user_model()

class Objeto (models.Model):
    descricao = models.CharField(max_length=100)
    local = models.CharField(max_length=20, choices=OPCOES_LOCAL)
    data_encontro = models.DateField(default=date.today)
    
    # RF-007: Status ('entregue')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVO')
    
    # RF-008: Contato
    contato = models.CharField(max_length=20, blank=True, null=True, help_text="WhatsApp para contato")
    
    # RF-010: Foto Segura
    foto = models.ImageField(upload_to='objetos/fotos', blank=True, null=True)
    
    # RF-006: Dono do item (Para permitir edição/exclusão apenas pelo dono)
    dono = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) 

    def __str__(self):
        return f"{self.descricao} ({self.get_local_display()})"

    # RF-009: Cálculo de dias em custódia
    def dias_em_custodia(self):
        delta = date.today() - self.data_encontro
        return delta.days