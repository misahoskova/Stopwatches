const CLIENT_ID = "235209653614-snl0h48u3cbgaqr85psvojr28ioosat5.apps.googleusercontent.com";
const API_KEY = 'AIzaSyA8iRrOQFRiCDqYrcSJUKhBo-Nuf4-vws4';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar";

let tokenClient;
let gapiInited = false;
let gisInited = false;


async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
       * Callback after Google Identity Services are loaded.
       */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "" // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
       * Enables user interaction after all libraries are loaded.
       */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    //document.getElementById("#google").style.visibility = "visible";
  }
}

function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}


function formattedDuration(duration) {
  var durationFormat = formatTime(Math.floor(duration / 1000 / 60 / 60)) + ":" + formatTime(Math.floor((duration / 1000 / 60) % 60)) + ":" + formatTime(Math.floor((duration / 1000) % 60));
  return(durationFormat);
};


$(document).ready(function() {

  // DEFINICE PROMĚNNÝCH
  const States = {
    Standby: 0,
    Running: 1,
    Stopped: 2,
  }

  var state = 0;
  var currentStartTime = new Date();
  var currentEndTime = new Date();
  var description;
  

  var hours = 0;
  var minutes = 0;
  var seconds = 0;

  var interval;
  
  if (localStorage.getItem("state") !== null) {
    state = localStorage.getItem("state");
    if(state == States.Running) {
      currentStartTime = new Date(localStorage.getItem("currentStartTime"));
      var duration = currentEndTime - currentStartTime;
      interval = duration;
      seconds = Math.floor((duration / 1000) % 60);
      minutes = Math.floor((duration / 1000 / 60) % 60);
      hours = Math.floor(duration / 1000 / 60 / 60);
      startTimer();
      addStartTime();
    }
    else if (state == States.Stopped) {
      currentStartTime = new Date(localStorage.getItem("currentStartTime"));
      currentEndTime = new Date(localStorage.getItem("currentEndTime"));
      var duration = currentEndTime - currentStartTime;
      interval = duration;
      seconds = Math.floor((duration / 1000) % 60);
      minutes =  Math.floor((duration / 1000 / 60) % 60);
      hours = Math.floor(duration / 1000 / 60 / 60);
      startTimer();
      stopTimer();
      addStartTime();
      addEndTime();
      addDuration();
    }

  }

  // FUNKCE PRO FUNGOVÁNÍ STOPEK
  function google() {
    $(".stopwatch").css({ "display": "block" });
    $("#form").css({ "display": "flex" });
    $("#gbtn").css({ "display": "none" });
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
      var result = time < 10 ? `0${time}` : time;
      return result;
    }

    $("#hours").text(hoursText(hours));
    $("#minutes").text(hoursText(minutes));
    $("#seconds").text(hoursText(seconds));
  };



  function displayTime(time) {
    return(formatTime(time.getHours()) + ":" + formatTime(time.getMinutes()) + ":" + formatTime(time.getSeconds()) + " " + formatTime(time.getDate()) + "." + formatTime(time.getMonth()+1) + ". " + time.getFullYear() );
  }

  function parseTime(timeStr) {
    var time = new Date();
    if(timeStr.length != 20) {
      console.log(timeStr);
      throw "Špatný formát času:špatná délka " + timeStr.length;
    }
    time.setHours(timeStr.substring(0,2));
    time.setMinutes(timeStr.substring(3,5));
    time.setSeconds(timeStr.substring(6,8));
    time.setDate(timeStr.substring(9,11));
    time.setMonth((timeStr.substring(12,14)-1));
    time.setFullYear(timeStr.substring(15,20));
    return(time);
  }


  function formattedStartTime() {
    return(displayTime(currentStartTime));
  };

  function formattedEndTime() {
    return(displayTime(currentEndTime));
  };


  // funkce pro start stopek
  function startTimer() {
    setTimer();
    interval = setInterval(() => {
      seconds++;
      setTimer();
    }, 1000);
  };

  // funkce pro stop stopek
  function stopTimer() {
    clearInterval(interval);
  };

  // funkce pro přidání času
  function addTime() {

  };

  function resetTimer() {
    hours = 0;
    minutes = 0;
    seconds = 0;
    setTimer();
    clearInterval(interval);
    $("#desc-input").val("");
    $("#begin-input").val("");
    $("#end-input").val("");
    $("#dur-input").val("");
    $("#begin-content").css({ "display": "none" });
    $("#begin-label").css({ "display": "block" });
    $("#end-content").css({ "display": "none" });
    $("#end-label").css({ "display": "block" });
    $("#dur-content").css({ "display": "none" });
    $("#dur-label").css({ "display": "block" });
  };

  // FUNKCE PRO ZOBRAZENÍ NÁPOVĚDY
  function togglePopup() {
    $("#popup").toggleClass("active");
  }

  function closePopup() {
    $("#popup").removeClass("active");
  }

  function loadText() {
    $("#help-text").load("help.txt");
  }

  // FUNKCE PRO ZÁPIS DO POLÍ
  // funkce pro zapsání startu
  function addStartTime() {
    $("#begin-content").css({ "display": "block" });
    $("#begin-label").css({ "display": "none" });
    $("#begin-input").val(formattedStartTime());

    // přidání formattedStartTime do local storage
    localStorage.setItem("formattedStartTime", formattedStartTime());
  };

  function addEndTime() {
    $("#end-content").css({ "display": "block" });
    $("#end-label").css({ "display": "none" });
    $("#end-input").val(formattedEndTime());
  };

  function addDuration() {
    $("#dur-content").css({ "display": "block" });
    $("#dur-label").css({ "display": "none" });
    var duration = currentEndTime - currentStartTime;
    interval = duration;
    $("#dur-input").val(formattedDuration(duration));
  };

  function returnValues(beginTime, endTime, title, duration) {
    console.log("return");
    $("#begin-input").val(displayTime(beginTime));
    $("#end-input").val(displayTime(endTime));
    $("#desc-input").val(title);
    $("#dur-input").val(formattedDuration(duration));


  }

  //AIzaSyA8iRrOQFRiCDqYrcSJUKhBo-Nuf4-vws4
  // FUNKCE NA ZÍSKÁNÍ HODNOT Z POLÍ
  function getValues() {
    var title = "";
    var beginTime = new Date();
    var endTime = new Date();
   

      if($("#desc-input").val() == "") {
        $("#desc-error").text("Please fill the description");
        returnValues(currentStartTime, currentEndTime, "", interval);
        throw "1";
      }
      var title = $("#desc-input").val();

      if($("#begin-input").val() == "") {
        $("#begin-error").text("Please fill the start time");
        returnValues(currentStartTime, currentEndTime, title, interval);
        throw "1";
      }

      if($("#end-input").val() == "") {
        $("#end-error").text("Please fill the end time");
        returnValues(currentStartTime, currentEndTime, title, interval);
        throw "1";
      }
      try {
       beginTime = parseTime($("#begin-input").val());
       endTime = parseTime($("#end-input").val());

      if(beginTime == parseTime("00:00:00 01.01. 0000")) {
       $("#begin-error").text("Start time has a wrong format");
       returnValues(currentStartTime, currentEndTime, title, interval);
       throw "1";
      }

      if(endTime == parseTime("00:00:00 01.01. 0000")) {
        $("#end-error").text("End time has a wrong format");
        returnValues(currentStartTime, currentEndTime, title, interval);
        throw "1";
      }

      if(beginTime >= endTime) {
        $("#begin-error").text("Start time is later than end time");
        returnValues(currentStartTime, currentEndTime, title, interval);
        throw "1";
      }


       
      var duration = endTime - beginTime;
      interval = duration;
      currentStartTime = beginTime;
      currentEndTime = endTime;
      try {
        addEvent(beginTime, endTime, title, duration);
      }
      catch(err) {

        returnValues(currentStartTime, currentEndTime, title, interval);
        console.log(err);
        console.log("google");
        throw "1";
      }
      
    }
    catch(err) {
      returnValues(currentStartTime, currentEndTime, title, interval);
      console.log(err);
      console.log("Špatnýn formát času2");
      throw "1";
    }
    
  };

  // DEFINICE POČÁTEČNÍCH STAVŮ PRVKŮ
  $("#begin-content").css({ "display": "none" });
  $("#end-content").css({ "display": "none" });
  $("#dur-content").css({ "display": "none" });
  $("#dur-input").prop({ "disabled": true });

  // STAVOVÝ AUTOMAT
  $("#start").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    

    if (state == States.Standby) {
      startTimer();
      currentStartTime = new Date();
      localStorage.setItem("currentStartTime", currentStartTime);
      addStartTime();
      state = States.Running;
    } 
    else if (state == States.Running) {

    }
    else if (state == States.Stopped) {
      state = States.Running;
      resetTimer();
      currentStartTime = new Date();
      localStorage.setItem("currentStartTime", currentStartTime);
      startTimer();
      addStartTime();
    }
    localStorage.setItem("state", state);
  });

  $("#stop").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    

    if (state == States.Standby) {

    } 
    else if (state == States.Running) {
      stopTimer();
      currentEndTime = new Date();
      localStorage.setItem("currentEndTime", currentEndTime);
      addEndTime();
      addDuration();
      state = States.Stopped;
    }
    else if (state == States.Stopped) {

    }
    localStorage.setItem("state", state);
  });

  $("#save").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (state == States.Standby) {

    } 
    else if (state == States.Running) {

    }
    else if (state == States.Stopped) {
      try {
        getValues();
        resetTimer();
        state = States.Standby;
        $("#desc-error").text("");
      }
      catch(err) {
        console.log(err);
      }
     
    }
    localStorage.setItem("state", state);
  });

  // NÁPOVĚDA
  $("#help-btn").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    loadText();
    togglePopup();
  });

  $("#close-btn").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    closePopup();
  });

  $("#google").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    tokenClient.callback = async resp => {
      if (resp.error !== undefined) {
        throw resp;
      }
      console.log("loged in");
      google();
     
    };
  
    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: "" });
    }
  });

  function addEvent(startTime, endTime, title, duration){
    var ISOstartdate = "";
    var desc = "Doba trvání: " + formattedDuration(duration);
    var event = {
      summary: title,
      description: desc,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      }
    };
  
    console.log(event);
    var request = gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event
    });
  
    request.execute(function(event) {
      console.log(event.htmlLink);
    });
  };
});

