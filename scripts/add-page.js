const fs = require("fs");
const rs = require('readline-sync');



// list existing pages
function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path + '/' + file).isDirectory();
    });
}
const directories = getDirectories('./src/pages');


// get the name of the page to create
let pageName = "";
let ok = false;

console.log("\x1b[1;33mQuel est le nom de la page que vous voulez créer ? (CTRL + C pour annuler) \x1b[0m");
while (!ok) {
    pageName = rs.prompt();

    if (! /^\b[a-z][a-z0-9-]*\b$/.test(pageName)) {
        console.log("\x1b[1;31mLe nom doit commencer par une minuscule, et ensuite doit contenir uniquement des minuscules, chiffres ou tirets. Ex: \"ma-page-42\"\x1b[0m");
    } else if (directories.indexOf(pageName) > -1) {
        console.log(`\x1b[1;31mLa page "${pageName}" existe déjà.\x1b[0m`);
    } else {
        ok = true;
    }
}

// generate a component name from page name (convert to PascalCase)
var componentName = "";
pageName.split('-').forEach((value) => {
    if (value.length > 0) {
        componentName += value.replace(/(\b[a-z])/, (first) => {
            return first.toUpperCase();
        });
    }
})

// create the directory
fs.mkdirSync(`./src/pages/${pageName}`);

// write the style file

var styleFileContent = `import React from 'react';
import { makeStyles } from '@material-ui/styles';
import ${componentName}PageContent from './${pageName}-content';

// Provide JSS style here
const useStyles = makeStyles(theme => ({
  
}));

// This function provide the style sheet to the page
export default function ${componentName}Page(props){
  const classes = useStyles();
  return <${componentName}PageContent classes={classes} {...props} />;
}`;

fs.writeFileSync(`./src/pages/${pageName}/${pageName}.js`, styleFileContent);

// write the content page

var contentFileContent = `import React from 'react';
import { Typography } from "@material-ui/core";

export default class ${componentName}PageContent extends React.Component {

    render() {
        return (
        <Typography>
            Welcome to my ${componentName} Page !
        </Typography>
        );
    }
}`;

fs.writeFileSync(`./src/pages/${pageName}/${pageName}-content.js`, contentFileContent);

// add the route to index.js
// var indexContent = fs.readFileSync('./src/index.js').toString();

// add the page to the routes
// indexContent = indexContent.replace(/(<Switch>\n?( *)(?:(?!<\/Switch>)(?:\s|.))+?)$(\s+<Route component={Error404Page} \/>\s+<\/Switch>)/gm, `$1\n$2<Route path="/${pageName}" component={${componentName}Page} />$3`);

// add the import at the end of the imports
// indexContent = indexContent.replace(/((?:import .+\n)+(?:import .+))/, `$1\nimport ${componentName}Page from './pages/${pageName}/${pageName}';`)

// save
// fs.writeFileSync("./src/index.js", indexContent);

console.log(`\x1b[1;33mLa page "${pageName}" a été créée avec succès.\x1b[0m`);