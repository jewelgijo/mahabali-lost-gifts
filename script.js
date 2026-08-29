// =====================================================
// MAHABALI.exe
// ONAM MEMORY // REFLEX // CULTURE CHALLENGE
// =====================================================

const $ = selector => document.querySelector(selector)

// =====================================================
// SCREEN REFERENCES
// =====================================================

const screens = {
  start: $("#startScreen"),
  briefing: $("#briefingScreen"),
  game: $("#gameScreen"),
  final: $("#finalScreen"),
  leader: $("#leaderScreen"),
}

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

  finalScore: 0,
}

// =====================================================
// SOUND
// =====================================================

function beep(
  frequency = 440,
  duration = 0.08,
  type = "sine",
) {
  if (!state.sound) return

  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext

    const ctx =
      beep.ctx ||
      (beep.ctx = new AudioContext())

    const oscillator =
      ctx.createOscillator()

    const gain =
      ctx.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency

    gain.gain.setValueAtTime(
      0.045,
      ctx.currentTime,
    )

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration,
    )

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start()

    oscillator.stop(
      ctx.currentTime + duration,
    )
  } catch (error) {
    console.log("Audio unavailable")
  }
}

// =====================================================
// TOAST
// =====================================================

function toast(message) {
  const element = $("#toast")

  if (!element) return

  element.textContent = message
  element.classList.add("show")

  setTimeout(() => {
    element.classList.remove("show")
  }, 1800)
}

// =====================================================
// SCREEN NAVIGATION
// =====================================================

function showScreen(name) {
  Object.values(screens).forEach(screen => {
    if (screen) {
      screen.classList.remove("active")
    }
  })

  if (screens[name]) {
    screens[name].classList.add("active")
  }

  window.scrollTo(0, 0)
}

// =====================================================
// HUD
// =====================================================

function updateHud() {
  const missionNumber = $("#missionNumber")
  const xpText = $("#xpText")
  const comboText = $("#comboText")
  const livesText = $("#livesText")
  const timerText = $("#timerText")
  const xpBar = $("#xpBar")

  if (missionNumber) {
    missionNumber.textContent =
      `${String(state.mission + 1).padStart(2, "0")} / 04`
  }

  if (xpText) {
    xpText.textContent =
      String(Math.floor(state.xp)).padStart(4, "0")
  }

  if (comboText) {
    comboText.textContent =
      `x${state.combo}`
  }

  if (livesText) {
    livesText.textContent =
      "♥ ".repeat(Math.max(0, state.lives)).trim() +
      (state.lives > 0 ? "" : "—")
  }

  if (timerText) {
    timerText.textContent =
      `00:${String(
        Math.max(0, state.time),
      ).padStart(2, "0")}`
  }

  if (xpBar) {
    xpBar.style.width =
      Math.min(
        100,
        (state.xp % 1000) / 10,
      ) + "%"
  }
}

// =====================================================
// TIMER
// =====================================================

function startTimer(seconds, onEnd) {
  clearInterval(state.timer)

  state.time = seconds
  updateHud()

  state.timer = setInterval(() => {
    state.time--

    updateHud()

    if (state.time <= 0) {
      clearInterval(state.timer)

      if (typeof onEnd === "function") {
        onEnd()
      }
    }
  }, 1000)
}

// =====================================================
// XP / COMBO
// =====================================================

function addXP(amount) {
  const earned =
    amount * Math.max(1, state.combo)

  state.xp += earned

  state.combo++

  state.bestCombo =
    Math.max(
      state.bestCombo,
      state.combo,
    )

  updateHud()

  toast(`+${earned} XP  🔥 x${state.combo}`)
}

// =====================================================
// MISTAKE / LIFE SYSTEM
// =====================================================

function mistake() {
  state.lives--

  state.combo = 1

  updateHud()

  beep(
    150,
    0.12,
    "sawtooth",
  )

  if (state.lives <= 0) {
    clearInterval(state.timer)

    toast("💀 All lives lost!")

    setTimeout(() => {
      state.lives = 3
      loadLevel(state.mission)
    }, 900)

    return true
  }

  return false
}

// =====================================================
// LEVEL LOADING
// =====================================================

function loadLevel(index) {
  clearInterval(state.timer)

  if (typeof state.levelTimer === "function") {
    state.levelTimer()
  }

  state.mission = index
  state.combo = 1

  updateHud()

  const container =
    $("#levelContainer")

  if (!container) return

  container.innerHTML = ""

  if (index === 0) {
    loadPookkalam(container)
  }

  if (index === 1) {
    loadVallam(container)
  }

  if (index === 2) {
    loadHunt(container)
  }

  if (index === 3) {
    loadChoice(container)
  }
}

// =====================================================
// LEVEL SHELL
// =====================================================

function levelShell(
  title,
  tag,
  description,
) {
  const element =
    document.createElement("div")

  element.className = "level-card"

  element.innerHTML = `
    <div class="level-header">
      <div>
        <div class="eyebrow">
          ${tag}
        </div>

        <h2>${title}</h2>

        <p>${description}</p>
      </div>

      <div class="level-tag">
        MISSION
        ${String(state.mission + 1).padStart(2, "0")}
      </div>
    </div>
  `

  return element
}

// =====================================================
// NEXT LEVEL
// =====================================================

function nextLevel() {
  clearInterval(state.timer)

  if (typeof state.levelTimer === "function") {
    state.levelTimer()
  }

  if (state.mission < 3) {
    state.mission++

    toast(
      `MISSION ${String(
        state.mission + 1,
      ).padStart(2, "0")} UNLOCKED`,
    )

    setTimeout(() => {
      loadLevel(state.mission)
    }, 700)
  } else {
    finishGame()
  }
}

// =====================================================
// MISSION 1
// POOKKALAM CORE
// =====================================================

function loadPookkalam(container) {
  const card = levelShell(
    "POOKKALAM CORE",
    "MEMORY // PRECISION",
    "Memorize the sequence. Then rebuild the Pookkalam before time runs out.",
  )

  container.appendChild(card)

  const flowers = [
    "🌼",
    "🌺",
    "🌸",
    "🪷",
    "🌻",
  ]

  // Random sequence every game
  const sequenceLength = 8

  const targetSequence = []

  for (let i = 0; i < sequenceLength; i++) {
    targetSequence.push(
      flowers[
        Math.floor(
          Math.random() * flowers.length,
        )
      ],
    )
  }

  state.pookPattern =
    targetSequence

  state.pookSelected = []

  // -------------------------------------------------
  // TARGET AREA
  // -------------------------------------------------

  const targetBox =
    document.createElement("div")

  targetBox.className =
    "memory-target"

  targetBox.innerHTML = `
    <div class="eyebrow">
      TARGET SEQUENCE
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
          `,
        )
        .join("")}
    </div>

    <p class="memory-status">
      MEMORIZE THE PATTERN
    </p>
  `

  card.appendChild(targetBox)

  // -------------------------------------------------
  // GRID
  // -------------------------------------------------

  const grid =
    document.createElement("div")

  grid.className =
    "pook-grid"

  // Ensure all target flower types
  // exist on the board.
  const boardFlowers = [
    ...targetSequence,
  ]

  // Add decoys until 25 cells
  while (boardFlowers.length < 25) {
    boardFlowers.push(
      flowers[
        Math.floor(
          Math.random() * flowers.length,
        )
      ],
    )
  }

  // Shuffle
  boardFlowers.sort(
    () => Math.random() - 0.5,
  )

  const buttons = []

  boardFlowers.forEach(
    (flower, index) => {
      const button =
        document.createElement("button")

      button.type = "button"

      button.className = "flower"

      button.textContent = flower

      button.dataset.flower = flower

      button.dataset.index = index

      button.disabled = true

      buttons.push(button)

      grid.appendChild(button)
    },
  )

  card.appendChild(grid)

  // -------------------------------------------------
  // START MEMORY PHASE
  // -------------------------------------------------

  let memoryTime = 5

  const status =
    targetBox.querySelector(
      ".memory-status",
    )

  status.textContent =
    `MEMORIZE THE PATTERN — ${memoryTime}`

  const memoryTimer =
    setInterval(() => {
      memoryTime--

      if (memoryTime > 0) {
        status.textContent =
          `MEMORIZE THE PATTERN — ${memoryTime}`
      } else {
        clearInterval(memoryTimer)

        targetBox.classList.add(
          "sequence-hidden",
        )

        status.textContent =
          "⚡ GO! REBUILD THE PATTERN"

        buttons.forEach(button => {
          button.disabled = false
        })

        startTimer(45, () => {
          toast("⏱ MEMORY TIMED OUT")

          setTimeout(() => {
            loadLevel(0)
          }, 700)
        })
      }
    }, 1000)

  // -------------------------------------------------
  // CLICK LOGIC
  // -------------------------------------------------

  buttons.forEach(button => {
    button.onclick = () => {
      if (button.disabled) return

      const expected =
        targetSequence[
          state.pookSelected.length
        ]

      const clicked =
        button.dataset.flower

      // Correct
      if (clicked === expected) {
        button.disabled = true

        button.classList.add(
          "selected",
          "correct",
        )

        state.pookSelected.push(
          clicked,
        )

        const targetItem =
          targetBox.querySelector(
            `[data-target="${state.pookSelected.length - 1}"]`,
          )

        if (targetItem) {
          targetItem.classList.add(
            "completed",
          )
        }

        beep(650, 0.07)

        addXP(80)

        if (
          state.pookSelected.length ===
          targetSequence.length
        ) {
          clearInterval(state.timer)

          buttons.forEach(
            button => {
              button.disabled = true
            },
          )

          targetBox.classList.remove(
            "sequence-hidden",
          )

          status.textContent =
            "✓ POOKKALAM RESTORED"

          addXP(250)

          toast(
            "🌸 POOKKALAM CORE RESTORED!",
          )

          setTimeout(
            nextLevel,
            1100,
          )
        }
      }

      // Wrong
      else {
        button.classList.add("wrong")

        setTimeout(() => {
          button.classList.remove(
            "wrong",
          )
        }, 400)

        if (!mistake()) {
          toast(
            `❌ Wrong! Find ${expected}`,
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
  const card = levelShell(
    "VALLAM RUSH",
    "REFLEX // SPEED",
    "Steer the snake boat, collect golden energy and avoid the rocks.",
  )

  container.appendChild(card)

  const wrap =
    document.createElement("div")

  wrap.className = "boat-wrap"

  wrap.innerHTML = `
    <div class="boat-track"></div>

    <div
      id="boatPlayer"
      class="boat-player"
    >
      🚣
    </div>
  `

  card.appendChild(wrap)

  const controls =
    document.createElement("div")

  controls.className =
    "boat-controls"

  controls.innerHTML = `
    <button
      class="ctrl"
      data-dir="-1"
      type="button"
    >
      ←
    </button>

    <button
      class="ctrl"
      data-dir="1"
      type="button"
    >
      →
    </button>
  `

  card.appendChild(controls)

  const player =
    () => $("#boatPlayer")

  state.boatX = 50
  state.boatObjects = []

  const move = direction => {
    state.boatX =
      Math.max(
        8,
        Math.min(
          92,
          state.boatX +
            direction * 8,
        ),
      )

    if (player()) {
      player().style.left =
        state.boatX + "%"
    }
  }

  controls
    .querySelectorAll("[data-dir]")
    .forEach(button => {
      button.onpointerdown = () => {
        move(
          Number(
            button.dataset.dir,
          ),
        )
      }
    })

  // Keyboard
  const oldKeyHandler =
    document.onkeydown

  document.onkeydown = event => {
    if (
      !screens.game ||
      !screens.game.classList.contains(
        "active",
      )
    ) {
      return
    }

    if (
      [
        "ArrowLeft",
        "a",
        "A",
      ].includes(event.key)
    ) {
      move(-1)
      event.preventDefault()
    }

    if (
      [
        "ArrowRight",
        "d",
        "D",
      ].includes(event.key)
    ) {
      move(1)
      event.preventDefault()
    }
  }

  // Spawn objects
  const spawn =
    setInterval(() => {
      const object =
        document.createElement("div")

      const rock =
        Math.random() < 0.3

      object.className =
        "boat-object"

      if (rock) {
        object.classList.add(
          "boat-rock",
        )
      }

      object.textContent =
        rock ? "🪨" : "🪙"

      const x =
        10 + Math.random() * 80

      object.style.left =
        x + "%"

      object.style.top =
        "-45px"

      wrap.appendChild(object)

      state.boatObjects.push({
        el: object,
        y: -45,
        x,
        rock,
        done: false,
      })
    }, 600)

  // Movement
  const tick =
    setInterval(() => {
      state.boatObjects.forEach(
        object => {
          object.y += 5

          object.el.style.top =
            object.y + "px"

          const hitY =
            object.y > 280 &&
            object.y < 360

          const distance =
            Math.abs(
              object.x -
                state.boatX,
            )

          if (
            hitY &&
            distance < 10 &&
            !object.done
          ) {
            object.done = true

            object.el.remove()

            if (object.rock) {
              if (!mistake()) {
                toast(
                  "🪨 ROCK HIT!",
                )
              }
            } else {
              addXP(70)

              beep(720, 0.07)

              toast(
                "🪙 GOLDEN ENERGY +XP",
              )
            }
          }
        },
      )

      state.boatObjects =
        state.boatObjects.filter(
          object =>
            object.y < 450 &&
            !object.done,
        )
    }, 45)

  const cleanup = () => {
    clearInterval(spawn)
    clearInterval(tick)

    document.onkeydown =
      oldKeyHandler
  }

  state.levelTimer =
    cleanup

  startTimer(35, () => {
    cleanup()

    toast(
      "🚣 RIVER CLEARED!",
    )

    nextLevel()
  })
}

// =====================================================
// MISSION 3
// ONAM HUNT
// =====================================================

function loadHunt(container) {
  const card = levelShell(
    "ONAM HUNT",
    "SEARCH // FOCUS",
    "Find the hidden festival objects. Avoid the decoys.",
  )

  container.appendChild(card)

  const area =
    document.createElement("div")

  area.className = "hunt-area"

  const targets = [
    "🪔",
    "🥥",
    "🍌",
    "🌴",
    "🎋",
    "🌺",
  ]

  state.huntFound = 0

  const usedPositions = []

  // -------------------------------------------------
  // TARGETS
  // -------------------------------------------------

  targets.forEach(
    (item, index) => {
      let x
      let y

      do {
        x =
          7 +
          Math.random() * 84

        y =
          8 +
          Math.random() * 78
      } while (
        usedPositions.some(
          position =>
            Math.abs(
              position.x - x,
            ) < 12 &&
            Math.abs(
              position.y - y,
            ) < 12,
        )
      )

      usedPositions.push({
        x,
        y,
      })

      const button =
        document.createElement("button")

      button.type = "button"

      button.className =
        "hunt-item"

      button.textContent = item

      button.style.left =
        x + "%"

      button.style.top =
        y + "%"

      button.onclick = () => {
        if (
          button.classList.contains(
            "found",
          )
        ) {
          return
        }

        button.classList.add(
          "found",
        )

        state.huntFound++

        addXP(100)

        beep(
          600 + index * 80,
          0.08,
        )

        toast(
          `${state.huntFound}/${targets.length} FOUND`,
        )

        if (
          state.huntFound ===
          targets.length
        ) {
          clearInterval(state.timer)

          addXP(300)

          toast(
            "🔎 ONAM HUNT COMPLETE!",
          )

          setTimeout(
            nextLevel,
            900,
          )
        }
      }

      area.appendChild(button)
    },
  )

  // -------------------------------------------------
  // DECOYS
  // -------------------------------------------------

  const decoys = [
    "❌",
    "⚠️",
    "👾",
    "💀",
    "🌀",
  ]

  for (
    let i = 0;
    i < decoys.length;
    i++
  ) {
    const button =
      document.createElement("button")

    button.type = "button"

    button.className =
      "hunt-item decoy"

    button.textContent =
      decoys[i]

    button.style.left =
      5 + Math.random() * 88 + "%"

    button.style.top =
      8 + Math.random() * 80 + "%"

    button.onclick = () => {
      if (
        button.classList.contains(
          "found",
        )
      ) {
        return
      }

      button.classList.add(
        "found",
      )

      if (!mistake()) {
        toast(
          "⚠️ DECOY! LIFE LOST",
        )
      }
    }

    area.appendChild(button)
  }

  card.appendChild(area)

  startTimer(40, () => {
    toast(
      "⏱ ONAM HUNT TIMED OUT",
    )

    setTimeout(() => {
      loadLevel(2)
    }, 700)
  })
}

// =====================================================
// MISSION 4
// MAHABALI'S CHOICE
// =====================================================

const questions = [
  {
    q: "Which festival is celebrated with the grand flower carpet called a Pookkalam?",
    a: [
      "Onam",
      "Vishu",
      "Thrissur Pooram",
      "Navaratri",
    ],
    c: 0,
  },

  {
    q: "Vallam Kali is traditionally associated with what?",
    a: [
      "Snake boat races",
      "Kite flying",
      "Drum battles",
      "Bull racing",
    ],
    c: 0,
  },

  {
    q: "What is the traditional vegetarian feast served on banana leaves during Onam?",
    a: [
      "Sadya",
      "Sadhya Roll",
      "Thali",
      "Kanji",
    ],
    c: 0,
  },

  {
    q: "The story of Onam is strongly associated with which legendary king?",
    a: [
      "Mahabali",
      "Ashoka",
      "Raja Raja Chola",
      "Krishnadevaraya",
    ],
    c: 0,
  },

  {
    q: "A modern way to keep Onam celebrations sustainable is to…",
    a: [
      "Use reusable decor",
      "Increase plastic waste",
      "Waste food",
      "Avoid local flowers",
    ],
    c: 0,
  },

  {
    q: "Which traditional item is commonly used to serve a Sadya?",
    a: [
      "Banana leaf",
      "Plastic tray",
      "Paper box",
      "Glass plate",
    ],
    c: 0,
  },

  {
    q: "Which activity is a famous part of Onam celebrations?",
    a: [
      "Vallam Kali",
      "Ice hockey",
      "Skiing",
      "Surfing",
    ],
    c: 0,
  },
]

// =====================================================
// CHOICE LEVEL
// =====================================================

function loadChoice(container) {
  const card = levelShell(
    "MAHABALI'S CHOICE",
    "CULTURE // LOGIC",
    "Answer rapid-fire Onam questions. Accuracy keeps your combo alive.",
  )

  container.appendChild(card)

  let questionIndex = 0

  const box =
    document.createElement("div")

  box.className =
    "question-box"

  card.appendChild(box)

  function renderQuestion() {
    const question =
      questions[
        questionIndex %
          questions.length
      ]

    box.innerHTML = `
      <div class="eyebrow">
        FINAL CHALLENGE
      </div>

      <div class="question-progress">
        ${questionIndex + 1} / 5
      </div>

      <h3>${question.q}</h3>

      <div class="answers"></div>
    `

    const answers =
      box.querySelector(
        ".answers",
      )

    question.a.forEach(
      (answer, index) => {
        const button =
          document.createElement("button")

        button.type = "button"

        button.className =
          "answer"

        button.textContent =
          answer

        button.onclick = () => {
          // Disable all answers
          box
            .querySelectorAll(
              ".answer",
            )
            .forEach(
              button => {
                button.disabled =
                  true
              },
            )

          if (
            index === question.c
          ) {
            button.classList.add(
              "correct",
            )

            addXP(180)

            beep(
              700,
              0.08,
            )

            questionIndex++

            if (
              questionIndex >= 5
            ) {
              clearInterval(
                state.timer,
              )

              addXP(500)

              toast(
                "👑 KINGDOM RESTORED!",
              )

              setTimeout(
                nextLevel,
                1100,
              )
            } else {
              setTimeout(
                renderQuestion,
                500,
              )
            }
          } else {
            button.classList.add(
              "wrong",
            )

            mistake()

            toast(
              "❌ INCORRECT — COMBO RESET",
            )

            setTimeout(
              renderQuestion,
              650,
            )
          }
        }

        answers.appendChild(
          button,
        )
      },
    )
  }

  renderQuestion()

  startTimer(45, () => {
    toast(
      "⏱ FINAL CHALLENGE TIMED OUT",
    )

    setTimeout(() => {
      loadLevel(3)
    }, 700)
  })
}

// =====================================================
// FINAL SCORE
// =====================================================

function finishGame() {
  clearInterval(state.timer)

  const score =
    Math.floor(
      state.xp +
        Math.max(
          0,
          state.time,
        ) *
          15 +
        state.bestCombo * 50,
    )

  state.finalScore =
    score

  const finalScore =
    $("#finalScore")

  const finalCombo =
    $("#finalCombo")

  const finalRank =
    $("#finalRank")

  if (finalScore) {
    finalScore.textContent =
      String(score).padStart(
        4,
        "0",
      )
  }

  if (finalCombo) {
    finalCombo.textContent =
      "x" +
      state.bestCombo
  }

  let rank = "C"

  if (score >= 7000) {
    rank = "S"
  } else if (score >= 5000) {
    rank = "A"
  } else if (score >= 3200) {
    rank = "B"
  }

  if (finalRank) {
    finalRank.textContent =
      rank
  }

  showScreen("final")

  beep(880, 0.2)

  setTimeout(() => {
    beep(1100, 0.2)
  }, 180)
}

// =====================================================
// LEADERBOARD
// =====================================================

function getScores() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "onamExeScores",
      ) || "[]",
    )
  } catch {
    return []
  }
}

function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    character =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  )
}

function renderLeaderboard() {
  const list =
    $("#leaderboardList")

  if (!list) return

  const scores =
    getScores()
      .sort(
        (a, b) =>
          b.score - a.score,
      )
      .slice(0, 10)

  if (!scores.length) {
    list.innerHTML = `
      <div class="empty">
        🏆 No champions yet.
        Be the first!
      </div>
    `

    return
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
                score.name,
              )}
            </span>

            <span class="score">
              ${score.score}
            </span>

          </div>
        `,
      )
      .join("")
}

// =====================================================
// START BUTTON
// =====================================================

const startBtn =
  $("#startBtn")

if (startBtn) {
  startBtn.onclick = () => {
    showScreen("briefing")

    beep(500, 0.1)
  }
}

// =====================================================
// BEGIN GAME
// =====================================================

const beginBtn =
  $("#beginBtn")

if (beginBtn) {
  beginBtn.onclick = () => {
    clearInterval(state.timer)

    state = {
      mission: 0,
      xp: 0,
      combo: 1,
      bestCombo: 1,
      lives: 3,
      time: 45,
      timer: null,
      levelTimer: null,
      sound: state.sound,

      boatX: 50,
      boatObjects: [],

      huntFound: 0,
      pookPattern: [],
      pookSelected: [],

      finalScore: 0,
    }

    updateHud()

    showScreen("game")

    loadLevel(0)

    beep(600, 0.1)
  }
}

// =====================================================
// LEADERBOARD BUTTON
// =====================================================

const leaderBtn =
  $("#leaderBtn")

if (leaderBtn) {
  leaderBtn.onclick = () => {
    renderLeaderboard()

    showScreen("leader")
  }
}

// =====================================================
// FINAL LEADERBOARD
// =====================================================

const finalLeaderBtn =
  $("#finalLeaderBtn")

if (finalLeaderBtn) {
  finalLeaderBtn.onclick = () => {
    renderLeaderboard()

    showScreen("leader")
  }
}

// =====================================================
// CLOSE LEADERBOARD
// =====================================================

const closeLeaderBtn =
  $("#closeLeaderBtn")

if (closeLeaderBtn) {
  closeLeaderBtn.onclick = () => {
    showScreen("start")
  }
}

// =====================================================
// REPLAY
// =====================================================

const replayBtn =
  $("#replayBtn")

if (replayBtn) {
  replayBtn.onclick = () => {
    const playerName =
      $("#playerName")

    if (playerName) {
      playerName.value = ""
    }

    showScreen("briefing")
  }
}

// =====================================================
// SAVE SCORE
// =====================================================

const saveScoreBtn =
  $("#saveScoreBtn")

if (saveScoreBtn) {
  saveScoreBtn.onclick = () => {
    const input =
      $("#playerName")

    const name =
      (
        input?.value.trim() ||
        "PLAYER"
      ).slice(0, 14)

    const scores =
      getScores()

    scores.push({
      name,
      score: state.finalScore,
    })

    scores.sort(
      (a, b) =>
        b.score - a.score,
    )

    localStorage.setItem(
      "onamExeScores",
      JSON.stringify(
        scores.slice(0, 20),
      ),
    )

    toast(
      "🏆 SCORE SAVED!",
    )

    renderLeaderboard()

    setTimeout(() => {
      showScreen("leader")
    }, 500)
  }
}

// =====================================================
// SOUND
// =====================================================

const soundBtn =
  $("#soundBtn")

if (soundBtn) {
  soundBtn.onclick = () => {
    state.sound =
      !state.sound

    soundBtn.textContent =
      state.sound
        ? "🔊"
        : "🔇"

    if (state.sound) {
      beep(500, 0.08)
    }
  }
}

// =====================================================
// HELP MODAL
// =====================================================

const helpBtn =
  $("#helpBtn")

const helpModal =
  $("#helpModal")

const closeHelp =
  $("#closeHelp")

if (helpBtn && helpModal) {
  helpBtn.onclick = () => {
    helpModal.classList.remove(
      "hidden",
    )
  }
}

if (closeHelp && helpModal) {
  closeHelp.onclick = () => {
    helpModal.classList.add(
      "hidden",
    )
  }
}

if (helpModal) {
  helpModal.onclick = event => {
    if (
      event.target.id ===
      "helpModal"
    ) {
      helpModal.classList.add(
        "hidden",
      )
    }
  }
}

// =====================================================
// INITIAL HUD
// =====================================================

updateHud()