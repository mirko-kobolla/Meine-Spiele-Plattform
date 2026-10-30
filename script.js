const filterButtons = [...document.querySelectorAll(".filter-chip")];
const gameCards = [...document.querySelectorAll(".game-card")];
const searchInput = document.querySelector("#game-search");
const emptyState = document.querySelector("#empty-state");
const filterStatus = document.querySelector("#filter-status");
const gameDialog = document.querySelector("#game-dialog");
const gameBoard = document.querySelector("#game-board");
const gameMessage = document.querySelector("#game-message");
const reactionTarget = document.querySelector("#reaction-target");
const startGameButton = document.querySelector("#start-game");
const closeGameButton = document.querySelector("#close-game");
const bestScoreDisplay = document.querySelector("#best-score");
const dialogBestDisplay = document.querySelector("#dialog-best");

let activeFilter = "alle";
let gamePhase = "idle";
let countdownTimeout;
let startedAt = 0;
let bestScore = null;

function updateGameList() {
  const query = searchInput.value.trim().toLocaleLowerCase("de");
  let visibleCount = 0;

  for (const card of gameCards) {
    const matchesCategory = activeFilter === "alle" || card.dataset.category === activeFilter;
    const matchesSearch = card.dataset.search.toLocaleLowerCase("de").includes(query);
    const isVisible = matchesCategory && matchesSearch;

    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  }

  emptyState.hidden = visibleCount > 0;
  filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? "Spiel" : "Spiele"} gefunden.`;
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    for (const filterButton of filterButtons) {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    }

    updateGameList();
  });
}

searchInput.addEventListener("input", updateGameList);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !(event.target instanceof HTMLInputElement) &&
    !(event.target instanceof HTMLTextAreaElement)
  ) {
    event.preventDefault();
    searchInput.focus();
  }
});

function updateBestScore(score) {
  if (bestScore === null || score < bestScore) {
    bestScore = score;
    bestScoreDisplay.textContent = String(score);
    dialogBestDisplay.textContent = `${score} ms`;
  }
}

function resetGame() {
  window.clearTimeout(countdownTimeout);
  gamePhase = "idle";
  gameBoard.classList.remove("is-countdown", "is-ready", "is-finished");
  reactionTarget.disabled = true;
  gameMessage.innerHTML = '<span class="message-symbol" aria-hidden="true">✳</span><span>Bereit für einen Reflex-Test?</span>';
  startGameButton.disabled = false;
}

function startGame() {
  resetGame();
  gamePhase = "countdown";
  startGameButton.disabled = true;
  gameBoard.classList.add("is-countdown");
  gameMessage.innerHTML = '<span class="message-symbol" aria-hidden="true">◌</span><span>Warte auf das Signal ...</span>';

  const delay = 1200 + Math.random() * 2400;
  countdownTimeout = window.setTimeout(() => {
    if (!gameDialog.open || gamePhase !== "countdown") {
      return;
    }

    gamePhase = "ready";
    startedAt = performance.now();
    gameBoard.classList.remove("is-countdown");
    gameBoard.classList.add("is-ready");
    gameMessage.innerHTML = '<span class="message-symbol" aria-hidden="true">!</span><span>JETZT KLICKEN!</span>';
    reactionTarget.disabled = false;
    reactionTarget.focus();
  }, delay);
}

function handleEarlyClick(event) {
  if (gamePhase !== "countdown" || event.target.closest("#start-game")) {
    return;
  }

  resetGame();
  gamePhase = "finished";
  gameBoard.classList.add("is-finished");
  gameMessage.innerHTML = '<span class="message-symbol" aria-hidden="true">↺</span><span>Zu früh! Warte auf das grüne Signal.</span>';
  startGameButton.textContent = "Nochmal versuchen →";
}

function handleReaction() {
  if (gamePhase !== "ready") {
    return;
  }

  const reactionTime = Math.round(performance.now() - startedAt);
  gamePhase = "finished";
  reactionTarget.disabled = true;
  gameBoard.classList.remove("is-ready");
  gameBoard.classList.add("is-finished");
  gameMessage.innerHTML = `<span class="message-symbol" aria-hidden="true">✦</span><span>${reactionTime} ms – stark reagiert!</span>`;
  startGameButton.disabled = false;
  startGameButton.textContent = "Nochmal spielen →";
  updateBestScore(reactionTime);
}

for (const button of document.querySelectorAll("[data-open-game]")) {
  button.addEventListener("click", () => {
    gameDialog.showModal();
    startGameButton.focus();
  });
}

startGameButton.addEventListener("click", startGame);
reactionTarget.addEventListener("click", handleReaction);
gameBoard.addEventListener("pointerdown", handleEarlyClick);

closeGameButton.addEventListener("click", () => {
  gameDialog.close();
});

gameDialog.addEventListener("close", resetGame);
gameDialog.addEventListener("click", (event) => {
  if (event.target === gameDialog) {
    gameDialog.close();
  }
});

updateGameList();
