# core/objetos/forms.py
from django import forms
from .models import Objeto

class FormularioObjeto(forms.ModelForm):
    class Meta:
        model = Objeto
        fields = ['descricao', 'situacao', 'tipo', 'local', 'data_encontro', 'status', 'contato', 'foto']
        
        widgets = {
            # 1. format='%Y-%m-%d': Garante que o valor apareça como AAAA-MM-DD no HTML
            # 2. attrs={'type': 'date'}: Diz ao navegador para renderizar o calendário
            'data_encontro': forms.DateInput(
                format='%Y-%m-%d',
                attrs={'type': 'date'}
            ),
        }

    # Opcional: Garante que o Django aceite a data se ela vier nesse formato na volta
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['data_encontro'].input_formats = ('%Y-%m-%d',)