// jobs.js

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

function getStatusText(value) {
  return {
    "1": "To do",
    "2": "In Progress",
    "3": "Pending",
    "4": "Done"
  }[value] || value;
}

function getPriorityClass(priority) {
  return {
    "Thấp": "blue",
    "Trung Bình": "orange",
    "Cao": "red"
  }[priority] || "";
}

function getProgressClass(progress) {
  return {
    "Đúng tiến độ": "green",
    "Có rủi ro": "orange",
    "Trễ hạn": "red"
  }[progress] || "";
}

function formatDate(time) {
  if (!time) return "";
  const [year, month, day] = time.split("-");
  return `<span style="color:#007bff; font-weight: 500">${day} - ${month}</span>`;
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  const userProjects = projects.filter(project =>
    project.members.some(member => member.userId === currentUser.id)
  );

  userProjects.forEach(project => {
    const projectTasks = tasks.filter(task =>
      task.projectId === project.id && task.assigneeId === currentUser.id
    );

    if (projectTasks.length > 0) {
      const projectRow = document.createElement("tr");
      projectRow.classList.add("project-row");
      projectRow.innerHTML = `
        <td colspan="6" style="text-align: left;">
          <button class="toggle-btn" onclick="toggleTasks(${project.id})">▲</button>
          <strong>${project.name}</strong>
        </td>
         `;
      taskList.appendChild(projectRow);

      projectTasks.forEach(task => {
        const taskRow = document.createElement("tr");
        taskRow.classList.add("task-row", `task-project-${project.id}`);
        taskRow.style.display = "table-row";
        taskRow.innerHTML = `
          <td>${task.taskName}</td>
          <td><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
          <td><span>${getStatusText(task.status)} <img src="../assets/icon/edit-status.svg" alt style="width:12px; margin-left:4px"></span></td>
          <td>${formatDate(task.asignDate)}</td>
          <td>${formatDate(task.dueDate)}</td>
          <td><span class="progress-badge ${getProgressClass(task.progress)}">${task.progress}</span></td>
        `;
        taskList.appendChild(taskRow);
      });
    }
  });
}

function toggleTasks(projectId) {
  const rows = document.querySelectorAll(`.task-project-${projectId}`);
  const toggleBtn = document.querySelector(`.toggle-btn[onclick="toggleTasks(${projectId})"]`);
  let currentlyVisible = Array.from(rows).every(row => row.style.display === "table-row");

  rows.forEach(row => {
    row.style.display = currentlyVisible ? "none" : "table-row";
  });
  toggleBtn.textContent = currentlyVisible ? "▼" : "▲";
}

document.querySelector(".search-input").addEventListener("input", function () {
  const keyword = this.value.toLowerCase();
  const filtered = tasks.filter(task =>
    task.taskName.toLowerCase().includes(keyword) &&
    task.assigneeId === currentUser.id
  );
  renderFilteredTasks(filtered);
});

function renderFilteredTasks(filteredTasks) {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  filteredTasks.forEach(task => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.taskName}</td>
      <td><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
      <td><span>${getStatusText(task.status)} <img src="../assets/icon/edit-status.svg" alt style="width:12px; margin-left:4px"></span></td>
      <td>${formatDate(task.asignDate)}</td>
      <td>${formatDate(task.dueDate)}</td>
      <td><span class="progress-badge ${getProgressClass(task.progress)}">${task.progress}</span></td>
    `;
    taskList.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", renderTasks);
