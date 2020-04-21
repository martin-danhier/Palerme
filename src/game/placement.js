// Place roads/settlements/towns

import { sortCoords, isThereRoad, isThereSettlement, getSettlement } from "./hexes";

/**
 * 
 * @param {*} G State of the game
 * @param {*} ctx Context of the game
 * @param {[[number, number], [number, number]]} coords Coords of the new road
 */
export function placeRoad(G, ctx, coords) {
    // Sort coords
    sortCoords(coords);
    if (!isThereRoad(G, coords)) {
        G.roads.push({
            player: ctx.currentPlayer,
            hexes: coords,
        });
        return G;
    }
}

/**
 * 
 * @param {*} G State of the game
 * @param {*} ctx Context of the game
 * @param {[[number, number], [number, number], [number, number]]} coords Coords of the settlement
 */
export function placeSettlement(G, ctx, coords) {

    // Sort coords
    sortCoords(coords);
    if (!isThereSettlement(G, coords)) {
        G.settlements.push({
            player: ctx.currentPlayer,
            level: 1, // settlement
            hexes: coords
        });
        G.players[ctx.currentPlayer].score += 1;
        return G;
    }
}

export function placeTown(G, ctx, coords) {
    // Sort coords
    sortCoords(coords);
    let s = getSettlement(G, coords);
    // If the settlement exists, is owned by the current player and is not a town
    if (s !== undefined && G.settlements[s].player === ctx.currentPlayer && G.settlements[s].level === 1){
        G.settlements[s].level = 2;
        G.players[ctx.currentPlayer].score += 1;
        return G;
    }
}