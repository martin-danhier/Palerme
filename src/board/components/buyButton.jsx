import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Popover } from '@material-ui/core';
import { hasEnoughResources } from '../utils';

import './buyButton.css';

const images = {
    'settlement': require('../resources/buy-settlement.png'),
    'town': require('../resources/buy-town.png'),
    'road': require('../resources/buy-road.png'),
    'development': require('../resources/buy-development.png'),
    'clay': require('../resources/clay.svg'),
    'wood': require('../resources/wood.svg'),
    'stone': require('../resources/stone.svg'),
    'sheep': require('../resources/sheep.svg'),
    'wheat': require('../resources/wheat.svg'),
}

const prices = require('../../game/prices.json');

/**
* @extends {React.Component<{type:string, resources:array, onBuy:Function, active:boolean}>}
*/
export class BuyButton extends React.Component {
    static propTypes = {
        type: PropTypes.string,
        resources: PropTypes.array,
        onBuy: PropTypes.func,
        active: PropTypes.bool,
    }


    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null,
        }
    }

    getDisplayName = () => {
        return {
            'settlement': 'Colonie',
            'town': 'Ville',
            'road': 'Route',
            'development': 'Carte développement',
        }[this.props.type];
    }

    getDescription = () => {
        return {
            'settlement': 'Placez une colonie sur une intersection.',
            'town': 'Améliorez une colonie existante en ville.',
            'road': 'Placez une route sur une arête.',
            'development': 'Recevez une carte développement. Vous pourrez l\'utiliser au prochain tour.',
        }[this.props.type];
    }

    getBonus = () => {
        return {
            'settlement': '+1 ★',
            'town': '+1 ★',
            'road': '',
            'development': '',
        }[this.props.type];
    }

    buildPrice = () => {
        let list = [];
        for (let res in prices[this.props.type]) {
            for (let i = 0; i < prices[this.props.type][res]; i++) {
                list.push(<img
                    src={images[res]}
                    alt={res}
                    className="priceIcon"
                    key={`${res}${i}`}
                />)
            }
        }
        return list;
    }

    render = () => {
        let enabled = this.props.active && hasEnoughResources(this.props.resources, prices[this.props.type]);

        return <div className="buyButton">
            <img
                className={enabled ? "icon enabled" : "icon"}
                src={images[this.props.type]}
                alt={"settlement"}

                onMouseEnter={(e) => {
                    this.setState({ anchorEl: e.currentTarget });
                }}
                onMouseLeave={(e) => {
                    this.setState({ anchorEl: null });
                }}
                onClick={(e) => {
                    if (enabled) {
                        this.props.onBuy();
                    }
                }} />
            <Popover
                // className="cardPopover"
                id="mouse-over-popover"
                className="shopPopover"
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
                    <Typography variant="h6">{this.getDisplayName()}</Typography>
                    <Typography className="bonus">{this.getBonus()}</Typography>
                </div>
                <div className="price">
                    {this.buildPrice()}
                </div>
                <Typography className="description">{this.getDescription()}</Typography>
            </Popover>
        </div>;
    }
}