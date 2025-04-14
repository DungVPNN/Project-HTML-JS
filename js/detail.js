// -------------------------
// Lấy thông tin từ URL (ví dụ: ?id=1)
// -------------------------
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

// -------------------------
// Lấy dữ liệu từ localStorage
// -------------------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || [];

// -------------------------
// DOM ELEMENTS
// -------------------------
const teamMember = document.querySelector("#team-members");
const projectInfor = document.querySelector("#project-infor");
const nameInfor = document.querySelector("#name-infor");
const desInfor = document.querySelector("#des-infor");
const logout = document.querySelector("#logout");

// -------------------------
// KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
// -------------------------
function checkLogin() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (!isLoggedIn || isLoggedIn !== "true") {
    Swal.fire({
      icon: "error",
      title: "Bạn chưa đăng nhập",
      text: "Vui lòng đăng nhập",
      confirmButtonText: "OK"
    }).then(() => {
      window.location.href = "login.html";
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  checkLogin();
});

// -------------------------
// HIỂN THỊ THÔNG TIN DỰ ÁN & THÀNH VIÊN
// -------------------------
// Render thông tin dự án
function renderProjectInfor(){
   const project = projects.find(p => p.id == projectId);
   if(project){
      nameInfor.textContent = project.name;
      desInfor.textContent = project.desc;
   }
}
renderProjectInfor();

// Render danh sách thành viên của dự án
function renderMember() {
  const project = projects.find(p => p.id == projectId);
  if (project) {
    const html = project.members.map(member => {
      const user = registeredUsers.find(u => u.id === member.userId);
      if (user) {
        return `
          <div class="member">
            <div class="avatar blue">${user.fullname.slice(0, 2).toUpperCase()}</div>
            <div class="member-name">${user.fullname}</div>
            <div class="member-role">${member.role}</div>
          </div>
        `;
      }
      return '';
    });
    teamMember.innerHTML = html.join('');
  } else {
    teamMember.innerHTML = "<p>Không tìm thấy dự án</p>";
  }
}
renderMember();

// -------------------------
// HÀM HỖ TRỢ (FORMAT, UTILS)
// -------------------------
function formatDate(time) {
  if (!time) return "";
  const [year, month, day] = time.split("-");
  return `${day} - ${month}`;
}

function getStatusText(value) {
  return { "1": "To do", "2": "In Progress", "3": "Pending", "4": "Done" }[value] || "";
}

function getPriorityClass(priority) {
  return { "Thấp": "blue", "Trung Bình": "orange", "Cao": "red" }[priority] || "";
}

function getProgressClass(progress) {
  return { "Đúng tiến độ": "green", "Có rủi ro": "orange", "Trễ hạn": "red" }[progress] || "";
}

function groupTasksByStatus(tasks) {
  return tasks.reduce((groups, task) => {
    (groups[task.status] = groups[task.status] || []).push(task);
    return groups;
  }, {});
}


// -------------------------
// QUẢN LÝ NHIỆM VỤ
// -------------------------
function renderTasks() {
  const taskList = document.querySelector('#taskList');
  if (!taskList) return;

  // Lọc các nhiệm vụ chỉ thuộc về dự án hiện tại
  const projectTasks = tasks.filter(task => task.projectId == projectId);

  const grouped = groupTasksByStatus(projectTasks);
  taskList.innerHTML = '';

  for (const status in grouped) {
    taskList.innerHTML += `
      <tr class="task-group">
        <td colspan="7">
          <span class="task-group-icon">▼</span> ${status}
        </td>
      </tr>`;

    taskList.innerHTML += grouped[status].map(task => {
      // Lấy thông tin người phụ trách dựa trên assigneeId
      const user = registeredUsers.find(u => u.id === task.assigneeId);
      const assigneeName = user ? user.fullname : 'N/A';
      return `
        <tr>
          <td>${task.taskName}</td>
          <td>${assigneeName}</td>
          <td><span class="badge ${getPriorityClass(task.priority)}">${task.priority}</span></td>
          <td>${formatDate(task.asignDate)}</td>
          <td>${formatDate(task.dueDate)}</td>
          <td><span class="progress-badge ${getProgressClass(task.progress)}">${task.progress}</span></td>
          <td>
            <button class="action-btn edit-btn" data-id="${task.id}">Sửa</button>
            <button class="action-btn delete-btn" data-id="${task.id}">Xóa</button>
          </td>
        </tr>`;
    }).join('');
  }

  // Xử lý thu gọn/hiện nhóm nhiệm vụ
  document.querySelectorAll('.task-group').forEach(group => {
    group.addEventListener('click', () => {
      const icon = group.querySelector('.task-group-icon');
      let next = group.nextElementSibling;
      while (next && !next.classList.contains('task-group')) {
        next.classList.toggle('collapsed');
        next = next.nextElementSibling;
      }
      icon.textContent = icon.textContent === '▶' ? '▼' : '▶';
    });
  });
}
renderTasks();

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

// -------------------------
// PHẦN MODAL THÊM THÀNH VIÊN (Member Modal)
// -------------------------
const memberModal = document.querySelector('#memberModal');
const addMemberBtn = document.querySelector('#addMemberBtn');
const memberClose = document.querySelector('#memberClose');
const memberCancel = document.querySelector('#memberCancel');
const memberSave = document.querySelector('#memberSave');

// Mở modal thêm thành viên
addMemberBtn.addEventListener('click', () => {
  memberModal.style.display = 'flex';
});

// Đóng modal thêm thành viên khi bấm "x" hoặc "Hủy"
[memberClose, memberCancel].forEach(btn => {
  btn.addEventListener('click', () => {
    memberModal.style.display = 'none';
  });
});

// Xử lý khi bấm nút "Lưu" thêm thành viên
memberSave.addEventListener('click', () => {
  const email = document.getElementById("memberEmail").value.trim();
  const role = document.getElementById("memberRole").value.trim();

  // Kiểm tra thông tin đầu vào
  if (!email || !role) {
      Swal.fire("Lỗi", "Vui lòng nhập email và vai trò!", "warning");
      return;
  }

  // Tìm dự án hiện tại
  const project = projects.find(p => p.id == projectId);
  if (!project) {
      Swal.fire("Lỗi", "Không tìm thấy dự án!", "error");
      return;
  }

  // Kiểm tra xem người dùng có đăng ký hay chưa (so sánh theo email)
  const user = registeredUsers.find(u => u.email === email);
  if (!user) {
      Swal.fire("Lỗi", "Người dùng này chưa đăng ký!", "error");
      return;
  }

  // Kiểm tra nếu user đã có trong project.members hay chưa
  const alreadyInProject = project.members.some(m => m.userId === user.id);
  if (alreadyInProject) {
      Swal.fire("Lỗi", "Người dùng này đã có trong dự án!", "error");
      return;
  }

  // Thêm thành viên vào dự án với cấu trúc { userId, role }
  project.members.push({
      userId: user.id,
      role: role,
  });

  // Lưu lại danh sách thành viên mới vào localStorage
  localStorage.setItem("projects", JSON.stringify(projects));

  // Đóng modal và làm mới giao diện
  memberModal.style.display = 'none';
  document.getElementById("memberEmail").value = "";
  document.getElementById("memberRole").value = "";
  renderMember();  // Hàm render lại danh sách thành viên
  Swal.fire("Thành công", "Đã thêm thành viên vào dự án!", "success");
});
// -------------------------
// HÀM ĐĂNG XUẤT CHUNG
// -------------------------
function logoutUser(event) {
  event.preventDefault();
  Swal.fire({
    title: "Xác nhận đăng xuất?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy"
  }).then(result => {
    if (result.isConfirmed) {
      // Xóa thông tin đăng nhập khỏi localStorage
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('currentUser'); // Xóa thông tin người dùng

      // Chuyển hướng đến trang đăng nhập
      window.location.href = 'login.html'; // Hoặc URL của trang đăng nhập của bạn
    }
  });
}

// Xử lý sự kiện logout
logout.addEventListener("click", logoutUser);