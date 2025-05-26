function formatTime(time) {
  return time < 10 ? `0${time}` : time;
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

function parseTime(timeStr) {
  var time = new Date();
  if (timeStr.length != 20) {
    console.log(timeStr);
    throw 'Špatný formát času: špatná délka ' + timeStr.length;
  }
  time.setHours(timeStr.substring(0, 2));
  time.setMinutes(timeStr.substring(3, 5));
  time.setSeconds(timeStr.substring(6, 8));
  time.setDate(timeStr.substring(9, 11));
  time.setMonth(timeStr.substring(12, 14) - 1);
  time.setFullYear(timeStr.substring(15, 20));
  return time;
}

function togglePopup() {
  $('#popup').toggleClass('active');
}

function closePopup() {
  $('#popup').removeClass('active');
}

function loadText() {
  $('#help-text').load('help.txt');
}

function startTimer() {
  setTimer();
  interval = setInterval(() => {
    seconds++;
    setTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

function setTimer() {
  if (seconds == 59) {
    seconds = 0;
    minutes++;
  }
  if (minutes == 59) {
    minutes = 0;
    hours++;
  }
  function hoursText(time) {
    return time < 10 ? `0${time}` : time;
  }
  $('#hours').text(hoursText(hours));
  $('#minutes').text(hoursText(minutes));
  $('#seconds').text(hoursText(seconds));
}

function addStartTime() {
  $('#begin-content').css({ display: 'block' });
  $('#begin-label').css({ display: 'none' });
  $('#begin-input').val(displayTime(currentStartTime));
  localStorage.setItem('formattedStartTime', displayTime(currentStartTime));
}

function addEndTime() {
  $('#end-content').css({ display: 'block' });
  $('#end-label').css({ display: 'none' });
  $('#end-input').val(displayTime(currentEndTime));
}

function addDuration() {
  $('#dur-content').css({ display: 'block' });
  $('#dur-label').css({ display: 'none' });
  var duration = currentEndTime - currentStartTime;
  interval = duration;
  $('#dur-input').val(formattedDuration(duration));
}

function resetTimer() {
  hours = 0;
  minutes = 0;
  seconds = 0;
  setTimer();
  clearInterval(interval);
  $('#desc-input').val('');
  $('#begin-input').val('');
  $('#end-input').val('');
  $('#dur-input').val('');
  $('#begin-content').css({ display: 'none' });
  $('#begin-label').css({ display: 'block' });
  $('#end-content').css({ display: 'none' });
  $('#end-label').css({ display: 'block' });
  $('#dur-content').css({ display: 'none' });
  $('#dur-label').css({ display: 'block' });
}

function returnValues(beginTime, endTime, title, duration) {
  $('#begin-input').val(displayTime(beginTime));
  $('#end-input').val(displayTime(endTime));
  $('#desc-input').val(title);
  $('#dur-input').val(formattedDuration(duration));
}

function getValues() {
  var title = '';
  var beginTime = new Date();
  var endTime = new Date();

  if ($('#desc-input').val() == '') {
    $('#desc-error').text('Please fill the description');
    returnValues(currentStartTime, currentEndTime, '', interval);
    throw '1';
  }
  title = $('#desc-input').val();

  if ($('#begin-input').val() == '') {
    $('#begin-error').text('Please fill the start time');
    returnValues(currentStartTime, currentEndTime, title, interval);
    throw '1';
  }

  if ($('#end-input').val() == '') {
    $('#end-error').text('Please fill the end time');
    returnValues(currentStartTime, currentEndTime, title, interval);
    throw '1';
  }

  try {
    beginTime = parseTime($('#begin-input').val());
    endTime = parseTime($('#end-input').val());

    if (beginTime == parseTime('00:00:00 01.01. 0000')) {
      $('#begin-error').text('Start time has a wrong format');
      returnValues(currentStartTime, currentEndTime, title, interval);
      throw '1';
    }

    if (endTime == parseTime('00:00:00 01.01. 0000')) {
      $('#end-error').text('End time has a wrong format');
      returnValues(currentStartTime, currentEndTime, title, interval);
      throw '1';
    }

    if (beginTime >= endTime) {
      $('#begin-error').text('Start time is later than end time');
      returnValues(currentStartTime, currentEndTime, title, interval);
      throw '1';
    }

    var duration = endTime - beginTime;
    interval = duration;
    currentStartTime = beginTime;
    currentEndTime = endTime;
    try {
      addEvent(beginTime, endTime, title, duration);
    } catch (err) {
      returnValues(currentStartTime, currentEndTime, title, interval);
      throw '1';
    }
  } catch (err) {
    returnValues(currentStartTime, currentEndTime, title, interval);
    throw '1';
  }
}

$(document).ready(function () {
  const States = {
    Standby: 0,
    Running: 1,
    Stopped: 2,
  };

  state = 0;
  currentStartTime = new Date();
  currentEndTime = new Date();
  hours = 0;
  minutes = 0;
  seconds = 0;

  if (localStorage.getItem('state') !== null) {
    state = localStorage.getItem('state');
    if (state == States.Running) {
      currentStartTime = new Date(localStorage.getItem('currentStartTime'));
      var duration = currentEndTime - currentStartTime;
      interval = duration;
      seconds = Math.floor((duration / 1000) % 60);
      minutes = Math.floor((duration / 1000 / 60) % 60);
      hours = Math.floor(duration / 1000 / 60 / 60);
      startTimer();
      addStartTime();
    } else if (state == States.Stopped) {
      currentStartTime = new Date(localStorage.getItem('currentStartTime'));
      currentEndTime = new Date(localStorage.getItem('currentEndTime'));
      var duration = currentEndTime - currentStartTime;
      interval = duration;
      seconds = Math.floor((duration / 1000) % 60);
      minutes = Math.floor((duration / 1000 / 60) % 60);
      hours = Math.floor(duration / 1000 / 60 / 60);
      startTimer();
      stopTimer();
      addStartTime();
      addEndTime();
      addDuration();
    }
  }

  $('#begin-content').css({ display: 'none' });
  $('#end-content').css({ display: 'none' });
  $('#dur-content').css({ display: 'none' });
  $('#dur-input').prop({ disabled: true });

  $('#start').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (state == States.Standby) {
      startTimer();
      currentStartTime = new Date();
      localStorage.setItem('currentStartTime', currentStartTime);
      addStartTime();
      state = States.Running;
    } else if (state == States.Stopped) {
      state = States.Running;
      resetTimer();
      currentStartTime = new Date();
      localStorage.setItem('currentStartTime', currentStartTime);
      startTimer();
      addStartTime();
    }
    localStorage.setItem('state', state);
  });

  $('#stop').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (state == States.Running) {
      stopTimer();
      currentEndTime = new Date();
      localStorage.setItem('currentEndTime', currentEndTime);
      addEndTime();
      addDuration();
      state = States.Stopped;
    }
    localStorage.setItem('state', state);
  });

  $('#save').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (state == States.Stopped) {
      try {
        getValues();
        resetTimer();
        state = States.Standby;
        $('#desc-error').text('');
      } catch (err) {
        console.log(err);
      }
    }
    localStorage.setItem('state', state);
  });

  $('#help-btn').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    loadText();
    togglePopup();
  });

  $('#close-btn').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    closePopup();
  });
});
