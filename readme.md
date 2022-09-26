# ATH-JPG-Minter Backend
Backend part of Minter-Project.
This part is responsible for the minting, storing the wallets.
Later on a frontend part is planned, where a user can easily interact with the backend. For now interaction with the backend is only possible via postman.

## Technologies used
- ExpressJS
- nodeJS

## Starting MongoDB on MAC OS
It often happens that MongoDB does not get started with startup. For this reason we have to start it manually.

`brew services`<br/>
shows all available services  

`sudo brew services start mongodb-community`<br/>
starts the MongoDB service

`sudo brew services stop mongodb-community`<br/>
stops the MongoDB service
