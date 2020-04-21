import { playerIsNextToRobber } from "./hexes";




export function discardHalf(G, ctx, cards) {
    let player = ctx.playerID;

    // Discard half
    if (cards.length === Math.floor(G.players[player].deck.resources.length / 2)) {
        let newList = [];
        console.log(cards)
        // discard them
        for (let i = 0; i < G.players[player].deck.resources.length; i++) {
            if (!cards.includes(i)) {
                newList.push(G.players[player].deck.resources[i]);
            }
            console.log(newList)
        }

        G.players[player].deck.resources = newList;

        return G;
    }
}

export function moveRobber(G, ctx, coords) {
    if (coords !== G.robber){
        G.robber = coords;
        return G;
    }
}

export function stealResource(G, ctx, player, cardID){
    if (playerIsNextToRobber(G, player))
    {
        let card = G.players[player].deck.resources[cardID];
        
        G.players[player].deck.resources.splice(cardID, 1);
        G.players[ctx.currentPlayer].deck.resources.push(card);
    }


}