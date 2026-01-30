# Use Cases & Business Rules

legend:
- ⛔ not implemented yet
- ✅ doc generated and implemented
- ✔️ end to end generated

---

- account (Identity & Access Management)
  - application/command
    - ⛔ [auth] register user using email and password
      - Para acessar a aplicação o usuário precisa se registrar. Para isso ele precisa informar seu nome, e-mail e senha.
      - O sistema irá verificar se se o email é único na base. Caso contrário, ele irá retornar um erro de conflito. Também irá ver se a senha atende aos requisitos mínimos de complexidade.
      - Se não houverem problemas, o sistema irá criar o usuário com o status "PENDING" e enviar um e-mail de ativação.
      - A senha deve ser processada com hashing (bcrypt ou argon2) antes de persistir no banco.
    - ⛔ [auth] activate user using email and code
      - O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
      - Ao acessar o link, o usuário será direcionado a uma tela de ativação onde ele irá capturar as informações do searchParam e iniciar a ativação.
      - Se o email + o código de ativação estiverem ok então o sistema irá alterar o status do usuário para "ACTIVE". E redirecionar para a tela de login.
    - ⛔ [auth] login using email and password
      - Verifica credenciais; se o 2FA estiver ativo, emite um desafio de segurança em vez do token final.
      - Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
    - ⛔ [auth] authorize 2fa code
      - Valida o código TOTP ou SMS e emite o JWT de acesso final.
    - ⛔ [auth] link wallet address (web3 signature)
      - Valida uma mensagem assinada pela chave privada da carteira para garantir a posse antes de vinculá-la ao perfil.
    - ⛔ [sso] login using internal sso code
      - Autentica via provedor externo e vincula ao ID do usuário interno.
    - ⛔ [profile] update user profile
      - Permite editar o nome; impede a alteração direta de email e endereço de carteira por segurança.
    - ⛔ [device] register device (push token)
      - Salva o token de push e a plataforma (iOS/Android) como ativos.
    - ⛔ [device] revoke device (remote logout)
      - Inativa o dispositivo, impedindo novas notificações e invalidando a sessão atual.

  - application/query
    - ✅ [auth] check if email is available
      - Verifica a existência do email. Retorna 409 (Conflict) se em uso ou 202 (Accepted) se disponível.
    - ⛔ [sso] get sso redirect url
      - Retorna a URL de redirecionamento para o provedor de autenticação.
    - ⛔ [profile] get user profile
      - Retorna dados básicos, status de segurança e carteira vinculada.
    - ⛔ [device] list active devices
      - Lista todos os dispositivos onde a sessão ainda é válida.

  - application/saga
    - ⛔ [onboarding] coordination between registration, welcome email and initial notice

- catalog (Market Data & Public Info)
  - application/query
    - ⛔ [assets] list supported assets
      - Lista apenas ativos que estão habilitados para negociação no sistema.
    - ⛔ [strategies] list investment strategies
      - Exibe descrição das estratégias e os intervalos de rendimento (APY) esperado.
    - ⛔ [simulation] simulate yield
      - Calcula a projeção de ganhos baseada no valor inserido e nos dados históricos da estratégia.

- portfolio (User Assets & Performance)
  - application/command
    - ⛔ [investment] create investment intent
      - Cria a intenção de investimento com status "PENDING" e trava a cotação/estratégia atual.
    - ⛔ [investment] confirm investment
      - Ativa o investimento após a confirmação do depósito on-chain.
    - ⛔ [investment] cancel investment
      - Permite o cancelamento apenas se o investimento ainda estiver pendente.
  
  - application/query
    - ⛔ [summary] get portfolio summary
      - Consolida o saldo total de investimentos ativos e o acúmulo de rendimentos.
    - ⛔ [investment] list investments
    - ⛔ [earning] list earnings history
    - ⛔ [audit] get global transaction timeline
      - Visão unificada e cronológica de todos os eventos financeiros (depósitos, saques e lucros).

  - application/saga
    - ⛔ [investment-flow] coordinates strategy snapshot, wallet signature and balance update

- treasury (Financial Operations)
  - application/command
    - ⛔ [withdrawal] create withdrawal request
      - Valida se há saldo disponível suficiente e cria a solicitação pendente.
    - ⛔ [withdrawal] process withdrawal payout
      - Executa a transferência na blockchain e armazena o hash da transação.
    - ⛔ [withdrawal] confirm withdrawal (2FA check)
      - Exige autenticação de dois fatores para autorizar a saída de fundos.

  - application/query
    - ⛔ [withdrawal] list withdrawals

  - application/saga
    - ⛔ [withdrawal-flow] coordinates 2fa verification, balance locking and blockchain execution

- signal (Alerts & Communication)
  - application/command
    - ⛔ [notice] send notice (push/in-app)
      - Registra a notificação e dispara push para os dispositivos ativos do usuário.
    - ⛔ [notice] mark notice as read
  
  - application/query
    - ⛔ [notice] list notices (inbox)

- system (Health & Config)
  - application/command
    - ⛔ [support] send support ticket/feedback
      - Canal para o usuário reportar problemas ou enviar sugestões para o back-office.

  - application/query
    - ✅ [status] healthcheck
      - Valida se o banco de dados, cache, mensageria e storage estão operacionais.
    - ⛔ [status] get configuration
      - Retorna parâmetros dinâmicos do sistema, como taxas e limites globais.