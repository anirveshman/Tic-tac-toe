function player(name, token) {

    let getName = () => name;
    let getToken = () => token;
    let score = 0;
    let getScore = () => score;
    let incScore = () => score++;

    return { getName, getToken, getScore, incScore};
}

function cell() {
    let value = 0;

    let getVal = () => value;
    let setVal = (token) => {
        value = token;
    }

    return {getVal, setVal};
}

function gameBoard() {

    let board = [];

    for(let i =0; i < 3; i++){
        board[i] = [];
        for(let j = 0; j < 3; j++){
            board[i].push(cell());
        }
    }

    function addToken (row, col, token) {
        board[row][col].setVal(token);
    }

    function roundWon() {
        for(let i =0; i < 3; i++){ //checking for rows
            let x = board[i][0].getVal();

            for(let j =0; j < 3; j++){
                if(board[i][j].getVal() != x) break;
                else {
                    if(j == 2 && board[i][j].getVal() == x) return true;
                }
            }
        }

        for(let i =0; i < 3; i++){ //checking for columns
            let x = board[0][i].getVal();
            if(x == 0) continue;

            for(let j =0; j < 3; j++){
                if(board[j][i].getVal() != x) break;
                else {
                    if(j == 2 && board[i][j].getVal() ==x) return true;
                }
            }
        }
        
        //Diagonal
        let x = board[0][0].getVal();
        if (x !== 0 && board[1][1].getVal() === x && board[2][2].getVal() === x) return true;

        // Anti-diagonal
        x = board[0][2].getVal();
        if (x !== 0 && board[1][1].getVal() === x && board[2][0].getVal() === x) return true;

        return false;
    }

    function isBoardFull() {
        for(let i =0; i < 3; i++){
            for(let j =0; j < 3; j++){
                if(board[i][j].getVal() == 0) return false;
            }
        }
        return true;
    }

    function reset() {
        for(let i =0; i < 3; i++){
            for(let j =0; j < 3; j++){
                board[i][j].setVal(0);
            }
        }
    }

    function printBoard() {
        for(let i = 0; i < 3; i++){
            console.log(board[i].map(cell => cell.getVal()).join(" | "));
        }
    }

    return {addToken, roundWon, printBoard, reset, isBoardFull};
}

function gameController(rounds, player1, player2){

    let board = gameBoard();
    let roundsPlayed = 0;

    function playTurn(row, col, player){

        board.addToken(row, col, player.getToken());
        if(board.roundWon()) {
                player.incScore();
                roundsPlayed++;
                board.printBoard();
                board.reset();
                return true;
            }
            else if(board.isBoardFull()) {
                roundsPlayed++;
                board.printBoard();
                board.reset();
                return true;
            }
            
            board.printBoard();
            return false;
    }

    function playRound() {
        while(roundsPlayed != rounds){
            let isRoundOver = playTurn(row, col, player1);            
            if(isRoundOver == true) continue;

            playTurn(row, col, player2);
        }

        console.log(`Final Scores:`);
        console.log(`${player1.getName()}: ${player1.getScore()}`);
        console.log(`${player2.getName()}: ${player2.getScore()}`);
    }

    return { playRound };

}

let player1 = player("Anirvesh", "X");
let player2 = player("Adarsh", "O");


gameController(3, player1, player2).playRound();