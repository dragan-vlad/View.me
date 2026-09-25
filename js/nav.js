export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) {
    return;
  }

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <h2>Wojtech</h2>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-sections">
        <a href="#" class="nav-link active" onclick="goTo('dashboard')">Dashboard</a>

        <div class="nav-headers">Training</div>
        <a href="#" class="nav-link" onclick="goTo('calisthenics')">Calisthenics</a>
        <a href="#" class="nav-link" onclick="goTo('languages')">Languages</a>
        <a href="#" class="nav-link" onclick="goTo('coding')">Coding</a>
        <a href="#" class="nav-link" onclick="goTo('cybersecurity')">Cybersecurity</a>
        <a href="#" class="nav-link" onclick="goTo('habits')">Habits</a>

        <div class="nav-header">Finance</div>
        <a href="#" class="nav-link" onclick="goTo('wallet')">Wallet</a>

        <div class="nav-header">Rubik's</div>
        <a href="#" class="nav-link" onclick="goTo('rubiks')">Rubik's Cube</a>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="streak-box">
        <span>Streak: 0</span>
      </div>
    </div>
  `;
}

export function goTo(page) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.style.display = section.id === page ? 'block' : 'none';
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });

  switch (page) {
    case 'rubiks': window.renderRubiks?.(); 
      break;
    case 'wallet': window.renderWallet?.();
      break;
  }
}

export function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

export function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
}
