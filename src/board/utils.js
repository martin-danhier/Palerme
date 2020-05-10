export function getPlayerColor(G, player, thisPlayer)  {
    if (player === thisPlayer) {
        return G.currentPlayer.color;
    }
    else {
        return G.otherPlayers[player].color;
    }
}

export function getPlayerName(G, player, thisPlayer) {
    if (player === thisPlayer) {
        return G.currentPlayer.name;
    }
    else {
        return G.otherPlayers[player].name;
    }
}

export function hasEnoughResources(testedResources, targetResources) {
    let resourcesCount = Object.assign({}, targetResources);

        // Decrease the value of each resource with the player inventory
        for (let res of testedResources) {
            if (res in resourcesCount && resourcesCount[res] > 0) {
                resourcesCount[res] -= 1;
            }
        }

        // If all values are at 0, there are enough resources
        for (let res in resourcesCount) {
            if (resourcesCount[res] > 0) return false;
        }

        // If this point is reached, then all values are at 0
        return true;
}