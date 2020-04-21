import { giveResource } from "./trade";
import { checkMostPowerfulArmyAward } from './awards';

export function useDevelopment(G, ctx, cardID) {
    let card = G.players[ctx.currentPlayer].deck.developments[cardID];
    if (card.cooldown === 0) {
        if (card.type === "knight") {
            // register the knight
            G.players[ctx.currentPlayer].knights += 1;
            checkMostPowerfulArmyAward(G, ctx);
            // move robber
            ctx.events.setActivePlayers({
                currentPlayer: 'moveRobber',
                moveLimit: 1,
                next: {
                    currentPlayer: 'stealResource',
                    moveLimit: 1,
                    next: {
                        currentPlayer: 'mainStage',
                        others: 'tradeOnly'
                    }
                },
            });
        }
        else if (card.type === "progress_resources") {
            // move robber
            ctx.events.setActivePlayers({
                currentPlayer: 'chooseResources',
                moveLimit: 1,
                next: {
                    currentPlayer: 'mainStage',
                    others: 'tradeOnly'
                },
            });
        } else if (card.type === "progress_roads") {
            // construct 2 roads
            ctx.events.setActivePlayers({
                currentPlayer: 'placeRoad',
                moveLimit: 2,
                next: {
                    currentPlayer: 'mainStage',
                    others: 'tradeOnly'
                },
            })
        } else if (card.type === "progress_monopoly"){
            // monopoly
            ctx.events.setActivePlayers({
                currentPlayer: 'monopoly',
                moveLimit: 1,
                next: {
                    currentPlayer: 'mainStage',
                    others: 'tradeOnly'
                },
            });
        }
        else throw new Error("Invalid card type");

        // remove card
        G.players[ctx.currentPlayer].deck.developments.splice(cardID, 1);

        return G;
    }
}

export function chooseResources(G, ctx, resource1, resource2){
    giveResource(G, resource1, ctx.currentPlayer, 1);
    giveResource(G, resource2, ctx.currentPlayer, 1);
    return G;
}

export function monopoly(G, ctx, resource){
    let count = 0;

    // take all resources of that type
    for (let i = 0; i < ctx.numPlayers; i++){
        if (i.toString() !== ctx.currentPlayer){
            let newList = [];
            for (let res = 0; res < G.players[i.toString()].deck.resources.length; res++){
                if (G.players[i.toString()].deck.resources[res] === resource){
                    // found resource to take
                    count++;
                }
                else {
                    newList.push(G.players[i.toString()].deck.resources[res]);
                }
            }
            G.players[i.toString()].deck.resources = newList;
        }
    }
    // give the resources to the player
    giveResource(G, resource, ctx.currentPlayer, count);
    return G;
}