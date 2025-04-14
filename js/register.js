document.querySelector('#registerForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // Lấy giá trị từ form khi người dùng gửi
    let fullname = document.querySelector('#fullname').value.trim();
    let email = document.querySelector('#email').value.trim();
    let password = document.querySelector('#password').value;
    let confirmPassword = document.querySelector('#confirmPassword').value;

    // Kiểm tra các trường không được để trống
    if (!fullname || !email || !password || !confirmPassword) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: 'Vui lòng điền đầy đủ thông tin.',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }

    const isValidEmail = (email) => {
        return email.includes('@') && ['.com', '.vn', '.net'].some(check => email.endsWith(check));
    };

    if (!isValidEmail(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Email phải chứa ký tự "@" và kết thúc bằng phần mở rộng hợp lệ (ví dụ: .com,.vn,.net...).',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }

    // Kiểm tra mật khẩu phải dài hơn 6 ký tự
    if (password.length < 8) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Mật khẩu phải có ít nhất 8 ký tự.',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Mật khẩu xác nhận không khớp.',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }

    // Lấy danh sách người dùng hiện tại từ localStorage hoặc khởi tạo mảng rỗng
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // Kiểm tra xem email đã tồn tại chưa
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
        Swal.fire({
            icon: 'warning',
            title: 'Thông báo!',
            text: 'Email này đã được đăng ký. Vui lòng sử dụng email khác.',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }

    // Tạo ID tự động tăng dần từ 1
    let newId = users.length + 1;  // ID sẽ là số người dùng hiện tại + 1

    // Thêm người dùng mới
    users.push({ id: newId, fullname, email, password });

    // Lưu vào localStorage
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // Hiển thị thông báo thành công và chuyển hướng
    Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công!',
        text: 'Bạn có thể đăng nhập ngay bây giờ.',
        confirmButtonColor: '#1a73e8'
    }).then(() => {
        // Xóa dữ liệu trong form
        document.querySelector('#registerForm').reset();

        // Chuyển hướng đến trang đăng nhập
        window.location.href = 'login.html';
    });
});
