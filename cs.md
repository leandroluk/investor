# Use Cases & Business Rules

legend:
- ⛔ not implemented yet
- ✅ doc generated and implemented
- ✔️ end to end generated
- 🔒 refers to authenticated routes

---

- account (Identity & Access Management)
  - application/command
    - ✅ [auth] register user using email and password (1)
      - Para acessar a aplicação o usuário precisa se registrar. Para isso ele precisa informar seu nome, e-mail e senha.
      - O sistema irá verificar se se o email é único na base. Caso contrário, ele irá retornar um erro de conflito. Também irá ver se a senha atende aos requisitos mínimos de complexidade.
      - Se não houverem problemas, o sistema irá criar o usuário com o status "PENDING" e enviar um e-mail de ativação.
      - A senha deve ser processada com hashing (bcrypt ou argon2) antes de persistir no banco.
    - ✅ [auth] send activation email (2)
      - O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
      - O sistema irá gerar um novo código de ativação e enviar para o email do usuário. 
      - O código OTP deve ter validade de 15 minutos.      
    - ✅ [auth] activate user using email and code (3)
      - O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
      - Ao acessar o link, o usuário será direcionado a uma tela de ativação onde ele irá capturar as informações do searchParam e iniciar a ativação.
      - Se o email + o código de ativação estiverem ok então o sistema irá alterar o status do usuário para "ACTIVE". E redirecionar para a tela de login.
    - ✅ [auth] request password reset (4)
      - Usuário informa seu email para recuperar senha.
      - Sistema gera código OTP (15 minutos de validade) e armazena em cache.
      - Envia email com link contendo o código.
      - Não revela se o email existe ou não (segurança contra enumeração).
    - ✅ [auth] reset password (5)
      - Usuário informa: email, código OTP e nova senha.
      - Sistema valida código OTP e sua validade.
      - Valida complexidade da nova senha (mesmo padrão do registro).
      - Atualiza hash da senha no banco.
      - Invalida todas as sessões ativas do usuário (logout forçado).
    - ✅ [auth] login using credential (6)
      - Para acessar a aplicação o usuário precisa fornecer seu email e senha.
      - O sistema irá verificar as credenciais e se o 2FA estiver ativo, emite um desafio de segurança em vez do token final.
      - Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
      - Se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
      - Após a autenticação, o sistema irá emitir um token de acesso e um token de refresh.
    - ✅ [auth] authorize 2fa code (7)
      - O usuário irá fornecer o código de 2FA (OTP além do challengeId).
      - O sistema irá validar o código e caso seja válido, emitir o token de acesso final.
    - ✅ [auth] send 2fa code (8)
      - O usuário solicita o reenvio do código de 2FA fornecendo o challengeId.
      - O sistema irá gerar um novo código de 2FA e enviar para o email do usuário.
    - ⛔ 🔒 [auth] link wallet address (web3 signature) (9)
      - Valida uma mensagem assinada pela chave privada da carteira para garantir a posse antes de vinculá-la ao perfil.
    - ✅ [sso] callback from provider and upsert (10)
      - Após a autenticação no provider, o mesmo irá redirecionar de volta pra api. caso a autenticação tenha sucesso então o provider irá enviar um código de autorização. 
      - A api irá validar o código de autorização e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
    - ✅ [auth] login using token (11)
      - Após a autenticação via token, o sistema irá validar o token e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
      - O frontend então irá pegar esse token e enviar para o backend para prosseguir com a autenticação. Assim como no login using email and password, se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
      - Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
      - Se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
      - Após a autenticação, o sistema irá emitir um token de acesso e um token de refresh.
    - ⛔ 🔒 [profile] update user profile (12)
      - Permite editar o nome; impede a alteração direta de email e endereço de carteira por segurança.
    - ⛔ 🔒 [device] register device (fingerprint) (13)
      - O sistema identifica unicamente o dispositivo do usuário através de um fingerprint gerado pela compilação de múltiplos fatores de hardware e software (web ou mobile).
      - Esse identificador é utilizado para monitorar sessões ativas, prevenir fraudes e permitir o logout remoto.
      - Caso o dispositivo suporte notificações, o token de push (FCM/APNs) também é vinculado a este registro para permitir o envio de alertas transacionais.
    - ⛔ 🔒 [device] revoke device (remote logout) (14)
      - Inativa o dispositivo, impedindo novas notificações e invalidando a sessão atual.
    - ⛔ 🔒 [wallet] generate wallet (15)
      - Gera uma carteira HD usando BIP39 (12 palavras).
      - Deriva a chave privada e endereço Ethereum (path m/44'/60'/0'/0/0).
      - Criptografa o mnemonic com AES-256-GCM usando chave derivada da senha do usuário.
      - Armazena apenas o endereço público e seed criptografada no banco.
    - ⛔ 🔒 [kyc] upload document (16)
      - Permite upload de documentos para verificação de identidade.
      - Tipos aceitos: RG frente/verso, selfie, comprovante de endereço.
      - Armazena no S3 e cria registro com status PENDING.
      - Atualiza user.kyc_status para PENDING se era NONE.
    - ⛔ 🔒 [kyc] approve/reject document (admin) (17)
      - Administrador aprova ou rejeita documento enviado.
      - Se todos documentos aprovados, muda user.kyc_status para APPROVED.
      - Se algum rejeitado, permite re-envio.

  - application/query
    - ✅ [auth] check if email is available (18)
      - Verifica a existência do email. Retorna 409 (Conflict) se em uso ou 202 (Accepted) se disponível.
    - ✅ [sso] get sso redirect url (19)
      - Para fazer a autenticação via SSO deve ser passado o callback_url e o provider. O provider pode ser "google", "microsoft", etc. O callback_url é a url para onde o usuário será redirecionado após a autenticação.
      - O sistema então vai gerar a url de redirecionamento para o provider de autenticação colocando o callback_url no state de forma encriptada, executando o redirecionamento.
    - ⛔ 🔒 [profile] get user profile (20)
      - Retorna dados básicos, status de segurança e carteira vinculada.
    - ⛔ 🔒 [device] list active devices (21)
      - Lista todos os dispositivos onde a sessão ainda é válida.
    - ⛔ 🔒 [wallet] reveal seed phrase (22)
      - Retorna as 12 palavras do mnemonic BIP39.
      - Requer re-autenticação obrigatória (senha + 2FA se ativo).
      - Registra evento na auditoria (ledger) para compliance.
    - ⛔ 🔒 [kyc] list user documents (23)
      - Lista documentos enviados pelo usuário com status.
      - Retorna presigned URLs do S3 com validade de 5 minutos.

  - application/saga
    - ⛔ [auth] send email after register (24)
      - Após um evento de registro de conta, deve-se fazer o envio do email de ativação. 
      - Para isso deve-se gerar um código OTP e enviar para o email do usuário. 
      - O código OTP deve ter validade de 15 minutos.
    - ⛔ [auth] send password reset email (25)
      - Após evento de solicitação de reset de senha.
      - Gera código OTP (15 minutos) e envia email com template de recuperação.
      - Email contém link com código como searchParam.      
    - ⛔ [onboarding] coordination between registration, welcome email and initial notice (26)

- catalog (Market Data & Public Info)
  - application/query
    - ⛔ [assets] list supported assets (27)
      - Lista apenas ativos que estão habilitados para negociação no sistema.
    - ⛔ [strategies] list investment strategies (28)
      - Exibe descrição das estratégias e os intervalos de rendimento (APY) esperado.
    - ⛔ [simulation] simulate yield (29)
      - Calcula a projeção de ganhos baseada no valor inserido e nos dados históricos da estratégia.

- portfolio (User Assets & Performance)
  - application/command
    - ⛔ 🔒 [investment] create investment intent (30)
      - Cria a intenção de investimento com status "PENDING" e trava a cotação/estratégia atual.
    - ⛔ 🔒 [investment] confirm investment (31)
      - Ativa o investimento após a confirmação do depósito on-chain.
    - ⛔ 🔒 [investment] cancel investment (32)
      - Permite o cancelamento apenas se o investimento ainda estiver pendente.
  
  - application/query
    - ⛔ 🔒 [summary] get portfolio summary (33)
      - Consolida o saldo total de investimentos ativos e o acúmulo de rendimentos.
    - ⛔ 🔒 [investment] list investments (34)
    - ⛔ 🔒 [earning] list earnings history (35)
    - ⛔ 🔒 [audit] get global transaction timeline (36)
      - Visão unificada e cronológica de todos os eventos financeiros (depósitos, saques e lucros).

  - application/saga
    - ⛔ [investment] coordinates strategy snapshot, wallet signature and balance update (37)

- treasury (Financial Operations)
  - application/command
    - ⛔ 🔒 [withdrawal] create withdrawal request (38)
      - Valida se há saldo disponível suficiente e cria a solicitação pendente.
    - ⛔ 🔒 [withdrawal] process withdrawal payout (39)
      - Executa a transferência na blockchain e armazena o hash da transação.
    - ⛔ 🔒 [withdrawal] confirm withdrawal (2FA check) (40)
      - Exige autenticação de dois fatores para autorizar a saída de fundos.

  - application/query
    - ⛔ 🔒 [withdrawal] list withdrawals (41)

  - application/saga
    - ⛔ [withdrawal] coordinates 2fa verification, balance locking and blockchain execution (42)

- signal (Alerts & Communication)
  - application/command
    - ⛔ 🔒 [notice] send notice (push/in-app) (43)
      - Registra a notificação e dispara push para os dispositivos ativos do usuário.
    - ⛔ 🔒 [notice] mark notice as read (44)
  
  - application/query
    - ⛔ 🔒 [notice] list notices (inbox) (45)

- system (Health & Config)
  - application/command
    - ⛔ 🔒 [support] send support ticket/feedback (46)
      - Canal para o usuário reportar problemas ou enviar sugestões para o back-office.

  - application/query
    - ✅ [status] healthcheck (47)
      - Valida se o banco de dados, cache, mensageria e storage estão operacionais.
    - ⛔ [status] get configuration (48)
      - Retorna parâmetros dinâmicos do sistema, como taxas e limites globais.