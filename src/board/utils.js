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