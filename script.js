const DURATIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

let phase = "work";
let timeLeft = DURATIONS.work;
let phaseTotal = DURATIONS.work;

let interval = null;
let endTime = null;
let isRunning = false;

let sessions = Number(localStorage.getItem("sessions")) || 0;
let goal = Number(localStorage.getItem("goal")) || 6;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const phaseEl = document.getElementById("phase");
const timerEl = document.getElementById("timer");
const sessionsEl = document.getElementById("sessions");
const messageEl = document.getElementById("message");

const progressBar = document.getElementById("progressBar");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const resetBtn = document.getElementById("resetBtn");

const goalInput = document.getElementById("goalInput");
const saveGoalBtn = document.getElementById("saveGoalBtn");
const goalProgress = document.getElementById("goalProgress");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const totalSessionsEl = document.getElementById("totalSessions");
const completedTasksEl = document.getElementById("completedTasks");

const themeBtn = document.getElementById("themeBtn");

goalInput.value = goal;

function formatTime(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;

  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;

  return `${m}:${s}`;
}

function updateTimer() {
  timerEl.textContent = formatTime(timeLeft);

  if (timeLeft <= 10) {
    timerEl.classList.add("warning");
  } else {
    timerEl.classList.remove("warning");
  }

  let percent = ((phaseTotal - timeLeft) / phaseTotal) * 100;
  progressBar.style.width = percent + "%";
}

function updateScreen() {
  if (phase === "work") phaseEl.textContent = "Work";
  if (phase === "shortBreak") phaseEl.textContent = "Short Break";
  if (phase === "longBreak") phaseEl.textContent = "Long Break";

  sessionsEl.textContent = sessions;
  goalProgress.textContent = `${sessions} / ${goal}`;
  totalSessionsEl.textContent = sessions;

  const completed = tasks.filter(task => task.done).length;
  completedTasksEl.textContent = completed;

  updateTimer();
}

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  endTime = Date.now() + timeLeft * 1000;

  messageEl.textContent = "Timer is running...";

  interval = setInterval(() => {
    timeLeft = Math.ceil((endTime - Date.now()) / 1000);

    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(interval);
      isRunning = false;
      updateScreen();
      finishPhase();
      return;
    }

    updateScreen();
  }, 300);
}

function pauseTimer() {
  if (!isRunning) return;

  clearInterval(interval);
  timeLeft = Math.ceil((endTime - Date.now()) / 1000);
  isRunning = false;

  messageEl.textContent = "Paused";
  updateScreen();
}

function resumeTimer() {
  startTimer();
}

function resetTimer() {
  clearInterval(interval);

  phase = "work";
  timeLeft = DURATIONS.work;
  phaseTotal = DURATIONS.work;
  isRunning = false;

  messageEl.textContent = "Reset done";

  updateScreen();
}

function finishPhase() {
  if (phase === "work") {
    sessions++;
    localStorage.setItem("sessions", sessions);

    if (sessions % 4 === 0) {
      phase = "longBreak";
      timeLeft = DURATIONS.longBreak;
      phaseTotal = DURATIONS.longBreak;
      messageEl.textContent = "Long break will start in 3 seconds";
    } else {
      phase = "shortBreak";
      timeLeft = DURATIONS.shortBreak;
      phaseTotal = DURATIONS.shortBreak;
      messageEl.textContent = "Short break will start in 3 seconds";
    }
  } else {
    phase = "work";
    timeLeft = DURATIONS.work;
    phaseTotal = DURATIONS.work;
    messageEl.textContent = "Work will start in 3 seconds";
  }

  updateScreen();

  setTimeout(() => {
    startTimer();
  }, 3000);
}

function saveGoal() {
  goal = Number(goalInput.value);

  if (goal <= 0) return;

  localStorage.setItem("goal", goal);
  updateScreen();
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") return;

  const task = {
    id: Date.now(),
    text: text,
    done: false
  };

  tasks.push(task);
  saveTasks();
  showTasks();

  taskInput.value = "";
}

function showTasks() {
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    if (task.done) {
      li.classList.add("done");
    }

    li.innerHTML = `
      <span>${task.text}</span>
      <div>
        <button onclick="toggleTask(${task.id})">Done</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateScreen();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      task.done = !task.done;
    }

    return task;
  });

  saveTasks();
  showTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);

  saveTasks();
  showTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

function loadTheme() {
  const theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark");
  }
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

saveGoalBtn.addEventListener("click", saveGoal);
addTaskBtn.addEventListener("click", addTask);
themeBtn.addEventListener("click", toggleTheme);

loadTheme();
showTasks();
updateScreen();
