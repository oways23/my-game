const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message'); // not used anymore for win text
const restartBtn = document.getElementById('restart');
const difficultyEl = document.getElementById('difficulty');
// Load sound for bot move
const botMoveSound = new Audio("media/sounds/fart-83471.mp3");
botMoveSound.volume = 0.6; // adjust volume if needed

let board = ['', '', '', '', '', '', '', '', ''];
const playerMark = 'X';
const botMark = 'O';
let gameOver = false;

// Winning combinations
const winCombos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

const urlParams = new URLSearchParams(window.location.search);
const selectedDifficulty = urlParams.get('difficulty');
if (selectedDifficulty) {
    document.getElementById('difficulty').value = selectedDifficulty;
}

// Initialize board
function initBoard() {
    boardEl.innerHTML = '';
    board.forEach((cell, idx) => {
        const cellEl = document.createElement('div');
        cellEl.classList.add('cell');
        cellEl.dataset.index = idx;
        cellEl.textContent = cell;
        cellEl.addEventListener('click', playerMove);
        boardEl.appendChild(cellEl);
    });
    messageEl.textContent = '';
    gameOver = false;

// If difficulty is hard => show Abder popup immediately
if (selectedDifficulty === 'hard') {
     showPopup("Abder");
}
}

function showPopup(result) {
  const popup = document.getElementById('popup');
  const popupContent = document.getElementById('popup-content');
  const popupMessage = document.getElementById('popup-message');
  const popupEmoji = document.getElementById('popup-emoji');
  const popupClose = document.getElementById('restart');

  if (result === 'win') {
    popupMessage.textContent = "You Win!";
    popupEmoji.textContent = "🏆";
  } else if (result === 'lose') {
    popupMessage.textContent = "KY's forehead Wins!";
    popupEmoji.textContent = "🤖";
  } else if (result === 'Abder') {
    popupMessage.innerHTML = "This page is so cold 🥶...<br><br> BTW, Abder already won while you were reading this. 🐐";
    popupEmoji.innerHTML = "⚠️<br> Warning!";
    popupMessage.style.fontSize = '20px';
    popupMessage.style.fontWeight = 'bold';
    // popupMessage.style.marginBottom = "15px";

    // Remove existing button if any
    const oldButton = document.getElementById('restart');
    if (oldButton) oldButton.remove();

    // Create a video element
    const video = document.createElement('video');
    video.id = 'popup-video';
    video.src = 'media/videos/abder-win.mp4'; // replace with your video path
    video.controls = true;
    video.autoplay = true;
    video.muted = true; // important for autoplay
    video.loop = true; // optional: loops automatically
    video.style.width = '100%';
    video.style.marginTop = '10px';

    popupContent.appendChild(video);

    // Create "Back to Difficulty" button
    const backButton = document.createElement('button');
    backButton.textContent = "Take the L & leave";
    backButton.style.display = 'inline-block';
    backButton.style.marginTop = '10px';
    backButton.style.padding = '10px 20px';
    backButton.style.backgroundColor = '#ffd700'; // yellow-ish
    backButton.style.color = '#000';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '8px';
    backButton.style.fontWeight = 'bold';
    backButton.style.cursor = 'pointer';

    // Add click handler to navigate
    backButton.onclick = () => {
        window.location.href = 'difficulty.html'; // redirect
    };

    popupContent.appendChild(backButton);

  } else {
    popupMessage.textContent = "It's a Draw!";
    popupEmoji.textContent = "🤝";
  }

  popup.style.display = "flex";

  popupClose.onclick = () => {
    popup.style.display = "none";
  };
}


function playerMove(e) {
    const idx = e.target.dataset.index;
    if (board[idx] !== '' || gameOver) return;

    board[idx] = playerMark;
    updateBoard();

    if (checkWin(board, playerMark)) {
        gameOver = true;
        showPopup("win"); // WIN
        return; // exit function, do not check draw
    }

    if (boardFull()) {
        gameOver = true;
        showPopup("It's a Draw!"); // DRAW only if no one won
        return;
    }

    setTimeout(botMove, 300);
}

function botMove() {
    if (gameOver) return;

    let idx;
    const difficulty = difficultyEl.value;
    if (difficulty === 'easy') idx = botEasy(board);
     else if (difficulty === 'medium') idx = botHard(board, botMark, playerMark);    
    board[idx] = botMark;
    updateBoard();

    if (checkWin(board, botMark)) {
        gameOver = true;
        showPopup("lose"); // BOT WIN
        return; // exit function
    }

    if (boardFull()) {
        gameOver = true;
        showPopup("It's a Draw!", "🤝"); // DRAW only if no one won
    }
}

function updateBoard() {
    board.forEach((val, idx) => {
        boardEl.children[idx].textContent = val;
    });
}

function checkWin(board, mark) {
    return winCombos.some(combo => combo.every(i => board[i] === mark));
}

function boardFull() {
    return board.every(cell => cell !== '');
}

// Easy Bot: random
function botEasy(board) {
    let empty = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
     botMoveSound.currentTime = 0; // restart if still playing
     botMoveSound.play().catch(err => console.log("Sound error:", err));
    return empty[Math.floor(Math.random()*empty.length)];
}

// Medium Bot: block player if needed, else random
function botMedium(board, botMark, playerMark) {
    for (let i=0;i<board.length;i++){
        if(board[i]===''){
            board[i] = playerMark;
            if(checkWin(board, playerMark)){
                board[i]='';
                return i;
            }
            board[i]='';
        }
    }
    return botEasy(board);
}

// Hard Bot: Minimax algorithm
function botHard(board, botMark, playerMark) {
    let bestScore = -Infinity;
    let move;
    for (let i=0;i<board.length;i++){
        if(board[i]===''){
            board[i]=botMark;
            let score = minimax(board, 0, false);
            board[i]='';
            if(score > bestScore){
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing){
    if(checkWin(board, botMark)) return 10 - depth;
    if(checkWin(board, playerMark)) return depth - 10;
    if(boardFull()) return 0;

    if(isMaximizing){
        let bestScore = -Infinity;
        for(let i=0;i<board.length;i++){
            if(board[i]===''){
                board[i]=botMark;
                let score = minimax(board, depth+1, false);
                board[i]='';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for(let i=0;i<board.length;i++){
            if(board[i]===''){
                board[i]=playerMark;
                let score = minimax(board, depth+1, true);
                board[i]='';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Restart game
restartBtn.addEventListener('click', ()=>{
    board = ['', '', '', '', '', '', '', '', ''];
    initBoard();
});

// Initialize
initBoard();