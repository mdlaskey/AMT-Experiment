//window.onLoad=function(){
// Create the canvas


var canvas = document.getElementById("canvas");

if(document.body != null){  
	var background = document.getElementById("background").className;
	var roboCoach = (document.getElementById("roboCoach").className == 'true')
	var expert = (document.getElementById("expertCoach").className == 'true')
	var summer = (document.getElementById("summer").className == 'true')
	var fnl = (document.getElementById("final").className == 'true')
	var training = (document.getElementById("training").className == 'true')
	document.getElementById('next').style.visibility = 'hidden'
	document.getElementById('text_wait').style.visibility = 'hidden'
	document.getElementById('train_up').style.visibility = 'hidden'
	document.getElementById('train_down').style.visibility = 'hidden'
	document.getElementById('test_up').style.visibility = 'hidden'
	document.getElementById('test_down').style.visibility = 'hidden'
}
train_coach = training
console.log(background+" "+roboCoach+" "+expert+" "+summer+" "+fnl)
train_down = true
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

bgImage.src = background;
bgImage.onload = function () {
	bgReady = true;
};
// Car image
var carReady = false;
var carImage = new Image();

carImage.src =  "static/images/human_ 0.png";
carImage.onload = function () {
	carReady = true;
};

// Speed Up image
var upReady = false;
var upImage = new Image();
upImage.src =  "static/images/green_car.png";
upImage.onload = function () {
	upReady = true;
};


// Speed Down image
var downReady = false;
var downImage = new Image();
downImage.src =  "static/images/red_car.png";
downImage.onload = function () {
	downReady = true;
};

// Game objects
var car = {
	v: 0, // movement in pixels per second
	theta: Math.PI,
	x: canvas.width/2,
	y: canvas.width/2, 
	x_f:-395.36474681, 
	y_f:499.29913709,
	ref_speed: 4,
	help: 0,
	low: false,
	interval: 60,
	t: 60
};


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var reset_car = function(complete){
	car.v = 0, // movement in pixels per second
	car.theta = Math.PI,
	car.x = canvas.width/2,
	car.y = canvas.width/2, 
	car.x_f = -395.36474681, 
	car.y_f = 499.29913709,
	car.ref_speed = 4,
	car.help = 0,
	car.low = false,
	interval = 60,
	car.t = 60,
	fdbback = 0
	if(!complete){
		started = false
	}


}

var car_dyn = function(angle,acc){
	w = 20
	
	car.x = car.x - car.v*Math.cos(car.theta)
	car.y = car.y - car.v*Math.sin(car.theta)
	car.x_f = car.x_f - car.v*Math.cos(car.theta)
	car.y_f = car.y_f - car.v*Math.sin(car.theta)
	car.theta = car.theta - car.v*Math.tan(angle)/w
	car.v = car.v + acc
	console.log(car.x+" "+car.y)

}

advice = []

var checkRight = function(a){
	if(car.low && fdbback < 0){
		return true 
	}
	else if(!car.low && fdbback >0){
		return true
	}
	else if(car.low && a>0){
		return true
	}
	else if(!car.low && a<0){
		return true
	}
	else{
		return false
	}

}


var learningCoach = function(){
	epsilon = 180
	conf = 0.0
	for(i=0; i<advice.length; i++){
		state = advice[i][0]
		sum = Math.pow(car.x-state[0],2)
		sum += Math.pow(car.y-state[1],2)
		l2 = Math.pow(sum,0.5)

		if(l2< epsilon  && advice[i][1][1]>0 && car.v == state[2] && !checkRight()){
			
			fdbback = advice[i][1][0]
			console.log("fdbback ",fdbback)
			
			return
		}
	}
}


var inOil = function(){

	if(car.x > 1020 && car.x < 1400){
		if(car.y > 165 && car.y < 520){
			return true
		}
	}

	// if(car.x > 1330 && car.x < 1780){
	// 	if(car.y > 350 && car.y < 670){
	// 		return true
	// 	}
	// }

	return false
}


var expertCoach = function(){
	if(car.help == 0){
		fdbback = 0
	}
	else if(car.help < 0){
		fdbback = -1
	}
	else{
		fdbback = 1
	}
}

var pumpedBrakes = function(){

	if(car.t < car.interval){ 
		car.t++; 
	}
	else{ 
		car.t = 0
		if(car.low){ 
			car.ref = car.v 
			car.low = false
		}
		else{
			car.ref = car.v
			car.low = true
		}
	}
	console.log("REF "+car.ref + " V "+car.v + " LOW " + car.low + " T " +car.t)

	if(car.low && car.v >= car.ref){
		car.help = -1
		return 1
	}
	else if(!car.low && car.v <= car.ref){
		car.help = 1
		return 1
	}
	else{
		car.help = 0
		return 0
	}
		
	
}
var dynamics = function(angle,acc){
	if(!inOil()){
		car.ref = car.ref_speed
		car.help = 0
		out = true
	}
	else if(!summer && inOil()){ 
		if(out){
			out = false
			car.v= car.ref_speed
		}

		val = pumpedBrakes()
		if(acc > 0){
			acc = 0.1
		}
		
		if(val > 0.0){
			angle = 0.7*angle-.145
			//angle = angle
		}
	}
	car_dyn(angle,acc)
	if(inOil() && !summer){
		if(car.v > car.ref_speed+1){
			car.v = car.ref_speed+1
		}
		else if(car.v < car.ref_speed-1){ 
			car.v = car.ref_speed-1
		}
	}

	if(!inOil() || summer){
		if(car.v > 5){
			car.v = 5
		}
	}
	if(car.v < 3){ 
		car.v = 3
	}
}

var make_data= function (){
	data = []
	data.push({
		key: "key",
		value: workerID
	})
	data.push({
		key: "x",
		value: -(car.x-1700)+(canvas.width/2 - 1385)
	})
	data.push({
		key: "y",
		value: (car.y-1700)-(canvas.width/2 - 1187)
	})

	data.push({
		key: "v",
		value: car.v
	})

	data.push({
		key: "theta",
		value: car.theta
	})
	
	return data
}


var training_update = function(){
	acc = 0
	if (38 in keysDown) { // Player holding up
		acc = 1;
	}
	if (40 in keysDown) { // Player holding down
		acc = -1;
	}

	if(train_count == 0 && acc == -1){
		train_count += 1
	}
	else if(train_count == 1 && acc == 1){
		train_count += 1
	}
	else if(train_count == 2 && acc == -1){
		train_count += 1
	}
	else if(train_count == 3 && acc == 1){
		train_count += 1
	}
	else if(train_count == 4){
		document.getElementById('next').style.visibility = 'visible'
		training = false
	}
}




// Update game objects
var update = function (modifier) {
	acc = 0
	angle = 0

	state = []
	
	
	if (38 in keysDown) { // Player holding up
		acc = 1;
	}
	if (40 in keysDown) { // Player holding down
		acc = -1;
	}
	if (37 in keysDown) { // Player holding left
		angle = 0.1;
	}
	if (39 in keysDown) { // Player holding right
		angle = -0.1;
	}

	state = make_data()
	state.push({
		key: "angle",
		value: angle
	})
	state.push({
		key: "v",
		value: acc
	})



	if(inOil()){
		
		$.ajax('http://'+address+':5000/get_help', {
	                type: "GET",
	                data: state
	                });
		
		if(roboCoach && round>0 && !summer){
			learningCoach()
		}
		else if(expert){
		 	expertCoach()
		}
	}

	dynamics(angle,acc)

};


var TO_RADIANS = Math.PI/180; 
function drawRotatedImage(image, x, y, angle) { 
 
	// save the current co-ordinate system 
	// before we screw with it
	ctx.save(); 
 
	// move to the middle of where we want to draw our image
	ctx.translate(x, y);
 
	// rotate around that point, converting our 
	// angle from degrees to radians 
	ctx.rotate(angle) //* TO_RADIANS);
 
	// draw it up and to the left by half the width
	// and height of the image 
	ctx.drawImage(image, -(image.width/2), -(image.height/2));
 
	// and restore the co-ords to how they were when we began
	ctx.restore(); 
}



fdbback = 0;
// Draw everything

var render_train = function(){
	document.getElementById('text').style.visibility = 'hidden'
	var img_d = downImage
	// img_d.width = '100%'
	// img_d.height = '900%'

	var img_u = upImage
	// img_u.width = '900%'
	// img_u.height = '900%'
	if(train_count == 0){
		drawRotatedImage(img_d, canvas.width/2, canvas.height/2,car.theta);
		document.getElementById('train_up').style.visibility = 'hidden'
		document.getElementById('train_down').style.visibility = 'visible'
	}
	else if(train_count == 1){
		drawRotatedImage(img_u, canvas.width/2, canvas.height/2,car.theta);
		document.getElementById('train_up').style.visibility = 'visible'
		document.getElementById('train_down').style.visibility = 'hidden'
	}
	else if(train_count == 2){
		drawRotatedImage(img_d, canvas.width/2, canvas.height/2,car.theta);
		document.getElementById('test_down').style.visibility = 'visible'
		document.getElementById('train_up').style.visibility = 'hidden'
	}
	else if(train_count == 3){
		drawRotatedImage(img_u, canvas.width/2, canvas.height/2,car.theta);
		document.getElementById('test_up').style.visibility = 'visible'
		document.getElementById('test_down').style.visibility = 'hidden'
	}

}

var render = function () {
	if (bgReady) {

		//ctx.drawImage(bgImage, car.x-1385, car.y-1187);

		ctx.drawImage(bgImage, car.x-1700, car.y-1700);
		//ctx.drawImage(bgImage, car.x,car.y);
	}

	if(inOil() && (roboCoach || expert)){
		
		if(fdbback == 0 && carReady){
			drawRotatedImage(carImage, canvas.width/2, canvas.height/2,car.theta);
		}
		else if(fdbback < 0 && downReady){
			drawRotatedImage(downImage, canvas.width/2, canvas.height/2,car.theta);
		}
		else if(fdbback > 0 && upReady){
			drawRotatedImage(upImage, canvas.width/2, canvas.height/2,car.theta);
		}
	}
	else{ 
		if(carReady){
			drawRotatedImage(carImage, canvas.width/2, canvas.height/2,car.theta);
		}
	}


};

ROUNDS = 1
round = 0
if(fnl || summer){
	ROUNDS = 1
}
T=500
if(summer){
	T = 1100
}
t=0

var finish = function(complete){
	if(complete){
		document.getElementById('next').style.visibility = 'visible'
	}

	keys = []
	keys.push({
		key: "key",
		value: workerID
	})
	keys.push({
		key: "roboCoach",
		value: roboCoach && !complete
	})
	reset_car(complete)
	if(roboCoach && !complete){
		document.getElementById('text_wait').style.visibility = 'visible'
		advice_loaded = false
	}


	$.ajax('http://'+address+':5000/finish_trial', {
        type: "GET",
        data: keys,
        // Work with the response
		success: function( response ) {
	    // server response
	    
	    if(roboCoach && !complete){
	    	advice = response.items
	    	document.getElementById('text_wait').style.visibility = 'hidden'
	    	
	    }
	   		advice_loaded = true
		}
        });

	
	requestAnimationFrame(main);
}

var start = function (modifier){

	if(!roboCoach){	

		if(!started){
			document.getElementById('text').style.visibility = 'visible'
		}
		if(13 in keysDown){
			started = true
			document.getElementById('text').style.visibility = 'hidden'
		}
	}
	else{
		if(!started && advice_loaded){
			document.getElementById('text').style.visibility = 'visible'
		}
		if(13 in keysDown && advice_loaded){

			started = true
			document.getElementById('text').style.visibility = 'hidden'
		}
	}
}




// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	console.log("BGREADY "+bgReady+" Start "+started+"ROUNDS "+round + "train_coach "+train_coach)
	if(round < ROUNDS && bgReady && started && !train_coach){
		if(t<T){
		
			update(delta / 1000);
			render();

			then = now;
			t = t+1
			// Request to do this again ASAP
			requestAnimationFrame(main);
		}
		else{

			round = round +1
			t = 0
			finish(round == ROUNDS)
		}
	}
	else if(training){
		training_update()
		render_train()
		requestAnimationFrame(main);
	}
	else if((!bgReady || !started) && !train_coach){
		// Request to do this again ASAP
		requestAnimationFrame(main);
		//render();
		start()
	}


};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();

main();
//};
