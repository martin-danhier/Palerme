import React from 'react';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';

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

                        className="board"
                        origin={this.state.origin}
                        size={this.state.size}
                        flat={false}>
                        {Object.entries(this.props.G.hexes).map(
                            (value) => Object.entries(value[1]).map(
                                (hex) => <Hexagon key={hex[0]} q={parseInt(value[0])} r={parseInt(hex[0])} s={0} />
                            )
                        )}
                    </Layout>
                </HexGrid>
            </div>
        );
    }
}