// Configuración inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Configuración de las naves
let player1 = { x: canvas.width / 2 - 25, y: canvas.height - 70, width: 50, height: 50, color: 'lime', speed: 5, bullets: [] };
let player2 = { x: canvas.width / 2 - 25, y: canvas.height - 120, width: 50, height: 50, color: 'cyan', speed: 5, bullets: [] };

// Teclas presionadas
const keys = {};

// Función para dibujar las naves
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height); // Nave como un rectángulo
}

// Función para dibujar los disparos
function drawBullets() {
    // Dibujar disparos de player 1
    ctx.fillStyle = 'white';
    for (let i = 0; i < player1.bullets.length; i++) {
        ctx.fillRect(player1.bullets[i].x, player1.bullets[i].y, 5, 10); // Dibujar cada disparo
        player1.bullets[i].y -= 5; // Mover el disparo hacia arriba
    }

    // Eliminar los disparos que salen del canvas para player 1
    player1.bullets = player1.bullets.filter(bullet => bullet.y > 0);

    // Dibujar disparos de player 2
    for (let i = 0; i < player2.bullets.length; i++) {
        ctx.fillRect(player2.bullets[i].x, player2.bullets[i].y, 5, 10); // Dibujar cada disparo
        player2.bullets[i].y -= 5; // Mover el disparo hacia arriba
    }

    // Eliminar los disparos que salen del canvas para player 2
    player2.bullets = player2.bullets.filter(bullet => bullet.y > 0);
}

// Función para mover las naves
function movePlayer() {
    // Movimiento del primer jugador (Player 1)
    if (keys['a'] && player1.x > 0) {
        player1.x -= player1.speed; // Mover izquierda
    }
    if (keys['d'] && player1.x < canvas.width - player1.width) {
        player1.x += player1.speed; // Mover derecha
    }

    // Movimiento del segundo jugador (Player 2)
    if (keys['ArrowLeft'] && player2.x > 0) {
        player2.x -= player2.speed; // Mover izquierda
    }
    if (keys['ArrowRight'] && player2.x < canvas.width - player2.width) {
        player2.x += player2.speed; // Mover derecha
    }
}

// Función para disparar
function shoot(player) {
    if (player === player1) {
        player1.bullets.push({ x: player1.x + player1.width / 2 - 2.5, y: player1.y }); // Disparo desde el centro
    } else {
        player2.bullets.push({ x: player2.x + player2.width / 2 - 2.5, y: player2.y }); // Disparo desde el centro
    }
}

// Manejo de eventos de teclado
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && player1.bullets.length === 0) { // Dispara solo si no hay disparos activos
        shoot(player1);
    }
    if (e.key === '0' && player2.bullets.length === 0) { // Dispara solo si no hay disparos activos
        shoot(player2);
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Función principal de animación
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas

    movePlayer(); // Mover las naves
    drawPlayer(player1); // Dibujar el primer jugador
    drawPlayer(player2); // Dibujar el segundo jugador
    drawBullets(); // Dibujar los disparos

    requestAnimationFrame(gameLoop); // Continuar animación
}

// Iniciar la animación del juego
gameLoop();
