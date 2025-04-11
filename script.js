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
        width: 76,
        height: 76,
        speed: 7,
        bullets: [],
        canShoot: true,
        lives: 3,
        invulnerable: false,
        lastHitTime: 0,
        active: true,
        score: 0
    },
    player2: {
        x: canvas.width / 2 + 50,
        y: canvas.height - 120,
        width: 76,
        height: 76,
        speed: 7,
        bullets: [],
        canShoot: true,
        lives: 3,
        invulnerable: false,
        lastHitTime: 0,
        active: true,
        score: 0
    }
};

// Configuración de enemigos (100 enemigos: 10 filas x 10 columnas)
const enemies = [];
const enemyBullets = [];
const ENEMY_CONFIG = {
    width: 38,
    height: 38,
    rows: 10,
    cols: 20,
    padding: 2,
    offsetTop: 40,
    speed: 5,
    shootChance: 0.04
};

// Crear formación de enemigos
for (let r = 0; r < ENEMY_CONFIG.rows; r++) {
    for (let c = 0; c < ENEMY_CONFIG.cols; c++) {
        enemies.push({
            x: c * (ENEMY_CONFIG.width + ENEMY_CONFIG.padding) + 50,
            y: r * (ENEMY_CONFIG.height + ENEMY_CONFIG.padding) + ENEMY_CONFIG.offsetTop,
            width: ENEMY_CONFIG.width,
            height: ENEMY_CONFIG.height,
            alive: true,
            row: r,
            col: c
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

// Funciones de utilidad
function isColliding(a, b) {
    return !(
        a.y + a.height < b.y ||
        a.y > b.y + b.height ||
        a.x + a.width < b.x ||
        a.x > b.x + b.width
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

// Funciones de dibujado
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
    ctx.fillStyle = 'white';
    Object.values(players).forEach(player => {
        if (!player.active) return;
        
        for (let i = player.bullets.length - 1; i >= 0; i--) {
            const bullet = player.bullets[i];
            ctx.fillRect(bullet.x, bullet.y, 5, 15);
            bullet.y -= 8;
        
            let hitEnemy = false;
            for (let j = 0; j < enemies.length; j++) {
                const enemy = enemies[j];
                
                if (enemy.alive && isColliding(
                    {x: bullet.x, y: bullet.y, width: 5, height: 15},
                    {x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height}
                )) {
                    enemy.alive = false;
                    hitEnemy = true;
                    player.score++;
                    
                    // Efecto visual
                    ctx.fillStyle = 'gold';
                    ctx.font = '16px Arial';
                    ctx.fillText('+1', enemy.x + enemy.width/2 - 10, enemy.y);
                    ctx.fillStyle = 'white';
                    
                    // Verificar si un jugador alcanzó 100 enemigos eliminados
                    if (player.score >= 100) {
                        let victoryText;
                        if (player === players.player1) {
                            victoryText = `¡GANA P1!\nHas eliminado 100 enemigos`;
                        } else {
                            victoryText = `¡GANA P2!\nHas eliminado 100 enemigos`;
                        }
                        
                        drawVictory(victoryText);
                        gameRunning = false;
                        return;
                    }
                    break;
                }
            }
        
            if (hitEnemy || bullet.y < 0) {
                player.bullets.splice(i, 1);
            }
        }
    });

    // Balas enemigas
    ctx.fillStyle = '#ff5555';
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        ctx.fillRect(bullet.x, bullet.y, 8, 20);
        bullet.y += 7;

        let hit = false;
        for (const playerKey in players) {
            const player = players[playerKey];
            if (checkPlayerHit(player, {
                x: bullet.x,
                y: bullet.y,
                width: 8,
                height: 20
            })) {
                hit = true;
                break;
            }
        }

        if (hit || bullet.y > canvas.height) {
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
                ENEMY_CONFIG.width, ENEMY_CONFIG.height
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
        ctx.fillText(`P1 Vidas: ${players.player1.lives}`, 20, 30);
        ctx.fillText(`P1 Puntos: ${players.player1.score}`, 20, 60);
    }

    // Jugador 2
    if (players.player2.active) {
        ctx.fillText(`P2 Vidas: ${players.player2.lives}`, canvas.width - 200, 30);
        ctx.fillText(`P2 Puntos: ${players.player2.score}`, canvas.width - 200, 60);
    }
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.fillText('Presiona F5 para reiniciar', canvas.width / 2, canvas.height / 2 + 40);
    ctx.textAlign = 'left';
}

function drawVictory(text) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'lime';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Dividir el texto en dos partes
    const lines = text.split("\n");
    ctx.fillText(lines[0], canvas.width / 2, canvas.height / 2 - 40);
    if (lines[1]) {
        ctx.fillText(lines[1], canvas.width / 2, canvas.height / 2 + 40);
    }
    
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.fillText('Presiona F5 para reiniciar', canvas.width / 2, canvas.height / 2 + 100);
    ctx.textAlign = 'left';
}




// Funciones de movimiento
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

let movingLeft = false;  // Inicializamos el movimiento hacia la derecha

function moveEnemies() {
    const margin = 20;
    let changeDirection = false;

    // Encontramos el enemigo más a la izquierda y el más a la derecha
    const aliveEnemies = enemies.filter(e => e.alive);
    
    if (aliveEnemies.length > 0) {
        const leftmost = aliveEnemies.reduce((min, e) => e.x < min.x ? e : min, aliveEnemies[0]);
        const rightmost = aliveEnemies.reduce((max, e) => e.x > max.x ? e : max, aliveEnemies[0]);

        // Si el enemigo más a la izquierda o el más a la derecha tocan los márgenes de la pantalla
        if (leftmost.x <= margin || rightmost.x + ENEMY_CONFIG.width >= canvas.width - margin) {
            changeDirection = true;
        }
    }

    // Si hay que cambiar de dirección, bajamos y alternamos la dirección
    if (changeDirection) {
        // Los enemigos bajan un poco
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += 10;  // Baja un poco
                // Después de bajar, movemos a la dirección contraria
                if (movingLeft) {
                    enemy.x += 10;  // Mueve a la derecha
                } else {
                    enemy.x -= 10;  // Mueve a la izquierda
                }
            }
        });

        // Alternar dirección para el siguiente ciclo
        movingLeft = !movingLeft;
    }

    // Mover los enemigos horizontalmente según la dirección actual
    enemies.forEach(enemy => {
        if (enemy.alive) {
            if (movingLeft) {
                enemy.x -= ENEMY_CONFIG.speed;  // Mueve hacia la izquierda
            } else {
                enemy.x += ENEMY_CONFIG.speed;  // Mueve hacia la derecha
            }
        }
    });
}

// Funciones de disparo
function shoot(player) {
    if (!player.active || !player.canShoot) return;
    player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
    player.canShoot = false;
    setTimeout(() => player.canShoot = true, 300);
}

function handleEnemyShooting() {
    const aliveEnemies = enemies.filter(e => e.alive);
    if (aliveEnemies.length === 0 || Math.random() > ENEMY_CONFIG.shootChance) return;
    const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    enemyBullets.push({ x: shooter.x + shooter.width / 2 - 4, y: shooter.y + shooter.height });
}

// Eventos de teclado
window.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    keys[e.key] = true;
    if (e.key === ' ' && players.player1.active) shoot(players.player1);
    if (e.key === '0' && players.player2.active) shoot(players.player2);
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Bucle principal del juego
// Bucle principal del juego
// Bucle principal del juego
// Bucle principal del juego
// Bucle principal del juego
function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Actualizamos el estado de los jugadores
    Object.values(players).forEach(updatePlayerStatus);
    movePlayer();
    moveEnemies();
    handleEnemyShooting();

    drawEnemies();
    drawPlayer(players.player1, player1Img);
    drawPlayer(players.player2, player2Img);
    drawBullets();
    drawHUD();

    // Comprobar si los enemigos llegaron a la altura de los jugadores
    if (enemies.some(enemy => enemy.alive && enemy.y + ENEMY_CONFIG.height >= players.player1.y)) {
        // Los enemigos han alcanzado a los jugadores, termina el juego
        let victoryText = determineWinner();
        drawVictory(victoryText);
        gameRunning = false;
        return;
    }

    // Verificar si un jugador ha muerto y terminar el juego si es necesario
    if (players.player1.lives <= 0 && players.player2.lives <= 0) {
        // Si ambos jugadores han muerto, empate
        let victoryText = `¡EMPATE! ${players.player1.score}-${players.player2.score}`;
        drawVictory(victoryText);
        gameRunning = false;
        return;
    }

    if (players.player1.lives <= 0) {
        // Si el jugador 1 ha muerto, gana el jugador 2
        let victoryText = `¡GANA P2! Puntos: ${players.player2.score}`;
        drawVictory(victoryText);
        gameRunning = false;
        return;
    }

    if (players.player2.lives <= 0) {
        // Si el jugador 2 ha muerto, gana el jugador 1
        let victoryText = `¡GANA P1! Puntos: ${players.player1.score}`;
        drawVictory(victoryText);
        gameRunning = false;
        return;
    }

    // Animación enemigos
    enemyAnimTimer += 16;
    if (enemyAnimTimer >= enemyAnimSpeed) {
        enemyFrame = (enemyFrame + 1) % totalEnemyFrames;
        enemyAnimTimer = 0;
    }

    requestAnimationFrame(gameLoop);
}

// Determinar el ganador o empate cuando los enemigos alcanzan la altura de los jugadores
function determineWinner() {
    if (players.player1.score > players.player2.score) {
        return `¡GANA P1! Puntos: ${players.player1.score}`;
    } else if (players.player2.score > players.player1.score) {
        return `¡GANA P2! Puntos: ${players.player2.score}`;
    } else {
        return `¡EMPATE! ${players.player1.score}-${players.player2.score}`;
    }
}

// Función para mover los enemigos
function moveEnemies() {
    const margin = 20;
    let changeDirection = false;

    // Encontramos el enemigo más a la izquierda y el más a la derecha
    const aliveEnemies = enemies.filter(e => e.alive);
    
    if (aliveEnemies.length > 0) {
        const leftmost = aliveEnemies.reduce((min, e) => e.x < min.x ? e : min, aliveEnemies[0]);
        const rightmost = aliveEnemies.reduce((max, e) => e.x > max.x ? e : max, aliveEnemies[0]);

        // Si el enemigo más a la izquierda o el más a la derecha tocan los márgenes de la pantalla
        if (leftmost.x <= margin || rightmost.x + ENEMY_CONFIG.width >= canvas.width - margin) {
            changeDirection = true;
        }
    }

    // Si hay que cambiar de dirección, bajamos y alternamos la dirección
    if (changeDirection) {
        // Los enemigos bajan un poco
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += 10;  // Baja un poco
                // Después de bajar, movemos a la dirección contraria
                if (movingLeft) {
                    enemy.x += 10;  // Mueve a la derecha
                } else {
                    enemy.x -= 10;  // Mueve a la izquierda
                }
            }
        });

        // Alternar dirección para el siguiente ciclo
        movingLeft = !movingLeft;
    }

    // Mover los enemigos horizontalmente según la dirección actual
    enemies.forEach(enemy => {
        if (enemy.alive) {
            if (movingLeft) {
                enemy.x -= ENEMY_CONFIG.speed;  // Mueve hacia la izquierda
            } else {
                enemy.x += ENEMY_CONFIG.speed;  // Mueve hacia la derecha
            }
        }
    });
}


// Iniciar juego
gameLoop();