import React from 'react';
import { Typography, Button } from '@material-ui/core';

import './status.css';
import { StatusMessage } from './statusMessage';

/**
 * @extends {React.Component<{ctx: {activePlayers: object}}>}
 */
export class StatusBar extends React.Component {

    getMessage() {
        let currentPlayerStage = this.props.ctx.activePlayers[this.props.ctx.currentPlayer];
        if (this.props.ctx.phase === 'register') {
            if (this.props.ctx.activePlayers[this.props.playerID] === 'register') {
                return StatusMessage.standard(
                    this.props.G, this.props.playerID,
                    'Vous devez choisir une couleur', []
                );
            } else {
                return StatusMessage.standard(
                    this.props.G, this.props.playerID,
                    'Les autres joueurs doivent choisir une couleur', []
                );
            }
        }
        if (this.props.ctx.phase === 'main' && (currentPlayerStage === 'discardHalf' || (currentPlayerStage === undefined))) {
            let players = Object.keys(this.props.ctx.activePlayers);
            let message = '{}';

            // Create the message
            if (players.length === 1) {
                message += ' doit défausser la moitié de ses ressources.';
            }
            else {
                for (let i = 1; i < players.length - 1; i++) {
                    message += ', {}'
                }
                message += ' et {} doivent défausser la moitié de leurs ressources.';
            }

            return StatusMessage.standard(
                this.props.G, this.props.playerID, message, players
            )
        }
        else {
            switch (currentPlayerStage) {
                case 'placeSettlement':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        '{} doit placer une colonie.', [this.props.ctx.currentPlayer]
                    );
                case 'placeRoad':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        '{} doit placer une route.', [this.props.ctx.currentPlayer]
                    );
                case 'placeTown':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        '{} doit placer une ville.', [this.props.ctx.currentPlayer]
                    );
                case 'rollDices':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        '{} doit lancer les dés.', [this.props.ctx.currentPlayer]
                    );
                case 'mainStage':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        "C'est au tour de {}.", [this.props.ctx.currentPlayer]
                    );
                case 'moveRobber':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        "{} peut déplacer le voleur.", [this.props.ctx.currentPlayer]
                    );
                case 'stealResource':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        "{} peut voler une ressource.", [this.props.ctx.currentPlayer]
                    );
                case 'chooseResources':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        "{} peut recevoir deux ressources au choix.", [this.props.ctx.currentPlayer]
                    );
                case 'monopoly':
                    return StatusMessage.standard(
                        this.props.G, this.props.playerID,
                        "Monopole ! {} choisit une ressource à réquisitionner.", [this.props.ctx.currentPlayer]
                    );
                default:
                    return StatusMessage.custom('Aucune action.', []);
            }
        }

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
            <Typography variant="h6">
                {message.render()}
            </Typography>

            {
                ['placeSettlement', 'placeRoad', 'moveRobber', 'placeTown']
                    .includes(this.props.ctx.activePlayers[this.props.playerID]) &&
                <Button
                    className="button"
                    variant="outlined"
                    color="inherit"
                    onClick={this.handleButtonClick}>
                    OK
                </Button>
            }

            {
                this.props.ctx.activePlayers[this.props.playerID] === 'mainStage' &&
                <Button
                    className="button"
                    variant="outlined"
                    color="inherit"
                    onClick={() => this.props.events.endTurn()}>
                    Fin de tour
                </Button>
            }
            

        </div >;
    }
}