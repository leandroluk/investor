*** Settings ***
Documentation       Account registration suite using shared resources

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite


*** Test Cases ***
Complete Registration Flow
    [Documentation]    Complete registration and login flow
    [Tags]    auth    registration_flow
    ${test_email} =    Register New Account
    ${first_otp} =    Get First Activation Code    ${test_email}
    ${second_otp} =    Resend And Get New Code    ${test_email}    ${first_otp}
    Activate Account With OTP    ${test_email}    ${second_otp}
    Login With Activated Account    ${test_email}


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and cleans IMAP inbox
    Create Session    api_session    ${API_URL}    verify=True
    Delete All Emails From Mailbox

Teardown Test Suite
    [Documentation]    Closes all sessions
    Delete All Sessions

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
    ${otp} =    Get OTP From Email    ${email}    max_attempts=12    wait_between_attempts=5s
    RETURN    ${otp}

Resend And Get New Code
    [Documentation]    Triggers resend and returns new unique OTP
    [Arguments]    ${email}    ${previous_otp}
    Request Activation Code Resend    ${email}
    ${new_otp} =    Get OTP From Email    ${email}    max_attempts=12
    Should Not Be Equal    ${previous_otp}    ${new_otp}    msg=Resent OTP must be different
    RETURN    ${new_otp}

Request Activation Code Resend
    [Documentation]    Sends POST to resend activation code
    [Arguments]    ${email}
    VAR    &{resend_payload} =
    ...    email=${email}
    POST On Session    api_session    auth/activate    json=&{resend_payload}    expected_status=202

Activate Account With OTP
    [Documentation]    Sends PATCH to activate the account
    [Arguments]    ${email}    ${otp}
    VAR    &{payload} =
    ...    email=${email}
    ...    otp=${otp}
    PATCH On Session    api_session    auth/activate    json=&{payload}    expected_status=202

Login With Activated Account
    [Documentation]    Logins and validates JWT tokens
    [Arguments]    ${email}
    ${auth_data} =    Login With Credentials    ${email}    Test@123
    Dictionary Should Contain Key    ${auth_data}    accessToken
    RETURN    ${auth_data}
