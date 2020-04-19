import { Typography, CssBaseline, Grid } from "@material-ui/core";
import React from 'react';

/**
 * Page displayed in an invalid route.
 * @param {classes=} classes JSS classes for this component. 
 */
export default class Error404PageContent extends React.Component {

    /**
     * Renders the JSX.
     */
    render() {
        return (
            <>
                <CssBaseline />
                <Grid className={this.props.classes.root}>
                    <Typography variant="h2" >Erreur 404</Typography>
                    <Typography variant="h5">La page que vous essayez d'atteindre n'a pas été trouvée.</Typography>
                </Grid>
            </>
        );
    }
}