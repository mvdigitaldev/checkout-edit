# Checkout Asaas - Next.js

Checkout completo integrado com a API do Asaas para processamento de pagamentos via Pix e Cartão de Crédito.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **React Server Components** + **Server Actions**
- **Tailwind CSS**
- **shadcn/ui**
- **React Hook Form**
- **Zod** (validação)
- **Asaas API**

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Asaas com API Key

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd checkout-edit
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione sua API Key do Asaas:
```env
ASAAS_API_KEY=$aact_prod_sua_chave_aqui
ASAAS_API_URL=https://api.asaas.com/v3
```

**Importante sobre a API Key:**
- A chave deve começar com `$aact_prod_` para produção ou `$aact_hmlg_` para sandbox
- **O caractere `$` no início faz parte da chave** - não remova
- Não use aspas ao redor do valor
- A chave é gerada em: Asaas Dashboard → Integrações → API Key

Para ambiente sandbox:
```env
ASAAS_API_KEY=$aact_hmlg_sua_chave_aqui
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
```

**⚠️ Importante:** Após alterar o arquivo `.env.local`, você deve:
1. Parar o servidor (Ctrl+C)
2. Deletar a pasta `.next` (cache do Next.js): `rm -rf .next` ou `Remove-Item -Recurse -Force .next` (PowerShell)
3. Reiniciar o servidor com `npm run dev`

## 🏃 Executando

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm run build
npm start
```

## 📖 Uso

### Sistema de Planos

O checkout suporta planos configuráveis via `.env.local`. Cada plano tem um UUID único e um valor.

Adicione no `.env.local`:
```env
# Planos de Assinatura
PLAN_1_UUID=seu-uuid-aqui
PLAN_1_VALUE=28.90
PLAN_2_UUID=seu-uuid-aqui
PLAN_2_VALUE=32.90
```

Acesse a página de checkout com um plano:
```
http://localhost:3000/checkout?plan=seu-uuid-aqui
```

Ou ainda é possível usar o valor direto (deprecado, use planos):
```
http://localhost:3000/checkout?amount=100.00
```

### Fluxo de Pagamento

1. **Dados do Cliente**: Preencha nome, CPF/CNPJ, email e telefone
2. **Método de Pagamento**: Escolha entre Pix ou Cartão de Crédito
3. **Dados do Cartão** (se aplicável): Número, nome, validade e CVV
4. **Processamento**: 
   - Para Pix: Gera QR Code e código copia-e-cola
   - Para Cartão: Processa pagamento e exibe confirmação

## 🏗️ Estrutura do Projeto

```
/app
  /checkout
    page.tsx              # Página principal
  /actions
    checkout.ts           # Server Actions
/lib
  asaas.ts               # Cliente HTTP Asaas
  validations.ts         # Schemas Zod
  utils.ts               # Utilitários
/components
  /checkout              # Componentes do checkout
  /ui                     # Componentes shadcn/ui
```

## 🔐 Segurança

- Chaves da API nunca expostas no client-side
- Validação dupla (client + server)
- Sanitização de inputs
- Validação de CPF/CNPJ e cartão de crédito

## 📝 Validações

- **CPF/CNPJ**: Validação de formato e dígitos verificadores
- **Email**: Formato válido
- **Telefone**: Formato brasileiro
- **Cartão**: Algoritmo de Luhn e validação de validade

## 🎨 Componentes

- `CheckoutForm`: Formulário principal
- `CustomerFields`: Campos do cliente
- `PaymentMethodSelector`: Seletor de método
- `CreditCardFields`: Campos do cartão
- `PixResult`: Resultado do Pix (QR Code)
- `PaymentSuccess`: Confirmação de pagamento

## 📚 Documentação

- [Asaas API](https://docs.asaas.com/)
- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🐛 Troubleshooting

### Erro de API Key

Se receber erro "ASAAS_API_KEY não configurada":

1. **Verifique o formato da chave no `.env.local`**:
   - A chave deve começar com `$aact_prod_` (produção) ou `$aact_hmlg_` (sandbox)
   - O `$` no início é obrigatório e faz parte da chave
   - Não use aspas ao redor do valor
   - Exemplo correto: `ASAAS_API_KEY=$aact_prod_000MzkwODA2MWY2...`

2. **Reinicie o servidor completamente**:
   ```bash
   # Parar o servidor
   # Deletar cache
   rm -rf .next  # Linux/Mac
   # ou
   Remove-Item -Recurse -Force .next  # Windows PowerShell
   
   # Reiniciar
   npm run dev
   ```

3. **Verifique se está usando o ambiente correto**:
   - Chave de produção (`$aact_prod_`) → `api.asaas.com`
   - Chave de sandbox (`$aact_hmlg_`) → `api-sandbox.asaas.com`

4. **Verifique se a chave não foi desativada**:
   - Chaves são desativadas após 3 meses de inatividade
   - Chaves expiram permanentemente após 6 meses de inatividade
   - Gere uma nova chave no painel do Asaas se necessário

### Erro de CORS
A API do Asaas deve ser chamada apenas do servidor (Server Actions). Não há chamadas diretas do cliente.

### QR Code não aparece
Verifique se o pagamento foi criado com sucesso e se o método `getPixQrCode` está retornando os dados corretos.

## 📄 Licença

MIT

