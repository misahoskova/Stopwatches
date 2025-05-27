const States = {
  Standby: 0,
  Running: 1,
  Stopped: 2,
};

let state = States.Standby;
let currentStartTime = null;
let currentEndTime = null;

export function startStopwatch() {
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

export function stopStopwatch() {
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

export function saveStopwatch(description) {
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
