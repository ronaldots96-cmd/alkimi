# Alkimi Women Motion

## Revisão narrada v2, 15/10/2026

**Revisão atual: `review/v2/index.html`.** A seção histórica abaixo descreve o checkpoint anterior, preservado para comparação.

Refeitos layouts e ritmo a partir do código e dos frames do Kids aprovado. Fotos principais ampliadas, headlines maiores, troca de mensagens dentro das cenas, carrossel de três imagens, crossfades de seis frames, pausas tipográficas e CTA estável após a voz. O 4:5 tem layout próprio.

| Conceito | Frames a 30 fps | Duração | Formatos |
| --- | --- | --- | --- |
| Community | 704 | 23,4667 s | 1080 × 1920 e 1080 × 1350 |
| Self-defense | 729 | 24,3000 s | 1080 × 1920 e 1080 × 1350 |
| Confidence | 715 | 23,8333 s | 1080 × 1920 e 1080 × 1350 |

Os seis MP4s e três SRTs estão em `review/v2`, com nomes `alkimi_women_<conceito>_v2_<formato>_review.mp4`. São previews narrados em resolução de entrega, não masters com voz aprovada. Nenhuma publicação foi realizada. Cortes de 15 segundos continuam pendentes; não há arquivos fictícios anunciados como entregues.

### Voz e limites

Voz-guia **Kokoro af_bella**, gerada inteiramente no computador, sem API paga, sem imitar Emma e sem alterar velocidade/pitch. A ausência de conector ElevenLabs não foi ocultada. Ela permite revisar montagem e copy; a voz definitiva da campanha ainda precisa de decisão/gravação. Não é correto apresentar estes arquivos como a locução Emma do Kids.

Modelo `onnx-community/Kokoro-82M-v1.0-ONNX`, CPU fp32, velocidade 1. Alinhamento automático local por faster-whisper small.en. Os destaques usam as palavras alinhadas; os timings não representam conferência auditiva humana. Normalização medida com pyloudnorm BS.1770 e pico estimado em oversampling 4×. Limitador local com look-ahead de 10 ms e release de 80 ms. WAVs aproximadamente −16 LUFS, pico estimado até −1 dBTP. Medições do AAC final estão em `review/v2/encoded-media-checks.json`.

Fontes técnicas e licença: [Kokoro.js oficial](https://github.com/hexgrad/kokoro/tree/main/kokoro.js), [modelo ONNX](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX), [modelo original e licença Apache 2.0](https://huggingface.co/hexgrad/Kokoro-82M). Dependências de voz e análise instaladas somente em `_tools`, sem alterar dependências do Kids. Arquivos de modelo ficam no cache local. Zero créditos de geração/transformação pagos.

### Reproduzir a revisão

Executar a partir da pasta `LPs Austin`:

```powershell
node "../Motion Kids/alkimi-motion/node_modules/typescript/bin/tsc" -p creative/women-motion/tsconfig.json
node creative/women-motion/scripts/prepare-v2-images.mjs
node creative/women-motion/scripts/render-v2.mjs --stills --videos
node creative/women-motion/scripts/build-review-v2.mjs
& 'C:/Users/Ronaldo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' creative/women-motion/scripts/verify-v2.py
```

Para renderizar apenas um conceito: acrescentar `--only=community`, `--only=self-defense` ou `--only=confidence`. Para stills sem vídeo, usar apenas `--stills`. Para vídeos sem repetir os stills, usar apenas `--videos`.

Voz já gerada e salva. **Não é necessário gerar novamente** para abrir ou renderizar os vídeos. Se a copy mudar, o pipeline opcional é `generate-voice-guide.mjs`, `align-voice-v2.py`, `normalize-voice-v2.py`, nesta ordem. Gerar a voz novamente recria o JSON e exige repetir o alinhamento e normalização. Não rodar casualmente sobre os WAVs já aprovados. A voz final deve entrar como novo recurso, preservando a guia.

Dados atuais: `data/revision-v2.json` (roteiros), `data/voice-guide-v2.json` (timings/words), `data/photo-crops-v2.json` (recortes). Código atual: `src/v2/index.tsx`. `src/index.tsx` e o review anterior permanecem preservados. A dependência local do Remotion Kids continua necessária para renderizar; a página HTML de revisão e os MP4s abrem independentemente dele.

### Verificação e escopo

TypeScript, seis storyboards, três estados do carrossel por conceito, frames de referência, presença de áudio, stream/codecs, duração, CFR e inspeção automática de todos os frames. CTA sem alteração perceptível nos últimos 75 frames, com endpoint lossless idêntico verificado na composição Community. Evidências e limites em `review/v2/qa-report.md`. Escuta humana em celular, aprovação da atuação vocal e prévia real do Meta permanecem pendentes.

## Histórico: checkpoint 1

Checkpoint 1, 15/10/2026. Projeto de revisão isolado. Nenhuma LP, automação ou arquivo Kids aprovado foi alterado.

## Abrir a revisão

Abra `review/index.html` no navegador. A página reúne os três roteiros, seis storyboards, recortes, inventário e o estudo de Community.

- Community é o conceito prioritário. Abertura A com IMG_4206; abertura B só com lettering e a mesma mensagem.
- Self-defense é a segunda frente, centrada em aprender habilidades, sem cenas de ameaça ou garantia de proteção.
- Confidence é a terceira frente, apoiada em prática e comunidade.

## Estado real

Implementadas seis composições Remotion de revisão, 1080 × 1920 e 1080 × 1350, 30 fps. Stills renderizados em meia escala para revisão. Tempos editoriais estimados: 28,4 s, 30,4 s e 28,6 s. Não são tempos medidos de uma voz.

O vídeo `review/previews/community-motion-study-silent.mp4` é mudo, 540 × 960, 30 fps e 28,4 s. Não é master de campanha. As edições de 15 s estão roteirizadas, mas ainda não implementadas nem renderizadas. Não foram criadas legendas artificiais a partir de tempos estimados.

Nenhuma voz ou imagem foi gerada nesta etapa. Nenhum crédito de geração consumido. Nenhum conector de voz disponível foi identificado na consulta de ferramentas da sessão. Antes da voz final: aprovar copy, identificar canal disponível e confirmar orçamento. Uma gravação fornecida pelo usuário também pode ser importada.

## Dependências e comandos

Os scripts reutilizam o Node e as dependências existentes no projeto Kids, sem instalar ou atualizar pacotes e sem editar aquele projeto. Remotion 4.0.534. Fontes e logo são cópias locais oficiais. A pasta nova não é autossuficiente enquanto essa dependência local existir.

Executar a partir de `C:\Users\Ronaldo\Desktop\Projetos\Meregali\Alkimi\LPs Austin`:

```powershell
node creative/women-motion/scripts/prepare-review.mjs
node creative/women-motion/scripts/prepare-selected.mjs
node "../Motion Kids/alkimi-motion/node_modules/typescript/bin/tsc" -p creative/women-motion/tsconfig.json
node creative/women-motion/scripts/render-review.mjs --motion
node creative/women-motion/scripts/build-review-page.mjs
```

`prepare-review.mjs` recompõe inventário visual e amostras da referência, não precisa ser repetido sem mudança dos materiais. `prepare-selected.mjs` só produz os 16 derivados das oito finalistas. O script de render gera storyboards por padrão; `--motion` adiciona o estudo mudo, `--extras` restringe aos dois stills de abertura/área segura. O bundle está em `_cache/bundle`.

Não há comando de master final aprovado ainda: áudio, durações finais e edições curtas dependem da etapa seguinte. Não apresentar os estudos como finais.

## Arquivos editáveis

- `data/edit-plan.json`: roteiro falado, headlines, cenas, IDs, tempos provisórios e cortes curtos.
- `data/photos.json`: manifesto efetivo de recortes, fontes, hashes, pontuação e derivados. Este arquivo inclui as correções de headroom feitas após revisão.
- `data/photo-selection.json`: primeira proposta de seleção. Correções de headroom ficam explícitas em `prepare-selected.mjs`; o manifesto gerado é a fonte para conferir os recortes efetivos.
- `src/index.tsx`: layouts por formato, fotos, carrossel, tipografia, CTA, fontes e área segura.
- `review/scripts-for-approval.md`: copy consolidada para aprovação.
- `review/checkpoint-1-checks.json`: verificações automáticas de copy, inventário e contraste.
- `review/qa-checkpoint-1.md`: evidências e pendências.

## Fontes e divergências

LP local Women consultada em 15/10/2026. Documento HOOKS obtido no Drive, última modificação informada em 30/09/2026; texto preservado em `review/sources`. O HOOKS menciona Poppins e uma entrada semi-private antes da academia mista. Não importamos esses elementos: usamos Montserrat/Fustat da marca e a aula feminina atual descrita na LP.

Brand Identity Guidelines 2025 localizado em `C:\Users\Ronaldo\Desktop\Projetos\Meregali\Alkimi\ALKIMI.pdf`. Consultados texto integral já extraído e contact sheet de páginas 4, 9, 11, 14, 16 e 18 existentes no projeto aprovado. A família rosa é a adaptação já aplicada na LP Women, não uma cor atribuída indevidamente ao manual. O slogan antigo do manual não foi usado.

Fotos originais intactas. 69 posições de arquivo no Drive, 59 imagens únicas, sem delta faltante na cópia local. Todas as 59 foram examinadas por contact sheets, além das seis imagens da LP. Oito finalistas foram ampliadas. Cinco tier A, três tier B, três reservas identificadas. Demais imagens não selecionadas para esta rodada; não foram reclassificadas com as notas do projeto Kids.

Consentimentos: reaproveitamento de materiais fornecidos/aprovados pelo usuário, sem introduzir imagens de crianças nesta produção. Não foi feita auditoria de documentos individuais de cessão de imagem adulta. Isso é registro de escopo, não uma reprovação das fotos aprovadas.

## Continuidade

Após revisão de copy e direção: definir voz e custo; gerar/importar apenas áudio aprovado; alinhar palavras e tempos; refinar transições e animação de lettering; montar 15 s e SRTs; renderizar masters; revisar com som e nos posicionamentos. Meta permanece fora do escopo de publicação.
