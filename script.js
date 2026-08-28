const $ = (selector) =>
  document.querySelector(selector);


// =====================================================
// SCREEN REFERENCES
// =====================================================

const screens = {
  start: $("#startScreen"),
  briefing: $("#briefingScreen"),
  game: $("#gameScreen"),
  final: $("#finalScreen"),
  leader: $("#leaderScreen"),
};


// =====================================================
// GAME STATE
// =====================================================

let state = {

  mission: 0,

  xp: 0,

  combo: 1,

  bestCombo: 1,

  lives: 3,

  time: 45,

  timer: null,

  levelTimer: null,

  sound: true,

  boatX: 50,

  boatObjects: [],

  huntFound: 0,

  pookPattern: [],

  pookSelected: [],

  finalScore: 0

};


// =====================================================
// SOUND
// =====================================================

function beep(
  frequency = 440,
  duration = 0.08,
  type = "sine"
) {

  if (!state.sound) {
    return;
  }

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    const ctx =
      beep.ctx ||
      (beep.ctx = new AudioContext());

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
      frequency;

    gain.gain.setValueAtTime(
      0.045,
      ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(ctx.destination);

    oscillator.start();

    oscillator.stop(
      ctx.currentTime + duration
    );

  } catch (error) {

    console.log("Audio unavailable");

  }

}


// =====================================================
// TOAST
// =====================================================

function toast(message) {

  const element = $("#toast");

  element.textContent = message;

  element.classList.add("show");

  setTimeout(() => {

    element.classList.remove("show");

  }, 1800);

}


// =====================================================
// SCREEN NAVIGATION
// =====================================================

function showScreen(name) {

  Object
    .values(screens)
    .forEach((screen) => {

      screen.classList.remove("active");

    });

  screens[name].classList.add("active");

  window.scrollTo(0, 0);

}


// =====================================================
// HUD
// =====================================================

function updateHud() {

  $("#missionNumber").textContent =
    `${String(state.mission + 1).padStart(2, "0")} / 04`;


  $("#xpText").textContent =
    String(Math.floor(state.xp)).padStart(4, "0");


  $("#comboText").textContent =
    `x${state.combo}`;


  $("#livesText").textContent =
    "♥ ".repeat(state.lives).trim() +
    (state.lives ? "" : "—");


  $("#timerText").textContent =
    `00:${String(
      Math.max(0, state.time)
    ).padStart(2, "0")}`;


  $("#xpBar").style.width =
    Math.min(
      100,
      (state.xp % 1000) / 10
    ) + "%";

}


// =====================================================
// TIMER
// =====================================================

function startTimer(seconds, onEnd) {

  clearInterval(state.timer);

  state.time = seconds;

  updateHud();


  state.timer = setInterval(() => {

    state.time--;

    updateHud();


    if (state.time <= 0) {

      clearInterval(state.timer);

      onEnd();

    }

  }, 1000);

}


// =====================================================
// XP SYSTEM
// =====================================================

function addXP(amount) {

  state.xp +=
    amount * state.combo;


  state.combo++;


  state.bestCombo =
    Math.max(
      state.bestCombo,
      state.combo
    );


  updateHud();

}


// =====================================================
// MISTAKE / LIFE SYSTEM
// =====================================================

function mistake() {

  state.lives--;

  state.combo = 1;

  updateHud();

  beep(
    150,
    0.12,
    "sawtooth"
  );


  if (state.lives <= 0) {

    clearInterval(state.timer);

    toast(
      "All lives lost — restarting mission."
    );


    setTimeout(() => {

      state.lives = 3;

      loadLevel(state.mission);

    }, 900);

    return true;
  }


  return false;

}


// =====================================================
// LOAD LEVEL
// =====================================================

function loadLevel(index) {

  clearInterval(state.timer);

  state.mission = index;

  state.combo = 1;

  updateHud();


  const container =
    $("#levelContainer");


  container.innerHTML = "";


  if (index === 0) {

    loadPookkalam(container);

  }


  if (index === 1) {

    loadVallam(container);

  }


  if (index === 2) {

    loadHunt(container);

  }


  if (index === 3) {

    loadChoice(container);

  }

}


// =====================================================
// LEVEL TEMPLATE
// =====================================================

function levelShell(
  title,
  tag,
  description
) {

  const element =
    document.createElement("div");


  element.className =
    "level-card";


  element.innerHTML = `

    <div class="level-header">

      <div>

        <div class="eyebrow">
          ${tag}
        </div>

        <h2>
          ${title}
        </h2>

        <p>
          ${description}
        </p>

      </div>

      <div class="level-tag">
        MEMORY
        ${String(
          state.mission + 1
        ).padStart(2, "0")}
      </div>

    </div>

  `;


  $("#levelContainer")
    .appendChild(element);


  return element;

}


// =====================================================
// NEXT LEVEL
// =====================================================

function nextLevel() {

  clearInterval(state.timer);

  clearInterval(state.levelTimer);


  if (state.mission < 3) {

    state.mission++;


    setTimeout(() => {

      loadLevel(state.mission);

    }, 450);

  } else {

    finishGame();

  }

}

// =====================================================
// MISSION 1
// POOKKALAM MEMORY CHALLENGE
// =====================================================

function loadPookkalam(container) {
  const card = levelShell(
    "POOKKALAM CORE",
    "MEMORY // PRECISION",
    "Memorize the flower sequence, then rebuild it before time runs out."
  )

  const flowers = ["🌼", "🌺", "🌸", "🪷", "🌻"]

  // ---------------------------------------------
  // TARGET SEQUENCE
  // ---------------------------------------------

  const targetSequence = [
    "🌼",
    "🌺",
    "🌸",
    "🪷",
    "🌻",
    "🌸",
    "🌺",
    "🌼",
  ]

  state.pookPattern = targetSequence
  state.pookSelected = []

  // ---------------------------------------------
  // TARGET DISPLAY
  // ---------------------------------------------

  const targetBox = document.createElement("div")

  targetBox.className = "memory-target"

  targetBox.innerHTML = `
    <div class="eyebrow">
      MEMORY SEQUENCE
    </div>

    <div class="target-sequence">
      ${targetSequence
        .map(
          (flower, index) => `
            <span
              class="target-flower"
              data-target="${index}"
            >
              ${flower}
            </span>
          `
        )
        .join("")}
    </div>

    <p class="memory-status">
      Memorize the sequence...
    </p>
  `

  card.appendChild(targetBox)

  // ---------------------------------------------
  // GRID
  // ---------------------------------------------

  const grid = document.createElement("div")

  grid.className = "pook-grid"

  // We need enough copies of every flower
  // required by the target sequence.
  const requiredFlowers = [...targetSequence]

  // Add decoy flowers
  while (requiredFlowers.length < 25) {
    requiredFlowers.push(
      flowers[
        Math.floor(
          Math.random() * flowers.length
        )
      ]
    )
  }

  // Shuffle board
  requiredFlowers.sort(
    () => Math.random() - 0.5
  )

  const buttons = []

  requiredFlowers.forEach((flower, index) => {
    const button = document.createElement("button")

    button.className = "flower"

    button.type = "button"

    button.textContent = flower

    button.dataset.flower = flower

    button.dataset.index = index

    button.disabled = true

    buttons.push(button)

    grid.appendChild(button)
  })

  card.appendChild(grid)

  // ---------------------------------------------
  // MEMORY COUNTDOWN
  // ---------------------------------------------

  let memoryTime = 5

  const status = targetBox.querySelector(
    ".memory-status"
  )

  status.textContent =
    `Memorize the sequence... ${memoryTime}`

  const memoryTimer = setInterval(() => {
    memoryTime--

    if (memoryTime > 0) {
      status.textContent =
        `Memorize the sequence... ${memoryTime}`
    } else {
      clearInterval(memoryTimer)

      // Hide target sequence
      targetBox.classList.add(
        "sequence-hidden"
      )

      status.textContent =
        "GO! Rebuild the sequence."

      // Enable buttons
      buttons.forEach((button) => {
        button.disabled = false
      })

      // Start actual game timer
      startTimer(45, () => {
        toast("Memory timed out!")

        setTimeout(() => {
          loadLevel(0)
        }, 700)
      })
    }
  }, 1000)

  // ---------------------------------------------
  // PLAYER CLICK LOGIC
  // ---------------------------------------------

  buttons.forEach((button) => {
    button.onclick = () => {
      const expected =
        targetSequence[
          state.pookSelected.length
        ]

      const clicked =
        button.dataset.flower

      // -----------------------------------------
      // CORRECT FLOWER
      // -----------------------------------------

      if (clicked === expected) {
        button.classList.add(
          "selected",
          "correct"
        )

        button.disabled = true

        state.pookSelected.push(
          clicked
        )

        // Highlight corresponding
        // target sequence item
        const targetItem =
          targetBox.querySelector(
            `[data-target="${state.pookSelected.length - 1}"]`
          )

        if (targetItem) {
          targetItem.classList.add(
            "completed"
          )
        }

        beep(620, 0.07)

        addXP(100)

        status.textContent =
          `Correct! ${state.pookSelected.length}/${targetSequence.length}`

        // ---------------------------------------
        // COMPLETED
        // ---------------------------------------

        if (
          state.pookSelected.length ===
          targetSequence.length
        ) {
          clearInterval(state.timer)

          buttons.forEach((button) => {
            button.disabled = true
          })

          status.textContent =
            "✓ POOKKALAM RESTORED!"

          addXP(250)

          toast(
            "POOKKALAM RESTORED! + BONUS XP"
          )

          setTimeout(() => {
            nextLevel()
          }, 1000)
        }
      }

      // -----------------------------------------
      // WRONG FLOWER
      // -----------------------------------------

      else {
        button.classList.add("wrong")

        setTimeout(() => {
          button.classList.remove("wrong")
        }, 400)

        const lostAllLives = mistake()

        if (!lostAllLives) {
          toast(
            `Wrong flower! Need ${expected}`
          )
        }
      }
    }
  })
}


// =====================================================
// MISSION 2
// VALLAM RUSH
// =====================================================

function loadVallam(container) {

  const card =
    levelShell(
      "VALLAM RUSH",
      "REFLEX // SPEED",
      "Steer the snake boat, collect golden energy and avoid the rocks."
    );


  const wrap =
    document.createElement("div");


  wrap.className =
    "boat-wrap";


  wrap.innerHTML = `

    <div class="boat-track"></div>

    <div
      id="boatPlayer"
      class="boat-player"
    >
      🚣
    </div>

  `;


  card.appendChild(wrap);


  const controls =
    document.createElement("div");


  controls.className =
    "boat-controls";


  controls.innerHTML = `

    <button
      class="ctrl"
      data-dir="-1"
    >
      ←
    </button>

    <button
      class="ctrl"
      data-dir="1"
    >
      →
    </button>

  `;


  card.appendChild(controls);


  const mobileControls =
    document.createElement("div");


  mobileControls.className =
    "mobile-controls";


  mobileControls.innerHTML = `

    <button
      class="ctrl"
      data-dir="-1"
    >
      ←
    </button>

    <button
      class="ctrl"
      data-dir="1"
    >
      →
    </button>

  `;


  card.appendChild(
    mobileControls
  );


  state.boatX = 50;

  state.boatObjects = [];


  const player =
    () =>
      $("#boatPlayer");


  const move = (direction) => {

    state.boatX =
      Math.max(
        10,
        Math.min(
          90,
          state.boatX +
          direction * 7
        )
      );


    player().style.left =
      state.boatX + "%";

  };


  card
    .querySelectorAll("[data-dir]")
    .forEach((button) => {

      button.onpointerdown = () => {

        move(
          Number(
            button.dataset.dir
          )
        );

      };

    });


  document.onkeydown = (event) => {

    if (
      !screens.game.classList.contains(
        "active"
      )
    ) {

      return;

    }


    if (
      [
        "ArrowLeft",
        "a",
        "A"
      ].includes(event.key)
    ) {

      move(-1);

    }


    if (
      [
        "ArrowRight",
        "d",
        "D"
      ].includes(event.key)
    ) {

      move(1);

    }

  };


  const spawn =
    setInterval(() => {

      const object =
        document.createElement(
          "div"
        );


      object.className =
        "boat-object";


      const rock =
        Math.random() < 0.32;


      object.textContent =
        rock ? "🪨" : "🪙";


      object.classList.toggle(
        "boat-rock",
        rock
      );


      object.style.left =
        10 + Math.random() * 80 + "%";


      object.style.top =
        "-45px";


      wrap.appendChild(object);


      const item = {

        el: object,

        y: -45,

        x: parseFloat(
          object.style.left
        ),

        rock,

        done: false

      };


      state.boatObjects.push(item);

    }, 650);


  const tick =
    setInterval(() => {

      state.boatObjects
        .forEach((object) => {

          object.y += 4.8;


          object.el.style.top =
            object.y + "px";


          const hitY =
            object.y > 300 &&
            object.y < 355;


          const distance =
            Math.abs(
              object.x -
              state.boatX
            );


          if (
            hitY &&
            distance < 9 &&
            !object.done
          ) {

            object.done = true;


            object.el.remove();


            if (object.rock) {

              if (!mistake()) {

                toast(
                  "Rock hit! - life"
                );

              }

            } else {

              addXP(90);

              beep(
                720,
                0.07
              );

              toast(
                "Energy collected +XP"
              );

            }

          }

        });


      state.boatObjects =
        state.boatObjects.filter(
          (object) =>
            object.y < 430 &&
            !object.done
        );

    }, 45);


  const cleanup = () => {

    clearInterval(spawn);

    clearInterval(tick);

  };


  state.levelTimer =
    cleanup;


  startTimer(
    35,
    () => {

      cleanup();

      nextLevel();

    }
  );

}


// =====================================================
// MISSION 3
// ONAM HUNT
// =====================================================

function loadHunt(container) {

  const card =
    levelShell(
      "ONAM HUNT",
      "SEARCH // FOCUS",
      "Find the five hidden festival objects. Avoid the decoys."
    );


  const area =
    document.createElement("div");


  area.className =
    "hunt-area";


  const targets = [
    "🪔",
    "🥥",
    "🍌",
    "🌴",
    "🎋"
  ];


  const usedPositions = [];


  state.huntFound = 0;


  targets.forEach(
    (item, index) => {

      let x;
      let y;


      do {

        x =
          8 +
          Math.random() *
          84;


        y =
          10 +
          Math.random() *
          76;

      } while (
        usedPositions.some(
          (position) =>
            Math.abs(
              position.x - x
            ) < 13 &&
            Math.abs(
              position.y - y
            ) < 13
        )
      );


      usedPositions.push({
        x,
        y
      });


      const button =
        document.createElement(
          "button"
        );


      button.className =
        "hunt-item";


      button.textContent =
        item;


      button.style.left =
        x + "%";


      button.style.top =
        y + "%";


      button.onclick = () => {

        if (
          button.classList.contains(
            "found"
          )
        ) {

          return;

        }


        button.classList.add(
          "found"
        );


        state.huntFound++;


        addXP(110);


        beep(
          600 + index * 80,
          0.08
        );


        toast(
          `${state.huntFound}/5 FOUND`
        );


        if (
          state.huntFound === 5
        ) {

          setTimeout(
            nextLevel,
            800
          );

        }

      };


      area.appendChild(button);

    }
  );


  // DECOYS

  for (let i = 0; i < 3; i++) {

    const button =
      document.createElement(
        "button"
      );


    button.className =
      "hunt-item";


    button.textContent =
      "❌";


    button.style.left =
      5 + Math.random() * 88 + "%";


    button.style.top =
      8 + Math.random() * 80 + "%";


    button.onclick = () => {

      if (
        button.classList.contains(
          "found"
        )
      ) {

        return;

      }


      button.classList.add(
        "found"
      );


      mistake();


      toast(
        "Decoy! Combo reset"
      );

    };


    area.appendChild(button);

  }


  card.appendChild(area);


  startTimer(
    40,
    () => {

      toast(
        "Hunt timed out."
      );

      loadLevel(2);

    }
  );

}


// =====================================================
// MISSION 4
// MAHABALI'S CHOICE
// =====================================================

const questions = [

  {
    q:
      "Which festival is celebrated with the grand flower carpet called a Pookkalam?",

    a: [
      "Onam",
      "Vishu",
      "Thrissur Pooram",
      "Navaratri"
    ],

    c: 0
  },


  {
    q:
      "Vallam Kali is traditionally associated with what?",

    a: [
      "Snake boat races",
      "Kite flying",
      "Drum battles",
      "Bull racing"
    ],

    c: 0
  },


  {
    q:
      "What is the traditional vegetarian feast served on banana leaves during Onam?",

    a: [
      "Sadya",
      "Sadhya Roll",
      "Thali",
      "Kanji"
    ],

    c: 0
  },


  {
    q:
      "The story of Onam is strongly associated with which legendary king?",

    a: [
      "Mahabali",
      "Ashoka",
      "Raja Raja Chola",
      "Krishnadevaraya"
    ],

    c: 0
  },


  {
    q:
      "A modern way to keep Onam celebrations sustainable is to…",

    a: [
      "Use reusable decor",
      "Increase plastic waste",
      "Waste food",
      "Avoid local flowers"
    ],

    c: 0
  }

];


// =====================================================
// CHOICE LEVEL
// =====================================================

function loadChoice(container) {

  const card =
    levelShell(
      "MAHABALI'S CHOICE",
      "CULTURE // LOGIC",
      "Answer three rapid-fire questions. Accuracy keeps your combo alive."
    );


  let questionIndex = 0;


  const box =
    document.createElement(
      "div"
    );


  box.className =
    "question-box";


  card.appendChild(box);


  function renderQuestion() {

    const question =
      questions[
        (state.mission +
          questionIndex) %
          questions.length
      ];


    box.innerHTML = `

      <div class="eyebrow">
        QUESTION
        ${questionIndex + 1}
        / 3
      </div>

      <h3>
        ${question.q}
      </h3>

      <div class="answers"></div>

    `;


    question.a.forEach(
      (answer, index) => {

        const button =
          document.createElement(
            "button"
          );


        button.className =
          "answer";


        button.textContent =
          answer;


        button.onclick = () => {

          if (
            index === question.c
          ) {

            button.classList.add(
              "correct"
            );


            addXP(160);


            beep(
              650,
              0.08
            );


            questionIndex++;


            if (
              questionIndex === 3
            ) {

              toast(
                "ALL MEMORY FRAGMENTS RESTORED!"
              );


              setTimeout(
                nextLevel,
                800
              );

            } else {

              setTimeout(
                renderQuestion,
                350
              );

            }

          } else {

            button.classList.add(
              "wrong"
            );


            mistake();


            toast(
              "Incorrect — combo reset"
            );

          }

        };


        box
          .querySelector(".answers")
          .appendChild(button);

      }
    );

  }


  renderQuestion();


  startTimer(
    45,
    () => {

      toast(
        "Choice mission timed out."
      );

      loadLevel(3);

    }
  );

}


// =====================================================
// FINISH GAME
// =====================================================

function finishGame() {

  clearInterval(state.timer);


  const score =
    Math.floor(
      state.xp +
      Math.max(0, state.time) * 15 +
      state.bestCombo * 50
    );


  state.finalScore =
    score;


  $("#finalScore").textContent =
    String(score).padStart(
      4,
      "0"
    );


  $("#finalCombo").textContent =
    "x" +
    state.bestCombo;


  let rank = "C";


  if (score >= 5000) {

    rank = "S";

  } else if (score >= 3500) {

    rank = "A";

  } else if (score >= 2200) {

    rank = "B";

  }


  $("#finalRank").textContent =
    rank;


  showScreen("final");


  beep(880, 0.2);


  setTimeout(() => {

    beep(1100, 0.2);

  }, 180);

}


// =====================================================
// LEADERBOARD
// =====================================================

function getScores() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "onamExeScores"
      ) || "[]"
    );

  } catch (error) {

    return [];

  }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

  return text.replace(
    /[&<>"']/g,
    (character) => {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];

    }
  );

}


// =====================================================
// RENDER LEADERBOARD
// =====================================================

function renderLeaderboard() {

  const list =
    $("#leaderboardList");


  const scores =
    getScores()
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 10);


  if (!scores.length) {

    list.innerHTML = `

      <div class="empty">
        No champions yet.
        Be the first!
      </div>

    `;

    return;

  }


  list.innerHTML =
    scores
      .map(
        (score, index) => `

          <div class="leader-row">

            <span class="rank">
              #${index + 1}
            </span>

            <span class="name">
              ${escapeHtml(
                score.name
              )}
            </span>

            <span class="score">
              ${score.score}
            </span>

          </div>

        `
      )
      .join("");

}


// =====================================================
// START GAME
// =====================================================

$("#startBtn").onclick = () => {

  showScreen("briefing");

  beep(
    500,
    0.1
  );

};


// =====================================================
// BEGIN PROTOCOL
// =====================================================

$("#beginBtn").onclick = () => {

  state = {

    ...state,

    mission: 0,

    xp: 0,

    combo: 1,

    bestCombo: 1,

    lives: 3

  };


  showScreen("game");


  loadLevel(0);


  beep(
    600,
    0.1
  );

};


// =====================================================
// LEADERBOARD BUTTON
// =====================================================

$("#leaderBtn").onclick = () => {

  renderLeaderboard();

  showScreen("leader");

};


// =====================================================
// FINAL LEADERBOARD
// =====================================================

$("#finalLeaderBtn").onclick = () => {

  renderLeaderboard();

  showScreen("leader");

};


// =====================================================
// CLOSE LEADERBOARD
// =====================================================

$("#closeLeaderBtn").onclick = () => {

  showScreen("start");

};


// =====================================================
// REPLAY
// =====================================================

$("#replayBtn").onclick = () => {

  $("#playerName").value = "";

  showScreen("briefing");

};


// =====================================================
// SAVE SCORE
// =====================================================

$("#saveScoreBtn").onclick = () => {

  const name =
    (
      $("#playerName")
        .value
        .trim() ||
      "PLAYER"
    ).slice(0, 14);


  const scores =
    getScores();


  scores.push({

    name: name,

    score: state.finalScore

  });


  scores.sort(
    (a, b) =>
      b.score - a.score
  );


  localStorage.setItem(
    "onamExeScores",
    JSON.stringify(
      scores.slice(0, 20)
    )
  );


  toast(
    "Score saved to the Hall of Fame!"
  );


  renderLeaderboard();


  setTimeout(() => {

    showScreen("leader");

  }, 500);

};


// =====================================================
// SOUND BUTTON
// =====================================================

$("#soundBtn").onclick = () => {

  state.sound =
    !state.sound;


  $("#soundBtn").textContent =
    state.sound
      ? "🔊"
      : "🔇";


  if (state.sound) {

    beep(
      500,
      0.08
    );

  }

};


// =====================================================
// HELP MODAL
// =====================================================

$("#helpBtn").onclick = () => {

  $("#helpModal")
    .classList
    .remove("hidden");

};


$("#closeHelp").onclick = () => {

  $("#helpModal")
    .classList
    .add("hidden");

};


$("#helpModal").onclick = (
  event
) => {

  if (
    event.target.id ===
    "helpModal"
  ) {

    $("#helpModal")
      .classList
      .add("hidden");

  }

};


// =====================================================
// INITIAL HUD
// =====================================================

updateHud();