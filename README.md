
# Azure DevOps AI Manager

O **Azure DevOps AI Manager** é uma aplicação Angular moderna projetada para simplificar o gerenciamento de User Stories no Azure DevOps, integrando inteligência artificial para automatizar tarefas diárias e fornecer insights sobre o progresso do trabalho.

## 🚀 Recursos e Features

### 🔹 Integração com Azure DevOps
- **Listagem de User Stories:** Visualização clara das User Stories atribuídas ao desenvolvedor.
- **Busca e Filtros:** Busca por ID e filtros rápidos por status (To Do, In Progress, Review, Testing, etc.).
- **Detalhamento de Itens:** Visualização completa de descrições e critérios de aceitação com suporte a Markdown.
- **Gestão de Tasks:** Visualização de sub-tarefas vinculadas, incluindo estado e horas reportadas.
- **Cálculo de Esforço:** Acompanhamento automático de horas completadas vs. Story Points estimados.

### 🤖 Inteligência Artificial (Google Gemini)
- **AI Improve:** Refinamento automático da descrição da User Story para torná-la mais clara e profissional.
- **Resumo IA:** Geração de um resumo executivo conciso da User Story.
- **Sugestões de Tasks:** IA sugere sub-tarefas técnicas (coding, testing, config) baseadas na descrição da story.

### ⚡ Produtividade e Ferramentas
- **Gerador de Daily:** Ferramenta interativa para gerar relatórios de Daily Scrum formatados, permitindo consolidar múltiplas demandas, horas do dia e bloqueios.
- **Gerador de Branch:** Cria e copia automaticamente nomes de branch padronizados (ex: `feature/ID-titulo-da-story`).
- **Dark Mode:** Suporte completo a tema claro e escuro.
- **Sistema de Cache:** Interceptor de cache para otimizar o carregamento e reduzir chamadas repetitivas à API.
- **Modo Demo:** Explore todas as funcionalidades com dados fictícios sem necessidade de configuração.

## 🛠️ Tecnologias Utilizadas

- **Angular 21+**: Framework web.
- **Tailwind CSS**: Estilização moderna e responsiva.
- **Google Gemini AI**: Inteligência artificial para resumos e automações.
- **Azure DevOps REST API**: Integração direta com seus projetos e work items.
- **Vite**: Build tool extremamente rápida.

## 💻 Como Instalar e Rodar

### Pré-requisitos
- **Node.js** (versão LTS recomendada)
- **NPM** (instalado com o Node.js)

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/kassiodouglas/gerenciamento-azure-us.git
   cd us-manager-angular
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Configurar as variáveis de ambiente:**
   - Renomeie o arquivo `.env.local.example` para `.env.local`.
   - Adicione sua chave de API do Gemini: `GEMINI_API_KEY=sua_chave_aqui`.

4. **Executar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:4200` (ou na porta indicada no console).

## ⚙️ Configuração no App

Ao abrir o app, você precisará configurar o acesso ao Azure DevOps na seção de **Settings**:
- **Organization**: O nome da sua organização no Azure DevOps.
- **Project**: O nome do seu projeto.
- **PAT (Personal Access Token)**: Token gerado no Azure DevOps com permissões de leitura de Work Items.
- **Developer Email**: Seu e-mail vinculado aos itens no Azure.

---
*Desenvolvido para tornar a gestão do Azure DevOps mais inteligente.*
