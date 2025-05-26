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

$(document).ready(function () {
  const States = {
    Standby: 0,
    Running: 1,
    Stopped: 2,
  };

  let state = 0;
  let currentStartTime = new Date();
  let currentEndTime = new Date();
  let interval;
  let hours = 0,
    minutes = 0,
    seconds = 0;

  if (localStorage.getItem('state') !== null) {
    state = localStorage.getItem('state');
    if (state == States.Running) {
      currentStartTime = new Date(localStorage.getItem('currentStartTime'));
      const duration = currentEndTime - currentStartTime;
      seconds = Math.floor((duration / 1000) % 60);
      minutes = Math.floor((duration / 1000 / 60) % 60);
      hours = Math.floor(duration / 1000 / 60 / 60);
      startTimer();
      addStartTime();
    } else if (state == States.Stopped) {
      currentStartTime = new Date(localStorage.getItem('currentStartTime'));
      currentEndTime = new Date(localStorage.getItem('currentEndTime'));
      const duration = currentEndTime - currentStartTime;
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

  function setTimer() {
    if (seconds === 59) {
      seconds = 0;
      minutes++;
    } else {
      seconds++;
    }
    if (minutes === 59) {
      minutes = 0;
      hours++;
    }

    $('#hours').text(formatTime(hours));
    $('#minutes').text(formatTime(minutes));
    $('#seconds').text(formatTime(seconds));
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

  function parseTime(str) {
    const time = new Date();
    if (str.length !== 20) throw 'Invalid time format';
    time.setHours(str.substring(0, 2));
    time.setMinutes(str.substring(3, 5));
    time.setSeconds(str.substring(6, 8));
    time.setDate(str.substring(9, 11));
    time.setMonth(str.substring(12, 14) - 1);
    time.setFullYear(str.substring(15, 20));
    return time;
  }

  function formattedStartTime() {
    return displayTime(currentStartTime);
  }

  function formattedEndTime() {
    return displayTime(currentEndTime);
  }

  function startTimer() {
    setTimer();
    interval = setInterval(setTimer, 1000);
  }

  function stopTimer() {
    clearInterval(interval);
  }

  function resetTimer() {
    hours = minutes = seconds = 0;
    clearInterval(interval);
    setTimer();
    $('#desc-input, #begin-input, #end-input, #dur-input').val('');
    $('#begin-content, #end-content, #dur-content').hide();
    $('#begin-label, #end-label, #dur-label').show();
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

  function addStartTime() {
    $('#begin-content').show();
    $('#begin-label').hide();
    $('#begin-input').val(formattedStartTime());
    localStorage.setItem('formattedStartTime', formattedStartTime());
  }

  function addEndTime() {
    $('#end-content').show();
    $('#end-label').hide();
    $('#end-input').val(formattedEndTime());
  }

  function addDuration() {
    $('#dur-content').show();
    $('#dur-label').hide();
    const duration = currentEndTime - currentStartTime;
    interval = duration;
    $('#dur-input').val(formattedDuration(duration));
  }

  function returnValues(beginTime, endTime, title, duration) {
    $('#begin-input').val(displayTime(beginTime));
    $('#end-input').val(displayTime(endTime));
    $('#desc-input').val(title);
    $('#dur-input').val(formattedDuration(duration));
  }

  function addEvent(beginTime, endTime, title, duration) {
    fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        beginTime: beginTime.toISOString(),
        endTime: endTime.toISOString(),
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Backend error');
        return res.json();
      })
      .then((data) => {
        console.log('Event saved:', data);
      })
      .catch((err) => {
        console.error('Save failed', err);
        throw 'Save failed';
      });
  }

  function getValues() {
    const title = $('#desc-input').val();
    if (!title) {
      $('#desc-error').text('Please fill the description');
      return;
    }

    const beginStr = $('#begin-input').val();
    const endStr = $('#end-input').val();

    if (!beginStr || !endStr) {
      $('#begin-error').text('Start and end time are required');
      return;
    }

    try {
      const beginTime = parseTime(beginStr);
      const endTime = parseTime(endStr);

      if (beginTime >= endTime) {
        $('#begin-error').text('Start time must be before end time');
        return;
      }

      const duration = endTime - beginTime;
      currentStartTime = beginTime;
      currentEndTime = endTime;

      addEvent(beginTime, endTime, title, duration);
    } catch (e) {
      $('#begin-error').text('Invalid time format');
    }
  }

  $('#begin-content, #end-content, #dur-content').hide();
  $('#dur-input').prop('disabled', true);

  $('#start').click(function (e) {
    e.preventDefault();
    if (state == States.Standby || state == States.Stopped) {
      resetTimer();
      currentStartTime = new Date();
      localStorage.setItem('currentStartTime', currentStartTime);
      startTimer();
      addStartTime();
      state = States.Running;
      localStorage.setItem('state', state);
    }
  });

  $('#stop').click(function (e) {
    e.preventDefault();
    if (state == States.Running) {
      stopTimer();
      currentEndTime = new Date();
      localStorage.setItem('currentEndTime', currentEndTime);
      addEndTime();
      addDuration();
      state = States.Stopped;
      localStorage.setItem('state', state);
    }
  });

  $('#save').click(function (e) {
    e.preventDefault();
    if (state == States.Stopped) {
      getValues();
      resetTimer();
      state = States.Standby;
      $('#desc-error').text('');
      localStorage.setItem('state', state);
    }
  });

  $('#help-btn').click(function (e) {
    e.preventDefault();
    loadText();
    togglePopup();
  });

  $('#close-btn').click(function (e) {
    e.preventDefault();
    closePopup();
  });
});
