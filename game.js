// Super Bar-IO Jäger

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// =========================
// IMAGES
// =========================

const santaImg = new Image();
santaImg.src = "images/santa.png";

const bottleImg = new Image();
bottleImg.src = "images/bottle.png";

const bombImg = new Image();
bombImg.src = "images/bomb.png";

const goldenCupImg = new Image();
goldenCupImg.src = "images/gold-cup.png";

const fakeBombImg = new Image();
fakeBombImg.src = "images/fake-bomb.png";

const speedBootImg = new Image();
speedBootImg.src = "images/hermes-boot.png";

// =========================
// BACKGROUNDS
// =========================

let currentBgIndex = 0;

const backgroundImages = [
  "images/background.png",
  "images/bg2.png",
  "images/bg3.png",
  "images/bg4.png"
];

let backgroundImg = new Image();
backgroundImg.src = backgroundImages[currentBgIndex];
backgroundImg.justChanged = false;

// =========================
// PLAYER
// =========================

const santa = {
  x: 180,
  y: 0,
  width: 80,
  height: 80,
  speed: 5,
  normalSpeed: 5
};

// =========================
// GAME VARIABLES
// =========================

let bottles = [];
let bombs = [];
let goldenCups = [];
let fakeBombs = [];

let score = 0;
let difficultyLevel = 1;
let gameOver = false;

let touchLeft = false;
let touchRight = false;

let isTipsy = false;
let tipsyTimer = null;

let speedBoostTimer = null;
let isSpeedBoosted = false;

// =========================
// KEYBOARD CONTROLS
// =========================

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") {
    santa.x -= santa.speed;

    if (santa.x < 0) {
      santa.x = 0;
    }
  }

  if (e.key === "ArrowRight") {
    santa.x += santa.speed;

    if (santa.x + santa.width > canvas.width) {
      santa.x = canvas.width - santa.width;
    }
  }
});

// =========================
// TOUCH CONTROLS
// =========================

document
  .getElementById("leftTouch")
  .addEventListener("touchstart", () => touchLeft = true);

document
  .getElementById("leftTouch")
  .addEventListener("touchend", () => touchLeft = false);

document
  .getElementById("rightTouch")
  .addEventListener("touchstart", () => touchRight = true);

document
  .getElementById("rightTouch")
  .addEventListener("touchend", () => touchRight = false);

// =========================
// RESIZE
// =========================

function resizeCanvasToFullScreen() {
  const height = window.visualViewport
    ? window.visualViewport.height
    : window.innerHeight;

  canvas.width = window.innerWidth;
  canvas.height = height;

  santa.y = canvas.height - santa.height - 60;

  if (santa.x + santa.width > canvas.width) {
    santa.x = canvas.width - santa.width;
  }
}

window.addEventListener("resize", resizeCanvasToFullScreen);
document.addEventListener("fullscreenchange", resizeCanvasToFullScreen);

// =========================
// COLLISION
// =========================

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// =========================
// DROP OBJECTS
// =========================

function dropBottle() {
  if (gameOver || startScreen.style.display !== "none") return;

  const x = Math.random() * (canvas.width - 40);
  const speed = 2 + difficultyLevel * 0.5;

  bottles.push({
    x,
    y: 0,
    width: 40,
    height: 80,
    speed
  });
}

function dropBomb() {
  if (gameOver || startScreen.style.display !== "none") return;

  const x = Math.random() * (canvas.width - 40);
  const speed = 2 + difficultyLevel * 0.5;

  bombs.push({
    x,
    y: 0,
    width: 40,
    height: 80,
    speed
  });
}

function dropGoldenCup() {
  if (gameOver || startScreen.style.display !== "none") return;

  const x = Math.random() * (canvas.width - 40);

  goldenCups.push({
    x,
    y: 0,
    width: 40,
    height: 80,
    speed: 2
  });
}

function dropFakeBomb() {
  if (gameOver || startScreen.style.display !== "none") return;

  const x = Math.random() * (canvas.width - 40);

  fakeBombs.push({
    x,
    y: 0,
    width: 40,
    height: 80,
    speed: 2
  });
}

// =========================
// SCORE
// =========================

function drawScore() {
  ctx.font = "bold 26px 'Press Start 2P', monospace";
  ctx.textAlign = "left";

  ctx.fillStyle = "#fff200";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;

  ctx.strokeText("SCORE: " + score, 20, 40);
  ctx.fillText("SCORE: " + score, 20, 40);
}

// =========================
// DRAW GAME
// =========================

function draw() {
  ctx.save();

  // Tipsy shake effect
  if (isTipsy) {
    const dx = Math.random() * 6 - 3;
    const dy = Math.random() * 6 - 3;

    ctx.translate(dx, dy);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(
    backgroundImg,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Player
  ctx.drawImage(
    santaImg,
    santa.x,
    santa.y,
    santa.width,
    santa.height
  );

  const bottleScale = isTipsy ? 1.5 : 1;

  // =========================
  // BOTTLES
  // =========================

  bottles.forEach((bottle, i) => {
    bottle.y += bottle.speed;

    ctx.drawImage(
      bottleImg,
      bottle.x,
      bottle.y,
      bottle.width * bottleScale,
      bottle.height * bottleScale
    );

    if (isColliding(santa, bottle)) {
      score++;
      bottles.splice(i, 1);

      // Every 19 points → tipsy mode
      if (score % 19 === 0 && !isTipsy) {
        isTipsy = true;

        clearTimeout(tipsyTimer);

        tipsyTimer = setTimeout(() => {
          isTipsy = false;
        }, 3000);
      }

      // Every 19 points → next background
      if (
        score > 0 &&
        score % 19 === 0 &&
        !backgroundImg.justChanged
      ) {
        currentBgIndex =
          (currentBgIndex + 1) % backgroundImages.length;

        backgroundImg.src =
          backgroundImages[currentBgIndex];

        backgroundImg.justChanged = true;

        setTimeout(() => {
          backgroundImg.justChanged = false;
        }, 1000);
      }

    } else if (bottle.y > canvas.height) {
      bottles.splice(i, 1);
    }
  });

  // =========================
  // BOMBS
  // =========================

  bombs.forEach((bomb, i) => {
    bomb.y += bomb.speed;

    ctx.drawImage(
      bombImg,
      bomb.x,
      bomb.y,
      bomb.width,
      bomb.height
    );

    if (isColliding(santa, bomb)) {
      gameOver = true;
    } else if (bomb.y > canvas.height) {
      bombs.splice(i, 1);
    }
  });

  // =========================
  // GOLDEN CUPS
  // =========================

  goldenCups.forEach((cup, i) => {
    cup.y += cup.speed;

    ctx.drawImage(
      goldenCupImg,
      cup.x,
      cup.y,
      cup.width,
      cup.height
    );

    if (isColliding(santa, cup)) {
      score += 5;
      goldenCups.splice(i, 1);

    } else if (cup.y > canvas.height) {
      goldenCups.splice(i, 1);
    }
  });

  // =========================
  // FAKE BOMBS / SPEED BOOST
  // =========================

  fakeBombs.forEach((fake, i) => {
    fake.y += fake.speed;

    ctx.drawImage(
      fakeBombImg,
      fake.x,
      fake.y,
      fake.width,
      fake.height
    );

    if (isColliding(santa, fake)) {
      fakeBombs.splice(i, 1);

      santa.speed = santa.normalSpeed * 2;
      isSpeedBoosted = true;

      clearTimeout(speedBoostTimer);

      speedBoostTimer = setTimeout(() => {
        santa.speed = santa.normalSpeed;
        isSpeedBoosted = false;
      }, 7000);

    } else if (fake.y > canvas.height) {
      fakeBombs.splice(i, 1);
    }
  });

  // =========================
  // SCORE
  // =========================

  drawScore();

  // =========================
  // TIPSY MESSAGE
  // =========================

  if (isTipsy) {
    ctx.font = "bold 16px 'Press Start 2P', monospace";
    ctx.textAlign = "center";

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;

    ctx.strokeText(
      "TOO TIPSY TO THINK!",
      canvas.width / 2,
      120
    );

    ctx.fillStyle = "#ff6600";

    ctx.fillText(
      "TOO TIPSY TO THINK!",
      canvas.width / 2,
      120
    );
  }

  // =========================
  // SPEED BOOST ICON
  // =========================

  if (isSpeedBoosted) {
    ctx.drawImage(
      speedBootImg,
      canvas.width - 60,
      20,
      40,
      40
    );
  }

  // =========================
  // GAME OVER
  // =========================

  if (gameOver) {
    const textY = canvas.height / 2 - 30;

    ctx.font =
      "bold 42px 'Press Start 2P', monospace";

    ctx.textAlign = "center";

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;

    ctx.fillStyle = "#ff4444";

    ctx.strokeText(
      "GAME OVER",
      canvas.width / 2,
      textY
    );

    ctx.fillText(
      "GAME OVER",
      canvas.width / 2,
      textY
    );

    restartBtn.style.display = "block";
    restartBtn.classList.add("show-pop");

    ctx.font =
      "bold 20px 'Press Start 2P', monospace";

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;

    ctx.fillStyle = "#fff200";

    const scoreY =
      canvas.height * 0.6 + 100;

    ctx.strokeText(
      `FINAL SCORE: ${score}`,
      canvas.width / 2,
      scoreY
    );

    ctx.fillText(
      `FINAL SCORE: ${score}`,
      canvas.width / 2,
      scoreY
    );
  }

  ctx.restore();

  // =========================
  // CONTINUOUS TOUCH MOVEMENT
  // =========================

  if (touchLeft) {
    santa.x -= santa.speed;

    if (santa.x < 0) {
      santa.x = 0;
    }
  }

  if (touchRight) {
    santa.x += santa.speed;

    if (santa.x + santa.width > canvas.width) {
      santa.x =
        canvas.width - santa.width;
    }
  }
}

// =========================
// GAME LOOP
// =========================

function gameLoop() {
  if (!gameOver) {
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    draw();
  }
}

// =========================
// RESET GAME
// =========================

function resetGame() {
  bottles = [];
  bombs = [];
  goldenCups = [];
  fakeBombs = [];

  score = 0;
  difficultyLevel = 1;

  santa.x = 180;
  santa.speed = santa.normalSpeed;

  isSpeedBoosted = false;
  isTipsy = false;

  clearTimeout(speedBoostTimer);
  clearTimeout(tipsyTimer);

  gameOver = false;

  currentBgIndex = 0;
  backgroundImg.src =
    backgroundImages[currentBgIndex];

  backgroundImg.justChanged = false;

  restartBtn.style.display = "none";
  restartBtn.classList.remove("show-pop");

  resizeCanvasToFullScreen();

  gameLoop();
}

// =========================
// START GAME
// =========================

function startGame() {
  startScreen.style.display = "none";

  resizeCanvasToFullScreen();

  canvas.focus();

  gameLoop();
}

// =========================
// BUTTONS
// =========================

startBtn.addEventListener(
  "click",
  startGame
);

restartBtn.addEventListener(
  "click",
  resetGame
);

// =========================
// GAME TIMERS
// =========================

setInterval(dropBottle, 1500);

setInterval(dropBomb, 5000);

setInterval(() => {
  if (!gameOver && startScreen.style.display === "none") {
    difficultyLevel += 0.2;
  }
}, 5000);

setInterval(dropGoldenCup, 15000);

setInterval(dropFakeBomb, 20000);
