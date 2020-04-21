import Cookies from 'js-cookie';
import { placeRoad, placeTown, placeSettlement } from './placement';
import { TurnOrder } from 'boardgame.io/core';
import {
  buy,
  tradeWithHarbors,
  getResourcesOfSettlement,
  giveResource,
  makeTradeOffer,
  acceptTradeOffer,
  makeTradeCounterOffer,
  cancelTradeOffer,
  updateTradeOffer
} from './trade';
import {
  discardHalf,
  moveRobber,
  stealResource
} from './robber';
import {
  useDevelopment,
  chooseResources,
  monopoly
} from './development';
import {
  checkLongestRoadAward
} from './awards';

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
      knights: 0,
      deck: {
        developments: [
          {
            cooldown: 0,
            type: "knight"
          },
          {
            cooldown: 0,
            type: "knight"
          },
          {
            cooldown: 0,
            type: "knight"
          },
          {
            cooldown: 0,
            type: "knight"
          },
        ],
        resources: ["wood", "clay", "stone", "stone"]
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
    let moreThan7 = {}

    // A player having > 7 cards goes in the discardHalf stage
    for (let player = 0; player < ctx.numPlayers; player++) {
      player = `${player}`;

      if (G.players[player].deck.resources.length > 7) {
        moreThan7[player] = {
          stage: 'discardHalf',
          moveLimit: 1,
        };
      }
    }
    // Check if someone must go to that stage
    if (Object.keys(moreThan7).length > 0) {
      // Apply setStage
      ctx.events.setActivePlayers({
        value: moreThan7,
        next: {
          currentPlayer: 'moveRobber',
          moveLimit: 1,
          next: {
            currentPlayer: 'stealResource',
            moveLimit: 1,
            next: {
              currentPlayer: 'mainStage',
              others: 'tradeOnly',
            }
          }
        }
      });
    }
    // If nobody goes to that stage, go directly to the next one
    else {
      ctx.events.setActivePlayers({
        currentPlayer: 'moveRobber',
        moveLimit: 1,
        next: {
          currentPlayer: 'stealResource',
          moveLimit: 1,
          next: {
            currentPlayer: 'mainStage',
            others: 'tradeOnly',
          }
        }
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
  name: "Palerme",
  setup: setup,

  phases: {
    placement: {
      next: 'main',
      turn: {
        stages: {
          placeSettlement: {
            moves: { placeSettlement },
            next: 'placeRoad'
          },
          placeRoad: {
            moves: { placeRoad }
          },
        },
        onBegin: (G, ctx) => {
          // Set the player on the placeSettlement stage
          ctx.events.setActivePlayers({
            currentPlayer: "placeSettlement",
          });
          return G;
        },
        onMove: (G, ctx) => {
          console.log(ctx.activePlayers[ctx.currentPlayer]);
          if (ctx.activePlayers[ctx.currentPlayer] === 'placeSettlement') {
            ctx.events.setActivePlayers({
              currentPlayer: "placeRoad",
            });
          }
          else {
            ctx.events.endTurn();
          }
        },
        order: {
          // Start with 0
          first: (G, ctx) => 0,

          // Add 1, but if the array is over, go to the next phase
          next: (G, ctx) => {
            if (ctx.playOrderPos === ctx.numPlayers * 2 - 1) {
              ctx.events.endPhase();
              return 0;
            }
            return ctx.playOrderPos + 1;
          },

          // define turn order for placement phase
          playOrder: (G, ctx) => {
            let order = [];
            // One turn clockwise
            for (let i = 0; i < ctx.numPlayers; i++) {
              order.push(`${i}`);
            }
            // One turn counter-clockwise
            for (let i = ctx.numPlayers - 1; i >= 0; i--) {
              order.push(`${i}`);
            }

            return order;
          }
        }
      }
    },
    main: {
      start: true,
      turn: {
        order: TurnOrder.RESET,
        onBegin: (G, ctx) => {
          checkLongestRoadAward(G, ctx);

          // Begin dice stage
          ctx.events.setActivePlayers({ currentPlayer: 'rollDices' });

          // Decrement cooldowns of development cards
          for (let dev of G.players[ctx.currentPlayer].deck.developments) {
            if (dev.cooldown > 0) {
              dev.cooldown -= 1;
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
            moves: {
              buy,
              tradeWithHarbors,
              useDevelopment,
              //trade
              makeTradeOffer,
              acceptTradeOffer,
              makeTradeCounterOffer,
              cancelTradeOffer,
              updateTradeOffer
            }
          },
          tradeOnly: {
            moves: {
              makeTradeOffer,
              acceptTradeOffer,
              makeTradeCounterOffer,
              cancelTradeOffer,
              updateTradeOffer
            }
          },
          discardHalf: {
            moves: { discardHalf },
          },
          moveRobber: {
            moves: { moveRobber },
          },
          stealResource: {
            moves: { stealResource },
          },
          chooseResources: {
            moves: { chooseResources },
          },
          monopoly: {
            moves: { monopoly },
          }
        }
      },
    }
  }
};