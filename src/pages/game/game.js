import React from 'react';
import { makeStyles } from '@material-ui/styles';
import GamePageContent from './game-content';

// Provide JSS style here
const useStyles = makeStyles(theme => ({
  App: {
    textAlign: "center",

  },
  AppHeader: {
    backgroundColor: "#222",
    height: 150,
    padding: 20,
    color: "white"
  }
  
}));

// This function provide the style sheet to the page
export default function GamePage(props){
  const classes = useStyles();
  return <GamePageContent classes={classes} {...props} />;
}