// Configuración inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// Cargar imágenes de las naves
const player1Img = new Image();
player1Img.src = 'images/nave1.png'; // Ruta a tu imagen para el jugador 1

const player2Img = new Image();
player2Img.src = 'images/nave2.png'; // Ruta a tu imagen para el jugador 2

// Configuración de las naves
let player1 = { 
    x: canvas.width / 2 - 25, 
    y: canvas.height - 120, 
    width: 100, 
    height: 100, 
    speed: 5, 
    bullets: [] 
};

let player2 = { 
    x: canvas.width / 2 - 25, 
    y: canvas.height - 120, 
    width: 100, 
    height: 100, 
    speed: 5, 
    bullets: [] 
};

// Teclas presionadas
const keys = {};

// Función para dibujar las naves
function drawPlayer(player, img) {
    if (img.complete) { // Verificar si la imagen está cargada
        ctx.drawImage(img, player.x, player.y, player.width, player.height);
    } else {
        // Si la imagen no está cargada, dibujar un rectángulo como respaldo
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

// Función para dibujar los disparos

function drawBullets() {
    // Dibujar disparos de player 1
    ctx.fillStyle = 'white';
    for (let i = 0; i < player1.bullets.length; i++) {
        ctx.fillRect(player1.bullets[i].x, player1.bullets[i].y, 5, 10);
        player1.bullets[i].y -= 5;
    }

    // Eliminar los disparos que salen del canvas para player 1
    player1.bullets = player1.bullets.filter(bullet => bullet.y > 0);

    // Dibujar disparos de player 2
    for (let i = 0; i < player2.bullets.length; i++) {
        ctx.fillRect(player2.bullets[i].x, player2.bullets[i].y, 5, 10);
        player2.bullets[i].y -= 5;
    }

    // Eliminar los disparos que salen del canvas para player 2
    player2.bullets = player2.bullets.filter(bullet => bullet.y > 0);

    // Dibujar disparos enemigos
    ctx.fillStyle = 'yellow'; // Color distintivo para disparos enemigos
    for (let i = 0; i < enemyBullets.length; i++) {
        ctx.fillRect(
            enemyBullets[i].x,
            enemyBullets[i].y,
            enemyBullets[i].width,
            enemyBullets[i].height
        );
        enemyBullets[i].y += enemyBullets[i].speed; // Mover hacia abajo

        // Eliminar disparos que salen del canvas
        if (enemyBullets[i].y > canvas.height) {
            enemyBullets.splice(i, 1);
            i--;
        }
    }
}

// Función para mover las naves
function movePlayer() {
    // Movimiento del primer jugador (Player 1)
    if (keys['a'] && player1.x > 0) {
        player1.x -= player1.speed;
    }
    if (keys['d'] && player1.x < canvas.width - player1.width) {
        player1.x += player1.speed;
    }

    // Movimiento del segundo jugador (Player 2)
    if (keys['ArrowLeft'] && player2.x > 0) {
        player2.x -= player2.speed;
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width) {
        player2.x += player2.speed;
    }
}

// Función para disparar
function shoot(player) {
    if (player === player1) {
        player1.bullets.push({ x: player1.x + player1.width / 2 - 2.5, y: player1.y });
    } else {
        player2.bullets.push({ x: player2.x + player2.width / 2 - 2.5, y: player2.y });
    }
}

// Manejo de eventos de teclado
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && player1.bullets.length === 0) {
        shoot(player1);
    }
    if (e.key === '0' && player2.bullets.length === 0) {
        shoot(player2);
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Función principal de animación
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    drawPlayer(player1, player1Img);
    drawPlayer(player2, player2Img);
    drawBullets();

    requestAnimationFrame(gameLoop);
}


// Configuración inicial (todo lo que ya tienes se mantiene igual)
// ... 

// --- Añade esto después de la configuración de los jugadores ---

// Configuración de los enemigos
const enemyImg = new Image();
enemyImg.src = 'images/enemigo.png'; // Ruta a tu imagen de enemigo

const enemies = [];
const enemyWidth = 60;
const enemyHeight = 60;
const enemyRows = 3;
const enemyCols = 8;
const enemyPadding = 20;
const enemyOffsetTop = 50;
const enemySpeed = 2;
let enemyDirection = 1; // 1 = derecha, -1 = izquierda

// Configuración de disparos enemigos
const enemyBullets = [];
const enemyShootInterval = 1000; // Disparan cada 1000ms (1 segundo)
let lastEnemyShootTime = 0;

// Crear enemigos en formación
for (let r = 0; r < enemyRows; r++) {
    for (let c = 0; c < enemyCols; c++) {
        enemies.push({
            x: c * (enemyWidth + enemyPadding) + 100,
            y: r * (enemyHeight + enemyPadding) + enemyOffsetTop,
            width: enemyWidth,
            height: enemyHeight,
            alive: true
        });
    }
}

// Función para dibujar enemigos
function drawEnemies() {
    ctx.fillStyle = 'red'; // Color de los enemigos (o usa imágenes como hiciste con las naves)
    enemies.forEach(enemy => {
        if (enemy.alive) {
            if (enemyImg.complete) {
                ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
            } else {
                ctx.fillStyle = 'red';
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            }
        }
    });
}

// Función para mover enemigos
function moveEnemies() {
    let edgeReached = false;

    // Verificar si algún enemigo toca el borde
    enemies.forEach(enemy => {
        if (enemy.alive && 
            (enemy.x + enemy.width >= canvas.width || enemy.x <= 0)) {
            edgeReached = true;
        }
    });

    // Cambiar dirección y bajar si tocan el borde
    if (edgeReached) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            if (enemy.alive) enemy.y += 20; // Bajar 20px
        });
    }

    // Mover enemigos horizontalmente
    enemies.forEach(enemy => {
        if (enemy.alive) enemy.x += enemySpeed * enemyDirection;
    });
}

// --- Modifica la función gameLoop para incluir enemigos ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveEnemies(); // <-- Añade esta línea
    drawPlayer(player1, player1Img);
    drawPlayer(player2, player2Img);
    drawEnemies(); // <-- Añade esta línea
    drawBullets();

    requestAnimationFrame(gameLoop);
}

// Función para que los enemigos disparen aleatoriamente
function handleEnemyShooting(timestamp) {
    if (timestamp - lastEnemyShootTime > enemyShootInterval) {
        const aliveEnemies = enemies.filter(enemy => enemy.alive);
        if (aliveEnemies.length > 0) {
            const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({
                x: randomEnemy.x + randomEnemy.width / 2 - 2.5,
                y: randomEnemy.y + randomEnemy.height,
                width: 5,
                height: 10,
                speed: 3
            });
        }
        lastEnemyShootTime = timestamp;
    }
}


// Iniciar la animación del juego
gameLoop();