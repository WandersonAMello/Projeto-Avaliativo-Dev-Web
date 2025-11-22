from rest_framework import serializers
from .models import Objeto

class SerializadorObjeto(serializers.ModelSerializer):
    dias_custodia = serializers.SerializerMethodField()
    local_display = serializers.SerializerMethodField()

    class Meta:
        model = Objeto
        fields = '__all__'

    def get_dias_custodia(self, obj):
        return obj.dias_em_custodia()

    def get_local_display(self, obj):
        return obj.get_local_display()