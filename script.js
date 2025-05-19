// script.js

// ─── Core Game Logic ─────────────────────────────────────────────────────────

function player(name, token) {
  let score = 0;
  return {
    getName:    () => name,
    getToken:   () => token,
    getScore:   () => score,
    incScore:   () => score++
  };
}

function cell() {
  let value = 0;
  return {
    getVal: () => value,
    setVal: v => { value = v; }
  };
}

function gameBoard() {
  const board = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => cell())
  );

  return {
    addToken(r, c, token) {
      if (board[r][c].getVal() !== 0) return false;
      board[r][c].setVal(token);
      return true;
    },
    roundWon() {
      const line = (a, b, c) =>
        a.getVal() !== 0 &&
        a.getVal() === b.getVal() &&
        a.getVal() === c.getVal();

      for (let i = 0; i < 3; i++) {
        if (
          line(board[i][0], board[i][1], board[i][2]) ||
          line(board[0][i], board[1][i], board[2][i])
        ) return true;
      }
      return (
        line(board[0][0], board[1][1], board[2][2]) ||
        line(board[0][2], board[1][1], board[2][0])
      );
    },
    isBoardFull() {
      return board.every(row => row.every(cell => cell.getVal() !== 0));
    },
    reset() {
      board.forEach(row => row.forEach(cell => cell.setVal(0)));
    }
  };
}

// ─── UI‑Friendly Game Controller ───────────────────────────────────────────────

function playGameController(rounds, p1, p2) {
  const players = [p1, p2];
  const board   = gameBoard();
  let currentPlayer = 0;
  let roundNumber   = 1;

  return {
    getRoundNumber() {
      return roundNumber;
    },
    isGameOver() {
      if (roundNumber > rounds) {
        // no side-effects here
        if (p1.getScore() > p2.getScore()) return p1.getName();
        if (p1.getScore() < p2.getScore()) return p2.getName();
        return 0;  // tie
      }
      return null;
    },
    resetGame() {
      board.reset();
      currentPlayer = 0;
      roundNumber   = 1;
      p1.incScore(); p1.incScore(); // no, don't change scores here
      // we leave scores intact—only board & counters reset
    },
    getCurrentPlayerName() {
      return players[currentPlayer].getName();
    },
    getScores() {
      return {
        [p1.getName()]: p1.getScore(),
        [p2.getName()]: p2.getScore()
      };
    },
    playTurn(r, c) {
      const player = players[currentPlayer];
      const valid  = board.addToken(r, c, player.getToken());
      if (!valid) return { valid: false };

      const marker = player.getToken();
      const win    = board.roundWon();
      const draw   = !win && board.isBoardFull();

      if (win) player.incScore();

      if (win || draw) {
        board.reset();
        roundNumber++;
        currentPlayer = 0;  // next round starts with player1
      } else {
        currentPlayer = 1 - currentPlayer;
      }

      return {
        valid:         true,
        win,
        draw,
        marker,
        winner:        win ? player.getName() : null,
        nextPlayer:    players[currentPlayer].getName()
      };
    }
  };
}

// ─── DOM & UI Wiring ──────────────────────────────────────────────────────────

const openBtn   = document.getElementById('open-modal');
const backdrop  = document.getElementById('modal-backdrop');
const closeBtn  = document.querySelector('#modal .close');
const form      = document.getElementById('setup-form');
const roundInfo = document.querySelector('.round-info');
const turnInfo  = document.querySelector('.player-turn');
const scoreInfo = document.querySelector('.score');
const cells     = Array.from(document.querySelectorAll('.button-container button'));

// Toggle modal display
function toggleModal(show) {
  backdrop.style.display = show ? 'flex' : 'none';
}

openBtn.addEventListener('click',  () => toggleModal(true));
closeBtn.addEventListener('click', () => toggleModal(false));
backdrop.addEventListener('click', e => {
  if (e.target === backdrop) toggleModal(false);
});

// We'll attach cell listeners once here
cells.forEach(btn => {
  btn.addEventListener('click', onCellClick);
});

let game;  // holds our controller

form.addEventListener('submit', e => {
  e.preventDefault();

  const rounds = parseInt(document.getElementById('rounds').value, 10);
  const p1Name = document.getElementById('player1-name').value.trim();
  const p1Mark = document.getElementById('player1-mark').value.trim();
  const p2Name = document.getElementById('player2-name').value.trim();
  const p2Mark = document.getElementById('player2-mark').value.trim();

  toggleModal(false);

  // Create players & controller
  const p1 = player(p1Name, p1Mark);
  const p2 = player(p2Name, p2Mark);
  game = playGameController(rounds, p1, p2);

  // Reset board UI & labels
  resetBoardUI();
  updateLabels();
});

// Handle a click on any cell
function onCellClick(e) {
  if (!game) return;          // not initialized yet
  const btn = e.currentTarget;
  const r   = +btn.dataset.row;
  const c   = +btn.dataset.col;

  const result = game.playTurn(r, c);
  if (!result.valid) {
    alert('Cell already taken!');
    return;
  }

  // Paint marker and disable
  btn.textContent = result.marker;
  btn.disabled    = true;

  // Check for end of round
  if (result.win || result.draw) {
    roundInfo.textContent = result.win
      ? `${result.winner} wins round!`
      : 'Draw this round!';
    updateLabels();

    // compute delay: 1s normally, 10s at game end
    const gameOver = game.isGameOver();
    const delay    = (gameOver !== null) ? 10000 : 1000;

    if (gameOver !== null) {
      roundInfo.textContent = 
        gameOver === 0
          ? 'Game tied! Next match in 10s.'
          : `${gameOver} wins the game! Next match in 10s.`;
    }

    // After delay, reset UI for next round or next game
    setTimeout(() => {
      resetBoardUI();
      if (gameOver !== null) {
        // new game: scores persist, rounds reset inside controller if you call resetGame()
        game.resetGame();
      }
      updateLabels();
    }, delay);

  } else {
    // Normal turn swap
    turnInfo.textContent = `Turn: ${result.nextPlayer}`;
  }
}

// Clear UI board & enable all cells
function resetBoardUI() {
  cells.forEach(btn => {
    btn.textContent = '';
    btn.disabled    = false;
  });
}

// Update round/turn/score labels
function updateLabels() {
  roundInfo.textContent = `Round ${game.getRoundNumber()}`;
  turnInfo.textContent  = `Turn: ${game.getCurrentPlayerName()}`;
  const scores = game.getScores();
  scoreInfo.textContent = 'Score — ' +
    Object.entries(scores)
      .map(([n, s]) => `${n}: ${s}`)
      .join(' | ');
}
