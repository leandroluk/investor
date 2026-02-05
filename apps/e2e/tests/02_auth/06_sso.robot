*** Settings ***
Documentation       Authentication token refresh test suite

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite


*** Variables ***
${SSO_URL}              sso/google
${AUTH_TOKEN_URL}       auth/login/token
${CALLBACK_URL}         http://whatever.local/callback


*** Test Cases ***
Complete Login Using SSO
    [Documentation]    Full flow: redirect to provider, redirecto to callback_url, send token to login
    ${token}=    Get SSO Token From Redirect
    ${auth_data}=    Exchange Token For Auth Token    ${token}
    Validate Authorization Token    ${auth_data}


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and prepares the environment
    Create Session    api_session    ${ROBOT_URL}    verify=True
    Mailbox Delete All Emails

Teardown Test Suite
    [Documentation]    Cleans up resources after suite execution
    Delete All Sessions

Get SSO Token From Redirect
    [Documentation]    Follows redirects manually until the token is found in the Location header, avoiding broken URLs.
    VAR    ${current_url}=    ${SSO_URL}
    VAR    &{params}=    callback_url=${CALLBACK_URL}
    FOR    ${_}    IN RANGE    10
        ${location}=    Get SSO Token From Redirect Request    ${current_url}    ${params}
        ${reached_callback}=    Run Keyword And Return Status    Should Start With    ${location}    ${CALLBACK_URL}
        IF    ${reached_callback}
            ${token}=    Url Extract Query Param    ${location}    token
            RETURN    ${token}
        END
        VAR    ${current_url}=    ${location}
    END
    Fail    Max redirects exceeded without reaching callback.

Get SSO Token From Redirect Request
    [Documentation]    Performs a single GET request and returns the Location header
    [Arguments]    ${current_url}    ${params}
    ${resp}=    GET On Session    api_session    ${current_url}    params=${params}    allow_redirects=${False}
    VAR    &{params}=    &{EMPTY}
    ${location}=    Get From Dictionary    ${resp.headers}    Location    default=${None}
    IF    '${location}' == '${None}'
        Fail    Redirect flow stopped unexpectedly. Status: ${resp.status_code}
    END
    RETURN    ${location}

Exchange Token For Auth Token
    [Documentation]    Exchanges the token for an auth token
    [Arguments]    ${token}
    VAR   &{body} =    token=${token}
    ${response}=    POST On Session    api_session    ${AUTH_TOKEN_URL}    data=${body}    expected_status=200
    RETURN   ${response.json()}

Validate Authorization Token
    [Documentation]    Validates the authorization token
    [Arguments]    ${auth_data}
    Dictionary Should Contain Key    ${auth_data}    tokenType
    Dictionary Should Contain Key    ${auth_data}    accessToken
    Dictionary Should Contain Key    ${auth_data}    expiresIn
    Dictionary Should Contain Key    ${auth_data}    refreshToken
    Should Be Equal        ${auth_data}[tokenType]    Bearer
    Should Not Be Equal    ${auth_data}[accessToken]    ${EMPTY}
    Should Not Be Equal    ${auth_data}[expiresIn]    ${EMPTY}
    Should Not Be Equal    ${auth_data}[refreshToken]    ${EMPTY}
