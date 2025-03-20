// Configuración inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Posición inicial de la nave
let playerX = canvas.width / 2 - 25;
let playerY = canvas.height - 70;
let playerWidth = 50;
let playerHeight = 50;

// Arreglo para los disparos
let bullets = [];

// Velocidad de la nave
const playerSpeed = 5;

// Teclas presionadas
const keys = {};

// Función para dibujar la nave
function drawPlayer() {
    ctx.fillStyle = 'lime';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight); // Nave como un rectángulo
}

// Función para dibujar los disparos
function drawBullets() {
    ctx.fillStyle = 'white';
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillRect(bullets[i].x, bullets[i].y, 5, 10); // Dibujar cada disparo
        bullets[i].y -= 5; // Mover el disparo hacia arriba
    }

    // Eliminar los disparos que salen del canvas
    bullets = bullets.filter(bullet => bullet.y > 0);
}

// Función para mover la nave
function movePlayer() {
    if (keys['a'] && playerX > 0) {
        playerX -= playerSpeed; // Mover izquierda
    }
    if (keys['d'] && playerX < canvas.width - playerWidth) {
        playerX += playerSpeed; // Mover derecha
    }
}

// Función para disparar
function shoot() {
    bullets.push({ x: playerX + playerWidth / 2 - 2.5, y: playerY }); // Disparo desde el centro de la nave
}

// Manejo de eventos de teclado
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && bullets.length === 0) { // Dispara solo si no hay disparos activos
        shoot();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Función principal de animación
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas

    movePlayer(); // Mover la nave
    drawPlayer(); // Dibujar la nave
    drawBullets(); // Dibujar disparos

    requestAnimationFrame(gameLoop); // Continuar animación
}

// Iniciar la animación del juego
gameLoop();
