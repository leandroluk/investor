*** Settings ***
Documentation       Account registration suite using shared resources

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite

*** Variables ***
${CHECK_PATH}       auth/check/email


*** Test Cases ***
Should Throw When Email In Use
    [Documentation]    Complete registration and login flow
    [Tags]    auth    registration_flow
    ${test_email} =    Register New Account
    Do Check    ${test_email}    409

Should Return When Email Not In Use
    [Documentation]    Complete registration and login flow
    [Tags]    auth    registration_flow
    ${random_str} =    Generate Random String    10    [LOWER]
    VAR    ${random_email} =    test_${random_str}@email.com
    Do Check    ${random_email}    204


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and cleans IMAP inbox
    Create Session    api_session    ${API_URL}    verify=True
    Connect To Postgres
    Execute Postgres    TRUNCATE TABLE "user" CASCADE;
    Delete All Emails From Mailbox

Teardown Test Suite
    [Documentation]    Closes all sessions
    Delete All Sessions
    Disconnect From Postgres

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

Do Check
    [Documentation]    Checks if email is in use
    [Arguments]    ${email}    ${expected_status}
    VAR    ${full_path} =    ${CHECK_PATH}/${email}
    GET On Session    api_session    ${full_path}    expected_status=${expected_status}
