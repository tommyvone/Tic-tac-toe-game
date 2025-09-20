

let board = ["","","","","","","","",""];
let currentPlayer = "X";
let gameActive = true;
const cells = document.querySelectorAll(".cell");
const statusDisplay = document.getElementById("status");
const winMusic = document.getElementById("winMusic");
const flyingLetter = document.getElementById("flyingLetter");
const controlButton = document.getElementById("controlButton");

const winningCombinations = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// fireworks
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let fireworks = [];
let particles = [];
let animationFrameId;
let isFireworksActive = false;
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
window.addEventListener('resize', resizeCanvas);resizeCanvas();

function random(min,max){return Math.random()*(max-min)+min;}
function dist(ax,ay,bx,by){return Math.sqrt((bx-ax)**2+(by-ay)**2);}

class Firework {
  constructor(sx,sy,tx,ty){this.x=sx;this.y=sy;this.sx=sx;this.sy=sy;this.tx=tx;this.ty=ty;
    this.distanceToTarget=dist(sx,sy,tx,ty);this.distanceTraveled=0;this.coordinates=[];
    this.coordinateCount=3;while(this.coordinateCount--){this.coordinates.push([this.x,this.y]);}
    this.angle=Math.atan2(ty-sy,tx-sx);this.speed=4;this.acceleration=1.05;this.brightness=random(50,70);this.targetRadius=1;}
  update(i){this.coordinates.pop();this.coordinates.unshift([this.x,this.y]);this.speed*=this.acceleration;
    let vx=Math.cos(this.angle)*this.speed;let vy=Math.sin(this.angle)*this.speed;
    this.distanceTraveled=dist(this.sx,this.sy,this.x+vx,this.y+vy);
    if(this.distanceTraveled>=this.distanceToTarget){createParticles(this.tx,this.ty);fireworks.splice(i,1);}
    else{this.x+=vx;this.y+=vy;}}
  draw(){ctx.beginPath();ctx.moveTo(this.coordinates[this.coordinates.length-1][0],this.coordinates[this.coordinates.length-1][1]);
    ctx.lineTo(this.x,this.y);ctx.strokeStyle='hsl('+random(0,360)+',100%,'+this.brightness+'%)';ctx.stroke();
    ctx.beginPath();ctx.arc(this.tx,this.ty,this.targetRadius,0,Math.PI*2);ctx.stroke();}
}
class Particle{
  constructor(x,y){this.x=x;this.y=y;this.coordinates=[];this.coordinateCount=5;
    while(this.coordinateCount--){this.coordinates.push([this.x,this.y]);}
    this.angle=random(0,Math.PI*2);this.speed=random(1,10);this.friction=0.95;
    this.gravity=0.7;this.hue=random(0,360);this.brightness=random(50,80);
    this.alpha=1;this.decay=random(0.015,0.03);}
  update(i){this.coordinates.pop();this.coordinates.unshift([this.x,this.y]);this.speed*=this.friction;
    this.x+=Math.cos(this.angle)*this.speed;this.y+=Math.sin(this.angle)*this.speed+this.gravity;
    this.alpha-=this.decay;if(this.alpha<=0){particles.splice(i,1);}}
  draw(){ctx.beginPath();ctx.moveTo(this.coordinates[this.coordinates.length-1][0],this.coordinates[this.coordinates.length-1][1]);
    ctx.lineTo(this.x,this.y);ctx.strokeStyle='hsla('+this.hue+',100%,'+this.brightness+'%,'+this.alpha+')';ctx.stroke();}
}
function createParticles(x,y){let count=30;while(count--){particles.push(new Particle(x,y));}}
function loop(){ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='lighter';
  for(let i=fireworks.length-1;i>=0;i--){fireworks[i].draw();fireworks[i].update(i);}
  for(let i=particles.length-1;i>=0;i--){particles[i].draw();particles[i].update(i);}
  if(isFireworksActive){if(fireworks.length<5){let sx=canvas.width/2;let sy=canvas.height;let tx=random(50,canvas.width-50);let ty=random(50,canvas.height/2);fireworks.push(new Firework(sx,sy,tx,ty));}
    animationFrameId=requestAnimationFrame(loop);}}
function startFireworks(){if(!isFireworksActive){isFireworksActive=true;loop();}}
function stopFireworks(){isFireworksActive=false;fireworks=[];particles=[];ctx.clearRect(0,0,canvas.width,canvas.height);if(animationFrameId)cancelAnimationFrame(animationFrameId);}

function handleClick(index){
  if(!gameActive||board[index]!=="")return;
  board[index]=currentPlayer;
  cells[index].innerHTML=`<span class="letter">${currentPlayer}</span>`;
  const winCombo=getWinningCombo(currentPlayer);
  if(winCombo){
    gameActive=false;
    winCombo.forEach(i=>cells[i].classList.add("winner"));
    statusDisplay.textContent = `${currentPlayer} Wins! 🎉`;
    const loser=currentPlayer==="X"?"O":"X";
    showLoserCrying(loser);
    winMusic.currentTime=0;
    winMusic.play();
    startFireworks();
    startFlyingLetter(currentPlayer);
    controlButton.textContent = "Play Again";
    return;
  }
  if(!board.includes("")){
    statusDisplay.textContent="🤝 It's a Draw!";
    gameActive=false;
    controlButton.textContent = "Play Again";
    return;
  }
  currentPlayer=currentPlayer==="X"?"O":"X";
}

function getWinningCombo(p){
  for(let c of winningCombinations){if(c.every(i=>board[i]===p)){return c;}}
  return null;
}

function resetGame(){
  board=["","","","","","","","",""];
  currentPlayer="X";
  gameActive=true;
  statusDisplay.textContent="";
  cells.forEach(c=>{c.textContent="";c.classList.remove("winner");});
  winMusic.pause();winMusic.currentTime=0;
  stopFireworks();
  stopFlyingLetter();
  controlButton.textContent = "Let’s Play!";
}

function startFlyingLetter(letter){
  flyingLetter.textContent=letter;
  flyingLetter.style.animation='none';
  void flyingLetter.offsetWidth;
  flyingLetter.style.animation='flyAcross 3s linear infinite, popInOutLetter 1s ease-in-out infinite';
}
function stopFlyingLetter(){
  flyingLetter.style.animation='none';
  flyingLetter.textContent='';
}

function showLoserCrying(loserSymbol){
  const crySpan = document.createElement('span');
  crySpan.textContent = ` 😢 (${loserSymbol} is sad)`;
  crySpan.className = 'emoji-shake';
  statusDisplay.appendChild(crySpan);
}
