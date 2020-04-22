# Bandsy Identity

### Development

This section describes how one can run this on their local machine. Note that this repo is tightly integrated with our devops setup which is out of scope here. If youre not part of the Bandsy team and are interested in setting this up, please contact @Dragon1320.

**Required tools:**
- Wsl (or Linux)
- Kubectl
- Telepresence
- Node
- Yarn
- Docker (optional)

**Required config:**
- Kubectl config
- Telepresence may need some folder perm changes on Windows
- Keys:
  - x509-full.pem
  - jwt.pem
  - jwt.pub
- Env:
  - WEBSERVER_LOGGER
  - WEBSERVER_PORT
  - WEBSERVER_ADDRESS
  - TRANS_HOST
  - TRANS_PORT
  - TRANS_SECURE
  - TRANS_EMAIL
  - TRANS_EMAIL_PASS
  - EMAIL_DISPLAY
  - EMAIL_DISPLAY_NAME
  - MONGO_HOST
  - MONGO_DB
  - MONGO_CERT
  - JWT_PRIVATE_KEY
  - JWT_PUBLIC_KEY
  - ACCOUNT_VERIFICATION_TIME
  - TOKEN_VALIDITY_TIME

> NOTE: If you are missing any keys or configs, please contact devops.

**Setup:**
- Place all necessary keys in root
- Create a `.env` file in root and fill out all vars
- Set the following vars in the command line:
  - ``export MONGO_CERT=`cat x509-full.pem` ``
  - ``export JWT_PRIVATE_KEY=`cat jwt.pem` ``
  - ``export JWT_PUBLIC_KEY=`cat jwt.pub` ``
- `yarn install` all dependencies
- `yarn build:watch`
- `yarn run:hot` *OR* `yarn kube:hot`

> NOTE: Running `yarn kube:hot` requires an existing deployment on our kube cluster (contact devops with any questions or if it doesnt work)

**Database access:**
- Place all necessary keys in root
- `kubectl port-forward mongo-main-0 27000:27017 -n mongodb`
- `mongo localhost:27000 --tls --tlsAllowInvalidCertificates --authenticationDatabase '$external' --authenticationMechanism MONGODB-X509 --tlsCertificateKeyFile x509-full.pem`

### Api Concepts

This section describes general api concepts which are applicable to all parts of the public-facing api.

> NOTE: The info in this section is not set in stone yet an may change

**Structure:**
- All routes prefixed with /api/v\<version>, where version will be a positive integer
- Basic api info can be acquired through `GET /`
- Info about a specific version can be acquired through `GET /api/v<version>`

**Versioning:**
- All routes on a single version will have a stable api and should never break backwards compatibility
- Different versions are not backwards compatible
- Development and preprod builds may have unstable apis
- It is recommended that the latest version be used where possible

### Api Base Routes

This section describes individual api routes and any info that developers need to be aware of.

> NOTE: This section is not complete and will be updated as development proceeds

**Routes:**

###### GET /
- *Description*: Get basic info about the entire api
- *Use cases*:
  - Check if api is up
  - Get versions or latest version
- *Requirements*:
  - None

###### GET /api/v1
- *Description*: Get basic info about api v1
- *Use cases*:
  - Check status of api v1
  - Get basic route info for api v1
- *Requirements*:
  - None

### Api v1 Routes

This section details version 1 of the identity api and any other info that developers need to be aware of.

> NOTE: This section is not complete and will be updated as development proceeds

**Enums:**
- OauthService:
  - DISCORD = 0
- BandsyResponseCode:
  - ERROR_HANDLER_ERROR = 0
  - UNKNOWN_ERROR = 1
  - VALIDATION_ERROR = 2
  - CLIENT_ERROR = 3
  - SERVER_ERROR = 4
  - DUPLICATE_EMAIL = 5
  - INVALID_ACCOUNT = 6
  - INVALID_VERIFICATION = 7
  - INVALID_CREDENTIALS = 8
  - INVALID_MFA = 9

**Common errors:**
- Validation:
  - bandsyCode: VALIDATION_ERROR
  - reason: Incorrect input for current route
- Duplicate email
  - bandsyCode: DUPLICATE_EMAIL
  - reason: An account with the specified email already exists
- Invalid account
  - bandsyCode: INVALID_ACCOUNT
  - reason: An account that satisfies the requirements for the current route could not be found (e.g. when calling /recover with an oauth or unverified account)
- Invalid verification
  - bandsyCode: INVALID_VERIFICATION
  - reason: Incorrect or expired verification code
- Invalid credentials
  - bandsyCode: INVALID_CREDENTIALS
  - reason: Email and/or password incorrect
- Invalid mfa
  - bandsyCode: INVALID_MFA
  - reason: Mfa is enabled on the users account but the mfa code was not specified or incorrect
- Server error
  - bandsyCode: SERVER_ERROR
  - reason: Default error code for any other errors that arent already handled by the route

**Error responses:**
- code *(http response code)*
- body:
  - bandsyCode: BandsyResponseCode *(enum)*
  - message: string
  - error: string

> NOTE: The 'error' field is only present when running in development mods

> NOTE: The client should handle all possible bandsy error codes, besides errors listed in each route, ERROR_HANDLER_ERROR and UNKNOWN_ERROR errors can also occur (but shouldnt)

**Routes:**

###### POST /visitor/bandsy/register
- *Description*: Register new bandsy user
- *Use cases*:
  - Creating an email + pass account
- *Requirements*:
  - headers:
    - application/json
  - body:
    - email: string
    - password: string
- *Success*:
  - code: 204
  - body: None
- *Errors*:
  - Validation
  - Duplicate email
  - Server error

###### POST /visitor/bandsy/register/resend
- *Description*: Resend an verification email
- *Use cases*:
  - An already registered but not verified user did not get a validation email
  - A non-verified users verification code has expired
- *Requirements*:
  - headers:
    - application/json
  - body:
    - email: string
    - password: string
- *Success*:
  - code: 204
  - body: None
- *Errors*:
  - Validation
  - Invalid account
  - Server error

###### POST /visitor/bandsy/verify
- *Description*: Verify a non-verified users verification code to complete account registration
- *Use cases*:
  - Complete email + pass account registration flow
- *Requirements*:
  - headers:
    - application/json
  - body:
    - email: string
    - verificationCode: string
- *Success*:
  - code: 200
  - body:
    - token: string
    - validUntil: date iso string
- *Errors*:
  - Validation
  - Invalid verification
  - Invalid account
  - Server error

###### POST /visitor/bandsy/recover
- *Description*: Allow a user to reset their password if they have forgotten it
- *Use cases*:
  - Reset a non-logged in users password via email code
- *Requirements*:
  - headers:
    - application/json
  - body:
    - email: string
- *Success*:
  - code: 204
  - body: None
- *Errors*:
  - Validation
  - Invalid account
  - Server error

###### POST /visitor/bandsy/recover/verify
- *Description*: Verify a password recovery code and complete the password change
- *Use cases*:
  - Complete email + pass account password recovery flow
- *Requirements*:
  - headers:
    - application/json
  - body:
    - email: string
    - recoveryCode: string
    - newPassword: string
- *Success*:
  - code: 204
  - body: None
- *Errors*:
  - Validation
  - Invalid verification
  - Server error

###### POST /visitor/bandsy/login
- *Description*: Login with an email + pass account
- *Use cases*:
  - Login with an email + pass account
  - Send mfa code if mfa is enabled in the users account
- *Requirements*:
  - headers:
    - application/json
  - body:
    - email: string
    - recoveryCode: string
    - newPassword: string
- *Success*:
    - token: string
    - validUntil: date iso string
- *Errors*:
  - Validation
  - Invalid account
  - Invalid credentials
  - Invalid mfa
  - Server error

> NOTE: This route will return the invalid account error if an account with the specified email cannot be found

###### POST /visitor/oauth/authenticate
- *Description*: Combined login and registration route for oauth account users
- *Use cases*:
  - Account creation using 3rd party oauth accounts
  - Account login for 3rd party oauth accounts
- *Requirements*:
  - headers:
    - application/json
  - body:
    - oauthService: OauthService *(enum)*
    - accessToken: string
- *Success*:
    - token: string
    - validUntil: date iso string
- *Errors*:
  - Validation
  - Duplicate email
  - Server error

**Common patterns:**
- Account creation (email + pass):
  - `POST /visitor/bandsy/register`
  - `POST /visitor/bandsy/verify`
- Account login (email + pass):
  - `POST /visitor/bandsy/login`
- Account password recovery (email + pass):
  - `POST /visitor/bandsy/recover`
  - `POST /visitor/bandsy/verify`
- Account creation/login (oauth):
  - `POST /visitor/oauth/authenticate`

> NOTE: For cheking if mfa is enabled, hit the login route once with the email and password, if mfa is disabled, the login will succeed, if it is enabled, prompt the user for the mfa code and hit the login route again 
