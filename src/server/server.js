
const Server = require('boardgame.io/server').Server;
const PalermeGame = require('../game/game').PalermeGame;

// setup server
const server = Server({
    games: [
        PalermeGame
    ]
});

// run
server.run(8000);