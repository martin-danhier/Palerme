import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import { Grid, CssBaseline } from '@material-ui/core';

import Error404Page from './pages/error-404/error-404';
import GamePage from './pages/game/game';

/**
 * Theme of the website.
 */
const theme = createMuiTheme({
    palette: {
      divider: '#bdc3c7',
      success: {
        main: "#27ae60"
      },
      info: {
        main: "#3498db"
      },
      warning: {
        main: "#e67e22",
      },
      primary: {
        main: '#37474f',
        light: '#62727b',
        dark: '#102027'
      },
      secondary:{
        main: '#616161'
      }
    },

    status: {
      danger: 'orange',
    },
  });
  
  // main render
  ReactDOM.render(
    // add the theme
    <ThemeProvider theme={theme}>
      {/* CSS baseline (must-have classes) */}
      <CssBaseline />
      {/* declare the routes */}
      <Router>
          <Switch>
            <Route exact path="/" render={(props) => <Redirect to="/game" />} />
            <Route path="/game" component={GamePage} />
            <Route render={(props) => (
              <Grid 
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: '100vh' }}>
                <Error404Page />
              </Grid>
            )} />
          </Switch>
      </Router>
    </ThemeProvider>
    , document.getElementById('root'));
  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister();
  