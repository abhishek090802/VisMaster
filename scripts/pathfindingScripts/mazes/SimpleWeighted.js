async function SimpleWeighted() {
    inProgress = true;
    clearBoard(keepWalls = false);
    var visited = createVisited();
    var weightWalls = makeWalls();
    var cells = [startCell, endCell];
    weightWalls[startCell[0]][startCell[1]] = false;
    weightWalls[endCell[0]][endCell[1]] = false;
    visited[startCell[0]][startCell[1]] = true;
    visited[endCell[0]][endCell[1]] = true;
    while (cells.length > 0) {
        var random = Math.floor(Math.random() * cells.length);
        var randomCell = cells[random];
        cells[random] = cells[cells.length - 1];
        cells.pop();
        var neighbors = getNeighbors(randomCell[0], randomCell[1]);
        if (neighborsThatAreWalls(neighbors, weightWalls) < 2) { continue; }
        weightWalls[randomCell[0]][randomCell[1]] = false;
        for (var k = 0; k < neighbors.length; k++) {
            var i = neighbors[k][0];
            var j = neighbors[k][1];
            if (visited[i][j]) { continue; }
            visited[i][j] = true;
            cells.push([i, j]);
        }
    }
    //Animate cells
    var cells = $("#tableContainer").find("td");
    for (var i = 0; i < totalRows; i++) {
        let row = [];
        for (var j = 0; j < totalCols; j++) {
            if (weightWalls[i][j]) {
                cellsToAnimate.push([[i, j], "weight"]);
                var randomWeight = Math.floor(Math.random() * (20)) + 1;
                row.push(randomWeight);
            } else {
                row.push(1);
            }
        }
        weights.push(row);
    }
    await animateCells();
    inProgress = false;

    // for (var i = 0; i < totalRows; i++) {
    //     for (var j = 0; j < totalCols; j++) {
    //         if (weights[i][j] != undefined)
    //             console.log(weights[i][j]);
    //     }
    // }
    return;
}