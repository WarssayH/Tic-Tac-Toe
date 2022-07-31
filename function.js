const xTurn = 'x';
const oTurn = 'o';
const cells = document.querySelectorAll("[cell]");                  // Array of all the cells that make up the board. Indexed from 0 (top left) to 9 (bottom right).
const board = document.getElementById("board");                     // The board. Has the functionality of displaying previous moves and the current turn.
const results = document.getElementById("results");                 // The results tab. Is only visible after a win or a draw. Contains the below information:
const XvsO = document.getElementById("XvsO");                       // Displays how many times Player X and Player O have beaten each other in this session. Only visible when results is active.
const winLose = document.getElementById("winLose");                 // Displays the winner of the current match. Only visible when results is active.
const restartButton = document.getElementById("restart");           // Restart button in the results div. Only visible when results is active.
const opponentOptions = document.getElementById("opponentOptions");
const localPlayButton = document.getElementById("local");
const easyAIButton = document.getElementById("easy");
const normalAIButton = document.getElementById("normal");
const hardAIButton = document.getElementById("hard");
var mode;

// Every possible winState where cells are indexed from 0 (top left) to 8 (bottom right).
const winStates = [[0, 1, 2],
                   [3, 4, 5],
                   [6, 7, 8],
                   [0, 3, 6],
                   [1, 4, 7],
                   [2, 5, 8],
                   [0, 4, 8],
                   [2, 4, 6]];

xWins = 0;                                                           // Amount of times Player X has won.
oWins = 0;                                                           // Amount of times Player O has won.
circleTurn = false;                                                  // X initially starts.

localPlayButton.addEventListener('click', handleMode);
easyAIButton.addEventListener('click', handleMode);
normalAIButton.addEventListener('click', handleMode);
hardAIButton.addEventListener('click', handleMode);

startGame(); // Initialize the game.

/**
 * Starts and restarts the game.
 */
function startGame() {
    opponentOptions.classList.add("active");
    restartButton.removeEventListener('click', startGame);        // Make sure to remove the restart button event listener.
    results.classList.remove("active");                           // Put the results of the previous match away.
    board.classList.add(circleTurn ? oTurn : xTurn);              // Display the starting turn. For the first match, Player X starts. Every subsequent match, the loser starts.
    cells.forEach(cell => {
        cell.classList.remove(oTurn, xTurn);                      // Remove the previous match's move.
        cell.removeEventListener('click', handleClick);           // Remove the event listener, in case it wasn't activated in the previous match.
        cell.addEventListener('click', handleClick, {once: true}) // Add an event listener that takes Player input once and triggers the game logic.
    });
}

/**
 * Handles the player selecting a cell.
 * @param {*} e - The event object.
 */
function handleClick(e) {
    var cell = e.target; // Target the cell that fired the event.
    processTurn(cell);
}


/**
 * Handles the player selecting a difficulty mode.
 * @param {*} e - The event object.
 */
function handleMode(e) {
    opponentOptions.classList.remove("active");
    mode = e.target.id;
    if (circleTurn && mode !== "local") takeTurn(); // If we are restarting the game, it may be O's turn.
}

/**
 * If the player is playing vs. the AI, chooses a cell for the AI opponent to claim
 */
function takeTurn() {
    let boardState = ["", "", "", "", "", "", "", "", ""];               // Will represent the current state of the board
    let choice = null; 
    let cell;                                                            // AI's chosen move
    for (let id = 0; id < 9; id++) {                                     // For each cell...
        let cell = document.getElementById(id);
        if (cell.classList.contains(xTurn)) boardState[id] = xTurn;      // If the cell is claimed by X, reflect that in the board state by setting the index of that cell in the array to x
        else if (cell.classList.contains(oTurn)) boardState[id] = oTurn; // ^                       ^ O, ^                                                                               ^ o
    }                                                                    // Empty cells are represented by ""

    if (boardState.every(cell => cell !== "")) return console.log("I should not have taken a turn!"); 
    
    if (mode === "easy") {
        if (boardState.every(cell => cell === "")) {                         // If the board is empty (we have the first turn)
            choice = randomIntInterval(0, 8);                                // Pick a random spot
            if (Math.random() >= 0.5) choice = 4;                            // ~50% chance we pick the center instead
        }
        let id = 0;
        let state = 0;
        while (id < 9 && choice === null) {                                  // While we haven't checked every cell and haven't made a choice
            if (boardState[id] === "") {                                     // If the cell is unclaimed
                boardState[id] = oTurn;                                      // Act as if we have claimed it
                while (state < 8) {                                          // While we haven't evaluated all potential win states
                    if (boardState[winStates[state][0]] === oTurn &&
                        boardState[winStates[state][1]] === oTurn &&
                        boardState[winStates[state][2]] === oTurn) {         // See if claiming this cell brings victory
                        choice = id;                                         // If it does, choose it
                        break;
                    } state++;                                               // Evaluate the next potential win state.
                } boardState[id] = "";                                       // Stop acting as if we have claimed it
            } id++; state = 0;
        }
    } else if (mode === "normal") {
        if (boardState.every(cell => cell === "")) choice = 4;               // If the board is empty, claim the center cell
        let id = 0;
        let state = 0;
        while (id < 9 && choice === null) {                                  // While we haven't checked every cell and haven't made a choice
            if (boardState[id] === "") {                                     // If the cell is unclaimed
                boardState[id] = xTurn;                                      // Act as if the player will claim it
                while (state < 8) {                                          // While we haven't evaluated all potential win states
                    if (boardState[winStates[state][0]] === xTurn &&
                        boardState[winStates[state][1]] === xTurn &&
                        boardState[winStates[state][2]] === xTurn) {         // See if claiming this cell prevents a loss
                        choice = id;                                         // If it does, choose it
                        break;
                    } state++;                                               // Evaluate the next potential win state.
                } boardState[id] = "";                                       // Stop acting as if the player claimed it
            } id++; state = 0;
        }
    } else {
        if (boardState.every(cell => cell === "")) choice = 4;               // If the board is empty, claim the center cell
        let id = 0;
        let state = 0;

        while (id < 9 && choice === null) {                                  // While we haven't checked every cell and haven't made a choice
            if (boardState[id] === "") {                                     // If the cell is unclaimed
                boardState[id] = oTurn;                                      // Act as if we have claimed it
                while (state < 8) {                                          // While we haven't evaluated all potential win states
                    if (boardState[winStates[state][0]] === oTurn &&
                        boardState[winStates[state][1]] === oTurn &&
                        boardState[winStates[state][2]] === oTurn) {         // See if claiming this cell brings victory
                        choice = id;                                         // If it does, choose it
                        break;
                    } state++;                                               // Evaluate the next potential win state.
                } boardState[id] = "";                                       // Stop acting as if we have claimed it
            } id++; state = 0;
        }

        id = 0;
        state = 0;
        while (id < 9 && choice === null) {                                  // While we haven't checked every cell and haven't made a choice
            if (boardState[id] === "") {                                     // If the cell is unclaimed
                boardState[id] = xTurn;                                      // Act as if the player will claim it
                while (state < 8) {                                          // While we haven't evaluated all potential win states
                    if (boardState[winStates[state][0]] === xTurn &&
                        boardState[winStates[state][1]] === xTurn &&
                        boardState[winStates[state][2]] === xTurn) {         // See if claiming this cell prevents a loss
                        choice = id;                                         // If it does, choose it
                        break;
                    } state++;                                               // Evaluate the next potential win state.
                } boardState[id] = "";                                       // Stop acting as if the player claimed it
            } id++; state = 0;
        }
    }

    while (choice === null) {
        console.log("Guess.")
        id = randomIntInterval(0, 8);                                    // If no cell was chosen, pick a random cell to claim
        if (boardState[id] === "") choice = id;                          // If the cell we randomly chose is unclaimed, use it
    }

    cell = document.getElementById(choice);                              // Retrieve the cell we have picked from the document
    cell.removeEventListener('click', handleClick);                      // Prevent the player from claiming this cell
    processTurn(cell);
}

/**
 * Processes a cell claim.
 * @param {*} cell - The cell being claimed.
 */
function processTurn(cell) {
    cell.classList.add(circleTurn ? oTurn : xTurn);                         // Add an X or an O to the cell depending on who's turn it is.
    board.classList.remove(circleTurn ? oTurn : xTurn);                     // Stop displaying the previous turn.
    board.classList.add(!circleTurn ? oTurn : xTurn);                       // Display the current turn.
    let won = checkWin();
    let draw = checkDraw()
    if (won) endGame(true);                                                 // If a win is detected, display the winner of the match.
    else if (draw) endGame(false);                                          // Else if a draw is detected, display that the match has ended in a draw.
    circleTurn = !circleTurn;                                               // Swap turns.
    if (circleTurn && mode !== "local" && !(won || draw)) takeTurn();       // Have the AI play for O if the game isn't over and mode is not local
}

/**
 * Check if the most recent move has resulted in a win.
 */
function checkWin() {
    return winStates.some(combination => {                                    // Check if at least one of the winStates...
        return combination.every(cell => {                                    // Match any of the combinations...
            return cells[cell].classList.contains(circleTurn ? oTurn : xTurn) // Of the last player's cells.
        })
    })
}

/**
 * Check if the most recent move has resulted in a draw.
 */
function checkDraw() {
    return [...cells].every(cell => {                                           // Check if every cell...
        return cell.classList.contains(oTurn) || cell.classList.contains(xTurn) // Has been claimed.
    })
}

/**
 * Displays the results of the match after either a victory or a draw has been triggered.
 * @param {boolean} result - Represents the result of the match. True if there's a victory, false if there's a draw.
 */
function endGame(result) {
    if (result) {                                                                // If a player has won...
        winLose.innerHTML = "Victory for " + `${circleTurn ? "O" : "X"}`;        // Tell the player who's turn it is that they won.
        circleTurn ? oWins++ : xWins++;                                          // Award them a win.
    } else
        winLose.innerHTML = "It's a draw!";                                      // Else there is a draw.
    
    XvsO.innerHTML = "X: " + xWins + " win(s) vs. " + "O: " + oWins + " win(s)"; // Summarize every match so far.
    restartButton.addEventListener('click', startGame, {once: true});            // Attach an event listener to start the game over.
    results.classList.add("active");                                             // Display the results.
}

/**
 * Returns a random integer between and including the minimum and maximum
 * @param {*} min - Minimum value to return
 * @param {*} max - Maximum value to return
 * @returns 
 */
function randomIntInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}