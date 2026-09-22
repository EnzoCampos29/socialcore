const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const pairsEl = document.getElementById("pairs");
const pairsTotalEl = document.getElementById("pairsTotal");
const statPairsTotalEl = document.getElementById("statPairsTotal");
const timeEl = document.getElementById("time");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");
const winMessage = document.getElementById("winMessage");
const playAgain = document.getElementById("playAgain");
const peekMsg = document.getElementById("peekMsg");
const peekCountEl = document.getElementById("peekCount");
const diffButtons = document.querySelectorAll(".diff-btn");

const winMoves = document.getElementById("winMoves");
const winTime = document.getElementById("winTime");
const winDiff = document.getElementById("winDiff");
const winStars = document.getElementById("winStars");
const winRecord = document.getElementById("winRecord");


const ALL_CONCEPTS = [
  { id: "algoritmo",   icon: "images/algoritmo.png",  title: "Algoritmo" },
  { id: "curtida",     icon: "images/curtida.png",     title: "Curtida" },
  { id: "fake-news",   icon: "images/fakenews.png",    title: "Fake News" },
  { id: "bem-estar",   icon: "images/bemestar.png",    title: "Bem-estar" },
  { id: "privacidade", icon: "images/privacidade.png", title: "Privacidade" },
  { id: "dados",       icon: "images/dados.png",       title: "Dados" },
  { id: "cultura",     icon: "images/cultura.png",     title: "Cultura" },
  { id: "tecnologia",  icon: "images/tecnologia.png",  title: "Tecnologia" },
  { id: "notificacao", icon: "images/notificacao.png", title: "Notificação" },
  { id: "viral",       icon: "images/viral.png",       title: "Viral" }
];

const DIFFICULTIES = {
  facil: { pairs: 6, cols: 4, peekSeconds: 2, label: "Fácil" },
  medio: { pairs: 8, cols: 4, peekSeconds: 3, label: "Médio" },
  dificil: { pairs: 10, cols: 5, peekSeconds: 4, label: "Difícil" }
};



let currentDiff = "facil";
let concepts = [];

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let pairs = 0;
let seconds = 0;
let timer = null;
let gameStarted = false;
let peekTimer = null;



function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}



function bestKey(diff) {
  return `edutec_memoria_best_${diff}`;
}

function loadBest(diff) {
  try {
    const raw = localStorage.getItem(bestKey(diff));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveBestIfBetter(diff, moves, seconds) {
  const current = loadBest(diff);
  const score = moves * 1000 + seconds;
  const currentScore = current ? current.moves * 1000 + current.time : Infinity;

  if (score < currentScore) {
    try {
      localStorage.setItem(
        bestKey(diff),
        JSON.stringify({ moves, time: seconds })
      );
    } catch (e) {
      
    }
    return true;
  }
  return false;
}

function formatTime(totalSeconds) {
  const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const sec = String(totalSeconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function renderBest() {
  const best = loadBest(currentDiff);
  bestEl.textContent = best
    ? `${best.moves} mov · ${formatTime(best.time)}`
    : "—";
}



function createCard(concept) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.dataset.id = concept.id;
  card.setAttribute("aria-label", "Carta da memória, ainda não revelada");

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front" aria-hidden="true"></div>
      <div class="card-face card-back">
        <img class="card-icon" src="${concept.icon}" alt="" onerror="this.classList.add('icon-missing')">
        <span class="card-title">${concept.title}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => flipCard(card));

  return card;
}



function startTimer() {
  if (timer) return;

  timer = setInterval(() => {
    seconds++;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}



function flipCard(card) {
  if (
    lockBoard ||
    card === firstCard ||
    card.classList.contains("matched") ||
    card.classList.contains("flipped")
  ) {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  card.classList.add("flipped");
  card.setAttribute("aria-label", "Carta revelada");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesEl.textContent = moves;

  checkMatch();
}


function checkMatch() {
  const isMatch = firstCard.dataset.id === secondCard.dataset.id;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    firstCard.setAttribute("aria-label", "Par encontrado");
    secondCard.setAttribute("aria-label", "Par encontrado");

    pairs++;
    pairsEl.textContent = pairs;

    resetTurn();

    if (pairs === concepts.length) {
      finishGame();
    }
  } else {
    lockBoard = true;
    firstCard.classList.add("shake");
    secondCard.classList.add("shake");

    setTimeout(() => {
      firstCard.classList.remove("flipped", "shake");
      secondCard.classList.remove("flipped", "shake");
      firstCard.setAttribute("aria-label", "Carta da memória, ainda não revelada");
      secondCard.setAttribute("aria-label", "Carta da memória, ainda não revelada");
      resetTurn();
    }, 750);
  }
}



function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}



function finishGame() {
  clearInterval(timer);

  const isNewRecord = saveBestIfBetter(currentDiff, moves, seconds);
  renderBest();

  setTimeout(() => {
    winMoves.textContent = moves;
    winTime.textContent = formatTime(seconds);
    winDiff.textContent = DIFFICULTIES[currentDiff].label;

    const totalPairs = concepts.length;
    let starCount;
    if (moves <= totalPairs * 1.4) starCount = 3;
    else if (moves <= totalPairs * 2.1) starCount = 2;
    else starCount = 1;

    winStars.querySelectorAll("span").forEach((star, i) => {
      star.classList.toggle("lit", i < starCount);
    });

    winRecord.classList.toggle("hidden", !isNewRecord);

    winMessage.classList.remove("hidden");
  }, 450);
}



function runPeek(cards, seconds) {
  lockBoard = true;
  peekMsg.classList.remove("hidden");

  cards.forEach(card => card.classList.add("peeking"));

  let remaining = seconds;
  peekCountEl.textContent = remaining;

  peekTimer = setInterval(() => {
    remaining--;
    peekCountEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(peekTimer);
      cards.forEach(card => card.classList.remove("peeking"));
      peekMsg.classList.add("hidden");
      lockBoard = false;
    }
  }, 1000);
}



function startGame() {
  clearInterval(timer);
  clearInterval(peekTimer);
  timer = null;

  firstCard = null;
  secondCard = null;
  lockBoard = false;

  moves = 0;
  pairs = 0;
  seconds = 0;
  gameStarted = false;

  movesEl.textContent = "0";
  pairsEl.textContent = "0";
  timeEl.textContent = "00:00";

  const diffConfig = DIFFICULTIES[currentDiff];
  concepts = ALL_CONCEPTS.slice(0, diffConfig.pairs);

  pairsTotalEl.textContent = diffConfig.pairs;
  statPairsTotalEl.textContent = diffConfig.pairs;

  board.className = `board size-${diffConfig.pairs}`;

  winMessage.classList.add("hidden");
  board.innerHTML = "";

  renderBest();

  const deck = shuffle([...concepts, ...concepts]);
  const cardEls = deck.map(concept => createCard(concept));

  cardEls.forEach(card => board.appendChild(card));

  runPeek(cardEls, diffConfig.peekSeconds);
}



diffButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.diff === currentDiff) return;

    diffButtons.forEach(b => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");

    currentDiff = btn.dataset.diff;
    startGame();
  });
});



restartBtn.addEventListener("click", startGame);
playAgain.addEventListener("click", startGame);



startGame();