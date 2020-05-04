import Cookies from 'js-cookie';
import {
  placeRoad,
  placeTown,
  placeSettlement,
  getRoadData
} from './placement';
import { TurnOrder, INVALID_MOVE } from 'boardgame.io/core';
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

// setup G
function setup(ctx) {
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
      color: '#ffffff',
      score: 0,
      knights: 0,
      deck: {
        developments: [
          {
            cooldown: 0,
            type: "progress_resources"
          },
          {
            cooldown: 0,
            type: "progress_roads"
          },
          {
            cooldown: 0,
            type: "progress_monopoly"
          },
          {
            cooldown: 0,
            type: "victory_point"
          },
          {
            cooldown: 1,
            type: "knight"
          },
        ],
        resources: ["wood", "clay", "stone", "stone"]
      }
    };
  }

  for (let road of data.roads) {
    if (road.data === undefined) {
      road.data = getRoadData(road.hexes);
    }
  }

  return data;
}

function makePlayerView(G, playerID) {
  if (playerID !== null && "players" in G) {
    let clone = {};
    clone.dices = G.dices;
    // Modify players
    clone.currentPlayer = G.players[playerID];
    clone.otherPlayers = {};
    for (let other of Object.keys(G.players)) {
      if (other !== playerID) {
        clone.otherPlayers[other] = {
          name: G.players[other].name,
          score: G.players[other].score,
          color: G.players[other].color,
          knights: G.players[other].knights,
          deck: {
            developments: G.players[other].deck.developments.length,
            resources: G.players[other].deck.resources.length,
          },
        }
      }
    }
    // Put the rest
    clone.roads = G.roads;
    clone.settlements = G.settlements;
    clone.hexes = G.hexes;
    clone.robber = G.robber;
    clone.robberTargets = G.robberTargets;
    clone.awards = G.awards;
    clone.trade = G.trade;
    clone.harbors = G.harbors;
    clone.victoryRequirement = G.victoryRequirement;

    return clone;
  }
  else {
    return G;
  }

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
          others: 'idle',
        }
      });
    }
    // If nobody goes to that stage, go directly to the next one
    else {
      ctx.events.setActivePlayers({
        currentPlayer: 'moveRobber',
        others: 'idle',
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

function countSecretVictoryPoint(G, player) {
  let value = 0;
  for (let dev of G.players[player].deck.developments) {
    if (dev.type === 'victory_point') {
      value += 1;
    }
  }
  return value;
}

function isVictory(G, ctx) {
  for (let player of Object.keys(G.players)) {
    if (G.players[player].score + countSecretVictoryPoint(G, player) >= G.victoryRequirement) {
      console.log(`Player ${player} won the game with ${G.players[player].score + countSecretVictoryPoint(G, player)} points !`)
      return { winner: player }
    }
  }
}

function shuffleDeck(G, ctx) {
  let player = ctx.playerID;
  G.players[player].deck.resources = ctx.random.Shuffle(G.players[player].deck.resources);
  return G;
}

function sortDeck(G, ctx) {
  let player = ctx.playerID;
  G.players[player].deck.resources = G.players[player].deck.resources.sort();
  return G;
}

export const PalermeGame = {
  name: "Palerme",
  setup: setup,
  endIf: isVictory,
  playerView: (G, ctx, playerID) => makePlayerView(G, playerID),
  phases: {
    register: {
      next: 'placement',
      start: true,
      onBegin: (G, ctx) => {
        // Set the player on the placeSettlement stage
        ctx.events.setActivePlayers({
          currentPlayer: "register",
          others: "register",
          moveLimit: 1,
        });
      },
      endIf: (G, ctx) => ctx.activePlayers === null && ctx.numMoves > 0,
      turn: {
        stages: {
          register: {
            moves: {
              chooseColor: {
                move: (G, ctx, color) => {
                  for (let player of Object.keys(G.players)) {
                    if (G.players[player].color === color) {
                      return INVALID_MOVE;
                    }
                  }

                  G.players[ctx.playerID].color = color;
                },
                client: false,
              }
            }
          }
        }
      }
    },
    placement: {
      next: 'main',
      turn: {
        stages: {
          placeSettlement: {
            next: 'placeRoad',
            moves: {
              placeSettlement: { move: placeSettlement, client: false },
            },
          },
          placeRoad: {
            moves: {
              placeRoad: { move: placeRoad, client: false },
            },
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
      },
    },
    main: {
      turn: {
        order: TurnOrder.RESET,
        onBegin: (G, ctx) => {

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
            moves: { placeSettlement: { move: placeSettlement, client: false } }
          },
          placeRoad: {
            moves: { placeRoad: { move: placeRoad, client: false } }
          },
          placeTown: {
            moves: { placeTown: { move: placeTown, client: false } }
          },
          rollDices: {
            moves: {
              rollDices: {
                move: rollDices,
                client: false,
              }
            },
          },
          mainStage: {
            moves: {
              buy: { move: buy, client: false },
              tradeWithHarbors: { move: tradeWithHarbors, client: false },
              useDevelopment: { move: useDevelopment, client: false },
              //trade
              makeTradeOffer: { move: makeTradeOffer, client: false },
              acceptTradeOffer: { move: acceptTradeOffer, client: false },
              makeTradeCounterOffer: { move: makeTradeCounterOffer, client: false },
              cancelTradeOffer: { move: cancelTradeOffer, client: false },
              updateTradeOffer: { move: updateTradeOffer, client: false },
              shuffleDeck: { move: shuffleDeck, client: false },
              sortDeck: { move: sortDeck, client: false }
            }
          },
          tradeOnly: {
            moves: {
              makeTradeOffer: { move: makeTradeOffer, client: false },
              acceptTradeOffer: { move: acceptTradeOffer, client: false },
              makeTradeCounterOffer: { move: makeTradeCounterOffer, client: false },
              cancelTradeOffer: { move: cancelTradeOffer, client: false },
              updateTradeOffer: { move: updateTradeOffer, client: false },
              shuffleDeck: { move: shuffleDeck, client: false },
              sortDeck: { move: sortDeck, client: false }
            }
          },
          discardHalf: {
            moves: { discardHalf: { move: discardHalf, client: false } },
          },
          moveRobber: {
            moves: { moveRobber },
          },
          stealResource: {
            moves: { stealResource: { move: stealResource, client: false } },
          },
          chooseResources: {
            moves: { chooseResources: { move: chooseResources, client: false } },
          },
          monopoly: {
            moves: { monopoly: { move: monopoly, client: false } },
          },
          idle: {
            moves: {
              shuffleDeck: { move: shuffleDeck, client: false },
              sortDeck: { move: sortDeck, client: false }
            }
          }
        }
      },
    }
  }
};