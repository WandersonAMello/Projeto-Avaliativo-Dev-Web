# core/objetos/serializers.py
from rest_framework import serializers
from objetos.models import Objeto
from django.urls import reverse
import os

class SerializadorObjeto(serializers.ModelSerializer):
    local_legivel = serializers.SerializerMethodField()
    status_legivel = serializers.SerializerMethodField()
    tipo_legivel = serializers.SerializerMethodField()
    dias_custodia = serializers.SerializerMethodField()
    url_foto = serializers.SerializerMethodField()
    foto = serializers.ImageField(write_only=True, required=False)
    
    dono_username = serializers.ReadOnlyField(source='dono.username')
    class Meta:
        model = Objeto
        # Adiciona 'tipo' e 'tipo_legivel' aos campos da API
        fields = ['id', 'descricao', 'tipo', 'tipo_legivel', 'local', 'local_legivel', 
                  'status', 'status_legivel', 'contato', 'dias_custodia', 'url_foto', 
                  'foto', 'dono_username' ]

    def get_local_legivel(self, obj):
        return obj.get_local_display()

    def get_status_legivel(self, obj):
        return obj.get_status_display()
    
    def get_tipo_legivel(self, obj):
        return obj.get_tipo_display()

    def get_dias_custodia(self, obj):
        return obj.dias_em_custodia()

    def get_url_foto(self, obj):
        """
        Gera a URL dinâmica apontando para a view segura 'FotoObjeto'.
        Isso garante que o App Mobile acesse a foto pela rota correta,
        independentemente do IP do servidor (10.0.2.2, localhost, etc).
        """
        if obj.foto:
            request = self.context.get('request')
            try:
                # 1. Pega o nome do arquivo
                nome_arquivo = os.path.basename(obj.foto.name)
                
                # 2. Gera a parte relativa da URL (/objetos/fotos/nome.jpg)
                url_relativa = reverse('foto-objeto', args=[nome_arquivo])
                
                # 3. Cria a URL absoluta (http://IP:PORTA/...)
                if request:
                    return request.build_absolute_uri(url_relativa)
                return url_relativa
            except Exception:
                return None
        return None