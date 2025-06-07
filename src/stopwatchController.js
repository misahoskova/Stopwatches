const States = {
  Standby: 0,
  Running: 1,
  Stopped: 2,
}

let state = States.Standby
let currentStartTime = null
let currentEndTime = null
let lastDuration = ''

function pad(num) {
  return num < 10 ? '0' + num : String(num)
}

function displayTime(date) {
  if (!(date instanceof Date)) throw new Error('Invalid date')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function displayDateTime(date) {
  if (!(date instanceof Date)) throw new Error('Invalid date')
  const timePart = displayTime(date)
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = date.getFullYear()
  return `${timePart}, ${day}.${month}.${year}`
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000)
  const hh = Math.floor(totalSec / 3600)
  const mm = Math.floor((totalSec % 3600) / 60)
  const ss = totalSec % 60
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

export function startStopwatch() {
  if (state === States.Standby || state === States.Stopped) {
    currentStartTime = new Date()
    currentEndTime = null
    state = States.Running
    lastDuration = ''
  }
  return {
    formattedStartTime: displayDateTime(currentStartTime),
  }
}

export function stopStopwatch() {
  if (state !== States.Running) {
    throw new Error('Stopwatch is not running')
  }
  currentEndTime = new Date()
  state = States.Stopped
  const durationMs = currentEndTime - currentStartTime
  lastDuration = formatDuration(durationMs)
  return {
    formattedEndTime: displayDateTime(currentEndTime),
    formattedDuration: formatDuration(durationMs),
  }
}

export function saveStopwatch(description) {
  if (state !== States.Stopped) {
    throw new Error('Stopwatch must be stopped before saving')
  }
  const result = {
    description,
    start: currentStartTime,
    end: currentEndTime,
    duration: currentEndTime - currentStartTime,
  }

  state = States.Standby
  currentStartTime = null
  currentEndTime = null
  return result
}

export function getElapsed() {
  if (state === States.Stopped) {
    return { formattedElapsed: lastDuration }
  }
  if (state !== States.Running) {
    return { formattedElapsed: '00:00:00' }
  }
  const now = new Date()
  return { formattedElapsed: formatDuration(now - currentStartTime) }
}

export function getStateForRender() {
  const isRunning = state === States.Running
  const isStopped = state === States.Stopped
  const isStandby = state === States.Standby

  let formattedStartTime = ''
  let formattedEndTime = ''
  let formattedDuration = ''

  if (isRunning && currentStartTime) {
    formattedStartTime = displayDateTime(currentStartTime)
  } else if (isStopped && currentStartTime && currentEndTime) {
    formattedStartTime = displayDateTime(currentStartTime)
    formattedEndTime = displayDateTime(currentEndTime)
    formattedDuration = lastDuration
  } else if (isStandby) {
    formattedStartTime = '00:00:00'
    formattedEndTime = '00:00:00'
    formattedDuration = '00:00:00'
  }

  const formattedElapsed = isRunning ? formatDuration(Date.now() - currentStartTime) : '00:00:00'

  return {
    description: '',
    isRunning,
    isStopped,
    isStandby,
    formattedElapsed,
    formattedStartTime,
    formattedEndTime,
    formattedDuration,
  }
}
