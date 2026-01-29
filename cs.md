legend:
- ⛔ not implemented yet
- ✅ doc generated and implemented
- ✔️ end to end generated

---

- iam (Identity & Access Management)
  - application/command
    - ⛔ [auth] register user using email and password
    - ⛔ [auth] activate user using email and code
    - ⛔ [auth] login using email and password
    - ⛔ [auth] authorize 2fa code
    - ⛔ [sso] login using internal sso code
    - ⛔ [profile] update user profile
    - ⛔ [device] register device (push token)
    - ⛔ [device] revoke device (remote logout)

  - application/query
    - ⛔ [auth] check if email is available
    - ⛔ [sso] get sso redirect url
    - ⛔ [profile] get user profile
    - ⛔ [device] list active devices

  - application/saga
    - ⛔ [onboarding] coordination between registration, welcome email and initial notification

- catalog (Market Data & Public Info)
  - application/query
    - ⛔ [assets] list supported assets
    - ⛔ [strategies] list investment strategies
    - ⛔ [simulation] simulate yield

- portfolio (User Assets & Performance)
  - application/command
    - ⛔ [investment] create investment intent
    - ⛔ [investment] confirm investment
    - ⛔ [investment] cancel investment
  
  - application/query
    - ⛔ [summary] get portfolio summary
    - ⛔ [investment] list investments
    - ⛔ [earning] list earnings history

  - application/saga
    - ⛔ [investment-flow] coordinates strategy snapshot, wallet signature and balance update

- treasury (Financial Operations)
  - application/command
    - ⛔ [withdrawal] create withdrawal request
    - ⛔ [withdrawal] process withdrawal payout
    - ⛔ [withdrawal] confirm withdrawal (2FA check)

  - application/query
    - ⛔ [withdrawal] list withdrawals

  - application/saga
    - ⛔ [withdrawal-flow] coordinates 2fa verification, balance locking and blockchain execution

- support (System & Communication)
  - application/command
    - ⛔ [notification] send push notification
    - ⛔ [notification] mark as read
  
  - application/query
    - ⛔ [system] healthcheck
    - ⛔ [system] get configuration
    - ⛔ [notification] list inbox notifications