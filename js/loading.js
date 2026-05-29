// js/loading.js — Cyberpunk Loading Manager
(function () {
  let overlay = null, timeout = null;

  function inject() {
    if (overlay) return;

    const style = document.createElement('style');
    style.textContent = `
      #cy-loading {
        position: fixed; inset: 0; z-index: 10000;
        background: rgba(6, 10, 22, 0.82);
        backdrop-filter: blur(8px);
        display: none; flex-direction: column;
        align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif;
      }
      #cy-loading .cy-content { text-align: center; animation: cyFadeIn .2s ease; }

      /* hex rings */
      .cy-rings { position: relative; width: 88px; height: 88px; margin: 0 auto 20px; }
      .cy-rings svg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .cy-r1 { animation: cyCW  3s linear infinite; transform-origin: 44px 44px; }
      .cy-r2 { animation: cyCCW 2s linear infinite; transform-origin: 44px 44px; }
      .cy-rp { animation: cyPulse 1.5s ease-in-out infinite; transform-origin: 44px 44px; }
      .cy-dot { animation: cyDot  1.5s ease-in-out infinite; }
      @keyframes cyCW    { to { transform: rotate(360deg); } }
      @keyframes cyCCW   { to { transform: rotate(-360deg); } }
      @keyframes cyPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
      @keyframes cyDot   { 0%,100%{opacity:.5} 50%{opacity:1} }

      /* bars */
      .cy-bars { display: flex; gap: 4px; align-items: flex-end; height: 26px; justify-content: center; margin-bottom: 14px; }
      .cy-bar  { width: 4px; border-radius: 2px; animation: cyBar 1.1s ease-in-out infinite; }
      .cy-bar:nth-child(1){height:40%;background:#00f5ff;animation-delay:0s}
      .cy-bar:nth-child(2){height:70%;background:#4dd9ff;animation-delay:.12s}
      .cy-bar:nth-child(3){height:100%;background:#00f5ff;animation-delay:.24s}
      .cy-bar:nth-child(4){height:70%;background:#4dd9ff;animation-delay:.36s}
      .cy-bar:nth-child(5){height:40%;background:#00f5ff;animation-delay:.48s}
      .cy-bar:nth-child(6){height:70%;background:#ff2d78;animation-delay:.6s}
      .cy-bar:nth-child(7){height:100%;background:#ff2d78;animation-delay:.72s}
      .cy-bar:nth-child(8){height:70%;background:#ff2d78;animation-delay:.84s}
      @keyframes cyBar { 0%,100%{transform:scaleY(.4);opacity:.5} 50%{transform:scaleY(1);opacity:1} }

      /* status text */
      .cy-status { font-size: 10px; letter-spacing: 3px; color: #00f5ff; opacity: .75; margin-bottom: 6px; }
      .cy-label  { font-size: 13px; letter-spacing: 4px; color: #fff; opacity: .9; margin-bottom: 14px;
                   display: flex; align-items: center; gap: 2px; justify-content: center; }
      .cy-dots span { display: inline-block; width: 4px; height: 4px; border-radius: 50%;
                      margin: 0 2px; animation: cyDotTrail 1.2s ease-in-out infinite; }
      .cy-dots span:nth-child(1){background:#00f5ff;animation-delay:0s}
      .cy-dots span:nth-child(2){background:#88eeff;animation-delay:.2s}
      .cy-dots span:nth-child(3){background:#ff2d78;animation-delay:.4s}
      @keyframes cyDotTrail { 0%,100%{transform:scale(.4);opacity:.3} 50%{transform:scale(1);opacity:1} }

      /* progress */
      .cy-prog { width: 180px; position: relative; }
      .cy-track { height: 2px; background: rgba(0,245,255,.12); border-radius: 2px; overflow: hidden; }
      .cy-fill  { height: 100%; background: linear-gradient(90deg,#ff2d78,#00f5ff);
                  border-radius: 2px; animation: cyProg 2s ease-in-out infinite; }
      @keyframes cyProg {
        0%  {width:0%;margin-left:0%;opacity:1}
        60% {width:60%;margin-left:30%;opacity:1}
        100%{width:0%;margin-left:100%;opacity:0}
      }

      /* scanline */
      .cy-scan { position: fixed; left:0; right:0; height:1px; pointer-events:none;
                 background: linear-gradient(90deg,transparent,rgba(0,245,255,.2),transparent);
                 animation: cyScan 4s linear infinite; }
      @keyframes cyScan { from{top:0} to{top:100vh} }

      /* corners */
      .cy-corner { position: fixed; width:16px; height:16px; opacity:.4; }
      .cy-corner.tl{top:16px;left:16px;border-top:1.5px solid #00f5ff;border-left:1.5px solid #00f5ff}
      .cy-corner.tr{top:16px;right:16px;border-top:1.5px solid #00f5ff;border-right:1.5px solid #00f5ff}
      .cy-corner.bl{bottom:16px;left:16px;border-bottom:1.5px solid #00f5ff;border-left:1.5px solid #00f5ff}
      .cy-corner.br{bottom:16px;right:16px;border-bottom:1.5px solid #00f5ff;border-right:1.5px solid #00f5ff}

      @keyframes cyFadeIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = 'cy-loading';
    overlay.innerHTML = `
      <div class="cy-corner tl"></div><div class="cy-corner tr"></div>
      <div class="cy-corner bl"></div><div class="cy-corner br"></div>
      <div class="cy-scan"></div>
      <div class="cy-content">
        <div class="cy-rings">
          <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g class="cy-r1">
              <circle cx="44" cy="44" r="37" stroke="rgba(0,245,255,.12)" stroke-width="1"/>
              <circle cx="44" cy="44" r="37" stroke="#00f5ff" stroke-width="1.5"
                stroke-dasharray="22 11 8 58" stroke-linecap="round"/>
            </g>
            <g class="cy-r2">
              <circle cx="44" cy="44" r="27" stroke="rgba(255,45,120,.12)" stroke-width="1"/>
              <circle cx="44" cy="44" r="27" stroke="#ff2d78" stroke-width="1.5"
                stroke-dasharray="15 8 5 44" stroke-linecap="round"/>
            </g>
            <g class="cy-rp">
              <polygon points="44,21 62,32 62,54 44,65 26,54 26,32"
                stroke="rgba(240,192,64,.35)" stroke-width="1" fill="none"/>
            </g>
            <circle class="cy-dot" cx="44" cy="44" r="4" fill="#00f5ff"/>
            <circle cx="44" cy="44" r="2" fill="#fff" opacity=".9"/>
          </svg>
        </div>
        <div class="cy-bars">
          <div class="cy-bar"></div><div class="cy-bar"></div><div class="cy-bar"></div>
          <div class="cy-bar"></div><div class="cy-bar"></div><div class="cy-bar"></div>
          <div class="cy-bar"></div><div class="cy-bar"></div>
        </div>
        <div class="cy-status" id="cyStatus">KHỞI TẠO HỆ THỐNG</div>
        <div class="cy-label">
          <span id="cyLabel">ĐANG TẢI</span>
          <span class="cy-dots"><span></span><span></span><span></span></span>
        </div>
        <div class="cy-prog">
          <div class="cy-track"><div class="cy-fill"></div></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function clearT() { if (timeout) { clearTimeout(timeout); timeout = null; } }

  window.showLoading = function (text, status) {
    inject(); clearT();
    document.getElementById('cyLabel').textContent  = text   || 'ĐANG TẢI';
    document.getElementById('cyStatus').textContent = status || 'KHỞI TẠO HỆ THỐNG';
    overlay.style.display = 'flex';
  };

  window.hideLoading = function () {
    clearT();
    if (overlay) overlay.style.display = 'none';
  };

  window.autoHideLoading = function (duration, text, status) {
    showLoading(text, status); clearT();
    timeout = setTimeout(hideLoading, duration || 2000);
  };

  document.addEventListener('DOMContentLoaded', function () {
    autoHideLoading(2000, 'ĐANG TẢI', 'KHỞI TẠO HỆ THỐNG');
  });
})();