import Cookies from 'js-cookie';
import { placeRoad, placeTown, placeSettlement } from './placement';
import { Stage } from 'boardgame.io/core';
import { getResourcesOfSettlement, giveResource } from './hexes';
import { buy } from './trade';

// setup G
function setup(ctx) {
  console.log(ctx);
  // Load map scaffold
  let data = require('./default_state.json');

  // Load player name
  let name = Cookies.get('playerName');
  if (!name) {
    name = "Anonyme"
  }

  // Init players
  for (let i = 0; i < ctx.numPlayers; i++) {
    data.players[i] = {
      name,
      score: 0,
      deck: {
        developments: [],
        resources: ["clay", "wood", "stone", "wheat", "sheep"]
      }
    };
  }

  return data;
}

function rollDices(G, ctx) {
  // Roll the dices
  G.dices = ctx.random.Die(6, 2);

  // 7 ?
  let diceSum = G.dices[0] + G.dices[1]
  if (diceSum === 7) {
    let moreThan7 = { value: {} }

    // A player having > 7 cards goes in the discardHalf stage
    for (let player = 0; player < ctx.numPlayers; player++) {
      player = `${player}`;

      if (G.players[player].deck.resources.length > 7) {
        moreThan7.value[player] = {
          stage: 'discardHalf',
          moveLimit: Math.floor(G.players[player].deck.resources.length / 2)
        };
      }
    }
    // Check if someone must go to that stage
    if (moreThan7.value.length > 0) {
      // Apply setStage
      ctx.events.setActivePlayers({
        value: moreThan7,
      });
    }
    // If nobody goes to that stage, go directly to the next one
    else {
      ctx.events.setActivePlayers({
        currentPlayer: 'moveRobber'
      })
    }
  }

  // Generate resources
  else {
    for (let s of G.settlements) {
      let resources = getResourcesOfSettlement(G, s);
      if (diceSum in resources) {
        for (let resource of resources[diceSum]) {
          giveResource(G, resource, s.player, s.level);
        }
      }
    }

    // Set the stage
    ctx.events.setActivePlayers({
      currentPlayer: 'mainStage',
      others: 'tradeOnly'
    });
  }

  return G;


}

export const PalermeGame = {
  setup: setup,
  turn: {
    onBegin: (G, ctx) => {
      if (ctx.phase === 'main') {
        // Begin dice stage
        ctx.events.setActivePlayers({ currentPlayer: 'rollDices' });

        // Decrement cooldowns of development cards
        for (let dev of G.players[ctx.currentPlayer].deck.developments){
          if (dev.cooldown > 0){
            dev.cooldown -= 1;
          }
        }
      }
      return G;
    },
    stages: {
      // phase "placement"
      placeSettlement: {
        moves: { placeSettlement }
      },
      placeRoad: {
        moves: { placeRoad }
      },
      placeTown: {
        moves: { placeTown }
      },
      rollDices: {
        moves: { rollDices },
      },
      mainStage: {
        moves: { buy }
      },
      tradeOnly: {

      },
      discardHalf: {},
      moveRobber: {},
      stealResource: {}
    }
  },
  phases: {
    placement: {
      onBegin: (G, ctx) => {
        // Set the first player on the placeSettlement stage
        ctx.events.setStage('rollDices')
      },
      next: 'main',

    },
    main: {

      start: true,
    }
  }
};