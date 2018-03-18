var movement = {
    Up: false,
    Down: false,
    Left: false,
    Right: false 
};

var sock = null;
var wsuri = "ws://127.0.0.1:1234/ws";
var playerName = "";
var Enemy = null;
var playerXY = {
    stamp:'',
    X:0,
	Y:0
};

var Id = null;
function draw(){
	var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect (10, 10, 55, 50);
    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect (30, 30, 55, 50);
    ctx.beginPath();
    ctx.moveTo(75,50);
    ctx.lineTo(100,75);
    ctx.lineTo(100,25);
    ctx.fill();
}
function drawRect(x,y){
	var canvas = document.getElementById('game');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect (x, y, 45, 40);
}

function init(){
	window.requestAnimationFrame(loop);
}

function loop(){
    var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, 800, 600); // clear canvas
	ctx.save();
	drawRect(playerXY.X,playerXY.Y);
    if (Enemy != null){
        for( id in Enemy){
            if (id != Id){
                drawRect(Enemy[id].X,Enemy[id].Y)
            }
        }
    }
	ctx.restore();
	window.requestAnimationFrame(loop);
}

document.addEventListener('keydown', function(e){
    switch (e.keyCode) {
    case 65: //A
        movement.Left = true;
        break;
    case 87: //W
        movement.Up = true;
        break;
    case 68: //D
        movement.Right = true;
        break;
    case 83: //S
        movement.Down = true;
        break;
    }
        message = {Type:'M',Data:movement};
        sock.send(JSON.stringify(message));
        console.log(message);
});


document.addEventListener('keyup', function(e){
    switch (e.keyCode) {
    case 65: //A
        movement.Left = false;
        break;
    case 87: //W
        movement.Up = false;
        break;
    case 68: //D
        movement.Right = false;
        break;
    case 83: //S
        movement.Down = false;
        break;
    }
});

window.onload = function() {
	console.log("onload");
	sock = new WebSocket(wsuri);
	sock.onopen = function() {
		console.log("connected to " + wsuri);
	}
	sock.onclose = function(e) {
		console.log("connection closed (" + e.code + ")");
	}
	sock.onmessage = function(e) {
        data = JSON.parse(e.data)
        if (data.Type == "COR") {
            if (Id != null){
                playerXY = data.Data[Id];
                Enemy = data.Data;
            }
        }
        else if (data.Type == "ID"){
            Id = data.Data;
        }
	}
    init();
};

function send() {
	var msg = document.getElementById('message').value;
	sock.send(msg);
};

