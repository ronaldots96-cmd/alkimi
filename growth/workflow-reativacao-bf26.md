# GoHighLevel | Workflow de reativação Black Friday (BF26)

Roteiro para montar no editor de workflows. Atualizado em 04/11/2026 com a oferta confirmada nos áudios do Nicholas de 03/11 e com a leitura do GHL.

**A montagem e os envios só começam com o ok do Ronaldo.**

## Oferta

- **Começar em novembro:** $30 de desconto por mês, comunicado como "save almost $400 a year".
- **Começar em janeiro:** depósito de $100 que trava o mesmo desconto e é creditado na matrícula.
- **Prazo:** 30/11/2026, 23h59 (Central).
- **Fora da oferta:** kimono e uniforme. Com kit, o preço teria de ficar no valor normal.
- **Não usar:** "refundable", "$400" sem o "almost", "free trial", "free class".

**A confirmar com o Nicholas**
- Mensalidade final. A conta dá $235 ($265 − $30), mas no áudio ele cita 225, 235 e 215, e a transcrição desse trecho pode ter erro.
- Regra do depósito: o que acontece se a pessoa desistir e até quando precisa começar.

---

## 0. Preparação

**Custom Values**

| Nome | Valor |
|---|---|
| `bf26_link` | URL da LP em produção (pendente) |
| `bf26_deposit_link` | Link de pagamento de $100 (pendente) |
| `video_chloe_intro` | Vídeo 1 da Chloe (em edição) |
| `video_chloe_offer` | Vídeo da oferta (quando pronto) |

**Tags**
- `bf26-winback`: gatilho de entrada.
- `bf26-in-sequence`, `bf26-replied`, `bf26-no-reply`, `bf26-deposit`: estado.
- `bf26-old`, `bf26-new`, `bf26-events`: pipeline de origem.
- `bf26-parents`, `bf26-adults`: versão da mensagem. As tags `kid` e `adult` não aparecem nos 900 contatos lidos, por isso não servem de condição.
- `bf26-not-interested`: versão reduzida.
- `bf26-manual`: lead que a Chloe já está trabalhando com a oferta. Não entra na sequência.

**Antes de publicar**
- Tirar os contatos da sequência antiga. **NEW AUTOMATION - Cold Leads Workflow** tinha 29 contatos ativos em 04/11, e **Stop on response** está desligado nele e no **Warm Leads Workflow**.
- Combinar com a agência quem envia Black Friday na conta, para o mesmo lead não receber as duas sequências.
- Criar a etapa **JANUARY DEPOSIT** nas pipelines OLD e NEW.
- Confirmar o limite diário de SMS do número (A2P).

---

## 1. Workflow "[BF26] Win-back · Sequence"

**Gatilho:** tag `bf26-winback` adicionada.

**Filtros de entrada:** não entra quem tiver `bf26-manual`, `signed up` ou `sign up`.

**Settings**
- Allow re-entry: off.
- Stop on response: on.
- Envio: segunda a sábado, das 9h às 19h (America/Chicago).

**Passos**

| Quando | Canal | Mensagem |
|---|---|---|
| D0 adultos | SMS | Hi {{contact.first_name}}, it's Chloe from Alkimi Jiu Jitsu in South Austin. You asked about classes a while back. Our best offer of the year just opened. Want the details? Reply STOP to opt out. |
| D0 pais | SMS | Hi {{contact.first_name}}, it's Chloe from Alkimi Jiu Jitsu in South Austin. You asked about kids classes a while back. Our best offer of the year just opened. Want the details? Reply STOP to opt out. |
| D0, +10 min | E-mail | Assunto: Still thinking about jiu jitsu? · Apresentação curta, Vídeo 1 quando estiver pronto, link da oferta |
| D2 | SMS | Start this November and save almost $400 a year, or put down $100 and start in January with the same discount. Details: {{custom_values.bf26_link}} |
| D2 | E-mail | Assunto: Two ways to save this November · As duas opções, vídeo da oferta, link |
| D5 | SMS | Quick question, {{contact.first_name}}: what's been holding you back? Schedule, price or timing? One word is fine. |
| D8 | SMS | Holidays too busy? $100 locks in the discount and it's credited when you start in January. Want the link? |
| 27/11 | SMS e e-mail | Black Friday at Alkimi: save almost $400 a year, or lock it in for January with $100. Ends Monday. {{custom_values.bf26_link}} |
| 30/11 | SMS | Last day, {{contact.first_name}}. The Alkimi offer ends tonight at 11:59 pm Central. {{custom_values.bf26_link}} |

Ao terminar: remover `bf26-in-sequence` e adicionar `bf26-no-reply`.

**Not Interested** (`bf26-not-interested`): e-mail em D0, D2 e 27/11, e um único SMS em D2.

Os textos em inglês precisam de revisão da Chloe antes de publicar.

---

## 2. Workflow "[BF26] Win-back · Reply"

**Gatilho:** Customer Replied, com a tag `bf26-in-sequence`.

1. Remover `bf26-in-sequence` e adicionar `bf26-replied`.
2. Mover o card para Hot Leads no pipeline de origem.
3. Atribuir à Chloe.
4. Notificar a Chloe: "BF26 reply from {{contact.name}}. Reply within 1 hour."
5. Criar tarefa com vencimento em 1 hora.

**Resposta pronta para a Chloe:** 54 leads vieram das campanhas "$15 Week" e "10 Days Free". Se alguém citar essas ofertas, a resposta precisa estar combinada antes do primeiro lote.

---

## 3. Depósito pago

Até existir um gatilho de pagamento, a Chloe move o card para **JANUARY DEPOSIT**, adiciona `bf26-deposit` e anota a data de início.

Com o pagamento dentro do GHL, o gatilho **Payment Received** faz isso sozinho.

---

## 4. Lotes (50 por dia)

| Data | Público | Quantos |
|---|---|---|
| Na semana do lançamento | Mornos, com mensagem pessoal da Chloe e tag `bf26-manual` | 26 |
| Seg, 09/11 | Frios, a começar pelos mais recentes | 50 |
| Ter, 10/11 | Frios | 50 |
| Qua, 11/11 | Frios | 50 |
| Qui, 12/11 | Frios restantes + Not Interested | 5 + 45 |
| Sex, 13/11 | Not Interested restantes | 32 |
| — | Importados do Gymdesk (77) | Só depois de o Nicholas confirmar quem são |
| — | Contatos sem card (196 com telefone) | Fora, até validar |

As quantidades mudam conforme a base se mover. Antes de cada lote, excluir quem respondeu, quem tem opt-out por canal (`dndSettings`) e quem já é aluno.

**Regra de pausa:** se os pedidos de saída de um lote passarem de 5%, parar e rever o texto.

---

## 5. O que medir

- Resposta por lote e por mensagem.
- Resposta → aula experimental agendada.
- Aula experimental → matrícula ou depósito.
- Pedidos de saída por lote.

**Meta (KR O3):** 15% de resposta, 20 aulas experimentais e 8 matrículas ou depósitos.

---

## Pendências para publicar

- [ ] Mensalidade final e regra do depósito (Nicholas)
- [ ] `bf26_deposit_link` (Nicholas)
- [ ] `bf26_link`: LP em produção
- [ ] Combinado com a agência sobre os envios de BF
- [ ] Sequência antiga de frios tratada
- [ ] Limite diário de SMS confirmado
- [ ] Revisão dos textos pela Chloe
- [ ] Etapa JANUARY DEPOSIT criada
