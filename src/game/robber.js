import { playerIsNextToRobber } from "./hexes";
import { INVALID_MOVE } from "boardgame.io/core";




export function discardHalf(G, ctx, cards) {
    let player = ctx.playerID;

    // Discard half
    if (cards.length === Math.floor(G.players[player].deck.resources.length / 2)) {
        let newList = [];

        // discard them
        for (let i = 0; i < G.players[player].deck.resources.length; i++) {
            if (!cards.includes(i)) {
                newList.push(G.players[player].deck.resources[i]);
            }
        }

        G.players[player].deck.resources = newList;
        return;
    }

    return INVALID_MOVE;
}

export function moveRobber(G, ctx, coords) {
    if (coords !== G.robber) {
        G.robber = coords;

        // Which players are possible targets ?
        let adj = [];
        for (let player in G.players) {
            if (playerIsNextToRobber(G, player) && G.players[player].deck.resources.length > 0) {
                adj.push(player);
            }
        }

        // Save it for use in front end
        G.robberTargets = adj;

        // Change the stage
        if (adj.length > 0) {
            ctx.events.setActivePlayers({
                currentPlayer: 'stealResource'
            });
        }
        else {
            ctx.events.setActivePlayers({
                currentPlayer: 'mainStage',
                others: 'tradeOnly'
            })
        }
        return;
    }
    return INVALID_MOVE;
}

export function stealResource(G, ctx, player, cardID) {
    if (playerIsNextToRobber(G, player)) {
        let card = G.players[player].deck.resources[cardID];

        G.players[player].deck.resources.splice(cardID, 1);
        G.players[ctx.currentPlayer].deck.resources.push(card);

        ctx.events.setActivePlayers({
            currentPlayer: 'mainStage',
            others: 'tradeOnly'
        });
        return;
    }
    return INVALID_MOVE;


}