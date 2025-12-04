// ==================== GAME STATE ====================
let currentGame = {
  board: ['', '', '', '', '', '', '', '', ''],
  currentPlayer: 'X',
  mode: '', // single / multi / custom
  isSinglePlayer: false,
  player1Name: 'Player 1',
  player2Name: 'Player 2',
  player1Score: 0,
  player2Score: 0,
  currentMatch: 1,
  isGameActive: true
};

// ================= DOM PAGES =================
const pages = {
  mainMenu: document.getElementById('mainMenu'),
  nameInput: document.getElementById('nameInputPage'),
  gamePage: document.getElementById('gamePage'),
  resultModal: document.getElementById('resultModal'),
  shareModal: document.getElementById('shareModal')
};

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  addCellListeners();
  updateDisplay();

  document.getElementById('playAgainBtn').addEventListener('click', playAgain);
  document.getElementById('playAgainBtnModal').addEventListener('click', playAgain);

  // Auto open multiplayer if URL has invite=true
  if (new URLSearchParams(window.location.search).get("invite") === "true") {
    setTimeout(() => goToNameInput(), 500);
  }
});

// ================= PAGE CONTROL =================
function showPage(page) {
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  pages[page].classList.remove('hidden');
}

function showMainMenu() {
  resetState();
  showPage('mainMenu');
}

function goToSinglePlayer() {
  currentGame.mode = 'single';
  currentGame.isSinglePlayer = true;
  currentGame.player1Name = "You";
  currentGame.player2Name = "AI 🤖";
  startNewMatch();
}

function goToNameInput() {
  showPage('nameInput');
}

function goToMultiplayer() {
  currentGame.mode = 'multi';
  currentGame.isSinglePlayer = false;
  currentGame.player1Name = "Player 1";
  currentGame.player2Name = "Player 2";
  startNewMatch();
}

function startCustomGame() {
  currentGame.mode = 'multi';
  currentGame.isSinglePlayer = false;
  currentGame.player1Name = document.getElementById('player1Name').value || "Player 1";
  currentGame.player2Name = document.getElementById('player2Name').value || "Player 2";
  startNewMatch();
}

function startNewMatch() {
  showPage('gamePage');
  newGame();
}

// ================= GAME CONTROL =================
function newGame() {
  currentGame.board = ['', '', '', '', '', '', '', '', ''];
  currentGame.currentPlayer = 'X';
  currentGame.isGameActive = true;
  updateBoard();
  updateDisplay();

  if (currentGame.isSinglePlayer && currentGame.currentPlayer === 'O')
    setTimeout(aiMove, 600);
}

function newMatch() {
  currentGame.currentMatch++;

  if (currentGame.currentMatch > 3) {
    currentGame.currentMatch = 1;
    currentGame.player1Score = 0;
    currentGame.player2Score = 0;
  }

  pages.resultModal.classList.add('hidden');
  newGame();
}

function playAgain() {
  pages.resultModal.classList.add('hidden');
  newGame();
}

// ================= CLICK HANDLER =================
function addCellListeners() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });
}

function handleCellClick(e) {
  const cell = e.target;
  const index = cell.getAttribute('data-index');

  if (!currentGame.isGameActive || currentGame.board[index] !== '') return;

  makeMove(index, currentGame.currentPlayer);

  if (checkWinner()) return;

  switchTurn();
}

// ================= MOVE LOGIC =================
function makeMove(index, player) {
  currentGame.board[index] = player;
  updateBoard();

  const result = checkResult();
  if (result) endGame(result);
}

function switchTurn() {
  currentGame.currentPlayer = currentGame.currentPlayer === 'X' ? 'O' : 'X';
  updateDisplay();

  if (currentGame.isSinglePlayer && currentGame.currentPlayer === 'O' && currentGame.isGameActive) {
    setTimeout(aiMove, 700);
  }
}

// ================= AI LOGIC =================
function aiMove() {
  if (!currentGame.isGameActive) return;

  let bestMove = findBestMove();
  makeMove(bestMove, 'O');

  if (!checkWinner()) switchTurn();
}

function findBestMove() {
  let win = findLine('O');
  if (win !== -1) return win;

  let block = findLine('X');
  if (block !== -1) return block;

  if (currentGame.board[4] === '') return 4;

  let available = currentGame.board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  return available[Math.floor(Math.random() * available.length)];
}

function findLine(player) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let [a, b, c] of wins) {
    if (currentGame.board[a] === player && currentGame.board[b] === player && currentGame.board[c] === '') return c;
    if (currentGame.board[a] === player && currentGame.board[c] === player && currentGame.board[b] === '') return b;
    if (currentGame.board[b] === player && currentGame.board[c] === player && currentGame.board[a] === '') return a;
  }
  return -1;
}

// ================= CHECK RESULTS =================
function checkResult() {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let [a, b, c] of wins) {
    if (currentGame.board[a] &&
      currentGame.board[a] === currentGame.board[b] &&
      currentGame.board[a] === currentGame.board[c]) {
      return currentGame.board[a];
    }
  }

  if (!currentGame.board.includes('')) return "draw";

  return null;
}

function checkWinner() {
  let result = checkResult();
  if (result) {
    endGame(result);
    return true;
  }
  return false;
}

// ================= END GAME =================
function endGame(result) {
  currentGame.isGameActive = false;
  let message = '';

  if (result === 'X') {
    currentGame.player1Score++;
    message = `${currentGame.player1Name} Wins 🎉`;
  } else if (result === 'O') {
    currentGame.player2Score++;
    message = `${currentGame.player2Name} Wins 🎉`;
  } else {
    message = `It's a Draw 🤝`;
  }

  updateDisplay();
  showResult(message);
}

function showResult(msg) {
  document.getElementById('resultMessage').textContent = msg;
  pages.resultModal.classList.remove('hidden');
}

// ================= UI UPDATE =================
function updateBoard() {
  document.querySelectorAll('.cell').forEach((cell, i) => {
    cell.textContent = currentGame.board[i];
    cell.classList.remove('x', 'o', 'filled');
    if (currentGame.board[i] === 'X') cell.classList.add('x', 'filled');
    if (currentGame.board[i] === 'O') cell.classList.add('o', 'filled');
  });
}

function updateDisplay() {
  document.getElementById('player1Score').textContent = currentGame.player1Score;
  document.getElementById('player2Score').textContent = currentGame.player2Score;
  document.getElementById('matches').textContent = `${currentGame.currentMatch}/3`;
  document.getElementById('player1Label').textContent = currentGame.player1Name;
  document.getElementById('player2Label').textContent = currentGame.player2Name;
  document.getElementById('turnSymbol').textContent = currentGame.currentPlayer;
  document.getElementById('turnText').textContent = `${currentGame.currentPlayer === 'X' ? currentGame.player1Name : currentGame.player2Name}'s turn`;
}

// ================= SHARE LINK =================
function generateShareLink() {
  const url = `${window.location.origin}${window.location.pathname}?invite=true`;
  document.getElementById('shareLink').value = url;
  pages.shareModal.classList.remove('hidden');
}

function copyShareLink() {
  const input = document.getElementById('shareLink');
  navigator.clipboard.writeText(input.value);
  alert("Link copied! Send to your friend 🚀");
}

function closeShareModal() {
  pages.shareModal.classList.add('hidden');
}

// ================= RESET =================
function resetState() {
  currentGame = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    mode: '',
    isSinglePlayer: false,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    player1Score: 0,
    player2Score: 0,
    currentMatch: 1,
    isGameActive: true
  };
}





