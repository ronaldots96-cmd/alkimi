# alkimi

Landing pages Kids e Women da Alkimi Jiu-Jitsu (South Austin).

Estrutura visual das duas landing pages das campanhas de Austin, em HTML + CSS puro (sem framework, sem dependência externa). Copy final em inglês, igual à rev. 11 do doc "Expansão Austin — Mercado, Keywords e Landing Pages (Kids & Women)".

## Como abrir

- `kids/index.html` e `women/index.html` abrem direto no navegador (duplo clique).
- Para publicar no Cloudflare Pages, sobe a pasta inteira: as páginas ficam em `/kids/` e `/women/`.

## Estrutura

```
kids/index.html        LP Kids (tema claro: Ice White + Jungle Green)
women/index.html       LP Women (família rosé: Blush + Old Rose + Deep Rose, com Gunmetal)
assets/css/alkimi.css  estilos compartilhados (tokens do brand book no topo)
assets/js/alkimi.js    interações (nav, reveals, marquee, CTA fixo no mobile, formulário)
assets/img/            fotos em WEBP (2 larguras por foto, via srcset), da pasta "ADS FOTOS / Fotos Ads" do Drive
assets/fonts/          Montserrat + Fustat (self-hosted, licença SIL OFL)
assets/alkimi-logo.svg / alkimi-icon.svg   logo e ícone vetoriais extraídos do brand book
```

## Identidade aplicada (brand book)

- Cores: Gunmetal #0D0F12, Ice White #F8FAFF, Jungle Green #1C332C, Light Gray #E7E7E7, gradiente Gold #F9E199 → #795D31 (só em CTA, numeração e linhas).
- LP Women (pedido do Nicholas, 03/10): o verde foi trocado por rosé elegante, nunca pink: Blush #F2E3E0, Old Rose #D8B4B0, Deep Rose #5E3A44. Gunmetal e dourado seguem iguais.
- Tipografia: Montserrat (títulos, pesos 300/400/500) + Fustat (texto).
- Logo vetorial original; slogan "Discipline Is The Gold Within" **não** usado (rejeitado pelo Nicholas).
- Canto chanfrado em fotos, botões e cards: ecoa o corte angular do símbolo da Alkimi.

## Animações e de onde vieram (pasta "Sites para referência")

| Efeito | Onde | Referência |
|---|---|---|
| Headline subindo por máscara | Hero | `animations-gemini` (textSlide) |
| Foto revelada de baixo pra cima com leve zoom | Hero e fotos das seções | `instagram-slides` (clip-reveal) + `barbershop-landing` (heroImgReveal) |
| Contorno do símbolo Alkimi desenhado em dourado ao fundo | Hero | `animations-gemini2` (dash-draw) + capa do brand book |
| Brilho passando no botão dourado | CTAs principais | `animations-gemini` (shimmer) |
| Entrada com blur | Títulos e textos-chave | `animations-gemini` / `finex` (animationIn) |
| Faixa de fotos rolando em loop | LP Kids | `barbershop-landing` / `animation-clean` (marquee) |
| Card do formulário entrando em 3D leve | CTA final | `pagina-de-captura` (card-entrance) |
| Nav com blur ao rolar | Topo | `barbershop-landing` (nav.scrolled) |

Tudo respeita "reduzir movimento" do sistema (prefers-reduced-motion).

## Copy da seção de professores (03/10)

A seção 4 das duas LPs deixou de ancorar a autoridade no Nicholas. O foco agora é a academia e os professores (Kids: professores especialistas em crianças; Women: professora mulher, turma 100% feminina), e o Nicholas aparece em segundo plano como quem seleciona os coaches.

## LP Kids, revisão de 04/10

- CTAs sem preço ("Book Your Trial Class"); o valor de $20 aparece no formulário, na lista "o que esperar" e no FAQ.
- Seção 3 virou "How the class works", 100% prática (04/10): primeiro dia (kimono, faixa, como a aula funciona), estrutura de toda aula, turmas pequenas por idade e acompanhamento dos pais.
- Gatilhos emocionais (autoconsciência; respeito e autocontrole) guardados no doc para usar em outra seção.
- Formulário das duas LPs com box destacado: "$20 trial class", abatido da mensalidade na matrícula.
- Seção de professores sem citar o Nicholas, focada no lado emocional; o hero da Kids também não cita mais o Nicholas.
- CTA final: "Start your child's transformation today", com disciplina, limites, respeito, autocontrole e autoconfiança.

## Revisão com o Nicholas (04/10)

- Kids, seção 2: reforça os ganhos emocionais (disciplina, respeito pelos pais e mais velhos, autocontrole, autoconfiança), não só bullying.
- Kids, seção 3: acompanhamento dos pais confirmado (orientação antes da aula, conversa durante e depois); 3 turmas por idade; aula de 1 hora.
- Kids, seção 4: professores com mais de 5 anos ensinando crianças.
- Seção 5 (Kids e Women): saiu o "pague os $20". Agora a pessoa envia os dados e o time da Alkimi liga para marcar a aula experimental.
- FAQ Kids: 3 turmas (3 a 5, 6 a 9, 10 a 15) e aula de 1 hora.
- Formulário (Kids e Women): entrou email, saiu "best day and time".

## Fotos da LP Kids (troca de 04/10)

- Hero: professora fazendo high-five com aluna (`kids-hero-coach`, gerada do original IMG_2500 em alta).
- Seção 2: turma sentada em fila (IMG_5440, `kids-sitting-line`).
- Seção 3: foto que antes estava em "What to expect" (`kids-first-class`).
- Seção 4: foto que antes era do hero (professor e aluno amarrando a faixa, `kids-hero`).
- Seção 5: professor guiando dois alunos no chão (IMG_4984, `kids-coach-drill`).
- Carrossel: 4 fotos novas (`kids-mat-11` a `kids-mat-14`: IMG_5428, IMG_5440, IMG_4984 e a foto das duas alunas rindo).
- Todas as fotos novas foram convertidas de HEIC/JPG para WEBP em 2 larguras.

## Formulário e captação de leads

- Cada envio vai por POST para a URL em `data-webhook` do `<form>` (no `build.py`: `WEBHOOK_URL`). Funciona com n8n (nó Webhook) ou com Google Apps Script.
- Campos ocultos preenchidos automaticamente: `lp` (kids/women), `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `landing_page`, `referrer`, e `submitted_at` no envio. As UTMs do clique ficam guardadas na visita, então valem mesmo se a pessoa recarregar a página.
- O envio também dispara o evento `generate_lead` no dataLayer, pronto para as tags de conversão do Google Ads e do Meta no GTM.
- `automation/google-sheets-webhook.gs`: script pronto para a planilha de leads (instruções no topo do arquivo). Cria a aba "Leads" com cabeçalho e colunas `status` e `notes` para o time do Nicholas acompanhar.
- Enquanto `data-webhook` estiver vazio, o formulário mostra a confirmação mas **não envia o lead** (aviso no console).

## Pendências antes de ir ao ar (marcadas em amarelo nas páginas)

- [x] Nota e nº de avaliações no Google: 5.0 com 41 avaliações (03/10), com link pro perfil
- [x] Faixa etária do programa kids: 3 turmas, 3 a 5, 6 a 9 e 10 a 15 (04/10)
- [x] Duração da aula kids: 1 hora (04/10)
- [x] Formato da turma de mulheres: confirmado 100% feminina, com professora mulher (03/10)
- [x] Depoimentos: trechos literais de avaliações reais do Google (03/10). Kids não tem nenhuma avaliação específica sobre a turma infantil ainda; vale pedir avaliações aos pais e trocar quando surgirem
- [x] Endereço e telefone no rodapé (dados do perfil do Google)
- [ ] Confirmar se existe área para os pais assistirem ao lado do tatame (texto aprovado cita isso)
- [x] Acompanhamento dos pais: orientação antes da aula e conversa durante e depois (04/10)
- [x] Taxa de US$20: confirmada como taxa de compromisso, abatida da primeira mensalidade se o aluno continuar (03/10, já no FAQ)
- [ ] Publicar o Apps Script (ou fluxo n8n) da planilha de leads e colar a URL em `WEBHOOK_URL` / `data-webhook`
- [ ] Tags de tracking (GTM / GA4 354851538 / Meta Pixel) e eventos de conversão do Google Ads e Meta no envio do formulário
- [ ] **Autorização de uso de imagem**: confirmar com a Alkimi que há consentimento dos responsáveis para usar as fotos das crianças em anúncio e LP, e das alunas na LP Women

## Performance (03/10)

- Todas as fotos em WEBP, geradas dos originais em 2 larguras; o navegador baixa só a que precisa (srcset/sizes).
- Imagens da página inteira: Kids ~1,1 MB → ~0,3–0,5 MB; Women ~1,0 MB → ~0,2–0,45 MB (mobile / desktop).
- Hero com preload responsivo; fotos das seções carregam antes de aparecer e só animam depois de decodificadas; faixa de fotos da Kids carrega quando está a ~1 tela de distância.

## Fotos usadas

Todas vêm da pasta do Drive "ADS FOTOS / Fotos Ads" (compartilhada pelo Nicholas). Originais em HEIC/JPG foram convertidos, recortados e comprimidos em WEBP (~1,4 MB no total, somando todas as larguras).
