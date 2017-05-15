**Clerk** is about data objects. `Bob` provides a data object to Clerk for
storage, and gets back a random key. `Bob` hands that key to `Alice`. `Alice`
provides the key to Clerk, and retrieves the data object.

#### INSTALL THE DEPENDENCIES

    npm install

#### CONFIGURE

Create `settings.json` based on `settings.example.json`.

    cp settings.example.json settings.json

Edit `settings.json`.

#### RUN

    npm start

#### USE

Go to http://localhost:3000 to access the project's web site.

##API CALLS

1. `POST` `{base_url}/signin`  
    * `Headers`  
      * Content-Type : application/json
      * Accept : application/json  
    * `Parameters`
      * username (String)
      * password (String)

2. `POST` `{base_url}/signin`  
    * `Headers`  
      * Content-Type : application/json
      * Accept : application/json
      * Authorization: Bearer {jwt_token}

3. `POST` `{base_url}/store`  
    * `Headers`  
      * Content-Type : application/json if json object else the type of the binary
      * Accept : application/json
      * Authorization: Bearer {jwt_token}
    * `Parameters`
      * { 'key': 'value', ... } // Objects
      * {binay file}  // Binaries

4. `GET` `{base_url}/get/{key}`  
    * `Headers`  
      * Content-Type : application/json
      * Accept : application/json
      * Authorization: Bearer {jwt_token}
      * update-field (OPTIONAL): true (When enabled the object is extended else it is replaced with the new one)

5. `PUT` `{base_url}/update/{key}`  
    * `Headers`  
      * Content-Type : application/json if json object else the type of the binary
      * Accept : application/json
      * Authorization: Bearer {jwt_token}
    * `Parameters`
      * { 'key': 'value', ... } // Objects
      * {binay file}  // Binaries