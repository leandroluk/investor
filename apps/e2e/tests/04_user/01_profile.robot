*** Settings ***
Documentation       Get and update user profile

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite


*** Variables ***
${PROFILE_PATH}     user/profile
${TEST_EMAIL}       ${EMPTY}


*** Test Cases ***
Complete Profile Flow
    [Documentation]    Register > Login > List Document (Empty) > Update Document >
    ${TEST_EMAIL} =    Postgres Create Test User
    &{auth_data} =    Auth Login With Credentials    ${TEST_EMAIL}    Test@123
    ${profile1} =    Get Profile    ${auth_data.accessToken}
    Should Not Be Empty    ${profile1}
    Update Profile    ${auth_data.accessToken}    ${profile1}
    ${profile2} =    Get Profile    ${auth_data.accessToken}
    Should Not Be Empty    ${profile2}
    Compare Profiles    ${profile1}    ${profile2}
    ${kyc} =    Get KYC    ${auth_data.accessToken}
    Should Not Be Empty    ${kyc}


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and cleans IMAP inbox
    Create Session    api_session    ${ROBOT_URL}    verify=True
    Postgres Connect

Teardown Test Suite
    [Documentation]    Closes all sessions
    Delete All Sessions
    Postgres Delete User By Email    ${TEST_EMAIL}
    Postgres Disconnect

Get Profile
    [Documentation]    Gets user profile
    [Arguments]    ${accessToken}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    ${response} =    GET On Session    api_session    ${PROFILE_PATH}    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    200
    VAR    ${response_data} =    ${response.json()}
    From Get Profile Validate User Property    &{response_data}
    From Get Profile Validate Profile Property    &{response_data}
    RETURN    ${response_data}

From Get Profile Validate User Property
    [Documentation]    Validate properties on profile
    [Arguments]    &{data}
    Dictionary Should Contain Key    ${data}    user
    Dictionary Should Contain Key    ${data}[user]    email
    Dictionary Should Contain Key    ${data}[user]    role
    Dictionary Should Contain Key    ${data}[user]    status
    Dictionary Should Contain Key    ${data}[user]    twoFactorEnabled

From Get Profile Validate Profile Property
    [Documentation]    Validate properties on profile
    [Arguments]    &{data}
    Dictionary Should Contain Key    ${data}    profile
    Dictionary Should Contain Key    ${data}[profile]    name
    Dictionary Should Contain Key    ${data}[profile]    language
    Dictionary Should Contain Key    ${data}[profile]    timezone

Get KYC
    [Documentation]    Gets user kyc
    [Arguments]    ${accessToken}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    ${response} =    GET On Session    api_session    user/kyc    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    200
    VAR    ${response_data} =    ${response.json()}
    Dictionary Should Contain Key    ${response_data}    status
    Dictionary Should Contain Key    ${response_data}    level
    RETURN    ${response_data}

Update Profile
    [Documentation]    Updates user profile
    [Arguments]    ${accessToken}    ${data}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    VAR    &{user_changes} =    twoFactorEnabled=${{ not ${data}[user][twoFactorEnabled] }}
    VAR    &{profile_changes} =
    ...    name=New ${data}[profile][name]
    ...    language=pt
    ...    timezone=America/Sao_Paulo
    VAR    &{body} =    user=&{user_changes}    profile=&{profile_changes}
    ${response} =    PUT On Session    api_session    ${PROFILE_PATH}    json=${body}    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    200
    RETURN    ${response.json()}

Compare Profiles
    [Documentation]    Compare profiles
    [Arguments]    ${data1}    ${data2}
    Should Not Be Equal As Strings    ${data1}[profile][name]    ${data2}[profile][name]
    Should Not Be Equal    ${data1}[user][twoFactorEnabled]    ${data2}[user][twoFactorEnabled]
    Should Not Be Equal As Strings    ${data1}[profile][language]    ${data2}[profile][language]
    Should Not Be Equal As Strings    ${data1}[profile][timezone]    ${data2}[profile][timezone]
