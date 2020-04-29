import React from 'react';

// load images
const wood = require('./resources/card_wood.png');
const clay = require('./resources/card_clay.png');
const stone = require('./resources/card_stone.png');
const wheat = require('./resources/card_wheat.png');
const sheep = require('./resources/card_sheep.png');
const back = require('./resources/card_back.png');

/**
 * Manages the drawing of a card
 * @extends React.Component<{type: string, visible: boolean}>
 */
export class GameCard extends React.Component {



    chooseImage = () => {
        if (this.props.visible === true) {
            switch (this.props.type) {
                case 'wood':
                    return wood;
                case 'clay':
                    return clay;
                case 'stone':
                    return stone;
                case 'wheat':
                    return wheat;
                case 'sheep':
                    return sheep;
                default:
                    return back;
            }
        }
        else return back;
    }

    render() {
        return <img style={{margin: 3}} draggable="false" width="125px" src={this.chooseImage()} alt={this.props.type ?? "Ressource inconnue"}

        />
    }
}