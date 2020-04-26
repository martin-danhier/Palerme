import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { CirclePicker } from 'react-color';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { DialogContentText } from '@material-ui/core';

const colors = [
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#1abc9c'
];

export default class ColorPickerDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            color: "",
        }
    }


    handleClose = () => {
        if (this.state.color !== "") {
            this.props.moves.chooseColor(this.state.color);
        }
    };

    handleChangeColor = (color) => {
        this.setState({ color: color.hex });
    }

    render() {
        return (
            <div>
                <Dialog

                    open={this.props.open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Choisissez votre couleur"}</DialogTitle>
                    <DialogContent style={{ margin: 15 }}>
                        <CirclePicker width="300px" color={this.state.color} onChangeComplete={this.handleChangeColor} colors={colors} />
                        <DialogContentText></DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary" autoFocus>
                            Valider
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}