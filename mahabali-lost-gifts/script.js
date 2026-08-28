/* =========================================
   MAHABALI'S LOST GIFTS
   ONAM.exe
========================================= */


/* =========================================
   GAME STATE
========================================= */

let currentLevel = 0;

let score = 0;

let lives = 3;

let timeLeft = 30;

let combo = 0;

let flowerCount = 0;

let boatScore = 0;

let sadyaScore = 0;

let flowerFinalScore = 0;

let boatFinalScore = 0;

let sadyaFinalScore = 0;

let timerInterval = null;

let flowerInterval = null;

let boatInterval = null;

let rhythmInterval = null;

let rhythmPosition = 0;

let rhythmDirection = 1;

let basketPosition = 50;

let boatPosition = 5;

let enemyBoatPosition = 5;

let currentDishIndex = 0;


/* =========================================
   LEVEL DATA
========================================= */

const levels = [

  {
    number: 1,
    icon: "🌸",
    title: "FIND THE FLOWERS",
    description:
      "Collect flowers to help Mahabali create the perfect Pookalam!",
    instruction:
      "Move your basket left and right and catch 15 falling flowers."
  },

  {
    number: 2,
    icon: "🚣",
    title: "VALLAM KALI",
    description:
      "Help Mahabali win the legendary snake boat race!",
    instruction:
      "Press SPACE or click ROW when the marker reaches the PERFECT zone."
  },

  {
    number: 3,
    icon: "🍛",
    title: "SADYA MASTER",
    description:
      "Prepare the perfect Onam Sadya for Mahabali!",
    instruction:
      "Read Mahabali's request and click the correct dish."
  }

];


/* =========================================
   DOM HELPERS
========================================= */

function get(id) {
  return document.getElementById(id);
}


function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  get(id).classList.add("active");
}


/* =========================================
   START GAME
========================================= */

function startGame() {

  score = 0;
  lives = 3;
  combo = 0;

  flowerCount = 0;

  boatScore = 0;

  sadyaScore = 0;

  flowerFinalScore = 0;
  boatFinalScore = 0;
  sadyaFinalScore = 0;

  currentLevel = 0;

  updateHUD();

  showLevelIntro();
}


/* =========================================
   LEVEL INTRO
========================================= */

function showLevelIntro() {

  const level = levels[currentLevel];

  get("level-icon").textContent = level.icon;

  get("level-title").textContent = level.title;

  get("level-description").textContent =
    level.description;

  get("level-instruction").textContent =
    level.instruction;

  get("level-intro-screen")
    .querySelector(".level-number")
    .textContent =
    `LEVEL ${level.number}`;

  showScreen("level-intro-screen");
}


/* =========================================
   BEGIN LEVEL
========================================= */

function beginCurrentLevel() {

  clearAllIntervals();

  get("game-hud").classList.add("show");

  updateHUD();

  if (currentLevel === 0) {
    startFlowerGame();
  }

  else if (currentLevel === 1) {
    startBoatGame();
  }

  else if (currentLevel === 2) {
    startSadyaGame();
  }
}


/* =========================================
   HUD
========================================= */

function updateHUD() {

  get("score").textContent = score;

  get("timer").textContent = timeLeft;

  get("combo").textContent = combo;

  let hearts = "";

  for (let i = 0; i < lives; i++) {
    hearts += "❤️";
  }

  if (hearts === "") {
    hearts = "💔";
  }

  get("lives").textContent = hearts;
}


/* =========================================
   TIMER
========================================= */

function startTimer(seconds, callback) {

  clearInterval(timerInterval);

  timeLeft = seconds;

  updateHUD();

  timerInterval = setInterval(() => {

    timeLeft--;

    updateHUD();

    if (timeLeft <= 0) {

      clearInterval(timerInterval);

      callback();

    }

  }, 1000);
}


/* =========================================
   LEVEL 1
   FLOWER GAME
========================================= */

function startFlowerGame() {

  flowerCount = 0;

  basketPosition = 50;

  get("flowers-collected").textContent = "0";

  get("basket").style.left =
    basketPosition + "%";

  showScreen("flower-game");

  const area = get("flower-area");

  area.querySelectorAll(".falling-flower")
    .forEach(flower => flower.remove());

  startTimer(30, () => {

    if (flowerCount >= 15) {
      finishFlowerGame();
    } else {
      showMessage(
        "⏰",
        "Time's up!"
      );

      finishFlowerGame();
    }

  });

  flowerInterval = setInterval(createFlower, 650);
}


/* =========================================
   CREATE FALLING FLOWER
========================================= */

function createFlower() {

  const area = get("flower-area");

  const flower = document.createElement("div");

  flower.classList.add("falling-flower");

  const flowers = [
    "🌼",
    "🌸",
    "🌺",
    "🌻",
    "🌷"
  ];

  flower.textContent =
    flowers[Math.floor(Math.random() * flowers.length)];

  const left =
    Math.random() * 90 + 5;

  flower.style.left = left + "%";

  flower.style.top = "-50px";

  area.appendChild(flower);

  let position = -50;

  const fallSpeed =
    2 + Math.random() * 2;

  const fallInterval =
    setInterval(() => {

      position += fallSpeed;

      flower.style.top =
        position + "px";

      if (position > area.clientHeight - 90) {

        clearInterval(fallInterval);

        flower.remove();

        return;
      }

      checkFlowerCollision(
        flower,
        position
      );

    }, 30);

  flower.dataset.interval =
    fallInterval;
}


/* =========================================
   FLOWER COLLISION
========================================= */

function checkFlowerCollision(
  flower,
  position
) {

  if (!flower.parentElement) {
    return;
  }

  const flowerRect =
    flower.getBoundingClientRect();

  const basketRect =
    get("basket").getBoundingClientRect();

  const collision =
    flowerRect.bottom >= basketRect.top &&
    flowerRect.left < basketRect.right &&
    flowerRect.right > basketRect.left;

  if (collision) {

    clearInterval(
      Number(flower.dataset.interval)
    );

    flower.remove();

    flowerCount++;

    combo++;

    score +=
      10 + (combo * 2);

    get("flowers-collected")
      .textContent = flowerCount;

    updateHUD();

    showMessage(
      "🌸",
      `+${10 + combo * 2} FLOWER!`
    );

    if (flowerCount >= 15) {
      finishFlowerGame();
    }
  }
}


/* =========================================
   MOVE BASKET
========================================= */

function moveBasket(direction) {

  if (
    currentLevel !== 0 ||
    !get("flower-game").classList.contains("active")
  ) {
    return;
  }

  if (direction === "left") {
    basketPosition -= 7;
  }

  else {
    basketPosition += 7;
  }

  basketPosition =
    Math.max(
      8,
      Math.min(92, basketPosition)
    );

  get("basket").style.left =
    basketPosition + "%";
}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener("keydown", event => {

  if (
    event.key === "ArrowLeft" ||
    event.key.toLowerCase() === "a"
  ) {

    moveBasket("left");

  }

  if (
    event.key === "ArrowRight" ||
    event.key.toLowerCase() === "d"
  ) {

    moveBasket("right");

  }

  if (
    event.code === "Space" &&
    currentLevel === 1 &&
    get("boat-game").classList.contains("active")
  ) {

    event.preventDefault();

    rowBoat();
  }

});


/* =========================================
   FINISH FLOWER GAME
========================================= */

function finishFlowerGame() {

  clearInterval(flowerInterval);

  clearInterval(timerInterval);

  flowerFinalScore = score;

  showMessage(
    "🎉",
    "Pookalam Complete!"
  );

  setTimeout(() => {

    currentLevel = 1;

    showLevelIntro();

  }, 1500);
}


/* =========================================
   LEVEL 2
   BOAT GAME
========================================= */

function startBoatGame() {

  showScreen("boat-game");

  boatPosition = 5;

  enemyBoatPosition = 5;

  get("player-boat").style.left =
    boatPosition + "%";

  get("enemy-boat").style.left =
    enemyBoatPosition + "%";

  rhythmPosition = 0;

  rhythmDirection = 1;

  boatScore = 0;

  startTimer(35, () => {

    finishBoatGame();

  });

  rhythmInterval = setInterval(() => {

    rhythmPosition +=
      2.5 * rhythmDirection;

    if (rhythmPosition >= 98) {
      rhythmDirection = -1;
    }

    if (rhythmPosition <= 0) {
      rhythmDirection = 1;
    }

    get("rhythm-marker").style.left =
      rhythmPosition + "%";

  }, 50);

  boatInterval = setInterval(() => {

    enemyBoatPosition +=
      0.7 + Math.random() * 0.5;

    if (enemyBoatPosition > 90) {
      enemyBoatPosition = 90;
    }

    get("enemy-boat").style.left =
      enemyBoatPosition + "%";

    if (enemyBoatPosition >= 85) {

      showMessage(
        "😱",
        "The opponent is ahead!"
      );

    }

  }, 500);

}


/* =========================================
   ROW BOAT
========================================= */

function rowBoat() {

  if (
    !get("boat-game").classList.contains("active")
  ) {
    return;
  }

  let points = 0;

  let message = "";

  /*
    PERFECT ZONE:
    approximately 55% - 70%
  */

  if (
    rhythmPosition >= 55 &&
    rhythmPosition <= 70
  ) {

    points = 100;

    boatPosition += 9;

    message = "🔥 PERFECT ROW! +100";

    combo++;

  }

  else if (
    rhythmPosition >= 35 &&
    rhythmPosition <= 85
  ) {

    points = 50;

    boatPosition += 5;

    message = "⭐ GOOD ROW! +50";

    combo++;

  }

  else {

    points = 10;

    boatPosition += 1;

    combo = 0;

    message = "😅 TOO EARLY! +10";

  }

  score += points;

  boatScore += points;

  boatPosition =
    Math.min(88, boatPosition);

  get("player-boat").style.left =
    boatPosition + "%";

  updateHUD();

  showMessage(
    message.includes("PERFECT") ? "🔥" : "⭐",
    message
  );

  if (boatPosition >= 85) {

    finishBoatGame();

  }

}


/* =========================================
   FINISH BOAT GAME
========================================= */

function finishBoatGame() {

  clearInterval(timerInterval);

  clearInterval(rhythmInterval);

  clearInterval(boatInterval);

  boatFinalScore = boatScore;

  if (boatPosition >= 85) {

    score += 250;

    showMessage(
      "🏆",
      "VALLAM KALI WIN!"
    );

  }

  else {

    showMessage(
      "🚣",
      "Race Finished!"
    );

  }

  updateHUD();

  setTimeout(() => {

    currentLevel = 2;

    showLevelIntro();

  }, 1500);

}


/* =========================================
   LEVEL 3
   SADYA
========================================= */

const dishes = [

  {
    name: "Rice",
    emoji: "🍚",
    key: "rice"
  },

  {
    name: "Sambar",
    emoji: "🥣",
    key: "sambar"
  },

  {
    name: "Avial",
    emoji: "🥘",
    key: "avial"
  },

  {
    name: "Thoran",
    emoji: "🥗",
    key: "thoran"
  },

  {
    name: "Banana",
    emoji: "🍌",
    key: "banana"
  },

  {
    name: "Payasam",
    emoji: "🍮",
    key: "payasam"
  }

];


function startSadyaGame() {

  showScreen("sadya-game");

  currentDishIndex = 0;

  sadyaScore = 0;

  get("dishes-completed")
    .textContent = "0";

  showNextDish();

  startTimer(35, () => {

    finishSadyaGame();

  });

}


/* =========================================
   SHOW NEXT DISH
========================================= */

function showNextDish() {

  if (currentDishIndex >= dishes.length) {

    finishSadyaGame();

    return;
  }

  const dish =
    dishes[currentDishIndex];

  get("dish-question").textContent =
    `"Where is the ${dish.name}?"`;

}


/* =========================================
   SELECT DISH
========================================= */

function selectDish(selectedDish) {

  if (
    !get("sadya-game").classList.contains("active")
  ) {
    return;
  }

  const correctDish =
    dishes[currentDishIndex];

  if (
    selectedDish === correctDish.key
  ) {

    combo++;

    const points =
      100 + (combo * 10);

    score += points;

    sadyaScore += points;

    currentDishIndex++;

    get("dishes-completed")
      .textContent =
      currentDishIndex;

    showMessage(
      "🍛",
      `CORRECT! +${points}`
    );

    if (
      currentDishIndex >= dishes.length
    ) {

      setTimeout(
        finishSadyaGame,
        700
      );

    }

    else {

      setTimeout(
        showNextDish,
        500
      );

    }

  }

  else {

    lives--;

    combo = 0;

    score =
      Math.max(
        0,
        score - 25
      );

    updateHUD();

    showMessage(
      "❌",
      "Wrong dish! -25"
    );

    if (lives <= 0) {

      finishSadyaGame();

    }

  }

}


/* =========================================
   FINISH SADYA
========================================= */

function finishSadyaGame() {

  clearInterval(timerInterval);

  sadyaFinalScore = sadyaScore;

  setTimeout(() => {

    showResult();

  }, 800);

}


/* =========================================
   FINAL RESULT
========================================= */

function showResult() {

  clearAllIntervals();

  get("game-hud")
    .classList.remove("show");

  get("final-score")
    .textContent = score;

  get("flower-final-score")
    .textContent = flowerFinalScore;

  get("boat-final-score")
    .textContent = boatFinalScore;

  get("sadya-final-score")
    .textContent = sadyaFinalScore;

  let rating = "";

  if (score >= 2500) {

    rating =
      "🏆 ONAM LEGEND!";

  }

  else if (score >= 1800) {

    rating =
      "🥇 ONAM CHAMPION!";

  }

  else if (score >= 1000) {

    rating =
      "🥈 GREAT ONAM HERO!";

  }

  else {

    rating =
      "🌼 ONAM HERO!";

  }

  get("rating").textContent =
    rating;

  showScreen("result-screen");

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(
  icon,
  text
) {

  const popup =
    get("message-popup");

  get("message-icon")
    .textContent = icon;

  get("message-text")
    .textContent = text;

  popup.classList.add("show");

  setTimeout(() => {

    popup.classList.remove("show");

  }, 900);

}


/* =========================================
   RESTART
========================================= */

function restartGame() {

  clearAllIntervals();

  get("game-hud")
    .classList.remove("show");

  startGame();

}


/* =========================================
   CLEAR INTERVALS
========================================= */

function clearAllIntervals() {

  clearInterval(timerInterval);

  clearInterval(flowerInterval);

  clearInterval(boatInterval);

  clearInterval(rhythmInterval);

  timerInterval = null;

  flowerInterval = null;

  boatInterval = null;

  rhythmInterval = null;

}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    updateHUD();

  }
);