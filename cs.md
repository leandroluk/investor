legend:
- ⛔ not implemented yet
- ✅ doc generated and implemented
- ✔️ end to end generated

---

- api
  - system
    - ⛔ healthcheck
    - ⛔ get configuration (maintenance_mode, min_version) # Faltou este para o App checar antes de abrir
  
  - auth (Identity & Access)
    - ⛔ check if email is available
    - ⛔ register user using email and password
    - ⛔ activate user using email and code
    - ⛔ resend activation code for email
    - ⛔ send reset password for email
    - ⛔ reset password using email, new password and code
    - ⛔ login using email and password
    - ⛔ refresh authorization token
    - ⛔ authorize 2fa code (Login challenge)
    - ⛔ register device (Save push token)

  - sso (OAuth2 / OIDC)
    - ⛔ redirect to sso provider passing callback url as state
    - ⛔ callback from sso provider callbacking to initial url with internal code
    - ⛔ login using internal code

  - me (User Profile & Security)
    - ⛔ get user
    - ⛔ update user profile (name, avatar)
    - ⛔ revoke device (Remote logout)
    - ⛔ logoff
    - ⛔ link web3 wallet (Sign-in with Ethereum)
    - ⛔ unlink web3 wallet
    - ⛔ setup 2fa (Generate Secret/QR Code) # CRÍTICO: Faltou a etapa de configuração
    - ⛔ enable 2fa (Verify first code to activate) # CRÍTICO: Ativação efetiva

  - assets (Public Data)
    - ⛔ list supported assets (ETH, USDC addresses)
    - ⛔ list investment strategies (Conservative, Aggressive)
    - ⛔ simulate yield (Strategy + Amount projection)

  - my (User Resources)
    - ⛔ get portfolio summary (Total balance + Earnings)
    
    - investments
      - ⛔ list investments
      - ⛔ create investment intent (Returns pending ID & Strategy Snapshot)
      - ⛔ confirm investment (Send tx_hash after wallet signature)
      - ⛔ cancel investment (Only if pending)
      
    - earnings
      - ⛔ list earnings history (Daily payouts)
    
    - withdrawals
      - ⛔ list withdrawals
      - ⛔ create withdrawal request
      - ⛔ confirm withdrawal (2FA check before processing)
    
    - notifications
      - ⛔ list notifications (Inbox)
      - ⛔ mark notification as read