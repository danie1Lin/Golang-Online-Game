var movement = {
    CommandNum: 0,
    Up: false,
    Down: false,
    Left: false,
    Right: false 
};

function motionManager(ctx){
    this.stamp = 0;
    this.commandNum = 0;
    this.playerInfo = new Map();
    this.playerPos = {};
    this.ctx = ctx;
    this.serverData = [];
    this.id = null;
    this.input = function(data){
        this.serverData.push(data)
        switch (data.Type){
        case  "COR": 
            if (this.id != null){
                playerXY = data.Data[this.id];
                this.stamp = data.Data["Stamp"]
                interpolation(myPrePoint,[playerXY.X,playerXY.Y], 5, this.playerInfo.get(this.id).points)
                myPrePoint = [playerXY.X,playerXY.Y]
            }
            else {
                console.log("No ID")
            }
            break;
        case "ID" :
            this.id = data.Data;
            console.log('Login! ID:',this.id);
            $("#status-bar").html("Your id is "+String(this.id));
            this.playerInfo.set(this.id,{
                points : [[0,0]],
                shape : "square",
                color : "rgb(200,0,0)",
                state : "alive",
                name : String(this.id)
            });
            //TODO : Transmit info back
            message = {Type:'INFO',Data:{id:this.id,Info:this.playerInfo.get(this.id)}};
            sock.send(JSON.stringify(message));
            break;
        case "INFO":
            this.playerInfo.set(data.Data.id,data.Data.Info);
            break;
        default:
            console.log("unKown infoType:",data.Type)
        }
    }
    this.renderPlayer = function(){
        for (let [id,info] of this.playerInfo){
        let p = [];
        if (info.points.length > 1) {
            p = info.points.pop();
        }
        else if(info.points.length == 1){
            p = info.points[0];
        }   
        drawRect(this.ctx, p[0], p[1], info.color, info.name);
        }
    }
    this.predict = function(){
    
    }
    this.resolve = function(){
    
    }   
}

var player = null;
var myPoints = new Array();
var sock = null;
var myPrePoint = [0,0];
var wsuri = "ws://35.185.75.79:8080/ws";
var playerName = "";
var Enemy = null;
var playerXY = {
    stamp:'',
    X:0,
	Y:0
};

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
function drawRect(ctx, x, y, color="rgb(200,0,0)", name){
    ctx.fillStyle = color;
    ctx.fillRect (x-5, y-5, 10, 10);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText(name,x,y);
}


function loop(){
    var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, 800, 600); // clear canvas
	ctx.save();
    player.renderPlayer();
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
        player.predict();
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
    var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	console.log("onload");
    player = new motionManager(ctx);
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
	    player.input(data);
    }
    init();
};

function init(){
	window.requestAnimationFrame(loop);
}
function send() {
	var msg = document.getElementById('message').value;
	sock.send(msg);
};

function interpolation(pre, next, interval, points) {
    distance = [next[0]- pre[0],next[1]- pre[1]];
    for(i=1;i<=interval;i++){
        points.unshift([pre[0] + i* distance[0]/interval, pre[1] + i * distance[1]/interval]);
    }
}


