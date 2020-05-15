import React from 'react';
import { Typography, Button } from '@material-ui/core';

import "./tradeHarbors.css";
import { getPlayerHarbors } from '../../game/hexes';
import { hasEnoughResources } from '../utils';

export class HarborTrade extends React.Component {
    constructor(props) {
        super(props);

        this.harbors = getPlayerHarbors(this.props.G, this.props.playerID);
        this.resources = ['clay', 'sheep', 'stone', 'wheat', 'wood'];

        this.state = {
            sellSelected: -1,
            buySelected: -1,
        };
    }

    // updates the state to select a resource
    handleSelect = (e, row, index) => {
        if (e.button === 0) {
            let newState = Object.assign({}, this.state);
            if (this.state[row] === index) {
                newState[row] = -1;
            }
            else {
                newState[row] = index;
            }
            this.setState(newState);
        }
    }

    // returns the number of resources required for that trade
    getTradableAmount = (index) => {
        if (index >= 0) {
            let selectedResource = this.resources[index];
            if (this.harbors.includes(selectedResource)) {
                return 2;
            }
            else if (this.harbors.includes('3:1')) {
                return 3;
            }
            else return 4;
        } else {
            return '?';
        }
    }

    handleButtonClick = (event) => {
        // get the sell amount
        let sellAmount = this.getTradableAmount(this.state.sellSelected);

        // get transaction resources
        let input = this.resources[this.state.sellSelected];
        let output = this.resources[this.state.buySelected];

        // get harbor type
        let harborType;
        if (sellAmount === 2) harborType = input;
        else if (sellAmount === 3) harborType = '3:1';
        else harborType = '4:1';

        // apply move
        this.props.moves.tradeWithHarbors(input, output, harborType);
    }


    render() {

        return <div className="harborsContent">

            <div className="selectResourceWrapper">
                <Typography>Vendre {
                    this.props.ctx.activePlayers[this.props.playerID] === 'mainStage' ?
                        this.getTradableAmount(this.state.sellSelected)
                        : "?"
                }:</Typography>
                <div className="selectResource">
                    {this.resources.map((value, index) => {
                        // get tradable amount
                        let price = {};
                        price[this.resources[index]] = this.getTradableAmount(index);
                        let hasEnough = hasEnoughResources(this.props.G.currentPlayer.deck.resources, price);
                        let enabled = true;

                        // generate css classes
                        let sellClasses = "resIcon";
                        if (this.props.ctx.activePlayers[this.props.playerID] !== 'mainStage' || ! hasEnough) {
                            sellClasses += " disabled";
                            enabled = false;
                        }
                        else if (this.state.sellSelected === index) {
                            sellClasses += " selected";
                        }

                        // return button
                        return <img
                            draggable={false}
                            onClick={(e) => { if (enabled) this.handleSelect(e, 'sellSelected', index) }}
                            alt={value}
                            key={value}
                            src={this.props.icons[value]}
                            className={sellClasses} />
                    }
                    )}
                </div>
            </div>
            <div className="selectResourceWrapper">
                <Typography>Contre 1:</Typography>
                <div className="selectResource">
                    {this.resources.map((value, index) => {
                        // generate css classes
                        let buyClasses = "resIcon";
                        if (this.props.ctx.activePlayers[this.props.playerID] !== 'mainStage'
                        || this.state.sellSelected < 0) {
                            buyClasses += " disabled";
                        }
                        else if (this.state.buySelected === index) {
                            buyClasses += " selected";
                        }

                        return <img
                            draggable={false}
                            onClick={(e) => this.handleSelect(e, 'buySelected', index)}
                            alt={value}
                            key={value}
                            src={this.props.icons[value]}
                            className={buyClasses} />
                    })}
                </div>
            </div>
            <Button
                disabled={this.props.ctx.activePlayers[this.props.playerID] !== 'mainStage'
                    || this.state.buySelected < 0
                    || this.state.sellSelected < 0}
                variant="outlined"
                className="okButton"
                onClick={this.handleButtonClick}>OK</Button>
        </div>
    }
}