import React from 'react';
import { Client } from 'boardgame.io/react';
import { PalermeGame } from '../../game/game';
import { PalermeBoard } from '../../board/board';
import { SocketIO } from 'boardgame.io/multiplayer';

const MyClient = Client({
    game: PalermeGame,
    board: PalermeBoard,
    playerID: 0,
    debug: true,
    multiplayer: SocketIO({server: 'localhost:8000'}),
});

const MainContent = (props) => (
    <MyClient playerID="0" {...props}/>
)
export default MainContent;