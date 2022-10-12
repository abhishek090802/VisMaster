async function binaryTreeMaze() {
    inProgress = true;
    clearBoard(keepWalls = false);

    // traverse
    for (y = 1; y < totalCols - 1; y += 2) {
        for (x = 1; x < totalRows - 1; x += 2) {
            // decide whether to go down or left
            let down = Boolean(Math.round(Math.random()))
            // console.log(`x=${x}, y=${y}`)
            if (!isAvailable(x, y, down)) { down = !down }
            if (isAvailable(x, y, down)) {
                //step

                if (down) {
                    // console.log(`${x},${y + 1} is available`)
                    // console.log(`${x},${y + 2} is available`)

                    cellsToAnimate.push([[x, y + 1], "wall"]);
                    cellsToAnimate.push([[x, y + 2], "wall"]);
                } else {
                    // console.log(`${x + 1},${y} is available`)
                    // console.log(`${x + 2},${y} is available`)

                    cellsToAnimate.push([[x + 1, y], "wall"]);
                    cellsToAnimate.push([[x + 2, y], "wall"]);
                }
            }
        }
    }

    await animateCells();
    inProgress = false;
    return;
}

function isAvailable(x, y, down) {
    // directions are false:left true:down
    if (down) {
        if (y < totalCols - 3) { return true }
        return false
    }
    else {
        if (x < totalRows - 3) { return true }
        return false
    }
}