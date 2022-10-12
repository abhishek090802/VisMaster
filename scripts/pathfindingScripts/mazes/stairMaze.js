async function stairMaze() {
    inProgress = true;
    clearBoard(keepWalls = false);

    // console.log("Stair Maze called")

    var below = true;
    var j = 0;
    while (j < totalCols - 1) {
        if (below) {
            for (var i = 1; i < totalRows - 1; i++, j++) {
                cellsToAnimate.push([[i, j], "wall"]);
            }
            below = false;
        } else {
            for (var i = totalRows - 2; i > 0; i--, j++) {
                cellsToAnimate.push([[i, j], "wall"]);
            }
            below = true;
        }
    }
    await animateCells();
    inProgress = false;
    return;
}


function inBounds(cell) {
    return (cell[0] >= 0 && cell[1] >= 0 && cell[0] < totalRows && cell[1] < totalCols);
}