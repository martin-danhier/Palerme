import { playerHasHarbor, sameCoords } from './hexes';


export const prices = require('./prices.json');

export function buy(G, ctx, product) {

    if (product in prices) {
        let enough = hasEnoughResources(G, ctx.currentPlayer, prices[product]);
        if (enough) {
            removeResources(G, ctx.currentPlayer, prices[product]);

            if (product === "road") {
                ctx.events.setActivePlayers({
                    currentPlayer: 'placeRoad',
                    moveLimit: 1,
                    next: {
                        currentPlayer: 'mainStage',
                        others: 'tradeOnly',
                    }
                });
            } else if (product === "settlement") {
                ctx.events.setActivePlayers({
                    currentPlayer: 'placeSettlement',
                    moveLimit: 1,
                    next: {
                        currentPlayer: 'mainStage',
                        others: 'tradeOnly',
                    }
                });
            } else if (product === "town") {
                ctx.events.setActivePlayers({
                    currentPlayer: 'placeTown',
                    moveLimit: 1,
                    next: {
                        currentPlayer: 'mainStage',
                        others: 'tradeOnly',
                    }
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

export function getResourcesOfSettlement(G, settlement) {
    let resources = {};
    for (let hex of settlement.hexes) {
        if (!sameCoords(hex, G.robber)
            && G.hexes[hex[0]] !== undefined
            && G.hexes[hex[0]][hex[1]] !== undefined) {

            let type = G.hexes[hex[0]][hex[1]].type;
            let number = G.hexes[hex[0]][hex[1]].number;
            if (type !== "desert" && type !== "ocean" && number !== undefined) {
                if (resources[number] === undefined) {
                    resources[number] = [];
                }
                resources[number].push(convertTypeToResource(type));
            }

        }
    }
    return resources;
}

export function convertTypeToResource(type) {
    if (type === "hills") return "clay";
    else if (type === "mountains") return "stone";
    else if (type === "meadow") return "sheep";
    else if (type === "field") return "wheat";
    else if (type === "forest") return "wood";
    else throw new Error("Invalid hex type");
}

export function giveResource(G, resource, player, count) {
    for (let i = 0; i < count; i++) {
        G.players[player].deck.resources.push(resource);
    }
}

export function giveResources(G, player, resources) {
    for (let res of Object.keys(resources)) {
        giveResource(G, res, player, resources[res]);
    }
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

export function tradeWithHarbors(G, ctx, inputResource, outputResource, harborType) {
    let input = {};
    let valid = false;

    // Get the value of the price
    if (harborType === '4:1') {
        // consume 4 input resources to produce 1 output resource
        input[inputResource] = 4;
        valid = true;
    }
    else if (['wood', 'stone', 'clay', 'wheat', 'sheep', '3:1'].includes(harborType)) {
        // Check if the player has that harbor
        if (playerHasHarbor(G, ctx.currentPlayer, harborType)) {
            if (harborType === '3:1') {
                input[inputResource] = 3;
                valid = true;
            }
            // input resource must be the same of the harbor type
            else {
                input[harborType] = 2;
                valid = true;
            }
        }
    }

    // Check if the player has enough resources
    if (valid) {
        let enough = hasEnoughResources(G, ctx.currentPlayer, input);
        if (enough) {
            removeResources(G, ctx.currentPlayer, input);
            giveResource(G, outputResource, ctx.currentPlayer, 1);
            return G;
        }

    }
}

// input: ["wood", "wood", "clay"]
// output: {"wood": 2, "clay": 1}
export function convertArrayToPrice(array) {
    let price = {};
    for (let resource of array) {
        if (price[resource] === undefined) {
            price[resource] = 0;
        }
        price[resource]++;
    }
    return price;
}

export function makeTradeOffer(G, ctx, toPlayer, fromCards, toCards) {
    let player = ctx.playerID;

    if (toPlayer === player) {
        return undefined;
    }

    // Only the current player can propose to anyone
    if (ctx.activePlayers[player] === "tradeOnly" && toPlayer !== ctx.currentPlayer) {
        return undefined;
    }


    if (hasEnoughResources(G, player, fromCards)) {
        G.trade[G.tradeCounter] = {
            from: player,
            to: toPlayer,
            fromCards,
            toCards,
        };
        G.tradeCounter++;
        return G;
    }
}

export function acceptTradeOffer(G, ctx, tradeID) {
    let player = ctx.playerID;

    // to accept a trade, a player must be the one concerned
    if (G.trade[tradeID] === undefined || G.trade[tradeID].to !== player) {
        return undefined;
    }

    if (hasEnoughResources(G, player, G.trade[tradeID].toCards)) {

        // execute the trade
        removeResources(G, G.trade[tradeID].from, G.trade[tradeID].fromCards);
        removeResources(G, G.trade[tradeID].to, G.trade[tradeID].toCards);
        giveResources(G, G.trade[tradeID].from, G.trade[tradeID].toCards);
        giveResources(G, G.trade[tradeID].to, G.trade[tradeID].fromCards)

        // remove the trade
        delete G.trade[tradeID];

        return G;
    }

}

export function updateTradeOffer(G, ctx, tradeID, fromCards, toCards) {
    let player = ctx.playerID;
    // to update a trade, a player must be the one concerned
    if (G.trade[tradeID] === undefined || G.trade[tradeID].from !== player) {
        return undefined;
    }

    if (hasEnoughResources(G, player, fromCards)) {
        G.trade[tradeID] = {
            from: G.trade[tradeID].from,
            to: G.trade[tradeID].to,
            fromCards,
            toCards,
        }
        return G;
    }
}

export function makeTradeCounterOffer(G, ctx, tradeID, fromCards, toCards) {
    let player = ctx.playerID;
    // to update a trade, a player must be the one concerned
    if (G.trade[tradeID] === undefined || G.trade[tradeID].to !== player) {
        return undefined;
    }


    if (hasEnoughResources(G, player, fromCards)) {
        G.trade[tradeID] = {
            from: G.trade[tradeID].to,
            to: G.trade[tradeID].from,
            fromCards,
            toCards,
        }
        return G;
    }

}

export function cancelTradeOffer(G, ctx, tradeID) {
    let player = ctx.playerID;

    // to cancel a trade, a player must be the one concerned
    if (G.trade[tradeID] === undefined || (G.trade[tradeID].to !== player && G.trade[tradeID].from !== player)) {
        return undefined;
    }

    delete G.trade[tradeID];
    return G;
}