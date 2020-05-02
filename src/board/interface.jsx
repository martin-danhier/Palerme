import React from 'react';
import { PalermeBoard } from './board';
import { Button, Grid, Typography, Tab, Tabs } from '@material-ui/core';
import ColorPickerDialog from './colorPicker';
import { GameCard } from './card';

import './interface.css';
import { StatusBar } from './status';

import one from './resources/dice_one.svg';
import two from './resources/dice_two.svg';
import three from './resources/dice_three.svg';
import four from './resources/dice_four.svg';
import five from './resources/dice_five.svg';
import six from './resources/dice_six.svg';
import { TabPanel } from './tabpanel';

export const Die = {
    1: one,
    2: two,
    3: three,
    4: four,
    5: five,
    6: six,
}


/**
 * @extends React.Component<{G : {currentPlayer: {deck:{resources: string[]}}}, otherPlayers: [{name: string, deck: {resources: number, developments: number}, knights: number, score: number}] }>
 */
export class PalermeInterface extends React.Component {

    constructor(props) {
        super(props);

        this.boardRef = React.createRef();

        this.state = {
            selected: [],
            tab: 0,
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
        let playerStage = this.props.ctx.activePlayers[this.props.playerID];
        if (playerStage === 'placeSettlement' && this.state.selected.length === 3) {
            this.props.moves.placeSettlement(this.state.selected)
            this.boardRef.current.clearSelection();

            let newState = Object.assign({}, this.state);
            newState.selected = [];
            this.setState(newState);
        }
        else if (playerStage === 'placeRoad' && this.state.selected.length === 2) {
            this.props.moves.placeRoad(this.state.selected);
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

    onDicesClicked = (event) => {
        if (this.props.ctx.activePlayers[this.props.playerID] === 'rollDices') {
            this.props.moves.rollDices();
        }
    }

    render() {
        let playerStage = this.props.ctx.activePlayers[this.props.playerID];
        return <div>

            {/* Status bar */}
            <StatusBar {...this.props} onClick={this.handleOKButtonClicked} />

            {/** Color selector */}
            <ColorPickerDialog open={playerStage === 'register'} moves={this.props.moves} />

            <PalermeBoard ref={this.boardRef} onSelect={this.onBoardSelect} {...this.props} />

            <div className="rightPanel">
                {this.generatePlayers()}
            </div>

            <div className="bottomZoneAndTabs">
                <div className="tabsContainer">
                    <Tabs
                        className="tabs"
                        value={this.state.tab}
                        onChange={(e, value) => {
                            let newState = Object.assign({}, this.state);
                            newState.tab = value;
                            this.setState(newState);
                        }}>
                        <Tab disableRipple disableFocusRipple className="tab" label="Ressources" />
                        <Tab disableRipple disableFocusRipple className="tab" label="Cartes développement" />
                        <Tab disableRipple disableFocusRipple className="tab" label="Commerce" />
                    </Tabs>
                </div>

                <div className="bottomZone" >

                    {/* Resources */}
                    <TabPanel index={0} value={this.state.tab}>
                        <div className="leftButtons">
                            <Button
                                hidden={!['idle', 'tradeOnly', 'mainStage'].includes(playerStage)}
                                variant="outlined"
                                onClick={() => this.props.moves.shuffleDeck()}>
                                Mélanger les cartes
                            </Button>
                            {
                                this.props.G.currentPlayer.deck.resources.length > 0 ?
                                    <Button
                                        hidden={!['idle', 'tradeOnly', 'mainStage'].includes(playerStage)}
                                        variant="outlined"
                                        onClick={() => this.props.moves.sortDeck()}>
                                        Trier les cartes
                                    </Button>
                                    : <Typography>Vous n'avez aucune carte <i>Ressource</i>.</Typography>}
                        </div>
                        <div className="inventory customScroll">
                            {this.props.G.currentPlayer.deck.resources.map((tile, index) => {
                                return <Grid draggable="false" item key={index} >
                                    <GameCard type={tile} visible={true} />
                                </Grid>
                            })}
                        </div>
                    </TabPanel>

                    {/* Developments */}
                    <TabPanel index={1} value={this.state.tab}>
                        <div className="inventory customScroll">
                            {
                                this.props.G.currentPlayer.deck.developments.length > 0 ?
                                    this.props.G.currentPlayer.deck.developments.map((tile, index) => {
                                        return <Grid draggable="false" item key={index}>
                                            <GameCard type={tile.type} cooldown={tile.cooldown} visible={true} />
                                        </Grid>
                                    })
                                    : <Typography>Vous n'avez aucune carte <i>Développement</i>.</Typography>
                            }
                        </div>
                    </TabPanel>

                    <TabPanel index={2} value={this.state.tab}>

                    </TabPanel>

                    {/* Dices */}
                    <div className={playerStage === 'rollDices' ? "dices action" : "dices"}
                        onClick={this.onDicesClicked}>
                        <img className="die" alt="dice" width={50} style={{ margin: 5 }} src={Die[this.props.G.dices[0]]}></img>
                        <img className="die" alt="dice" width={50} style={{ margin: 5 }} src={Die[this.props.G.dices[1]]}></img>
                    </div>
                </div>
            </div>
        </div>
    }
}