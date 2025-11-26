from rest_framework import serializers
from objetos.models import Objeto
import os

class SerializadorObjeto(serializers.ModelSerializer):
    # RNF no README: SerializerMethodField obrigatório para choices
    local_legivel = serializers.SerializerMethodField()
    status_legivel = serializers.SerializerMethodField()
    dias_custodia = serializers.SerializerMethodField()
    url_foto = serializers.SerializerMethodField() # Para a view segura

    class Meta:
        model = Objeto
        fields = ['id', 'descricao', 'local', 'local_legivel', 'status', 
                  'status_legivel', 'contato', 'dias_custodia', 'url_foto']

    def get_local_legivel(self, obj):
        return obj.get_local_display()

    def get_status_legivel(self, obj):
        return obj.get_status_display()

    def get_dias_custodia(self, obj):
        return obj.dias_em_custodia()

    def get_url_foto(self, obj):
        if obj.foto:
            # Retorna URL da nossa view segura customizada
            return f"http://127.0.0.1:8000/objetos/api/foto/{os.path.basename(obj.foto.name)}"
        return None