import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@material-ui/core';
import './playerSelector.css';

/**
* @extends {React.Component<{players:object, onSubmit:Function}>}
*/
export class PlayerSelector extends React.Component {
    static propTypes = {
        players: PropTypes.object,
        onSubmit: PropTypes.func,
    }


    constructor(props) {
        super(props);

        this.state = {
            player: '',
        }
    }

    handleClose = (event) => {
        this.props.onSubmit(event, this.state.player);
    }

    handleChange = (event) => {
        let newState = Object.assign({}, this.state);
        newState.player = event.target.value;
        this.setState(newState);
    }

    render = () => {

        return <Dialog
            open={true}>
            {/* Title */}
            <DialogTitle>
                Choississez le joueur à qui voler une ressource.
            </DialogTitle>

            {/* Content */}
            <DialogContent>
                <DialogContentText>Vous ne pouvez sélectionner que les joueurs adjacents au voleur.</DialogContentText>

                {/* Selector */}
                <FormControl
                    fullWidth
                    variant="standard"
                    className="playerFormControl">
                    <InputLabel id="player-input-label">Joueur</InputLabel>
                    <Select
                        labelId="player-input-label"
                        value={this.state.player}
                        onChange={this.handleChange}>
                        {Object.keys(this.props.players).map((value) => {
                            return <MenuItem value={value} key={value}>{this.props.players[value]}</MenuItem>
                        })}
                    </Select>
                </FormControl>

            </DialogContent>

            {/* Buttons */}
            <DialogActions>
                <Button onClick={this.handleClose} color="primary" autoFocus>
                    Valider
                        </Button>
            </DialogActions>
        </Dialog>
    }
}