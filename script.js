// Configuración inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// Cargar imágenes
const player1Img = new Image();
player1Img.src = 'images/nave1.png';
const player2Img = new Image();
player2Img.src = 'images/nave2.png';
const enemyImg = new Image();
enemyImg.src = 'images/enemigo.png';

// Jugadores
const player1 = { 
    x: canvas.width / 2 - 150, 
    y: canvas.height - 120, 
    width: 100, 
    height: 100, 
    speed: 7, 
    bullets: [] 
};

const player2 = { 
    x: canvas.width / 2 + 50, 
    y: canvas.height - 120, 
    width: 100, 
    height: 100, 
    speed: 7, 
    bullets: [] 
};

// Enemigos
const enemies = [];
const enemyBullets = [];
const ENEMY_CONFIG = {
    width: 60,
    height: 60,
    rows: 4,
    cols: 10,
    padding: 10, // más juntos
    offsetTop: 60,
    speed: 1, // más lento
    shootChance: 0.015
};

// Crear formación de enemigos
for (let r = 0; r < ENEMY_CONFIG.rows; r++) {
    for (let c = 0; c < ENEMY_CONFIG.cols; c++) {
        enemies.push({
            x: c * (ENEMY_CONFIG.width + ENEMY_CONFIG.padding) + 150,
            y: r * (ENEMY_CONFIG.height + ENEMY_CONFIG.padding) + ENEMY_CONFIG.offsetTop,
            width: ENEMY_CONFIG.width,
            height: ENEMY_CONFIG.height,
            alive: true
        });
    }
}

// Teclado
const keys = {};

// Funciones de dibujo
function drawPlayer(player, img) {
    if (img.complete) {
        ctx.drawImage(img, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player === player1 ? 'lime' : 'cyan';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawBullets() {
    ctx.fillStyle = 'white';
    [player1, player2].forEach(player => {
        player.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 5, 15);
            bullet.y -= 8;
        });
        player.bullets = player.bullets.filter(b => b.y > 0);
    });

    ctx.fillStyle = '#ff5555';
    enemyBullets.forEach((bullet, i) => {
        ctx.fillRect(bullet.x, bullet.y, 8, 20);
        bullet.y += 6;
        if (bullet.y > canvas.height) enemyBullets.splice(i, 1);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            if (enemyImg.complete) {
                ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        }
    });
}

// Movimiento
function movePlayer() {
    if (keys['a'] && player1.x > 0) player1.x -= player1.speed;
    if (keys['d'] && player1.x < canvas.width - player1.width) player1.x += player1.speed;

    if (keys['ArrowLeft'] && player2.x > 0) player2.x -= player2.speed;
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width) player2.x += player2.speed;
}

function moveEnemies() {
    let changeDirection = false;
    const margin = 50;

    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        enemy.x += ENEMY_CONFIG.speed * (changeDirection ? -1 : 1);
        
        if (enemy.x <= margin || enemy.x >= canvas.width - enemy.width - margin) {
            changeDirection = true;
        }
    });

    if (changeDirection) {
        enemies.forEach(enemy => {
            if (enemy.alive) enemy.y += 15; // bajan más lento
        });
        ENEMY_CONFIG.speed *= -1;
    }
}

// Disparos
function shoot(player) {
    player.bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y
    });
}

function handleEnemyShooting() {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0 || Math.random() > ENEMY_CONFIG.shootChance) return;

    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 4,
        y: shooter.y + shooter.height
    });
}

// Eventos
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') shoot(player1);
    if (e.key === '0') shoot(player2);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveEnemies();
    handleEnemyShooting();
    
    drawEnemies();
    drawPlayer(player1, player1Img);
    drawPlayer(player2, player2Img);
    drawBullets();

    requestAnimationFrame(gameLoop);
}

// Inicio
gameLoop();
