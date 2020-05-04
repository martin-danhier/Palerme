import React from 'react';
import { getPlayerName, getPlayerColor } from '../utils';

export class StatusMessage {
    /** 
     * 
     * @param {string[]} message
     * @param {string[]} players 
     * @param {boolean} standard
     */
    constructor(G, playerID, message, players, standard) {
        this.G = G;
        this.message = message;
        this.standard = standard;
        this.playerID = playerID;
        this.players = players;
    }

    /**
     * 
     * @param {object} G G
     * @param {string} message A message. Each "{}" will be remplaced by the corresponding player in `players`.
     * @param {string[]} players A list of players id.
     */
    static standard(G, playerID, message, players) {
        let splittedMessage = message.split('{}');
        if (splittedMessage.length > players.length + 1)
            throw new Error('Too many format indicators in message.');

        return new StatusMessage(G, playerID, splittedMessage, players, true);
    }

    static custom(message, format) {
        let splittedMessage = message.split('{}');
        if (splittedMessage.length > format.length + 1)
            throw new Error('Too many format indicators in message.');

        return new StatusMessage(undefined, undefined, splittedMessage, format, false);
    }

    render = () => {
        if (this.standard) {
            return this.message.map((value, index) => {
                if (index > 0) {
                    let playerName = getPlayerName(this.G, this.players[index - 1], this.playerID);
                    let playerColor = getPlayerColor(this.G, this.players[index - 1], this.playerID);
                    return <div key={index} style={{display:"inline"}}>
                        <span key={`pl ${index}`} style={{color: playerColor}}>{playerName}</span>
                        <span key={`txt ${index}`}>{value}</span>
                    </div>
                }
                return <span key={`txt ${index}`}>{value}</span>;
            })
        } else {
            return this.message.map((value, index) => {
                if (index > 0) {
                    return <div key={index} style={{display:"inline"}}>
                        {this.players[index - 1]}
                        <span key={`txt ${index}`}>{value}</span>
                    </div>
                }
                return <span key={`txt ${index}`}>{value}</span>;
            });
        }
    }
}