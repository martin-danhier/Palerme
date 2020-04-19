import React from 'react';
// import Typography from "@material-ui/core/Typography";
// import AppBar from '@material-ui/core/AppBar';
// import Toolbar from '@material-ui/core/Toolbar';

import { Client } from 'boardgame.io/react';

const Palerme = {
    setup: () => ({
        name: "Bob",
    }),
    moves: {
        changeName: (G, ctx, newName) => {
            G.name = newName;
        }
    },
};

const GamePageContent = Client({game: Palerme});

export default GamePageContent;