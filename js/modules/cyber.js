import { D, save } from '../store.js';
import { closeModal } from '../modal.js';
import { updateDash } from '../dashboard.js';

export function renderCyber() {
}

export function saveCyberTask() {
}

export function deleteCyberTask(id) {
  if (!id) {
    return;
  }
}

export function toggleCyberTask(id) {
  if (!id) {
    return;
  }
}

window.renderCyber = renderCyber;
window.saveCyberTask = saveCyberTask;
window.deleteCyberTask = deleteCyberTask;
window.toggleCyberTask = toggleCyberTask;
