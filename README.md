# PokemonStay

A RESTful app to store a Pokemon collection. Uses Pokeapi for most Pokemon information and the included pokedex.json file for evolution information. Supports through Gen VI, but is very simple and only has the default/regular pokemon for any with alternate forms. Includes authentication.

## Getting Started

1. Download the repo.
2. Open a console in the repo directory.
3. Run "npm install"
4. Needs to be connected to a MongoDB. Can be connected locally or to an external Mongo server.
5. There is a pokedex.json file that needs to be saved into the database. In the app.js file there is a commented out bit of code starting at line 60. Uncomment this code and run "node app.js" and after 10 seconds kill the server and then recomment out the code. You could come up with a more eloquent way to do copy that information to the database, but that is up to you to implement.
6. Run "node app.js" to start the server.
7. Should open on port 3000, "localhost:3000" on a local browser.
8. Create a login. 
9. Navigate to the Add New Pokemon button.
10. You can search for a pokemon by it's name or number, but if you mispell the pokemons name and search for it, it will hang up for a while with this current version. It may even crash. If you are so inclined you could use the pokedex collection saved to the db in step 5 to search for the pokemon before making the API call.


### Prerequisites

Node.js installed on the computer running the application is necessary.

## Deployment

With exception of tying to a mongo database, the application should be ready to deploy on a server with node as is.s

## Built With

* Node.js, Express, Passport, Mongoose, EJS, and a handful of other packages.

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Special thanks to hellobrian for the pokedex.json file. I've edited it some, but it was a huge help.
