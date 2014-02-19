var last_conn_time = new Date().getTime() / 1000;
var made_connection = false;
IDLE_THRESHOLD = 10; // in seconds
INIT_THRESHOLD = 3;

idle_img = new Image();
var col = "black";

$(document).ready(function() {


  load_gif = $("#load-gif");
  video = document.getElementById('main-screen');
  btnScreenshot = document.getElementById('btn-screenshot');
  mainRow = document.getElementById('main-row');
  streamChooser = document.getElementById('stream-chooser');
  screenshotsContainer = document.getElementById('screenshots-container');
  leftCarouselButton = $('.left.carousel-control')[0];
  rightCarouselButton = $('.right.carousel-control')[0];

  btnScreenshot.onclick = screenshotButtonHook;
  $('#change-channel-btn').click(function(){
    $('#login-modal').modal('show');
  });

  $('.carousel').carousel({
    interval: 0
  });
if ($_GET['channel']) {
    joinChannel($_GET['channel']);
    load_gif.css('display', 'block');

    last_conn_time = new Date().getTime() / 1000; 
    setInterval(function(){
    var now = new Date().getTime() / 1000;


    threshold = (made_connection) ? IDLE_THRESHOLD : INIT_THRESHOLD;
     if (now - last_conn_time > threshold)
     {
       displayIdle();
     }
  },5000);

        $('#login-modal').modal('hide');
    $('#main-row').css('opacity',1);
    $('.panel-title > span')[0].innerText = $_GET['channel'];
} else {
  $('#login-modal').modal({
    backdrop: 'static',
    keyboard: false
  });

}
  
  $('#green').click(color);
  $('#blue').click(color);
  $('#red').click(color);
  $('#yellow').click(color);
  $('#orange').click(color);	

  $('#stream-id').bind('keypress', function(e) {
    if (e.keyCode == 13) {
      closeModal(this.value);
    }
  });

  $('#go-channel').bind('click', function(e) {
    closeModal($('#stream-id')[0].value);
  });

  $('#cancel-email').bind('click', function() {
    $('#email-modal').modal('hide');
  });

  $('#go-email').bind('click', function() {
    $('#email-modal').modal('hide');
    emailButtonHook();
  });

  $('#email-id').bind('keypress', function(e) {
    if (e.keyCode == 13) {
      $('#email-modal').modal('hide');
      emailButtonHook();
    }
  });


});

var color = function(obj) {
	col = obj.target.id;
};

var $_GET = {};

document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
    }

    $_GET[decode(arguments[1])] = decode(arguments[2]);
});

var screenshotButtonHook = function () {
  $('#main-panel').removeClass('col-md-offset-4');
  $('#main-panel').addClass('col-md-offset-2');
  leftCarouselButton.style.visibility = 'visible';
  rightCarouselButton.style.visibility = 'visible';
  time = new Date();
  time = time.toTimeString();
  text = ' <div class="item active"> <div class="panel panel-primary"> <div class="panel-heading"> <h4 class="panel-title">' + time + '</h4> </div> <div class="panel-screenview panel-body"><canvas class="screenshot"></canvas></div><div class="panel-footer"> <button type="button" class="download-link btn btn-default">Download<span class="glyphicon glyphicon-download"></span></button><button type="button" class="emailBtn btn btn-default">Email <span class="glyphicon glyphicon-envelope"></span></button></div></div> </div>';
  if (screenshotsContainer.children[0]) {
    $(screenshotsContainer.children[0]).removeClass('active');
  }
  screenshotsContainer.insertAdjacentHTML('afterbegin', text); 
  canvas2 = $('.screenshot')[0];

  context2 = canvas2.getContext('2d');
  canvas2.width = canvas.width;
  canvas2.height = canvas.height;
  //context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  context2.drawImage(canvas, 0, 0, canvas.width, canvas.height);

  /* Start Shenil */
  canvas2.addEventListener("mousemove", function (e) {
    findxy('move', e);
  }, false);
  canvas2.addEventListener("mousedown", function (e) {
    findxy('down', e);
  }, false);
  canvas2.addEventListener("mouseup", function (e) {
    findxy('up', e);
  }, false);
  canvas2.addEventListener("mouseout", function (e) {
    findxy('out', e);
  }, false);


document.addEventListener("keypress", function (e) {
//    if (e.altKey)
  //  return;

    if (enteringText && (e.keyCode == 13 /*enter*/ || e.keyCode == 27 /*esc*/))
    {
      enteringText = false;
      flag = false;
      dot_flag = false;
    }
    if (!enteringText)
    return;
    e.preventDefault();
    thecontext = textCanvas.getContext('2d');
    thecontext.font = "20pt Arial"; //Courier";

    text_offset = (thecontext.measureText(currentString).width);
    currentString += String.fromCharCode(e.which);
    thecontext.fillText(String.fromCharCode(e.which), text_x + text_offset, text_y);

  }, false);

  var flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_flag = false;

  var x = "black",
  y = 2;

  function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = col;
    ctx.lineWidth = "3";
    ctx.stroke();
    ctx.closePath();
  }

  function erase() {
    var m = confirm("Want to clear");
    if (m) {
      ctx.clearRect(0, 0, w, h);
      document.getElementById("canvasimg").style.display = "none";
    }
  }

  function save() {
    document.getElementById("canvasimg").style.border = "2px solid";
    var dataURL = canvas.toDataURL();
    document.getElementById("canvasimg").src = dataURL;
    document.getElementById("canvasimg").style.display = "inline";
  }

  var enteringText = false;
  var textCanvas = null;
  var currentString = "";
  var text_x = 0;
  var text_y = 0;
function getPos(el) {
    // yay readability
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}

  function findxy(res, e) {

    var event = e || window.event; 
    if (enteringText) 
    return;

    var canvas = e.target;
    ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    if (res == 'down') {
      prevX = currX;
      prevY = currY;
      pos = getPos(canvas);
      currX = e.pageX - $(e.target).offset().left;
      currY = e.pageY - $(e.target).offset().top;
if (e.altKey)
      {

        enteringText = true;
        textCanvas = e.target;
        text_x = currX;
        text_y = currY;
        currentString = "";

        flag = false;
        dot_flag = false;
      }
      
      flag = true;
      dot_flag = true;
      if (dot_flag) {
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.fillRect(currX, currY, 2, 2);
        ctx.closePath();
        dot_flag = false;
      }
    }
    if (res == 'up' || res == "out") {
      currX = 0;
      currY = 0;
      flag = false;
    }
    if (res == 'move') {
      if (flag) {
pos = getPos(canvas);
      currX = e.pageX - $(e.target).offset().left;
      currY = e.pageY - $(e.target).offset().top;
ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      if (prevX == 0 && prevY == 0) {
        ctx.moveTo(currX, currY);
      } else {
      ctx.moveTo(prevX,  prevY);
    }
      ctx.lineTo(currX, currY);
      
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.stroke();
        prevX = currX;
        prevY = currY;
      }
    }
  }
  /* End Shenil */

  downloadButtons = $('.download-link');
  for (var i = 0; i < downloadButtons.length; i++) {

    downloadButtons[i].addEventListener('click', downloadButtonHook, false);
  }

  emailButtons = $('.emailBtn');
  for (i = 0; i < emailButtons.length; i++) {

    emailButtons[i].addEventListener('click',emailModalHook, false);
  }

};

var emailModalHook = function () {
  $('#email-modal').modal('show');
};

var emailButtonHook = function () {
   screenshots = $('canvas.screenshot');

   imgarray = [];
   var _i = 1;
   for (_i = 0; _i < screenshots.length; _i++) {
    imgarray.push(escape(screenshots[_i].toDataURL("image/jpeg")));
   }
   payload = {email: escape($('#email-id')[0].value), img_array: imgarray};

   socket.emit('pics', {msg: payload});
};

var downloadButtonHook = function (e) {
  e.preventDefault();

  var target = e.target;

  while (!$(target).hasClass('panel-heading') && !$(target).hasClass('panel-footer')) {
    target = target.parentElement;
  }

  Canvas2Image.saveAsPNG(target.parentElement.children[1].children[0]);

  return;
};

// Create SocketIO instance, connect
var socket = new io.connect('http://api.fuckitstreamit.com:2000'); 

function joinChannel(chan) {
  $('#chan').text(chan.toLowerCase());
  socket.emit("channel", { room: chan });
}

// Add a connect listener
socket.on('connect',function() {
    console.log('Client has connected to the server!');
 
});
i=0;

var image = document.getElementById("ia");
var canvas = document.getElementById("test");
var context = canvas.getContext('2d');
// Add a connect listener
socket.on('message',function(data) {
  idleDisplayed = false;
  load_gif.css('display', 'none');
  last_conn_time = new Date().getTime() / 1000;
  made_connection = true;
  image.src = "data:image/jpg;base64,"+data;
  canvas.width = 358;
  canvas.height = 358 * image.height / image.width;

  context.drawImage(image, 0, 0, 358, 358 * image.height / image.width);




});

socket.on('disconnect',function() {
  console.log('The client has disconnected!');
});

jQuery.fn.shake = function(intShakes, intDistance, intDuration) { this.each(function() { $(this).css("position","relative"); for (var x=1; x<=intShakes; x++) { $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/4))) .animate({left:intDistance}, ((intDuration/intShakes)/2)) .animate({left:0}, (((intDuration/intShakes)/4))); } }); return this; };

var idleDisplayed = false;
var displayIdle = function() {
  if (idleDisplayed == false) {
    idleDisplayed = true;
    load_gif.css('display', 'none');
  	thecanvas = $("#test")[0];
  	thecontext = thecanvas.getContext("2d");
    thecontext.fillStyle = "rgba(75,75,75,0.8)";
    thecontext.fillRect(0,0, thecanvas.width, thecanvas.height);	
  	thecontext.fillStyle = "white";
  	thecontext.font = "15px Helvetica";
  	thecontext.textAlign = "center";
  	thecontext.fillText("(no stream detected)", thecanvas.width/2, thecanvas.height/2);

  }
};


var closeModal = function(id) {
  if (id.length !== 8) {
    $('#login-modal').effect('shake');
  } else {
    console.log('Attempting to join ' + id);
    joinChannel(id);
    load_gif.css('display', 'block');

    last_conn_time = new Date().getTime() / 1000; 
    setInterval(function(){
    var now = new Date().getTime() / 1000;

    threshold = (made_connection) ? IDLE_THRESHOLD : INIT_THRESHOLD;
     if (now - last_conn_time > threshold)
     {

       displayIdle();
     }
  },5000);

    $('#login-modal').modal('hide');
    $('#main-row').css('opacity',1);
    $('.panel-title > span')[0].innerText = id;

  }

};

