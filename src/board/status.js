import React from 'react';
import { Typography, Button } from '@material-ui/core';
import { getPlayerName, getPlayerColor } from './utils';

import './status.css';

export class StatusBar extends React.Component {

    getMessage() {
        let currentPlayerStage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        if (currentPlayerStage === 'placeSettlement') {
            return [this.props.ctx.currentPlayer, 'doit placer une colonie.']
        }
        else if (currentPlayerStage === 'placeRoad') {
            return [this.props.ctx.currentPlayer, 'doit placer une route.']
        }
        else if (currentPlayerStage === 'placeTown') {
            return [this.props.ctx.currentPlayer, 'doit placer une ville.']
        }
        else if (currentPlayerStage === 'rollDices') {
            return [this.props.ctx.currentPlayer, 'doit lancer les dés.']
        }
        else if (this.props.ctx.phase === 'register') {
            if (this.props.ctx.activePlayers[this.props.playerID] === 'register') {
                return ['', 'Vous devez choisir une couleur.'];
            } else {
                return ['', 'Les autres joueurs doivent choisir une couleur.']
            }
        }
        else return ['', 'Aucune action.'];
    }

    /**
     * Handles the click on the button
     * @param {MouseEvent} event 
     */
    handleButtonClick = (event) => {
        this.props.onClick(event);
    }

    render() {
        let message = this.getMessage();

        return <div className="statusbar">
            {(message[0] !== '') ?
                <Typography
                    variant="h6"
                    style={{ color: getPlayerColor(this.props.G, message[0], this.props.playerID), marginRight: 6 }}>
                    {getPlayerName(this.props.G, this.props.ctx.currentPlayer, this.props.playerID)}
                </Typography>
                : undefined
            }
            <Typography variant="h6">
                {message[1]}
            </Typography>
            <Button
                hidden="true"
                className={['placeSettlement'].includes(this.props.ctx.activePlayers[this.props.playerID]) ?
                    "button" :
                    "hidden"}
                variant="outlined"

                color="inherit"
                onClick={this.handleButtonClick}>
                OK
            </Button>
        </div>;
    }
}