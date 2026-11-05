# Alkimi Women. Revisão narrada v2

15/10/2026. Arquivos para revisão, sem publicação e sem alegação de aprovação de campanha.

## Diagnóstico e correção

O estudo anterior era mudo e repetia fotografias em painéis de 850 × 520, com hierarquia menor que a do Kids. A correção tomou como referência o código das cenas, fontes, timing, PhotoMotion e TrainingCarousel do Kids aprovado, além de frames extraídos. Não foi uma reprodução auditiva integral da referência.

Recompostos os seis layouts com fotografia dominante, headlines maiores, trocas de mensagem dentro das cenas, três fotos por carrossel, crossfades de seis frames e pausas tipográficas. Community continua prioritário; Self-defense foi mantido como segunda frente. A taxa é visível no CTA.

## Vídeos efetivamente gerados e verificados

| Arquivo | Resolução | Frames | Duração | AAC estéreo LUFS | Tamanho |
| --- | --- | --- | --- | --- | --- |
| alkimi_women_community_v2_9x16_review.mp4 | 1080 × 1920 | 704 | 23.467 s | -16.03 | 9.94 MB |
| alkimi_women_community_v2_4x5_review.mp4 | 1080 × 1350 | 704 | 23.467 s | -16.03 | 9.29 MB |
| alkimi_women_self_defense_v2_9x16_review.mp4 | 1080 × 1920 | 729 | 24.320 s | -16.03 | 8.38 MB |
| alkimi_women_self_defense_v2_4x5_review.mp4 | 1080 × 1350 | 729 | 24.320 s | -16.03 | 8.08 MB |
| alkimi_women_confidence_v2_9x16_review.mp4 | 1080 × 1920 | 715 | 23.851 s | -16.03 | 8.43 MB |
| alkimi_women_confidence_v2_4x5_review.mp4 | 1080 × 1350 | 715 | 23.851 s | -16.03 | 8.21 MB |

H.264, yuv420p, BT.709, AAC estéreo a 48 kHz, 30 fps constantes. Preset de render CRF 19 e bitrate AAC solicitado de 192 kbps. Faststart, átomo moov antes de mdat: confirmado nos seis arquivos. Não foi feita recompressão posterior do vídeo.

## QA executado

- TypeScript: exit code 0. Fontes oficiais Montserrat 300/500 e Fustat 400/500/600 carregadas via FontFace e delayRender. Sem fallback silencioso. Peso 500 mantido da referência visual Kids/brandbook, não confundido com 600.
- Seis storyboards inspecionados, com fotos, lettering, CTA e três estados do carrossel. As fotos e os recortes finais foram vistos em cada formato.
- Todos os frames dos seis MP4s decodificados. Contagem exata, PTS com intervalo de 1/30 s e nenhuma tela quase preta detectada pelo teste automatizado. Esse teste não substitui avaliação humana de ritmo.
- Timelines contíguas; assets, logo e fontes encontrados. Nenhum overlay de debug habilitado. Links da página de revisão conferidos.
- Alinhamento local por palavra, com destaques vinculados aos inícios detectados. Transcrição local compatível com a copy. Não afirmamos tolerância de dois frames comprovada por escuta humana.
- CTA com 2.525 s após a voz. Endpoints lossless dos últimos 75 frames de Community idênticos. Nos seis encodes, diferenças médias entre frames finais inferiores a 0,12 nível em escala 0–255, compatíveis com compressão.
- Headline e narração em inglês, oferta sem gratuidade, sem travessões na copy e sem promessas de proteção garantida. Revisão visual dos textos nos seis storyboards e verificação automatizada dos roteiros/SRTs.
- IA visual: nenhuma imagem gerada nesta revisão. Fotografias reais, mesmas origens aprovadas. Nenhum material de aluno usado para representar ansiedade ou sofrimento.
- Voz-guia sintetizada localmente, não Emma. Nenhum crédito de geração ou transformação pago. Sem música. WAV e AAC medidos; pico estimado do AAC abaixo de −3,9 dBTP, loudness estéreo aproximadamente −16,03 LUFS.
- Versões anteriores, Kids e fotos originais preservados. Arquivos novos restritos à pasta creative/women-motion. Nenhuma alteração de LP, automação, formulário ou campanha.

## Fotografias

8 fotos únicas entre os três conceitos. Fonte detalhada em data/photos.json; crops desta revisão em data/photo-crops-v2.json. A revisão aproveitou a curadoria anterior: 59 imagens únicas analisadas, oito selecionadas, cinco tier A e três B. Não repetiu o download ou a classificação sem necessidade.

- community: D051, D016, D002, D011, D005, D055, D049. 3 fotos no carrossel, 3.60 s.
- self-defense: D049, D011, D002, D016, D054, D055. 3 fotos no carrossel, 3.40 s.
- confidence: D016, D002, D011, D005, D054, D055. 3 fotos no carrossel, 3.60 s.

Não são atribuídos nomes ou parentesco às pessoas retratadas. Materiais fornecidos/aprovados pelo usuário; não foi realizada auditoria documental independente de cessões de imagem adulta.

## Pendências explícitas

- Voz/atuação de campanha ainda não aprovada. A guia af_bella não reproduz a Emma do Kids. Integrar gravação final autorizada e repetir alinhamento/render quando definida.
- Escuta integral humana em celular e avaliação em velocidade real pelo cliente. Esta execução teve inspeção de frames, código, transcrição e medições; não alegamos uma escuta que não ocorreu.
- Prévia real do Meta e conferência da interface em cada posicionamento. Área segura conservadora é referência, não garantia de compatibilidade universal.
- Cortes de 15 s e vídeo da alternativa de abertura tipográfica não entregues nesta rodada. A alternativa Community existe como still.

## Evidências

- probes.json: streams e metadados de ffprobe.
- encoded-media-checks.json: todos os frames e medições do AAC.
- qa-checks.json: caminhos, copy, streams, faststart e assets.
- cta-hold-check.json: comparação lossless do hold.
- ../voice-guide-v2-measurements.json: medições dos WAVs.
- ../../data/voice-guide-v2.json: roteiro, segmentos e palavras alinhadas.
- ../../README.md: comandos, fontes e limitações.
