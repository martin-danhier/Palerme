// Move around a hex
export function* moveAround(data, r, l) {
    yield [r - 1, l - 1];
    yield [r, l - 1];
    yield [r + 1, l];
    yield [r + 1, r + 1];
    yield [r, l + 1];
    yield [r - 1, r];
}

export function indexOfCoord(array, coords){
    for (let i = 0; i < array.length; i++){
        if (sameCoords(array[i], coords)){
            return i;
        }
    }
    return -1;
}

export function addHex(data, r, l, type, number) {
    // create the hex
    let hex = { type }
    if (number) {
        hex.number = number;
    }

    // save it
    if (!data.hexes[r]) { data.hexes[r] = {} }
    data.hexes[r][l] = hex;
}

export function sortCoords(coords) {
    coords.sort(compareCoords);
    return coords;
}

export function compareCoords(coord1, coord2) {
    // r smaller
    if (coord1[0] < coord2[0])
        return -1;
    // r greater
    else if (coord1[0] > coord2[0])
        return 1;
    // r equal
    // l smaller
    else if (coord1[1] < coord2[1])
        return -1;
    // l greater
    else if (coord1[1] > coord2[1])
        return 1;
    // r and l equal, coords are perfectly equal
    return 0;
}

export function sameCoords(coord1, coord2) {
    if (coord1.length === 2 && coord2.length === 2) {
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    } else throw new Error("Coords must have a size of 2.");
}

export function sameEdges(edge1, edge2) {
    if (edge1.length === 2 && edge2.length === 2) {
        return sameCoords(edge1[0], edge2[0])
            && sameCoords(edge1[1], edge2[1]);
    } else throw new Error("Edges must have a size of 2.");
}

export function sameVertices(vertex1, vertex2) {
    if (vertex1.length === 3 && vertex2.length === 3) {
        return sameCoords(vertex1[0], vertex2[0])
            && sameCoords(vertex1[1], vertex2[1])
            && sameCoords(vertex1[2], vertex2[2]);
    } else throw new Error("Vertices must have a size of 3.");
}

export function isThereRoad(data, coords) {
    for (let road of data.roads) {
        if (sameEdges(coords, road.hexes)) {
            return true;
        }
    }
    return false;
}

export function getSettlement(data, coords) {
    for (let i = 0; i < data.settlements.length; i++) {
        if (sameVertices(coords, data.settlements[i].hexes)) {
            return i;
        }
    }
    return undefined;
}

export function isThereSettlement(data, coords) {
    for (let settlement of data.settlements) {
        if (sameVertices(coords, settlement.hexes)) {
            return true;
        }
    }
    return false;
}



export function isCoordInArray(coord, array) {
    for (let item of array) {
        if (sameCoords(coord, item)) {
            return true;
        }
    }
    return false;
}

export function isVertexAdjacentToEdge(vertex, edge) {
    return isCoordInArray(edge[0], vertex) && isCoordInArray(edge[1], vertex);
}

export function getPlayerHarbors(G, player) {
    let found = [];
    for (let harbor of G.harbors) {
        if (! found.includes(harbor.type)) {
            for (let settlement of G.settlements) {
                if (settlement.player === player && isVertexAdjacentToEdge(settlement.hexes, harbor.hexes)) {
                    found.push(harbor.type);
                }
            }
        }
    }
    return found;
}

export function playerHasHarbor(G, player, harborType) {
    for (let harbor of G.harbors) {
        if (harbor.type === harborType) {
            for (let settlement of G.settlements) {
                if (settlement.player === player && isVertexAdjacentToEdge(settlement.hexes, harbor.hexes)) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function playerIsNextToRobber(G, player) {
    for (let settlement of G.settlements) {
        if (settlement.player === player && isCoordInArray(G.robber, settlement.hexes)) {
            return true;
        }
    }
    return false;
}

export function substractCoords(coord1, coord2) {
    return [coord1[0] - coord2[0], coord1[1] - coord2[1]];
}

export function addCoords(coord1, coord2){
    return [coord1[0] + coord2[0], coord1[1] + coord2[1]];
}

// [1,0] -> [1,-1] -> [0,-1] -> [-1,0] -> [-1,1] -> [0,1] -> [1,0]...
export function rotationCounterClockwise(center, start) {
    let dCoord = substractCoords(start, center);
    let x = null;
    if (dCoord[0] === 0) {
        x = [dCoord[1], 0];
    } else if (dCoord[1] === 0) {
        x = [dCoord[0], - dCoord[0]];
    } else {
        x = [0, dCoord[1]];
    }
    return addCoords(center, x);
}

// [1,0] -> [0,1] -> [-1,1] -> [-1,0] -> [0,-1] -> [1,-1] -> [1,0]...
export function rotationClockwise(center, start) {
    let dCoord = substractCoords(start, center);
    let x = null;
    if (dCoord[0] === 0) {
        x = [- dCoord[1], dCoord[1]];
    } else if (dCoord[1] === 0) {
        x = [0, dCoord[0]];
    } else {
        x = [dCoord[0], 0];
    }
    return addCoords(center, x);
}

export function areEdgesAdjacents(edge1, edge2) {
    // Get hex in common
    let common = null;
    let other1 = null;
    let other2 = null;

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            if (sameCoords(edge1[i], edge2[j])) {
                common = edge1[i];
                other1 = edge1[(i + 1) % 2];
                other2 = edge2[(j + 1) % 2];
                break;
            }
        }
    }

    // 1. One hex in common
    if (common != null) {
        // 2. the two others hex are adjacents
        return sameCoords(rotationClockwise(common, other1), other2)
            || sameCoords(rotationCounterClockwise(common, other1), other2);
    }
    else {
        return false;
    }
}

/**
 * Compares two hexes to see if they are adjacents
 * @param {number[]} hex1 
 * @param {number[]} hex2 
 */
export function areHexesAdjacent(hex1, hex2) {
    let sub = substractCoords(hex1, hex2);
    return isCoordInArray(sub, [[0,1],[1,0],[0,-1],[-1,0],[1,-1],[-1,1]]);
}