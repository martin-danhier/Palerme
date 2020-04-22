import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';
import Pattern from 'react-hexgrid/lib/Pattern';
import './board.css';

const zoomDragStep = 5;
const zoomStep = 1;

const zoomMin = 5;
const zoomMax = 25;

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

    render() {
        return (
            <div style={{
                display: "inline-block"
            }}
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
                                (hex) => <Hexagon key={hex[0]} q={parseInt(value[0])} r={parseInt(hex[0])} s={0} fill={hex[1].type} />
                            )
                        )}
                    </Layout>
                    <Pattern id="forest" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_forest.png?raw=true" size={this.state.size} />
                    <Pattern id="field" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_field.png?raw=true" size={this.state.size} />
                    <Pattern id="mountains" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_mountains.png?raw=true" size={this.state.size} />
                    <Pattern id="hills" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_hills.png?raw=true" size={this.state.size} />
                    <Pattern id="meadow" link="https://github.com/martin-danhier/Palerme/blob/master/public/resources/region_meadow.png?raw=true" size={this.state.size} />
                </HexGrid>
            </div>
        );
    }
}