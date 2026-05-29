// js/loading.js - Siêu tối giản
(function() {
    let div = null;
    let t = null;

    function create() {
        if (div) return;
        div = document.createElement('div');
        div.id = 'load';
        div.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);z-index:99999;display:none;justify-content:center;align-items:center"><div style="width:50px;height:50px;border:3px solid rgba(0,245,255,0.2);border-top-color:#00f5ff;border-radius:50%;animation:s 0.8s linear infinite"></div><div style="color:#fff;margin-top:16px">ĐANG TẢI...</div></div><style>@keyframes s{to{transform:rotate(360deg)}}</style>';
        document.body.appendChild(div);
    }

    window.showLoading = function() { create(); if(t) clearTimeout(t); div.style.display = 'flex'; document.body.style.overflow = 'hidden'; };
    window.hideLoading = function() { if(div) div.style.display = 'none'; document.body.style.overflow = ''; };
    window.autoHideLoading = function(m) { window.showLoading(); t = setTimeout(window.hideLoading, m || 2000); };

    document.addEventListener('DOMContentLoaded', function() { window.autoHideLoading(2000); });
})();