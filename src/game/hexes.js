// Move around a hex
export function* moveAround(data, r, l) {
    yield [r - 1, l - 1];
    yield [r, l - 1];
    yield [r + 1, l];
    yield [r + 1, r + 1];
    yield [r, l + 1];
    yield [r - 1, r];
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

export function getResourcesOfSettlement(G, settlement) {
    let resources = {};
    for (let hex of settlement.hexes) {
        if (G.hexes[hex[0]] !== undefined && G.hexes[hex[0]][hex[1]] !== undefined) {
            let type = G.hexes[hex[0]][hex[1]].type;
            let number = G.hexes[hex[0]][hex[1]].number;
            if (type !== "desert" && type !== "ocean" && number !== undefined) {
                if (resources[number] === undefined){
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

export function giveResource(G, resource, player, count){
    for (let i = 0; i < count; i++) {
        G.players[player].deck.resources.push(resource);
    }
}