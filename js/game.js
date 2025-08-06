//Game Constants
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 650;
const PLAYER_SPEED = 7;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 3;
const POWER_SPAWN_RATE = 0.03;
const LEVEL_SCORE_INCREMENT = 1500;
const PLAYER_INVULNERABILITY_TIME = 2000;

//GAME VARIABLES
let canvas, ctx;
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let playerHealth = 100;
let playerPower = 0;
let enemies = [];
let bullets = [];
let powerUps = [];

let keys = {};
let lastTime = 0;
let enemySpawnRate = 60;
let frameCount = 0;
let activePowerups = {};

let lastHitTime = 0;
let isPlayerInvulnerable = false;
let invulnerabilityTimer = 0;

// Game images
const images = {
    players: null,
    enemies: [],
    bullet: null,
    powerups: {
        rapid: null,
        shield: null,
        speed: null
    }
}

//Load Images
function loadImages() {
    return new Promise((resolve) => {
        let imagesLoaded = 0;
        const totalImages = 7; // player + enemy 03 + powerup 03 + bullet

        // load player image
        images.players = new Image();
        images.players.src = 'assets/images/player.png';
        images.players.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) resolve();
        };

        // load bullet image
        images.bullet = new Image();
        images.bullet.src = 'assets/images/bullet.png';
        images.bullet.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) resolve();
        };

        //Load enemy images
        for (let i = 0; i < 3; i++) {
            images.enemies[i] = new Image();
            images.enemies[i].src = `assts/images/enemy${i + 1}.png`;
            images.enemies[i].onload = () => {
                imagesLoaded++;
                if (imagesLoaded === totalImages) resolve();
            };
        }

        //Load powerup images
        images.powerups.rapid = new Image();
        images.powerups.rapid.src = 'assets/images/rapid-powerup.png';
        images.powerups.rapid.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) resolve();
        };

        images.powerups.shield = new Image();
        images.powerups.shield.src = 'assets/images/shield-powerup.png';
        images.powerups.shield.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) resolve();
        }

        images.powerups.speed = new Image();
        images.powerups.speed.src = 'assets/images/speed-powerup.png';
        images.powerups.speed.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) resolve();
        }

    });
}

//player object
const player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    width: 60,
    height: 80,
    speed: PLAYER_SPEED,
    lastShot: 0,
    shootDelay: 300,

    draw() {
        if (images.players) {
            ctx.save();
            if (isPlayerInvulnerable) {
                ctx.globalAlpha = 0.5;
            }

            if (activePowerups['shield']) {
                ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
                ctx.shadowBlur = 20;
            }

            ctx.drawImage(
                images.players,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );

            ctx.restore();

        } else {
            ctx.fillStyle = isPlayerInvulnerable ? 'rgba(0, 255, 170, 0.5)' : '#0fa';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.height / 2);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
            ctx.closePath();
            ctx.fill();
        }

        if (activePowerups['shield']) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
            ctx.stroke();
        }
    },

    update() { },

    shoot() { },

    takeDamage(amount) { },

    addPowerup(type, duration) { },

    removePowerup(type) { },
};

function draw() { }
function update() { }

function startGame() {
    //reset game state
    score = 0;
    level = 1;
    playerHealth = 100;
    playerPower = 0;
    enemies = [];
    powerUps = [];
    bullets = [];
    activePowerups = {};
    enemySpawnRate = 60;

    //reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.speed = PLAYER_SPEED;
    player.shootDelay = 300;

    //update ui
    updateScore();
    updateLevel();
    updateHealtBar();
    updatePowerBar();
    updatePowerupsList();

    gameRunning = true;
    gamePaused = false;

    document.getElementById('game-over').style.display = 'none';
    document.getElementById('level-up').style.display = 'none';

    //play game music
    audioManager.play('background');
}

//Toggle pause
function togglePause() {
    gamePaused = !gamePaused;

    if (gamePaused) {
        audioManager.stop('background');
        document.getElementById('pause-btn').textContent = 'RESUME';
    } else {
        audioManager.play('background');
        document.getElementById('pause-btn').textContent = 'PAUSE';
    }
}

function gameOver() {
    gameRunning = false;

    //show game over panel
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').style.display = 'block';

    audioManager.stop('background');
    audioManager.play('gameOver');
}

//levelup
function levelUp() {
    level++;
    enemySpawnRate = Math.max(20, enemySpawnRate - 5);

    document.getElementById('next-level').textContent = level;
    document.getElementById('level-up').style.display = 'block';

    audioManager.play('levelUp');

    setTimeout(() => {
        document.getElementById('level-up').style.display
            = 'none';
    }, 2000);

    updateLevel();
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLevel() {
    document.getElementById('level').textContent = level;
}

function updateHealtBar() {
    const healthBar = document.getElementById('health');
    healthBar.style.width = `${playerHealth}%`;
    healthBar.style.backgroundColor = playerHealth > 50 ?
        `hsl(${(playerHealth - 50) * 1.2}, 100%, 50%)` :
        `hsl(0, 100%, ${playerHealth}%)`;
}

function updatePowerBar() {
    document.getElementById('power').style.width = `${playerPower}%`
}

function updatePowerupsList() {
    const powerupsList = document.getElementById('powerups-list');
    powerupsList.innerHTML = '';

    for (const type in activePowerups) {
        const div = document.createElement('div');
        div.className = 'powerups';

        switch (type) {
            case 'rapid':
                div.textContent = 'RAPID FIRE';
                break;
            case 'shield':
                div.textContent = 'SHIELD';
                break;
            case 'speed':
                div.textContent = 'SPEED BOOST';
                break;
        }

        //time remaining 
        const timeleft = Math.ceil((activePowerups[type].endtime - Date.now()) / 1000);
        const timeSpan = document.createElement('span');
        timeSpan.textContent = `(${timeleft}s)`;
        timeSpan.style.fontSize = '0.8rem';
        timeSpan.style.opacity = '0.7';
        div.appendChild(timeSpan);
    }
}

//resize canvas to fit container
function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    //Reposition player
    if (gameRunning) {
        player.x = canvas.width / 2;
        player.y = canvas.height - 100;
    }
}

function gameLoop(timestamp) {
    if (!gamePaused) {
        const deltatime = timestamp - lastTime;
        lastTime = timestamp;
        update(deltatime);
    }
    draw();
    requestAnimationFrame(gameLoop);
}

//update game state
function update(deltatime) {
    if (!gameRunning) return;

    // update player
    player.update();

    // shoot when space is held
    if (keys[''] || keys['spacebar']) {
        player.shoot();
    }

    //spawn enemies
    frameCount++;
    if (frameCount % enemySpawnRate === 0) {
        spawnEnemy();
    }

    //spawn powerups randomly
    if (Math.random() < POWER_SPAWN_RATE) {
        spawnPowerup();
    }

    checkPowerupCollision();

    //update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;

        //remove bullets that are off screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }

        // check for bullet enemy collisions
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[i], enemies[j])) {
                //create explosion
                particleSystem.createExplosion(
                    enemies[j].x,
                    enemies[j].y,
                    enemies[j].color,
                    30
                );

                enemies.splice(j, 1);
                bullets.splice(i, 1);

                score += 100;
                updateScore();
                audioManager.play('explosion');

                playerPower = Math.min(100, playerPower + 5);
                updatePowerBar();
                break;
            }
        }
    }

    //update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;

        if (enemies[i].y > GAME_HEIGHT) {
            enemies.splice(i, 1);
            continue;
        }

        if (checkCollision(player, enemies[i])) {
            player.takeDamage(10);

            particleSystem.createExplosion(
                enemies[i].x,
                enemies[i].y,
                enemies[i].color,
                20
            );
            enemies.splice(i, 1);
            audioManager.play('explosion');
        }
    }

    //update powerups
    for (let i = powerUps.length - 1; i >= 0; 1--) { 
        powerUps[i].y += powerUps[i].speed;

        if(powerUps[i].y > GAME_HEIGHT){
            powerUps.splice(i, 1);
            continue;
        }

        if(checkCollision(player, powerUps[i])){
            const type = powerUps[i].type;
            player.addPowerup(type, 10000);
            powerUps.splice(i,1);
            audioManager.play('powerup');
        }
    }
    particleSystem.update();

    if(score >= level * LEVEL_SCORE_INCREMENT){
        levelUp;
    }
}

function draw(){}

//initialize game
async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    //set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    await loadImages();
}

window.addEventListener('load', init);