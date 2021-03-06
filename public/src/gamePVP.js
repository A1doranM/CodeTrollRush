let ctx = document.getElementById("game").getContext("2d");
ctx.font = '30px Arial';

//game
let Img = {};
Img.player = new Image();
Img.player.src = '../assets/player.png';
Img.winner = new Image();
Img.winner.src = '../assets/golden_cup.png';
Img.bullet = new Image();
Img.bullet.src = '../assets/bullet.png';

Img.map = {};
Img.map['level_1'] = new Image();
Img.map['level_1'].src = '../assets/level_backgrounds/map2.png';
Img.map['level_1'] = new Image();
Img.map['level_1'].src = '../assets/level_backgrounds/map2.png';

let socket = io();
let toolTipElem = document.getElementById("game");
let showingTooltip;
let WIDTH = 1170;
let HEIGHT = 750;
let DKill = false;
let TKill = false;
let UKill = false;

//initial package
let Player = function(initPack){
    let self = {};
    self.id = initPack.id;
    self.number = initPack.number;
    self.x = initPack.x;
    self.y = initPack.y;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.score = initPack.score;
    self.map = initPack.map;
    self.win = initPack.win;

    self.draw = function(){
        if(Player.list[selfId].map !== self.map)
            return;
        let x = self.x - Player.list[selfId].x + WIDTH/2;
        let y = self.y - Player.list[selfId].y + HEIGHT/2;

        let hpWidth = 30 * self.hp / self.hpMax;
        ctx.fillStyle = 'red';
        ctx.fillRect(x - hpWidth/2,y - 40,hpWidth,4);

        let width = Img.player.width*2;
        let height = Img.player.height*2;

        if (self.win === true) {
            ctx.drawImage(Img.winner,
                0, 0, Img.winner.width, Img.winner.height,
                x - width, y - height, width*2, height*2);
            let showWinner = setTimeout(function () {
                socket.emit('denyWin', {inputID: 'denyWin', state: false});
                clearTimeout(showWinner);
                }, 3000);
        } else {
            ctx.drawImage(Img.player,
                0,0,Img.player.width,Img.player.height,
                x-width/2,y-height/2,width,height);
        }

    };

    Player.list[self.id] = self;


    return self;
};
Player.list = {};


let Bullet = function(initPack){
    let self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.map = initPack.map;

    self.draw = function(){
        if(Player.list[selfId].map !== self.map)
            return;
        let width = Img.bullet.width/2;
        let height = Img.bullet.height/2;

        let x = self.x - Player.list[selfId].x + WIDTH/2;
        let y = self.y - Player.list[selfId].y + HEIGHT/2;

        if (self.win === true) {
            ctx.drawImage(Img.winner,
                0, 0, Img.winner.width, Img.winner.height,
                x - width, y - height, width, height);
            socket.emit('denyWin', {inputID: 'denyWin', state: false});
            alert("Winner");
            showWinner = setTimeout(function () {
                document.body.removeChild(showingTooltip);
            }, 3000);
        }
        ctx.drawImage(Img.bullet,
            0,0,Img.bullet.width,Img.bullet.height,
            x-width/2,y-height/2,width,height);


    };

    Bullet.list[self.id] = self;
    return self;
};
Bullet.list = {};

let selfId = null;

socket.on('init',function(data){
    if(data.selfId)
        selfId = data.selfId;
    //{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], bullet: []}
    for(let i = 0 ; i < data.player.length; i++){
        new Player(data.player[i]);
    }
    for(let i = 0 ; i < data.bullet.length; i++){
        new Bullet(data.bullet[i]);
    }
});

socket.on('update',function(data){
    //{ player : [{id:123,x:0,y:0},{id:1,x:0,y:0}], bullet: []}
    for(let i = 0 ; i < data.player.length; i++){
        let pack = data.player[i];
        let p = Player.list[pack.id];
        if(p){
            if(pack.x !== undefined)
                p.x = pack.x;
            if(pack.y !== undefined)
                p.y = pack.y;
            if(pack.hp !== undefined)
                p.hp = pack.hp;
            if(pack.score !== undefined)
                p.score = pack.score;
            if(pack.win !== undefined){
                p.win = pack.win;
            }
        }
    }
    for(let i = 0 ; i < data.bullet.length; i++){
        let pack = data.bullet[i];
        let b = Bullet.list[data.bullet[i].id];
        if(b){
            if(pack.x !== undefined)
                b.x = pack.x;
            if(pack.y !== undefined)
                b.y = pack.y;
        }
    }
});

socket.on('remove',function(data){
    //{player:[12323],bullet:[12323,123123]}
    for(let i = 0 ; i < data.player.length; i++){
        delete Player.list[data.player[i]];
    }
    for(let i = 0 ; i < data.bullet.length; i++){
        delete Bullet.list[data.bullet[i]];
    }
});

setInterval(function(){
    if(!selfId)
        return;
    ctx.clearRect(0,0,750,1170);
    drawMap();
    drawScore();
    for(let i in Player.list) {
        Player.list[i].draw();
    }
    for(let i in Bullet.list)
        Bullet.list[i].draw();
},40);

let drawMap = function(){
    let player = Player.list[selfId];
    let x = WIDTH/2 - player.x;
    let y = HEIGHT/2 - player.y;
    ctx.drawImage(Img.map[player.map],x,y);
};

let scoreCounter = document.getElementById('crystalCounter');
let drawScore = function(){
    scoreCounter.innerText = Player.list[selfId].score;
};

let drawKills = function () {
    if(Player.list[selfId].score === 2 && !DKill){
        ctx.fillStyle = 'red';
        ctx.font = '100px Arial';
        ctx.fillText("Double kill", 300, 200);
        let showWinner = setTimeout(function () {
            DKill = true;
            ctx.font = '30px Arial';
            clearTimeout(showWinner);
        }, 3000);
    }
    if(Player.list[selfId].score === 3 && !DKill){
        ctx.fillStyle = 'red';
        ctx.font = '100px Arial';
        ctx.fillText("Double kill", 300, 200);
        let showWinner = setTimeout(function () {
            DKill = true;
            ctx.font = '30px Arial';
            clearTimeout(showWinner);
        }, 3000);
    }
    if(Player.list[selfId].score >= 4 && !DKill){
        ctx.fillStyle = 'red';
        ctx.font = '100px Arial';
        ctx.fillText("Double kill", 300, 200);
        let showWinner = setTimeout(function () {
            DKill = true;
            ctx.font = '30px Arial';
            clearTimeout(showWinner);
        }, 3000);
    }
};

function Run () {
    let script = document.getElementById("code").value;
    eval(script);
}

function saveStat() {
    socket.emit('saveStatsPVP', {state: player.score});
}

let Hero = function () {
    this.moveLeft = function(){
        socket.emit('action', {inputID:'left', state: true});
    };
    this.moveRight = function(){
        socket.emit('action', {inputID:'right', state: true});
    };
    this.moveUP = function(){
        socket.emit('action', {inputID:'UP', state: true});
    };
    this.moveDown = function(){
        socket.emit('action', {inputID:'down', state: true});
    };
    this.shootL = function (angle) {
        socket.emit('action', {inputID:'attackL', state: true, angle:angle});
        let timer = setInterval(function () {
            socket.emit('action', {inputID:'attackL', state: false});
            clearInterval(timer);
        }, 100);
    };
    this.shootR = function () {
        socket.emit('action', {inputID:'attackR', state: true});
        let timer = setInterval(function () {
            socket.emit('action', {inputID:'attackR', state: false});
            clearInterval(timer);
        }, 100);
    };
    this.shootU = function () {
        socket.emit('action', {inputID:'attackU', state: true});
        let timer = setInterval(function () {
            socket.emit('action', {inputID:'attackU', state: false});
            clearInterval(timer);
        }, 100);
    };
    this.shootD = function () {
        socket.emit('action', {inputID:'attackD', state: true});
        let timer = setInterval(function () {
            socket.emit('action', {inputID:'attackD', state: false});
            clearInterval(timer);
        }, 100);
    };
};

document.onkeydown = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('action',{inputID:'right',state:true});
    else if(event.keyCode === 83)   //s
        socket.emit('action',{inputID:'down',state:true});
    else if(event.keyCode === 65) //a
        socket.emit('action',{inputID:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('action',{inputID:'UP',state:true});
    else if(event.keyCode === 66)
        socket.emit('action', {inputID:'attackD', state: true});
};
document.onkeyup = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('action',{inputID:'right',state:false});
    else if(event.keyCode === 83)   //s
        socket.emit('action',{inputID:'down',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('action',{inputID:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('action',{inputID:'UP',state:false});
    else if(event.keyCode === 66)
        socket.emit('action', {inputID:'attackD', state: false});
};
