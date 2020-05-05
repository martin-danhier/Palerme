import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import Pattern from 'react-hexgrid/lib/Pattern';
import './board.css';
import { isCoordInArray, sameCoords, indexOfCoord, areHexesAdjacent, sortCoords } from '../game/hexes';
import { getRoadData } from '../game/placement';
import { getPlayerColor } from './utils';

const zoomDragStep = 5;
const zoomStep = 1;

const zoomMin = 5;
const zoomMax = 15;

export class PalermeBoard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            size: { x: 10, y: 10 },
            origin: { x: -50, y: -60 },
            selected: []
        }

        console.log(props.G);
    }

    /**
     * Zooms in or out of the map
     * @param {WheelEvent} event
     */
    handleZoom = (event) => {

        // Zoom
        if (event.deltaY < 0 && this.state.size.x < zoomMax) {

            let newState = Object.assign({}, this.state);

            newState.size.x += zoomStep;
            newState.size.y += zoomStep;

            newState.origin.x -= zoomDragStep;
            newState.origin.y -= zoomDragStep;

            this.setState(newState);
        }
        // Dezoom
        else if (event.deltaY > 0 && this.state.size.x > zoomMin) {

            let newState = Object.assign({}, this.state);

            newState.size.x -= zoomStep;
            newState.size.y -= zoomStep;

            newState.origin.x += zoomDragStep;
            newState.origin.y += zoomDragStep;

            this.setState(newState);
        }
    }

    /**
     * @param {DragEvent} event
     */
    handleDrag = (event) => {
        if (this.state.isDragging) {

            let newState = Object.assign({}, this.state);
            newState.origin.x += event.movementX / 10;
            newState.origin.y += event.movementY / 10;
            this.setState(newState);
        }
    }

    /**
     * @param {MouseEvent} event
     */
    handleMouseDown = (event) => {
        if (!this.state.isDragging && event.button === 2) {
            event.preventDefault();
            event.stopPropagation();
            let newState = Object.assign({}, this.state);
            newState.isDragging = true;
            this.setState(newState);
        }
    }

    handleMouseUp = (event) => {
        if (this.state.isDragging && event.button === 2) {
            event.preventDefault();
            event.stopPropagation();
            let newState = Object.assign({}, this.state);
            newState.isDragging = false;
            this.setState(newState);
        }
    }

    getNumberFontSize = (number) => {
        let size = this.state.size.x / 4;
        // 2 or 12
        if ([2, 12].includes(number)) {
            return this.state.size.x / 5.5;
        }
        // 3 or 11
        else if ([3, 11].includes(number)) {
            return this.state.size.x / 4.8
        }
        // 4 or 10
        else if ([4, 10].includes(number)) {
            return this.state.size.x / 3.5
        }
        // 5 or 9
        else if ([5, 9].includes(number)) {
            return this.state.size.x / 3
        }
        // 6 or 8
        else if ([6, 8].includes(number)) {
            return this.state.size.x / 2.5
        }
        return size;
    }

    getNumberFontColor(number) {
        if ([6, 8].includes(number)) {
            return "#ff0000";
        }
        else {
            return "#000000"
        }
    }

    /**
     * 
     * @param {MouseEvent} event 
     * @param {number[][]} coords 
     */
    handleHexClick = (event, coords) => {
        let playerStage = this.props.ctx.activePlayers[this.props.playerID];
        if (['placeSettlement', 'placeRoad', 'moveRobber'].includes(playerStage)) {
            let newState = Object.assign({}, this.state)
            let index = indexOfCoord(this.state.selected, coords);
            if (index > -1) {
                newState.selected.splice(index, 1);
            }
            else {
                let adj = [];
                for (let h of this.state.selected) {
                    adj.push(areHexesAdjacent(coords, h));
                }

                // Road : max 2 tiles
                if (playerStage === 'placeRoad') {
                    if (adj.length === 0 || (adj.length === 1 && adj[0] === true)) {
                        newState.selected.push(coords);
                        sortCoords(newState.selected);
                    }
                    else if (adj.every((value) => value === false) || adj.every((value) => value === true)) {
                        newState.selected = [coords];
                    }
                    else {
                        // One adjacent, not the other
                        newState.selected = [];
                        for (let i = 0; i < this.state.selected.length; i++) {
                            if (adj[i] === true) {
                                newState.selected.push(Array.from(this.state.selected[i]));
                            }
                        }
                        newState.selected.push(coords);
                        sortCoords(newState.selected);
                    }
                }
                // Settlement : 3 tiles
                else if (playerStage === 'placeSettlement') {
                    if (adj.length === 0 || adj.every((value) => value === true)) {
                        newState.selected.push(coords);
                        sortCoords(newState.selected);
                    }
                    else {
                        newState.selected = [];
                        for (let i = 0; i < this.state.selected.length; i++) {
                            if (adj[i] === true) {
                                newState.selected.push(Array.from(this.state.selected[i]));
                            }
                        }
                        newState.selected.push(coords);
                        sortCoords(newState.selected);
                    }
                }
                // Robber : 1 tile
                else if (playerStage === 'moveRobber') {
                    newState.selected = [];
                    newState.selected.push(coords);
                }

            }
            this.setState(newState);
            this.props.onSelect(newState.selected);
        }
    }

    clearSelection() {
        let newState = Object.assign({}, this.state);
        newState.selected = [];
        this.setState(newState);
    }

    /**
     * 
     * @param {{player: string, hexes: number[][], level: number}} settlement 
     * @param {number} i 
     * @param {number[]} coords 
     */
    generateSettlement = (settlement, i, coords, notPlaced) => {

        let cx = 0;
        let cy = 0;
        let position = indexOfCoord(settlement.hexes, coords);

        // Vertex of type B
        if (settlement.hexes[0][0] === settlement.hexes[1][0]) {
            if (position === 0) {
                cy = 8.6 * this.state.size.y / 10;
                cx = 5 * this.state.size.x / 10;
            } else if (position === 1) {
                cy = -8.6 * this.state.size.y / 10;
                cx = 5 * this.state.size.x / 10;
            } else {
                cy = 0 * this.state.size.y / 10;
                cx = -10 * this.state.size.x / 10;
            }
        }
        // Vertex of type A
        else {
            if (position === 0) {

                cy = 0 * this.state.size.y / 10;
                cx = 10 * this.state.size.x / 10;
            } else if (position === 1) {
                cy = 8.6 * this.state.size.y / 10;
                cx = -5 * this.state.size.x / 10;
            } else {
                cy = -8.6 * this.state.size.y / 10;
                cx = -5 * this.state.size.x / 10;
            }
        }

        if (settlement.level === 1) {
            return <circle
                cx={cx}
                cy={cy}
                r={this.state.size.x / 6}
                stroke={notPlaced ? "#51ff00" : "white"}
                strokeWidth={this.state.size.x / 50}
                fillOpacity={notPlaced ? 0 : 1}
                fill={getPlayerColor(this.props.G, settlement.player, this.props.playerID)}
                key={`settle${i}`} />
        }
        else {
            return <rect
                x={cx - this.state.size.x / 6} // negate half the width/height so these are the coords of the center
                y={cy - this.state.size.y / 6}
                width={this.state.size.x / 3}
                height={this.state.size.x / 3}
                stroke="white"
                strokeWidth={this.state.size.x / 50}
                fill={getPlayerColor(this.props.G, settlement.player, this.props.playerID)}
                key={`settle${i}`}
            />
        }
    }


    /**
     * 
     * @param {{data: {type: 'a' | 'b' | 'c', AVertex: number[][], BVertex: number[][]}, player: string, hexes: number[][]}} road 
     */
    generateRoad(road, i, coords, notPlaced) {
        let transform;
        let x = 0;
        let y = 0;

        let tileTopLeft = sameCoords(road.hexes[0], coords);

        if (road.data.type === "a") {
            transform = "";
            x = -4 * this.state.size.x / 10;
            if (tileTopLeft) {
                y = 8.1 * this.state.size.y / 10;
            }
            else {
                y = - 9.1 * this.state.size.y / 10;
            }
        }
        else if (road.data.type === "b") {
            transform = "rotate(60)"
            if (tileTopLeft) {
                x = -4 * this.state.size.y / 10
                y = -9.1 * this.state.size.y / 10;
            }
            else {
                x = -4 * this.state.size.y / 10
                y = 8.1 * this.state.size.y / 10;
            }
        }
        else {
            transform = "rotate(-60)"
            if (tileTopLeft) {
                x = -4 * this.state.size.y / 10
                y = 8.1 * this.state.size.y / 10;
            }
            else {
                x = -4 * this.state.size.y / 10
                y = -9.1 * this.state.size.y / 10;
            }
        }


        return <rect
            x={x}
            y={y}
            rx={this.state.size.x / 20}
            width={this.state.size.x / 1.2}
            height={this.state.size.x / 9.5}
            transform={transform}
            stroke={notPlaced ? "#51ff00" : "white"}
            strokeWidth={this.state.size.x / 80}
            style={{
                fill: getPlayerColor(this.props.G, road.player, this.props.playerID)
            }}
            key={`road${i}`}
        />
    }

    generateHarbors(harbor, i, coords) {
        let transform;
        let x = -5 * this.state.size.y / 10
        let y = -9.9 * this.state.size.y / 10;

        let tileTopLeft = sameCoords(harbor.hexes[0], coords);
        let data = getRoadData(harbor.hexes)

        if (data.type === "a" && tileTopLeft) {
            transform = "rotate(180)";
        }
        else if (data.type === "b") {
            if (tileTopLeft) {
                transform = "rotate(60)"
            }
            else {
                transform = "rotate(240)"
            }
        }
        else if (data.type === "c") {
            if (tileTopLeft) {
                transform = "rotate(-240)"
            }
            else {
                transform = "rotate(-60)"
            }
        }

        // Create URL
        let url;
        switch(harbor.type) {
            case "wood":
                url = require('./resources/harbor_wood.png');
                break;
            case "clay":
                url = require('./resources/harbor_clay.png')
                break;
            case "stone":
                url = require('./resources/harbor_stone.png');
                break;
            case "wheat":
                url = require('./resources/harbor_wheat.png');
                break;
            case "sheep":
                url = require('./resources/harbor_sheep.png');
                break;
            default:
                url = require('./resources/harbor_31.png');
        }

        return <image
            key={`harbor${i}`}
            transform={transform}
            x={x}
            y={y}
            width={this.state.size.x}
            height={this.state.size.y} xlinkHref={url} />
    }

    /**
     * Generate the children for this hexagon
     * @param {{number?: number, type: string}} hex 
     */
    getChildren(hex, coords) {
        let children = [];
        
        let playerStage = this.props.ctx.activePlayers[this.props.playerID];

        // Circle with number on it
        if (hex.number !== undefined) {
            // Add a circle
            children.push(<circle
                key="circle"
                cx="0"
                cy="0"
                r={this.state.size.x / 5}
                fill="#fff7cc"
                strokeWidth="0.1"
                stroke="#555" />
            );
            // Put the number on it
            children.push(<text
                x={0}
                y='0.35em'
                key="number"
                textAnchor="middle"
                className="numberText"
                style={{
                    fontSize: this.getNumberFontSize(hex.number),
                    fill: this.getNumberFontColor(hex.number),
                    border: "unset",
                    fontWeight: "bold",
                    fontFamily: "serif",
                    letterSpacing: this.state.size.x / 200
                }}>
                {hex.number}
            </text>);
        }

        if (sameCoords(coords, this.props.G.robber)) {
            children.push(<image
                key="robber"
                x={- 0.45 * this.state.size.x}
                y={- 0.6 * this.state.size.y}
                width={this.state.size.x}
                height={this.state.size.y}
                xlinkHref={require('./resources/robber.png')} />)
        }

        let i = 0;

        for (let harbor of this.props.G.harbors) {
            if (hex.type === 'ocean' && isCoordInArray(coords, harbor.hexes)) {
                children.push(this.generateHarbors(harbor, i++, coords));
            }
        }

        for (let road of this.props.G.roads) {
            if (isCoordInArray(coords, road.hexes)) {
                children.push(this.generateRoad(road, i++, coords));
            }
        }

        if (playerStage === 'placeRoad' && this.state.selected.length === 2 && isCoordInArray(coords, this.state.selected)) {
            children.push(this.generateRoad({
                hexes: this.state.selected,
                player: this.props.playerID,
                data: getRoadData(this.state.selected)
            }, i++, coords, true));
        }

        for (let settlement of this.props.G.settlements) {
            if (isCoordInArray(coords, settlement.hexes)) {
                children.push(this.generateSettlement(settlement, i++, coords));
            }
        }

        // place settlement
        if (playerStage === 'placeSettlement' && this.state.selected.length === 3 && isCoordInArray(coords, this.state.selected)) {

            children.push(this.generateSettlement({
                hexes: this.state.selected,
                player: this.props.playerID,
                level: 1
            }, i++, coords, true));

        }

       


        return children;
    }



    render() {
        return (
            <div className="gameWindow"
                onMouseUp={this.handleMouseUp}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleDrag}
                onMouseLeave={this.handleMouseUp}
                onContextMenu={(e) => {e.preventDefault()}}
                onWheel={this.handleZoom}>

                {/* width={812} height={770}*/}
                <HexGrid
                    width={this.props.dimensions.width}
                    height={this.props.dimensions.height -6}
                >
                    <Layout
                        spacing={0.992}
                        className="board"
                        origin={this.state.origin}
                        size={this.state.size}
                        flat={true}>
                        {Object.entries(this.props.G.hexes).map(
                            (value) => Object.entries(value[1]).filter((hex) => {
                                return !isCoordInArray([parseInt(value[0]), parseInt(hex[0])], this.state.selected);
                            }).map(
                                (hex) => {
                                    let hoverable = ['placeSettlement', 'placeRoad', 'moveRobber'].includes(this.props.ctx.activePlayers[this.props.playerID]);
                                    return <Hexagon
                                        key={hex[0]}
                                        className={hex[1].type === 'ocean' ?
                                            (hoverable ? 'ocean hoverable' : 'ocean')
                                            : (hoverable ? 'hoverable' : '')}
                                        q={parseInt(value[0])}
                                        r={parseInt(hex[0])}
                                        s={0}
                                        onClick={(event) => this.handleHexClick(event, [parseInt(value[0]), parseInt(hex[0])])}
                                        fill={hex[1].type === 'ocean' ? undefined : hex[1].type}
                                        children={this.getChildren(hex[1], [parseInt(value[0]), parseInt(hex[0])])} />
                                })
                        )}
                        {
                            this.state.selected.map((coord) => {
                                let hex = this.props.G.hexes[`${coord[0]}`][`${coord[1]}`];
                                return <Hexagon
                                    key={`${coord[0]} ${coord[1]}`}
                                    q={coord[0]}
                                    r={coord[1]}
                                    s={0}
                                    className={hex.type === 'ocean' ? "ocean selected hoverable" : "selected hoverable"}
                                    style={{ strokeWidth: this.state.size.x / 20 }}
                                    onClick={(event) => this.handleHexClick(event, coord)}
                                    fill={hex.type === 'ocean' ? undefined : hex.type}
                                    children={this.getChildren(hex, coord)} />
                            })
                        }
                    </Layout>
                    <Pattern id="forest" link={require('./resources/region_forest.png')} size={this.state.size} />
                    <Pattern id="field" link={require('./resources/region_field.png')} size={this.state.size} />
                    <Pattern id="mountains" link={require('./resources/region_mountains.png')} size={this.state.size} />
                    <Pattern id="hills" link={require('./resources/region_hills.png')} size={this.state.size} />
                    <Pattern id="meadow" link={require('./resources/region_meadow.png')} size={this.state.size} />
                    <Pattern id="desert" link={require('./resources/region_desert.png')} size={this.state.size} />
                </HexGrid>
            </div>
        );
    }
}