document.querySelector('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Lấy giá trị email & password
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();

    // 2. Kiểm tra các trường không để trống
    if (!email || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: 'Vui lòng điền đầy đủ thông tin.',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }
    // 3. Kiểm tra email hợp lệ
    const isValidEmail = (email) => {
        return email.includes('@') && ['.com', '.vn', '.net'].some(check => email.endsWith(check));
    };

    if (!isValidEmail(email)) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: 'Email không hợp lệ. Vui lòng nhập email đúng định dạng.',
            confirmButtonColor: '#1a73e8'
        });
        return;
    }

    // 4. Lấy danh sách người dùng từ localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    // 5. Tìm người dùng khớp email & password
    const user = users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.password === password);

    if (user) {
        // 6. Đăng nhập thành công
        Swal.fire({
            icon: 'success',
            title: 'Đăng nhập thành công!',
            text: `Chào mừng ${user.fullname} quay trở lại!`,
            confirmButtonColor: '#1a73e8'
        }).then(() => {
            // (Tuỳ chọn) Lưu lại một số thông tin
            localStorage.setItem('isLoggedIn', 'true'); // Đánh dấu đã đăng nhập
            // 👉 Lưu thông tin người dùng hiện tại vào localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                fullname: user.fullname,
                email: user.email
            }));
            // 7. Xoá form & chuyển sang trang Home
            document.querySelector('#loginForm').reset();
            window.location.href = 'home.html';
        });
    } else {
        // 8. Đăng nhập thất bại
        Swal.fire({
            icon: 'error',
            title: 'Đăng nhập thất bại!',
            text: 'Email hoặc mật khẩu không chính xác.',
            confirmButtonColor: '#1a73e8'
        });
    }
});
