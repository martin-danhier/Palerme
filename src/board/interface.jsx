import React from 'react';
import { PalermeBoard } from './board';
import { Button, Grid, Typography, Tab, Tabs } from '@material-ui/core';
import ColorPickerDialog from './modals/colorPicker';
import { GameCard } from './components/card';

import './interface.css';
import { StatusBar } from './components/status';
import { PlayerSelector } from './modals/playerSelector';

import one from './resources/dice_one.svg';
import two from './resources/dice_two.svg';
import three from './resources/dice_three.svg';
import four from './resources/dice_four.svg';
import five from './resources/dice_five.svg';
import six from './resources/dice_six.svg';
import { TabPanel } from './components/tabpanel';
import { CardSelector } from './modals/cardSelector';
import { sameCoords, playerIsNextToRobber } from '../game/hexes';

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
            stealTo: null,
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
        let done = false;
        if (playerStage === 'placeSettlement' && this.state.selected.length === 3) {
            this.props.moves.placeSettlement(this.state.selected);
            done = true;
        }
        else if (playerStage === 'placeRoad' && this.state.selected.length === 2) {
            this.props.moves.placeRoad(this.state.selected);
            done = true;
        }
        else if (playerStage === 'moveRobber' && this.state.selected.length === 1) {
            if (sameCoords(this.props.G.robber, this.state.selected[0])) {
                // TODO error message
            }
            else if (this.props.G.hexes[this.state.selected[0][0]][this.state.selected[0][1]].type === 'ocean') {
                // TODO error message
            }
            else {
                this.props.moves.moveRobber(this.state.selected[0]);
                done = true;
            }
        }

        if (done) {
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

    generateSelector = () => {
        let playerStage = this.props.ctx.activePlayers[this.props.playerID];
        switch (playerStage) {
            case 'discardHalf':
                let numberToSelect = Math.floor(this.props.G.currentPlayer.deck.resources.length / 2);
                return <CardSelector
                    open={true}
                    title="7 aux dés ! "
                    subtitle={`Vous devez défausser ${numberToSelect} cartes.`}
                    cards={this.props.G.currentPlayer.deck.resources}
                    numberToSelect={numberToSelect}
                    onSubmit={(e, selected) => {
                        if (selected.length === numberToSelect) {
                            this.props.moves.discardHalf(selected);
                        }
                    }} />
            case 'stealResource':
                if (this.state.stealTo === null) {
                    let players = {};
                    for (let player in this.props.G.otherPlayers) {
                        if (playerIsNextToRobber(this.props.G, player)){
                            players[player] = this.props.G.otherPlayers[player].name;
                        }
                    }
                    return <PlayerSelector 
                    players={players}
                    onSubmit={(event, player) => {
                        let newState = Object.assign({}, this.state);
                        newState.stealTo = player;
                        this.setState(newState);
                    }}/>;
                }
                else {
                    return <CardSelector
                        open={true}
                        title="Vous pouvez voler une ressource."
                        numberOfCards={this.props.G.otherPlayers[this.state.stealTo].deck.resources}
                        numberToSelect={1}
                        onSubmit={(e, selected) => {
                            if (selected.length === 1) {
                                this.props.moves.stealResource(this.state.stealTo, selected[0]);
                            }
                        }} />
                }
            default:
                return undefined;
        }
    }

    handleCardSelectorSubmit = (event, selected) => {

    }

    render() {
        let playerStage = this.props.ctx.activePlayers[this.props.playerID];
        return <div>

            {/* Status bar */}
            <StatusBar {...this.props} onClick={this.handleOKButtonClicked} />

            {/** Color selector */}
            <ColorPickerDialog open={playerStage === 'register'} moves={this.props.moves} />

            {/** Resource selector */}
            {this.generateSelector()}

            {/* Actual board */}
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
                    <TabPanel className="tabPanel" index={0} value={this.state.tab}>
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
                    <TabPanel className="tabPanel" index={1} value={this.state.tab}>
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