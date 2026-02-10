*** Settings ***
Documentation       Get and update user document

Resource            ../../resources/util.resource
Library    RequestsLibrary

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite

*** Variables ***
${DOCUMENT_PATH}    user/document
${TEST_EMAIL}       ${EMPTY}


*** Test Cases ***
Complete Profile Flow
    [Documentation]    Register > Login > List Document (Empty) > Update Document > List Document (NotEmpty)
    ${TEST_EMAIL} =    Postgres Create Test User
    &{auth_data} =    Auth Login With Credentials    ${TEST_EMAIL}    Test@123
    ${document1} =    Get List Document    ${auth_data.accessToken}
    Should Be Empty    ${document1}[items]
    Upload Document    ${auth_data.accessToken}
    ${document2} =    Get List Document    ${auth_data.accessToken}
    Should Not Be Empty    ${document2}


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

Get List Document
    [Documentation]    Gets user list document
    [Arguments]    ${accessToken}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    ${response} =    GET On Session    api_session    ${DOCUMENT_PATH}    headers=&{headers}
    Should Be Equal As Strings    ${response.status_code}    200
    VAR    ${response_data} =    ${response.json()}
    IF    $response_data['items']
        Validate Get Document    ${response_data}[items]
    END
    RETURN    ${response_data}

Validate Get Document
    [Documentation]    Validate properties on document
    [Arguments]    ${items}
    VAR    ${item} =    ${items}[0]
    Dictionary Should Contain Key    ${item}    id
    Dictionary Should Contain Key    ${item}    createdAt
    Dictionary Should Contain Key    ${item}    updatedAt
    Dictionary Should Contain Key    ${item}    userId
    Dictionary Should Contain Key    ${item}    type
    Dictionary Should Contain Key    ${item}    status
    Dictionary Should Contain Key    ${item}    rejectReason

Upload Document
    [Documentation]    Updates user profile with real image from web
    [Arguments]    ${accessToken}
    ${image_binary}    ${image_size} =    Get Image From Web    https://placehold.co/600x400.jpg
    ${uploadURL} =    Create Document Returning UploadURL    ${accessToken}    ${image_size}
    Upload Buffer To Signed Url    ${uploadURL}    ${image_binary}

Get Image From Web
    [Documentation]    Baixa imagem e retorna binário + tamanho
    [Arguments]    ${url}
    ${response} =    GET    ${url}    expected_status=200
    ${size} =    Get Length    ${response.content}
    RETURN    ${response.content}    ${size}

Create Document Returning UploadURL
    [Documentation]    Creates document returning upload url
    [Arguments]    ${accessToken}    ${size}
    VAR    &{headers} =    authorization=Bearer ${accessToken}
    VAR    &{body} =
    ...    type=rg_front
    ...    contentType=image/jpeg
    ...    size=${size}
    ${response} =    POST On Session    api_session    ${DOCUMENT_PATH}    headers=&{headers}    json=&{body}
    Should Be Equal As Strings    ${response.status_code}    201
    VAR    ${data} =    ${response.json()}
    RETURN    ${data}[uploadURL]

Upload Buffer To Signed Url
    [Documentation]    Faz upload de um payload binário para a Signed URL
    [Arguments]    ${signed_url}    ${binary_payload}
    VAR    &{headers} =    Content-Type=image/jpeg
    PUT    ${signed_url}    data=${binary_payload}    headers=&{headers}    expected_status=200
