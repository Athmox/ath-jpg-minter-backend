# ATH-JPG-Minter Backend
Backend part of Minter-Project.
This part is responsible for the minting, storing the wallets.
Later on a frontend part is planned, where a user can easily interact with the backend. For now interaction with the backend is only possible via postman.

## Storing Wallet Priate Keys
Never push Wallet Private Keys on GIT!!<br>
A file called ```wallet-private-keys.json``` must be created and the Keys must be stored like this: ```[ "KEY1", "KEY2", "KEY3" ]```.


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
