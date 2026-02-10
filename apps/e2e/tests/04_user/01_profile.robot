*** Settings ***
Documentation    Get and update user profile

Resource    ../../resources/util.resource

Suite Setup    Setup Test Suite
Suite Teardown    Teardown Test Suite

*** Variables ***
${PROFILE_PATH}     user/profile
${TEST_EMAIL}       ${EMPTY}

*** Test Cases ***
Complete Profile Flow
    [Documentation]    Register > Login > Get Profile > Update Profile
    ${TEST_EMAIL} =    Postgres Create Test User
    &{auth_data} =    Auth Login With Credentials    ${TEST_EMAIL}    Test@123
    ${profile1} =    Get Profile    ${auth_data.accessToken}
    Should Not Be Empty    ${profile1}
    Update Profile    ${auth_data.accessToken}    ${profile1}
    ${profile2} =    Get Profile    ${auth_data.accessToken}
    Should Not Be Empty    ${profile2}
    Compare Profiles    ${profile1}    ${profile2}


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
    Validate Get Profile    &{response_data}
    RETURN    ${response_data}

Validate Get Profile
    [Documentation]    Validate properties on profile
    [Arguments]    &{profile}
    Should Not Be Empty    ${profile.name}
    Should Not Be Empty    ${profile.status}
    Should Not Be Empty    ${profile.walletVerifiedAt}
    Should Not Be Empty    ${profile.kycStatus}
    Should Not Be Empty    ${profile.kycVerifiedAt}
    Should Not Be Empty    ${profile.twoFactorEnabled}
    Should Not Be Empty    ${profile.language}
    Should Not Be Empty    ${profile.timezone}

Update Profile
    [Documentation]    Updates user profile
    [Arguments]    ${accessToken}   ${profile}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    VAR    &{body} =    =
    ...    name=New ${profile.name}
    ...    twoFactorEnabled=${not ${profile.twoFactorEnabled}}
    ...    language=pt
    ...    timezone=America/Sao_Paulo
    ${response} =    PUT On Session    api_session    ${PROFILE_PATH}    json=${body}    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    200
    RETURN    ${response.json()}

Compare Profiles
    [Documentation]    Compare profiles
    [Arguments]    ${profile1}    ${profile2}
    Should Not Be Equal As Strings    ${profile1.name}    ${profile2.name}
    Should Not Be Equal As Strings    ${profile1.twoFactorEnabled}    ${profile2.twoFactorEnabled}
    Should Not Be Equal As Strings    ${profile1.language}    ${profile2.language}
    Should Not Be Equal As Strings    ${profile1.timezone}    ${profile2.timezone}
