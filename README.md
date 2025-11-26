# 🧾 README.md — Sistema de Achados e Perdidos (Django + DRF + Ionic)

## 📌 1. Visão Geral
Este projeto implementa um sistema de **Achados e Perdidos** híbrido para ambiente acadêmico.
Ele integra um **Backend Django** (que serve tanto templates HTML quanto uma API REST) com um **Aplicativo Mobile** (Ionic/Angular).

**Destaques Técnicos:**
* **Arquitetura Híbrida:** O mesmo app Django (`objetos`) gerencia as interfaces Web e Mobile.
* **Segurança de Mídia:** Uploads de fotos não são expostos publicamente via `MEDIA_URL`; o acesso é controlado por uma View segura.
* **API REST Pura:** Implementação manual de rotas e views genéricas (sem a "mágica" de ViewSets/Routers), facilitando o aprendizado e controle.
* **Bootstrap Local:** Dependências de frontend servidas estaticamente, sem CDNs externos.

---

## 📌 2. Funcionalidades

### 🏢 Interface Web (Gestão)
* Login e Cadastro de usuários.
* **Feed de Itens:** Listagem de objetos perdidos/achados com filtros.
* **Meus Itens:** Painel para o usuário gerenciar suas publicações.
* **CRUD Completo:** Criar, Editar e Excluir itens (protegido por autoria).
* **Status do Item:** Marcar como "Devolvido" ou "Ocultado".

### 📱 Interface Mobile (Consulta Rápida)
* Login (Autenticação via Token).
* Listagem de itens recentes.
* Visualização de detalhes e foto.
* Cadastro rápido de novos achados (com foto da câmera).
* Contato via WhatsApp (link direto).

---

## 📘 3. Requisitos do Sistema

### Requisitos Funcionais (RF)
| ID | Nome | Descrição |
| :--- | :--- | :--- |
| **RF-001** | **Autenticação** | Login via Username/Senha (Web) e Token (API). |
| **RF-002** | **Cadastro de Itens** | Usuário cadastra: Descrição, Local (Lista), Data, Foto (Opcional) e Contato. |
| **RF-003** | **Listagem Pública** | Exibir itens com status "ATIVO", ordenados por data (mais recentes primeiro). |
| **RF-004** | **Filtro** | Filtrar itens por Local (ex: Bloco A, Cantina) e Tipo. |
| **RF-005** | **Segurança de Foto** | Imagens só podem ser visualizadas através de uma rota segura, não por link direto. |
| **RF-006** | **Permissões** | Apenas o dono do item pode Editá-lo, Excluí-lo ou alterar seu Status. |
| **RF-007** | **Cálculo de Custódia** | O sistema deve calcular "Dias em Custódia" (Hoje - Data do Encontro). |
| **RF-008** | **Contato** | Exibir botão/link para contato via WhatsApp se informado. |

### Requisitos Não Funcionais (RNF)
| ID | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF-001** | **API** | Uso de **Generic Views** (`ListAPIView`, `CreateAPIView`) em vez de ViewSets. |
| **RNF-002** | **Rotas** | Mapeamento manual de URLs (`path('api/...')`) sem uso de Routers automáticos. |
| **RNF-003** | **Frontend** | Uso de **Bootstrap 5** servido localmente (`/static/bootstrap/`). |
| **RNF-004** | **ORM** | Uso estrito do Django ORM para consultas e filtros. |
| **RNF-005** | **Estrutura** | Lógica Web e API coexistindo no mesmo app (`objetos`), diferenciadas pelas rotas. |

---

## 📂 4. Estrutura do Projeto

A estrutura mantém a simplicidade, concentrando a lógica de negócio no app `objetos` (ou `itens`), sem subdivisões complexas de pacotes.

```text
core/
├── manage.py
├── db.sqlite3
├── core/
│   ├── settings.py         # Configurações (INSTALLED_APPS, MEDIA, STATIC)
│   ├── urls.py             # Rotas principais (inclui as de 'objetos')
│   └── wsgi.py
├── objetos/                # App Principal
│   ├── admin.py
│   ├── apps.py
│   ├── models.py           # Modelo 'Objeto' com choices e métodos auxiliares
│   ├── forms.py            # Formulários para a interface Web
│   ├── serializers.py      # Serializers para a API (com SerializerMethodField)
│   ├── views.py            # CONTÉM TUDO: Web Views (ListView) e API Views (Generics)
│   ├── urls.py             # Rotas manuais para Web ('') e API ('api/')
│   └── tests.py            # Testes unitários (TDD)
└── templates/              # Templates HTML (Web)
    ├── base.html
    ├── autenticacao.html
    └── objetos/
        ├── listar.html
        ├── novo.html
        └── editar.html
└── static/                 # Arquivos Estáticos
    └── bootstrap/          # CSS e JS do Bootstrap (Local)´´´