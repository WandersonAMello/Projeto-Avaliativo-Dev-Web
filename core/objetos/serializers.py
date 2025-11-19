from rest_framework import serializers
from .models import Objeto

class SerializadorObjeto(serializers.ModelSerializer):
    # Campos somente leitura (calculados)
    dias_custodia = serializers.SerializerMethodField()
    nome_local = serializers.SerializerMethodField()

    class Meta:
        model = Objeto
        fields = '__all__' # Pega tudo, inclusive a foto

    def get_dias_custodia(self, obj):
        return obj.dias_em_custodia()

    def get_nome_local(self, obj):
        return obj.get_local_display()