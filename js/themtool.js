// ============================================
// themtool.js - Subsieure Admin Add Tool
// ============================================

(function() {
    let selectedCategory = 'seo';
    let selectedLangs = [];
    let mainImageBase64 = null;
    let screenshotImages = ['', '', ''];
    let currentUser = null;

    // Firebase config (đã được khởi tạo từ firebase-config.js)
    // auth và db đã có sẵn từ firebase-config.js

    function escapeHtml(s) {
        if (!s) return '';
        return s.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    }

    // Editor functions
    const longDescEditor = document.getElementById('longDescEditor');
    const hiddenLongDesc = document.getElementById('longDesc');
    
    window.formatText = function(type) { 
        document.execCommand(type, false, null); 
        if (longDescEditor) longDescEditor.focus(); 
        updateLongDescPreview(); 
    };
    
    window.insertImageLongDesc = function() { 
        const url = prompt('Nhập link ảnh:'); 
        if (url) { 
            document.execCommand('insertImage', false, url); 
            if (longDescEditor) longDescEditor.focus(); 
            updateLongDescPreview(); 
        } 
    };
    
    window.insertLink = function() { 
        const url = prompt('Nhập link URL:'); 
        if (url) { 
            document.execCommand('createLink', false, url); 
            if (longDescEditor) longDescEditor.focus(); 
            updateLongDescPreview(); 
        } 
    };
    
    function updateLongDescPreview() { 
        if (hiddenLongDesc) hiddenLongDesc.value = longDescEditor ? longDescEditor.innerHTML : ''; 
    }
    
    if (longDescEditor) {
        longDescEditor.addEventListener('input', updateLongDescPreview);
    }

    // Preview short description
    const shortDesc = document.getElementById('shortDesc');
    const previewDesc = document.getElementById('previewDesc');
    if (shortDesc) {
        shortDesc.oninput = () => { if (previewDesc) previewDesc.textContent = shortDesc.value || 'Mô tả ngắn sẽ hiển thị ở đây...'; };
    }

    // Real-time preview
    const toolName = document.getElementById('toolName');
    const toolPrice = document.getElementById('toolPrice');
    const toolDownloadLink = document.getElementById('toolDownloadLink');
    const adminNote = document.getElementById('adminNote');
    const previewName = document.getElementById('previewName');
    const previewPrice = document.getElementById('previewPrice');
    const previewDownloadLink = document.getElementById('previewDownloadLink');
    const previewCategorySpan = document.getElementById('previewCategory');
    const previewLangsDiv = document.getElementById('previewLangs');
    const previewImageDiv = document.getElementById('previewImage');
    const previewAdminTagDiv = document.getElementById('previewAdminTag');

    if (toolName) {
        toolName.oninput = () => { if (previewName) previewName.textContent = toolName.value || 'Tên tool sẽ hiển thị ở đây'; };
    }
    
    if (toolPrice) {
        toolPrice.oninput = () => { 
            const price = parseInt(toolPrice.value) || 0; 
            if (previewPrice) {
                if (price === 0) {
                    previewPrice.innerHTML = 'Free';
                } else {
                    previewPrice.innerHTML = price.toLocaleString('vi-VN') + '<span>đ</span>';
                }
            }
        };
    }
    
    if (toolDownloadLink) {
        toolDownloadLink.oninput = () => { 
            if (previewDownloadLink) {
                previewDownloadLink.href = toolDownloadLink.value || '#'; 
                previewDownloadLink.innerHTML = toolDownloadLink.value ? `<i class="fas fa-download"></i> ${toolDownloadLink.value.substring(0, 40)}...` : '<i class="fas fa-download"></i> Link tải'; 
            }
        };
    }
    
    if (adminNote) {
        adminNote.oninput = () => { 
            if (previewAdminTagDiv) {
                if (adminNote.value.trim()) { 
                    previewAdminTagDiv.style.display = 'inline-block'; 
                    previewAdminTagDiv.innerHTML = `<i class="fas fa-fire"></i> ${adminNote.value}`; 
                } else { 
                    previewAdminTagDiv.style.display = 'none'; 
                }
            }
        };
    }

    // Main image upload
    const mainUploadArea = document.getElementById('mainUploadArea');
    const mainImageInput = document.getElementById('mainImageInput');
    const mainPreview = document.getElementById('mainPreview');
    const mainPreviewImg = document.getElementById('mainPreviewImg');

    function processMainImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            mainImageBase64 = e.target.result;
            if (mainPreviewImg) mainPreviewImg.src = mainImageBase64;
            if (mainPreview) mainPreview.style.display = 'block';
            if (previewImageDiv) previewImageDiv.innerHTML = `<img src="${mainImageBase64}" style="width:100%;height:100%;object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    }

    if (mainUploadArea) {
        mainUploadArea.addEventListener('click', () => { if (mainImageInput) mainImageInput.click(); });
        mainUploadArea.addEventListener('dragover', (e) => { 
            e.preventDefault(); 
            mainUploadArea.style.borderColor = '#00f5ff'; 
            mainUploadArea.style.background = 'rgba(0,245,255,0.05)'; 
        });
        mainUploadArea.addEventListener('dragleave', () => { 
            mainUploadArea.style.borderColor = '#2a2a2a'; 
            mainUploadArea.style.background = '#0f0f0f'; 
        });
        mainUploadArea.addEventListener('drop', (e) => { 
            e.preventDefault(); 
            const file = e.dataTransfer.files[0]; 
            if (file && file.type.startsWith('image/')) processMainImage(file); 
        });
    }
    
    if (mainImageInput) {
        mainImageInput.addEventListener('change', (e) => { if (e.target.files[0]) processMainImage(e.target.files[0]); });
    }

    window.removeMainImage = () => {
        mainImageBase64 = null;
        if (mainPreview) mainPreview.style.display = 'none';
        if (previewImageDiv) previewImageDiv.innerHTML = '<div style="text-align:center;color:#666;"><i class="fas fa-image" style="font-size:48px;"></i><p>Preview ảnh tool</p></div>';
    };

    // Screenshot upload
    window.triggerScreenshotUpload = function(index) {
        const input = document.querySelector(`.screenshot-item[data-index="${index}"] .screenshot-input`);
        if (input) {
            input.click();
            input.onchange = (e) => {
                if (e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        screenshotImages[index] = ev.target.result;
                        const previewDiv = document.getElementById(`screenshotPreview${index}`);
                        if (previewDiv) {
                            previewDiv.innerHTML = `<img src="${screenshotImages[index]}" style="width:100%;height:100px;object-fit:cover;border-radius:12px;"><button class="remove-image" onclick="window.removeScreenshot(${index})" style="position:absolute;top:4px;right:4px;">×</button>`;
                            previewDiv.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            };
        }
    };

    window.removeScreenshot = (index) => {
        screenshotImages[index] = '';
        const previewDiv = document.getElementById(`screenshotPreview${index}`);
        if (previewDiv) {
            previewDiv.innerHTML = '';
            previewDiv.style.display = 'none';
        }
    };

    // Category
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.dataset.cat;
            const catNames = { seo: 'SEO', facebook: 'Facebook', game: 'Game', auto: 'Auto', other: 'Khác' };
            if (previewCategorySpan) previewCategorySpan.textContent = catNames[selectedCategory];
        };
    });

    // Language
    document.querySelectorAll('.lang-tag').forEach(tag => {
        tag.onclick = () => {
            const lang = tag.dataset.lang;
            if (tag.classList.contains('active')) {
                tag.classList.remove('active');
                selectedLangs = selectedLangs.filter(l => l !== lang);
            } else {
                tag.classList.add('active');
                selectedLangs.push(lang);
            }
            const langNames = { python: 'Python', rust: 'Rust', cpp: 'C++', html: 'HTML', js: 'JavaScript', php: 'PHP', java: 'Java', go: 'Go' };
            const langIcons = { python: 'fab fa-python', rust: 'fas fa-cog', cpp: 'fas fa-code', html: 'fab fa-html5', js: 'fab fa-js', php: 'fab fa-php', java: 'fab fa-java', go: 'fab fa-golang' };
            if (previewLangsDiv) {
                previewLangsDiv.innerHTML = selectedLangs.map(l => `<div class="preview-lang"><i class="${langIcons[l]}"></i> ${langNames[l]}</div>`).join('');
            }
        };
    });

    // Submit
    document.getElementById('submitBtn').onclick = async () => {
        const name = toolName ? toolName.value.trim() : '';
        let price = parseInt(toolPrice ? toolPrice.value : '0');
        const shortDescription = shortDesc ? shortDesc.value.trim() : '';
        const longDescription = hiddenLongDesc ? hiddenLongDesc.value : '';
        const downloadLink = toolDownloadLink ? toolDownloadLink.value.trim() : '';
        const videoUrl = document.getElementById('videoUrl') ? document.getElementById('videoUrl').value.trim() : '';
        const setupCommand = document.getElementById('setupCommand') ? document.getElementById('setupCommand').value.trim() : '';
        const adminNoteValue = adminNote ? adminNote.value.trim() : '';
        const warningMessage = document.getElementById('warningMessage') ? document.getElementById('warningMessage').value.trim() : '';
        const validScreenshots = screenshotImages.filter(img => img !== '');
        
        if (isNaN(price)) price = 0;
        
        if (!name) { Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng nhập tên tool' }); return; }
        if (!shortDescription) { Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng nhập mô tả ngắn' }); return; }
        if (!longDescription) { Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng nhập mô tả chi tiết' }); return; }
        if (!mainImageBase64 && validScreenshots.length === 0) { Swal.fire({ icon: 'error', title: 'Thiếu thông tin', text: 'Vui lòng thêm ảnh đại diện' }); return; }
        
        Swal.fire({ title: 'Đang xử lý...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        
        const toolData = {
            name, description: longDescription, shortDescription, price, 
            downloadLink: downloadLink || '#', category: selectedCategory, 
            languages: selectedLangs, image: mainImageBase64,
            screenshots: validScreenshots, videoUrl: videoUrl || null, 
            setupCommand: setupCommand || null, adminNote: adminNoteValue || null, 
            warningMessage: warningMessage || null, createdAt: new Date(), updatedAt: new Date()
        };
        
        try {
            await db.collection('tools').add(toolData);
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Tool đã được thêm', timer: 1500, showConfirmButton: false });
            setTimeout(() => { window.location.href = 'admin-panel.html'; }, 1500);
        } catch (error) { Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message }); }
    };

    // Auth check
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(async (user) => {
            if (!user || user.email !== 'nguyenvinhhoang209@gmail.com') {
                Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Bạn không có quyền truy cập!', confirmButtonColor: '#00f5ff' }).then(() => {
                    window.location.href = 'login.html';
                });
                return;
            }
            currentUser = user;
        });
    }

    // Cursor glow
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
    });
})();