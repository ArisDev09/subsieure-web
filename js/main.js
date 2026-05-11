let allTools = [];
let currentUser = null;

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const userEmailSpan = document.getElementById('userEmailSpan');
const adminLink = document.getElementById('adminLink');
const fbLink = document.getElementById('fbLink');

fbLink.href = "https://www.facebook.com/nguyenvinhcypher09/";

auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        userEmailSpan.innerText = user.email.split('@')[0];
        
        if (user.email === 'nguyenvinhhoang209@gmail.com') {
            adminLink.style.display = 'inline-block';
        }
        
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (!doc.exists) {
                db.collection('users').doc(user.uid).set({
                    email: user.email,
                    role: user.email === 'nguyenvinhhoang209@gmail.com' ? 'admin' : 'user',
                    createdAt: new Date()
                });
            }
        });
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';
        adminLink.style.display = 'none';
    }
});

async function loadTools() {
    try {
        const snapshot = await db.collection('tools').get();
        allTools = [];
        snapshot.forEach(doc => {
            allTools.push({ id: doc.id, ...doc.data() });
        });
        displayTools(allTools);
    } catch (error) {
        const grid = document.getElementById('toolsGrid');
        if (grid) {
            grid.innerHTML = '<div class="loading-spinner">Lỗi tải dữ liệu. Vui lòng F5 lại!</div>';
        }
    }
}

function displayTools(tools) {
    const grid = document.getElementById('toolsGrid');
    if (!grid) return;
    
    if (tools.length === 0) {
        grid.innerHTML = '<div class="loading-spinner">Chưa có tool nào. Admin hãy thêm tool nhé!</div>';
        return;
    }
    
    grid.innerHTML = tools.map((tool, index) => `
        <div class="tool-card" style="animation-delay: ${index * 0.05}s">
            <img src="${tool.image || 'https://via.placeholder.com/300x200?text=Subsieure'}" 
                 class="tool-image" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Subsieure'">
            <div class="tool-info">
                <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
                <p class="tool-desc">${escapeHtml(tool.description || 'Tool chất lượng cao từ Subsieure')}</p>
                <div class="tool-price">${formatPrice(tool.price)}<span>đ</span></div>
                <button class="btn-buy" data-name="${escapeHtml(tool.name)}" data-price="${tool.price}">
                    <i class="fas fa-shopping-cart"></i> Mua ngay
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const msg = `Chào Subsieure! Tôi muốn mua tool: ${name} giá ${formatPrice(price)}đ`;
            window.open(`https://zalo.me/0986947309?text=${encodeURIComponent(msg)}`, '_blank');
        });
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function openModal(modal) {
    modal.style.display = 'flex';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

if (loginBtn) loginBtn.onclick = () => openModal(loginModal);
if (registerBtn) registerBtn.onclick = () => openModal(registerModal);

document.querySelectorAll('.modal-close-login').forEach(btn => {
    btn.onclick = () => closeModal(loginModal);
});
document.querySelectorAll('.modal-close-register').forEach(btn => {
    btn.onclick = () => closeModal(registerModal);
});

window.onclick = (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === registerModal) closeModal(registerModal);
};

const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

if (switchToRegister) {
    switchToRegister.onclick = (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(registerModal);
    };
}
if (switchToLogin) {
    switchToLogin.onclick = (e) => {
        e.preventDefault();
        closeModal(registerModal);
        openModal(loginModal);
    };
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Đăng nhập thành công!');
            closeModal(loginModal);
            location.reload();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirmPassword').value;
        if (password !== confirm) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }
        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            closeModal(registerModal);
            openModal(loginModal);
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await auth.signOut();
        location.reload();
    };
}

window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

loadTools();