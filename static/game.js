var movement = {
    CommandNum: 0,
    Up: false,
    Down: false,
    Left: false,
    Right: false 
};

var myPoints = new Array();
var sock = null;
var myPrePoint = [0,0];
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
    ctx.fillRect (x, y, 10, 10);
}

function init(){
	window.requestAnimationFrame(loop);
    var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, 800, 600); // clear canvas
	ctx.save();
}

function loop(){
    var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, 800, 600); // clear canvas
	ctx.save();
    var p = [0,0];
    if (point.length > 1) {
        p = point.pop();
    }
    else if(point.length == 1){
        p = point[0];
    }
    drawRect(p[0],p[1]);
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
    var ifsend = false;
    switch (e.keyCode) {
    case 65: //A
        movement.Left = true;
        ifsend = true;
        break;
    case 87: //W
        movement.Up = true;
        ifsend = true;
        break;
    case 68: //D
        movement.Right = true;
        ifsend = true;
        break;
    case 83: //S
        movement.Down = true;
        ifsend = true;
        break;
    }
    if (ifsend) {
        movement.CommandNum += 1;
        message = {Type:'M',Data:movement};
        sock.send(JSON.stringify(message));
    }
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
        data = JSON.parse(e.data);
        console.log(data);
        if (data.Type == "COR") {
            if (Id != null){
                playerXY = data.Data[Id];
                Enemy = data.Data;
                interpolation(myPrePoint,[playerXY.X,playerXY.Y], 5, myPoints)
                myPrePoint = [playerXY.X,playerXY.Y]
            }
            else {
                console.log("No ID")
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

function interpolation(pre, next, interval, points) {
    distance = [next[0]-pre[0],next[1]-pre[1]];
    for(i=1;i<=interval;i++){
        points.unshift([pre[0] + i* distance[0]/interval, pre[1] + i * distance[1]/interval]);
    }
}

playerManager = function(ctx){
    this.stamp = 0;
    this.commandNum = 0;
    this.playerInfo = {};
    this.ctx = ctx;
    this.data = [];
    this.input = function(data){
    
    }
    this.interpolation = function(){
    
    }
    this.renderPlayer = function(){
    
    }
}
