const fs = require("fs");

let data = JSON.parse(fs.readFileSync(__dirname + "/board.json", "utf8"));

console.log(data);

function addHex(edge) {
    if (data.edges[edge].hexes.length < 2) {
        // Get the id of the new hex
        let hexID = data.hexes.length;
        let hex = {
            "edges": [edge],
            "vertices": [],
        }

        // Iterate through vertices of the new hex
        let currentVertex = data.edges[edge].vertices[0];
        while (hex.vertices.length < 5) {
            // Add the vertex
            hex.vertices.push(currentVertex);

            // Find the next vertex

            // The vertex has only 2 edges : the second is not adjacent to the new hex
            // and the one adjacent to the new hex doesn't exist
            if (data.vertices[currentVertex].edges.length === 2) {
                // Create a new edge and vertex
                let newVertexId = data.vertices.length;
                let newEdgeId = data.edges.length;

                data.vertices.push({ "edges": [newEdgeId], "hexes": [hexID] })
                data.edges.push({ "vertices": [currentVertex, newVertexId], "hexes": [hexID] });


                // add data to the current vertex
                data.vertices[currentVertex].hexes.push(hexID);
                data.vertices[currentVertex].edges.push(newEdgeId);

                // Select the new vertex
                currentVertex = newVertexId;
            }
            else if (data.vertices[currentVertex].edges.length === 1) {

            }
        }

        // Sixth edge : connect it to the first one
        let newEdgeId = data.edges.length;
    }
    else {
        throw new Error("An edge can only have 2 adjacents hexes");
    }
}

addHex(3);

console.log("--------------");
console.log(data);