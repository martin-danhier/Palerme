// Place roads/settlements/towns

import { sortCoords, isThereRoad, isThereSettlement, getSettlement, addCoords, substractCoords } from "./hexes";
import { checkLongestRoadAward } from "./awards";

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
            data: getRoadData(coords),
        });
        
        checkLongestRoadAward(G, ctx);
        return G;
    }
}

export function getRoadData(hexes) {
    // substract the coords. 
    // Since the coords are sorted in hexes and we always substract by the smaller, 
    // there are only 3 possible results: (0,1), (1,0) and (1,-1)
    // Each result corresponds to a specfic orientation on the Hex:
    // type a: (0,1) a diagonal like \
    // type b: (1,-1) a straight line like |
    // type c: (1,0) a diagonal like /
    let dHex = substractCoords(hexes[1], hexes[0]);

    // The hex in the A side of the edge
    let AHex = null;
    // The hex in the B side of the edge
    let BHex = null;

    let type = null;

    // A and B are types of vertices:
    //
    // A:   |
    //     / \
    //
    // B:  \ /
    //      |

    // type a
    if (dHex[0] === 0) {
        type = 'a';
        // A = clockwise side
        AHex = addCoords(hexes[0], [-1, 1]);
        // B = counter-clockwise side
        BHex = addCoords(hexes[0], [1, 0]);
    }
    // type c
    else if (dHex[1] === 0) {
        type = 'c';
        // A = counter-clockwise side
        AHex = addCoords(hexes[0], [1, -1]);
        // B = clockwise side
        BHex = addCoords(hexes[0], [0, 1]);
    }
    // type b
    else {
        type = 'b';
        // A = clockwise side
        AHex = addCoords(hexes[0], [1, 0]);
        // B = counter-clockwise side
        BHex = addCoords(hexes[0], [0, -1]);
    }

    let AVertex = sortCoords([
        hexes[0],
        hexes[1],
        AHex,
    ]);

    let BVertex = sortCoords([
        hexes[0],
        hexes[1],
        BHex,
    ]);

    return { type, AVertex, BVertex };
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