import { substractCoords, addCoords, sameVertices, sortCoords } from "./hexes";

export function checkMostPowerfulArmyAward(G, ctx) {
    let max = 0;
    let maxPlayer = null;
    // get the player with the most knights
    for (let i = 0; i < ctx.numPlayers; i++) {
        let iStr = i.toString();
        if (G.players[iStr].knights > max) {
            max = G.players[iStr].knights;
            maxPlayer = iStr;
        }
    }
    // apply award
    if (max >= 3) {
        if (G.awards.mostPowerfulArmy === null || max > G.players[G.awards.mostPowerfulArmy].knights) {
            if (G.awards.mostPowerfulArmy !== null) {
                G.players[G.awards.mostPowerfulArmy].score -= 2;
            }
            G.awards.mostPowerfulArmy = maxPlayer;
            G.players[maxPlayer].score += 2;
        }
    }
}

export function checkLongestRoadAward(G, ctx) {

    
    let roadsAdjacency = [];
    let memory = {};

    for (let i = 0; i < G.roads.length; i++) {

        let adjacentA = [];
        let adjacentB = [];

        // compute the data if it doesn't exist already
        if (memory[i] === undefined) {
            memory[i] = getRoadData(G, i);
        }


        // Get adjacent roads        
        for (let j = 0; j < G.roads.length; j++) {
            if (G.roads[j] !== G.roads[i] && G.roads[j].player === G.roads[i].player) {

                // compute the data if it doesn't exist already
                if (memory[j] === undefined) {
                    memory[j] = getRoadData(G, j);
                }

                // Check adjacency in A
                if (sameVertices(memory[i].AVertex, memory[j].AVertex)) {
                    console.log("voisin en A");
                    adjacentA.push(j);
                }

                // Check adjacency in B
                else if (sameVertices(memory[i].BVertex, memory[j].BVertex)) {
                    console.log("voisin en B");
                    adjacentB.push(j);
                }
            }
        }

        roadsAdjacency.push({A: adjacentA, B: adjacentB});
    }
    console.log(roadsAdjacency);
}

function getRoadData(G, index) {
    // substract the coords. 
    // Since the coords are sorted in hexes and we always substract by the smaller, 
    // there are only 3 possible results: (0,1), (1,0) and (1,-1)
    // Each result corresponds to a specfic orientation on the Hex:
    // type a: (0,1) a diagonal like \
    // type b: (1,-1) a straight line like |
    // type c: (1,0) a diagonal like /
    let dHex = substractCoords(G.roads[index].hexes[1], G.roads[index].hexes[0]);

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
        AHex = addCoords(G.roads[index].hexes[0], [-1, 1]);
        // B = counter-clockwise side
        BHex = addCoords(G.roads[index].hexes[0], [1, 0]);
    }
    // type c
    else if (dHex[1] === 0) {
        type = 'c';
        // A = counter-clockwise side
        AHex = addCoords(G.roads[index].hexes[0], [1, -1]);
        // B = clockwise side
        BHex = addCoords(G.roads[index].hexes[0], [0, 1]);
    }
    // type b
    else {
        type = 'b';
        // A = clockwise side
        AHex = addCoords(G.roads[index].hexes[0], [1, 0]);
        // B = counter-clockwise side
        BHex = addCoords(G.roads[index].hexes[0], [0, -1]);
    }

    let AVertex = sortCoords([
        G.roads[index].hexes[0],
        G.roads[index].hexes[1],
        AHex,
    ]);

    let BVertex = sortCoords([
        G.roads[index].hexes[0],
        G.roads[index].hexes[1],
        BHex,
    ]);

    return { type, AVertex, BVertex };
}