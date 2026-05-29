// js/loading.js - Loading Manager (Hiệu ứng chữ chạy + logo xoay)
(function() {
    let loadingOverlay = null;
    let loadingTimeout = null;
    let currentTextIndex = 0;
    let textInterval = null;
    
    const loadingTexts = [
        "GIẢI PHÁP CÔNG NGHỆ",
        "ĐỘT PHÁ & TOÀN DIỆN",
        "SUBSIEURE - TOOL CHẤT LƯ�ỢNG",
        "BẢO MẬT TUYỆT ĐỐI",
        "HỖ TRỢ 24/7"
    ];

    function createLoadingOverlay() {
        if (loadingOverlay) return;
        
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'global-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-overlay-content">
                <div class="loading-logo">
                    <div class="logo-ring">
                        <div class="ring"></div>
                        <div class="ring"></div>
                        <div class="ring"></div>
                        <div class="logo-center">
                            <span>S</span>
                        </div>
                    </div>
                </div>
                <div class="loading-text-container">
                    <div class="loading-main-text" id="loadingMainText">GIẢI PHÁP CÔNG NGHỆ</div>
                    <div class="loading-sub-text" id="loadingSubText">ĐỘT PHÁ & TOÀN DIỆN</div>
                </div>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a, #050510);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        document.body.appendChild(loadingOverlay);
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay-content {
                text-align: center;
                animation: fadeInScale 0.4s ease-out;
            }
            
            /* Logo Ring */
            .loading-logo {
                margin-bottom: 40px;
            }
            .logo-ring {
                position: relative;
                width: 100px;
                height: 100px;
                margin: 0 auto;
            }
            .ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid transparent;
                animation: spinRing 2s linear infinite;
            }
            .ring:nth-child(1) {
                border-top-color: #00f5ff;
                border-right-color: #00f5ff;
                animation-duration: 1s;
            }
            .ring:nth-child(2) {
                width: 75%;
                height: 75%;
                top: 12.5%;
                left: 12.5%;
                border-bottom-color: #ff6b6b;
                border-left-color: #ff6b6b;
                animation-duration: 1.5s;
                animation-direction: reverse;
            }
            .ring:nth-child(3) {
                width: 50%;
                height: 50%;
                top: 25%;
                left: 25%;
                border-top-color: #ffd700;
                border-right-color: #ffd700;
                animation-duration: 0.8s;
            }
            .logo-center {
                position: absolute;
                width: 40%;
                height: 40%;
                top: 30%;
                left: 30%;
                background: linear-gradient(135deg, #00f5ff, #0099cc);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                font-weight: 800;
                color: #000;
                box-shadow: 0 0 20px rgba(0,245,255,0.5);
            }
            
            /* Text Animation */
            .loading-text-container {
                margin-bottom: 30px;
            }
            .loading-main-text {
                font-size: 28px;
                font-weight: 800;
                letter-spacing: 4px;
                background: linear-gradient(135deg, #00f5ff, #ff6b6b, #ffd700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-size: 200% 200%;
                animation: gradientShift 2s ease infinite, textGlow 1.5s ease-in-out infinite;
                margin-bottom: 12px;
            }
            .loading-sub-text {
                font-size: 16px;
                letter-spacing: 3px;
                color: rgba(255,255,255,0.6);
                font-weight: 500;
                animation: fadeInOut 2s ease-in-out infinite;
            }
            
            /* Dots */
            .loading-dots {
                display: flex;
                justify-content: center;
                gap: 12px;
                margin-bottom: 30px;
            }
            .loading-dots span {
                width: 8px;
                height: 8px;
                background: #00f5ff;
                border-radius: 50%;
                animation: dotPulse 1.2s ease-in-out infinite;
            }
            .loading-dots span:nth-child(1) { animation-delay: 0s; }
            .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
            .loading-dots span:nth-child(3) { animation-delay: 0.3s; }
            .loading-dots span:nth-child(4) { animation-delay: 0.45s; }
            .loading-dots span:nth-child(5) { animation-delay: 0.6s; }
            
            /* Progress Bar */
            .loading-progress {
                width: 280px;
                margin: 0 auto;
            }
            .progress-bar {
                height: 2px;
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
                overflow: hidden;
            }
            .progress-fill {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #00f5ff, #ff6b6b, #ffd700, #00f5ff);
                background-size: 200% 100%;
                border-radius: 2px;
                animation: progressFill 2s ease-out forwards, gradientShift 1s linear infinite;
            }
            
            /* Animations */
            @keyframes spinRing {
                to { transform: rotate(360deg); }
            }
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                100% { background-position: 200% 50%; }
            }
            @keyframes textGlow {
                0%, 100% { text-shadow: 0 0 5px rgba(0,245,255,0.3); }
                50% { text-shadow: 0 0 20px rgba(0,245,255,0.6); }
            }
            @keyframes fadeInOut {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }
            @keyframes dotPulse {
                0%, 100% { transform: scale(0.5); opacity: 0.3; }
                50% { transform: scale(1); opacity: 1; }
            }
            @keyframes progressFill {
                0% { width: 0%; }
                100% { width: 100%; }
            }
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    function startTextRotation() {
        if (textInterval) clearInterval(textInterval);
        
        let textIndex = 0;
        const mainTextEl = document.getElementById('loadingMainText');
        const subTextEl = document.getElementById('loadingSubText');
        
        textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length;
            if (mainTextEl) {
                mainTextEl.style.opacity = '0';
                mainTextEl.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    mainTextEl.textContent = loadingTexts[textIndex];
                    mainTextEl.style.opacity = '1';
                    mainTextEl.style.transform = 'translateY(0)';
                }, 150);
            }
            if (subTextEl) {
                const subTexts = ["SUBSIEURE", "TOOL CHẤT LƯỢNG CAO", "UY TÍN SỐ 1", "BẢO HÀNH TRỌN ĐỜI"];
                subTextEl.style.opacity = '0';
                setTimeout(() => {
                    subTextEl.textContent = subTexts[textIndex % subTexts.length];
                    subTextEl.style.opacity = '1';
                }, 150);
            }
        }, 2000);
    }
    
    function stopTextRotation() {
        if (textInterval) {
            clearInterval(textInterval);
            textInterval = null;
        }
    }

    function clearHideTimeout() {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
        }
    }

    window.showLoading = function(text) {
        createLoadingOverlay();
        clearHideTimeout();
        startTextRotation();
        loadingOverlay.style.display = 'flex';
    };

    window.hideLoading = function() {
        stopTextRotation();
        clearHideTimeout();
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            const progressFill = document.getElementById('progressFill');
            if (progressFill) progressFill.style.width = '0%';
        }
    };

    window.autoHideLoading = function(duration, text) {
        showLoading(text);
        clearHideTimeout();
        loadingTimeout = setTimeout(function() {
            hideLoading();
        }, duration || 3000);
    };

    window.addEventListener('DOMContentLoaded', function() {
        autoHideLoading(3000);
    });
})();