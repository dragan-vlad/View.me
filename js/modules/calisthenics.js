import { D, save } from '../store.js';
import { closeModal } from '../modal.js';
import { renderTree } from '../components/tree.js';
import { updateDash } from '../dashboard.js';

export function renderCalStats() {

}

export function renderHeatmap() {

}

export function toggleHeat(key) {
  if (!key) {
    return;
  }
}

export function saveCalSkill() {

}

export function deleteCalSkill(id) {
  if (!id) {
    return;
  }
}

export function cycleCalStatus(id) {
  if (!id) {
    return;
  }
}

export function toggleStatus() {

}

export function saveNote(type) {
  if (!type) {
    return;
  }
}

window.toggleHeat = toggleHeat;
window.saveCalSkill = saveCalSkill;
window.deleteCalSkill = deleteCalSkill;
window.cycleCalStatus = cycleCalStatus;
window.toggleStatus = toggleStatus;
window.saveNote = saveNote;
