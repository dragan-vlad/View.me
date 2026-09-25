import { D, save } from '../store.js';
import { closeModal } from '../modal.js';
import { updateDash } from '../dashboard.js';

export function renderCode() {

}

export function saveCodeTopics() {

}

export function deleteCodeTopic(id) {
  if (!id) {
    return;
  }
}

export function cycleCodeStatus(id) {
  if (!id) {
    return;
  }
}

export function saveLCUser() {

}

export function fetchLC() {

}

export function renderLC() {

}

window.renderCode = renderCode;
window.saveCodeTopics = saveCodeTopics;
window.deleteCodeTopic = deleteCodeTopic;
window.cycleCodeStatus = cycleCodeStatus;
window.saveLCUser = saveLCUser;
window.fetchLC = fetchLC;
window.renderLC = renderLC;
