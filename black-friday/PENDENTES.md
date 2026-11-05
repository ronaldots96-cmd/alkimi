# LP Black Friday · pendências (v7, 05/11/2026)

Página: `black-friday/index.html` (servida em `/black-friday/`).
Preview: https://black-friday.alkimi-preview.pages.dev/black-friday/ (projeto Cloudflare separado, `alkimi-preview`, só para revisão).
Produção (depois do ok do Ronaldo): https://gym.alkimijiujitsu.com/black-friday/

Na página, todo pendente aparece como etiqueta amarela "PENDING: …". Para achar todos: buscar `class="todo"` no HTML.

---

## 1. Termos da oferta

| # | O que é | Quem fornece | Onde entra na página |
|---|---|---|---|
| 1.1 | Benefício: $30 de desconto por mês, comunicado como "save almost $400 a year" (definido em 04/11, sem kimono/kit). Falta confirmar o valor mensal final por plano; a página não publica $235 | Nicholas | FAQ "How much is the membership" |
| 1.2 | ~~Starter kit~~ Fora da oferta por enquanto (04/11). A página não cita kit nem kimono como benefício | — | — |
| 1.3 | Regras do depósito de $100: reembolsável ou não, até quando a pessoa precisa começar em janeiro | Nicholas | Opção 2 (letra miúda), FAQ "How does the $100 deposit work?" |
| 1.4 | Número de vagas, se for usar escassez | Nicholas | O cartão do contador (abaixo do hero) foi feito no modelo da Alliance, mas sem a barra "12 of 15 spots left": não há número real. Se o Nicholas definir vagas, a barra entra à direita do contador |
| 1.5 | "Aula grátis": pode aparecer ou não. A página não diz "free class" nem "free trial" em lugar nenhum | Nicholas | Se liberar: Opção 1 e passo 2 do "How to reserve" |
| 1.6 | ~~Toddlers entra ou não~~ Resolvido na v2: a LP mostra as 5 turmas do site (Toddlers 3–5, Kids 6–14, Women, Fundamentals, Advanced), também no formulário e no fluxo do n8n. Confirmar só se a oferta de Black Friday vale para todas, inclusive Toddlers (semi-privado) e Advanced | Nicholas | Programs, formulário, FAQ |
| 1.7 | ~~Gi na primeira aula~~ Resolvido em 05/11: não é obrigatório na primeira aula e a Alkimi empresta um se necessário | — | FAQ "What should I wear" |
| 1.8 | Prazo: o contador termina em 30/11/2026 às 23:59 (horário Central). Confirmar se é isso | Nicholas | Hero e CTA final (`data-deadline`), FAQ |

## 2. Vídeos

| # | O que é | Quem fornece | Onde entra |
|---|---|---|---|
| 2.1 | ~~Vídeo 3 da Chloe, "The November offer"~~ Resolvido em 04/11: versão web H.264/AAC com 4,99 MB e 33,15 s em `assets/video/alkimi-black-friday-chloe-9x16-web.mp4`. O original de 20 MB foi preservado. O vídeo tem legendas gravadas; a track VTT opcional fica desligada por padrão para não duplicar | — | Hero |
| 2.2 | ~~Capa do vídeo~~ Resolvido em 04/11 com frame real da gravação em `assets/video/alkimi-black-friday-chloe-poster.webp` | — | Hero |
| 2.3 | 6 depoimentos em vídeo (2 pais Kids 6+, 2 Fundamentals, 1 Women, 1 "comecei depois dos 30"), até 25/11 | Nicholas escolhe, cameraman grava, Ronaldo pauta | Seção "What our students say": substituir o bloco tracejado |

## 3. Fotos

| # | O que é | Quem fornece | Onde entra |
|---|---|---|---|
| 3.1 | A pasta nova do Drive (COACHES, KIDS, WOMEN, FACILITY/MERCH, ADVANCED) aparece **vazia** para o conector do Google Drive. A v2 usa o máximo possível das 59 fotos já baixadas da pasta antiga ("Fotos Ads" + raiz): a galeria tem 9 fotos. Ficaram de fora as fotos com rosto de criança. Conferir o compartilhamento da pasta nova para trazer fotos de estrutura e de coaches | Ronaldo / Nicholas | Toda a página |
| 3.2 | Nicholas Meregali (card 4) e Chloe McNally (card 2, black belt e coach da turma feminina) confirmados em 05/11. Faltam nome, faixa, turma e bio curta dos coaches dos cards 1 e 3 | Nicholas | Seção "Meet your coaches" |
| 3.3 | ~~Foto do starter kit~~ Não se aplica: kit fora da oferta | — | — |
| 3.4 | Fotos reais de estrutura (recepção, vestiário, estacionamento). O site só tem renders 3D, que não usei | Nicholas (pasta FACILITY/MERCH) | Seção "Your new academy" (galeria) |
| 3.5 | Autorização de imagem: o card Kids mostra as crianças **de costas** (IMG_5563) e o card Toddlers é recortado dos ombros para baixo (IMG_3631). Nenhum rosto de criança na página. Para usar fotos de crianças de frente, precisa do termo dos pais | Nicholas | Cards Kids e Toddlers |
| 3.6 | Confirmar consentimento dos adultos que aparecem: IMG_3660 (hero), IMG_3676, IMG_3030, foto da turma Women, FD7E89D9 (Advanced) e na galeria IMG_3284, IMG_4206, IMG_3710, IMG_4169, IMG_3786, 55d90843, 8C87FA65, IMG_5423, IMG_4216 | Nicholas | Hero, Programs, How to reserve, Academy |

## 4. Depoimentos

| # | O que é | Quem fornece | Onde entra |
|---|---|---|---|
| 4.1 | Os 3 depoimentos são trechos literais de avaliações 5★ do Google, coletados em 03/10 (Shelley H., Becky B., Miguel B.). Não editar o texto | — | Seção "What our students say" |
| 4.2 | Nota do Google: atualizada para "5.0 from 76 reviews" (Ronaldo, 02/11). Conferir de novo antes de subir | Ronaldo | Hero e cabeçalho dos depoimentos |
| 4.3 | Avaliação real de pai/mãe sobre a turma Kids (ainda não existe nenhuma) | Chloe pede aos pais | Depoimentos |

## 5. Textos

| # | O que é | Quem fornece | Onde entra |
|---|---|---|---|
| 5.1 | ~~Bio curta do Nicholas para o card de coach~~ Resolvido em 05/11 com foco na liderança técnica e na seleção da equipe; a LP continua sem usar "world champion" | — | Card "Nicholas Meregali" |
| 5.2 | Grade de horários: transcrita da imagem do site (alkimijiujitsu.com, "as of September 15th, 2026"). Confirmar se ainda vale para dezembro e janeiro | Chloe | Academy → "Weekly schedule" |
| 5.3 | Estacionamento no local confirmado em 05/11. Ainda confirmar os detalhes publicados sobre vestiários e chuveiros | Chloe / Nicholas | Academy → "Facilities" |
| 5.4 | ~~Link da política de privacidade~~ Resolvido em 05/11 com `https://alkimijiujitsu.com/privacy-policy/` | — | Formulário |
| 5.5 | Revisão do inglês por nativo antes de ir ao ar | Nicholas ou Chloe | Página inteira |
| 5.6 | ~~Título SEO, meta description e OG citando o benefício~~ Resolvido: todos usam "almost $400 a year" | — | `<title>`, `meta description`, OG |

## 6. Técnico

| # | O que é | Quem faz | Onde |
|---|---|---|---|
| 6.1 | **Importar e ativar o fluxo do n8n** `automation/n8n-black-friday-ghl.json` (webhook `/webhook/alkimi-black-friday` → upsert do contato com source "LP Black Friday" e tags da opção/programa → oportunidade no pipeline NEW, etapa NEW LEADS → nota com opção, programa e UTMs). Escolher a credencial Header Auth com o token da private integration (o token não está no arquivo). **Até isso ser feito, o lead do formulário não chega ao GoHighLevel**: fica só o registro no D1 (`/tracker`, com e-mail) | Ronaldo | n8n |
| 6.2 | Link de pagamento do depósito de $100 | Nicholas (GHL Payments / Stripe) | Tela de sucesso do formulário, botão "Pay the $100 Deposit" (`data-deposit-link`, hoje `href="#"`). Também vai no SMS/e-mail da reativação |
| 6.3 | Automação no GHL disparada pela tag `bf-january-deposit` (mandar o link do depósito na hora) e `bf-start-now` (Chloe liga) | Ronaldo | GoHighLevel |
| 6.4 | Lead de teste ponta a ponta no preview (formulário → n8n → contato + oportunidade no NEW) com nome "TESTE" | Ronaldo | Depois de 6.1 |
| 6.5 | Ir para produção: commit da pasta `black-friday/`, `assets/img/black-friday/`, `automation/n8n-black-friday-ghl.json`, e das 2 linhas em `functions/_middleware.js` (bloqueia `*.md` no site) e `tracking/edge/experiments.js` (registra `/black-friday/` no painel `/dash`). Push na `main` só com ok do Ronaldo | Ronaldo | Git / Cloudflare `alkimi` |
| 6.6 | Tirar o `<meta name="robots" content="noindex, nofollow">` se a página deve ser indexada (para reativação e anúncios não faz diferença) | Ronaldo | `<head>` |
| 6.7 | GTM: o evento `generate_lead` já sai com `lp: black-friday`. Conferir se as tags de conversão (Meta Lead, GA4, Google Ads) não filtram por `lp` = kids/women | Ronaldo | GTM-K9P4T495 |
| 6.8 | Lighthouse mobile no preview (meta ≥ 90). Página: 35 KB de HTML, imagens WebP com srcset, sem bibliotecas | Ronaldo | Preview |
| 6.9 | Apagar o projeto `alkimi-preview` no Cloudflare depois da aprovação (foi criado só para o preview, porque o projeto `alkimi` publica a partir do Git) | Ronaldo | Cloudflare |

## O que mudou na v2 (pedido do Ronaldo, 02/11)

- Hero: "start Jiu-Jitsu" em destaque grande e dourado; etiqueta "Black Friday" em forma de faixa de Jiu-Jitsu; cartão do contador em destaque logo abaixo (calendário "Mon 30 Nov" + contador grande); 76 avaliações.
- Oferta: Opção 1 em cartão claro e Opção 2 em cartão escuro; etiquetas "Option 1/2" em forma de faixa preta com a ponta vermelha listrada. A faixa também aparece nos cards das turmas, na cor de cada uma.
- Turmas: Toddlers 3–5, Kids 6–14, Women, Fundamentals, Advanced (textos do site).
- Academia: galeria com 9 fotos, grade de horários em HTML (do site) e mapa do Google com endereço, telefone e botão "Get Directions".

## Como foi montado (referência)

- Estrutura da LP da Alliance Carmel Mountain: hero com vídeo → oferta com 2 opções e contador → programas → como reservar → depoimentos → coaches → academia → FAQ → CTA com formulário.
- Identidade: `assets/css/alkimi.css` (mesmos tokens das LPs Kids/Women) + `black-friday/bf.css`. Tema escuro Gunmetal com dourado.
- Formulário e tracking: `assets/js/alkimi.js` sem alteração (UTMs, `generate_lead`, `/tracker` → Meta CAPI + D1). `black-friday/bf.js` cuida do contador, do vídeo (carrega só no clique) e da pré-seleção da opção.
- Imagens: `assets/img/black-friday/` (WebP em 2 larguras + `og-1200x630.jpg`), geradas dos HEIC originais.

## v3 (03/11): identidade nova (Branding Book 2026) e fotos novas do Drive

- Página refeita sem o CSS antigo: só Montserrat, preto/branco/bege/verde militar/nogueira, sem dourado. Detalhes da LP da Alliance: faixa rolando no topo, fitas de faixa no vídeo, cards de foto nas turmas, passo-a-passo com contador fixo.
- Fotos: sessão profissional da pasta do Drive (turmas, COACHES, FACILITY/MERCH), lida pelo link público.
- **Novo pendente (Nicholas):** confirmar a autorização dos pais para as fotos de Toddlers e Kids, que agora mostram rosto (são as mesmas já usadas no Instagram).
- **Novo pendente:** nome, faixa e bio dos 4 coaches das fotos (a LP não chuta nomes).
- Estacionamento: falta o texto.

## v4 (04/11): ajustes do Nicholas

- Fotos indicadas por ele: Toddlers (DSC00469), Kids (DSC03944), Advanced (2.jpg). Coaches de joelhos com fundo preto (DSC07968, DSC07941, DSC07953, DSC07984).
- Academia: saíram as fotos das cadeiras e a do kimono; entraram fotos de treino (DSC05865, 15.jpg, DSC06758).
- Oferta: desconto de almost $400 a year, sem kimono/kit.

## v5 (04/11): vídeo final e copy confirmada

- Hero: vídeo vertical final da Chloe, carregado somente após o clique, com som, controles, `playsinline`, pôster real e track VTT opcional.
- Oferta: FAQ informa preço regular de $265/mês e desconto de $30/mês, comunicado como “almost $400 a year”; o valor mensal final continua pendente.
- Revisão do vídeo: não há repetição das opções nem menção a kit, kimono, uniforme, free trial, free class, refundable ou prazo divergente. O vídeo usa “SAVE ALMOST $400 A YEAR”.

## v6 (05/11): coaches confirmados

- Card 2 identificado como Chloe McNally, black belt e coach da turma feminina.
- Card 4 identificado como Nicholas Meregali, black belt e líder da equipe de coaches da Alkimi.
- Cards 1 e 3 continuam com nome, faixa, turma e bio pendentes de confirmação.

## v7 (05/11): estacionamento, gi e privacidade

- Academy: estacionamento no local confirmado.
- FAQ: gi não é obrigatório na primeira aula; a Alkimi empresta um se necessário.
- Formulário: política de privacidade oficial adicionada ao consentimento.
