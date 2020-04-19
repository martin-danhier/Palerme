import React from 'react';
import { makeStyles } from '@material-ui/styles';
import MainPageContent from './main-content';

// Provide JSS style here
const useStyles = makeStyles(theme => ({
  
}));

// This function provide the style sheet to the page
export default function MainPage(props){
  const classes = useStyles();
  return <MainPageContent classes={classes} {...props} />;
}