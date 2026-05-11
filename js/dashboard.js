let allTools = [];
let editingToolId = null;

const adminEmailSpan = document.getElementById('adminEmail');
const toolsTableBody = document.getElementById('toolsTableBody');
const ordersTableBody = document.getElementById('ordersTableBody');
const usersTableBody = document.getElementById('usersTableBody');
const toolModal = document.getElementById('toolModal');
const modalTitle = document.getElementById('modalTitle');
const toolForm = document.getElementById('toolForm');
const toolId = document.getElementById('toolId');
const toolName = document.getElementById('toolName');
const toolDesc = document.getElementById('toolDesc');
const toolPrice = document.getElementById('toolPrice');
const toolImage = document.getElementById('toolImage');
const toolCategory = document.getElementById('toolCategory');

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    if (user.email !== 'nguyenvinhhoang209@gmail.com') {
        alert('Bạn không có quyền truy cập trang quản trị!');
        window.location.href = 'index.html';
        return;
    }
    
    adminEmailSpan.innerText = user.email;
    loadTools();
    loadOrders();
    loadUsers();
});

async function loadTools() {
    try {
        const snapshot = await db.collection('tools').get();
        allTools = [];
        snapshot.forEach(doc => {
            allTools.push({ id: doc.id, ...doc.data() });
        });
        renderToolsTable();
    } catch (error) {
        toolsTableBody.innerHTML = '<tr><td colspan="6">Lỗi tải dữ liệu</td></tr>';
    }
}

function renderToolsTable() {
    if (allTools.length === 0) {
        toolsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có tool nào. Hãy thêm tool mới!</td></tr>';
        return;
    }
    
    toolsTableBody.innerHTML = allTools.map(tool => `
        <tr>
            <td><img src="${tool.image || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td><strong>${escapeHtml(tool.name)}</strong></td>
            <td>${escapeHtml(tool.description || '').substring(0, 50)}${tool.description && tool.description.length > 50 ? '...' : ''}</td>
            <td class="price-cell">${formatNumber(tool.price)}đ</td>
            <td><span class="category-badge">${escapeHtml(tool.category || 'other')}</span></td>
            <td>
                <button class="btn-edit" onclick="editTool('${tool.id}')"><i class="fas fa-edit"></i> Sửa</button>
                <button class="btn-delete" onclick="deleteTool('${tool.id}')"><i class="fas fa-trash"></i> Xóa</button>
            </td>
        </tr>
    `).join('');
}

async function loadOrders() {
    try {
        const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            ordersTableBody.innerHTML = '<tr><td colspan="5">Chưa có đơn hàng nào</td></tr>';
            return;
        }
        
        ordersTableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const order = doc.data();
            ordersTableBody.innerHTML += `
                <tr>
                    <td>${escapeHtml(order.userEmail || 'N/A')}</td>
                    <td>${escapeHtml(order.toolName)}</td>
                    <td class="price-cell">${formatNumber(order.price)}đ</td>
                    <td>${order.createdAt?.toDate().toLocaleDateString('vi-VN') || 'N/A'}</td>
                    <td><span class="status-badge ${order.status || 'pending'}">${order.status === 'completed' ? 'Đã giao' : 'Chờ xử lý'}</span></td>
                </tr>
            `;
        });
    } catch (error) {
        ordersTableBody.innerHTML = '<tr><td colspan="5">Chưa có đơn hàng</td></tr>';
    }
}

async function loadUsers() {
    try {
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            usersTableBody.innerHTML = '<tr><td colspan="3">Chưa có người dùng</td></tr>';
            return;
        }
        
        usersTableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            usersTableBody.innerHTML += `
                <tr>
                    <td>${escapeHtml(user.email)}</td>
                    <td><span class="role-badge ${user.role === 'admin' ? 'admin' : 'user'}">${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span></td>
                    <td>${user.createdAt?.toDate().toLocaleDateString('vi-VN') || 'N/A'}</td>
                </tr>
            `;
        });
    } catch (error) {
        usersTableBody.innerHTML = '<tr><td colspan="3">Chưa có người dùng</td></tr>';
    }
}

window.editTool = async (id) => {
    const tool = allTools.find(t => t.id === id);
    if (tool) {
        editingToolId = id;
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Sửa tool';
        toolId.value = tool.id;
        toolName.value = tool.name;
        toolDesc.value = tool.description || '';
        toolPrice.value = tool.price;
        toolImage.value = tool.image || '';
        toolCategory.value = tool.category || 'other';
        openModal();
    }
};

window.deleteTool = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa tool này?')) {
        try {
            await db.collection('tools').doc(id).delete();
            alert('Xóa tool thành công!');
            loadTools();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    }
};

async function saveTool(event) {
    event.preventDefault();
    
    const toolData = {
        name: toolName.value.trim(),
        description: toolDesc.value.trim(),
        price: parseInt(toolPrice.value),
        image: toolImage.value.trim() || null,
        category: toolCategory.value,
        updatedAt: new Date()
    };
    
    if (!toolData.name || !toolData.price) {
        alert('Vui lòng nhập đầy đủ tên và giá tool!');
        return;
    }
    
    try {
        if (editingToolId) {
            await db.collection('tools').doc(editingToolId).update(toolData);
            alert('Cập nhật tool thành công!');
        } else {
            await db.collection('tools').add(toolData);
            alert('Thêm tool mới thành công!');
        }
        closeModal();
        resetForm();
        loadTools();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

function resetForm() {
    editingToolId = null;
    modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Thêm tool mới';
    toolId.value = '';
    toolName.value = '';
    toolDesc.value = '';
    toolPrice.value = '';
    toolImage.value = '';
    toolCategory.value = 'other';
}

function openModal() {
    toolModal.style.display = 'flex';
}

function closeModal() {
    toolModal.style.display = 'none';
    resetForm();
}

function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
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

document.querySelectorAll('.admin-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tab;
        
        document.querySelectorAll('.admin-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');
    });
});

document.getElementById('addToolBtn').addEventListener('click', openModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelModalBtn').addEventListener('click', closeModal);
toolForm.addEventListener('submit', saveTool);
document.getElementById('adminLogoutBtn').addEventListener('click', async () => {
    await auth.signOut();
    window.location.href = 'index.html';
});

window.onclick = (e) => {
    if (e.target === toolModal) {
        closeModal();
    }
};