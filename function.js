const xTurn = 'x';
const oTurn = 'o';
const cells = document.querySelectorAll("[cell]");                   // Array of all the cells that make up the board. Indexed from 0 (top left) to 9 (top right).
const board = document.getElementsByClassName("board")[0];           // The board. Has the functionality of displaying previous moves and the current turn.
const results = document.getElementsByClassName("results")[0];       // The results tab. Is only visible after a win or a draw. Contains the below information:
const XvsO = document.getElementsByClassName("XvsO")[0];             // Displays how many times Player X and Player O have beaten each other in this session. Only visible when results is active.
const winLose = document.getElementsByClassName("winLose")[0];       // Displays the winner of the current match. Only visible when results is active.
const restartButton = document.getElementsByClassName("restart")[0]; // Restart button in the results div. Only visible when results is active.

// Every possible winState where cells are indexed from 0 (top left) to 8 (bottom right).
const winStates = [[0, 1, 2],
                   [3, 4, 5],
                   [6, 7, 8],
                   [0, 3, 6],
                   [1, 4, 7],
                   [2, 5, 8],
                   [0, 4, 8],
                   [2, 4, 6]];

xWins = 0;                                                            // Amount of times Player X has won.
oWins = 0;                                                            // Amount of times Player O has won.
circleTurn = false;                                                   // X initially starts.

startGame(); // Initialize the game.

/**
 * Starts and restarts the game.
 */
function startGame() {
    restartButton.removeEventListener('click', startGame); // Make sure to remove the restart button event listener.
    results.classList.remove("active");                    // Put the results of the match away.
    board.classList.add(circleTurn ? oTurn : xTurn);       // Display the starting turn. For the first match, Player X starts. Every subsequent match, the loser starts.
    cells.forEach(cell => {
        cell.classList.remove(oTurn, xTurn);                      // Remove the previous match's move.
        cell.removeEventListener('click', processTurn);           // Remove the event listener, in case it wasn't activated in the previous match.
        cell.addEventListener('click', processTurn, {once: true}) // Add an event listener that takes Player input once and triggersthe game logic.
    });
}

/**
 * Processes a player taking their turn. Adds their mark, checks for a win, then for a draw, then swaps turns.
 * @param {*} e - The event object.
 */
function processTurn(e) {
    const cell = e.target;                              // Target the cell that fired the event.
    cell.classList.add(circleTurn ? oTurn : xTurn);     // Add an X or an O to the cell depending on who's turn it is.
    if (checkWin()) displayResults(true);               // If a win is detected, display the winner of the match.
    else if (checkDraw()) displayResults(false);        // Else if a draw is detected, display that the match has ended in a draw.
    circleTurn = !circleTurn;                           // Swap turns.
    board.classList.remove(circleTurn ? xTurn : oTurn); // Stop displaying the previous turn.
    board.classList.add(circleTurn ? oTurn : xTurn);    // Display the current turn. This code still excecutes after a win or draw, so the loser or person who didn't make the last move always goes first.
}


/**
 * Check if the most recent move has resulted in a win.
 */
function checkWin() {
    return winStates.some(combination => { // Check if at least one of the winStates...
        return combination.every(cellIndex => { // Match any of the combinations...
            return cells[cellIndex].classList.contains(circleTurn ? oTurn : xTurn) // Of the Player's cells.
        })
    })
}

/**
 * Check if the most recent move has resulted in a draw.
 */
function checkDraw() {
    return [...cells].every(cell => { // Check if every cell...
        return cell.classList.contains(oTurn) || cell.classList.contains(xTurn) // Has been claimed.
    })
}

/**
 * Displays the results of the match after either a victory or a draw has been triggered.
 * @param {boolean} result - Represents the result of the match. True if there's a victory, false if there's a draw.
 */
function displayResults(result) {
    if (result) { // If a player has won...
        winLose.innerHTML = "Victory for " + `${circleTurn ? "O" : "X"}` + "!";  // Tell the player who's turn it is that they won.
        circleTurn ? oWins++ : xWins++;                                          // Award them a win.
    } else
        winLose.innerHTML = "It's a draw!";                                      // Else there is a draw.
    
    XvsO.innerHTML = "X: " + xWins + " win(s) vs. " + "O: " + oWins + " win(s)"; // Summarize every match so far.
    restartButton.addEventListener('click', startGame, {once: true});            // Attach an event listener to start the game over.
    results.classList.add("active");                                             // Display the results.
}