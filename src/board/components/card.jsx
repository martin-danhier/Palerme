import React from 'react';
import PropTypes from 'prop-types';

import './card.css';
import { Popover, Typography } from '@material-ui/core';

// load images
const wood = require('../resources/card_wood.png');
const clay = require('../resources/card_clay.png');
const stone = require('../resources/card_stone.png');
const wheat = require('../resources/card_wheat.png');
const sheep = require('../resources/card_sheep.png');
const back = require('../resources/card_back.png');
const knight = require('../resources/card_knight.png');
const roads = require('../resources/card_progress_roads.png');
const monopoly = require('../resources/card_progress_monopoly.png');
const victoryPoint = require('../resources/card_victory_point.png');
const resources = require('../resources/card_progress_resources.png');
const sandglass = require('../resources/sandglass.svg');


/**
* @extends {React.Component<{selected:boolean, visible:boolean, type:string, onClick:Function, cooldown:number>}
*/
export class GameCard extends React.Component {
    static propTypes = {
        selected: PropTypes.bool,
        visible: PropTypes.bool,
        type: PropTypes.string,
        onClick: PropTypes.func,
        cooldown: PropTypes.number,
    }

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

    getDescription = (id) => {
        switch (id) {
            case 'knight':
                return <>
                    Déplacez le pion <i>Voleurs</i> sur une tuile de votre choix
                    et prenez une carte <i>Ressource</i> de la main d'un joueur
                    possédant une colonie ou une ville autour de cette tuile.
                </>
            case 'progress_monopoly':
                return <>
                    Nommez une ressource. Tous les joueurs doivent vous remettre
                    toutes les cartes qu'ils ont en main de cette ressource.
                </>
            case 'progress_roads':
                return <>
                    Construisez gratuitement 2 routes.
                </>
            case 'victory_point':
                return <>
                    Cette carte vaut <b>1 point de victoire</b>. <br />
                    Ce point restera caché jusqu'à la fin de la partie.
                </>
            case 'progress_resources':
                return <>
                    Prenez dans la réserve 2 cartes <i>Ressource</i> de votre choix.
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
                    return "Construction de routes";
                case 'progress_monopoly':
                    return "Monopole";
                case 'progress_resources':
                    return "Invention";
                case 'victory_point':
                    return "Parlement";
                default:
                    return "Carte inconnue";
            }
        }
        else return "Carte inconnue";
    }

    getBonus = (id) => {
        if (this.props.visible === true) {
            switch (id) {

                case 'knight':
                    return "+1 ⚔";
                case 'victory_point':
                    return "+1 ★";
                default:
                    return "";
            }
        }
        else return "";
    }

    render = () => {
        let cardClass = "card";
        if (this.props.onClick !== undefined) {
            cardClass += " card-clickable";
        }
        if (this.props.selected === true) {
            cardClass += " selected";
        }

        return (
            <div>
                <div
                    className="imgContainer"
                    onMouseEnter={(e) => {
                        if (this.isDevelopment)
                            this.setState({ anchorEl: e.currentTarget });
                    }}
                    onMouseLeave={(e) => {
                        if (this.isDevelopment)
                            this.setState({ anchorEl: null });
                    }}
                    onClick={(event) => {
                        if (this.props.onClick !== undefined) {
                            this.props.onClick(event);
                        }
                    }}

                    aria-owns={this.state.anchorEl !== null ? 'mouse-over-popover' : undefined}
                    aria-haspopup={this.isDevelopment}>
                    <img
                        className={cardClass}
                        draggable="false"
                        src={this.chooseImage()}
                        alt={this.getDisplayName(this.props.type) ?? "Ressource inconnue"}

                    />
                    {this.isDevelopment
                        && this.props.cooldown > 0
                        && <img
                            className="sandglass"
                            alt="Disponible au tour prochain"
                            src={sandglass}
                        />}
                </div>
                {this.isDevelopment &&
                    <Popover
                        // className="cardPopover"
                        id="mouse-over-popover"
                        className="cardPopover"
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
                        <div className="titleLine">
                            <Typography variant="h6">{this.getDisplayName(this.props.type)}</Typography>
                            <Typography className="bonus">{this.getBonus(this.props.type)}</Typography>

                        </div>
                        <Typography className="description">{this.getDescription(this.props.type)}</Typography>
                        {this.props.cooldown > 0
                            && <Typography style={{ marginTop: "8px" }}>
                                <b>{
                                    this.props.cooldown === 1 ? "Disponible au prochain tour."
                                        : `Disponible dans ${this.props.cooldown} tours.`
                                }</b>
                            </Typography>}
                    </Popover>}
            </div>
        )
    }
}
