import React from 'react';
import { PalermeBoard } from './board';
import { Grid } from '@material-ui/core';
import { GameCard } from './card';

import './interface.css';

/**
 * @extends React.Component<{G : {currentPlayer: {deck:{resources: string[]}}}}>
 */
export class PalermeInterface extends React.Component {

    render() {
        return <div>

            <PalermeBoard {...this.props} />
            <div className="bottomZone" >
                <Grid draggable="false" container spacing={1} justify="center">
                    {this.props.G.currentPlayer.deck.resources.map((tile, index) => {
                        return <Grid draggable="false" item key={index} >
                            <GameCard type={tile} visible={true} />
                        </Grid>
                    })}

                </Grid>
            </div>
        </div>
    }
}