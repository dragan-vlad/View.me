export const modalState = {
  AM: null,
  editNId: null,
  pendId: null,
  selCol: '#7fff6e'
};

export function openModal(type) {
  if (!type) {
    return;
  }
  modalState.AM = type;
  document.getElementById('modal-overlay').classList.add('open');

  document.querySelectorAll('.modal-panel').forEach(panel => {
    panel.style.display = 'none';
  });

  const activePanel = document.getElementById(`modal-${type}`);
  if (activePanel) {
    activePanel.style.display = 'block';
    const firstInput = activePanel.querySelector('input, textarea');
    if (firstInput) {
      firstInput.focus();
    }
  }
}

export function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  modalState.AM = null;
  modalState.editNId = null;
  modalState.pendId = null;
}

export function pickColor(element) {
  if (!element) {
    return;
  }
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.classList.remove('sel');
  });
  element.classList.add('sel');
  modalState.selCol = element.getAttribute('data-color');
}
