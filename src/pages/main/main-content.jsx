import React from 'react';
import { Client } from 'boardgame.io/react';
import { PalermeGame } from '../../game/game';
import { SocketIO } from 'boardgame.io/multiplayer';
import { PalermeInterface } from '../../board/interface';

const MyClient = Client({
    game: PalermeGame,
    board: PalermeInterface,
    playerID: 0,
    debug: true,
    multiplayer: SocketIO({server: '192.168.1.207:8000'}),
});

const MainContent = (props) => (
    <MyClient playerID="0" {...props}/>
)
export default MainContent;