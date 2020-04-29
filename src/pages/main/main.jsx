import React from 'react';
import { makeStyles } from '@material-ui/styles';
import MainPageContent from './main-content';
import useWindowDimensions from './window-dimensions';

// Provide JSS style here
const useStyles = makeStyles(theme => ({
  
}));

// This function provide the style sheet to the page
export default function MainPage(props){
  const classes = useStyles();
  const { height, width } = useWindowDimensions();

  return <MainPageContent classes={classes} dimensions={{height, width}} {...props} />;
}

