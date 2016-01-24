//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");

if(document.body != null){  
	
}


var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
started = false
advice_loaded = true
train_count = 0


workerID = psiTurk.taskdata.get('workerId')
console.log(psiTurk)

//
//document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();

bgImage.src = "static/images/back_cp.png";
bgImage.onload = function () {
	bgReady = true;
};


// Cart image
var cartReady = false;
var cartImage = new Image();
cartImage.src =  "static/images/cart.png";
cartImage.onload = function () {
	cartReady = true;
};


// Speed Down image
var poleReady = false;
var poleImage = new Image();
poleImage.src =  "static/images/pole.png";
poleImage.onload = function () {
	poleReady = true;
};

// Game objects
var cart_pole = {
	theta: 0, 
	x: 0,
	theta_d:0,
	x_d:0
};


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);




advice = []




var dynamics = function(u){
	CART_MASS = 1
	POLE_LENGTH = 5
	POLE_MASS = 0.00005
	theta = cart_pole.theta
	theta_d = cart_pole.theta_d
	console.log("STATE "+cart_pole.theta_d+" "+cart_pole.theta+" "+u)

	theta_dd =  (((CART_MASS + POLE_MASS) * 0.3 * Math.sin(theta)  - 
           (u + POLE_MASS * POLE_LENGTH * theta_d * Math.sin(theta))*Math.cos(theta)) / 
         ((4.0 / 3.0) * (CART_MASS + POLE_MASS) * POLE_LENGTH - 
          (POLE_MASS * POLE_LENGTH * Math.pow(Math.cos(theta), 2))))

	x_dd =  ((Math.pow(theta_d, 2) * Math.sin(theta) - theta_dd*Math.sin(theta)) 
         * POLE_MASS * POLE_LENGTH + u) / (POLE_MASS + CART_MASS);

	cart_pole.x_d += x_dd
	cart_pole.theta_d += theta_dd
	

	cart_pole.x += cart_pole.x_d
	cart_pole.theta += cart_pole.theta_d
	console.log("STATE "+cart_pole.theta_d+" "+cart_pole.theta+" "+u+" "+theta_dd)

	if(cart_pole.x <= -180){
		cart_pole.x = -180
		cart_pole.x_d = 0
	}
	if(cart_pole.x >= 150){
		cart_pole.x = 150
		cart_pole.x_d = 0
	}
	if(cart_pole.theta >= 1.2){
		cart_pole.theta = 1.2
	}
	if(cart_pole.theta <= -1.2){
		cart_pole.theta = -1.2
	}
	if(cart_pole.theta_d <= -0.000001){
		cart_pole.theta_d = -0.000001
	}
	if(cart_pole.theta_d >= 0.000001){
		cart_pole.theta_d = 0.000001
	}


}






// Update game objects
var update = function (modifier) {
	acc = 0

	
	if (37 in keysDown) { // Player holding left
		acc = -1;
	}
	if (39 in keysDown) { // Player holding right
		acc = 1;
	}




	dynamics(acc)

};


var TO_RADIANS = Math.PI/180; 
function drawPole(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 
	ctx.translate(x,y)
	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle) //* TO_RADIANS);

 
 
	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width/2), -(image.height/2));


	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}



fdbback = [0,0];

var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);

	}
	if(cartReady){
		ctx.drawImage(cartImage, cart_pole.x, 215);
	}
	if(poleReady){
		drawPole(poleImage, cart_pole.x+250,240,cart_pole.theta);
	}

};




// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	requestAnimationFrame(main);
	update()
	render()

};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};
