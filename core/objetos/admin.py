# core/objetos/admin.py
from django.contrib import admin
from .models import Objeto

@admin.register(Objeto)
class ObjetoAdmin(admin.ModelAdmin):
    # Colunas que aparecem na lista
    list_display = (
        'id', 
        'descricao', 
        'tipo', 
        'local', 
        'status', 
        'data_encontro', 
        'dias_em_custodia_visual', # Campo calculado customizado
        'dono'
    )

    # Filtros laterais (importantes para a tua apresentação)
    list_filter = ('status', 'tipo', 'local', 'data_encontro')

    # Barra de pesquisa
    search_fields = ('descricao', 'contato', 'dono__username', 'local')

    # Campos que não podem ser editados (apenas leitura)
    readonly_fields = ('dias_em_custodia_visual', 'foto_preview')

    # Paginação
    list_per_page = 20

    # Método para exibir os dias em custódia na tabela
    def dias_em_custodia_visual(self, obj):
        dias = obj.dias_em_custodia()
        return f"{dias} dias"
    dias_em_custodia_visual.short_description = "Em Custódia"

    # Método (opcional) para ver uma miniatura da foto no Admin (dentro do detalhe)
    from django.utils.html import mark_safe
    def foto_preview(self, obj):
        if obj.foto:
            # Aponta para a tua View segura ou url direta se preferires
            return mark_safe(f'<img src="/objetos/fotos/{obj.foto.name.split("/")[-1]}" width="150" />')
        return "Sem foto"
    foto_preview.short_description = "Pré-visualização da Foto"