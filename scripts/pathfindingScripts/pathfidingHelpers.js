//Things to do:
// Add more algorithms (research)
// Bidirectional depth first search
// Bidirectional A*?
// Bidirectional breadth first search
// Add more maze creation functions
// Do pure horizontal and pure vertical maze
// Do spiral maze from middle?
/* ------------------------------------ */
/* ---- Var Declarations & Preamble---- */
/* ------------------------------------ */

var totalRows = 25;
var totalCols = 70;
var inProgress = false;
//var initialMessage = "Click or drag cells to build walls! Press start when you finish and have selected an algorithm!";
var cellsToAnimate = [];
var weights = [];
var createWalls = false;
var algorithm = null;
var justFinished = false;
var animationSpeed = "Fast";
var animationState = null;
var startCell = [11, 15];
var endCell = [11, 55];
var movingStart = false;
var movingEnd = false;

function generateGrid(rows, cols) {
	var grid = "<table>";
	for (row = 1; row <= rows; row++) {
		grid += "<tr>";
		for (col = 1; col <= cols; col++) {
			grid += "<td></td>";
		}
		grid += "</tr>";
	}
	grid += "</table>"
	return grid;
}

var myGrid = generateGrid(totalRows, totalCols);
$("#tableContainer").append(myGrid);

/* --------------------------- */
/* --- OBJECT DECLARATIONS --- */
/* --------------------------- */

function Queue() {
	this.stack = new Array();
	this.dequeue = function () {
		return this.stack.pop();
	}
	this.enqueue = function (item) {
		this.stack.unshift(item);
		return;
	}
	this.empty = function () {
		return (this.stack.length == 0);
	}
	this.clear = function () {
		this.stack = new Array();
		return;
	}
}

function minHeap() {
	this.heap = [];
	this.isEmpty = function () {
		return (this.heap.length == 0);
	}
	this.clear = function () {
		this.heap = [];
		return;
	}
	this.getMin = function () {
		if (this.isEmpty()) {
			return null;
		}
		var min = this.heap[0];
		this.heap[0] = this.heap[this.heap.length - 1];
		this.heap[this.heap.length - 1] = min;
		this.heap.pop();
		if (!this.isEmpty()) {
			this.siftDown(0);
		}
		return min;
	}
	this.push = function (item) {
		this.heap.push(item);
		this.siftUp(this.heap.length - 1);
		return;
	}
	this.parent = function (index) {
		if (index == 0) {
			return null;
		}
		return Math.floor((index - 1) / 2);
	}
	this.children = function (index) {
		return [(index * 2) + 1, (index * 2) + 2];
	}
	this.siftDown = function (index) {
		var children = this.children(index);
		var leftChildValid = (children[0] <= (this.heap.length - 1));
		var rightChildValid = (children[1] <= (this.heap.length - 1));
		var newIndex = index;
		if (leftChildValid && this.heap[newIndex][0] > this.heap[children[0]][0]) {
			newIndex = children[0];
		}
		if (rightChildValid && this.heap[newIndex][0] > this.heap[children[1]][0]) {
			newIndex = children[1];
		}
		// No sifting down needed
		if (newIndex === index) { return; }
		var val = this.heap[index];
		this.heap[index] = this.heap[newIndex];
		this.heap[newIndex] = val;
		this.siftDown(newIndex);
		return;
	}
	this.siftUp = function (index) {
		var parent = this.parent(index);
		if (parent !== null && this.heap[index][0] < this.heap[parent][0]) {
			var val = this.heap[index];
			this.heap[index] = this.heap[parent];
			this.heap[parent] = val;
			this.siftUp(parent);
		}
		return;
	}
}

/* ------------------------- */
/* ---- MOUSE FUNCTIONS ---- */
/* ------------------------- */

$("td").mousedown(function () {
	var index = $("td").index(this);
	// console.log("Cell index = " + index);
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	if (!inProgress) {
		// Clear board if just finished
		if (justFinished && !inProgress) {
			clearBoard(keepWalls = true, keepWeights = true);
			justFinished = false;
		}
		if (index == startCellIndex) {
			movingStart = true;
			//console.log("Now moving start!");
		} else if (index == endCellIndex) {
			movingEnd = true;
			//console.log("Now moving end!");
		} else {
			createWalls = true;
		}
	}
});

$("td").mouseup(function () {
	createWalls = false;
	movingStart = false;
	movingEnd = false;
	// console.log("Mouse UP ");
});

$("td").mouseenter(function () {
	if (!createWalls && !movingStart && !movingEnd) { return; }
	var index = $("td").index(this);
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	if (!inProgress) {
		if (justFinished) {
			clearBoard(keepWalls = true, keepWeights = true);
			justFinished = false;
		}
		// console.log("Cell index = " + index);
		if (movingStart && index != endCellIndex) {
			moveStartOrEnd(startCellIndex, index, "start");
		} else if (movingEnd && index != startCellIndex) {
			moveStartOrEnd(endCellIndex, index, "end");
		} else if (index != startCellIndex && index != endCellIndex) {
			$(this).toggleClass("wall");
		}
	}
});

$("td").click(function () {
	var index = $("td").index(this);
	// console.log("Cell index clicked = " + index);
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	if ((inProgress == false) && !(index == startCellIndex) && !(index == endCellIndex)) {
		if (justFinished) {
			clearBoard(keepWalls = true, keepWeights = true);
			justFinished = false;
		}
		$(this).toggleClass("wall");
	}
});

$("body").mouseup(function () {
	createWalls = false;
	movingStart = false;
	movingEnd = false;
});

/* ----------------- */
/* ---- BUTTONS ---- */
/* ----------------- */

$("#startBtn").click(function () {
	if (algorithm == null) { return; }
	if (inProgress) { update("wait"); return; }
	traverseGraph(algorithm);
});

$("#clearBtn").click(function () {
	if (inProgress) { update("wait"); return; }
	clearBoard(keepWalls = false, keepWeights = false);
});
$("#clearPath").click(function () {
	if (inProgress) { update("wait"); return; }
	clearBoard(keepWalls = true, keepWeights = true);
});

/* --------------------- */
/* --- NAV BAR MENUS --- */
/* --------------------- */

$("#algorithms .btn-common").click(function () {
	if (inProgress) { update("wait"); return; }
	algorithm = $(this).text();
	updateStartBtnText();
	console.log("Algorithm has been changd to: " + algorithm);
});

$("#speed .btn-common").click(function () {
	if (inProgress) { update("wait"); return; }
	animationSpeed = $(this).text();
	updateSpeedDisplay();
	console.log("Speed has been changd to: " + animationSpeed);
});

$("#mazes .btn-common").click(function () {
	if (inProgress) { update("wait"); return; }
	maze = $(this).text();
	if (maze == "Random Maze") {
		randomMaze();
	} else if (maze == "Recursive Division Maze") {
		recursiveDivMaze(null);
	} else if (maze == "Recursive Division (Vertical Skew)") {
		recursiveDivMaze("VERTICAL");
	} else if (maze == "Recursive Division (Horizontal Skew)") {
		recursiveDivMaze("HORIZONTAL");
	} else if (maze == "Simple Spiral Maze") {
		spiralMaze();
	} else if (maze == "Simple Stair Maze") {
		stairMaze();
	} else if (maze == "Binary Tree Maze") {
		binaryTreeMaze();
	} else if (maze == "Simple Weighted Maze") {
		SimpleWeighted();
	}
	console.log("Maze has been changd to: " + maze);
});

/* ----------------- */
/* --- FUNCTIONS --- */
/* ----------------- */

function moveStartOrEnd(prevIndex, newIndex, startOrEnd) {
	var newCellY = newIndex % totalCols;
	var newCellX = Math.floor((newIndex - newCellY) / totalCols);
	if (startOrEnd == "start") {
		startCell = [newCellX, newCellY];
		console.log("Moving start to [" + newCellX + ", " + newCellY + "]")
	} else {
		endCell = [newCellX, newCellY];
		console.log("Moving end to [" + newCellX + ", " + newCellY + "]")
	}
	clearBoard(keepWalls = true, keepWeights = true);
	return;
}

function moveEnd(prevIndex, newIndex) {
	// Erase last end cell
	$($("td").find(prevIndex)).removeClass();

	var newEnd = $("td").find(newIndex);
	$(newEnd).removeClass();
	$(newEnd).addClass("end");

	var newEndX = Math.floor(newIndex / totalRows);
	var newEndY = Math.floor(newIndex / totalCols);
	startCell = [newStartX, newStartY];
	return;
}

function updateSpeedDisplay() {
	if (animationSpeed == "Slow") {
		$(".speedDisplay").text("Speed: Slow");
	} else if (animationSpeed == "Normal") {
		$(".speedDisplay").text("Speed: Normal");
	} else if (animationSpeed == "Fast") {
		$(".speedDisplay").text("Speed: Fast");
	}
	return;
}

function updateStartBtnText() {
	if (algorithm == "Depth-First Search (DFS)") {
		$("#startBtn").html("Start DFS");
	} else if (algorithm == "Breadth-FirstSearch(BFS)") {
		$("#startBtn").html("Start BFS");
	} else if (algorithm == "Dijkstra Algorithm") {
		$("#startBtn").html("Start Dijkstra");
	} else if (algorithm == "A* Algorithm") {
		$("#startBtn").html("Start A*");
	} else if (algorithm == "Greedy Best-First Search") {
		$("#startBtn").html("Start Greedy BFS");
	}
	return;
}

// Used to display error messages
function update(message) {
	$("#resultsIcon").removeClass();
	$("#resultsIcon").addClass("fas fa-exclamation");
	$('#results').css("background-color", "#ffc107");
	$("#length").text("");
	if (message == "wait") {
		$("#duration").text("Please wait for the algorithm to finish.");
	}
}

// Used to display results
function updateResults(duration, pathFound, length) {
	var firstAnimation = "swashOut";
	var secondAnimation = "swashIn";
	$("#results").removeClass();
	$("#results").addClass("magictime " + firstAnimation);
	setTimeout(function () {
		$("#resultsIcon").removeClass();
		//$("#results").css("height","80px");
		if (pathFound) {
			$('#results').css("background-color", "#77dd77");
			$("#resultsIcon").addClass("fas fa-check");
		} else {
			$('#results').css("background-color", "#ff6961");
			$("#resultsIcon").addClass("fas fa-times");
		}
		$("#duration").text("Duration: " + duration + " ms");
		$("#length").text("Length: " + length);
		$('#results').removeClass(firstAnimation);
		$('#results').addClass(secondAnimation);
	}, 1100);
}

// Counts length of success
function countLength() {
	var cells = $("td");
	var l = 0;
	for (var i = 0; i < cells.length; i++) {
		if ($(cells[i]).hasClass("success")) {
			l++;
		}
	}
	return l;
}

async function traverseGraph(algorithm) {
	inProgress = true;
	clearBoard(keepWalls = true, keepWeights = true);
	var startTime = Date.now();
	var pathFound = executeAlgo();
	var endTime = Date.now();
	await animateCells();
	if (pathFound) {
		updateResults((endTime - startTime), true, countLength());
	} else {
		updateResults((endTime - startTime), false, countLength());
	}
	inProgress = false;
	justFinished = true;
}

function executeAlgo() {
	if (algorithm == "Depth-First Search (DFS)") {
		var visited = createVisited();
		var pathFound = DFS(startCell[0], startCell[1], visited);
	} else if (algorithm == "Breadth-FirstSearch(BFS)") {
		var pathFound = BFS();
	} else if (algorithm == "Dijkstra Algorithm") {
		var pathFound = dijkstra();
	} else if (algorithm == "A* Algorithm") {
		var pathFound = AStar();
	} else if (algorithm == "Greedy Best-First Search") {
		var pathFound = greedyBestFirstSearch();
	}
	return pathFound;
}

function makeWall(cell) {
	if (!createWalls) { return; }
	var index = $("td").index(cell);
	var row = Math.floor((index) / totalRows) + 1;
	var col = (index % totalCols) + 1;
	console.log([row, col]);
	if ((inProgress == false) && !(row == 1 && col == 1) && !(row == totalRows && col == totalCols)) {
		$(cell).toggleClass("wall");
	}
}

function createVisited() {
	var visited = [];
	var cells = $("#tableContainer").find("td");
	for (var i = 0; i < totalRows; i++) {
		var row = [];
		for (var j = 0; j < totalCols; j++) {
			if (cellIsAWall(i, j, cells)) {
				row.push(true);
			} else {
				row.push(false);
			}
		}
		visited.push(row);
	}
	return visited;
}

function cellIsAWall(i, j, cells) {
	var cellNum = (i * (totalCols)) + j;
	return $(cells[cellNum]).hasClass("wall");
}


function makeWalls() {
	var walls = [];
	for (var i = 0; i < totalRows; i++) {
		var row = [];
		for (var j = 0; j < totalCols; j++) {
			row.push(true);
		}
		walls.push(row);
	}
	return walls;
}

function neighborsThatAreWalls(neighbors, walls) {
	var neighboringWalls = 0;
	for (var k = 0; k < neighbors.length; k++) {
		var i = neighbors[k][0];
		var j = neighbors[k][1];
		if (walls[i][j]) { neighboringWalls++; }
	}
	return neighboringWalls;
}

function createDistances() {
	var distances = [];
	for (var i = 0; i < totalRows; i++) {
		var row = [];
		for (var j = 0; j < totalCols; j++) {
			row.push(Number.POSITIVE_INFINITY);
		}
		distances.push(row);
	}
	return distances;
}

function createPrev() {
	var prev = [];
	for (var i = 0; i < totalRows; i++) {
		var row = [];
		for (var j = 0; j < totalCols; j++) {
			row.push(null);
		}
		prev.push(row);
	}
	return prev;
}

function getNeighbors(i, j) {
	var neighbors = [];
	if (i > 0) { neighbors.push([i - 1, j]); }
	if (j > 0) { neighbors.push([i, j - 1]); }
	if (i < (totalRows - 1)) { neighbors.push([i + 1, j]); }
	if (j < (totalCols - 1)) { neighbors.push([i, j + 1]); }
	return neighbors;
}

async function animateCells() {
	animationState = null;
	var cells = $("#tableContainer").find("td");
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	var delay = getDelay();
	for (var i = 0; i < cellsToAnimate.length; i++) {
		var cellCoordinates = cellsToAnimate[i][0];
		var x = cellCoordinates[0];
		var y = cellCoordinates[1];
		var num = (x * (totalCols)) + y;
		if (num == startCellIndex || num == endCellIndex) { continue; }
		var cell = cells[num];
		var colorClass = cellsToAnimate[i][1];

		// Wait until its time to animate
		await new Promise(resolve => setTimeout(resolve, delay));

		// $(cell).removeClass();
		$(cell).addClass(colorClass);
		// $(cell).addClass("weight");
	}
	cellsToAnimate = [];
	//console.log("End of animation has been reached!");
	return new Promise(resolve => resolve(true));
}

function getDelay() {
	var delay;
	if (animationSpeed === "Slow") {
		if (algorithm == "Depth-First Search (DFS)") {
			delay = 25;
		} else {
			delay = 20;
		}
	} else if (animationSpeed === "Normal") {
		if (algorithm == "Depth-First Search (DFS)") {
			delay = 15;
		} else {
			delay = 10;
		}
	} else if (animationSpeed == "Fast") {
		if (algorithm == "Depth-First Search (DFS)") {
			delay = 10;
		} else {
			delay = 5;
		}
	}
	console.log("Delay = " + delay);
	return delay;
}

function clearBoard(keepWalls, keepWeights) {
	var cells = $("#tableContainer").find("td");
	var startCellIndex = (startCell[0] * (totalCols)) + startCell[1];
	var endCellIndex = (endCell[0] * (totalCols)) + endCell[1];
	for (var i = 0; i < cells.length; i++) {
		isWall = $(cells[i]).hasClass("wall");
		isWeight = $(cells[i]).hasClass("weight");
		$(cells[i]).removeClass();
		if (i == startCellIndex) {
			$(cells[i]).addClass("start");
		} else if (i == endCellIndex) {
			$(cells[i]).addClass("end");
		} else if (keepWalls && isWall) {
			$(cells[i]).addClass("wall");
		} else if (keepWeights && isWeight) {
			$(cells[i]).addClass("weight");
		}
	}
	if (keepWeights == false) {
		weights = [];
	}
}

// Ending statements
clearBoard();

$('#myModal').on('shown.bs.modal', function () {
	$('#myInput').trigger('focus');
})

$(window).on('load', function () {
	$('#exampleModalLong').modal('show');
});