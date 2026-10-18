import { save } from "../store.js";

let rubiksData = null;
let activeTab = 'F2L';
let saveTimeout;

async function loadRubiksData() {
  if (rubiksData) {
    return rubiksData;
  }
  const stored = localStorage.getItem('wojtech_rubiks');
  if (stored) {
    rubiksData = JSON.parse(stored);
    return rubiksData;
  }
  try {
    const res = await fetch('../../server/data/rubiks.json');
    rubiksData = await res.json();
    localStorage.setItem('wojtech_rubiks', JSON.stringify(rubiksData));
    return rubiksData;
  } catch (err) {
    return {
      OLL: [],
      PLL: [],
      F2L: []
    };
  }
}

function generateCubeSVG(id) {
  if (!id) {
    return;
  }
  const hash = id.toString().split('').reduce((a,b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  let rects = '';

  for(let i=0;i<9;i++) {
    const x = (i % 3) * 16 + 2;
    const y = Math.floor(i / 3) * 16 + 2;

    const isYellow = ((Math.abs(hash) >> i) & 1) ===1;
    const fill = isYellow ? '#ffd56e' : 'transparent';
    const stroke = isYellow ? '#ffd56e' : 'var(--secondary)';

    rects += `<rect x="${x}" y="${y}" width="14" height="14" rx="2" fill="${fill}" srtoke="${stroke}" stroke-width="1.5" opacity="${isYellow ? '0.8' : '0.3'}"/>`;
  }
  return `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}

export async function renderRubiks() {
  await loadRubiksData();

  const statsEl = document.getElementById('rubiks-stats');
  const gridEl = document.getElementById('rubiks-grid');
  if (!statsEl || !gridEl) {
    return;
  }

  const list = rubiksData[activeTab] || [];

  let counts = {
    'not-learned': 0,
    'in-progress': 0,
    'learned-slow': 0,
    'learned': 0
  };
  list.forEach(item => {
    counts[item.status] = (counts[item.status] || 0) + 1;
  });

  statsEl.innerHTML = `
    <div class="rubiks-card" style="align-items:center; padding:12px;">
      <div style="font-size:24px; font-weight:700;">${counts['not-learned']}</div>
      <div style="font-size:10px; color:var(--secondary);">NOT LEARNED</div>
    </div>
    <div class="rubiks-card" style="align-items:center; padding:12px; border-color:rgba(255,159,110,0.15);">
      <div style="font-size:24px; font-weight:700; color:#ff9f6e;">${counts['in-progress']}</div>
      <div style="font-size:10px; color:#ff9f6e;">IN PROGRESS</div>
    </div>
    <div class="rubiks-card" style="align-items:center; padding:12px; border-color:rgba(110,180,255,0.15);">
      <div style="font-size:24px; font-weight:700; color:#6eb4ff;">${counts['learned-slow']}</div>
      <div style="font-size:10px; color:#6eb4ff;">LEARNED SLOW</div>
    </div>
    <div class="rubiks-card" style="align-items:center; padding:12px; border-color:rgba(255,213,110,0.15);">
      <div style="font-size:24px; font-weight:700; color:#ffd56e;">${counts['learned']}</div>
      <div style="font-size:10px; color:#ffd56e;">LEARNED ⭐</div>
    </div>
  `;

  gridEl.innerHTML = list.map(item => {
    const nL = item.status === 'not-learned' ? 'active-not-learned' : '';
    const iP = item.status === 'in-progress' ? 'active-in-progress' : '';
    const lS = item.status === 'learned-slow' ? 'active-learned-slow' : '';
    const l = item.status === 'learned' ? 'active-learned' : '';

    return `
      <div class="rubiks-card" id="r-card-${item.id}">
        <div class="rubiks-card-header">
          <div class="rubiks-case-img">
            ${generateCubeSVG(item.id)}
          </div>
          <div class="rubiks-case-info">
            <div class="rubiks-case-name">${item.name}</div>
            <div class="rubiks-case-desc">${item.case || ''}</div>
          </div>
        </div>
        <input type="text" class="rubiks-alg-input" value="${item.alg || ''}" oninput="saveRubiksAlg('${item.id}', this.value)" placeholder="Algorithm...">
        <div class="rubiks-status-row">
          <button class="rubiks-status-btn ${nL}" onclick="setRubiksStatus('${item.id}', 'not-learned')">New</button>
          <button class="rubiks-status-btn ${iP}" onclick="setRubiksStatus('${item.id}', 'in-progress')">WIP</button>
          <button class="rubiks-status-btn ${lS}" onclick="setRubiksStatus('${item.id}', 'learned-slow')">Slow</button>
          <button class="rubiks-status-btn ${l}" onclick="setRubiksStatus('${item.id}', 'learned')">⭐</button>
        </div>
      </div>
    `;
  }).join('');
}

export function switchRubiksTab(tab) {
  if (!tab) {
    return;
  }
  activeTab = tab;
  document.querySelectorAll('.rubiks-tab').forEach(element => {
    if (element.getAttribute('onclick').includes(tab)) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
  renderRubiks();
}

export function saveRubiksAlg(id, alg) {
  if (!id || !alg) {
    return;
  }
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const list = rubiksData[activeTab];
    const item = list.find(i => i.id === id);
    if (item) {
      item.alg = alg;
      localStorage.setItem('wojtech_rubiks', JSON.stringify(rubiksData));
    }
  }, 400);
}

export function setRubiksStatus(id, status) {
  if (!id || !status) {
    return;
  }
  const list = rubiksData[activeTab];
  const item = list.find(i => i.id === id);
  if (item) {
    item.status = status;
    localStorage.setItem('wojtech_rubiks', JSON.stringify(rubiksData));
    renderRubiks();
  }
}

export function exportRubiks() {
  if (!rubiksData) {
    return;
  }
  const dataStr = JSON.stringify(rubiksData, null, 2);
  const blob = new Blob([dataStr], { type: 'application.json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wojtech_rubiks.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.switchRubiksTab = switchRubiksTab;
window.saveRubiksAlg = saveRubiksAlg;
window.setRubiksStatus = setRubiksStatus;
window.exportRubiks = exportRubiks;
window.renderRubiks = renderRubiks;
