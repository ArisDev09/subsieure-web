// Toast Manager
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    show(title, message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '';
        switch(type) {
            case 'success': icon = '<i class="fas fa-check"></i>'; break;
            case 'error': icon = '<i class="fas fa-times"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            default: icon = '<i class="fas fa-info-circle"></i>';
        }
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        `;
        
        this.container.appendChild(toast);
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toast));
        
        setTimeout(() => this.hide(toast), duration);
        
        return toast;
    }

    showLoading(title, message = 'Đang xử lý...') {
        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas fa-spinner fa-pulse"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        this.container.appendChild(toast);
        return toast;
    }

    updateLoading(toast, success, successTitle, successMessage, errorTitle, errorMessage) {
        if (success) {
            toast.className = 'toast success';
            toast.querySelector('.toast-icon').innerHTML = '<i class="fas fa-check"></i>';
            toast.querySelector('.toast-title').textContent = successTitle;
            toast.querySelector('.toast-message').textContent = successMessage;
            
            setTimeout(() => this.hide(toast), 3000);
        } else {
            toast.className = 'toast error';
            toast.querySelector('.toast-icon').innerHTML = '<i class="fas fa-times"></i>';
            toast.querySelector('.toast-title').textContent = errorTitle;
            toast.querySelector('.toast-message').textContent = errorMessage;
            
            setTimeout(() => this.hide(toast), 3000);
        }
    }

    hide(toast) {
        toast.classList.add('out');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    }
}

const toast = new ToastManager();