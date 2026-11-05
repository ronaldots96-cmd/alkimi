# QA. Checkpoint 1

Data: 15/10/2026. Status: revisão criativa, não entrega final de campanha.

## Executado e verificado

- Projeto novo isolado em `creative/women-motion`. Original Kids e LP de produção preservados.
- TypeScript passou sem erros com o compilador instalado no projeto de referência.
- Bundle Remotion 4.0.534, seis composições e 48 stills renderizados. Storyboards 9:16 e 4:5 inspecionados visualmente, incluindo três estados de cada carrossel.
- Fontes oficiais carregadas com FontFace e bloqueio de render; erro de carregamento não é tratado como fallback silencioso.
- 59 imagens únicas do Drive examinadas por miniaturas. Oito finalistas ampliadas, 16 recortes renderizados. Ajustes de respiro acima das cabeças após a primeira inspeção.
- Inventário online: 69 referências, todas presentes localmente. Nenhum download duplicado necessário.
- Seis vídeos Kids aprovados medidos com ffprobe. Referência visual inspecionada por frames selecionados. Não afirmamos ter assistido integralmente com áudio.
- Estudo mudo Community medido com ffprobe: 540 × 960, 30/1 fps, 852 frames, 28,400 s, H.264, 1.252.439 bytes, sem stream de áudio. Decoder identifica yuvj420p/full-range neste estudo. A normalização de faixa/cor e yuv420p dos masters continua para export final, sem mascarar essa diferença.
- Roteiros falados: Community 60 palavras, Self-defense 63, Confidence 57. Cortes curtos: 19, 16 e 20 palavras. Isso não é medição de duração da fala.
- Copy automática: sem travessões ou duplo hífen, sem oferta de gratuidade. Revisão editorial com foco em convite, apoio e aprendizagem, sem garantia de invulnerabilidade.
- Taxa de US$20 visível durante todo o CTA. CTA implementado estático. Pós-voz de pelo menos 2,4 s ainda depende da gravação real.
- Contrastes teóricos dos pares sólidos entre 6,16:1 e 18,38:1; texto separado das fotos. Não alegar auditoria universal de contraste em interfaces Meta.
- Logo preserva proporção. Destaques dourados em fundos escuros; Deep Rose nos fundos blush para contraste.
- Não houve geração de imagem, voz, vídeo externo ou qualquer consumo de créditos. Não houve publicação ou upload ao Meta.

## Pontos deliberadamente pendentes

- Aprovação dos roteiros, seleção e direção pelo usuário.
- Identificar canal de voz e orçamento; não inferir autorização para consumo pago.
- Narração, alinhamento, loudness, legendas e duração real. O estudo é sem som.
- Refinamento de transições planejadas: esta etapa demonstra estrutura, foto motion e carrossel. Não implementa ainda toda a coreografia sincronizada à narração.
- Cortes de 15 s e A/B de Community em vídeo. O A/B está demonstrado em stills nesta etapa.
- Revisão em velocidade real pelo usuário no estudo e revisão audiovisual completa após a voz. A inspeção automatizada por quadros não substitui a escuta/reprodução final.
- Prévias reais dos posicionamentos Meta e codificação dos masters.

Não há aprovação do Meta nem autorização de publicação implícita nesta entrega.
