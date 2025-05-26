const States = {
  Standby: 0,
  Running: 1,
  Stopped: 2,
};

let state = States.Standby;
let currentStartTime = null;
let currentEndTime = null;

function formatTime(n) {
  return n < 10 ? `0${n}` : n;
}

function displayTime(time) {
  return (
    formatTime(time.getHours()) +
    ':' +
    formatTime(time.getMinutes()) +
    ':' +
    formatTime(time.getSeconds()) +
    ' ' +
    formatTime(time.getDate()) +
    '.' +
    formatTime(time.getMonth() + 1) +
    '. ' +
    time.getFullYear()
  );
}

function formattedDuration(duration) {
  return (
    formatTime(Math.floor(duration / 1000 / 60 / 60)) +
    ':' +
    formatTime(Math.floor((duration / 1000 / 60) % 60)) +
    ':' +
    formatTime(Math.floor((duration / 1000) % 60))
  );
}

function startStopwatch() {
  if (state === States.Standby || state === States.Stopped) {
    currentStartTime = new Date();
    state = States.Running;
  }
  return {
    state,
    currentStartTime,
    formattedStartTime: displayTime(currentStartTime),
  };
}

function stopStopwatch() {
  if (state === States.Running) {
    currentEndTime = new Date();
    state = States.Stopped;
  }
  const duration = currentEndTime - currentStartTime;
  return {
    state,
    currentEndTime,
    formattedEndTime: displayTime(currentEndTime),
    formattedDuration: formattedDuration(duration),
  };
}

function saveStopwatch(description) {
  if (state !== States.Stopped) {
    throw new Error('Stopwatch must be stopped');
  }
  const result = {
    description,
    start: currentStartTime,
    end: currentEndTime,
    duration: currentEndTime - currentStartTime,
  };
  state = States.Standby;
  currentStartTime = null;
  currentEndTime = null;
  return result;
}

export { startStopwatch, stopStopwatch, saveStopwatch };
