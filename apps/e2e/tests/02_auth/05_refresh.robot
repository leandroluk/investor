*** Settings ***
Documentation       Authentication token refresh test suite

Resource            ../../resources/util.resource

Suite Setup         Setup Refresh Suite
Suite Teardown      Teardown Refresh Suite


*** Variables ***
${REFRESH_PATH}     auth/refresh


*** Test Cases ***
Complete Token Refresh Flow
    [Documentation]    Full flow: register, activate, login, and refresh the session token
    [Tags]    auth    token_refresh
    ${test_email} =    Create Active User For Testing
    ${auth_data} =    Login And Get Auth Data    ${test_email}
    Sleep    1.1s
    ${new_auth_data} =    Perform Token Refresh    ${auth_data['refresh_token']}
    Validate New Session Data    ${auth_data['access_token']}    ${new_auth_data}


*** Keywords ***
Setup Refresh Suite
    [Documentation]    Initializes API session and prepares the environment
    Create Session    api_session    ${API_URL}    verify=True
    Delete All Emails From Mailbox

Teardown Refresh Suite
    [Documentation]    Cleans up resources after suite execution
    Delete All Sessions

Create Active User For Testing
    [Documentation]    Registers and activates a new user, returning the email
    ${random_str} =    Generate Random String    10    [LOWER]
    VAR    ${email} =    refresh_${random_str}@email.com

    # 1. Register account
    VAR    &{reg_payload} =
    ...    email=${email}
    ...    password=Test@123
    ...    name=Refresh User
    POST On Session    api_session    auth/register    json=&{reg_payload}    expected_status=201

    # 2. Activate account
    ${otp} =    Get OTP From Email    ${email}
    VAR    &{act_payload} =
    ...    email=${email}
    ...    otp=${otp}
    PATCH On Session    api_session    auth/activate    json=&{act_payload}    expected_status=200

    RETURN    ${email}

Login And Get Auth Data
    [Documentation]    Logs in and returns the full authentication dictionary
    [Arguments]    ${email}
    ${auth_data} =    Login With Credentials    ${email}    Test@123
    Dictionary Should Contain Key    ${auth_data}    accessToken
    RETURN    ${auth_data}

Perform Token Refresh
    [Documentation]    Calls the refresh endpoint and returns the new token data
    [Arguments]    ${token}

    # Using Python evaluation to handle the JWT string safely
    VAR    ${refresh_payload} =    ${{{"refresh_token": $token}}}

    # Perform POST request to refresh the token
    ${response} =    POST On Session
    ...    api_session
    ...    ${REFRESH_PATH}
    ...    json=${refresh_payload}
    ...    expected_status=200

    RETURN    ${response.json()}

Validate New Session Data
    [Documentation]    Verifies that the new access token is valid and unique
    [Arguments]    ${old_access_token}    ${new_auth_data}

    # Validate mandatory fields in the refresh response
    Dictionary Should Contain Key    ${new_auth_data}    access_token
    Dictionary Should Contain Key    ${new_auth_data}    refresh_token
    Dictionary Should Contain Key    ${new_auth_data}    expires_in

    # Check if access token actually changed
    VAR    ${new_access_token} =    ${new_auth_data['access_token']}
    Should Not Be Empty    ${new_access_token}

    # This assertion will now pass thanks to the Sleep in Step 3
    Should Not Be Equal    ${old_access_token}    ${new_access_token}
    ...    msg=New access token must be different from the old one

    Log    Token refresh successful. Session extended.    level=INFO
