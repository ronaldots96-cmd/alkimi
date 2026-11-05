# Alkimi | Plano de migração do GoHighLevel

Rascunho de 04/11/2026. A sub-conta atual fica com a agência, então a Alkimi precisa de uma conta própria.

**Recomendação:** rodar a Black Friday inteira na conta atual e virar para a conta nova entre 01 e 07/12. Preparar tudo em paralelo a partir de agora.

## O que muda de dono

| Item | Hoje | Depois | Risco |
|---|---|---|---|
| Conta | Sub-conta em modo SaaS sob a agência (`app.connectionads.com`) | Conta da Alkimi | Contas e custos de SMS e e-mail passam para a Alkimi |
| Contatos | 926 | Importar | Perder tags, campos e origem |
| Cards | 4 pipelines | Importar com etapa e status | Perder o histórico do funil |
| Conversas | Histórico de SMS, e-mail e ligações | Provavelmente não migra | A Chloe perde o contexto |
| Número SMS | (737) 317-7030, sob a agência | Portar, ou número novo | Maior risco: leads conhecem esse número |
| A2P (SMS nos EUA) | Não visível pela API | Novo registro da Alkimi | Pode levar dias ou semanas. **Começar já** |
| E-mail de envio | Não verificado | Domínio próprio autenticado | Queda de entrega se o DNS estiver errado |
| Workflows | 37, entre publicados e rascunhos | Recriar só o que serve | Levar erros antigos junto |
| Links rastreados | Domínio `links.connectionads.com` | Domínio próprio | Links antigos dependem da agência |
| Formulários e calendários | Embutidos no site (Hostinger, com a agência) | Trocar os embeds | Lead perdido durante a virada |
| Leads do Meta | Formulários ligados à conta | Reconectar Página e formulários | Lead parado sem aviso |
| Instagram e chat | Conectados à conta | Reconectar | Mensagens fora do inbox novo |
| Gymdesk | Workflow "Force Lead Through Gymdesk" | Recriar | Lead não chega ao sistema da academia |
| Pagamentos | A verificar de quem é o Stripe | Stripe do Nicholas | Depósitos de novembro presos na conta errada |
| Conector de IA e webhooks | Token e URLs da conta atual | Regerar | LP e automações param |

## Fases

### Fase 0: decisões (esta semana)
- O Nicholas define quando a agência fica sabendo. O plano original prevê o aviso no fim de novembro, mas pedir exportação ou snapshot antes revela a saída.
- Confirmar o que o contrato com a agência diz sobre dados, número, snapshot e prazo de acesso.
- Escolher a plataforma: conta própria de GHL ou conta sob outro parceiro. Conferir preços e limites atuais antes de decidir.
- Definir o dono da conta: login e cartão do Nicholas, com usuários separados para Ronaldo e Chloe.

### Fase 1: base da conta nova (05 a 20/11)
Não depende da agência.
- Criar a conta.
- Registrar o A2P com os dados da empresa.
- Autenticar o domínio de e-mail (SPF, DKIM, DMARC).
- Conectar o Stripe do Nicholas.
- Decidir entre portar o número atual e usar um novo. Verificar a portabilidade com o suporte.

### Fase 2: cópia de segurança (antes do aviso à agência)
Exportar sem depender de boa vontade depois.
- Contatos e cards em CSV.
- Lista de tags, campos, custom values, formulários e calendários.
- Textos e estrutura dos workflows que vão continuar.
- Arquivos da mídia.
- Conversas dos leads em aberto, ao menos dos mais quentes.

### Fase 3: montagem (16 a 30/11)
- Recriar pipelines limpas, com January Deposit e motivos de perda.
- Reduzir campos e tags aos que têm uso. Há campos herdados de outra academia, como School com "Pembroke Pines" e "West Pines".
- Recriar os fluxos a partir dos roteiros em `growth/`, sem copiar os workflows antigos.
- Pedir um snapshot à agência só se compensar. Ele traria também o que não queremos.

### Fase 4: virada (01 a 07/12)
Uma mudança de cada vez, com teste real.
1. Importação final de contatos e cards.
2. Formulários e calendários do site.
3. Formulários do Meta. Enviar um lead de teste em cada um.
4. Instagram e chat.
5. LP e demais webhooks.
6. Número SMS.
7. Leads em sequência continuam na conta nova de onde pararam.

### Fase 5: conferência (07 a 21/12)
- Manter acesso de leitura à conta antiga, se a agência permitir.
- Conferir todo dia se leads novos entram, recebem mensagem e chegam à Chloe.
- Comparar contagens de contatos e cards entre as contas.

## Regras até a virada

- Nada urgente espera a migração. A Black Friday roda na conta atual.
- Tudo que for construído agora fica documentado em `growth/`, para ser recriado sem depender de snapshot.
- O depósito não deve ficar preso a um Stripe da agência.

## Perguntas em aberto

| Pergunta | Quem responde |
|---|---|
| Quando a agência será avisada? | Nicholas |
| O número (737) 317-7030 pode ser portado? | Agência ou suporte da plataforma |
| O que o contrato garante sobre os dados? | Nicholas |
| De quem é o Stripe ligado à conta? | Nicholas |
| Quem tem acesso à Hostinger e ao gerenciador de negócios do Meta? | Nicholas |

Os itens sobre snapshot, portabilidade, prazo de A2P e histórico de conversas vêm do conhecimento geral da plataforma e precisam ser confirmados com o suporte antes de virarem datas firmes.
