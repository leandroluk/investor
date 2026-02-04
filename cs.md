# Use Cases & Business Rules

legend:
- implementation statuses
  - ⛔ not implemented yet
  - ✅ doc generated and implemented
  - ✔️ end to end generated
- resource access
  - 🔒 private resources
  - 🌎 public resources
- operation types
  - ⚡ command
  - 🔍 query
  - 🔄 saga
 
## 1. Account (Identity and Access Management)
### 1.1.⚡✔️🌎`[auth]` register user using email and password
- Para acessar a aplicação o usuário precisa se registrar. Para isso ele precisa informar seu nome, e-mail e senha.
- O sistema irá verificar se se o email é único na base. Caso contrário, ele irá retornar um erro de conflito. Também irá ver se a senha atende aos requisitos mínimos de complexidade.
- Se não houverem problemas, o sistema irá criar o usuário com o status "PENDING" e enviar um e-mail de ativação.
- A senha deve ser processada com hashing (bcrypt ou argon2) antes de persistir no banco.
### 1.2.⚡✔️🌎`[auth]` send activation email
- O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
- O sistema irá gerar um novo código de ativação e enviar para o email do usuário. 
- O código OTP deve ter validade de 15 minutos.     
### 1.3.⚡✔️🌎`[auth]` activate user using email and otp
- O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
- Ao acessar o link, o usuário será direcionado a uma tela de ativação onde ele irá capturar as informações do searchParam e iniciar a ativação.
- Se o email + o código de ativação estiverem ok então o sistema irá alterar o status do usuário para "ACTIVE". E redirecionar para a tela de login.
### 1.4.⚡✔️🌎`[auth]` request password reset
- Usuário informa seu email para recuperar senha.
- Sistema gera código OTP (15 minutos de validade) e armazena em cache.
- Envia email com link contendo o código.
- Não revela se o email existe ou não (segurança contra enumeração).
### 1.5.⚡✔️🌎`[auth]` reset password
- Usuário informa: email, código OTP e nova senha.
- Sistema valida código OTP e sua validade.
- Valida complexidade da nova senha (mesmo padrão do registro).
- Atualiza hash da senha no banco.
- Invalida todas as sessões ativas do usuário (logout forçado).
### 1.6.⚡✔️🌎`[auth]` login using credential
- Para acessar a aplicação o usuário precisa fornecer seu email e senha.
- O sistema irá verificar as credenciais e se o 2FA estiver ativo, emite um desafio de segurança em vez do token final.
- Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
- Se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
- Após a autenticação, o sistema irá emitir um token de acesso e um token de refresh.
### 1.7.⚡✔️🌎`[auth]` authorize 2fa code
- O usuário irá fornecer o código de 2FA (OTP além do challengeId).
- O sistema irá validar o código e caso seja válido, emitir o token de acesso final.
### 1.8.⚡✔️🌎`[auth]` send 2fa code
- O usuário solicita o reenvio do código de 2FA fornecendo o challengeId.
- O sistema irá gerar um novo código de 2FA e enviar para o email do usuário.
### 1.9.⚡⛔🔒`[auth]` link wallet address (web3 signature)
- Valida uma mensagem assinada pela chave privada da carteira para garantir a posse antes de vinculá-la ao perfil.
### 1.10.⚡✅🌎`[sso]` callback from provider and upsert
- Após a autenticação no provider, o mesmo irá redirecionar de volta pra api. caso a autenticação tenha sucesso então o provider irá enviar um código de autorização. 
- A api irá validar o código de autorização e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
### 1.11.⚡✅🌎`[auth]` login using token
- Após a autenticação via token, o sistema irá validar o token e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
- O frontend então irá pegar esse token e enviar para o backend para prosseguir com a autenticação. Assim como no login using email and password, se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
- Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
- Se o 2FA estiver ativo, o sistema irá emitir um desafio de segurança em vez do token final.
- Após a autenticação, o sistema irá emitir um token de acesso e um token de refresh.
### 1.12.⚡⛔🔒`[profile]` update user profile
- Permite editar o nome; impede a alteração direta de email e endereço de carteira por segurança.
### 1.13.⚡⛔🔒`[device]` register device (fingerprint)
- O sistema identifica unicamente o dispositivo do usuário através de um fingerprint gerado pela compilação de múltiplos fatores de hardware e software (web ou mobile).
- Esse identificador é utilizado para monitorar sessões ativas, prevenir fraudes e permitir o logout remoto.
- Caso o dispositivo suporte notificações, o token de push (FCM/APNs) também é vinculado a este registro para permitir o envio de alertas transacionais.
### 1.14.⚡⛔🔒`[device]` revoke device (remote logout)
- Inativa o dispositivo, impedindo novas notificações e invalidando a sessão atual.
### 1.15.⚡⛔🔒`[wallet]` generate wallet
- Gera uma carteira HD usando BIP39 (12 palavras).
- Deriva a chave privada e endereço Ethereum (path m/44'/60'/0'/0/0).
- Criptografa o mnemonic com AES-256-GCM usando chave derivada da senha do usuário.
- Armazena apenas o endereço público e seed criptografada no banco.
### 1.16.⚡⛔🔒`[kyc]` upload document
- Permite upload de documentos para verificação de identidade.
- Tipos aceitos: RG frente/verso, selfie, comprovante de endereço.
- Armazena no S3 e cria registro com status PENDING.
- Atualiza user.kyc_status para PENDING se era NONE.
### 1.17.⚡⛔🔒`[kyc]` approve/reject document (admin)
- Administrador aprova ou rejeita documento enviado.
- Se todos documentos aprovados, muda user.kyc_status para APPROVED.
- Se algum rejeitado, permite re-envio.
### 1.18.🔍✔️🌎`[auth]` check if email is available
- Verifica a existência do email. Retorna 409 (Conflict) se em uso ou 202 (Accepted) se disponível.
### 1.19.🔍✅🌎`[sso]` get sso redirect url
- Para fazer a autenticação via SSO deve ser passado o callback_url e o provider. O provider pode ser "google", "microsoft", etc. O callback_url é a url para onde o usuário será redirecionado após a autenticação.
- O sistema então vai gerar a url de redirecionamento para o provider de autenticação colocando o callback_url no state de forma encriptada, executando o redirecionamento.
### 1.20.🔍⛔🔒`[profile]` get user profile
- Retorna dados básicos, status de segurança e carteira vinculada.
### 1.21.🔍⛔🔒`[device]` list active devices
- Lista todos os dispositivos onde a sessão ainda é válida.
### 1.22.🔍⛔🔒`[wallet]` reveal seed phrase
- Retorna as 12 palavras do mnemonic BIP39.
- Requer re-autenticação obrigatória (senha + 2FA se ativo).
- Registra evento na auditoria (ledger) para compliance.
### 1.23.🔍⛔🔒`[kyc]` list user documents
- Lista documentos enviados pelo usuário com status.
- Retorna presigned URLs do S3 com validade de 5 minutos.
### 1.24.🔄⛔🌎`[auth]` send email after register
- Após um evento de registro de conta, deve-se fazer o envio do email de ativação. 
- Para isso deve-se gerar um código OTP e enviar para o email do usuário. 
- O código OTP deve ter validade de 15 minutos.
### 1.25.🔄⛔🌎`[auth]` send password reset email
- Após evento de solicitação de reset de senha.
- Gera código OTP (15 minutos) e envia email com template de recuperação.
- Email contém link com código como searchParam.      
### 1.26.🔄⛔🌎`[onboarding]` coordination between registration, welcome email and initial notice
- Após um evento de registro de conta, deve-se fazer o envio do email de ativação. 
- Para isso deve-se gerar um código OTP e enviar para o email do usuário. 
- O código OTP deve ter validade de 15 minutos.
## 2. Catalog (Market Data & Public Info)
### 2.1. 🔍⛔🌎`[assets]` list supported assets
- Lista apenas ativos que estão habilitados para negociação no sistema.
### 2.2. 🔍⛔🌎`[strategies]` list investment strategies
- Exibe descrição das estratégias e os intervalos de rendimento (APY) esperado.
### 2.3. 🔍⛔🌎`[simulation]` simulate yield
- Calcula a projeção de ganhos baseada no valor inserido e nos dados históricos da estratégia.
## 3. Portfolio (User Assets & Performance)
### 3.1. ⚡⛔🔒`[investment]` create investment intent
- Cria a intenção de investimento com status "PENDING" e trava a cotação/estratégia atual.
### 3.2. ⚡⛔🔒`[investment]` confirm investment
- Ativa o investimento após a confirmação do depósito on-chain.
### 3.3. ⚡⛔🔒`[investment]` cancel investment
- Permite o cancelamento apenas se o investimento ainda estiver pendente.
### 3.4. 🔍⛔🔒`[summary]` get portfolio summary
- Consolida o saldo total de investimentos ativos e o acúmulo de rendimentos.
### 3.5. 🔍⛔🔒`[investment]` list investments
- Lista todos os investimentos do usuário.
### 3.6. 🔍⛔🔒`[earning]` list earnings history
- Lista todos os rendimentos do usuário.
### 3.7. 🔍⛔🔒`[audit]` get global transaction timeline
- Visão unificada e cronológica de todos os eventos financeiros (depósitos, saques e lucros).
### 3.8. 🔄⛔🌎`[investment]` coordinates strategy snapshot, wallet signature and balance update
- Coordena a captura do snapshot da estratégia, a assinatura da carteira e a atualização do saldo.
## 4. Treasury (Financial Operations)
### 4.1. ⚡⛔🔒`[withdrawal]` create withdrawal request
- Valida se há saldo disponível suficiente e cria a solicitação pendente.
### 4.2. ⚡⛔🔒`[withdrawal]` process withdrawal payout
- Executa a transferência na blockchain e armazena o hash da transação.
### 4.3. ⚡⛔🔒`[withdrawal]` confirm withdrawal (2FA check)
- Exige autenticação de dois fatores para autorizar a saída de fundos.
### 4.4. 🔍⛔🔒`[withdrawal]` list withdrawals
- Lista todos os saques do usuário.
### 4.5. 🔄⛔🌎`[withdrawal]` coordinates 2fa verification, balance locking and blockchain execution
- Coordena a verificação de 2FA, o bloqueio de saldo e a execução na blockchain.
## 5. Signal (Alerts & Communication)
### 5.1. ⚡⛔🔒`[notice]` send notice (push/in-app)
- Registra a notificação e dispara push para os dispositivos ativos do usuário.
### 5.2. ⚡⛔🔒`[notice]` mark notice as read
- Marca a notificação como lida.
### 5.3. 🔍⛔🔒`[notice]` list notices (inbox)
- Lista todas as notificações do usuário.
## 6. System (Health & Configuration)
### 6.1. 🔍✅🌎`[system]` healthcheck
- Valida se o banco de dados, cache, mensageria e storage estão operacionais.
### 6.2. 🔍⛔🌎`[system]` get configuration
- Retorna parâmetros dinâmicos do sistema, como taxas e limites globais.
### 6.3. ⚡⛔🔒`[system]` send support ticket/feedback
- Canal para o usuário reportar problemas ou enviar sugestões para o back-office.
