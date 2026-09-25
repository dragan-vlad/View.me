import { DN_CAL, DN_CYBER, DN_CODE, DN_HABITS, DN_LANG } from './data.js';

export const SK = 'wings_data';

export let D = {
  cal: [],
  lang: [],
  code: [],
  cyber: [],
  habits: [],
  streak: 0,
  statsOpne: false,
  lc: ''
};

export function load() {
  const data = localStorage.getItem(SK);
  if (data) {
    D = {
      ...D,
      ...JSON.parse(data)
    };
  } else {
    D.cal = [...DN_CAL];
    D.lang = [...DN_LANG];
    D.code = [...DN_CODE];
    D.cyber = [...DN_CYBER];
    D.habits = [...DN_HABITS];
    save();
  }
}

export function save() {
  localStorage.setItem(SK, JSON.stringify(D));
}
