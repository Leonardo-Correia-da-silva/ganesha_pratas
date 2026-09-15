# Joias Jaguariúna — E-commerce

Loja virtual completa para uma joalheria em Jaguariúna - SP: catálogo público com carrinho, checkout com cálculo de frete por CEP, pedidos enviados via WhatsApp (sem pagamento online), e um painel administrativo privado para o proprietário gerenciar produtos, categorias, pedidos e frete.

## Tecnologias

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router + React Hook Form + Zod + Lucide React
- **Banco de dados / arquivos:** Firebase Firestore + Firebase Storage (sem Firebase Authentication)
- **Backend administrativo:** Funções serverless da Vercel (`api/`), usando o Firebase Admin SDK
- **Deploy:** Vercel

## Arquitetura de segurança (resumo)

Não existe Firebase Authentication e não há múltiplos usuários — apenas **um administrador** (o proprietário), autenticado por um login server-side com cookie de sessão `HttpOnly`.

- O **Firestore** só permite leitura pública de dados ativos (produtos, categorias, regras de frete ativas, configurações da loja/frete) e leitura de um pedido específico pelo seu ID (usado na página de confirmação). Nenhuma escrita é permitida pelo SDK do cliente — veja `firestore.rules`.
- Todas as escritas (criar/editar/excluir produtos, categorias, pedidos, configurações) acontecem **exclusivamente** nas funções serverless em `api/`, usando o Firebase Admin SDK, que ignora as regras do Firestore e é protegido pela sessão administrativa.
- O upload de imagens (`api/admin/upload.ts`) também acontece no servidor — o Storage nunca aceita escrita direta do navegador (`storage.rules`).
- A criação de pedidos (`api/orders/create.ts`) roda dentro de uma **transação do Firestore**: revalida estoque e preço no servidor (nunca confia no carrinho do cliente), decrementa o estoque atomicamente e é **idempotente** (usa um `clientRequestId` como ID do pedido, evitando pedidos duplicados por cliques repetidos ou reenvios de rede).

## Pré-requisitos

- Node.js 20+
- Uma conta gratuita no [Firebase](https://console.firebase.google.com/)
- Uma conta na [Vercel](https://vercel.com/) para o deploy

## 1. Configurar o Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com/).
2. Ative o **Firestore Database** (modo produção) e o **Storage**.
3. Em **Configurações do projeto > Geral > Seus apps**, crie um app da Web e copie as credenciais (`apiKey`, `authDomain`, etc.) para as variáveis `VITE_FIREBASE_*` do `.env`.
4. Em **Configurações do projeto > Contas de serviço**, clique em "Gerar nova chave privada" — isso baixa um JSON com `project_id`, `client_email` e `private_key`. Use esses valores nas variáveis `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` do `.env` (mantenha as quebras de linha da chave privada; ao colar em uma única linha de `.env`, substitua as quebras de linha por `\n`).
5. Publique as regras de segurança:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # aponte para firestore.rules e storage.rules já existentes
   firebase deploy --only firestore:rules,storage:rules
   ```

## 2. Configurar o `.env`

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

- `VITE_FIREBASE_*`: credenciais públicas do app Web (seguras para expor no navegador — quem protege os dados são as *security rules*, não o segredo dessas chaves).
- `VITE_OWNER_WHATSAPP`: número de fallback (formato `55DDDNNNNNNNNN`, só números) usado até você configurar o WhatsApp real em **Admin > Configurações**.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: credenciais do único administrador da loja. **Nunca** prefixe essas variáveis com `VITE_`.
- `SESSION_SECRET`: uma string aleatória usada para assinar o cookie de sessão. Gere uma com:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`: credenciais do Firebase Admin SDK (passo 4 acima), usadas somente nas funções serverless.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

A Vite dev server sobe o frontend em `http://localhost:5173`. As funções em `api/` só rodam com a Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

## 4. Popular dados de teste (opcional)

Cria categorias e produtos fictícios (Anel Dourado, Brinco Pérola, Colar Delicado, Pulseira Elegance, Conjunto Premium) direto no seu Firestore, para desenvolvimento:

```bash
npm run seed
```

## 5. Configurar o frete

No painel (**/admin/settings/shipping**), escolha entre:

- **Frete único:** um valor fixo para qualquer entrega.
- **Frete por região:** cadastre faixas de CEP (ex: Jaguariúna `13820-000` a `13829-999` por R$ 10,00) — o sistema identifica automaticamente a região pelo CEP informado no checkout. CEPs fora de qualquer faixa cadastrada são recusados no checkout, com opção de falar direto com a loja pelo WhatsApp.

A consulta de endereço (rua, bairro, cidade, UF) usa a API pública do [ViaCEP](https://viacep.com.br/) — ela só preenche o endereço, nunca calcula o frete.

## 6. Build e deploy

```bash
npm run build   # valida TypeScript e gera o build de produção em dist/
```

Deploy na Vercel:

```bash
vercel --prod
```

Configure todas as variáveis do `.env` em **Project Settings > Environment Variables** na Vercel (as que não têm prefixo `VITE_` ficam automaticamente restritas ao servidor).

## Estrutura do projeto

```text
src/
├── components/     # UI pública (layout, produto, carrinho, checkout, home, ui genérica)
├── pages/          # Rotas públicas (Home, Catálogo, Produto, Carrinho, Checkout...)
├── layouts/         # PublicLayout (header + footer)
├── hooks/           # useCart, useAsync, useDebounce, useShippingCalculation
├── contexts/        # CartContext (persistido em localStorage)
├── services/        # productService, categoryService, shippingService, cepService,
│                     # orderService, whatsappService, storeSettingsService (leituras públicas)
├── firebase/         # Inicialização do client SDK (Firestore/Storage) — somente leitura
├── types/            # Product, Category, Order, ShippingRule, StoreSettings...
├── utils/            # currency, cep, phone, slug, cn
└── admin/
    ├── pages/         # Login, Dashboard, Products, Categories, Orders, Settings...
    ├── components/    # Sidebar, formulários, upload de imagens, tabelas
    ├── services/       # Chamadas para /api/admin/* (fetch com cookie de sessão)
    └── context/        # AdminAuthContext (checa a sessão via /api/auth/session)

api/
├── auth/            # login, logout, session (cookie HttpOnly assinado)
├── admin/           # CRUD protegido de produtos, categorias, pedidos, configurações, upload
├── orders/create.ts  # criação de pedido pública, com transação de estoque
└── _lib/            # firebaseAdmin, session, requireAdmin, schemas (zod), shipping
```

## O que NÃO está incluído (por escopo)

- Pagamento online (Pix automático, cartão, checkout transparente) — o pagamento é combinado com o cliente pelo WhatsApp.
- Integração com transportadoras (Correios, Melhor Envio, etc.) — a própria loja faz a entrega, com frete definido pelo proprietário.
- Múltiplos administradores, cadastro de usuários ou papéis de acesso — existe apenas um administrador, autenticado por variáveis de ambiente.
