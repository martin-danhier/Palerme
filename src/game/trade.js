

export const prices = require('./prices.json');

export function buy(G, ctx, product) {

    if (product in prices) {
        let enough = hasEnoughResources(G, ctx.currentPlayer, prices[product]);
        if (enough) {
            removeResources(G, ctx.currentPlayer, prices[product]);

            if (product === "road") {
                ctx.events.setActivePlayers({
                    currentPlayer: 'placeRoad',
                    others: 'tradeOnly',
                });
            } else if (product === "settlement") {
                ctx.events.setActivePlayers({
                    currentPlayer: 'placeSettlement',
                    others: 'tradeOnly',
                });
            } else if (product === "town") {
                ctx.events.setActivePlayers({
                    currentPlayer: 'placeTown',
                    others: 'tradeOnly',
                });
            } else if (product === "development") {
                getRandomDevelopment(G, ctx, ctx.currentPlayer);
            }


            return G;
        }
    }
    else {
        console.error("Invalid product.");
    }
    return undefined;
}

export function hasEnoughResources(G, player, resources) {
    let resourcesCount = Object.assign({}, resources);
    // Decrease the value of each resource with the player inventory
    for (let res of G.players[player].deck.resources) {
        if (res in resourcesCount && resourcesCount[res] > 0) {
            resourcesCount[res] -= 1;
        }
    }


    // If all values are at 0, there are enough resources
    for (let res of Object.keys(resourcesCount)) {
        if (resourcesCount[res] > 0) return false;
    }

    // If this point is reached, then all values are at 0
    return true;
}

export function removeResources(G, player, resources) {
    let newDeck = []
    let resourcesCount = Object.assign({}, resources);

    // Decrease the value of each resource with the player inventory
    for (let res of G.players[player].deck.resources) {
        // Consume the resource
        if (res in resourcesCount && resourcesCount[res] > 0) {
            resourcesCount[res] -= 1;
        }
        // Leave it
        else {
            newDeck.push(res);
        }
    }
    G.players[player].deck.resources = newDeck;
}

export function getRandomDevelopment(G, ctx, player) {
    // Get the total number of cards left
    let cardsLeft = 0;
    for (let type of Object.keys(G.developmentsLeft)) {
        cardsLeft += G.developmentsLeft[type];
    }
    // Generate a random number
    let random = ctx.random.Number() * cardsLeft;

    // Get the card
    cardsLeft = 0;
    for (let type of Object.keys(G.developmentsLeft)) {
        cardsLeft += G.developmentsLeft[type];
        if (random <= cardsLeft) {
            // This is the selected type of card

            // Give the card to the player
            G.players[player].deck.developments.push({ type, cooldown: 1 });

            // Remove it from the pool
            G.developmentsLeft[type] -= 1;

            return;
        }
    }
}