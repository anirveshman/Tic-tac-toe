function player(name, token) {
    let score = 0;
    return {
        getName: () => name,
        getToken: () => token,
        getScore: () => score,
        incScore: () => score++
    };
}

function cell() {
    let value = 0;
    return {
        getVal: () => value,
        setVal: (token) => { value = token; }
    };
}

function gameBoard() {
    let board = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => cell()));

    function addToken(row, col, token) {
        if (board[row][col].getVal() !== 0) {
            console.log(`Cell (${row}, ${col}) is already taken.`);
            return false;
        }
        board[row][col].setVal(token);
        return true;
    }

    function roundWon() {
        // Rows
        for (let i = 0; i < 3; i++) {
            let x = board[i][0].getVal();
            if (x !== 0 && board[i][1].getVal() === x && board[i][2].getVal() === x) return true;
        }

        // Columns
        for (let i = 0; i < 3; i++) {
            let x = board[0][i].getVal();
            if (x !== 0 && board[1][i].getVal() === x && board[2][i].getVal() === x) return true;
        }

        // Diagonal
        let x = board[0][0].getVal();
        if (x !== 0 && board[1][1].getVal() === x && board[2][2].getVal() === x) return true;

        // Anti-diagonal
        x = board[0][2].getVal();
        if (x !== 0 && board[1][1].getVal() === x && board[2][0].getVal() === x) return true;

        return false;
    }

    function isBoardFull() {
        return board.every(row => row.every(cell => cell.getVal() !== 0));
    }

    function reset() {
        board.forEach(row => row.forEach(cell => cell.setVal(0)));
    }

    function printBoard() {
    console.log("\nBoard:");
    board.forEach(row => {
      // Use getVal() and show '_' for empty
      const line = row.map(cell => {
        const v = cell.getVal();
        return v === 0 ? '_' : v;
      }).join(' | ');
      console.log(line);
    });
    console.log();
  }

    return { addToken, roundWon, isBoardFull, reset, printBoard };
}


function playGame(rounds, p1, p2) {
  const players = [p1, p2];
  const board = gameBoard();
  let scores = { [p1.getName()]: 0, [p2.getName()]: 0 };

  // Predefined moves to simulate
  const moves = [
    [0, 0], [1, 1], [0, 1], [1, 0], [0, 2], // p1 wins
    [2, 2], [2, 1], [1, 2], [2, 0], [1, 1], // draw
    [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], // p1 wins
  ];

  let moveIdx = 0;
  for (let round = 1; round <= rounds; round++) {
    console.log(`\n=== Round ${round} ===`);
    board.reset();
    board.printBoard();

    let currentPlayer = 0;
    while (true) {
      if (moveIdx >= moves.length) break;
      const [r, c] = moves[moveIdx++];
      const player = players[currentPlayer];

      if (!board.addToken(r, c, player.getToken())) {
        console.log(`Invalid: ${player.getName()} at (${r},${c}), retrying`);
        continue; // same player tries again
      }

      board.printBoard();

      if (board.roundWon()) {
        console.log(`${player.getName()} wins!`);
        player.incScore();
        break;
      }
      if (board.isBoardFull()) {
        console.log("It's a draw!");
        break;
      }

      currentPlayer = 1 - currentPlayer; // switch the player
    }
  }

  console.log("\n=== Final Scores ===");
  players.forEach(p =>
    console.log(`${p.getName()}: ${p.getScore()}`)
  );
}


const openBtn = document.getElementById('open-modal');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = document.querySelector('#modal .close');
const form = document.getElementById('setup-form');

function toggleModal(show) {
    backdrop.style.display = show ? 'flex' : 'none';
}

openBtn.addEventListener('click', () => toggleModal(true));
closeBtn.addEventListener('click', () => toggleModal(false));
backdrop.addEventListener('click', e => {
    if (e.target === backdrop) toggleModal(false);
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const rounds = parseInt(document.getElementById('rounds').value, 10);
    const p1 = {
    name: document.getElementById('player1-name').value.trim(),
    token: document.getElementById('player1-mark').value.trim()
    };
    const p2 = {
    name: document.getElementById('player2-name').value.trim(),
    token: document.getElementById('player2-mark').value.trim()
    };
    toggleModal(false);
    
    playGame(rounds, p1, p2);
});