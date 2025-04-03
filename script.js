// Configuración inicial
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Cargar imágenes de las naves
const player1Img = new Image();
player1Img.src = 'images/nave1.png'; // Ruta a tu imagen para el jugador 1

const player2Img = new Image();
player2Img.src = 'images/nave2.png'; // Ruta a tu imagen para el jugador 2

// Configuración de las naves
let player1 = { 
    x: canvas.width / 2 - 25, 
    y: canvas.height - 70, 
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

// Iniciar la animación del juego
gameLoop();