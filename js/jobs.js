// Lấy thông tin từ localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || {}; // Thông tin người dùng hiện tại

// Lọc nhiệm vụ theo dự án và người dùng
function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = ""; // Reset bảng nhiệm vụ

    // Lọc các nhiệm vụ dựa trên dự án mà người dùng thuộc về
    const userProjects = projects.filter(project => 
        project.members.some(member => member.userId === currentUser.id) // Kiểm tra người dùng có phải thành viên trong dự án không
    );

    // Hiển thị tên dự án và nhiệm vụ bên dưới dự án, chỉ hiển thị nếu có nhiệm vụ của người dùng
    userProjects.forEach(project => {
        // Lọc các nhiệm vụ của dự án cho người dùng hiện tại
        const projectTasks = tasks.filter(task => task.projectId === project.id && task.assigneeId === currentUser.id); // Chỉ lấy nhiệm vụ của người dùng hiện tại
        
        // Nếu có nhiệm vụ, hiển thị tên dự án và các nhiệm vụ
        if (projectTasks.length > 0) {
            // Tạo hàng tiêu đề cho dự án
            const projectRow = document.createElement("tr");
            projectRow.classList.add("project-row");
            projectRow.innerHTML = `
                <td colspan="7">
                    <button class="toggle-btn" onclick="toggleTasks(${project.id})">▼</button>
                    <strong>${project.name.toUpperCase()}</strong>
                </td>
            `;
            taskList.appendChild(projectRow);

            // Hiển thị các nhiệm vụ của dự án
            projectTasks.forEach(task => {
                const taskRow = document.createElement("tr");
                taskRow.classList.add("task-row", `task-project-${project.id}`);
                taskRow.style.display = "none";
                taskRow.innerHTML = `
                    <td>${task.taskName}</td>
                    <td><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
                    <td>${getStatusText(task.status)}</td>
                    <td>${formatDate(task.asignDate)}</td>
                    <td>${formatDate(task.dueDate)}</td>
                    <td><span class="progress-badge ${getProgressClass(task.progress)}">${task.progress}</span></td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${task.id}">Sửa</button>
                        <button class="action-btn delete-btn" data-id="${task.id}">Xóa</button>
                    </td>
                `;
                taskList.appendChild(taskRow);
            });
        }
    });
}

// Các hàm hỗ trợ để lấy thông tin trạng thái, ưu tiên và tiến độ của nhiệm vụ
function getStatusText(value) {
    return { "1": "To do", "2": "In Progress", "3": "Pending", "4": "Done" }[value] || "";
}

function getPriorityClass(priority) {
    return { "Thấp": "blue", "Trung Bình": "orange", "Cao": "red" }[priority] || "";
}

function getProgressClass(progress) {
    return { "Đúng tiến độ": "green", "Có rủi ro": "orange", "Trễ hạn": "red" }[progress] || "";
}

function formatDate(time) {
    if (!time) return "";
    const [year, month, day] = time.split("-");
    return `${day} - ${month}`;
}

// Hàm toggle (mở/đóng) danh sách nhiệm vụ trong mỗi dự án
function toggleTasks(projectId) {
    const taskRows = document.querySelectorAll(`.task-project-${projectId}`);
    const toggleButton = document.querySelector(`.toggle-btn[onclick="toggleTasks(${projectId})"]`);

    taskRows.forEach(row => {
        if (row.style.display === "none") {
            row.style.display = "table-row"; 
            toggleButton.textContent = "▲";  
        } else {
            row.style.display = "none";  
            toggleButton.textContent = "▼";  
        }
    });
}

// Lọc và hiển thị nhiệm vụ theo tìm kiếm
document.querySelector(".search-input").addEventListener("input", function() {
    const keyword = this.value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.taskName.toLowerCase().includes(keyword));
    renderFilteredTasks(filteredTasks);
});

// Hiển thị nhiệm vụ đã lọc
function renderFilteredTasks(filteredTasks) {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    filteredTasks.forEach(task => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${task.taskName}</td>
            <td><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
            <td>${getStatusText(task.status)}</td>
            <td>${formatDate(task.asignDate)}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td><span class="progress-badge ${getProgressClass(task.progress)}">${task.progress}</span></td>
        `;
        taskList.appendChild(row);
    });
}

// Hiển thị nhiệm vụ khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    renderTasks();
});

// -------------------------
// PHẦN MODAL THÊM / SỬA NHIỆM VỤ
// -------------------------
const modal = document.querySelector('#taskModal');
const addTaskBtn = document.querySelector('#addTaskBtn');
const closeBtn = document.querySelector('#modalClose');
const cancelBtn = document.querySelector('#modalCancel');

// Render danh sách “Người phụ trách” dựa trên thành viên trong dự án
function renderAssigneeOptions() {
  const taskAssigneeSelect = document.getElementById("taskAssignee");
  if (!taskAssigneeSelect) return;
  taskAssigneeSelect.innerHTML = "";

  const project = projects.find(p => p.id == projectId);
  if (!project) return;

  // Option mặc định
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Chọn người phụ trách";
  taskAssigneeSelect.appendChild(defaultOption);

  project.members.forEach(member => {
    const user = registeredUsers.find(u => u.id === member.userId);
    if (user) {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.fullname;
      taskAssigneeSelect.appendChild(option);
    }
  });
}

addTaskBtn.addEventListener('click', () => {
  document.getElementById("taskName").value = "";
  renderAssigneeOptions();
  modal.style.display = 'flex';
});
closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });

// Lưu nhiệm vụ mới (thêm)
document.getElementById("taskSave").addEventListener("click", () => {
  const taskName = document.getElementById("taskName").value.trim();
  const assigneeId = document.getElementById("taskAssignee").value;
  const status = document.getElementById("taskStatus").value;
  const startDate = document.getElementById("taskStartDate").value;
  const endDate = document.getElementById("taskEndDate").value;
  const priorityText = document.getElementById("taskPriority").selectedOptions[0].text;
  const progressText = document.getElementById("taskProgress").selectedOptions[0].text;

  if (!taskName || !assigneeId || !startDate || !endDate) {
    Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "warning");
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    Swal.fire("Lỗi", "Hạn chót phải sau ngày bắt đầu!", "error");
    return;
  }

  const existingTask = tasks.find(t => t.taskName.toLowerCase() === taskName.toLowerCase());
  if (existingTask) {
    Swal.fire("Lỗi", "Tên nhiệm vụ đã tồn tại!", "error");
    return;
  }

  const newTask = {
    id: Date.now(),
    taskName,
    assigneeId: parseInt(assigneeId),
    projectId: parseInt(projectId),
    asignDate: startDate,
    dueDate: endDate,
    priority: priorityText,
    progress: progressText,
    status: getStatusText(status)
  };

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  Swal.fire("Thành công", "Đã thêm nhiệm vụ mới!", "success");
  modal.style.display = "none";
  renderTasks();
});

// Xử lý event DELETE & EDIT nhiệm vụ
document.addEventListener("click", function (e) {
  // Xóa nhiệm vụ
  if (e.target.classList.contains("delete-btn")) {
    const taskId = parseInt(e.target.dataset.id);
    Swal.fire({
      title: "Bạn có chắc?",
      text: "Hành động này sẽ xóa nhiệm vụ!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then(result => {
      if (result.isConfirmed) {
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
        Swal.fire("Đã xóa!", "Nhiệm vụ đã được xóa.", "success");
      }
    });
  }

  // Chỉnh sửa nhiệm vụ
  if (e.target.classList.contains("edit-btn")) {
    const taskId = parseInt(e.target.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    renderAssigneeOptions();
    document.getElementById("taskName").value = task.taskName;
    document.getElementById("taskAssignee").value = task.assigneeId;
    document.getElementById("taskStatus").value = Object.entries({
      "1": "To do",
      "2": "In Progress",
      "3": "Pending",
      "4": "Done"
    }).find(([k, v]) => v === task.status)?.[0] || "";
    document.getElementById("taskStartDate").value = task.asignDate;
    document.getElementById("taskEndDate").value = task.dueDate;
    document.getElementById("taskPriority").value = { "Thấp": "1", "Trung Bình": "2", "Cao": "3" }[task.priority];
    document.getElementById("taskProgress").value = { "Đúng tiến độ": "1", "Có rủi ro": "2", "Trễ hạn": "3" }[task.progress];

    modal.style.display = 'flex';

    // Cập nhật khi nhấn nút Lưu trong modal sửa nhiệm vụ
    document.getElementById("taskSave").onclick = () => {
      const taskName = document.getElementById("taskName").value.trim();
      const assigneeId = document.getElementById("taskAssignee").value;
      const status = document.getElementById("taskStatus").value;
      const startDate = document.getElementById("taskStartDate").value;
      const endDate = document.getElementById("taskEndDate").value;
      const priorityText = document.getElementById("taskPriority").selectedOptions[0].text;
      const progressText = document.getElementById("taskProgress").selectedOptions[0].text;

      if (!taskName || !assigneeId || !startDate || !endDate) {
        Swal.fire("Lỗi", "Vui lòng nhập đầy đủ thông tin!", "warning");
        return;
      }
      if (new Date(endDate) <= new Date(startDate)) {
        Swal.fire("Lỗi", "Hạn chót phải sau ngày bắt đầu!", "error");
        return;
      }

      task.taskName = taskName;
      task.assigneeId = parseInt(assigneeId);
      task.status = getStatusText(status);
      task.asignDate = startDate;
      task.dueDate = endDate;
      task.priority = priorityText;
      task.progress = progressText;

      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
      modal.style.display = 'none';
      Swal.fire("Cập nhật", "Nhiệm vụ đã được cập nhật", "success");
    };
  }
});
