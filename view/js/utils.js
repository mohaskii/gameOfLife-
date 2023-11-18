// Get the canvas element by its ID
const canvas = document.getElementById('gameCanvas');

// Call the resizing function on initial load and when resizing occurs
let infosInterValId; // Variable to store an interval ID
const ctx = canvas.getContext('2d'); // Get the 2D rendering context
let isPlaying = false; // Flag to check if the game is currently running
let intervalId; // Variable to store the interval ID for game updates
let zoomLevel = 3; // Initial zoom level
const cellSize = 10; // Size of each cell in pixels
const defaultGridSize = 31; // Default size of the grid
const defaultZoomLevel = 3; // Default zoom level
let iteration = 0; // Variable to track the number of iterations
let gridSize = 31; // Current size of the grid
let maxSize = 1000; // Maximum size for the grid
// Create the grid with random values (true/false)
let grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.random() > 0.5)
);

// Function to resize the canvas
let resizeCanvas = () => {
    let min = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
    if (min < 600){
        canvas.width = min - 30;
        canvas.height = min - 30;
        return
    }
    canvas.width = min - 300;
    canvas.height = min - 300;
};


// Function to draw the grid

let drawGrid = () => {
    resizeCanvas()
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const y = (i - gridSize / 2) * cellSize * zoomLevel + centerX;
            const x = (j - gridSize / 2) * cellSize * zoomLevel + centerY;
            const borderRadius = 4; 
            ctx.beginPath();
            ctx.moveTo(x + borderRadius, y);
            ctx.lineTo(x + cellSize * zoomLevel - borderRadius, y);
            ctx.arcTo(x + cellSize * zoomLevel, y, x + cellSize * zoomLevel, y + borderRadius, borderRadius);
            ctx.lineTo(x + cellSize * zoomLevel, y + cellSize * zoomLevel - borderRadius);
            ctx.arcTo(x + cellSize * zoomLevel, y + cellSize * zoomLevel, x + cellSize * zoomLevel - borderRadius, y + cellSize * zoomLevel, borderRadius);
            ctx.lineTo(x + borderRadius, y + cellSize * zoomLevel);
            ctx.arcTo(x, y + cellSize * zoomLevel, x, y + cellSize * zoomLevel - borderRadius, borderRadius);
            ctx.lineTo(x, y + borderRadius);
            ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
            ctx.fillStyle = grid[i][j] ? 'rgb(8, 15, 36)' : 'white';
            ctx.fill(); 
            // ctx.stroke();
        }
    }
}

// Function to toggle the state of a cell on click
let toggleCell = (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const cellY = Math.floor((mouseX - canvas.width / 2) / (cellSize * zoomLevel) + gridSize / 2);
    const cellX = Math.floor((mouseY - canvas.height / 2) / (cellSize * zoomLevel) + gridSize / 2);
    console.log(cellX, cellY);
    grid[cellX][cellY] = !grid[cellX][cellY];
    drawGrid();
}

// Function to start the game
let run = () => {
    if (!isPlaying) {
        intervalId = setInterval(updateGrid, 16);

        isPlaying = true;
    }
}

let RunPause = ()=> { 
    let runNode =  document.getElementById("run")
    console.log(runNode);
    if (runNode.classList.contains("fa-play")){
        run()
        runNode.classList.remove("fa-play");
        runNode.classList.add("fa-circle-pause")
        return
    }
    clearInterval(infosInterValId)
    updateInfos()
    pauseGame();
    runNode.classList.remove("fa-circle-pause");
    runNode.classList.add("fa-play");
}

// Function to pause the game
let pauseGame = () => {
    clearInterval(intervalId);
    isPlaying = false;
}
// Function to reset the game
let refresh= () => {
    iteration= 0
    clearInterval(infosInterValId)
    let runNode =  document.getElementById("run")
    zoomLevel = defaultZoomLevel
    gridSize = defaultGridSize
    grid = Array.from({ length: defaultGridSize }, () =>
    Array.from({ length: defaultGridSize }, () => false)
    );
    updateInfos

    isPlaying= false
    clearInterval(intervalId)
    runNode.classList.remove("fa-circle-pause");
    runNode.classList.add("fa-play");
    drawGrid()
    
}


// Function to update the grid based on game rules
let  updateGrid = () => {
    const newGrid = [];
    let limit = maxSize<gridSize 
    iteration++
    for (let y = 0; y < gridSize; y++) {
        newGrid[y] = [];
        for (let x = 0; x < gridSize; x++) {
            const neighbors = countNeighbors(y, x);

            if (grid[y][x]) {
                if ((y === 0 || y === gridSize - 1 || x === gridSize - 1 || x === 0)&& !limit) {
                    expand();
                    return;
                }
                newGrid[y][x] = neighbors === 2 || neighbors === 3;
                continue
            }
            newGrid[y][x] = neighbors === 3;
        }
    }
    updateInfos()
    grid.splice(0, grid.length, ...newGrid);
    drawGrid();
}
// Functions for zooming in and out
let zoomIn = () => {
    zoomLevel += 0.15;
    drawGrid();
} 
let zoomOut = () => {
    console.log((cellSize*zoomLevel)*grid.length,window.innerHeight );
    if ((cellSize*(zoomLevel))*grid.length<window.innerHeight){
        drawGrid();
        return
    }
    zoomLevel -= 0.15;
    drawGrid();
}
let shuffle = ()=> { 
    grid= Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Math.random() > 0.5))
    drawGrid()
};
let countNeighbors = (x, y)=>  {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newY = x + i;
            const newX = y + j;

            if (newY >= 0 && newY < gridSize && newX >= 0 && newX < gridSize && !(i === 0 && j === 0)) {
                count += grid[newY][newX] ? 1 : 0;
            }
        }
    }
    return count;
}
// Function to update information about the grid
let updateInfos = () => {
    document.getElementById("population").innerText = `population : ${grid.length**2}`;
    document.getElementById("iteration").innerText = `iterations  : ${iteration}`;
};


let ZoomOnonClickId
let ZoomOutonClickId
// Event listeners for user interactions
let lunchListeners  = () => {
    document.getElementById("run").addEventListener("click", RunPause)
    document.getElementById("refresh").addEventListener("click", refresh)
    document.getElementById("zoomIn").addEventListener("click", zoomIn)
    document.getElementById("zoomOut").addEventListener("click", zoomOut)
    document.getElementById("zoomOut").addEventListener("mousedown", () => {
        ZoomOutonClickId = setInterval(zoomOut, 16)
    })
    document.getElementById("zoomOut").addEventListener("mouseup", () => {
        clearInterval(ZoomOutonClickId)
    })
    document.getElementById("zoomIn").addEventListener("mousedown", () => {
        ZoomOnonClickId = setInterval(zoomIn, 16)
    })
    document.getElementById("zoomIn").addEventListener("mouseup", () => {
        clearInterval(ZoomOnonClickId)
    })
    document.getElementById("shuffle").addEventListener("click", shuffle)
    window.addEventListener('resize', () => { resizeCanvas(); drawGrid() });
    canvas.addEventListener('click', toggleCell);
}
// Function to expand the grid when reaching its limits
let expand = () => {
    for (let i = 0; i < grid.length; i++) {
        grid[i].push(false)
        grid[i].unshift(false)
    }
    grid.push(Array.from({ length: grid[0].length }, () => false));
    grid.unshift(Array.from({ length: grid[0].length }, () => false));
    gridSize = grid[0].length
    console.log(grid);
    drawGrid()
}
export { drawGrid, lunchListeners }