/* script.js */
const gridSize = 7; // 7x7 grid
let playerPosition = { x: 0, y: 0 }; // Starting position
let level = [];
let history = []; // To store move history for undo
const gameGrid = document.getElementById("game-grid");
const status = document.getElementById("status");

const levelButtonsContainer = document.getElementById("level-buttons");
let currentLevel = 1;

// Generate level buttons (1 to 20)
function createLevelButtons() {
  for (let i = 1; i <= 20; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.addEventListener("click", () => loadLevel(i));
    if (i === currentLevel) button.classList.add("active");
    levelButtonsContainer.appendChild(button);
  }
}

// Highlight the active level button
function updateActiveLevelButton() {
  const buttons = levelButtonsContainer.querySelectorAll("button");
  buttons.forEach((btn, index) => {
    if (index + 1 === currentLevel) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Load a specific level
async function loadLevel(levelNumber) {
  currentLevel = levelNumber;
  updateActiveLevelButton();

  try {
    const response = await fetch(`levels/${levelNumber}.yaml`);
    const yamlText = await response.text();
    const parsedLevel = jsyaml.load(yamlText);
    level = parsedLevel.layout;
    renderGrid(); // Render the loaded level
  } catch (error) {
    status.textContent = `Failed to load level ${levelNumber}!`;
    console.error(`Error loading level ${levelNumber}:`, error);
  }
}

// Render the grid
function renderGrid() {
  gameGrid.innerHTML = ""; // Clear the grid
  gameGrid.style.gridTemplateColumns = `repeat(${gridSize}, 50px)`; // Adjust grid size dynamically
  level.forEach((row, rowIndex) => {
    [...row].forEach((cell, colIndex) => {
      const cellDiv = document.createElement("div");
      cellDiv.textContent = cell;
      if (playerPosition.x === colIndex && playerPosition.y === rowIndex) {
        cellDiv.textContent = "🐢"; // Player emoji
      } else if (cell == "⬜") {
        cellDiv.textContent = "";
      }
      gameGrid.appendChild(cellDiv);
    });
  });
}

function getCell(x, y) {
  return level[y].match(/\p{Emoji}/gu)[x];
}

function setCell(x, y, value) {
  let array = [...level[y]];
  array[x] = value;
  level[y] = array.join('');
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
  const targetCell = getCell(newX, newY);
  if (targetCell === "🪨") {
    const newPushX = newX + dx;
    const newPushY = newY + dy;
    if (newPushX < 0 || newPushX >= gridSize || newPushY < 0 || newPushY >= gridSize || getCell(newPushX, newPushY) !== "⬜") {
      status.textContent = "Blocked!";
      return;
    } else {
      setCell(newPushX, newPushY, "🪨");
      setCell(newX, newY, "⬜");
    }
  }

  // Save current position to history for undo
  history.push({ ...playerPosition });

  // Move player
  playerPosition = { x: newX, y: newY };
  status.textContent = "";

  // Check for win condition
  if (targetCell === "🪸") {
    status.textContent = "You win! 🎉 Select another level below.";
    disableControls();
  } else if (targetCell === "🦈") {
    status.textContent = "You lose!";
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
  loadLevel(); // Reload the level
  status.textContent = "Game restarted!";
  enableControls();
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

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      movePlayer(0, -1); // Move up
      break;
    case "ArrowDown":
    case "s":
    case "S":
      movePlayer(0, 1); // Move down
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      movePlayer(-1, 0); // Move left
      break;
    case "ArrowRight":
    case "d":
    case "D":
      movePlayer(1, 0); // Move right
      break;
  }
});

// Initial render
createLevelButtons();
loadLevel(currentLevel);
