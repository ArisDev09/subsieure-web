// js/loading.js
(function() {
    let overlay = null;
    let timeout = null;

    function createOverlay() {
        if (overlay) return;
        
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">DANG TAI...</div>
            </div>
        `;
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        document.body.appendChild(overlay);
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-content { text-align: center; }
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(0,245,255,0.2);
                border-top-color: #00f5ff;
                border-radius: 50%;
                margin: 0 auto 16px;
                animation: spin 0.8s linear infinite;
            }
            .loading-text {
                color: white;
                font-size: 14px;
                letter-spacing: 2px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    window.showLoading = function() {
        createOverlay();
        if (timeout) clearTimeout(timeout);
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.hideLoading = function() {
        if (overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
    };

    window.autoHideLoading = function(ms) {
        showLoading();
        timeout = setTimeout(hideLoading, ms || 2000);
    };

    document.addEventListener('DOMContentLoaded', function() {
        autoHideLoading(2000);
    });
})();
