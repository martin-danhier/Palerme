import React from 'react';
import { makeStyles } from '@material-ui/styles';
import Error404PageContent from './error-404-content';

/**
 * JSS style for the page.
 */
const useStyles = makeStyles(theme => ({
  root:{
    textAlign:"center"
  }
}));

/**
 * Page displayed in an invalid route.
 * @param {*} props 
 */
export default function Error404Page(props) {
  const classes = useStyles();
  return <Error404PageContent classes={classes} {...props} />;
}