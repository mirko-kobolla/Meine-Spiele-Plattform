const boardElement = document.querySelector("#wallgo-board");
const statusElement = document.querySelector("#wallgo-status");
const turnLabel = document.querySelector("#wallgo-turn-label");
const turnDot = document.querySelector("#wallgo-turn-dot");
const wallCountElement = document.querySelector("#wallgo-wall-count");
const setupElement = document.querySelector("#wallgo-setup");
const startButton = document.querySelector("#wallgo-start");
const modeSelect = document.querySelector("#wallgo-mode");
const difficultySelect = document.querySelector("#wallgo-difficulty");
const difficultyField = document.querySelector("#wallgo-difficulty-field");
const setupModeSelect = document.querySelector("#wallgo-setup-mode");
const actionsElement = document.querySelector("#wallgo-actions");
const restartButton = document.querySelector("#wallgo-restart");
const pauseButton = document.querySelector("#wallgo-pause");
const resultElement = document.querySelector("#wallgo-result");
const resultTitle = document.querySelector("#wallgo-result-title");
const resultSummary = document.querySelector("#wallgo-result-summary");
const scoreList = document.querySelector("#wallgo-score-list");
const playAgainButton = document.querySelector("#wallgo-play-again");
const rulesButton = document.querySelector("#wallgo-rules-button");
const rulesDialog = document.querySelector("#wallgo-rules-dialog");
const rulesCloseButton = document.querySelector("#wallgo-rules-close");
const highscoreList = document.querySelector("#wallgo-highscore-list");

const SIZE = 7;
const PLAYER_ONE = "blue";
const PLAYER_TWO = "coral";
const BOT = "coral";
const WALL_LIMIT = 20;
const STORAGE_KEY = "pixelpause-wallgo-highscores";
const DIRECTIONS = [
  ["top", -1, 0],
  ["right", 0, 1],
  ["bottom", 1, 0],
  ["left", 0, -1],
];

let pieces = [];
let walls = new Set();
let remainingWalls = { [PLAYER_ONE]: WALL_LIMIT, [PLAYER_TWO]: WALL_LIMIT };
let turn = PLAYER_ONE;
let phase = "setup";
let stage = "select";
let selectedPiece = null;
let validDestinations = [];
let botTimer = null;
let paused = false;
let setupCount = 0;
let setupSide = PLAYER_ONE;
let mode = "bot";

function indexFrom(row, column) {
  return row * SIZE + column;
}

function rowFrom(index) {
  return Math.floor(index / SIZE);
}

function columnFrom(index) {
  return index % SIZE;
}

function oppositeDirection(direction) {
  return { top: "bottom", right: "left", bottom: "top", left: "right" }[direction];
}

function wallKey(row, column, direction) {
  if (direction === "top" && row === 0) return `outer-${row}-${column}-top`;
  if (direction === "bottom" && row === SIZE - 1) return `outer-${row}-${column}-bottom`;
  if (direction === "left" && column === 0) return `outer-${row}-${column}-left`;
  if (direction === "right" && column === SIZE - 1) return `outer-${row}-${column}-right`;

  const [dr, dc] = DIRECTIONS.find(([name]) => name === direction).slice(1);
  const otherRow = row + dr;
  const otherColumn = column + dc;
  if (otherRow < 0 || otherRow >= SIZE || otherColumn < 0 || otherColumn >= SIZE) {
    return `outer-${row}-${column}-${direction}`;
  }

  const cells = [[row, column, direction], [otherRow, otherColumn, oppositeDirection(direction)]]
    .map((item) => item.join(":"))
    .sort();
  return `wall-${cells[0]}-${cells[1]}`;
}

function isWall(row, column, direction) {
  return walls.has(wallKey(row, column, direction));
}

function getPlayerName(side) {
  if (side === PLAYER_ONE) return mode === "local" ? "Spieler 1" : "Du";
  return mode === "local" ? "Spieler 2" : "Bot";
}

function getPiece(index) {
  return pieces.find((piece) => piece.index === index);
}

function fixedSetup() {
  pieces = [
    { side: PLAYER_ONE, index: indexFrom(3, 0) },
    { side: PLAYER_ONE, index: indexFrom(2, 1) },
    { side: PLAYER_ONE, index: indexFrom(4, 1) },
    { side: PLAYER_ONE, index: indexFrom(3, 2) },
    { side: PLAYER_TWO, index: indexFrom(3, 6) },
    { side: PLAYER_TWO, index: indexFrom(2, 5) },
    { side: PLAYER_TWO, index: indexFrom(4, 5) },
    { side: PLAYER_TWO, index: indexFrom(3, 4) },
  ];
}

function resetSetup() {
  window.clearTimeout(botTimer);
  mode = modeSelect.value;
  pieces = [];
  walls = new Set();
  remainingWalls = { [PLAYER_ONE]: WALL_LIMIT, [PLAYER_TWO]: WALL_LIMIT };
  turn = PLAYER_ONE;
  phase = "setup";
  stage = "select";
  selectedPiece = null;
  validDestinations = [];
  paused = false;
  setupCount = 0;
  setupSide = PLAYER_ONE;

  difficultyField.hidden = mode !== "bot";
  setupElement.hidden = false;
  actionsElement.hidden = true;
  resultElement.hidden = true;

  if (setupModeSelect.value === "fixed") {
    fixedSetup();
  }

  setStatus(setupModeSelect.value === "fixed"
    ? "Vorgegebene Startposition bereit. Mit Spiel starten beginnt die Runde."
    : "Spieler 1: Setze deine erste Figur auf ein freies Feld.");
  render();
}

function setStatus(message) {
  statusElement.textContent = message;
}

function canPass(row, column, direction) {
  if (row === 0 && direction === "top") return false;
  if (row === SIZE - 1 && direction === "bottom") return false;
  if (column === 0 && direction === "left") return false;
  if (column === SIZE - 1 && direction === "right") return false;
  if (isWall(row, column, direction)) return false;
  return true;
}

function occupied(index) {
  return Boolean(getPiece(index));
}

function getReachableWithinTwo(startIndex) {
  const startRow = rowFrom(startIndex);
  const startColumn = columnFrom(startIndex);
  const reachable = new Set();
  const queue = [{ index: startIndex, distance: 0 }];
  const seen = new Map([[startIndex, 0]]);

  while (queue.length) {
    const current = queue.shift();
    if (current.distance > 0) reachable.add(current.index);
    if (current.distance === 2) continue;

    const row = rowFrom(current.index);
    const column = columnFrom(current.index);
    for (const [direction, dr, dc] of DIRECTIONS) {
      if (!canPass(row, column, direction)) continue;
      const nextRow = row + dr;
      const nextColumn = column + dc;
      const nextIndex = indexFrom(nextRow, nextColumn);
      if (occupied(nextIndex)) continue;
      const nextDistance = current.distance + 1;
      if (!seen.has(nextIndex) || seen.get(nextIndex) > nextDistance) {
        seen.set(nextIndex, nextDistance);
        queue.push({ index: nextIndex, distance: nextDistance });
      }
    }
  }
  return reachable;
}

function canPlaceWall(row, column, direction) {
  if (remainingWalls[turn] <= 0) return false;
  if (isWall(row, column, direction)) return false;
  if (direction === "top" && row === 0) return false;
  if (direction === "bottom" && row === SIZE - 1) return false;
  if (direction === "left" && column === 0) return false;
  if (direction === "right" && column === SIZE - 1) return false;
  return true;
}

function placeWall(row, column, direction) {
  if (!canPlaceWall(row, column, direction)) return false;
  walls.add(wallKey(row, column, direction));
  remainingWalls[turn] -= 1;
  return true;
}

function renderBoard() {
  boardElement.replaceChildren();

  for (let row = 0; row < SIZE; row += 1) {
    for (let column = 0; column < SIZE; column += 1) {
      const index = indexFrom(row, column);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "wallgo-cell";
      cell.dataset.index = String(index);
      cell.setAttribute("aria-label", `Feld Reihe ${row + 1}, Spalte ${column + 1}`);

      if (phase === "setup" && setupModeSelect.value === "free") {
        if (!getPiece(index)) cell.classList.add("is-free-target");
      } else if (stage === "select" && phase === "playing") {
        const piece = getPiece(index);
        if (piece && piece.side === turn) cell.classList.add("is-own-piece");
      } else if (stage === "move" && validDestinations.has(index)) {
        cell.classList.add("is-valid-target");
      } else if (stage === "wall" && selectedPiece === index) {
        cell.classList.add("is-wall-target");
      }

      const piece = getPiece(index);
      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.className = `wallgo-piece piece-${piece.side}`;
        pieceElement.setAttribute("aria-hidden", "true");
        pieceElement.textContent = piece.side === PLAYER_ONE ? "●" : "◆";
        cell.append(pieceElement);
        cell.setAttribute("aria-label", `${cell.getAttribute("aria-label")}, Figur ${getPlayerName(piece.side)}`);
      }

      for (const [direction, dr, dc] of DIRECTIONS) {
        if (isWall(row, column, direction)) {
          const wall = document.createElement("span");
          wall.className = `wallgo-wall wall-${direction}`;
          wall.setAttribute("aria-hidden", "true");
          cell.append(wall);
        }
      }

      if (stage === "wall" && selectedPiece === index) {
        for (const [direction] of DIRECTIONS) {
          if (!canPlaceWall(row, column, direction)) continue;
          const edge = document.createElement("button");
          edge.type = "button";
          edge.className = `wallgo-edge edge-${direction}`;
          edge.dataset.direction = direction;
          edge.setAttribute("aria-label", `Mauer ${direction === "top" ? "oben" : direction === "right" ? "rechts" : direction === "bottom" ? "unten" : "links"} setzen`);
          cell.append(edge);
        }
      }

      boardElement.append(cell);
    }
  }
}

function updateTurnDisplay() {
  if (phase === "setup") {
    turnLabel.textContent = "Aufstellung";
    turnDot.className = "is-blue";
  } else if (phase === "finished") {
    turnLabel.textContent = "Runde beendet";
  } else if (paused) {
    turnLabel.textContent = "Pausiert";
  } else {
    turnLabel.textContent = `${getPlayerName(turn)} ist am Zug`;
    turnDot.className = turn === PLAYER_ONE ? "is-blue" : "is-coral";
  }
  wallCountElement.textContent = String(remainingWalls[turn] ?? 0);
}

function render() {
  renderBoard();
  updateTurnDisplay();
  setupElement.hidden = phase !== "setup";
  actionsElement.hidden = phase !== "playing";
  resultElement.hidden = phase !== "finished";
}

function startMatch() {
  if (setupModeSelect.value === "free") {
    if (pieces.length !== 8) {
      setStatus("Setze zuerst alle 8 Figuren abwechselnd auf das Brett.");
      return;
    }
  } else {
    fixedSetup();
  }

  phase = "playing";
  stage = "select";
  turn = PLAYER_ONE;
  selectedPiece = null;
  validDestinations = new Set();
  setStatus(mode === "local" ? "Spieler 1 ist am Zug. Wähle eine eigene Figur." : "Du bist am Zug. Wähle eine eigene Figur.");
  render();
}

function handleSetupClick(index) {
  if (setupModeSelect.value !== "free" || phase !== "setup") return;
  if (getPiece(index)) return;

  pieces.push({ side: setupSide, index });
  setupCount += 1;

  if (setupCount < 4) {
    setStatus(`Spieler 1: Noch ${4 - setupCount} Figur(en) setzen.`);
  } else if (setupCount === 4 && mode === "bot") {
    const freeCells = Array.from({ length: SIZE * SIZE }, (_, cellIndex) => cellIndex)
      .filter((cellIndex) => !getPiece(cellIndex));
    for (let number = 0; number < 4; number += 1) {
      const randomPosition = Math.floor(Math.random() * freeCells.length);
      const botIndex = freeCells.splice(randomPosition, 1)[0];
      pieces.push({ side: PLAYER_TWO, index: botIndex });
    }
    setupCount = 8;
    setupSide = null;
    setStatus("Alle Figuren stehen. Die Runde kann starten.");
  } else if (setupCount < 8) {
    setupSide = PLAYER_TWO;
    setStatus(`Spieler 2: Noch ${8 - setupCount} Figur(en) setzen.`);
  } else {
    setupSide = null;
    setStatus("Alle Figuren stehen. Die Runde kann starten.");
  }
  render();
}

function handleBoardClick(event) {
  const edge = event.target.closest(".wallgo-edge");
  if (edge) {
    const cell = edge.closest(".wallgo-cell");
    const index = Number(cell.dataset.index);
    const row = rowFrom(index);
    const column = columnFrom(index);
    handleWallSelection(row, column, edge.dataset.direction);
    return;
  }

  const cell = event.target.closest(".wallgo-cell");
  if (!cell) return;
  const index = Number(cell.dataset.index);

  if (phase === "setup") {
    handleSetupClick(index);
    return;
  }
  if (phase !== "playing" || paused || (mode === "bot" && turn === BOT) || stage === "wall") return;

  if (stage === "select") {
    const piece = getPiece(index);
    if (!piece || piece.side !== turn) {
      setStatus("Wähle zuerst eine deiner eigenen Figuren.");
      return;
    }
    selectedPiece = index;
    validDestinations = getReachableWithinTwo(index);
    validDestinations.add(index);
    stage = "move";
    setStatus("Wähle ein Zielfeld mit 0 bis 2 freien Schritten.");
    render();
    return;
  }

  if (stage === "move") {
    if (!validDestinations.has(index)) {
      setStatus("Dieses Feld ist nicht erreichbar.");
      return;
    }
    movePiece(index);
  }
}

function movePiece(destination) {
  const piece = getPiece(selectedPiece);
  if (!piece) return;
  piece.index = destination;
  selectedPiece = destination;
  stage = "wall";
  setStatus("Wähle jetzt eine freie Mauerkante am Zielfeld.");
  render();
}

function handleWallSelection(row, column, direction) {
  if (stage !== "wall" || paused) return;
  if (!placeWall(row, column, direction)) return;

  stage = "select";
  selectedPiece = null;
  validDestinations = new Set();
  render();

  if (checkGameEnd()) return;
  turn = turn === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;
  setStatus(`${getPlayerName(turn)} ist am Zug. Wähle eine eigene Figur.`);
  render();

  if (turn === BOT && mode === "bot") scheduleBotTurn();
}

function simulateMove(startIndex, destination, side) {
  const clonedPieces = pieces.map((piece) => ({ ...piece }));
  const piece = clonedPieces.find((item) => item.index === startIndex && item.side === side);
  if (!piece) return null;
  piece.index = destination;
  const oldTurn = turn;
  turn = side;
  const options = [];
  const row = rowFrom(destination);
  const column = columnFrom(destination);

  for (const [direction] of DIRECTIONS) {
    if (!canPlaceWall(row, column, direction)) continue;
    const originalWalls = new Set(walls);
    walls.add(wallKey(row, column, direction));
    options.push({ startIndex, destination, direction, score: 0 });
    walls = originalWalls;
  }

  turn = oldTurn;
  return { clonedPieces, options };
}

function scheduleBotTurn() {
  window.clearTimeout(botTimer);
  botTimer = window.setTimeout(playBotTurn, 520);
}

function playBotTurn() {
  if (phase !== "playing" || turn !== BOT || paused) return;
  const candidates = [];

  for (const piece of pieces.filter((item) => item.side === BOT)) {
    const destinations = getReachableWithinTwo(piece.index);
    destinations.add(piece.index);
    for (const destination of destinations) {
      const row = rowFrom(destination);
      const column = columnFrom(destination);
      for (const [direction] of DIRECTIONS) {
        if (!canPlaceWall(row, column, direction)) continue;
        const originalIndex = piece.index;
        piece.index = destination;
        walls.add(wallKey(row, column, direction));
        const score = evaluateBotPosition();
        walls.delete(wallKey(row, column, direction));
        piece.index = originalIndex;
        candidates.push({ startIndex: piece.index, destination, direction, score: score + Math.random() * (difficultySelect.value === "easy" ? 8 : 2) });
      }
    }
  }

  if (!candidates.length) {
    finishMatch("Keine Mauer mehr verfügbar.");
    return;
  }

  candidates.sort((left, right) => right.score - left.score);
  const best = difficultySelect.value === "easy"
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : candidates[0];

  const piece = getPiece(best.startIndex);
  piece.index = best.destination;
  placeWall(rowFrom(best.destination), columnFrom(best.destination), best.direction);
  setStatus("Der Bot hat gezogen.");
  stage = "select";
  selectedPiece = null;
  validDestinations = new Set();
  render();

  if (checkGameEnd()) return;
  turn = PLAYER_ONE;
  setStatus("Du bist am Zug. Wähle eine eigene Figur.");
  render();
}

function evaluateBotPosition() {
  const botAreas = evaluateAreas();
  return (botAreas[BOT] || 0) - (botAreas[PLAYER_ONE] || 0) * 1.15;
}

function floodRegions() {
  const visited = new Set();
  const regions = [];

  for (let index = 0; index < SIZE * SIZE; index += 1) {
    if (visited.has(index)) continue;
    const queue = [index];
    const region = [];
    const owners = new Set();
    visited.add(index);

    while (queue.length) {
      const current = queue.shift();
      region.push(current);
      const piece = getPiece(current);
      if (piece) owners.add(piece.side);
      const row = rowFrom(current);
      const column = columnFrom(current);

      for (const [direction, dr, dc] of DIRECTIONS) {
        if (isWall(row, column, direction)) continue;
        const nextRow = row + dr;
        const nextColumn = column + dc;
        if (nextRow < 0 || nextRow >= SIZE || nextColumn < 0 || nextColumn >= SIZE) continue;
        const nextIndex = indexFrom(nextRow, nextColumn);
        if (!visited.has(nextIndex)) {
          visited.add(nextIndex);
          queue.push(nextIndex);
        }
      }
    }

    regions.push({ size: region.length, owners, cells: region });
  }
  return regions;
}

function evaluateAreas() {
  const totals = { [PLAYER_ONE]: 0, [PLAYER_TWO]: 0 };
  for (const region of floodRegions()) {
    if (region.owners.size !== 1) continue;
    const owner = [...region.owners][0];
    totals[owner] = (totals[owner] || 0) + region.size;
  }
  return totals;
}

function piecesCanMeet() {
  const bluePieces = pieces.filter((piece) => piece.side === PLAYER_ONE);
  const coralPieces = pieces.filter((piece) => piece.side === PLAYER_TWO);

  for (const blue of bluePieces) {
    const visited = new Set([blue.index]);
    const queue = [blue.index];
    while (queue.length) {
      const current = queue.shift();
      if (coralPieces.some((piece) => piece.index === current)) return true;
      const row = rowFrom(current);
      const column = columnFrom(current);
      for (const [direction, dr, dc] of DIRECTIONS) {
        if (isWall(row, column, direction)) continue;
        const nextRow = row + dr;
        const nextColumn = column + dc;
        if (nextRow < 0 || nextRow >= SIZE || nextColumn < 0 || nextColumn >= SIZE) continue;
        const nextIndex = indexFrom(nextRow, nextColumn);
        if (!visited.has(nextIndex) && !getPiece(nextIndex)) {
          visited.add(nextIndex);
          queue.push(nextIndex);
        }
        if (coralPieces.some((piece) => piece.index === nextIndex)) {
          return true;
        }
      }
    }
  }
  return false;
}

function checkGameEnd() {
  const isolated = !piecesCanMeet();
  const wallsEmpty = remainingWalls[PLAYER_ONE] <= 0 && remainingWalls[PLAYER_TWO] <= 0;
  if (isolated || wallsEmpty) {
    finishMatch(isolated ? "Alle Parteien sind vollständig voneinander getrennt." : "Beide Mauervorräte sind aufgebraucht.");
    return true;
  }
  return false;
}

function largestRegionSize(owner) {
  return Math.max(0, ...floodRegions()
    .filter((region) => region.owners.size === 1 && region.owners.has(owner))
    .map((region) => region.size));
}

function finishMatch(reason) {
  phase = "finished";
  window.clearTimeout(botTimer);
  const areas = evaluateAreas();
  const blueScore = areas[PLAYER_ONE] || 0;
  const coralScore = areas[PLAYER_TWO] || 0;
  let title;

  if (blueScore === coralScore) {
    const blueLargest = largestRegionSize(PLAYER_ONE);
    const coralLargest = largestRegionSize(PLAYER_TWO);
    if (blueLargest === coralLargest) title = "Unentschieden";
    else title = blueLargest > coralLargest ? (mode === "local" ? "Spieler 1 gewinnt" : "Du gewinnst!") : (mode === "local" ? "Spieler 2 gewinnt" : "Der Bot gewinnt");
  } else {
    title = blueScore > coralScore
      ? (mode === "local" ? "Spieler 1 gewinnt" : "Du gewinnst!")
      : (mode === "local" ? "Spieler 2 gewinnt" : "Der Bot gewinnt");
  }

  resultTitle.textContent = title;
  resultSummary.textContent = `${reason} ${mode === "local" ? "Spieler 1" : "Du"}: ${blueScore} Punkte · ${mode === "local" ? "Spieler 2" : "Bot"}: ${coralScore} Punkte.`;
  scoreList.innerHTML = "";

  for (const [side, score] of [[PLAYER_ONE, blueScore], [PLAYER_TWO, coralScore]]) {
    const item = document.createElement("div");
    item.innerHTML = `<span>${getPlayerName(side)}</span><strong>${score}</strong>`;
    scoreList.append(item);
  }

  saveHighscore(blueScore);
  render();
}

function saveHighscore(score) {
  if (mode !== "bot") return;
  let scores = [];
  try {
    scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    scores = [];
  }
  scores.push({ score, date: new Date().toLocaleDateString("de-DE") });
  scores.sort((left, right) => right.score - left.score);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 5)));
  renderHighscores();
}

function renderHighscores() {
  let scores = [];
  try {
    scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    scores = [];
  }
  highscoreList.replaceChildren();
  if (!scores.length) {
    const item = document.createElement("li");
    item.textContent = "Noch keine Runde gespielt.";
    highscoreList.append(item);
    return;
  }
  scores.forEach((entry, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${index + 1}. Platz</span><strong>${entry.score} Punkte</strong><small>${entry.date}</small>`;
    highscoreList.append(item);
  });
}

boardElement.addEventListener("click", handleBoardClick);
startButton.addEventListener("click", startMatch);
restartButton.addEventListener("click", resetSetup);
playAgainButton.addEventListener("click", resetSetup);
modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;
  difficultyField.hidden = mode !== "bot";
  resetSetup();
});
setupModeSelect.addEventListener("change", resetSetup);
pauseButton.addEventListener("click", () => {
  paused = !paused;
  pauseButton.textContent = paused ? "Fortsetzen" : "Pause";
  setStatus(paused ? "Die Runde ist pausiert." : `${getPlayerName(turn)} ist am Zug.`);
  render();
  if (!paused && phase === "playing" && mode === "bot" && turn === BOT) {
    scheduleBotTurn();
  }
});
rulesButton.addEventListener("click", () => rulesDialog.showModal());
rulesCloseButton.addEventListener("click", () => rulesDialog.close());
rulesDialog.addEventListener("click", (event) => {
  if (event.target === rulesDialog) rulesDialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "r" && phase === "playing") resetSetup();
  if (event.key.toLowerCase() === "p" && phase === "playing") pauseButton.click();
});

resetSetup();
renderHighscores();
