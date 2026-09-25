import { D, save } from '../store.js';
import { closeModal } from '../modal.js';
import { updateDash } from '../dashboard.js';

export function renderHabits() {
}

export function renderHabitWeek() {
}

export function saveHabit() {
}

export function deleteHabit(id) {
  if (!id) {
    return;
  }
}

export function toggleHabit(id) {
  if (!id) {
    return;
  }
}

export function updStreak() {
}

window.renderHabits = renderHabits;
window.renderHabitWeek = renderHabitWeek;
window.saveHabit = saveHabit;
window.deleteHabit = deleteHabit;
window.toggleHabit = toggleHabit;
window.updStreak = updStreak;
