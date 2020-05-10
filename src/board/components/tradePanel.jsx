import React from 'react';
import { Typography } from '@material-ui/core';

import './tradePanel.css';
import { BuyButton } from './buyButton';

const icons = {
    'clay': require('../resources/clay.svg'),
    'wood': require('../resources/wood.svg'),
    'stone': require('../resources/stone.svg'),
    'sheep': require('../resources/sheep.svg'),
    'wheat': require('../resources/wheat.svg'),
}

export class TradePanel extends React.Component {

    countResources = () => {
        let resources = {
            "clay": 0,
            "sheep": 0,
            "stone": 0,
            "wheat": 0,
            "wood": 0,
        };
        for (let resource of this.props.G.currentPlayer.deck.resources) {
            resources[resource] += 1;
        }
        return resources;
    }

    getDisplayName = (res) => {
        return {
            'clay': 'Argile',
            'sheep': 'Mouton',
            'stone': 'Pierre',
            'wheat': 'Blé',
            'wood': 'Bois',
        }[res];
    }

    render = () => {
        let active = this.props.ctx.activePlayers[this.props.playerID] === 'mainStage';

        return <>
            {/* Resource counter on the left */}
            <div className="resourceCount">
                {
                    Object.entries(this.countResources()).map(([key, value]) => {
                        return <div className="resourceRow" key={key}>
                            <img className="icon" src={icons[key]} height={"28px"} alt={key} />
                            <Typography className="resourceText">{value}</Typography>
                        </div>
                    })
                }
            </div>
            <div className="shop">
                <Typography className="label" variant="h6">Acheter</Typography>
                <div className="shopListContainer">
                    <div className="shopList">
                        <BuyButton type="road" resources={this.props.G.currentPlayer.deck.resources}
                            active={active}
                            onBuy={() => this.props.moves.buy('road')} />
                        <BuyButton type="settlement" resources={this.props.G.currentPlayer.deck.resources}
                            active={active}
                            onBuy={() => this.props.moves.buy("settlement")} />
                        <BuyButton type="town" resources={this.props.G.currentPlayer.deck.resources}
                            active={active}
                            onBuy={() => this.props.moves.buy("town")} />
                        <BuyButton type="development" resources={this.props.G.currentPlayer.deck.resources}
                            active={active}
                            onBuy={() => this.props.moves.buy("development")} />
                    </div>
                </div>
            </div>
            <div className="harbors">

            </div>
        </>
    }
}