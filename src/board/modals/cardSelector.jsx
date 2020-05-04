import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Backdrop, Button } from '@material-ui/core';
import './cardSelector.css';
import { GameCard } from '../components/card';

/**
* @extends {React.Component<{title:string, subtitle:string, open:boolean, numberToSelect:number, cards:array, numberOfCards:number, onSubmit:Function}>}
*/
export class CardSelector extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        subtitle: PropTypes.string,
        open: PropTypes.bool,
        numberToSelect: PropTypes.number,
        cards: PropTypes.array,
        numberOfCards: PropTypes.number,
        onSubmit: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.items = this.props.cards;
        if (!this.items && this.props.numberOfCards !== undefined) {
            this.items = Array.from(Array(this.props.numberOfCards).keys(), () => 'back');
            console.log(this.items);
        }
        else if (!this.items && this.props.numberOfCards === undefined) {
            throw new Error("Neither 'cards' nor 'numberOfCards' was provided to the CardSelector.");
        }

        this.state = {
            selected: []
        };
    }

    // Select / unselect card
    handleClick = (e, index) => {
        let numberToSelect = this.props.numberToSelect ?? 1;

        let newState = Object.assign({}, this.state);
        if (newState.selected.includes(index)) {
            // Remove if already present
            newState.selected.splice(newState.selected.indexOf(index), 1);
        }
        else {
            if (newState.selected.length === numberToSelect) {
                newState.selected = [];
            }
            // Add otherwise
            newState.selected.push(index);
        }
        this.setState(newState);
    }

    handleButtonClick = (event) => {
        this.props.onSubmit(event, this.state.selected);
    }


    render() {
        return <Backdrop
            className="resourceSelector"
            open={this.props.open}
            >
            <Typography variant="h4" className="title">
                {this.props.title ?? "Veuillez choisir une carte"}
            </Typography>
            <Typography variant="inherit" className="subtitle">
                {this.props.subtitle}
            </Typography>
            <div className="cardRow">
                {this.items.map((value, i) => <GameCard
                    selected={this.state.selected.includes(i)}
                    onClick={(e) => this.handleClick(e, i)}
                    visible={true}
                    type={value}
                    key={i}
                />)}
            </div>
            <Button 
                variant="outlined"
                className="submit-button"
                size="large"
                onClick={this.handleButtonClick}
            >Valider</Button>
        </Backdrop>
    }
}