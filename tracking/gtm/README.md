# GTM: Alkimi Austin LPs (GTM-K9P4T495)

`alkimi-austin-gtm-container.json` é o container adaptado do padrão Inside Sales para as LPs kids e women.
Toda tag lê os dados do `dataLayer`, nunca dos campos do formulário.

## Como importar

1. GTM → Admin → **Import Container** → escolher o JSON.
2. Workspace: o atual. Opção: **Merge** → **Rename conflicting tags, triggers and variables**.
3. Preencher as 4 constantes (variáveis `0.0x` / `4.01`):

| Variável | Valor |
|---|---|
| `0.01 Facebook Ads Pixel` | ID do Pixel do Meta |
| `0.02 GA4 ID` | ID de medição `G-...` do fluxo de dados web (não o ID numérico da propriedade) |
| `0.04 Tag Google Ads` | `AW-...` |
| `4.01 GAds Lead - Label` | Label da ação de conversão de Lead |

4. Testar no **Preview** (Tag Assistant) e publicar.

## O que o site envia ao dataLayer

| Quando | Push |
|---|---|
| No `<head>`, antes do GTM | `{ lp: 'kids' \| 'women', experiment, variant }`: `variant` = `default` sem teste, ou `<experimento>:<versão>` (ex.: `kids-hero-2026-10:b`) |
| Clique em qualquer CTA para o formulário | `{ event: 'cta_click', cta_location: 'nav' \| 'hero' \| 'sticky' \| 'section', cta_text }` |
| Primeira interação com o formulário | `{ event: 'form_start' }` |
| Envio do formulário | `{ event: 'generate_lead', lp, variant, event_id, user_data: { email, phone_number (E.164), first_name, last_name } }` |

A versão é sorteada na Cloudflare: ver `tracking/README.md`.

## Tags

- **Meta:** PageView (com `lp` e `variant`) e Lead com Advanced Matching e `eventID` = `event_id`. O mesmo ID permite deduplicar quando o envio pelo servidor (CAPI) entrar na etapa 2.
- **GA4:** Google tag com `lp` e `variant` em todos os eventos, mais os eventos `cta_click`, `form_start` e `generate_lead`. Nenhum dado pessoal vai para o GA4, conforme os termos do Google.
- **Google Ads:** Google tag, vinculador de conversões, remarketing e conversão de Lead com Enhanced Conversions e `orderId` = `event_id` (evita conversão duplicada).

Removido do container padrão: cookies com nome, e-mail e telefone em texto aberto, variáveis que liam os campos por ID (`seu_email`, `whatsapp`), o DDI 55 e a URL de servidor (`transport_url`) sem uso.

## Configurar fora do GTM

- **GA4** → Admin → Custom definitions: criar as dimensões de evento `lp`, `variant`, `cta_location`.
  Sem isso, os parâmetros chegam, mas não aparecem nos relatórios. Marcar `generate_lead` como **key event**.
- **Google Ads:** ativar Enhanced Conversions for leads na ação de conversão.
- **n8n:** o webhook passa a receber também `event_id`, `variant`, `fbp`, `fbc` e `ga_client_id`.
  Vale salvar esses campos no CRM: são eles que permitem devolver "agendou / compareceu / matriculou"
  ao Meta e ao Google Ads como conversões offline.
