import { sameVertices, isCoordInArray } from "./hexes";

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

    console.log("Begin of check for longest road");

    let routes = {};

    let visitedPaths = [];

    for (let i = 0; i < G.roads.length; i++) {
        // console.log(`Route ${i}`)
        let player = G.roads[i].player;

        // add player
        if (routes[player] === undefined) {
            routes[player] = [];
        }

        let adjacent = { 'A': [], 'B': [] };


        // Get adjacent roads        
        for (let j = 0; j < G.roads.length; j++) {
            if (G.roads[j] !== G.roads[i] && G.roads[j].player === G.roads[i].player) {


                // Check adjacency in A
                if (sameVertices(G.roads[i].data.AVertex, G.roads[j].data.AVertex)) {
                    adjacent['A'].push(j);
                }

                // Check adjacency in B
                else if (sameVertices(G.roads[i].data.BVertex, G.roads[j].data.BVertex)) {
                    adjacent['B'].push(j);
                }
            }
        }

        // console.log(`A: (${adjacent['A']}), B: (${adjacent['B']})`);

        for (let side of ['A', 'B']) {
            for (let item of adjacent[side]) {
                let path = [i, item].sort(compareNumbers);
                if (!isCoordInArray(path, visitedPaths)) {
                    visitedPaths.push(path);
                    let newSide = invertSide(side);
                    routes[player].push({
                        length: 2,
                        roads: [i, item],
                        begin: { road: i, side: newSide, ended: false },
                        end: { road: item, side: newSide, ended: false }
                    });

                }
            }
        }

        let deletionList = [];

        // Check if this road is already connected to a known route
        for (let routeID = 0; routeID < routes[player].length; routeID++) {
            if (!deletionList.includes(routeID)) {
                let route = routes[player][routeID];
                let pos = getPos(route, i);
                if (pos !== "" && route[pos].ended === false) {


                    // If the road goes nowhere, end it
                    if (adjacent[route[pos].side].length === 0) {
                        route[pos].ended = true;
                    }
                    // One connection -> expand the route
                    else if (adjacent[route[pos].side].length === 1) {
                        // greater, not checked: expand

                        // let path = [i, adjacent[route[pos].side][0]].sort();
                        // if (adjacent[route[pos].side][0] > i && !isCoordInArray(path, visitedPaths)) {
                        //     expandRoute(routes, player, route, pos, adjacent[route[pos].side][0])
                        //     visitedPaths.push(path);
                        // }
                        // // smaller, already checked: merge
                        // else {
                        // console.log("hello");
                        let list = mergeRoute(routes, player, route, pos, i);
                        // }
                        if (list.length > 0) {
                            deletionList.push(routeID);
                            deletionList = deletionList.concat(list);
                        }

                    }
                    // 2 adjacent roads : consider the two paths, and consider this route as two routes
                    else if (adjacent[route[pos].side].length === 2) {
                        let counter = 0;

                        // for (let adj of adjacent[route[pos].side]) {
                        //     let path = [i, adj].sort();
                        //     if (adj > i && !isCoordInArray(path, visitedPaths)) {
                        //         expandRoute(routes, player, route, pos, adj);
                        //         visitedPaths.push(path);
                        //         counter += 1;
                        //     }
                        // }
                        // If at least one of the adjacent roads is smaller
                        // Road smaller => already visited => should merge with this one
                        if (counter < 2) {
                            deletionList = deletionList.concat(mergeRoute(routes, player, route, pos, i));
                        }

                        // delete previous version
                        deletionList.push(routeID);
                    }



                }

            }
        }


        deletionList = Array.from(new Set(deletionList)).sort(compareNumbers);

        // console.log(JSON.stringify(deletionList))
        // console.log(JSON.stringify(routes));

        // Delete route
        for (let id of deletionList.reverse()) {
            routes[player].splice(id, 1);
        }




    }
    // console.log(routes);

    // What is the longest route
    let max = 0;
    let maxPlayer;
    for (let player of Object.keys(routes)){
        for (let route of routes[player]){
            if (route.length > max){
                max = route.length;
                maxPlayer = player;
            }
        }
    }
    
    // apply award
    if (max >= 5) {
        if (G.awards.longestRoad === null || max > G.awards.longestRoad.size) {
            if (G.awards.longestRoad !== null) {
                G.players[G.awards.longestRoad.player].score -= 2;
            }
            G.awards.longestRoad = {
                player: maxPlayer,
                size: max,
            };
            G.players[maxPlayer].score += 2;
        }
    }
}

function compareNumbers(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else return 0;

}

// function expandRoute(routes, player, route, pos, adj) {
//     let clone = Object.assign({}, route);
//     clone[pos] = {
//         road: adj,
//         side: invertSide(clone[pos].side),
//         ended: false
//     };
//     clone.length += 1;
//     routes[player].push(clone);
// }

function mergeRoute(routes, player, route, pos, i) {
    let deletionList = [];

    // find route to merge
    for (let otherRouteID = 0; otherRouteID < routes[player].length; otherRouteID++) {
        let otherRoute = routes[player][otherRouteID];

        if (otherRoute !== route) {

            let pos2 = getPos(otherRoute, i);
            // if route found
            if (pos2 !== ""
                && otherRoute[pos2].ended === false
                && otherRoute[pos2].side !== route[pos].side
                && route[invertPos(pos)].road !== otherRoute[invertPos(pos2)].road
                && noRoadInCommon(route.roads, otherRoute.roads, i)) {

                let clone = Object.assign({}, otherRoute);

                clone[pos2] = route[invertPos(pos)];
                clone.roads = Array.from(new Set(clone.roads.concat(route.roads)));
                clone.length += route.length - 1;

                // Apply
                routes[player].push(clone);
                // Register for deletion
                deletionList.push(otherRouteID);
            }
        }
    }
    return deletionList;
}

function noRoadInCommon(roads1, roads2, current) {
    for (let road of roads1) {
        if (road !== current && roads2.includes(road)) {
            return false;
        }
    }
    return true;
}



function invertSide(side) {
    if (side === 'A') {
        return 'B';
    }
    else if (side === 'B') {
        return 'A';
    }
}

function getPos(route, number) {
    let pos = "";
    if (route.begin.road === number) {
        pos = "begin";
    }
    else if (route.end.road === number) {
        pos = "end"
    }
    return pos;
}

function invertPos(pos) {
    if (pos === 'begin')
        return 'end';
    else if (pos === 'end')
        return 'begin';
}
