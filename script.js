const canvas = document.getElementById('gameCanvas');
const gameCanvasContainer = document.getElementById('gameCanvasContainer');
const ctx = canvas.getContext('2d');
const playerNameInput = document.getElementById('playerName');
const difficultySelect = document.getElementById('difficulty');
const startGameButton = document.getElementById('startGame');
const okButton = document.getElementById('ok-button')
const scoreList = document.getElementById('scoreList');
const messageElement = document.getElementById('message');
const form = document.getElementById('gameForm');
const mazeContainer = document.getElementById('mazeContainer');
const leaderboardContainer = document.getElementById('leaderboardContainer');
const leaderboardList = document.getElementById('leaderboard');
const gameoverMessage = document.getElementById('gameoverMessage');
const instpage= document.getElementById('instructionMessage');
const levelcompletedMessage = document.getElementById('levelcompletedMessage')
const gameAudio = document.getElementById('gameAudio');
const killingAudio = document.getElementById('killing_Audio');
const player1  = document.getElementById('player');
let sessionStartTime;
const coinaudio = document.getElementById('coinAudio')
const instructions = document.getElementById('instructions');  // added
//const gameContainer = document.getElementById('Container');  // added


function playGameAudio() {
    gameAudio.currentTime = 0; 
    gameAudio.play(); 
}

function playcoinAudio(){
    coinaudio.currentTime=0.1;
    coinaudio.play();
}

function playkill(){
    killingAudio.currentTime = 0.2;
    killingAudio.play();
}


function stopGameAudio() {
    gameAudio.pause(); 
}


let playerName, maze, player, chaser, goal, score;
const mazeSize = { easy: 10, medium: 15, hard: 20 };
const cellSize = 20;

const forestImage = new Image();
forestImage.src = 'pics/forest.png';
forestImage.onload = () => {
    startGameButton.disabled = false; 
    console.log("image found");
};

const grassImage = new Image();
grassImage.src = 'pics/grass.png';
grassImage.onload = () => {
    startGameButton.disabled = false; 
    console.log("image found");
};

const jewelImage = new Image();
jewelImage.src = 'pics/jewel.png';
jewelImage.onload = () => {
    startGameButton.disabled = false; 
    console.log("image found");
};

const characterImage = new Image();
characterImage.src = 'pics/character.png';
characterImage.onload = () => {
    startGameButton.disabled = false; 
    console.log("image found");
};

const character1Image = new Image();
character1Image.src = 'pics/character1.png';
character1Image.onload = () => {
    startGameButton.disabled = false; 
    console.log("image found");
};

const coinImage = new Image();
coinImage.src = 'pics/coin.png';
coinImage.onload = () => {
    startGameButton.disabled = false;
    console.log("Coin image loaded");
};

let coins = [];

function generateCoins(numCoins) {
    coins = [];
    for (let i = 0; i < numCoins; i++) {
        let position = getRandomPosition(maze);
        coins.push(position);
    }
}


class Maze {
    constructor(size) {
        this.size = size;
        this.grid = Array.from({ length: size }, () => Array(size).fill(1));
        this.visited = Array.from({ length: size }, () => Array(size).fill(false));
        this.stack = [];
        this.generateMaze(0, 0);
    }

    generateMaze(x, y) {
        const directions = [
            [0, -1], 
            [1, 0],  
            [0, 1],  
            [-1, 0]  
        ];  
        
        this.visited[y][x] = true;
        this.grid[y][x] = 0;
        this.stack.push([x, y]);
    
        while (this.stack.length > 0) {
            const [cx, cy] = this.stack[this.stack.length - 1];
            let found = false;
    
            directions.sort(() => Math.random() - 0.5);
    
            for (const [dx, dy] of directions) {
                const nx = cx + dx;
                const ny = cy + dy;
    
                if (nx >= 0 && ny >= 0 && nx < this.size && ny < this.size && !this.visited[ny][nx]) {
                    if (this.countVisitedNeighbours(nx, ny) < 2) {
                        this.visited[ny][nx] = true;
                        this.grid[ny][nx] = 0;
                        this.stack.push([nx, ny]);
                        found = true;
                        break; 
                    }
                }
            }
    
            if (!found) {
                this.stack.pop();
            }
        }
        this.grid[this.size - 1][this.size - 1] = 0;
        this.grid[this.size - 2][this.size - 1] = 0;
        this.grid[this.size - 1][this.size - 2] = 0;
    }
    

    countVisitedNeighbours(x, y) {
        const directions = [
            [0, -1],
            [1, 0],  
            [0, 1],  
            [-1, 0]  
        ];
        return directions.reduce((count, [dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            return count + (nx >= 0 && ny >= 0 && nx < this.size && ny < this.size && this.visited[ny][nx] ? 1 : 0);
        }, 0);
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 1) {
                    ctx.drawImage(forestImage, j * cellSize, i * cellSize, cellSize, cellSize);
                } else {
                    ctx.drawImage(grassImage, j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
        
        ctx.drawImage(jewelImage, goal.x * cellSize, goal.y * cellSize, cellSize, cellSize);

        coins.forEach(coin => {
            ctx.drawImage(coinImage, coin.x * cellSize, coin.y * cellSize, cellSize, cellSize);
        });
    }
}

class Player {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x * cellSize + cellSize / 2, this.y * cellSize + cellSize / 2);
        switch (this.direction) {
            case 'up':
                ctx.rotate(Math.PI);
                break;
            case 'left':
                ctx.rotate(Math.PI / 2);
                break;
            case 'right':
                ctx.rotate(-Math.PI / 2);
                break;
        }
        ctx.drawImage(characterImage, -cellSize / 2, -cellSize / 2, cellSize, cellSize);
        ctx.restore();
    }
    move(dx, dy) {
        if (this.x + dx >= 0 && this.x + dx < maze.size && this.y + dy >= 0 && this.y + dy < maze.size) {
            if (maze.grid[this.y + dy][this.x + dx] === 0) {
                this.x += dx;
                this.y += dy;
                if (dx === 1) this.direction = 'right';
                else if (dx === -1) this.direction = 'left';
                else if (dy === 1) this.direction = 'down';
                else if (dy === -1) this.direction = 'up';
            }
        }
    }
}

class Chaser extends Player {
    constructor(x, y) {
        super(x, y);
        this.moveCounter = 0;
    }

    chase(target) {
        this.moveCounter++;
        if (this.moveCounter % 10 !== 0) {
            return; 
        }
        const path = this.findPath(target);
        if (path.length > 1) {
            const [nextX, nextY] = path[1];
            this.move(nextX - this.x, nextY - this.y);
        }
    }

    findPath(target) {
        const queue = [[this.x, this.y]];
        const visited = Array.from({ length: maze.size }, () => Array(maze.size).fill(false));
        const parent = Array.from({ length: maze.size }, () => Array(maze.size).fill(null));

        visited[this.y][this.x] = true;

        const directions = [
            [0, 1], 
            [1, 0],  
            [0, -1],
            [-1, 0]  
        ];

        while (queue.length > 0) {
            const [cx, cy] = queue.shift();

            if (cx === target.x && cy === target.y) {
                let path = [];
                let current = [cx, cy];
                while (current) {
                    path.push(current);
                    current = parent[current[1]][current[0]];
                }
                path.reverse();
                return path;
            }

            for (const [dx, dy] of directions) {
                const nx = cx + dx;
                const ny = cy + dy;

                if (nx >= 0 && nx < maze.size && ny >= 0 && ny < maze.size && maze.grid[ny][nx] === 0 && !visited[ny][nx]) {
                    queue.push([nx, ny]);
                    visited[ny][nx] = true;
                    parent[ny][nx] = [cx, cy];
                }
            }
        }

        return [[this.x, this.y]];
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    draw() {
        ctx.drawImage(character1Image, this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    }

    canMove(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        return newX >= 0 && newX < maze.size && newY >= 0 && newY < maze.size && maze.grid[newY][newX] === 0;
    }
}


function checkCoinCollection() {
    for (let i = 0; i < coins.length; i++) {
        if (player.x === coins[i].x && player.y === coins[i].y) {
            playcoinAudio()
            coins.splice(i, 1);
            score += 10; 
            break;
        }
    }
}

function getRandomPosition(maze) {
    let x, y;
    do {
        x = Math.floor(Math.random() * maze.size);
        y = Math.floor(Math.random() * maze.size);
    } while (maze.grid[y][x] !== 0);
    return { x, y };
}

function initGame() {
    mazeContainer.classList.remove('hide');
    leaderboardContainer.classList.add('hide');
    playerName = playerNameInput.value;
    let size = mazeSize[difficultySelect.value];
    canvas.width = canvas.height = size * cellSize;
    maze = new Maze(size);
    player = new Player(0, 0, 'blue');
    goal = { x: size - 1, y: size - 1 };
    let chaserPosition = getRandomPosition(maze);
    chaser = new Chaser(chaserPosition.x, chaserPosition.y, 'red');
    score = 0;
    if(difficultySelect.value==="easy"){
        generateCoins(5); 
    }
    else if(difficultySelect.value==="medium"){
        generateCoins(8); 
    }
    else if(difficultySelect.value==="hard"){
        generateCoins(12); 
    }
    maze.draw();
    player.draw();
    chaser.draw();
    scoreList.classList.add('hide');
    messageElement.textContent = '';
    form.classList.add('hide');
    canvas.focus();

}

function updateScore() {
    leaderboardList.innerHTML = '';
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.sort((a, b) => b.score - a.score);
    scores.slice(0, 10).forEach((score, index) => {
        let li = document.createElement('li');
        li.textContent = `${index + 1}. ${score.name}: ${score.score}`;
        leaderboardList.appendChild(li);
    });
}

function saveScore() {
    let scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ name: playerName, score: score, session: sessionStartTime });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('scores', JSON.stringify(scores));
}

function advanceLevel() {
    if (difficultySelect.value === 'easy') {
        difficultySelect.value = 'medium';
        levelCompleted("Congo!!, You completed this level");
        return;
    } else if (difficultySelect.value === 'medium') {
        difficultySelect.value = 'hard';
        levelCompleted("Congo!!, You completed this level");
        return;
    } else {
        stopGameAudio();
        gameOver('You completed all levels!');
        stopGameAudio();
        return;
    }

}
function levelCompleted(message){
    levelcompletedMessage.textContent = message;
    levelcompletedMessage.classList.add('show'); 
    setTimeout(() => {
        levelcompletedMessage.classList.remove('show');
        mazeContainer.classList.add('hide');
        initGame();
        gameLoop();
    },2000);
}

function gameOver(message) {
    setTimeout(()=>{
        gameoverMessage.textContent = message;
        gameoverMessage.classList.add('show');
    },500)
    setTimeout(() => {
        gameoverMessage.classList.remove('show');
        leaderboardContainer.classList.remove('hide');
        mazeContainer.classList.add('hide');
        updateScore();
    }, 2000);
    saveScore();
    stopGameAudio();
}

function gameLoop() {
    //resizeCanvas();
    maze.draw();
    player.draw();
    chaser.chase(player);
    chaser.draw();
    checkCoinCollection();
    if (player.x === chaser.x && player.y === chaser.y) {
        playkill();
        gameOver('Caught by the chaser!');
        stopGameAudio();
        
    } else if (player.x === goal.x && player.y === goal.y) {
        advanceLevel();
        stopGameAudio();
        score+=50;
        setTimeout( ()=>{
            playGameAudio();
        },2000);
        
    } else {
        setTimeout(gameLoop, 200);
    }
}



document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
    }
    e.preventDefault();
    switch (e.key) {
        case 'ArrowUp': player.move(0, -1); break;
        case 'ArrowDown': player.move(0, 1); break;
        case 'ArrowLeft': player.move(-1, 0); break;
        case 'ArrowRight': player.move(1, 0); break;
    }
});

// function resizeCanvas() {
//     canvas.width = gameCanvasContainer.clientWidth;
//     canvas.height = gameCanvasContainer.clientHeight;
//     cellSize = canvas.width / maze.size;
//     if (maze) {
//         maze.draw();
//         player.draw();
//         chaser.draw();
//     }
// }

// window.addEventListener('resize', resizeCanvas);
// resizeCanvas();

startGameButton.addEventListener('click',()=>{
    gameCanvasContainer.classList.add('hide');
    mazeContainer.classList.add('hide');
    leaderboardContainer.classList.add('hide');
    document.getElementById('instructions').classList.remove('hide');
    scoreList.classList.add('hide');
    messageElement.textContent = '';
    form.classList.add('hide');
    canvas.focus();
})

okButton.addEventListener('click', () => {
    document.getElementById('instructions').classList.add('hide');
    gameCanvasContainer.classList.remove('hide');
    playerName = playerNameInput.value;
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }

        sessionStartTime = Date.now();
        initGame();
        gameLoop();
        playGameAudio();

    
});
// function clearLeaderboard() {
//     localStorage.removeItem('scores');
//     updateScore();
// }
clearLeaderboard();
updateScore();

