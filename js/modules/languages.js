import { D, save } from '../store.js';
import { closeModal } from '../modal.js';
import { updateDash } from '../dashboard.js';

export function renderLang() {

}

export function saveLang() {

}

export function deleteLang() {

}

export function logLangMin(id, m) {
  if (!id || !m) {
    return;
  }
}

export function upLevel(id, d) {
  if (!id || !d) {
    return;
  }
}

export function lPct(lang) {
  if (!lang) {
    return;
  }
}

window.saveLang = saveLang;
window.deleteLang = deleteLang;
window.logLangMin =logLangMin;
window.upLevel = upLevel;
