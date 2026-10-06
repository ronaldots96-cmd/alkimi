# Tracking das LPs (Cloudflare + GTM)

Duas camadas que se completam:

- **GTM** (`tracking/gtm/`): tags de navegador. Meta Pixel, GA4 e Google Ads com Enhanced Conversions.
- **Cloudflare Pages Functions** (`functions/` + `tracking/edge/`), adaptado do krob tracking stack:
  - cookies próprios de 400 dias, gravados pelo servidor (resistem ao ITP do Safari);
  - **teste A/B na edge**: a versão é sorteada antes da página sair, sem piscar, fixa por visitante;
  - Lead também pela **Meta Conversions API**, com o mesmo `event_id` do pixel (o Meta deduplica);
  - banco **D1** com visitantes, versões e leads, e um painel em `/dash`.

Tudo é à prova de falha: sem banco, sem chaves ou com erro, a página sai exatamente como o arquivo.

## Fluxo de um lead

```
visita /kids/ ──► _middleware.js ── cookies (_alk_sid, _fbp, _fbc), sorteio A/B, grava sessions + lp_exposures
                    │
                    └─► HTML com <html data-experiment data-variant> ──► dataLayer { lp, experiment, variant } ──► GTM
envio do form ──► n8n (lead + event_id, experiment, variant, fbp, fbc, ga_client_id)
              ──► dataLayer generate_lead ──► GTM: Meta Lead (eventID) · GA4 · Google Ads
              ──► POST /tracker ──► Meta CAPI (mesmo event_id) + event_log no D1
```

## Setup (uma vez)

1. Login no Cloudflare pelo terminal:
   ```bash
   npx wrangler login
   ```
2. Criar o banco:
   ```bash
   npx wrangler d1 create alkimi-tracking
   ```
3. Criar as tabelas:
   ```bash
   npx wrangler d1 execute alkimi-tracking --remote --file=tracking/migrations/0001_init.sql
   ```
4. No painel do Cloudflare → Workers & Pages → projeto das LPs → **Settings → Bindings → Add → D1 database**:
   nome da variável `DB`, banco `alkimi-tracking` (Production e Preview).
5. **Settings → Variables and Secrets** (Production):

   | Nome | Tipo | Valor |
   |---|---|---|
   | `DASH_KEY` | Secret | senha longa e aleatória para o `/dash` |
   | `META_PIXEL_ID` | Text | ID do Pixel (o mesmo do GTM) |
   | `META_ACCESS_TOKEN` | Secret | token da Conversions API (Events Manager → Settings → Generate access token) |
   | `META_TEST_EVENT_CODE` | Text | opcional, só durante o teste (Events Manager → Test events); depois apagar |
   | `DEFAULT_COUNTRY_CODE` | Text | opcional, padrão `1` (EUA) |

6. Fazer um novo deploy (bindings e variáveis só valem a partir do deploy seguinte).
7. Conferir: abrir `/kids/`, enviar um lead de teste e ver no `/dash` (Últimos leads → Meta CAPI = ok)
   e no Events Manager (evento Lead "Browser • Server", deduplicado).

Desenvolvimento local: `wrangler.toml` e `.dev.vars` (ignorados pelo git) já apontam para um D1 local.
Para subir: `npx wrangler pages dev . --port 8788`. Não versionar `wrangler.toml`: no Pages, ele passaria
a mandar nas configurações do painel.

## Como rodar um teste A/B

1. Copiar a página para `variants/<nome>/index.html` e fazer a mudança.
   Usar caminhos **absolutos** nos assets (`/assets/...`), porque a variante é servida na URL original.
2. Em `tracking/edge/experiments.js`, adicionar:
   ```js
   {
     id: 'kids-hero-2026-10',   // único, nunca reutilizar
     lp: 'kids',
     status: 'running',
     variants: [
       { id: 'control', file: null, weight: 50 },
       { id: 'b', file: '/variants/kids-hero-b/', weight: 50 },
     ],
   },
   ```
3. Commit + push. Para ver cada versão sem entrar no resultado: `/kids/?ab=b` ou `/kids/?ab=control` (QA).
4. Acompanhar em `/dash` → Testes A/B. Só decidir com confiança ≥ 95% e ~100 leads por versão.
   No GA4, a dimensão `variant` vem como `kids-hero-2026-10:b`.
5. Encerrar: `status: 'stopped'`. Se a variante venceu, levar a mudança para `kids/index.html`.

Regras: no máximo um teste `running` por página; `/variants/*` nunca abre direto (404).

## O que fica guardado (D1)

| Tabela | Uma linha por | Para quê |
|---|---|---|
| `sessions` | visitante | UTMs, gclid / fbclid / fbc / fbp da visita |
| `lp_exposures` | visitante × página × teste | denominador da conversão por versão |
| `event_log` | lead | versão, status da Meta CAPI, saúde do tracking |

Bots e visitas de QA não entram nos resultados. O e-mail do lead fica no D1, para cruzar com o CRM;
telefone e nome só saem como hash para a Meta.
