import { D, save } from '../store.js';
import { openModal, closeModal, modalState } from '../modal.js';

let VP = {
  x: 0,
  y: 0,
  z: 1
};
let _initVP = {
  x: 0,
  y: 0,
  z: 1
};
let isDragging = false;
let startX = 0;
let startY = 0;

export function initTree() {
  const svg = document.getElementById('tree-svg');
  const container = document.getElementById('tree-container');

  if (!svg || !container) {
    return;
  }

  const rect = svg.getBoundingClientRect();
  VP.x = rect.width / 2;
  VP.y = 50;
  VP.z = 1;
  _initVP = { ...VP };

  container.addEventListener('mousedown', handleDragStart);
  container.addEventListener('mousemove', handleDragMove);
  container.addEventListener('mouseup', handleDragEnd);
  container.addEventListener('mouseleave', handleDragEnd);
  container.addEventListener('wheel', handleWheel);

  renderTree();
}

export function renderTree() {
  const svg = document.getElementById('tree-svg');
  if (!svg) {
    return;
  }

  const nodes = D.cal?.nodes || [];
}

export function treeZoom(delta, focalX, focalY) {
  const zoomFactor = 1.1;
  const scale = delta > 0 ? zoomFactor : 1 / zoomFactor;

  VP.x = focalX - (focalX - VP.x) * scale;
  VP.y = focalY - (focalY - VP.y) * scale;
  VP.z *= scale;

  renderTree();
}

export function treeReset() {
  VP = { ..._initVP };
  renderTree();
}

export function cycleNode(id) {
  if (!id) {
    return;
  }

  save();
  renderTree();
}

export function showCtx(x, y, id) {
  if (!id) {
    return;
  }
}

export function hideCtx() {

}

export function ctxDo(action) {
  if (!action) {
    return;
  }
}

export function openAddNodeModal(parentId) {
  if (!parentId) {
    return;
  }

  modalState.pendId = parentId;
  openModal('node');
}

export function openEditNodeModal(id) {
  if (!id) {
    return;
  }

  modalState.editNId = id;
  openModal('node');
}

export function saveNodeModal() {
  save();
  closeModal();
  renderTree();
}

function handleDragStart(event) {
  isDragging = true;
  startX = event.clientX - VP.x;
  startY = event.clientY - VP.y;
}

function handleDragMove(event) {
  if (!isDragging) {
    return;
  }
  VP.x = event.clientX - startX;
  VP.y = event.clientY - startY;
  renderTree();
}

function handleDragEnd() {
  isDragging = false;
}

function handleWheel(event) {
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  const focalX = event.clientX - rect.left;
  const focalY = event.clientY - rect.top;
  treeZoom(event.deltaY < 0 ? 1 : -1, focalX, focalY);
}

window.treeZoom = treeZoom;
window.treeReset = treeReset;
window.openAddNodeModal = openAddNodeModal;
