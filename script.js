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

const enemySprite = new Image();
enemySprite.src = 'images/EnemigoAnim.png';

// Jugadores
const players = {
    player1: {
        x: canvas.width / 2 - 150,
        y: canvas.height - 120,
        width: 100,
        height: 100,
        speed: 7,
        bullets: [],
        canShoot: true,
        lives: 3,
        invulnerable: false,
        lastHitTime: 0
    },
    player2: {
        x: canvas.width / 2 + 50,
        y: canvas.height - 120,
        width: 100,
        height: 100,
        speed: 7,
        bullets: [],
        canShoot: true,
        lives: 3,
        invulnerable: false,
        lastHitTime: 0
    }
};

// Enemigos
const enemies = [];
const enemyBullets = [];
const ENEMY_CONFIG = {
    width: 60,
    height: 60,
    rows: 4,
    cols: 10,
    padding: 5,
    offsetTop: 60,
    speed: 0.5,
    shootChance: 0.015
};

// Crear enemigos
for (let r = 0; r < ENEMY_CONFIG.rows; r++) {
    for (let c = 0; c < ENEMY_CONFIG.cols; c++) {
        enemies.push({
            x: c * (ENEMY_CONFIG.width + ENEMY_CONFIG.padding) + 200,
            y: r * (ENEMY_CONFIG.height + ENEMY_CONFIG.padding) + ENEMY_CONFIG.offsetTop,
            width: ENEMY_CONFIG.width,
            height: ENEMY_CONFIG.height,
            alive: true
        });
    }
}

// Teclado
const keys = {};

// Animación enemigos
let enemyFrame = 0;
const totalEnemyFrames = 2;
const enemyFrameWidth = 128;
const enemyFrameHeight = 128;
let enemyAnimTimer = 0;
const enemyAnimSpeed = 200;

// Estado del juego
let gameRunning = true;

// Funciones auxiliares
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function checkPlayerHit(player, bullet) {
    const currentTime = Date.now();
    if (!player.invulnerable && isColliding(bullet, player)) {
        player.lives--;
        player.invulnerable = true;
        player.lastHitTime = currentTime;
        return true;
    }
    return false;
}

function updateInvulnerability(player) {
    const currentTime = Date.now();
    if (player.invulnerable && currentTime - player.lastHitTime > 2000) {
        player.invulnerable = false;
    }
}

// Funciones de dibujo
function drawPlayer(player, img) {
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    if (img.complete) {
        ctx.drawImage(img, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player === players.player1 ? 'lime' : 'cyan';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
    ctx.globalAlpha = 1.0;
}

function drawBullets() {
    // Balas jugadores
    ctx.fillStyle = 'white';
    Object.values(players).forEach(player => {
        player.bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, 5, 15);
            bullet.y -= 8;
        });
        player.bullets = player.bullets.filter(b => b.y > 0);
    });

    // Balas enemigos
    ctx.fillStyle = '#ff5555';
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        ctx.fillRect(bullet.x, bullet.y, 8, 20);
        bullet.y += 6;

        // Colisión con jugadores
        let bulletHit = false;
        Object.values(players).forEach(player => {
            if (checkPlayerHit(player, bullet)) {
                bulletHit = true;
            }
        });

        if (bulletHit || bullet.y > canvas.height) {
            enemyBullets.splice(i, 1);
        }
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.drawImage(
                enemySprite,
                0, enemyFrame * enemyFrameHeight,
                enemyFrameWidth, enemyFrameHeight,
                enemy.x, enemy.y,
                enemy.width, enemy.height
            );
        }
    });
}

function drawHUD() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Vidas P1: ${players.player1.lives}`, 20, 30);
    ctx.fillText(`Vidas P2: ${players.player2.lives}`, canvas.width - 150, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    ctx.textAlign = 'left';
}

// Movimiento
function movePlayer() {
    if (keys['a'] && players.player1.x > 0) players.player1.x -= players.player1.speed;
    if (keys['d'] && players.player1.x < canvas.width - players.player1.width) players.player1.x += players.player1.speed;

    if (keys['ArrowLeft'] && players.player2.x > 0) players.player2.x -= players.player2.speed;
    if (keys['ArrowRight'] && players.player2.x < canvas.width - players.player2.width) players.player2.x += players.player2.speed;
}

function moveEnemies() {
    let changeDirection = false;
    const margin = 20;

    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        const nextX = enemy.x + ENEMY_CONFIG.speed;
        if (nextX <= margin || nextX + enemy.width >= canvas.width - margin) {
            changeDirection = true;
        }
    });

    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        if (changeDirection) {
            enemy.y += 10;
        } else {
            enemy.x += ENEMY_CONFIG.speed;
        }
    });

    if (changeDirection) {
        ENEMY_CONFIG.speed *= -1;
    }
}

// Disparos
function shoot(player) {
    if (!player.canShoot) return;

    player.bullets.push({
        x: player.x + player.width / 2 - 2.5,
        y: player.y
    });

    player.canShoot = false;
    setTimeout(() => player.canShoot = true, 1000);
}

function handleEnemyShooting() {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0 || Math.random() > ENEMY_CONFIG.shootChance) return;

    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 4,
        y: shooter.y + shooter.height,
        width: 8,
        height: 20
    });
}

// Eventos
window.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    keys[e.key] = true;
    if (e.key === ' ') shoot(players.player1);
    if (e.key === '0') shoot(players.player2);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar estado
    Object.values(players).forEach(player => {
        updateInvulnerability(player);
    });

    // Dibujar elementos
    drawHUD();
    movePlayer();
    moveEnemies();
    handleEnemyShooting();

    drawEnemies();
    drawPlayer(players.player1, player1Img);
    drawPlayer(players.player2, player2Img);
    drawBullets();

    // Animación enemigos
    enemyAnimTimer += 16;
    if (enemyAnimTimer >= enemyAnimSpeed) {
        enemyFrame = (enemyFrame + 1) % totalEnemyFrames;
        enemyAnimTimer = 0;
    }

    // Verificar game over
    if (players.player1.lives <= 0 || players.player2.lives <= 0) {
        gameRunning = false;
        drawGameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Iniciar juego
gameLoop();