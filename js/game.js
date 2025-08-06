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
    powerups:{
        rapid: null,
        shield: null,
        speed: null
    }
}

//Load Images
function loadImages(){
    return new Promise((resolve) => {
        let imagesLoaded = 0;
        const totalImages = 7; // player + enemy 03 + powerup 03 + bullet

        // load player image
        images.players = new Image();
        images.players.src = 'assets/images/player.png';
        images.players.onload = () => {
            imagesLoaded++;
            if(imagesLoaded === totalImages) resolve();
        };

        // load bullet image
        images.bullet = new Image();
        images.bullet.src = 'assets/images/bullet.png';
        images.bullet.onload = () => {
            imagesLoaded++;
            if(imagesLoaded === totalImages) resolve();
        };

        //Load enemy images
        for(let i = 0; i<3; i++){
            images.enemies[i] = new Image();
            images.enemies[i].src = `assts/images/enemy${i+1}.png`;
            images.enemies[i].onload = () => {
                imagesLoaded++;
                if(imagesLoaded === totalImages) resolve();
            };
        }

        //Load powerup images
        images.powerups.rapid = new Image();
        images.powerups.rapid.src = 'assets/images/rapid-powerup.png';
        images.powerups.rapid.onload = () => {
            imagesLoaded++;
            if(imagesLoaded === totalImages) resolve();
        };

        images.powerups.shield = new Image();
        images.powerups.shield.src = 'assets/images/shield-powerup.png';
        images.powerups.shield.onload = () => {
            imagesLoaded++;
            if(imagesLoaded === totalImages) resolve();
        }

        images.powerups.speed = new Image();
        images.powerups.speed.src = 'assets/images/speed-powerup.png';
        images.powerups.speed.onload = () => {
            imagesLoaded++;
            if(imagesLoaded === totalImages) resolve();
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

    draw(){
        if(images.players){
            ctx.save();
            if(isPlayerInvulnerable){
                ctx.globalAlpha = 0.5;
            }

            if(activePowerups['shield']){
                ctx.shadowColor = 'rgba(0, 255, 255, 0.7)';
                ctx.shadowBlur = 20;
            }

            ctx.drawImage(
                images.players,
                this.x - this.width/2,
                this.y - this.height/2,
                this.width,
                this.height
            );

            ctx.restore();

        } else{
            ctx.fillStyle = isPlayerInvulnerable ? 'rgba(0, 255, 170, 0.5)' : '#0fa'; 
        }
    },

    update(){},

    shoot(){},

    takeDamage(amount){},

    addPowerup(type, duration){},

    removePowerup(type){},
};

function draw(){}
function update(){}

//resize canvas to fit container
function resizeCanvas(){
    const container = document.querySelector('.canvas-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    //Reposition player
    if(gameRunning) {
        //player
    }
}

//initialize game
async function init(){
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    //set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    await loadImages();
}

window.addEventListener('load', init);