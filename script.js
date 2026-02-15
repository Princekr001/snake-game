const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('3d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let score = 0;
let dx = 0;
let dy = 0;
let snake = [];
let food = { x: 10, y: 10 };
let gameRunning = false;
let gameSpeed = 100;
let lastGameTime = 0;

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.innerText = score;
    placeFood();
    gameRunning = false;
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
}

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    dx = 1; // Start moving right
    dy = 0;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    requestAnimationFrame(gameLoop);
}

function placeFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    // Ensure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            placeFood();
            break;
        }
    }
}

function drawRect(x, y, color, glow) {
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = glow;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    ctx.shadowBlur = 0;
}

function draw() {
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    drawRect(food.x, food.y, '#ff00ff', '#ff00ff');

    // Draw Snake
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        drawRect(segment.x, segment.y, '#00ff88', '#00ff88');
        
        // Eyes for the head
        if (isHead) {
            ctx.fillStyle = '#000';
            const headX = segment.x * GRID_SIZE;
            const headY = segment.y * GRID_SIZE;
            // distinct eyes based on direction
            // simple center eyes for now
            ctx.fillRect(headX + 4, headY + 4, 4, 4); 
            ctx.fillRect(headX + 12, headY + 4, 4, 4);
        }
    });
}

function moveInternal() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self Collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Eating Food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.innerText = score;
        placeFood();
        // Speed up slighty?
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop(currentTime) {
    if (!gameRunning) return;

    window.requestAnimationFrame(gameLoop);

    const secondsSinceLastRender = (currentTime - lastGameTime) / 1000;
    if (secondsSinceLastRender < 0.1) return; // Cap at ~10 FPS

    lastGameTime = currentTime;

    moveInternal();
    draw();
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) {
        if (e.code === 'Space' && !gameOverScreen.classList.contains('hidden')) {
            resetGame();
            startGame();
        } else if (!startScreen.classList.contains('hidden')) {
            startGame();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

resetGame();
draw();
