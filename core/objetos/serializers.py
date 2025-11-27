# core/objetos/serializers.py
from rest_framework import serializers
from objetos.models import Objeto
import os

class SerializadorObjeto(serializers.ModelSerializer):
    local_legivel = serializers.SerializerMethodField()
    status_legivel = serializers.SerializerMethodField()
    tipo_legivel = serializers.SerializerMethodField()
    dias_custodia = serializers.SerializerMethodField()
    url_foto = serializers.SerializerMethodField()

    class Meta:
        model = Objeto
        # Adiciona 'tipo' e 'tipo_legivel' aos campos da API
        fields = ['id', 'descricao', 'tipo', 'tipo_legivel', 'local', 'local_legivel', 
                  'status', 'status_legivel', 'contato', 'dias_custodia', 'url_foto']

    def get_local_legivel(self, obj):
        return obj.get_local_display()

    def get_status_legivel(self, obj):
        return obj.get_status_display()
    
    # Novo método para pegar o texto bonitinho do tipo
    def get_tipo_legivel(self, obj):
        return obj.get_tipo_display()

    def get_dias_custodia(self, obj):
        return obj.dias_em_custodia()

    def get_url_foto(self, obj):
        if obj.foto:
            return f"http://127.0.0.1:8000/objetos/api/foto/{os.path.basename(obj.foto.name)}"
        return None