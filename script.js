let tasks = [];

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const timerInput = document.getElementById('timer-input');
const todoList = document.getElementById('todo-list');

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function renderTasks() {
  todoList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = '';
    if (task.completed) li.classList.add('completed');
    if (task.timerEnded) li.classList.add('timer-ended');

    if (task.editing) {
      li.innerHTML = `
        <input type="text" class="edit-input" value="${task.text}" />
        <input type="number" class="edit-timer-input" min="0" step="1" value="${task.timer ? Math.ceil(task.timer / 60) : 0}" placeholder="Timer (minutes)" />
        <div class="task-actions">
          <button class="save-btn">Save</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      `;
      li.querySelector('.save-btn').onclick = () => {
        const newText = li.querySelector('.edit-input').value.trim();
        let newTimer = parseInt(li.querySelector('.edit-timer-input').value);
        if (isNaN(newTimer) || newTimer < 0) newTimer = 0;
        if (newText) {
          tasks[idx].text = newText;
          tasks[idx].timer = newTimer > 0 ? newTimer * 60 : 0;
          tasks[idx].remaining = newTimer > 0 ? newTimer * 60 : 0;
          tasks[idx].timerEnded = false;
          tasks[idx].editing = false;
          tasks[idx].timerRunning = false;
          clearInterval(tasks[idx].intervalId);
          renderTasks();
        }
      };
      li.querySelector('.cancel-btn').onclick = () => {
        tasks[idx].editing = false;
        renderTasks();
      };
    } else {
      li.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} />
          <span class="task-text">${task.text}</span>
          ${task.timer ? `<span class="task-timer">${formatTime(task.remaining)}</span>` : ''}
        </div>
        <div class="task-actions">
          ${task.timer ? (task.timerRunning 
            ? `<button class="pause-btn">Pause</button>` 
            : `<button class="start-btn">Start</button>`) : ''}
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
          ${task.timer ? `<button class="reset-btn">Reset</button>` : ''}
        </div>
      `;

      // Checkbox toggle
      li.querySelector('.checkbox').onchange = () => {
        tasks[idx].completed = !tasks[idx].completed;
        renderTasks();
      };

      // Start/Pause timer
      if (task.timer) {
        const startBtn = li.querySelector('.start-btn');
        const pauseBtn = li.querySelector('.pause-btn');
        const resetBtn = li.querySelector('.reset-btn');

        if (startBtn) {
          startBtn.onclick = () => startTimer(idx);
        }
        if (pauseBtn) {
          pauseBtn.onclick = () => pauseTimer(idx);
        }
        if (resetBtn) {
          resetBtn.onclick = () => resetTimer(idx);
        }
      }

      // Edit task
      li.querySelector('.edit-btn').onclick = () => {
        tasks[idx].editing = true;
        renderTasks();
      };

      // Delete task
      li.querySelector('.delete-btn').onclick = () => {
        clearInterval(tasks[idx].intervalId);
        tasks.splice(idx, 1);
        renderTasks();
      };
    }
    todoList.appendChild(li);
  });
}

function startTimer(idx) {
  if (tasks[idx].timerRunning || tasks[idx].timerEnded) return;
  tasks[idx].timerRunning = true;
  tasks[idx].timerEnded = false;
  tasks[idx].intervalId = setInterval(() => {
    if (tasks[idx].remaining > 0) {
      tasks[idx].remaining--;
      renderTasks();
    } else {
      clearInterval(tasks[idx].intervalId);
      tasks[idx].timerRunning = false;
      tasks[idx].timerEnded = true;
      renderTasks();
      alert(`⏰ Timer ended for task: "${tasks[idx].text}"`);
    }
  }, 1000);
  renderTasks();
}

function pauseTimer(idx) {
  if (!tasks[idx].timerRunning) return;
  clearInterval(tasks[idx].intervalId);
  tasks[idx].timerRunning = false;
  renderTasks();
}

function resetTimer(idx) {
  clearInterval(tasks[idx].intervalId);
  tasks[idx].timerRunning = false;
  tasks[idx].timerEnded = false;
  tasks[idx].remaining = tasks[idx].timer;
  renderTasks();
}

todoForm.onsubmit = function (e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  let timerMinutes = parseInt(timerInput.value);
  if (isNaN(timerMinutes) || timerMinutes < 0) timerMinutes = 0;

  if (text) {
    const newTask = {
      text,
      completed: false,
      editing: false,
      timer: timerMinutes > 0 ? timerMinutes * 60 : 0,
      remaining: timerMinutes > 0 ? timerMinutes * 60 : 0,
      timerRunning: false,
      timerEnded: false,
      intervalId: null,
    };
    tasks.push(newTask);
    todoInput.value = '';
    timerInput.value = '';
    renderTasks();
  }
};

renderTasks();
