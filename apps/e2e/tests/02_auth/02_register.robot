*** Settings ***
Documentation       Account registration suite using shared resources

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite

*** Variables ***
${TEST_EMAIL}    ${EMPTY}


*** Test Cases ***
Complete Registration Flow
    [Documentation]    Complete registration and login flow
    ${TEST_EMAIL} =    Register New Account
    ${first_otp} =    Get First Activation Code    ${TEST_EMAIL}
    ${second_otp} =    Resend And Get New Code    ${TEST_EMAIL}    ${first_otp}
    Activate Account With OTP    ${TEST_EMAIL}    ${second_otp}
    Login With Activated Account    ${TEST_EMAIL}


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and cleans IMAP inbox
    Create Session    api_session    ${ROBOT_URL}    verify=True
    Postgres Connect
    Mailbox Delete All Emails

Teardown Test Suite
    [Documentation]    Closes all sessions
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

Get First Activation Code
    [Documentation]    Fetches initial OTP from email
    [Arguments]    ${email}
    ${otp} =    Mailbox Get OTP From Email    ${email}    max_attempts=12    wait_between_attempts=5s
    RETURN    ${otp}

Resend And Get New Code
    [Documentation]    Triggers resend and returns new unique OTP
    [Arguments]    ${email}    ${previous_otp}
    Request Activation Code Resend    ${email}
    ${new_otp} =    Mailbox Get OTP From Email    ${email}    max_attempts=12
    Should Not Be Equal    ${previous_otp}    ${new_otp}    msg=Resent OTP must be different
    RETURN    ${new_otp}

Request Activation Code Resend
    [Documentation]    Sends POST to resend activation code
    [Arguments]    ${email}
    VAR    &{resend_payload} =
    ...    email=${email}
    POST On Session    api_session    auth/activate    json=&{resend_payload}    expected_status=200

Activate Account With OTP
    [Documentation]    Sends PATCH to activate the account
    [Arguments]    ${email}    ${otp}
    VAR    &{payload} =
    ...    email=${email}
    ...    otp=${otp}
    PUT On Session    api_session    auth/activate    json=&{payload}    expected_status=200

Login With Activated Account
    [Documentation]    Logins and validates JWT tokens
    [Arguments]    ${email}
    ${auth_data} =    Auth Login With Credentials    ${email}    Test@123
    Dictionary Should Contain Key    ${auth_data}    accessToken
    RETURN    ${auth_data}
