*** Settings ***
Documentation       Util resource file with shared keywords

Library             Collections
Library             String
Library             RequestsLibrary
Library             ImapLibrary2
Library             DatabaseLibrary
Variables           ../variables.py


*** Variables ***
${REGEX_EMAIL_OTP} =    id="otp"[^>]*>\\s*([a-zA-Z0-9]{6})\\s*</span>


*** Keywords ***
Connect To Mailbox
    [Documentation]    Centralizes the mailbox opening
    Open Mailbox
    ...    host=${API_MAILER_IMAP_HOST}
    ...    port=${API_MAILER_IMAP_PORT}
    ...    user=${API_MAILER_IMAP_USERNAME}
    ...    password=${API_MAILER_IMAP_PASSWORD}

Connect To Postgres
    [Documentation]    Centralizes the database connection by parsing the URL
    VAR    ${p} =    ${{__import__('urllib.parse').parse.urlparse($API_DATABASE_POSTGRES_URL)}}
    Connect To Database
    ...    db_module=psycopg2
    ...    db_name=${{$p.path[1:]}}
    ...    db_user=${{$p.username}}
    ...    db_password=${{$p.password}}
    ...    db_host=${{$p.hostname}}
    ...    db_port=${{$p.port}}

Disconnect From Postgres
    [Documentation]    Centralizes the database disconnection
    Disconnect From Database

Query Postgres
    [Documentation]    Executes a query and returns the result
    [Arguments]    ${query}
    ${result} =    Query    ${query}
    RETURN    ${result}

Execute Postgres
    [Documentation]    Executes a query and returns the result
    [Arguments]    ${query}
    Execute Sql String    ${query}

Get OTP From Email
    [Documentation]    Retrieves the OTP code from the email with retry logic
    [Arguments]    ${recipient_email}    ${max_attempts}=15    ${wait_between_attempts}=5s
    Log    Starting email retrieval for: ${recipient_email}    level=INFO
    VAR    ${max_attempts_int} =    ${{int($max_attempts)}}
    VAR    ${range_end} =    ${{${max_attempts_int} + 1}}
    Sleep    3s
    FOR    ${attempt}    IN RANGE    1    ${range_end}
        Log    Attempt ${attempt}/${max_attempts} to retrieve email    level=INFO
        TRY
            ${otp_code} =    Try Get OTP From Mailbox    ${recipient_email}
            RETURN    ${otp_code}
        EXCEPT    AS    ${error}
            Log    Attempt ${attempt} failed: ${error}    level=WARN
            Handle Failed OTP Attempt    ${attempt}    ${max_attempts_int}    ${wait_between_attempts}    ${error}
        END
    END

Open Mailbox And Wait For Email
    [Documentation]    Opens the mailbox and waits for a specific recipient email
    [Arguments]    ${recipient_email}
    Connect To Mailbox
    ${emails} =    Wait For Email
    ...    sender=${API_MAILER_SMTP_FROM}
    ...    recipient=${recipient_email}
    ...    timeout=10
    RETURN    ${emails}

Try Get OTP From Mailbox
    [Documentation]    Orchestrates mailbox access and OTP extraction
    [Arguments]    ${recipient_email}
    TRY
        ${email_index} =    Open Mailbox And Wait For Email    ${recipient_email}
        IF    $email_index == $None or $email_index == ""
            Fail    No email found yet
        END
        ${email_body} =    Get Content From Multipart Email    ${email_index}
        ${otp_code} =    Extract OTP From Content    ${email_body}
        Delete Email    ${email_index}
        RETURN    ${otp_code}
    FINALLY
        Run Keyword And Ignore Error    Close Mailbox
    END

Get Content From Multipart Email
    [Documentation]    Retrieves the OTP code from the email with retry logic
    [Arguments]    ${email_index}
    ${status} =    Walk Multipart Email    ${email_index}
    VAR    ${extracted_body} =    ${EMPTY}
    WHILE    $status != False
        ${type} =    Get Multipart Content Type
        ${current_payload} =    Get Multipart Payload    decode=True
        IF    "text/html" in $type
            VAR    ${extracted_body} =    ${current_payload}
            BREAK
        END
        ${status} =    Walk Multipart Email    ${email_index}
    END
    IF    $extracted_body == ""
        VAR    ${extracted_body} =    Get Email Body    ${email_index}
    END
    RETURN    ${extracted_body}

Extract OTP From Content
    [Documentation]    Parses the email body to find the OTP code using Regex
    [Arguments]    ${content}
    ${matches} =    Get Regexp Matches    ${content}    ${REGEX_EMAIL_OTP}    1
    ${match_count} =    Get Length    ${matches}
    Should Be True    ${match_count} > 0    msg=OTP pattern not found in email body
    RETURN    ${matches[0]}

Handle Failed OTP Attempt
    [Documentation]    Handles failed OTP attempts with retry logic
    [Arguments]    ${attempt}    ${max_attempts}    ${wait_time}    ${error}
    IF    $attempt == $max_attempts
        Fail    Failed to retrieve OTP after ${max_attempts} attempts. Last error: ${error}
    END
    Log    Waiting ${wait_time} before next attempt...    level=INFO
    Sleep    ${wait_time}

Login With Credentials
    [Documentation]    Logs in with credentials and returns auth data
    [Arguments]    ${email}    ${password}    ${expected_status}=200
    VAR    &{payload} =
    ...    email=${email}
    ...    password=${password}
    ${response} =    POST On Session
    ...    api_session
    ...    auth/login/credential
    ...    json=${payload}
    ...    expected_status=${expected_status}
    IF    $response.text == ""    RETURN    ${{ {} }}
    VAR    ${auth_data} =    ${response.json()}
    RETURN    ${auth_data}

Delete All Emails From Mailbox
    [Documentation]    Cleans the inbox to avoid state interference
    TRY
        Connect To Mailbox
        Run Keyword And Return Status    Delete All Emails
    FINALLY
        Run Keyword And Ignore Error    Close Mailbox
    END
