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
        lastHitTime: 0,
        active: true
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
        lastHitTime: 0,
        active: true
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

// Inicializar enemigos
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
let gameRunning = true;

// Animación enemigos
let enemyFrame = 0;
const totalEnemyFrames = 2;
const enemyFrameWidth = 128;
const enemyFrameHeight = 128;
let enemyAnimTimer = 0;
const enemyAnimSpeed = 200;

// Funciones principales
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
    if (player.active && !player.invulnerable && isColliding(bullet, player)) {
        player.lives--;
        player.invulnerable = true;
        player.lastHitTime = currentTime;
        if (player.lives <= 0) player.active = false;
        return true;
    }
    return false;
}

function updatePlayerStatus(player) {
    if (player.invulnerable && Date.now() - player.lastHitTime > 2000) {
        player.invulnerable = false;
    }
}

function drawPlayer(player, img) {
    if (!player.active) return;
    
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
        if (!player.active) return;
        player.bullets.forEach((bullet, bIndex) => {
            ctx.fillRect(bullet.x, bullet.y, 5, 15);
            bullet.y -= 8;

            // Colisión con enemigos
            enemies.forEach(enemy => {
                if (enemy.alive && isColliding(bullet, enemy)) {
                    enemy.alive = false;
                    player.bullets.splice(bIndex, 1);
                }
            });
        });
        player.bullets = player.bullets.filter(b => b.y > 0);
    });

    // Balas enemigos
    ctx.fillStyle = '#ff5555';
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        ctx.fillRect(bullet.x, bullet.y, 8, 20);
        bullet.y += 6;

        let bulletHit = false;
        Object.values(players).forEach(player => {
            if (checkPlayerHit(player, bullet)) bulletHit = true;
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
    ctx.textAlign = 'left';
    
    // Jugador 1
    if (players.player1.active) {
        ctx.fillText(`Vidas P1: ${players.player1.lives}`, 20, 30);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillText('P1 ELIMINADO', 20, 30);
        ctx.fillStyle = 'white';
    }
    
    // Jugador 2
    if (players.player2.active) {
        ctx.fillText(`Vidas P2: ${players.player2.lives}`, canvas.width - 150, 30);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillText('P2 ELIMINADO', canvas.width - 150, 30);
        ctx.fillStyle = 'white';
    }
}

function drawGameOver() {
    // Fondo semitransparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto centrado
    ctx.fillStyle = 'red';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 40);
    
    // Instrucción
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.fillText('Presiona F5 para reiniciar', canvas.width/2, canvas.height/2 + 40);
    
    // Resetear configuración
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function movePlayer() {
    if (players.player1.active) {
        if (keys['a'] && players.player1.x > 0) players.player1.x -= players.player1.speed;
        if (keys['d'] && players.player1.x < canvas.width - players.player1.width) players.player1.x += players.player1.speed;
    }

    if (players.player2.active) {
        if (keys['ArrowLeft'] && players.player2.x > 0) players.player2.x -= players.player2.speed;
        if (keys['ArrowRight'] && players.player2.x < canvas.width - players.player2.width) players.player2.x += players.player2.speed;
    }
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

    if (changeDirection) ENEMY_CONFIG.speed *= -1;
}

function shoot(player) {
    if (!player.active || !player.canShoot) return;
    player.bullets.push({ x: player.x + player.width/2 - 2.5, y: player.y });
    player.canShoot = false;
    setTimeout(() => player.canShoot = true, 300);
}

function handleEnemyShooting() {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0 || Math.random() > ENEMY_CONFIG.shootChance) return;
    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    enemyBullets.push({ x: shooter.x + shooter.width/2 - 4, y: shooter.y + shooter.height });
}

// Eventos
window.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    keys[e.key] = true;
    if (e.key === ' ' && players.player1.active) shoot(players.player1);
    if (e.key === '0' && players.player2.active) shoot(players.player2);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Bucle principal
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizar
    Object.values(players).forEach(updatePlayerStatus);
    movePlayer();
    moveEnemies();
    handleEnemyShooting();

    // Dibujar
    drawEnemies();
    drawPlayer(players.player1, player1Img);
    drawPlayer(players.player2, player2Img);
    drawBullets();
    drawHUD();

    // Animación enemigos
    enemyAnimTimer += 16;
    if (enemyAnimTimer >= enemyAnimSpeed) {
        enemyFrame = (enemyFrame + 1) % totalEnemyFrames;
        enemyAnimTimer = 0;
    }

    // Verificar fin del juego
    if (!players.player1.active && !players.player2.active) {
        gameRunning = false;
        drawGameOver();
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Iniciar
gameLoop();