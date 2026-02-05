*** Settings ***
Documentation       Authentication token refresh test suite

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite


*** Variables ***
${2FA_PATH}         auth/2fa
${TEST_EMAIL}       ${EMPTY}


*** Test Cases ***
Complete 2FA Authentication Flow
    [Documentation]    Full flow: register, enable 2FA, login, get OTP, authorize 2FA, validate
    ${TEST_EMAIL} =    Register New Account
    Enable User And Set To Use 2FA On Database    ${TEST_EMAIL}
    ${auth_data} =    Login With Activated Account    ${TEST_EMAIL}
    Validate Authorization Token    ${auth_data}
    Resend 2FA To Email    ${TEST_EMAIL}
    ${otp} =    Get OTP Code To 2FA From Email    ${TEST_EMAIL}
    ${challenge_id} =    Get ChallengeId From Postgres    ${TEST_EMAIL}    ${otp}
    Authorize 2FA    ${challenge_id}    ${otp}


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and prepares the environment
    Create Session    api_session    ${ROBOT_URL}    verify=True
    Postgres Connect
    Mailbox Delete All Emails

Teardown Test Suite
    [Documentation]    Cleans up resources after suite execution
    Delete All Sessions
    Postgres Delete User By Email    ${TEST_EMAIL}
    Postgres Disconnect

Register New Account
    [Documentation]    Registers user and returns random email
    ${random_str} =    Generate Random String    10    [LOWER]
    VAR    ${random_email} =    test_${random_str}@email.com
    VAR    &{payload} =
    ...    email=${random_email}
    ...    password=Test@123
    ...    name=User ${random_str}
    POST On Session    api_session    auth/register    json=&{payload}    expected_status=201
    RETURN    ${random_email}

Enable User And Set To Use 2FA On Database
    [Documentation]    Enables 2FA on the database for the given email
    [Arguments]    ${email}

    Postgres Execute
    ...    UPDATE "user" SET "two_factor_enabled" = true, "status" = 'ACTIVE' WHERE email = '${email}'

Login With Activated Account
    [Documentation]    Logins and validates JWT tokens
    [Arguments]    ${email}
    ${auth_data} =    Auth Login With Credentials    ${email}    Test@123    200
    RETURN    ${auth_data}

Get OTP Code To 2FA From Email
    [Documentation]    Retrieves the OTP code from the email
    [Arguments]    ${email}
    ${otp} =    Mailbox Get OTP From Email    ${email}
    RETURN    ${otp}

Resend 2FA To Email
    [Documentation]    Sends PATCH to activate the account
    [Arguments]    ${email}
    VAR    &{payload} =
    ...    email=${email}
    POST On Session    api_session    ${2FA_PATH}    json=&{payload}    expected_status=200

Get ChallengeId From Postgres
    [Documentation]    Retrieves the challenge ID from the database
    [Arguments]    ${email}    ${otp}
    ${query} =    Catenate
    ...    SELECT "id"
    ...    FROM "challenge"
    ...    WHERE "user_id" = (SELECT "id" FROM "user" WHERE "email" = '${email}')
    ...    AND "status" = 'PENDING'
    ...    AND "expires_at" > NOW()
    ...    AND "code" = '${otp}'
    ...    LIMIT 1
    ${rows} =    Postgres Query    ${query}
    RETURN    ${rows[0]['id']}

Authorize 2FA
    [Documentation]    Sends PATCH to activate the account
    [Arguments]    ${challengeId}    ${otp}
    VAR    &{payload} =
    ...    challengeId=${challengeId}
    ...    otp=${otp}
    PUT On Session    api_session    ${2FA_PATH}    json=&{payload}    expected_status=200

Validate Authorization Token
    [Documentation]    Validates the authorization token
    [Arguments]    ${auth_data}
    Dictionary Should Contain Key    ${auth_data}    tokenType
    Dictionary Should Contain Key    ${auth_data}    accessToken
    Dictionary Should Contain Key    ${auth_data}    expiresIn
    Dictionary Should Contain Key    ${auth_data}    refreshToken
    Should Be Equal    ${auth_data}[tokenType]    Bearer
    Should Not Be Equal    ${auth_data}[accessToken]    ${EMPTY}
    Should Not Be Equal    ${auth_data}[expiresIn]    ${EMPTY}
    Should Not Be Equal    ${auth_data}[refreshToken]    ${EMPTY}
