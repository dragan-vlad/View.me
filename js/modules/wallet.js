export function initWallet() {
  const stored = localStorage.getItem('wings_wallet');
  if (!stored) {
    const defaultData = {
      summary: {
        totalCash: 0,
        totalInvested: 0,
        currentValue: 0,
        gainLoss: 0,
        budgetStatus: 'Unknown'
      },
      budget: {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        items: []
      },
      eom: [],
      transactions: [],
      wallets: [],
      salary: [],
      goals: {}
    };
    localStorage.setItem('wings_wallet', JSON.stringify(defaultData));
  }
}

function getWalletData() {
  return JSON.parse(localStorage.getItem('wings_wallet'));
}

export function renderWallet() {
  initWallet();
  const data = getWalletData();

  document.getElementById('w-total-cash').textContent = data.summary.totalCash || '-';
  document.getElementById('w-total-invested').textContent = data.summary.totalInvested || '-';
  document.getElementById('w-current-value').textContent = data.summary.currentValue || '-';
  document.getElementById('w-gain-loss').textContent = data.summary.gainLoss || '-';
  document.getElementById('w-budget-status').textContent = data.summary.budgetStatus || '-';
}

export function toggleWalletExpand() {
  const expanded = document.getElementById('wallet-expanded');
  const hint = document.querySelector('.wallet-expand-hint');
  const isHidden = expanded.style.display === 'none';

  if (isHidden) {
    expanded.style.display = 'block';
    if (hint) {
      hint.textContent = 'Click to collapse ▲';
    }
    switchWalletTab('budget');
  } else {
    expanded.style.display = 'none';
    if (hint) {
    hint.textContent = 'Click to expand ▼';
    }
  }
}

export function switchWalletTab(tab) {
  if (!tab) {
    return;
  }
  document.querySelectorAll('.wallet-tab').forEach(element => {
    if (element.getAttribute('onclick').includes(tab)) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });

  const content = document.getElementById('wallet-tab-content');
  if (!content) {
    return;
  }

  if (tab === 'budget') {
    content.innerHTML = renderBudgetTab();
  }
  if (tab === 'eom') {
    content.innerHTML = renderEomTab();
  }
  if (tab === 'transactions') {
    content.innerHTML = renderTransactionsTab();
  }
  if (tab === 'wallets') {
    content.innerHTML = renderWalletsTab();
  }
  if (tab === 'salary') {
    content.innerHTML = renderSalaryTab();
  }
  if (tab === 'goals') {
    content.innerHTML = renderGoalsTab();
  }
}

function renderBudgetTab() {
  return `
    <div style="padding: 16px;">
      <button class="btn btn-ghost btn-sm" style="margin-bottom: 12px;">+ Add Row</button>
      <table style="width: 100%; text-align: left; font-size: 13px; color: var(--text);">
        <tr style="color: var(--secondary);"><th>Item</th><th>Category</th><th>Planned</th><th>Actual</th></tr>
        <tr><td colspan="4" style="padding-top: 10px; color: var(--secondary);">No budget items yet.</td></tr>
      </table>
    </div>
  `;
}

function renderEomTab() {
  return `
    <div style="padding: 16px;">
      <button class="btn btn-ghost btn-sm" style="margin-bottom: 12px;">+ Add Row</button>
      <table style="width: 100%; text-align: left; font-size: 13px; color: var(--text);">
        <tr style="color: var(--secondary);"><th>Month/Year</th><th>Total Cash</th><th>Investments</th><th>USD Rate</th><th>CHF Rate</th></tr>
        <tr><td colspan="5" style="padding-top: 10px; color: var(--secondary);">No EOM data yet.</td></tr>
      </table>
    </div>
  `;
}

function renderTransactionsTab() {
  return `
    <div style="padding: 16px;">
      <button class="btn btn-ghost btn-sm" style="margin-bottom: 12px;">+ Add Transaction</button>
      <table style="width: 100%; text-align: left; font-size: 13px; color: var(--text);">
        <tr style="color: var(--secondary);"><th>Date ▾</th><th>Wallet</th><th>Category</th><th>Note</th><th>Amount</th></tr>
        <tr><td colspan="5" style="padding-top: 10px; color: var(--secondary);">No transactions yet.</td></tr>
      </table>
    </div>
  `;
}

function renderWalletsTab() {
  return `
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
      <div style="background: var(--glass); padding: 12px; border-radius: 8px; border: 1px solid rgba(198, 201, 230, 0.15);">
        <div style="font-weight: bold; margin-bottom: 8px;">Example Wallet</div>
        <div style="color: var(--secondary); font-size: 12px;">Balance: 0.00 / 0% of total</div>
        <div style="height: 4px; background: var(--glass); margin-top: 8px; border-radius: 2px;">
          <div style="height: 100%; width: 0%; background: var(--accent); border-radius: 2px;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderSalaryTab() {
  return `
    <div style="padding: 16px;">
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
        <li style="color: var(--secondary);">No salary entries recorded.</li>
      </ul>
    </div>
  `;
}

function renderGoalsTab() {
  return `
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 12px;">
        <input type="number" placeholder="Target Year" style="background: var(--glass); border: 1px solid rgba(198, 201, 230, 0.15); color: var(--text); padding: 8px; border-radius: 6px;">
        <input type="number" placeholder="Target Capital" style="background: var(--glass); border: 1px solid rgba(198, 201, 230, 0.15); color: var(--text); padding: 8px; border-radius: 6px;">
      </div>
      <div style="background: var(--glass); padding: 12px; border-radius: 8px; font-size: 13px;">
        <div style="margin-bottom: 6px; color: var(--secondary);">Prognosed Capital: <span style="color: var(--text);">—</span></div>
        <div style="margin-bottom: 6px; color: var(--secondary);">Rolling Capital: <span style="color: var(--text);">—</span></div>
        <div style="color: var(--secondary);">Actual Capital: <span style="color: var(--text);">—</span></div>
      </div>
    </div>
  `;
}

window.renderWallet = renderWallet;
window.toggleWalletExpand = toggleWalletExpand;
window.switchWalletTab = switchWalletTab;
