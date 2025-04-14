// Variables
let popup = document.querySelector("#add-form");
let btnAdd = document.querySelector("#btn-add");
let btnCancel = document.querySelector("#btn-cancel");
let btnClose = document.querySelector("#popup-close");
let inputName = document.querySelector("#form-input");
let inputDesc = document.querySelector("#form-textarea");
let formSubmitBtn = document.querySelector("#btn-submit");
let searchInput = document.querySelector("#search-input");
let btnPages = document.querySelector("#btnPage");
let btnNext = document.querySelector("#next");
let btnPrev = document.querySelector("#prev");
let logout = document.querySelector("#logout");
let tbody = document.querySelector("tbody");

// Dữ liệu
let projects = JSON.parse(localStorage.getItem("projects")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];

// Hàm kiểm tra đăng nhập
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

let curentPage = 1;
let totalPerpage = 5;
let totalPage = Math.ceil(projects.length / totalPerpage);

// Hàm render các nút phân trang
const renderPages = () => {
  totalPage = Math.ceil(projects.length / totalPerpage);
  btnPages.textContent = "";
  for (let i = 1; i <= totalPage; i++) {
    const pageElement = document.createElement("button");
    pageElement.textContent = i;
    if (curentPage === i) {
      pageElement.classList.add("button-active");
    }
    btnPrev.disabled = curentPage === 1;
    btnNext.disabled = curentPage === totalPage;
    pageElement.addEventListener("click", function () {
      curentPage = i;
      renderPages();
      renderProjects(searchInput.value);
    });
    btnPages.appendChild(pageElement);
  }
};

btnNext.addEventListener("click", function () {
  if (curentPage < totalPage) {
    curentPage++;
    renderPages();
    renderProjects(searchInput.value);
  }
});

btnPrev.addEventListener("click", function () {
  if (curentPage > 1) {
    curentPage--;
    renderPages();
    renderProjects(searchInput.value);
  }
});

// Hàm render các dự án
function renderProjects(keyword = "") {
  // Lọc các dự án theo từ khóa và chỉ lấy các dự án mà currentUser là Project owner
  const userId = currentUser?.id;
  const filteredProjects = projects.filter(project => {
    return project.members?.some(member => member.userId === userId && member.role === "Project owner") && 
      project.name.toLowerCase().includes(keyword.toLowerCase());
  });

  // Phân trang cho các dự án đã lọc
  let startIndex = (curentPage - 1) * totalPerpage;
  let endIndex = totalPerpage * curentPage;
  let projectSlices = filteredProjects.slice(startIndex, endIndex);

  // Hiển thị các dự án trên trang hiện tại
  let html = projectSlices.map(function (project, index) {
    return `
      <tr>
        <td style="text-align:center;">${startIndex + index + 1}</td>
        <td>${project.name}</td>
        <td class="actions">
          <button onclick="handleEdit(${project.id})" class="btn-action btn-sua">Sửa</button>
          <button onclick="handleDelete(${project.id})" class="btn-action btn-xoa">Xóa</button>
          <button onclick="handleDetail(${project.id})" class="btn-action btn-chi-tiet">Chi tiết</button>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html.join("");

  // Cập nhật phân trang
  totalPage = Math.ceil(filteredProjects.length / totalPerpage);
  renderPages();
}

searchInput.oninput = function () {
  curentPage = 1; // Khi tìm kiếm, reset về trang đầu
  renderProjects(this.value);
};

// Mở popup thêm/sửa dự án
btnAdd.addEventListener("click", () => {
  openPopup();
  inputName.value = "";
  inputDesc.value = "";
  formSubmitBtn.onclick = handleCreate;
});

function openPopup() {
  popup.style.display = "flex";
}

function closePopup() {
  popup.style.display = "none";
}

// Hàm kiểm tra thông tin dự án nhập vào
function isValid(name, desc, skipId = -1) {
  if (name === "" || desc === "") {
    Swal.fire({ icon: "warning", title: "Vui lòng điền đầy đủ thông tin!" });
    return false;
  }

  // Kiểm tra độ dài tên
  if (name.length > 30) {
    document.getElementById("name-error").innerText = "Tên dự án không được vượt quá 30 ký tự!";
    return false;
  } else {
    document.getElementById("name-error").innerText = "";
  }

  // Kiểm tra độ dài mô tả
  if (desc.length > 100) {
    document.getElementById("desc-error").innerText = "Mô tả dự án không được vượt quá 100 ký tự!";
    return false;
  } else {
    document.getElementById("desc-error").innerText = "";
  }

  // Kiểm tra trùng tên dự án (ngoại trừ trường hợp chỉnh sửa, skipId để bỏ qua dự án hiện tại)
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].name.toLowerCase() === name.toLowerCase() && projects[i].id !== skipId) {
      Swal.fire({ icon: "error", title: "Tên dự án đã tồn tại!", text: "Vui lòng nhập lại tên khác." });
      return false;
    }
  }

  return true;
}

// Hàm tự động sinh ID dự án mới (không bị trùng)
function generateNewProjectId() {
  // Tìm ID lớn nhất trong mảng projects
  let maxId = projects.reduce((max, project) => {
    return project.id > max ? project.id : max;
  }, 0);
  return maxId + 1;
}

// Xử lý tạo dự án mới
function handleCreate() {
  let name = inputName.value.trim();
  let desc = inputDesc.value.trim();
  if (!isValid(name, desc)) return;

  const userFromRegister = registeredUsers.find(u => u.email === currentUser.email);
  const userId = userFromRegister?.id || currentUser?.id || 1;

  // Sử dụng hàm generateNewProjectId() để tạo id mới đảm bảo không trùng
  let newProject = {
    id: generateNewProjectId(),
    name: name,
    desc: desc,
    members: [
      {
        userId: userId,
        role: "Project owner"
      }
    ]
  };

  projects.push(newProject);
  localStorage.setItem("projects", JSON.stringify(projects));
  renderProjects(searchInput.value);
  renderPages();
  closePopup();

  Swal.fire({ icon: "success", title: "Thêm thành công!", timer: 1500, showConfirmButton: false });
}

// Xử lý cập nhật dự án
function handleEdit(id) {
  const project = projects.find(p => p.id === id);
  inputName.value = project.name;
  inputDesc.value = project.desc;
  openPopup();

  formSubmitBtn.onclick = function () {
    let name = inputName.value.trim();
    let desc = inputDesc.value.trim();
    if (!isValid(name, desc, id)) return;

    project.name = name;
    project.desc = desc;
    localStorage.setItem("projects", JSON.stringify(projects));
    renderProjects(searchInput.value);
    renderPages();
    closePopup();

    Swal.fire({ icon: "success", title: "Cập nhật thành công!", timer: 1500, showConfirmButton: false });
  };
}

// Xử lý xoá dự án
function handleDelete(id) {
  Swal.fire({
    title: "Bạn có chắc chắn muốn xoá?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xoá",
    cancelButtonText: "Hủy"
  }).then(function (result) {
    if (result.isConfirmed) {
      projects = projects.filter(p => p.id !== id);
      localStorage.setItem("projects", JSON.stringify(projects));
      renderProjects(searchInput.value);
      renderPages();
      Swal.fire({ icon: "success", title: "Đã xoá thành công!", timer: 1000, showConfirmButton: false });
    }
  });
}

// Xử lý chuyển đến trang chi tiết dự án
function handleDetail(id) {
  const project = projects.find(p => p.id === id);
  localStorage.setItem("currentProject", JSON.stringify(project));
  window.location.href = 'detailProject.html?id=' + id;
}

btnCancel.addEventListener("click", closePopup);
btnClose.addEventListener("click", closePopup);

// Xử lý nút Logout
logout.addEventListener("click", function () {
  Swal.fire({
    title: "Xác nhận đăng xuất?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Hủy"
  }).then(result => {
    if (result.isConfirmed) {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    }
  });
});

renderProjects();
renderPages();
