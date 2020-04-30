import React from 'react';

import './card.css';
import { Popover, Typography } from '@material-ui/core';

// load images
const wood = require('./resources/card_wood.png');
const clay = require('./resources/card_clay.png');
const stone = require('./resources/card_stone.png');
const wheat = require('./resources/card_wheat.png');
const sheep = require('./resources/card_sheep.png');
const back = require('./resources/card_back.png');
const knight = require('./resources/card_knight.png');
const roads = require('./resources/card_progress_roads.png');
const monopoly = require('./resources/card_progress_monopoly.png');
const victoryPoint = require('./resources/card_victory_point.png');
const resources = require('./resources/card_progress_resources.png');

/**
 * Manages the drawing of a card
 * @extends React.Component<{type: string, visible: boolean}>
 */
export class GameCard extends React.Component {

    constructor(props) {
        super(props);

        this.isDevelopment = this.props.visible && [
            'knight',
            'progress_roads',
            'progress_monopoly',
            'progress_resources',
            'victory_point'
        ].includes(this.props.type);

        this.state = {
            anchorEl: null,
        }

    }

    chooseImage = () => {
        if (this.props.visible === true) {
            switch (this.props.type) {
                case 'wood':
                    return wood;
                case 'clay':
                    return clay;
                case 'stone':
                    return stone;
                case 'wheat':
                    return wheat;
                case 'sheep':
                    return sheep;
                case 'knight':
                    return knight;
                case 'progress_roads':
                    return roads;
                case 'progress_monopoly':
                    return monopoly;
                case 'progress_resources':
                    return resources;
                case 'victory_point':
                    return victoryPoint;
                default:
                    return back;
            }
        }
        else return back;
    }

    getDescription =  (id) => {
        switch(id) {
            case 'knight':
                return <>
                    Déplacez le pion <i>Voleurs</i> sur une tuile de votre choix
                    et prenez une carte <i>Ressource</i> de la main d'un joueur
                    possédant une colonie ou une ville autour de cette tuile.
                    </>
            default:
                return <>Pas de description.</>;
        }
    }

    getDisplayName = (id) => {
        if (this.props.visible === true) {
            switch (id) {
                case 'wood':
                    return "Bois";
                case 'clay':
                    return "Argile";
                case 'stone':
                    return "Pierre";
                case 'wheat':
                    return "Blé";
                case 'sheep':
                    return "Mouton";
                case 'knight':
                    return "Chevalier";
                case 'progress_roads':
                    return "Progrès : Construction de routes";
                case 'progress_monopoly':
                    return "Progrès : Monopole";
                case 'progress_resources':
                    return "Progrès : Invention";
                case 'victory_point':
                    return "Parlement";
                default:
                    return "Carte inconnue";
            }
        }
        else return "Carte inconnue";
    }

    render() {

        return (
            <div>
                <img
                    aria-owns={this.state.anchorEl !== null ? 'mouse-over-popover' : undefined}
                    aria-haspopup="true"
                    style={{ margin: 3 }}
                    className="card"
                    draggable="false"
                    width="125px"
                    src={this.chooseImage()}
                    alt={this.getDisplayName(this.props.type) ?? "Ressource inconnue"}

                    onMouseEnter={(e) => {
                        if (this.isDevelopment)
                            this.setState({ anchorEl: e.currentTarget });
                    }}
                    onMouseLeave={(e) => {
                        if (this.isDevelopment)
                            this.setState({ anchorEl: null });
                    }}

                />
                {this.isDevelopment &&
                    <Popover
                        // className="cardPopover"
                        id="mouse-over-popover"
                        anchorEl={this.state.anchorEl}
                        open={this.state.anchorEl !== null}
                        onClose={(e) => {
                            this.setState({ anchorEl: null });
                        }}
                        disableRestoreFocus
                        anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'center',
                            horizontal: 'left',
                        }}>
                        <Typography variant="h6">{this.getDisplayName(this.props.type)}</Typography>
                        <Typography>{this.getDescription(this.props.type)}</Typography>
                    </Popover>}
            </div>
        )
    }
}
