from rest_framework.generics import ListCreateAPIView, DestroyAPIView
from .models import Objeto
from .serializers import SerializadorObjeto

# ListCreateAPIView resolve a Crítica 4: Permite GET (listar) e POST (criar)
class APIListarCriarObjetos(ListCreateAPIView):
    queryset = Objeto.objects.filter(entregue=False).order_by('-data_encontro')
    serializer_class = SerializadorObjeto


class APIDeletarObjeto(DestroyAPIView):
    queryset = Objeto.objects.all()
    serializer_class = SerializadorObjeto
