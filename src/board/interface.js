import React from 'react';
import { PalermeBoard } from './board';
import { Grid, Typography } from '@material-ui/core';
import ColorPickerDialog from './colorPicker';
import { GameCard } from './card';

import './interface.css';
import { StatusBar } from './status';

/**
 * @extends React.Component<{G : {currentPlayer: {deck:{resources: string[]}}}, otherPlayers: [{name: string, deck: {resources: number, developments: number}, knights: number, score: number}] }>
 */
export class PalermeInterface extends React.Component {

    constructor(props) {
        super(props);

        this.boardRef = React.createRef();

        this.state = {
            selected: []
        }
    }

    generatePlayers() {
        let list = [];
        for (let i = 0; i < this.props.ctx.numPlayers; i++) {
            let info = {};
            if (`${i}` === this.props.playerID) {
                info.name = this.props.G.currentPlayer.name;
                info.score = this.props.G.currentPlayer.score;
                info.knights = this.props.G.currentPlayer.knights;
                info.color = this.props.G.currentPlayer.color;
                info.resources = this.props.G.currentPlayer.deck.resources.length;
                info.developments = this.props.G.currentPlayer.deck.developments.length;
            }
            else {
                info.name = this.props.G.otherPlayers[`${i}`].name;
                info.score = this.props.G.otherPlayers[`${i}`].score;
                info.color = this.props.G.otherPlayers[`${i}`].color;
                info.knights = this.props.G.otherPlayers[`${i}`].knights;
                info.resources = this.props.G.otherPlayers[`${i}`].deck.resources;
                info.developments = this.props.G.otherPlayers[`${i}`].deck.developments;
            }
            list.push(<div key={`player${i}`} className="playerInfo">
                <div className="title">
                    <Typography variant="h6" className="first" style={{ color: info.color }}>{`${info.name}`}</Typography>
                    <Typography noWrap className="counter">{`★ ${info.score}`}</Typography>
                    <Typography noWrap className="counter">{`⚔ ${info.knights}`}</Typography>
                </div>

                <Typography>{` ${info.resources} ressource(s)`}</Typography>
                <Typography>{`${info.developments} développement(s)`}</Typography>
            </div>)
        }
        return list;
    }

    handleOKButtonClicked = (event) => {
        if (this.state.selected.length === 3 && this.props.ctx.activePlayers[this.props.playerID] === 'placeSettlement') {
            this.props.moves.placeSettlement(this.state.selected)
            this.boardRef.current.clearSelection();
            
            let newState = Object.assign({}, this.state);
            newState.selected = [];
            this.setState(newState);
        }
    }

    onBoardSelect = (data) => {
        let newState = Object.assign({}, this.state);
        newState.selected = data;
        this.setState(newState);
    }

    render() {
        console.log(this.props.ctx.activePlayers[this.props.playerID])
        return <div>

            {/* Status bar */}
            <StatusBar {...this.props} onClick={this.handleOKButtonClicked} />

            {/** Color selector */}
            <ColorPickerDialog open={this.props.ctx.activePlayers[this.props.playerID] === 'register'} moves={this.props.moves} />

            <PalermeBoard ref={this.boardRef} onSelect={this.onBoardSelect} {...this.props} />

            <div className="rightPanel">
                {this.generatePlayers()}
            </div>


            <div className="bottomZone" >
                <div className="leftButtons">
                    <Typography>Autre texte</Typography>
                </div>
                <div className="inventory customScroll">
                    {this.props.G.currentPlayer.deck.resources.map((tile, index) => {
                        return <Grid draggable="false" item key={index} >
                            <GameCard type={tile} visible={true} />
                        </Grid>
                    })}
                </div>
                <div className="buttons">
                    <Typography>test</Typography>
                </div>
            </div>
        </div>
    }
}