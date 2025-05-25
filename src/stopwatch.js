let state = 'standby';
let start = null;
let end = null;
let description = '';
let duration = null;

function startTimer() {
  state = 'running';
  start = new Date();
  end = null;
  duration = null;
}

function stopTimer() {
  if (state === 'running') {
    end = new Date();
    duration = end - start;
    state = 'stopped';
  }
}

function saveDescription(desc) {
  if (state === 'stopped') {
    description = desc;
    state = 'standby';
  }
}

function getFormattedTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  const ss = d.getSeconds().toString().padStart(2, '0');
  const DD = d.getDate().toString().padStart(2, '0');
  const MM = (d.getMonth() + 1).toString().padStart(2, '0');
  const YYYY = d.getFullYear();
  return `${hh}:${mm}:${ss} ${DD}.${MM}. ${YYYY}`;
}

function getFormattedDuration() {
  if (!duration) return '';
  const h = Math.floor(duration / 3600000);
  const m = Math.floor((duration % 3600000) / 60000);
  const s = Math.floor((duration % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

function getState() {
  return {
    state,
    startFormatted: getFormattedTime(start),
    endFormatted: getFormattedTime(end),
    durationFormatted: getFormattedDuration(),
    description,
    raw: {
      start,
      end,
      duration,
    },
  };
}

export { startTimer, stopTimer, saveDescription, getState };
