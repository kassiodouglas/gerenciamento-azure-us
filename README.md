
# Azure DevOps AI Manager

O **Azure DevOps AI Manager** é uma aplicação Angular moderna projetada para simplificar o gerenciamento de User Stories no Azure DevOps, integrando inteligência artificial para automatizar tarefas diárias e fornecer insights sobre o progresso do trabalho.

## 🚀 Propósito

Este app foi desenvolvido para desenvolvedores que utilizam o Azure DevOps e desejam uma interface mais ágil e inteligente para:
- **Visualizar User Stories:** Interface limpa com filtros por status e busca por ID.
- **Acompanhamento de Horas:** Cálculo automático de horas completadas vs. pontos de história.
- **Geração de Daily:** Integração com o Google Gemini AI para gerar resumos de Daily Scrum baseados nas suas atividades.
- **Modo Demo:** Possibilidade de explorar as funcionalidades sem necessidade de configuração imediata.

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
