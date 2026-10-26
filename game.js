const MIN = 1;
const MAX = 100;

const setupPhase = document.getElementById("setup-phase");
const duelPhase = document.getElementById("duel-phase");
const resultPhase = document.getElementById("result-phase");

const setupForm = document.getElementById("setup-form");
const secretInput = document.getElementById("secret-input");
const setupError = document.getElementById("setup-error");

const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const guessError = document.getElementById("guess-error");

const playerRangeEl = document.getElementById("player-range");
const cpuAttemptsEl = document.getElementById("cpu-attempts");
const playerLogEl = document.getElementById("player-log");
const cpuLogEl = document.getElementById("cpu-log");

const resultTitle = document.getElementById("result-title");
const resultDetail = document.getElementById("result-detail");
const rematchButton = document.getElementById("rematch-button");

let state = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newState(playerSecret) {
  return {
    playerSecret,
    cpuSecret: randomInt(MIN, MAX),
    playerGuessCount: 0,
    cpuGuessCount: 0,
    cpuLow: MIN,
    cpuHigh: MAX,
    playerLow: MIN,
    playerHigh: MAX,
    finished: false,
  };
}

function feedbackFor(guess, secret) {
  if (guess === secret) return { label: "Correct!", cls: "correct" };
  if (guess < secret) return { label: "Higher", cls: "" };
  return { label: "Lower", cls: "" };
}

function logGuess(listEl, round, guess, feedback) {
  const li = document.createElement("li");
  if (feedback.cls) li.classList.add(feedback.cls);
  li.innerHTML = `<span>#${round} - ${guess}</span><span class="feedback">${feedback.label}</span>`;
  listEl.appendChild(li);
  listEl.scrollTop = listEl.scrollHeight;
}

function cpuTakeTurn() {
  state.cpuGuessCount += 1;
  const mid = Math.floor((state.playerLow + state.playerHigh) / 2);
  const jitter = Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0;
  const guess = Math.min(state.playerHigh, Math.max(state.playerLow, mid + jitter));

  const feedback = feedbackFor(guess, state.playerSecret);
  logGuess(cpuLogEl, state.cpuGuessCount, guess, feedback);
  cpuAttemptsEl.textContent = state.cpuGuessCount;

  if (guess === state.playerSecret) {
    endDuel(false);
    return;
  }
  if (guess < state.playerSecret) {
    state.playerLow = guess + 1;
  } else {
    state.playerHigh = guess - 1;
  }
}

function endDuel(playerWon) {
  state.finished = true;
  duelPhase.classList.add("hidden");
  resultPhase.classList.remove("hidden");
  resultTitle.textContent = playerWon ? "You win the duel!" : "CPU wins the duel!";
  resultTitle.className = playerWon ? "win" : "lose";
  resultDetail.textContent = playerWon
    ? `You found the CPU's number in ${state.playerGuessCount} guess${state.playerGuessCount === 1 ? "" : "es"}, beating its ${state.cpuGuessCount}.`
    : `The CPU found your number in ${state.cpuGuessCount} guess${state.cpuGuessCount === 1 ? "" : "es"}, beating your ${state.playerGuessCount}.`;
}

setupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = Number(secretInput.value);
  if (!Number.isInteger(value) || value < MIN || value > MAX) {
    setupError.textContent = `Please enter a whole number between ${MIN} and ${MAX}.`;
    return;
  }
  setupError.textContent = "";
  state = newState(value);
  setupPhase.classList.add("hidden");
  duelPhase.classList.remove("hidden");
  playerRangeEl.textContent = `${MIN} - ${MAX}`;
  cpuAttemptsEl.textContent = "0";
  playerLogEl.innerHTML = "";
  cpuLogEl.innerHTML = "";
  guessInput.value = "";
  guessInput.focus();
});

guessForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state || state.finished) return;

  const value = Number(guessInput.value);
  if (!Number.isInteger(value) || value < MIN || value > MAX) {
    guessError.textContent = `Please enter a whole number between ${MIN} and ${MAX}.`;
    return;
  }
  guessError.textContent = "";

  state.playerGuessCount += 1;
  const feedback = feedbackFor(value, state.cpuSecret);
  logGuess(playerLogEl, state.playerGuessCount, value, feedback);
  guessInput.value = "";
  guessInput.focus();

  if (value === state.cpuSecret) {
    endDuel(true);
    return;
  }
  if (value < state.cpuSecret) {
    state.cpuLow = value + 1;
  } else {
    state.cpuHigh = value - 1;
  }
  playerRangeEl.textContent = `${state.cpuLow} - ${state.cpuHigh}`;

  cpuTakeTurn();
});

rematchButton.addEventListener("click", () => {
  state = null;
  resultPhase.classList.add("hidden");
  setupPhase.classList.remove("hidden");
  secretInput.value = "";
  setupError.textContent = "";
  secretInput.focus();
});
