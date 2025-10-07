# Desafio Next.js – Guia em Português

Este projeto foi criado com [Create Next App](https://nextjs.org/docs/app/api-reference/cli/create-next-app) e já está pronto para você rodar localmente.

## Como começar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra http://localhost:3000 no navegador.

Dica: acesse http://localhost:3000/guia para ver um guia rápido dentro do próprio app, com passos práticos (em português) sobre rotas, navegação, API routes, estilos e build.

## Onde editar
- Página inicial: `app/page.tsx`
- Layout global: `app/layout.tsx`
- Arquivos estáticos (imagens, ícones): pasta `public/`

Crie novas páginas criando pastas dentro de `app/` contendo um arquivo `page.tsx`. Ex.: `app/exemplo/page.tsx` cria a rota `/exemplo`.

## Scripts úteis
- `npm run dev` – modo desenvolvimento (hot reload)
- `npm run build` – build de produção
- `npm start` – roda a versão de produção (após o build)

## Variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto, por exemplo:
```
API_URL=https://api.exemplo.com
NEXT_PUBLIC_SITE_NAME=Meu Site
```
Variáveis que começam com `NEXT_PUBLIC_` ficam disponíveis no cliente (navegador).

## Aprenda mais
- Documentação: https://nextjs.org/docs
- Tutorial interativo: https://nextjs.org/learn

## Deploy
Uma opção simples é a Vercel: https://vercel.com/
Veja também a documentação de deploy: https://nextjs.org/docs/app/building-your-application/deploying
