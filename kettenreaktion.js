const boardElement = document.querySelector("#chain-board");
const statusElement = document.querySelector("#chain-status");
const turnLabel = document.querySelector("#turn-label");
const turnIndicator = document.querySelector("#turn-indicator");
const moveCountElement = document.querySelector("#move-count");
const gameTimeElement = document.querySelector("#game-time");
const setupPanel = document.querySelector("#setup-panel");
const liveControls = document.querySelector("#live-controls");
const resultPanel = document.querySelector("#result-panel");
const startButton = document.querySelector("#start-game");
const newGameButton = document.querySelector("#new-game");
const playAgainButton = document.querySelector("#play-again");
const changeDifficultyButton = document.querySelector("#change-difficulty");
const difficultySelect = document.querySelector("#bot-difficulty");
const firstPlayerSelect = document.querySelector("#first-player");
const resultTitle = document.querySelector("#result-title");
const resultSummary = document.querySelector("#result-summary");
const resultPoints = document.querySelector("#result-points");
const highscoreList = document.querySelector("#highscore-list");
const storageNote = document.querySelector("#storage-note");

const STORAGE_KEY = "pixelpause-kettenreaktion-highscores";
const HUMAN = "human";
const BOT = "bot";
const SIZE = 5;
const MAX_EXPLOSIONS_PER_MOVE = 5000;

let board = createEmptyBoard();
let phase = "setup";
let selectedStartCell = null;
let turn = HUMAN;
let moveCount = 0;
let lastMove = null;
let highlightedCells = [];
let gameStartedAt = 0;
let gameTimer;
let botTimer;
let highlightTimer;
let highscoreStorageAvailable = true;

function createEmptyBoard() {
  return Array.from({ length: SIZE * SIZE }, () => ({ count: 0, owner: null }));
}

function cloneBoard(source) {
  return source.map((cell) => ({ ...cell }));
}

function getNeighbors(index) {
  const row = Math.floor(index / SIZE);
  const column = index % SIZE;
  const neighbors = [];

  if (row > 0) neighbors.push(index - SIZE);
  if (row < SIZE - 1) neighbors.push(index + SIZE);
  if (column > 0) neighbors.push(index - 1);
  if (column < SIZE - 1) neighbors.push(index + 1);

  return neighbors;
}

function isValidStartCell(index) {
  const row = Math.floor(index / SIZE);
  const column = index % SIZE;
  return row > 0 && row < SIZE - 1 && column > 0 && column < SIZE - 1;
}

function getLegalMoves(position, side) {
  return position.flatMap((cell, index) => (
    cell.count === 0 || cell.owner === side ? [index] : []
  ));
}

function countStones(position, side) {
  return position.reduce(
    (total, cell) => total + (cell.owner === side ? cell.count : 0),
    0,
  );
}

function applyMove(position, index, side) {
  const nextBoard = cloneBoard(position);
  const initialCell = nextBoard[index];

  if (initialCell.count > 0 && initialCell.owner !== side) {
    throw new Error("Du kannst keinen gegnerischen Stapel direkt auswählen.");
  }

  initialCell.owner = side;
  initialCell.count += 1;
  const queue = [index];
  const affected = new Set([index]);
  let explosions = 0;
  let capturedStones = 0;

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentCell = nextBoard[currentIndex];
    const neighbors = getNeighbors(currentIndex);
    const criticalCount = neighbors.length;

    if (currentCell.count < criticalCount) {
      continue;
    }

    if (explosions >= MAX_EXPLOSIONS_PER_MOVE) {
      throw new Error("Diese Stellung führt zu einer nicht endenden Kettenreaktion. Der Zug wurde nicht ausgeführt.");
    }

    currentCell.count -= criticalCount;
    currentCell.owner = currentCell.count === 0 ? null : side;
    explosions += 1;

    for (const neighborIndex of neighbors) {
      const neighbor = nextBoard[neighborIndex];

      if (neighbor.count > 0 && neighbor.owner !== side) {
        capturedStones += neighbor.count;
        neighbor.owner = side;
      } else if (neighbor.count === 0) {
        neighbor.owner = side;
      }

      neighbor.count += 1;
      affected.add(neighborIndex);

      if (neighbor.count >= getNeighbors(neighborIndex).length) {
        queue.push(neighborIndex);
      }
    }

    if (currentCell.count >= criticalCount) {
      queue.push(currentIndex);
    }
  }

  return {
    board: nextBoard,
    explosions,
    capturedStones,
    affectedCells: [...affected],
  };
}

function describeCell(cell) {
  if (cell.count === 0) {
    return "Leer";
  }

  const ownerName = cell.owner === HUMAN ? "Deine Steine" : "Steine des Bots";
  const stoneWord = cell.count === 1 ? "Stein" : "Steine";
  return `${cell.count} ${stoneWord}, ${ownerName}`;
}

function renderBoard() {
  boardElement.replaceChildren();

  board.forEach((cell, index) => {
    const button = document.createElement("button");
    const cellRow = Math.floor(index / SIZE) + 1;
    const cellColumn = (index % SIZE) + 1;
    const canChooseStart = phase === "setup";
    const humanCanMove = phase === "playing" && turn === HUMAN;

    button.type = "button";
    button.className = "chain-cell";
    button.dataset.index = String(index);
    button.setAttribute(
      "aria-label",
      `Reihe ${cellRow}, Spalte ${cellColumn}: ${describeCell(cell)}`,
    );

    if (cell.count === 0) {
      button.classList.add("is-empty");
    } else {
      button.classList.add(cell.owner === HUMAN ? "cell-you" : "cell-bot");
    }

    if (canChooseStart && selectedStartCell === index) {
      button.classList.add("is-setup-selected");
    }

    if (lastMove === index) {
      button.classList.add("is-last-move");
    }

    if (highlightedCells.includes(index)) {
      button.classList.add("is-exploding");
    }

    button.disabled = canChooseStart
      ? cell.count > 0 || !isValidStartCell(index)
      : !humanCanMove || (cell.count > 0 && cell.owner !== HUMAN);

    if (cell.count > 0) {
      const count = document.createElement("span");
      count.className = "cell-count";
      count.setAttribute("aria-hidden", "true");
      count.textContent = String(cell.count);
      button.append(count);
    }

    boardElement.append(button);
  });
}

function setStatus(message, kind = "") {
  statusElement.textContent = message;
  statusElement.classList.toggle("is-alert", kind === "alert");
  statusElement.classList.toggle("is-success", kind === "success");
}

function updateTurnDisplay() {
  const labels = {
    setup: "Startaufstellung",
    playing: turn === HUMAN ? "Du bist am Zug" : "Der Bot überlegt ...",
    finished: "Runde beendet",
  };

  turnLabel.textContent = labels[phase];
  turnIndicator.className = "turn-indicator";

  if (phase === "playing") {
    turnIndicator.classList.add(turn === HUMAN ? "is-human" : "is-bot");
  } else if (phase === "setup") {
    turnIndicator.classList.add("is-human");
  }

  moveCountElement.textContent = String(moveCount);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function updateGameTime() {
  if (gameStartedAt === 0) {
    gameTimeElement.textContent = "00:00";
    return;
  }

  gameTimeElement.textContent = formatTime(
    Math.floor((performance.now() - gameStartedAt) / 1000),
  );
}

function updatePanels() {
  setupPanel.hidden = phase !== "setup";
  liveControls.hidden = phase !== "playing";
  resultPanel.hidden = phase !== "finished";
}

function render() {
  renderBoard();
  updateTurnDisplay();
  updatePanels();
  updateGameTime();
}

function resetToSetup() {
  window.clearTimeout(botTimer);
  window.clearInterval(gameTimer);
  window.clearTimeout(highlightTimer);
  board = createEmptyBoard();
  phase = "setup";
  selectedStartCell = null;
  turn = HUMAN;
  moveCount = 0;
  lastMove = null;
  highlightedCells = [];
  gameStartedAt = 0;
  setStatus("Wähle ein Startfeld in der mittleren 3×3-Zone. Der Bot startet auf einem anderen, nicht angrenzenden Feld.");
  startButton.disabled = true;
  startButton.innerHTML = 'Startfeld wählen <span aria-hidden="true">→</span>';
  render();
}

function startMatch() {
  if (selectedStartCell === null || phase !== "setup") {
    return;
  }

  board = createEmptyBoard();
  board[selectedStartCell] = { count: 3, owner: HUMAN };

  const availableStarts = board.flatMap((cell, index) => (
    cell.count === 0 &&
    isValidStartCell(index) &&
    !getNeighbors(selectedStartCell).includes(index)
      ? [index]
      : []
  ));
  const botStartCell = availableStarts[Math.floor(Math.random() * availableStarts.length)];
  board[botStartCell] = { count: 3, owner: BOT };
  turn = firstPlayerSelect.value === "bot" ? BOT : HUMAN;
  phase = "playing";
  moveCount = 0;
  lastMove = null;
  highlightedCells = [];
  gameStartedAt = performance.now();
  window.clearInterval(gameTimer);
  gameTimer = window.setInterval(updateGameTime, 1000);
  startButton.disabled = true;

  if (turn === HUMAN) {
    setStatus("Du beginnst. Setze einen Stein auf ein leeres oder eigenes Feld.");
  } else {
    setStatus("Der Bot beginnt. Er setzt seinen ersten Stein ...");
  }

  render();

  if (turn === BOT) {
    scheduleBotTurn();
  }
}

function getWinner(position) {
  const humanStones = countStones(position, HUMAN);
  const botStones = countStones(position, BOT);

  if (humanStones === 0) return BOT;
  if (botStones === 0) return HUMAN;
  return null;
}

function evaluateBoard(position) {
  const winner = getWinner(position);
  if (winner === BOT) return 100000;
  if (winner === HUMAN) return -100000;

  let score = (countStones(position, BOT) - countStones(position, HUMAN)) * 4;

  position.forEach((cell, index) => {
    if (cell.count === 0) return;

    const threshold = getNeighbors(index).length;
    const pressure = (cell.count / threshold) * 0.7;
    const ownershipValue = cell.owner === BOT ? 1 : -1;
    score += ownershipValue * (2 + pressure);
  });

  return score;
}

function chooseBotMove(position) {
  const legalMoves = getLegalMoves(position, BOT);

  if (legalMoves.length === 0) {
    return null;
  }

  if (difficultySelect.value === "easy") {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const scoredMoves = [];

  for (const move of legalMoves) {
    try {
      const result = applyMove(position, move, BOT);
      let score = evaluateBoard(result.board) + result.explosions * 0.3;

      if (difficultySelect.value === "hard" && getWinner(result.board) !== BOT) {
        const humanReplies = getLegalMoves(result.board, HUMAN);

        if (humanReplies.length > 0) {
          let worstReply = Infinity;

          for (const reply of humanReplies) {
            try {
              const replyResult = applyMove(result.board, reply, HUMAN);
              worstReply = Math.min(worstReply, evaluateBoard(replyResult.board));
            } catch {
              worstReply = Math.min(worstReply, -100000);
            }
          }

          score = worstReply + result.explosions * 0.3;
        }
      } else if (difficultySelect.value === "medium") {
        score += Math.random() * 2;
      }

      scoredMoves.push({ move, score });
    } catch {
      continue;
    }
  }

  if (scoredMoves.length === 0) {
    throw new Error("Der Bot findet keinen sicheren Zug. Bitte starte eine neue Runde.");
  }

  scoredMoves.sort((left, right) => right.score - left.score);
  return scoredMoves[0].move;
}

function scheduleBotTurn() {
  window.clearTimeout(botTimer);
  botTimer = window.setTimeout(playBotTurn, 420);
}

function playBotTurn() {
  if (phase !== "playing" || turn !== BOT) {
    return;
  }

  let move;

  try {
    move = chooseBotMove(board);
  } catch (error) {
    finishMatch(HUMAN, error.message);
    return;
  }

  if (move === null) {
    finishMatch(HUMAN, "Der Bot hat kein freies oder eigenes Feld mehr für einen Zug.");
    return;
  }

  resolveMove(move, BOT);
}

function handleBoardClick(event) {
  const cellButton = event.target.closest(".chain-cell");
  if (!cellButton || !boardElement.contains(cellButton)) {
    return;
  }

  const index = Number(cellButton.dataset.index);

  if (phase === "setup") {
    if (board[index].count > 0) return;
    selectedStartCell = index;
    startButton.disabled = false;
    startButton.innerHTML = 'Spiel starten <span aria-hidden="true">→</span>';
    setStatus(`Startfeld gewählt: Reihe ${Math.floor(index / SIZE) + 1}, Spalte ${(index % SIZE) + 1}.`);
    render();
    return;
  }

  if (phase !== "playing" || turn !== HUMAN) {
    return;
  }

  if (board[index].count > 0 && board[index].owner !== HUMAN) {
    return;
  }

  resolveMove(index, HUMAN);
}

function resolveMove(index, side) {
  let result;

  try {
    result = applyMove(board, index, side);
  } catch (error) {
    setStatus(error.message, "alert");
    return;
  }

  board = result.board;
  moveCount += 1;
  lastMove = index;
  highlightedCells = result.affectedCells;
  window.clearTimeout(highlightTimer);
  highlightTimer = window.setTimeout(() => {
    highlightedCells = [];
    renderBoard();
  }, 550);

  const actor = side === HUMAN ? "Dein Zug" : "Bot-Zug";
  const reactionText = result.explosions > 0
    ? ` ${result.explosions} ${result.explosions === 1 ? "Feld" : "Felder"} explodiert${result.explosions === 1 ? "" : "en"}${result.capturedStones > 0 ? `, ${result.capturedStones} gegnerische ${result.capturedStones === 1 ? "Stein wurde" : "Steine wurden"} erobert` : ""}.`
    : "";

  setStatus(`${actor}.${reactionText || " Stein gesetzt."}`, result.capturedStones > 0 ? "success" : "");

  const winner = getWinner(board);
  if (winner) {
    render();
    finishMatch(winner);
    return;
  }

  const nextSide = side === HUMAN ? BOT : HUMAN;
  if (getLegalMoves(board, nextSide).length === 0) {
    render();
    finishMatch(side, `${nextSide === HUMAN ? "Du hast" : "Der Bot hat"} kein freies oder eigenes Feld mehr für einen Zug.`);
    return;
  }

  turn = nextSide;
  render();

  if (turn === BOT) {
    setStatus(`${reactionText ? `${actor}.${reactionText} ` : ""}Der Bot ist am Zug ...`);
    scheduleBotTurn();
  } else if (side === BOT) {
    setStatus(`${reactionText ? `${actor}.${reactionText} ` : ""}Du bist am Zug.`);
  }
}

function loadHighscores() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error("Die gespeicherten Highscores haben ein ungültiges Format.");
    }

    return parsed.filter((entry) => (
      Number.isFinite(entry.points) &&
      Number.isFinite(entry.ownStones) &&
      Number.isFinite(entry.moves) &&
      typeof entry.result === "string" &&
      typeof entry.date === "string"
    ));
  } catch (error) {
    highscoreStorageAvailable = false;
    storageNote.textContent = `Highscores konnten nicht geladen werden: ${error.message}`;
    return [];
  }
}

function renderHighscores() {
  const entries = loadHighscores()
    .sort((left, right) => right.points - left.points)
    .slice(0, 5);
  highscoreList.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "highscore-empty";
    empty.textContent = "Noch keine Runde gespielt. Dein erster Rekord wartet!";
    highscoreList.append(empty);
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "highscore-item";

    const rank = document.createElement("span");
    rank.className = "highscore-rank";
    rank.textContent = `${index + 1}.`;

    const detail = document.createElement("span");
    detail.className = "highscore-detail";
    const result = document.createElement("span");
    result.textContent = entry.result;
    const caption = document.createElement("small");
    const moveWord = entry.moves === 1 ? "Zug" : "Züge";
    caption.textContent = `${entry.ownStones} eigene Steine · ${entry.moves} ${moveWord} · ${entry.date}`;
    detail.append(result, caption);

    const points = document.createElement("strong");
    points.className = "highscore-points";
    points.textContent = String(entry.points);
    item.append(rank, detail, points);
    highscoreList.append(item);
  });
}

function saveHighscore(entry) {
  if (!highscoreStorageAvailable) {
    return;
  }

  try {
    const entries = loadHighscores();
    if (!highscoreStorageAvailable) return;

    entries.push(entry);
    entries.sort((left, right) => right.points - left.points);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 5)));
    storageNote.textContent = "Highscores werden nur auf diesem Gerät gespeichert.";
    renderHighscores();
  } catch (error) {
    highscoreStorageAvailable = false;
    storageNote.textContent = `Highscore konnte nicht gespeichert werden: ${error.message}`;
  }
}

function finishMatch(winner, extraMessage = "") {
  if (phase === "finished") return;

  phase = "finished";
  window.clearTimeout(botTimer);
  window.clearInterval(gameTimer);
  updateGameTime();

  const humanWon = winner === HUMAN;
  const ownStones = countStones(board, HUMAN);
  const botStones = countStones(board, BOT);
  const points = ownStones + moveCount;
  const result = humanWon ? "Sieg" : "Niederlage";
  const elapsed = formatTime(Math.floor((performance.now() - gameStartedAt) / 1000));

  resultTitle.textContent = humanWon ? "Du hast gewonnen!" : "Der Bot gewinnt diese Runde.";
  const moveWord = moveCount === 1 ? "Zug" : "Züge";
  resultSummary.textContent = `${extraMessage ? `${extraMessage} ` : ""}Auf dem Feld: ${ownStones} deiner Steine und ${botStones} Bot-Steine. ${moveCount} ${moveWord} in ${elapsed}.`;
  resultPoints.textContent = String(points);

  saveHighscore({
    points,
    ownStones,
    moves: moveCount,
    result,
    date: new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(new Date()),
  });

  render();
}

boardElement.addEventListener("click", handleBoardClick);
startButton.addEventListener("click", startMatch);
newGameButton.addEventListener("click", resetToSetup);
playAgainButton.addEventListener("click", resetToSetup);
changeDifficultyButton.addEventListener("click", () => {
  resetToSetup();
  difficultySelect.focus();
});

renderHighscores();
resetToSetup();
