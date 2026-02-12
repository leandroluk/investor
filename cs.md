# Use Cases & Business Rules

> [!TIP] legend
> - implementation statuses
>   - ⛔ not implemented yet
>   - ✅ doc generated and implemented
>   - ✔️ end to end generated
> - resource access
>   - 🔒 private resources
>   - 🌎 public resources
> - operation types
>   - ⚡ command
>   - 🔍 query
>   - 🔄 saga
 
### 01. Account (Identity and Access Management)
##### 01.01.🔍✔️🌎`[auth]` check if email is available
- Verifica a existência do email. Retorna 409 (Conflict) se em uso ou 202 (Accepted) se disponível.
##### 01.02.⚡✔️🌎`[auth]` register user using email and password
- Para acessar a aplicação o usuário precisa se registrar. Para isso ele precisa informar seu nome, e-mail e senha.
- O sistema irá verificar se se o email é único na base. Caso contrário, ele irá retornar um erro de conflito. Também irá ver se a senha atende aos requisitos mínimos de complexidade.
- Se não houverem problemas, o sistema irá criar o registro de login (tb_user) e o perfil básico (tb_profile) com o status "PENDING" e enviar um e-mail de ativação.
- A senha deve ser processada com hashing antes de persistir no banco.
##### 01.03.🔄✔️🌎`[auth]` dispatch send email after register
- Após um evento de registro de conta, deve-se fazer o envio do email de ativação. 
- Para isso deve-se gerar um código OTP e enviar para o email do usuário. 
- O código OTP deve ter validade de 15 minutos.
##### 01.04.⚡✔️🌎`[auth]` send activation email
- O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
- O sistema irá gerar um novo código de ativação e enviar para o email do usuário. 
- O código OTP deve ter validade de 15 minutos.     
##### 01.05.⚡✔️🌎`[auth]` activate user using email and otp
- O usuário irá receber um e-mail de ativação com um link de ativação que contém o código de ativação da conta como searchParam. 
- Ao acessar o link, o usuário será direcionado a uma tela de ativação onde ele irá capturar as informações do searchParam e iniciar a ativação.
- Se o email + o código de ativação estiverem ok então o sistema irá alterar o status do usuário para "ACTIVE". E redirecionar para a tela de login.
##### 01.06.⚡✔️🌎`[auth]` request password reset
- Usuário informa seu email para recuperar senha.
- Sistema gera código OTP (15 minutos de validade) e armazena em cache.
- Envia email com link contendo o código.
- Não revela se o email existe ou não (segurança contra enumeração).
##### 01.07.🔄✔️🌎`[auth]` dispatch send password reset email
- Após evento de solicitação de reset de senha.
- Gera código OTP (15 minutos) e envia email com template de recuperação.
- Email contém link com código como searchParam.      
##### 01.08.⚡✔️🌎`[auth]` reset password
- Usuário informa: email, código OTP e nova senha.
- Sistema valida código OTP e sua validade.
- Valida complexidade da nova senha (mesmo padrão do registro).
- Atualiza hash da senha no banco.
- Invalida todas as sessões ativas do usuário (logout forçado).
##### 01.09.⚡✔️🌎`[auth]` login using credential
- Para acessar a aplicação o usuário precisa fornecer seu email e senha.
- O sistema irá verificar as credenciais. Se o 2FA estiver ativo, o sistema cria um desafio (Challenge) pendente.
- Sempre emite os tokens de acesso e refresh. Se houver desafio pendente, o acesso aos recursos protegidos retornará 428.
- Registra a tentativa (sucesso/falha) com IP e ID do usuário para auditoria.
##### 01.10.⚡✔️🌎`[auth]` authorize 2fa code
- O usuário irá fornecer o código de 2FA e o ID do desafio (Challenge).
- O sistema irá buscar o desafio pelo ID e validar o código.
- Se válido, marca o desafio como COMPLETED e emite o token de acesso final.
- Se inválido, incrementa contadores de erro (se houver) e retorna erro.
##### 01.11.⚡✔️🌎`[auth]` send 2fa code
- O usuário solicita o reenvio do código de 2FA fornecendo o challengeId.
- O sistema irá gerar um novo código de 2FA e enviar para o email do usuário.
##### 01.12.⚡✔️🌎`[auth]` login using token
- Após a autenticação via token (ex: link mágico), o sistema valida o token.
- Se o 2FA estiver ativo, o sistema cria um desafio (Challenge) pendente.
- Sempre emite os tokens de acesso e refresh. Se houver desafio pendente, o acesso aos recursos protegidos retornará 428.
- Registra a tentativa (sucesso/falha).
##### 01.13.⚡✔️🌎`[auth]` refresh token
- O token de refresh é utilizado para obter um novo token de acesso. Quando o token de acesso expira o usuário precisa solicitar um novo.
- O token tem um tempo limite que pode ser refrescado, ou seja após esse tempo ele precisa fazer um novo login.
- O refresh de token não tem nada a ver com permissões de device ou algo do tipo
##### 01.14.⚡✔️🌎`[sso]` callback from provider and upsert
- Após a autenticação no provider, o mesmo irá redirecionar de volta pra api. caso a autenticação tenha sucesso então o provider irá enviar um código de autorização. 
- A api irá validar o código de autorização e fazer o upsert do usuário, criar um token encriptado contendo o id do usuário e um ttl de 1 minuto, redirecionando o token no searchParams para o callback url recebido na primeira etapa da autenticação via SSO.
##### 01.15.🔍✔️🌎`[sso]` get sso redirect url
- Para fazer a autenticação via SSO deve ser passado o callback_url e o provider. O provider pode ser "google", "microsoft", etc. O callback_url é a url para onde o usuário será redirecionado após a autenticação.
- O sistema então vai gerar a url de redirecionamento para o provider de autenticação colocando o callback_url no state de forma encriptada, executando o redirecionamento.
##### 01.16.⚡✔️🔒`[device]` register device (fingerprint)
- O sistema identifica unicamente o dispositivo do usuário através de um fingerprint gerado pela compilação de múltiplos fatores de hardware e software (web ou mobile).
- Esse identificador é utilizado para monitorar sessões ativas, prevenir fraudes e permitir o logout remoto.
- Caso o dispositivo suporte notificações, o token de push (FCM/APNs) também é vinculado a este registro para permitir o envio de alertas transacionais.
##### 01.17.⚡✔️🔒`[device]` revoke device (remote logout)
- Inativa o dispositivo, impedindo novas notificações e invalidando a sessão atual.
##### 01.18.🔍✔️🔒`[device]` list active device
- Lista todos os dispositivos onde a sessão ainda é válida.
##### 01.19.⚡✔️🔒`[user]` update user profile
- Permite que o usuário autenticado atualize informações básicas de seu perfil (tb_profile), como nome de exibição e preferências de idioma.
- Bloqueio de Campos Críticos: Por segurança, o sistema impede a alteração direta de e-mail e endereços de carteira vinculada através deste fluxo comum, exigindo processos específicos de validação para essas trocas.
- Sanitização: Realiza a limpeza e validação de tamanho de caracteres para evitar a persistência de dados malformatados no banco de dados.
##### 01.20.🔍✔️🔒`[user]` get user profile
- Retorna dados combinados de login (tb_user) e perfil (tb_profile).
- **Atenção**: Não retorna dados sensíveis de auditoria ou status detalhado de KYC (ver 01.30).
##### 01.21.⚡✔️🔒`[user]` upload user document
- Permite que o usuário envie arquivos para comprovação de identidade e residência (RG, CNH, Selfie, comprovante de endereço).
- O sistema deve validar o formato (JPG, PNG, PDF) e o tamanho máximo do arquivo antes de gerar uma URL de upload seguro para o storage.
- Cada documento enviado é registrado com um identificador único, data de expiração (se aplicável) e status inicial como PENDING.
- Transição de Estado: Se o status global de KYC do usuário for NONE, ele deve ser alterado automaticamente para PENDING assim que o primeiro documento obrigatório for recebido.
- O sistema deve garantir que arquivos sensíveis não sejam acessíveis publicamente, utilizando links temporários (presigned URLs) para visualização administrativa.
##### 01.22.🔍✔️🔒`[user]` list user documents without signed url
- Recupera a lista de todos os arquivos enviados pelo usuário para o processo de verificação de identidade.
- Segurança de Acesso: Para documentos armazenados de forma privada, o sistema gera presigned URLs com validade curtíssima (ex: 5 minutos) para permitir a visualização segura.
- Metadados: Retorna o status atual de cada documento (PENDING, APPROVED, REJECTED) e a data da última atualização para acompanhamento do usuário ou suporte.
##### 01.23.🔍✔️🔒`[user]` redirect to signed url user document
- Quando o usuário enviar o id do documento ele deverá ser redirecionado para a url assinada do documento
- Caso o documento não exista então deve retornar 404
##### 01.24.⚡✅🔒`[user]` link user wallet address (web3 signature - EIP-4361)
- Permite que o usuário vincule uma carteira criptográfica (ex: Ethereum) ao seu perfil provando a posse da chave privada sem expô-la.
- O processo inicia com a solicitação de um nonce (string aleatória única) gerado pelo sistema e armazenado temporariamente em cache (TTL curto). O usuário deve informar um apelido (name) para a carteira.
- O usuário deve assinar uma mensagem padronizada seguindo o padrão **EIP-4361 (Sign-In with Ethereum)** contendo este nonce, timestamp e domínio da aplicação para evitar phishing.
- A API realiza a recuperação da chave pública (ecrecover) a partir da assinatura recebida para validar se o endereço recuperado coincide com o endereço informado.
- Regra de Unicidade: O sistema verifica se o endereço já está vinculado a outra conta; em caso positivo, retorna um erro de conflito (409).
- O nonce é invalidado imediatamente após o uso (sucesso ou falha) para prevenir ataques de replay.
- Após a validação bem-sucedida, o endereço é persistido no perfil do usuário e o evento é registrado no log de auditoria.
##### 01.25.⚡⛔🔒`[user]` generate user wallet
- Gera uma carteira Hierarchical Deterministic (HD) seguindo o padrão BIP39 com uma seed de 12 palavras para garantir portabilidade e segurança. O usuário pode fornecer um apelido (name).
- Deriva a chave privada e o endereço público para a rede Ethereum utilizando o derivation path padrão m/44'/60'/0'/0/0.
- Segurança de Ativos: O mnemonic é criptografado via AES-256-GCM (CipherPort) com uma chave do sistema antes da persistência. Isso permite a automação de investimentos sem custódia total da senha do usuário, mas mantém a segurança dos fundos.
- O sistema armazena o endereço público, a seed criptografada e o Initialization Vector (IV) no banco de dados.
- Regra de Limite: O sistema pode impor um limite máximo de carteiras custodiais por usuário nas configurações globais.
##### 01.26.🔍⛔🔒`[user]` reveal user wallet seed phrase
- Permite que o usuário visualize as 12 palavras (mnemonic) de sua carteira gerada internamente.
- Re-autenticação Obrigatória: Exige que o usuário forneça sua senha atual e o código 2FA ativo no momento exato da solicitação, independentemente de já estar logado.
- Auditoria Rígida: Cada acesso a essa funcionalidade deve gerar um registro imutável no log de auditoria (ledger), contendo o IP, ID do dispositivo e timestamp para fins de conformidade e segurança.
- Restrição de Acesso: O sistema deve bloquear essa funcionalidade caso a conta esteja em processo de recuperação de senha ou apresente comportamento suspeito detectado pelo módulo de segurança.
##### 01.27.🔄⛔🌎`[user]` dispatch coordination between registration, welcome email and initial notice
- Atua como uma Saga de Longa Duração (Long-Running Process) que orquestra todo o ciclo de vida inicial do usuário até que ele esteja apto a operar.
- **Gatilho Inicial**: Escuta o evento `UserActivatedEvent`.
- **Fase 1 (Setup)**: 
  - Cria configurações padrão de perfil e notificações.
  - Envia e-mail de boas-vindas.
  - Altera status interno para `KycStatusEnum.PENDING`.
- **Fase 2 (KYC)**: 
  - Aguarda o evento `KycApprovedEvent` (disparado pelo Admin em 01.22).
  - Ao receber, envia notificação "Sua conta foi aprovada! Agora vincule sua carteira".
- **Fase 3 (Wallet)**: 
  - Aguarda o evento `WalletLinkedEvent` (disparado em 01.24).
  - Ao receber, envia e-mail "Tudo pronto para investir!".
  - Marca o registro como `onboard_completed`.
- **Resiliência**: A saga deve persistir seu estado para sobreviver a reinícios do sistema e continuar ouvindo eventos por tempo indeterminado.
##### 01.28.🔍✅🔒`[admin]` list document to review (admin)
- Permite que administradores listem documentos pendentes de análise globalmente.
- **Filtros**: Deve permitir filtrar por status (padrão: PENDING), tipo de documento e intervalo de datas.
- **Paginação**: Obrigatória, dado o volume potencial de documentos.
- **Dados Retornados**: Deve incluir metadados do documento e dados básicos do usuário (ID, Nome, Email) para contexto da análise.
##### 01.29.⚡✅🔒`[admin]` review document (admin)
- Interface de back-office que permite a um administrador revisar a validade dos documentos enviados pelo usuário.
- Fluxo de Aprovação: Ao marcar um documento como válido, o sistema verifica se todos os requisitos de KYC foram atendidos; em caso positivo, o status global do usuário é promovido para APPROVED.
- Fluxo de Rejeição: Caso o documento seja inválido (ex: foto ilegível), o administrador deve obrigatoriamente informar o motivo da rejeição.
- Notificação de Feedback: O sistema dispara automaticamente um alerta (e-mail/push) informando o usuário sobre o resultado da análise e os passos necessários para correção, se houver rejeição.
##### 01.30.🔍✅🔒`[user]` get user kyc
- Retorna os dados detalhados do processo de Know Your Customer (KYC).
- Inclui: Status atual (PENDING, APPROVED, REJECTED), Nível de verificação (Tier), Data de verificação e Motivo de rejeição (se houver).
- Utilizado para exibir o status de conformidade do usuário e bloquear/liberar funcionalidades no frontend.
### 02. Catalog (Market Data & Public Info)
##### 02.01. 🔍⛔🌎`[assets]` list supported assets
- Retorna a lista de ativos (criptomoedas/tokens) que possuem integração ativa e estão habilitados para negociação no sistema.
- Filtro de Disponibilidade: O sistema deve omitir ativos que estejam em manutenção ou desabilitados globalmente pelo administrador.
- Dados do Ativo: Para cada item, exibe o símbolo (ticker), nome completo, ícone oficial e o status atual da rede (ex: Online, Congestionada).
##### 02.02. 🔍⛔🌎`[strategies]` list investment strategies
- Exibe o catálogo de estratégias de investimento disponíveis, detalhando a tese de investimento de cada uma.
- Indicadores de Performance: Deve apresentar o intervalo de rendimento esperado (APY) e o nível de risco associado (Baixo, Médio, Alto).
- Dados de Operação: Informa os ativos aceitos para a estratégia e o tempo mínimo de permanência (lock-up) recomendado para atingir o rendimento projetado.
##### 02.03. 🔍⛔🌎`[simulation]` simulate yield
- Realiza o cálculo de projeção de lucros para auxiliar a tomada de decisão do usuário antes de um investimento.
- Parâmetros de Entrada: O simulador recebe o valor do aporte pretendido e o identificador da estratégia.
- Base de Cálculo: Utiliza os dados históricos de rendimento (APY) e a volatilidade recente da estratégia para gerar cenários (ex: conservador, moderado e otimista).
- Transparência: O sistema deve retornar o valor bruto projetado e o valor líquido, descontando as taxas de serviço e performance estimadas.
- Aviso de Risco: A resposta deve incluir uma nota obrigatória informando que rendimentos passados não são garantia de resultados futuros.
### 03. Portfolio (User Assets & Performance)
##### 03.01. ⚡⛔🔒`[investment]` create investment intent
- Inicia o processo de investimento capturando a "foto" (snapshot) atual das condições da estratégia selecionada (taxas, APY estimado e cotação do ativo).
- Trava de Cotação: O sistema garante as condições exibidas ao usuário por um tempo determinado (ex: 10 minutos) para que ele finalize o aporte.
- Cria um registro de intenção com status PENDING, vinculando o ID do usuário, o ID da estratégia, o ID da Carteira (wallet_id) de origem e o valor pretendido.
- Verifica se a estratégia ainda possui "capacidade" ou limite disponível para novos aportes antes de confirmar a criação da intenção.
##### 03.02. ⚡⛔🔒`[investment]` confirm investment
- Altera o status de uma intenção de investimento de PENDING para ACTIVE após a confirmação do aporte.
- Validação de Depósito: O sistema confirma se a transferência on-chain foi detectada e validada na carteira de destino da plataforma.
- Ativação de Rendimentos: Registra o timestamp exato do início do investimento para disparar o cálculo de lucros a partir do próximo ciclo de distribuição.
##### 03.03. ⚡⛔🔒`[investment]` cancel investment
- Permite que o usuário ou o sistema (por expiração) cancele uma intenção de investimento que ainda não foi confirmada.
- Restrição de Estado: O cancelamento só é permitido enquanto o status for PENDING; investimentos já ativos requerem fluxo de saque.
- Liberação de Recursos: Desvincula qualquer snapshot de cotação ou reserva de limite que tenha sido travado durante a criação da intenção.
##### 03.04. 🔍⛔🔒`[summary]` get portfolio summary
- Fornece uma visão consolidada e em tempo real do patrimônio do usuário na plataforma.
- Agregação de Saldo: Soma o valor total de todos os investimentos ativos convertidos para a moeda base (ex: USD/USDT).
- Métricas de Lucro: Calcula o lucro acumulado (P&L Total) e o rendimento das últimas 24 horas, permitindo ao usuário ver o crescimento líquido de sua carteira.
##### 03.05. 🔍⛔🔒`[investment]` list investments
- Lista todos os registros de investimento do usuário, permitindo filtragem por status (ACTIVE, CLOSED, PENDING).
- Detalhamento Individual: Para cada investimento, exibe o valor inicial, a estratégia aplicada, o lucro acumulado até o momento e o histórico de estados.
##### 03.06. 🔍⛔🔒`[earning]` list earnings history
- Exibe o histórico cronológico de todos os rendimentos distribuídos para a conta do usuário.
- Rastreabilidade: Cada entrada deve identificar a qual investimento o rendimento pertence, a data da distribuição e o percentual aplicado naquele ciclo.
##### 03.07. 🔍⛔🔒`[audit]` get global transaction timeline
- Fornece uma linha do tempo unificada e imutável de todos os eventos financeiros do usuário.
- Escopo de Eventos: Inclui depósitos, saques, lucros creditados, taxas cobradas e transferências internas.
- Finalidade de Auditoria: Cada evento deve conter um ID de transação e, se aplicável, o link para o explorer da blockchain para garantir transparência total.
##### 03.08. 🔄⛔🌎`[investment]` dispatch coordinates strategy snapshot, wallet signature and balance update
- Orquestrador responsável por garantir a consistência entre o aporte financeiro e a ativação do investimento.
- Validação e Idempotência: Verifica a assinatura da transação e garante que o hash da transação on-chain seja único, impedindo ataques de duplicidade (replay).
- Efetivação de Snapshot: Aplica definitivamente os termos da estratégia (taxas e cotação) que foram travados na intenção (03.01).
- Atualização de Saldo e Confirmações: Move o saldo de "pendente" para "ativo" apenas após a transação on-chain atingir o número mínimo de confirmações de rede definido.
- Tratamento de Falhas: Se a assinatura for inválida ou a transação falhar na rede, a saga dispara o rollback do saldo e marca o investimento para revisão manual.
### 04. Treasury (Financial Operations)
##### 04.01. ⚡⛔🔒`[withdrawal]` create withdrawal request
- Inicia o fluxo de resgate validando se o saldo disponível na carteira específicada (wallet_id) é suficiente para cobrir o valor e as taxas.
- Cálculo de Taxas: O sistema calcula a taxa de rede estimada e a taxa de serviço da plataforma, apresentando o valor líquido que chegará à carteira de destino.
- O sistema aplica as regras de limites globais (mínimos e máximos por transação) definidos nas configurações do sistema.
- Estado de Bloqueio: Ao criar a intenção, o valor é marcado como "Locked", impedindo o uso simultâneo desses fundos em novos investimentos.
- A solicitação é criada com o status PENDING_CONFIRMATION, aguardando obrigatoriamente a validação de 2FA para seguir para o processamento em blockchain.
##### 04.02. ⚡⛔🔒`[withdrawal]` process withdrawal payout
- Realiza a transferência efetiva dos fundos para a carteira de destino após todas as validações de segurança.
- Integração Blockchain: O sistema comunica-se com o nó da rede ou serviço de custódia para transmitir a transação assinada.
- Registro de Hash: Após o envio bem-sucedido, o hash da transação (TXID) é capturado e armazenado no registro do saque para consulta do usuário.
- Monitoramento de Confirmações: O sistema monitora a rede até que a transação atinja o número mínimo de confirmações necessário para ser considerada final.
##### 04.03. ⚡⛔🔒`[withdrawal]` confirm withdrawal (2FA check)
- Atua como a barreira final de segurança antes da execução financeira de qualquer saída de fundos.
- Desafio de Segundo Fator: Exige que o usuário forneça o código OTP (via app ou e-mail) vinculado especificamente àquela intenção de saque.
- Validação de Janela de Tempo: O código de confirmação deve ser validado dentro de um período restrito para garantir que a operação ainda é desejada pelo usuário.
- Promoção de Status: Uma vez validado, o saque é movido de PENDING_CONFIRMATION para READY_FOR_PAYOUT.
##### 04.04. 🔍⛔🔒`[withdrawal]` list withdrawals
- Recupera o histórico completo de solicitações de saque realizadas pelo usuário.
- Filtros e Status: Permite visualizar saques por período ou estado, como PENDING, PROCESSING, COMPLETED ou FAILED.
- Transparência de Taxas: Exibe o valor bruto solicitado, as taxas retidas e o valor líquido efetivamente enviado para a blockchain.
##### 04.05. 🔄⛔🌎`[withdrawal]` dispatch coordinates 2fa verification, balance locking and blockchain execution
- Orquestrador responsável pela atomicidade e segurança da retirada de fundos.
- Fase 1: Verificação de Segurança: Valida o desafio de 2FA e a integridade do dispositivo solicitante.
- Fase 2: Bloqueio de Saldo: Transfere o valor para o status "Bloqueado para Saque", impedindo o uso simultâneo desses fundos.
- Fase 3: Execução e Reconciliação (Watchdog): Dispara a ordem para a blockchain e ativa um monitor (worker) para acompanhar o status da transação em caso de queda do sistema ou timeout da rede.
- Fase 4: Finalização: Após a confirmação do hash na rede, o sistema marca o saque como COMPLETED e abate o saldo total.
- Compensação: Se a transação on-chain falhar permanentemente, o sistema reverte o bloqueio, devolvendo o saldo ao usuário e notificando-o.
### 05. Signal (Alerts & Communication)
##### 05.01. ⚡⛔🔒`[notice]` send notice (push/in-app)
- Gerencia o disparo de mensagens transacionais e informativas para o usuário.
- Multi-canal: O sistema tenta entregar a notificação via push para dispositivos móveis registrados e simultaneamente a armazena na caixa de entrada in-app.
- Priorização: Define a urgência da mensagem (ex: Alerta de Segurança vs. Novidade no Catálogo) para determinar a forma de exibição.
##### 05.02. ⚡⛔🔒`[notice]` mark notice as read
- Permite que o usuário gerencie o estado de visualização de suas notificações.
- Controle de Notificados: Atualiza o timestamp de leitura e remove o alerta de "não lido" do contador global da interface.
##### 05.03. 🔍⛔🔒`[notice]` list notices (inbox)
- Lista todas as comunicações enviadas para o usuário, funcionando como uma central de mensagens.
- Persistência: Mantém o histórico de mensagens mesmo após lidas, permitindo que o usuário consulte alertas antigos de investimentos ou segurança.
### 06. System (Health & Configuration)
##### 06.01. 🔍✅🌎`[system]` healthcheck
- Valida se o banco de dados, cache, mensageria e storage estão operacionais.
##### 06.02. 🔍⛔🌎`[system]` get configuration
- Fornece ao frontend os parâmetros globais e dinâmicos necessários para a operação da interface.
- Limites e Taxas: Retorna os valores atuais de saque mínimo, taxas de serviço por estratégia e limites de depósito globais.
- Feature Flags: Informa quais funcionalidades estão ativas ou em manutenção (ex: se o vínculo de carteiras está temporariamente desativado).
##### 06.03. ⚡⛔🔒`[system]` send support ticket/feedback
- Canal direto para o usuário enviar relatos de erros, dúvidas ou sugestões para a equipe de suporte.
- Contextualização: O sistema anexa automaticamente metadados (versão do app, ID do usuário, sistema operacional) para facilitar o diagnóstico pelo back-office.

---

# Global Security Rules (System-wide)

Estas regras aplicam-se transversalmente a todos os casos de uso para garantir a integridade da plataforma.

### 01. Rate Limiting & Anti-Abuse
Global Rate Limit: Cada IP está restrito a um máximo de X requisições por minuto para prevenir DoS e brute-force.
- Sensitive Route Limit: Rotas de autenticação (/login, /reset-password) possuem limites mais rígidos e implementam Exponential Backoff após 3 tentativas falhas.
- IP Reputation: Bloqueio automático de IPs identificados em listas de spam ou redes Tor para operações financeiras sensíveis.
### 02. Session & Identity Management
- Concurrent Sessions: O sistema permite apenas uma sessão ativa por dispositivo; o login em um novo dispositivo pode, opcionalmente, invalidar o anterior.
- ✅ Absolute Timeout: Sessões são invalidadas obrigatoriamente após 24 horas, independentemente da atividade, exigindo nova autenticação.
- Device Fingerprinting: Mudanças drásticas no fingerprint do dispositivo ou localização geográfica (ex: mudança de país em 1h) disparam obrigatoriamente um desafio de 2FA.
### 03. Financial Safeguards & Limits
- Withdrawal Cooling-off: Após a troca de senha ou alteração de 2FA, os saques são bloqueados por 48 horas para prevenir drenagem de fundos em contas comprometidas.
- Transaction Velocity: Alerta automático e bloqueio temporário se o volume de transações de um usuário exceder 300% de sua média histórica em um curto período.
- Maximum Slippage: Em operações de swap ou investimento, o sistema rejeita ordens onde a variação de preço (slippage) seja superior a X% para proteger o usuário de front-running.
### 04. Data Privacy & Compliance
- PII Scrubbing: Logs de erro e auditoria nunca devem conter dados sensíveis como MNEMONICS, chaves privadas, senhas em texto puro ou tokens JWT.
- Field Sanitization: Todo input de usuário deve ser sanitizado contra XSS e SQL Injection antes de qualquer processamento na camada de domínio.