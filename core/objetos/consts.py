# objetos/consts.py
LOCAL_CHOICES = [
    # Blocos Letras (A ao H)
    ('BLOCO_A', 'Bloco A'),
    ('BLOCO_B', 'Bloco B'),
    ('BLOCO_C', 'Bloco C'),
    ('BLOCO_D', 'Bloco D'),
    ('BLOCO_E', 'Bloco E'),
    ('BLOCO_F', 'Bloco F'),
    ('BLOCO_G', 'Bloco G'),
    ('BLOCO_H', 'Bloco H'),
    ('BLOCO_I', 'Bloco I'),
    ('BLOCO_J', 'Bloco J'),

    # Blocos Romanos (I ao IV)
    ('BLOCO_I', 'Bloco I'),
    ('BLOCO_II', 'Bloco II'),
    ('BLOCO_III', 'Bloco III'),
    ('BLOCO_IV', 'Bloco IV'),

    # Outros Locais
    ('BIBLIOTECA', 'Biblioteca'),
    ('REITORIA', 'Reitoria'),
    ('RU', 'Restaurante Universitário'),
    ('PRAINHA', 'Prainha'),
    ('BALA_I', 'Bala I'),
    ('BALA_II', 'Bala II'),
]

STATUS_CHOICES = [
    ('ATIVO', 'Ativo'),
    ('DEVOLVIDO', 'Devolvido'),
    ('OCULTADO', 'Ocultado'),
]

TIPO_CHOICES = (
    ('ELETRONICOS', 'Eletrônicos'),
    ('CHAVES', 'Chaves'),
    ('CARTEIRA', 'Carteira'),
    ('DOCUMENTOS', 'Documentos'),
    ('VESTUARIO', 'Vestuário'),
    ('OUTRO', 'Outro'),
)

SITUACAO_CHOICES = (
    ('ACHADO', 'Encontrei (Achado)'),
    ('PERDIDO', 'Perdi (Perdido)'),
)