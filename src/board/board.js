import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import Pattern from 'react-hexgrid/lib/Pattern';
import './board.css';
import { isCoordInArray, sameCoords } from '../game/hexes';

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
            origin: { x: -62, y: -35 },
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

    handleMouseDown = (event) => {
        let newState = Object.assign({}, this.state);
        newState.isDragging = true;
        this.setState(newState);
    }

    handleMouseUp = (event) => {
        let newState = Object.assign({}, this.state);
        newState.isDragging = false;
        this.setState(newState);
    }

    getNumberFontSize(number) {
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
     * @param {{data: {type: 'a' | 'b' | 'c', AVertex: number[][], BVertex: number[][]}, player: string, hexes: number[][]}} road 
     */
    generateRoad(road, i, coords) {
        let transform;
        let x = 0;
        let y = 0;
        let color = "";

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
                y =  -9.1 * this.state.size.y / 10;
            }
            else {
                x = -4 * this.state.size.y / 10
                y =  8.1 * this.state.size.y / 10;
            }
        }
        else {
            transform = "rotate(-60)"
            if (tileTopLeft) {
                x = -4 * this.state.size.y / 10
                y =  8.1 * this.state.size.y / 10;
            }
            else {
                x = -4 * this.state.size.y / 10
                y =  -9.1 * this.state.size.y / 10;
            }
        }

        if (road.player === "0") color = "blue";
        else color = "red"

        return <rect
            x={x}
            y={y}
            rx={this.state.size.x / 20}
            width={this.state.size.x / 1.2}
            height={this.state.size.x / 9.5}
            transform={transform}
            style={{
                fill: color
            }}
            key={`road${i}`}
        />
    }

    /**
     * Generate the children for this hexagon
     * @param {{number?: number, type: string}} hex 
     */
    getChildren(hex, coords) {
        let children = [];

        // Circle with number on it
        if (hex.number !== undefined) {
            // Add a circle
            children.push(<circle
                key="circle"
                cx="0"
                cy="0"
                r={this.state.size.x / 5}
                fill="#fff7cc"
                strokeWidth="0.1" />
            );
            // Put the number on it
            children.push(<text
                x={0}
                y='0.35em'
                key="number"
                textAnchor="middle"
                style={{
                    fontSize: this.getNumberFontSize(hex.number),
                    fill: this.getNumberFontColor(hex.number),
                    fontWeight: "bold",
                    fontFamily: "serif",
                    letterSpacing: this.state.size.x / 200
                }}>
                {hex.number}
            </text>);
        }

        let i = 0;
        for (let road of this.props.G.roads) {
            if (isCoordInArray(coords, road.hexes)) {
                children.push(this.generateRoad(road, i++, coords));
            }
        }

        return children;
    }

    render() {
        return (
            <div className="gameWindow"
                onMouseUp={this.handleMouseUp}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleDrag}
                onWheel={this.handleZoom}>

                {/* width={812} height={770}*/}
                <HexGrid
                    width={this.props.dimensions.width - 6}
                    height={this.props.dimensions.height - 6}
                >
                    <Layout
                        spacing={0.992}
                        className="board"
                        origin={this.state.origin}
                        size={this.state.size}
                        flat={true}>
                        {Object.entries(this.props.G.hexes).map(
                            (value) => Object.entries(value[1]).map(
                                (hex) => <Hexagon
                                    key={hex[0]}
                                    q={parseInt(value[0])}
                                    r={parseInt(hex[0])}
                                    s={0}
                                    fill={hex[1].type}
                                    children={this.getChildren(hex[1], [parseInt(value[0]), parseInt(hex[0])])} />
                            )
                        )}
                    </Layout>
                    <Pattern id="forest" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_forest.png?raw=true" size={this.state.size} />
                    <Pattern id="field" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_field.png?raw=true" size={this.state.size} />
                    <Pattern id="mountains" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_mountains.png?raw=true" size={this.state.size} />
                    <Pattern id="hills" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_hills_2.png?raw=true" size={this.state.size} />
                    <Pattern id="meadow" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_meadow.png?raw=true" size={this.state.size} />
                    <Pattern id="desert" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_desert.png?raw=true" size={this.state.size} />
                </HexGrid>
            </div>
        );
    }
}