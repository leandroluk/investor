*** Settings ***
Documentation       Password recovery and reset test suite

Resource            ../../resources/util.resource

Suite Setup         Setup Recovery Suite
Suite Teardown      Teardown Recovery Suite


*** Variables ***
${RECOVER_PATH}     auth/recover
${NEW_PASSWORD}     NewTest@123


*** Test Cases ***
Complete Recovery Flow
    [Documentation]    Complete password recovery and reset flow
    [Tags]    auth    recovery_flow
    ${test_email} =    Create Active User For Recovery
    ${recovery_otp} =    Request Recovery And Get Code    ${test_email}
    Perform Password Reset    ${test_email}    ${recovery_otp}    ${NEW_PASSWORD}
    Login With New Password    ${test_email}    ${NEW_PASSWORD}


*** Keywords ***
Setup Recovery Suite
    [Documentation]    Initializes API session and cleans the mailbox
    Create Session    api_session    ${API_URL}    verify=True
    Delete All Emails From Mailbox

Teardown Recovery Suite
    [Documentation]    Cleans up resources after tests
    Delete All Sessions

Create Active User For Recovery
    [Documentation]    Registers and activates a new user, returning the email
    ${random_str} =    Generate Random String    10    [LOWER]
    VAR    ${email} =    recover_${random_str}@email.com

    # 1. Register User
    VAR    &{reg_payload} =
    ...    email=${email}
    ...    password=OldPassword@123
    ...    name=Recovery User
    POST On Session    api_session    auth/register    json=&{reg_payload}    expected_status=201

    # 2. Activate User
    ${activation_otp} =    Get OTP From Email    ${email}
    VAR    &{act_payload} =
    ...    email=${email}
    ...    otp=${activation_otp}
    PATCH On Session    api_session    auth/activate    json=&{act_payload}    expected_status=202

    Log    User created and activated: ${email}    level=INFO
    RETURN    ${email}

Request Recovery And Get Code
    [Documentation]    Requests password recovery and retrieves OTP from email
    [Arguments]    ${email}

    # 1. POST request to initiate recovery
    VAR    &{payload} =
    ...    email=${email}
    POST On Session    api_session    ${RECOVER_PATH}    json=&{payload}    expected_status=202

    # 2. Get OTP
    ${otp} =    Get OTP From Email    ${email}
    RETURN    ${otp}

Perform Password Reset
    [Documentation]    Performs the password reset using the PATCH method
    [Arguments]    ${email}    ${otp}    ${new_pass}

    VAR    &{payload} =
    ...    email=${email}
    ...    password=${new_pass}
    ...    otp=${otp}
    PATCH On Session    api_session    ${RECOVER_PATH}    json=&{payload}    expected_status=200
    Log    Password reset successfully for: ${email}    level=INFO

Login With New Password
    [Documentation]    Verifies login with new password and validates access token
    [Arguments]    ${email}    ${password}
    ${auth_data} =    Login With Credentials    ${email}    ${password}
    Dictionary Should Contain Key    ${auth_data}    accessToken
    RETURN    ${auth_data}
