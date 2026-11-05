# Onboarding visual Figma

Prompt para colar em uma nova sessão do Claude Code. Preencha os campos entre `{chaves}` antes de enviar.

---

## Prompt

Atue como um web designer sênior especialista em Figma e design systems. Vamos rodar o processo **Onboarding visual Figma** para o cliente **{CLIENTE}**.

### Entradas
- **Pasta do Figma (Testes):** {URL_DA_PASTA_FIGMA} (formato `figma.com/files/team/{teamId}/project/{projectId}`)
- **Pastas locais do cliente** (brandbook, logos, fontes, fotos, LPs, CSS): {CAMINHOS_LOCAIS}
- **Documento de ganchos/copies para ads (opcional):** {CAMINHO_DOC_HOOKS}
- **Ads existentes para recriar (opcional):** {CAMINHO_ADS_EXISTENTES}
- **Pasta do Drive para entrega (opcional):** {URL_PASTA_DRIVE}
- **Nome do arquivo e da biblioteca:** {NOME_ARQUIVO} (ex.: `{cliente}-ds`)
- **Sub-marcas/públicos que precisam de tema próprio:** {EX.: Kids / Women / Men}

### Etapa 0 · Pré-checagem (antes de criar qualquer coisa)
1. Carregue as skills do Figma MCP: `figma-use`, `figma-generate-library`, `figma-create-new-file` e `figma-generate-design`. Se não houver plugin, leia via `get_figma_skill` (`skill://figma/<nome>/SKILL.md`).
2. Rode `whoami` e confira:
   - o `team::{teamId}` da pasta aparece nos planos da conta conectada;
   - o assento é **Full** e o plano é **Professional ou superior**.

   O plano Starter só permite 3 páginas por arquivo e 1 modo por coleção de variáveis, tem limite baixo de chamadas e não publica biblioteca.
3. Se a conta não tiver acesso à pasta ou o plano não servir, **pare e me avise** para eu trocar a conta do conector. Não crie o arquivo em rascunhos sem perguntar.

### Etapa 1 · Descoberta e novo arquivo
1. Varra as pastas locais e monte o inventário da marca:
   - **cores** (hex + nome);
   - **tipografia** (famílias e pesos);
   - **logos** (SVG preferencialmente);
   - **ícones**, **fotos** e **regras do brandbook** (o que pode e o que não pode);
   - **padrões visuais recorrentes** (cantos, grafismos, gradientes).
   - Se houver CSS/LP, use os tokens do código como fonte da verdade e cite o arquivo.
2. Confira as fontes no Figma (`listAvailableFontsAsync`), incluindo o nome exato de cada estilo.
3. Me mostre um **checklist de escopo** antes de criar: tokens, estilos, lista de componentes, páginas, temas, ads previstos. Siga só depois do meu ok.
4. Crie o arquivo `{NOME_ARQUIVO}` com `create_new_file`, usando `planKey` + `projectId` da pasta.

### Etapa 2 · Design system no Figma
Estrutura de páginas: `Cover · ——— · Foundations · Logo · Components · Imagery · ——— · Applications · ——— · Ads`.

**Variáveis:**
- `Primitives` (modo único, scopes `[]`, code syntax `var(--x)` quando houver CSS).
- `Theme` com **um modo por sub-marca/público**. Tokens semânticos (`color/bg/page`, `bg/alt`, `bg/strong`, `text/primary`, `text/soft`, `text/on-strong`, `accent/*`, `border/default`) com alias para os primitivos e scopes específicos.
- `Layout` com raios/cortes, espaçamentos e largura máxima.

**Estilos:**
- Texto: escala de headings, body, labels e estilos `Ad/*` para canvas de 1080px (Hook, Hook Compact, Promise, Body, Eyebrow, Tag).
- Paint: gradientes da marca. Gradiente não vira variável.

**Componentes**, todos com propriedades de texto e descrição de uso:
- Logo (tipo × cor), ícone da marca, Button/CTA (tamanho × estado), Photo (proporção × recorte), Tag (tons), Carousel Dots.
- List item, Step, Rating, Quote Card, FAQ (aberto/fechado), Form Field (padrão/foco), Fee/Offer box, Callout.
- Adapte a lista ao que a marca realmente usa.

**Imagery:** cada foto vira componente `Image/<grupo>/<nome>`, com nota de autorização de uso de imagem.

**Applications:** hero e CTA final da LP por público. Use **o mesmo frame com modo de tema trocado**, para provar que os modos funcionam.

**Foundations:** paleta ligada às variáveis, painéis de tema lado a lado (um por modo), exemplos de tipografia e regras da marca.

**Gotchas já conhecidos (aplique sempre):**
- Um `setCurrentPageAsync` por chamada. Chamadas `use_figma` estritamente **sequenciais**. Retorne todos os IDs criados e salve um ledger de IDs no scratchpad.
- Vetores novos vêm com **contorno preto padrão**: defina `strokes = []`.
- `setBoundVariableForPaint` **zera a opacidade** da pintura: reaplique `{...paint, opacity}` depois de vincular.
- `resize()` em auto-layout volta o eixo para **FIXED**: depois do resize, defina `primaryAxisSizingMode = 'AUTO'`.
- Formas que o Figma não tem nativamente (ex.: canto chanfrado) viram vetor com `constraints STRETCH` atrás do conteúdo.
- O Figma **não decodifica WebP** enviado pelo `upload_assets`: converta para JPG/PNG. HEIC: converta com `pillow-heif` e corrija a orientação EXIF.
- APIs que não funcionam: renomear o arquivo (`figma.root.name`), `setFileThumbnailNodeAsync`, `figma.notify`, publicar biblioteca.
- Valide cada etapa com print (`get_screenshot` ou `node.screenshot()`) e corrija texto cortado, sobreposição e baixo contraste antes de seguir.

### Etapa 3 · Publicar a biblioteca
A publicação não é possível via API. Ao terminar o DS:
1. Faça a revisão final: componentes sem instâncias soltas, descrições preenchidas, variáveis com scopes e nada de placeholder pendente sem marcação.
2. Me passe o passo a passo:
   1. Renomear o arquivo para `{NOME_ARQUIVO}`.
   2. Abrir o painel Assets, clicar no ícone de livro e em **Publish**.
   3. Conferir o que entra na publicação: variáveis, estilos e componentes.
3. Depois que eu confirmar, verifique com `get_libraries`/`search_design_system` que a biblioteca aparece para o time.

### Etapa 4 · Modelos de ads com o design system
Crie as páginas `Ads · …` no mesmo arquivo, montadas **só com instâncias, estilos e variáveis do DS**.

**Formatos:**
- Feed 4:5 (1080×1350), Story 9:16 (1080×1920) e Quadrado 1:1 (1080×1080).
- No story, mantenha a área segura do Meta: ~270px livres no topo e ~380px na base.

**Famílias de criativos:**
- **Só texto + fundo sólido:** etiqueta do público, gancho grande em caixa alta com a frase-chave na cor de destaque, fio da marca, promessa com o trecho principal em negrito, CTA e logo. Use 2 cores de fundo por público.
- **Com foto:** gancho no terço superior, foto no componente Photo, promessa, e uma linha com CTA e logo.
- **Recriação de ads existentes:** quando houver, mantenha a copy e a estrutura e troque os elementos pelos componentes do DS. Carrossel com continuidade visual entre os slides (fio/grafismo atravessando), Carousel Dots e "Swipe →".

**Regras de copy:**
- **Sem travessões (—)**: reescreva com ponto, vírgula ou dois-pontos.
- CTA coerente com a oferta da LP: nada de "free" se a aula é paga.
- Gancho com 8 a 10 palavras.

**Checagens automáticas:**
- Calcule a altura usada em cada frame e reduza o gancho até caber nas áreas seguras.
- Nas artes com foto, mantenha a foto com altura mínima legível.
- Nomeie os frames como `{Família} · {Público} {n} · {Variante} · {Formato WxH}`.

**Sinalize, sem inventar:**
- fotos que faltam para um público: quadro "FOTO PENDENTE" com a direção de cena;
- autorização de uso de imagem;
- conflitos entre o doc de ganchos e o brandbook (fonte, cores).

### Etapa 5 · Exportação (se houver pasta do Drive)
1. Exporte cada frame em PNG no tamanho real: `get_screenshot` com `maxDimension` ≥ maior lado e `contentsOnly: true`, depois `curl` da URL.
2. Salve numa pasta local espelhando a estrutura (família/público) e confira com `file` que todos são PNG nas dimensões certas.
3. Crie as subpastas no Drive pelo conector.
4. Envie os arquivos pelo Claude in Chrome (`file_upload`, até 10 MB por chamada). O conector do Drive exige o arquivo em base64 e não serve para dezenas de imagens. Se não der, me peça para arrastar as pastas.

### Entrega final
Ao final, me responda com:
- links do arquivo e de cada página;
- contagem de variáveis, estilos e componentes;
- número de artes por formato;
- pendências: publicação, fotos faltantes, autorizações e decisões tomadas que eu possa querer mudar.
