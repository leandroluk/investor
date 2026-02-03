# Use Cases & Business Rules

legend:
- ⛔ not implemented yet
- ✅ doc generated and implemented
- ✔️ end to end generated

---

- account (Identity & Access Management)
  - application/command
    - ✅ [auth] register user using email and password
      - Para acessar a aplicação o usuário precisa se registrar. Para isso ele precisa informar seu nome, e-mail e senha.
      - O sistema irá verificar se se o email é único na base. Caso contrário, ele irá retornar um erro de conflito. Também irá ver se a senha atende aos requisitos mínimos de complexidade.
      - Se não houverem problemas, o sistema irá criar o usuário com o status "PENDING" e enviar um e-mail de ativação.
      - A senha deve ser processada com hashing (bcrypt ou argon2) antes de persistir no banco.
    - ✅ [auth] resend activation email
      - O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
      - O sistema irá gerar um novo código de ativação e enviar para o email do usuário. 
      - O código OTP deve ter validade de 15 minutos.      
    - ✅ [auth] activate user using email and code
      - O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
      - Ao acessar o link, o usuário será direcionado a uma tela de ativação onde ele irá capturar as informações do searchParam e iniciar a ativação.
      - Se o email + o código de ativação estiverem ok então o sistema irá alterar o status do usuário para "ACTIVE". E redirecionar para a tela de login.
    - ✅ [auth] request password reset
      - Usuário informa seu email para recuperar senha.
      - Sistema gera código OTP (15 minutos de validade) e armazena em cache.
      - Envia email com link contendo o código.
      - Não revela se o email existe ou não (segurança contra enumeração).
    - ✅ [auth] reset password
      - Usuário informa: email, código OTP e nova senha.
      - Sistema valida código OTP e sua validade.
      - Valida complexidade da nova senha (mesmo padrão do registro).
      - Atualiza hash da senha no banco.
      - Invalida todas as sessões ativas do usuário (logout forçado).
    - ⛔ [auth] login using credential
      - Para acessar a aplicação o usuário precisa fornecer seu email e senha.
      - O sistema irá verificar as credenciais e se o 2FA estiver ativo, emite um desafio de segurança em vez do token final.
      - Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
      - Se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
      - Após a autenticação, o sistema irá emitir um token de acesso e um token de refresh.
    - ⛔ [auth] authorize 2fa code
      - O usuário irá fornecer o código de 2FA (TOTP ou SMS).
      - O sistema irá validar o código e emite o JWT de acesso final.
    - ⛔ [auth] link wallet address (web3 signature)
      - Valida uma mensagem assinada pela chave privada da carteira para garantir a posse antes de vinculá-la ao perfil.
    - ✅ [sso] callback from provider and upsert
      - Após a autenticação no provider, o mesmo irá redirecionar de volta pra api. caso a autenticação tenha sucesso então o provider irá enviar um código de autorização. 
      - A api irá validar o código de autorização e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
    - ⛔ [auth] login using token
      - Após a autenticação via token, o sistema irá validar o token e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
      - O frontend então irá pegar esse token e enviar para o backend para prosseguir com a autenticação. Assim como no login using email and password, se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
      - Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
      - Se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
      - Após a autenticação, o sistema irá emitir um token de acesso e um token de refresh.
    - ⛔ [profile] update user profile
      - Permite editar o nome; impede a alteração direta de email e endereço de carteira por segurança.
    - ⛔ [device] register device (push token)
      - Salva o token de push e a plataforma (iOS/Android) como ativos.
    - ⛔ [device] revoke device (remote logout)
      - Inativa o dispositivo, impedindo novas notificações e invalidando a sessão atual.
    - ⛔ [wallet] generate wallet
      - Gera uma carteira HD usando BIP39 (12 palavras).
      - Deriva a chave privada e endereço Ethereum (path m/44'/60'/0'/0/0).
      - Criptografa o mnemonic com AES-256-GCM usando chave derivada da senha do usuário.
      - Armazena apenas o endereço público e seed criptografada no banco.
    - ⛔ [kyc] upload document
      - Permite upload de documentos para verificação de identidade.
      - Tipos aceitos: RG frente/verso, selfie, comprovante de endereço.
      - Armazena no S3 e cria registro com status PENDING.
      - Atualiza user.kyc_status para PENDING se era NONE.
    - ⛔ [kyc] approve/reject document (admin)
      - Administrador aprova ou rejeita documento enviado.
      - Se todos documentos aprovados, muda user.kyc_status para APPROVED.
      - Se algum rejeitado, permite re-envio.

  - application/query
    - ✅ [auth] check if email is available
      - Verifica a existência do email. Retorna 409 (Conflict) se em uso ou 202 (Accepted) se disponível.
    - ✅ [sso] get sso redirect url
      - Para fazer a autenticação via SSO deve ser passado o callback_url e o provider. O provider pode ser "google", "microsoft", etc. O callback_url é a url para onde o usuário será redirecionado após a autenticação.
      - O sistema então vai gerar a url de redirecionamento para o provider de autenticação colocando o callback_url no state de forma encriptada, executando o redirecionamento.
    - ⛔ [profile] get user profile
      - Retorna dados básicos, status de segurança e carteira vinculada.
    - ⛔ [device] list active devices
      - Lista todos os dispositivos onde a sessão ainda é válida.
    - ⛔ [wallet] reveal seed phrase
      - Retorna as 12 palavras do mnemonic BIP39.
      - Requer re-autenticação obrigatória (senha + 2FA se ativo).
      - Registra evento na auditoria (ledger) para compliance.
    - ⛔ [kyc] list user documents
      - Lista documentos enviados pelo usuário com status.
      - Retorna presigned URLs do S3 com validade de 5 minutos.

  - application/saga
    - ⛔ [auth] send email after register
      - Após um evento de registro de conta, deve-se fazer o envio do email de ativação. 
      - Para isso deve-se gerar um código OTP e enviar para o email do usuário. 
      - O código OTP deve ter validade de 15 minutos.
    - ⛔ [auth] send password reset email
      - Após evento de solicitação de reset de senha.
      - Gera código OTP (15 minutos) e envia email com template de recuperação.
      - Email contém link com código como searchParam.      
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