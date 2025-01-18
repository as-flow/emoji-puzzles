/* script.js */
const gridSize = 7; // 7x7 grid
let playerPosition = { x: 0, y: 0 }; // Starting position
let history = []; // To store move history for undo
const gameGrid = document.getElementById("game-grid");
const status = document.getElementById("status");

// Original level layout (used for restarting)
const originalLevel = [
  ["", "", "", "", "", "", ""],
  ["", "🌲", "", "", "🔥", "", ""],
  ["", "", "🦊", "", "", "", ""],
  ["", "", "", "🌲", "", "", ""],
  ["", "", "", "", "", "🦊", ""],
  ["", "🌲", "", "", "", "", ""],
  ["", "", "", "", "", "", "🏁"]
];

// Clone the original level to allow for resetting
let level = JSON.parse(JSON.stringify(originalLevel));

// Render the grid
function renderGrid() {
  gameGrid.innerHTML = ""; // Clear the grid
  gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`; // Adjust grid size dynamically
  level.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellDiv = document.createElement("div");
      cellDiv.textContent = cell;
      if (playerPosition.x === colIndex && playerPosition.y === rowIndex) {
        cellDiv.textContent = "🏃"; // Player emoji
      }
      gameGrid.appendChild(cellDiv);
    });
  });
}

// Move the player
function movePlayer(dx, dy) {
  const newX = playerPosition.x + dx;
  const newY = playerPosition.y + dy;

  // Boundary check
  if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
    status.textContent = "Can't move there!";
    return;
  }

  // Obstacle check
  const targetCell = level[newY][newX];
  if (targetCell === "🌲" || targetCell === "🦊") {
    status.textContent = "Blocked!";
    return;
  }

  // Save current position to history for undo
  history.push({ ...playerPosition });

  // Move player
  playerPosition = { x: newX, y: newY };
  status.textContent = "";

  // Check for win condition
  if (targetCell === "🏁") {
    status.textContent = "You win! 🎉 Select another level below.";
    disableControls();
  }

  renderGrid();
}

// Undo the last move
function undoMove() {
  if (history.length > 0) {
    playerPosition = history.pop();
    status.textContent = "Move undone!";
    renderGrid();
  } else {
    status.textContent = "No moves to undo!";
  }
}

// Restart the game
function restartGame() {
  playerPosition = { x: 0, y: 0 }; // Reset player position
  history = []; // Clear move history
  level = JSON.parse(JSON.stringify(originalLevel)); // Reset level layout
  status.textContent = "Game restarted!";
  enableControls();
  renderGrid();
}

// Disable controls after win
function disableControls() {
  document.querySelectorAll(".controls button").forEach((button) => {
    button.disabled = true;
  });
}

// Enable controls (used for restarting)
function enableControls() {
  document.querySelectorAll(".controls button").forEach((button) => {
    button.disabled = false;
  });
}

// Do nothing (dot) button action
function wait() {
  status.textContent = "You waited.";
}

// Event listeners for controls
document.getElementById("move-up").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("move-down").addEventListener("click", () => movePlayer(0, 1));
document.getElementById("move-left").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("move-right").addEventListener("click", () => movePlayer(1, 0));
document.getElementById("wait").addEventListener("click", wait);
document.getElementById("undo").addEventListener("click", undoMove);
document.getElementById("restart").addEventListener("click", restartGame);

// Initial render
renderGrid();
