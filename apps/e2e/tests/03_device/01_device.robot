*** Settings ***
Documentation       Account registration suite using shared resources

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite


*** Variables ***
${DEVICE_PATH}      device
${TEST_EMAIL}       ${EMPTY}


*** Test Cases ***
Complete Device Flow
    [Documentation]    Register > Login > Devices[0] > Register Device > Devices[1] > Revoke > Devices[0]
    ${TEST_EMAIL} =    Postgres Create Test User
    &{auth_data} =    Auth Login With Credentials    ${TEST_EMAIL}    Test@123
    ${active_device_list} =    List Active Device    ${auth_data.accessToken}
    Should Be Empty    ${active_device_list}
    Register Device    ${auth_data.accessToken}
    @{active_device_list} =    List Active Device    ${auth_data.accessToken}
    Should Not Be Empty    ${active_device_list}
    Revoke Device    ${active_device_list[0]}[id]    ${auth_data.accessToken}
    ${active_device_list} =    List Active Device    ${auth_data.accessToken}
    Should Be Empty    ${active_device_list}


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

List Active Device
    [Documentation]    Lists active device
    [Arguments]    ${accessToken}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    ${response} =    GET On Session    api_session    ${DEVICE_PATH}    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    200
    RETURN    ${response.json()}[items]

Register Device
    [Documentation]    Registers a device
    [Arguments]    ${accessToken}
    VAR    &{payload} =
    ...    platform=ios
    ...    brand=Apple
    ...    name=My iPhone
    ...    model=iPhone 15 Pro
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    ${response} =    POST On Session    api_session    ${DEVICE_PATH}    json=&{payload}    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    201

Revoke Device
    [Documentation]    Revokes a device
    [Arguments]    ${deviceId}    ${accessToken}
    VAR    ${full_path} =    ${DEVICE_PATH}/${deviceId}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    DELETE On Session    api_session    ${full_path}    headers=&{headers}    expected_status=204
