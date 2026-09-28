const CELL_SIZE = 30;
const GRID_SIZE = 20;
const GAME_SPEED = 100;
const canvas = document.getElementById("gameCanvas");
const scoreElement = document.getElementById("score");
const goScreen = document.getElementById("gameOverScreen");
const restartButton = document.getElementById("restartButton");
const context = canvas.getContext("2d");
const topButton = document.getElementById("topButton")
const startScreen = document.getElementById("startScreen");
const nameInput = document.getElementById("nameInput");
const startButton = document.getElementById("startButton");
const leaderboardScreen = document.getElementById("leaderboardScreen");
const leaderboardList = document.getElementById("leaderboardList");
const closeLeaderboardButton = document.getElementById("closeLeaderboardButton");

let playerName = ""

let snake;
let score;
let direction;
let nextDirection;
let food;
let isGameOver;
let timerId;

function endGame() {
    isGameOver = true;
    clearInterval(timerId);
    goScreen.classList.remove("hidden");
}


function startGame() {
    snake = [{"x": 0, "y": 0}];
    direction = { "x": 0, "y": 0 };
    nextDirection = { "x": 0, "y": 0 };
    score = 0;
    isGameOver = false;
    goScreen.classList.add("hidden");

    food = createFood();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(gameLoop, GAME_SPEED)
}

function createFood() {
    let newFood;
    do {
        newFood = {x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    } while (snake.some(segment=> segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function gameLoop() {
    update();
    draw();
}

function draw() {
    context.clearRect(0, 0, canvas.clientWidth, canvas.height);

    context.fillStyle = "#fe34";
    context.fillRect(food.x*CELL_SIZE, food.y*CELL_SIZE, CELL_SIZE, CELL_SIZE);

    snake.forEach((segment, index) => {
        context.fillStyle = index === 0 ? "#09d681" : "#7552ad";
        context.fillRect(segment.x*CELL_SIZE, segment.y*CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function update() {
    if (isGameOver) return;
    if (nextDirection.x === 0 && nextDirection.y === 0) return;
    direction = nextDirection;
    const head = {"x": snake[0].x + direction.x, "y":  snake[0].y + direction.y}

    if (checkHeadCollision(head) || checkwallCollision(head)) {
        endGame();
        return;
    } 

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score+= 1;
        scoreElement.innerHTML = `<div id="score">Счет: ${score} </div>`
        food = createFood();
    } else {
    snake.pop(); }

}

function checkHeadCollision(head) {
    return snake.some(segment => segment.x === head.x && segment.y === head.y);
}

function checkwallCollision(head) {
    return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
}

function handleInput(event) {
    const key = event.key;
    if (key === "ArrowUp") nextDirection = {"x": 0, "y" : -1};
    if (key === "ArrowDown") nextDirection = {"x": 0, "y" : 1};
    if (key === "ArrowLeft") nextDirection = {"x": -1, "y" : 0};
    if (key === "ArrowRight") nextDirection = {"x": 1, "y" : 0};
}

window.addEventListener("keydown", handleInput);
restartButton.addEventListener("click", startGame);

startButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    playerName = name;
    startScreen.classList.add("hidden");
    startGame();
});


async function saveScore() {
    await fetch("/scores", {"method": "POST", "headers": {"Content-Type": "application/json"},"body": JSON.stringify({"name": playerName, "score": score}) } )
}

async function  getScore() {
    clearInterval(timerId);
    const response = await fetch("/scores");
    const rows = await response.json();
    leaderboardList.innerHTML = ""; rows.forEach(row => {
         const li = document.createElement("li"); li.textContent = row.name + " — " + row.score; leaderboardList.appendChild(li); });
          leaderboardScreen.classList.remove("hidden");
}

function closeLeaderboard() { leaderboardScreen.classList.add("hidden");
     if (playerName && !isGameOver) { timerId = setInterval(gameLoop, GAME_SPEED); } }

topButton.addEventListener("click", getScore);
 closeLeaderboardButton.addEventListener("click", closeLeaderboard);
startGame(); 