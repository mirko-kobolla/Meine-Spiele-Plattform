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
const gameModeSelect = document.querySelector("#game-mode");
const botDifficultyField = document.querySelector("#bot-difficulty-field");
const legendPlayerOne = document.querySelector("#legend-player-one");
const legendPlayerTwo = document.querySelector("#legend-player-two");
const resultTitle = document.querySelector("#result-title");
const resultSummary = document.querySelector("#result-summary");
const resultPoints = document.querySelector("#result-points");
const highscoreList = document.querySelector("#highscore-list");
const storageNote = document.querySelector("#storage-note");

const STORAGE_KEY = "pixelpause-kettenreaktion-highscores";
const PLAYER_ONE = "player1";
const PLAYER_TWO = "player2";
const BOT = "bot";
const HUMAN = PLAYER_ONE;
const SIZE = 5;
const MAX_EXPLOSIONS_PER_MOVE = 5000;

let board = createEmptyBoard();
let phase = "setup";
let selectedStartCell = null;
let playerOneStartCell = null;
let setupPlayer = PLAYER_ONE;
let turn = PLAYER_ONE;
let moveCount = 0;
let lastMove = null;
let highlightedCells = [];
let gameStartedAt = 0;
let gameTimer;
let botTimer;
let highlightTimer;
let highscoreStorageAvailable = true;
let gameMode = gameModeSelect.value;

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

function getPlayerName(side) {
  switch (side) {
    case PLAYER_ONE:
      return "Spieler 1";
    case PLAYER_TWO:
      return "Spieler 2";
    case BOT:
      return "Bot";
    default:
      return "Spieler";
  }
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

      const winner = getWinner(nextBoard);
      if (winner) {
        return {
          board: nextBoard,
          explosions,
          capturedStones,
          affectedCells: [...affected],
          winner,
        };
      }

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
    winner: getWinner(nextBoard),
  };
}

function describeCell(cell) {
  if (cell.count === 0) {
    return "Leer";
  }

  const ownerName = cell.owner === PLAYER_ONE
    ? (gameMode === "local" ? "Steine von Spieler 1" : "Deine Steine")
    : cell.owner === PLAYER_TWO
      ? "Steine von Spieler 2"
      : cell.owner === BOT
        ? "Steine des Bots"
        : "Steine";
  const stoneWord = cell.count === 1 ? "Stein" : "Steine";
  return `${cell.count} ${stoneWord}, ${ownerName}`;
}

function updateLegendLabels() {
  if (legendPlayerOne) {
    const label = legendPlayerOne.querySelector("span");
    if (label) {
      label.textContent = gameMode === "local" ? "Spieler 1" : "Du";
    }
  }

  if (legendPlayerTwo) {
    const label = legendPlayerTwo.querySelector("span");
    if (label) {
      label.textContent = gameMode === "local" ? "Spieler 2" : "Bot";
    }
  }
}

function syncSetupMode() {
  gameMode = gameModeSelect.value;
  const isBotMode = gameMode === "bot";

  if (botDifficultyField) {
    botDifficultyField.hidden = !isBotMode;
  }

  const playerTwoOption = firstPlayerSelect.querySelector('option[value="player2"]');
  const botOption = firstPlayerSelect.querySelector('option[value="bot"]');

  if (playerTwoOption) {
    playerTwoOption.hidden = isBotMode;
  }

  if (botOption) {
    botOption.hidden = !isBotMode;
  }

  if (isBotMode) {
    if (firstPlayerSelect.value === "player2") {
      firstPlayerSelect.value = "player1";
    }
  } else if (firstPlayerSelect.value === "bot") {
    firstPlayerSelect.value = "player1";
  }

  updateLegendLabels();
}

function isSelectableSetupCell(index) {
  if (board[index].count > 0 || !isValidStartCell(index)) {
    return false;
  }

  return gameMode !== "local" ||
    setupPlayer !== PLAYER_TWO ||
    !getNeighbors(playerOneStartCell).includes(index);
}

function renderBoard() {
  boardElement.replaceChildren();

  board.forEach((cell, index) => {
    const button = document.createElement("button");
    const cellRow = Math.floor(index / SIZE) + 1;
    const cellColumn = (index % SIZE) + 1;
    const canChooseStart = phase === "setup";
    const isPlayableTurn = phase === "playing" && (turn === PLAYER_ONE || turn === PLAYER_TWO);

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
      button.classList.add(
        cell.owner === PLAYER_ONE
          ? "cell-you"
          : cell.owner === PLAYER_TWO
            ? "cell-player-two"
            : "cell-bot",
      );
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
      ? !isSelectableSetupCell(index)
      : !isPlayableTurn || (cell.count > 0 && cell.owner !== turn);

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
  if (phase === "setup") {
    turnLabel.textContent = gameMode === "local"
      ? `${getPlayerName(setupPlayer)} wählt Startfeld`
      : "Startaufstellung";
    turnIndicator.className = `turn-indicator ${setupPlayer === PLAYER_TWO ? "is-player-two" : "is-human"}`;
    moveCountElement.textContent = String(moveCount);
    return;
  }

  if (phase === "finished") {
    turnLabel.textContent = "Runde beendet";
    turnIndicator.className = "turn-indicator";
    moveCountElement.textContent = String(moveCount);
    return;
  }

  if (turn === PLAYER_ONE) {
    turnLabel.textContent = gameMode === "local" ? "Spieler 1 ist am Zug" : "Du bist am Zug";
    turnIndicator.className = "turn-indicator is-human";
  } else if (turn === PLAYER_TWO) {
    turnLabel.textContent = "Spieler 2 ist am Zug";
    turnIndicator.className = "turn-indicator is-player-two";
  } else {
    turnLabel.textContent = "Der Bot überlegt ...";
    turnIndicator.className = "turn-indicator is-bot";
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
  syncSetupMode();
  board = createEmptyBoard();
  phase = "setup";
  selectedStartCell = null;
  playerOneStartCell = null;
  setupPlayer = PLAYER_ONE;
  turn = PLAYER_ONE;
  moveCount = 0;
  lastMove = null;
  highlightedCells = [];
  gameStartedAt = 0;
  setStatus(gameMode === "local"
    ? "Wähle ein Startfeld in der mittleren 3×3-Zone. Spieler 2 startet auf einem anderen, nicht angrenzenden Feld."
    : "Wähle ein Startfeld in der mittleren 3×3-Zone. Der Bot startet auf einem anderen, nicht angrenzenden Feld.");
  startButton.disabled = true;
  startButton.innerHTML = 'Startfeld wählen <span aria-hidden="true">→</span>';
  render();
}

function startMatch() {
  if (selectedStartCell === null || phase !== "setup") {
    return;
  }

  if (gameMode === "local" && setupPlayer === PLAYER_ONE) {
    playerOneStartCell = selectedStartCell;
    board[playerOneStartCell] = { count: 3, owner: PLAYER_ONE };
    selectedStartCell = null;
    setupPlayer = PLAYER_TWO;
    startButton.disabled = true;
    startButton.innerHTML = 'Startfeld wählen <span aria-hidden="true">→</span>';
    setStatus("Spieler 1 hat sein Startfeld gewählt. Spieler 2: Wähle ein freies, nicht angrenzendes Feld in der mittleren 3×3-Zone.");
    render();
    return;
  }

  if (gameMode === "local") {
    board[selectedStartCell] = { count: 3, owner: PLAYER_TWO };
    turn = firstPlayerSelect.value === "player2" ? PLAYER_TWO : PLAYER_ONE;
  } else {
    board = createEmptyBoard();
    board[selectedStartCell] = { count: 3, owner: PLAYER_ONE };

    const availableStarts = board.flatMap((cell, index) => (
      cell.count === 0 &&
      isValidStartCell(index) &&
      !getNeighbors(selectedStartCell).includes(index)
        ? [index]
        : []
    ));
    const botStartCell = availableStarts[Math.floor(Math.random() * availableStarts.length)];
    board[botStartCell] = { count: 3, owner: BOT };
    turn = firstPlayerSelect.value === "bot" ? BOT : PLAYER_ONE;
  }

  phase = "playing";
  moveCount = 0;
  lastMove = null;
  highlightedCells = [];
  gameStartedAt = performance.now();
  window.clearInterval(gameTimer);
  gameTimer = window.setInterval(updateGameTime, 1000);
  startButton.disabled = true;

  if (turn === PLAYER_ONE) {
    setStatus(gameMode === "local"
      ? "Spieler 1 beginnt. Setze einen Stein auf ein leeres oder eigenes Feld."
      : "Du beginnst. Setze einen Stein auf ein leeres oder eigenes Feld.");
  } else if (turn === PLAYER_TWO) {
    setStatus("Spieler 2 beginnt. Setze einen Stein auf ein leeres oder eigenes Feld.");
  } else {
    setStatus("Der Bot beginnt. Er setzt seinen ersten Stein ...");
  }

  render();

  if (turn === BOT) {
    scheduleBotTurn();
  }
}

function getWinner(position) {
  if (gameMode === "local") {
    const playerOneStones = countStones(position, PLAYER_ONE);
    const playerTwoStones = countStones(position, PLAYER_TWO);

    if (playerOneStones === 0 && playerTwoStones > 0) return PLAYER_TWO;
    if (playerTwoStones === 0 && playerOneStones > 0) return PLAYER_ONE;
    return null;
  }

  const playerOneStones = countStones(position, PLAYER_ONE);
  const botStones = countStones(position, BOT);

  if (playerOneStones === 0) return BOT;
  if (botStones === 0) return PLAYER_ONE;
  return null;
}

function evaluateBoard(position) {
  const winner = getWinner(position);
  if (winner === BOT) return 100000;
  if (winner === PLAYER_ONE) return -100000;

  let score = (countStones(position, BOT) - countStones(position, PLAYER_ONE)) * 4;

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
        const humanReplies = getLegalMoves(result.board, PLAYER_ONE);

        if (humanReplies.length > 0) {
          let worstReply = Infinity;

          for (const reply of humanReplies) {
            try {
              const replyResult = applyMove(result.board, reply, PLAYER_ONE);
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
    finishMatch(null, error.message);
    return;
  }

  if (move === null) {
    finishMatch(PLAYER_ONE, "Der Bot hat kein freies oder eigenes Feld mehr für einen Zug.");
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
    if (!isSelectableSetupCell(index)) return;
    selectedStartCell = index;
    startButton.disabled = false;
    startButton.innerHTML = gameMode === "local" && setupPlayer === PLAYER_ONE
      ? 'Startfeld festlegen <span aria-hidden="true">→</span>'
      : 'Spiel starten <span aria-hidden="true">→</span>';
    setStatus(`${gameMode === "local" ? `${getPlayerName(setupPlayer)}: ` : ""}Startfeld gewählt: Reihe ${Math.floor(index / SIZE) + 1}, Spalte ${(index % SIZE) + 1}.`);
    render();
    return;
  }

  if (phase !== "playing" || (turn !== PLAYER_ONE && turn !== PLAYER_TWO)) {
    return;
  }

  if (board[index].count > 0 && board[index].owner !== turn) {
    return;
  }

  resolveMove(index, turn);
}

function resolveMove(index, side) {
  let result;

  try {
    result = applyMove(board, index, side);
  } catch (error) {
    setStatus(error.message, "alert");
    finishMatch(null, "Die Runde wurde beendet, ohne einen Sieger festzustellen.");
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

  const actor = side === BOT
    ? "Bot-Zug"
    : side === PLAYER_TWO
      ? "Zug von Spieler 2"
      : "Zug von Spieler 1";
  const reactionText = result.explosions > 0
    ? ` ${result.explosions} ${result.explosions === 1 ? "Feld" : "Felder"} explodiert${result.explosions === 1 ? "" : "en"}${result.capturedStones > 0 ? `, ${result.capturedStones} gegnerische ${result.capturedStones === 1 ? "Stein wurde" : "Steine wurden"} erobert` : ""}.`
    : "";

  setStatus(`${actor}.${reactionText || " Stein gesetzt."}`, result.capturedStones > 0 ? "success" : "");

  const winner = result.winner || getWinner(board);
  if (winner) {
    render();
    finishMatch(winner);
    return;
  }

  const nextSide = gameMode === "local"
    ? (side === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE)
    : (side === PLAYER_ONE ? BOT : PLAYER_ONE);

  if (getLegalMoves(board, nextSide).length === 0) {
    render();
    finishMatch(side, `${getPlayerName(nextSide)} hat kein freies oder eigenes Feld mehr für einen Zug.`);
    return;
  }

  turn = nextSide;
  render();

  if (turn === BOT) {
    setStatus(`${reactionText ? `${actor}.${reactionText} ` : ""}Der Bot ist am Zug ...`);
    scheduleBotTurn();
  } else if (gameMode === "local") {
    setStatus(`${reactionText ? `${actor}.${reactionText} ` : ""}${getPlayerName(turn)} ist am Zug.`);
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

  const isDraw = winner === null;
  const elapsed = formatTime(Math.floor((performance.now() - gameStartedAt) / 1000));
  const moveWord = moveCount === 1 ? "Zug" : "Züge";

  if (gameMode === "local") {
    const playerOneStones = countStones(board, PLAYER_ONE);
    const playerTwoStones = countStones(board, PLAYER_TWO);

    resultTitle.textContent = isDraw
      ? "Kettenreaktion ohne Sieger"
      : winner === PLAYER_ONE
        ? "Spieler 1 gewinnt!"
        : "Spieler 2 gewinnt!";
    resultSummary.textContent = `${extraMessage ? `${extraMessage} ` : ""}Spieler 1: ${playerOneStones} Steine · Spieler 2: ${playerTwoStones} Steine. ${moveCount} ${moveWord} in ${elapsed}.`;
    resultPoints.textContent = isDraw ? "–" : `${playerOneStones} : ${playerTwoStones}`;
    render();
    return;
  }

  const humanWon = winner === PLAYER_ONE;
  const ownStones = countStones(board, PLAYER_ONE);
  const botStones = countStones(board, BOT);
  const points = ownStones + moveCount;
  const result = isDraw ? "Unentschieden" : humanWon ? "Sieg" : "Niederlage";

  resultTitle.textContent = isDraw
    ? "Kettenreaktion ohne Sieger"
    : humanWon
      ? "Du hast gewonnen!"
      : "Der Bot gewinnt diese Runde.";
  resultSummary.textContent = `${extraMessage ? `${extraMessage} ` : ""}Auf dem Feld: ${ownStones} deiner Steine und ${botStones} Bot-Steine. ${moveCount} ${moveWord} in ${elapsed}.`;
  resultPoints.textContent = isDraw ? "–" : String(points);

  if (!isDraw) {
    saveHighscore({
      points,
      ownStones,
      moves: moveCount,
      result,
      date: new Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format(new Date()),
    });
  }

  render();
}

gameModeSelect.addEventListener("change", () => {
  resetToSetup();
});

boardElement.addEventListener("click", handleBoardClick);
startButton.addEventListener("click", startMatch);
newGameButton.addEventListener("click", resetToSetup);
playAgainButton.addEventListener("click", resetToSetup);
changeDifficultyButton.addEventListener("click", () => {
  resetToSetup();
  difficultySelect.focus();
});

renderHighscores();
syncSetupMode();
resetToSetup();
