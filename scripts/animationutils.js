var TIMING_IDX_EASE_IN_OUT = 0;
var TIMING_IDX_CONSTANT    = 1;
var TIMING_IDX_ACCELERATE  = 2;
var TIMING_IDX_DECELERATE  = 3;
var TIMING_IDX_BOUNCE      = 4;

function adjustForTiming(timingIdx,percent) {
	var value = 0;
	
	switch(timingIdx) {
	case TIMING_IDX_EASE_IN_OUT:
		value = doEaseInOut(percent);
		break;
	case TIMING_IDX_CONSTANT:
		value = percent;
		break;
	case TIMING_IDX_ACCELERATE:
		value = doDecelerate(percent);
		break;
	case TIMING_IDX_DECELERATE:
		value = doAccelerate(percent);
		break;		
	case TIMING_IDX_BOUNCE:
		value = doBounce(percent);
		break;
	default:
		console.error("Invalid timing type: "+timingIdx);
	}

	if (value<0) value=0;
	if (value>1) value=1;
	return value;
}


//return the distance between two points
function distance(x0,y0,x1,y1) {
	return Math.sqrt ( ((x1-x0)*(x1-x0)) + ((y1-y0)*(y1-y0)) );
}

//test wether a value is even or not
function isEven(value){
	if (value%2 == 0)
		return true;
	else
		return false;
}



//ease in out
function doEaseInOut(progress) {
	var p = -0.00000000000000009930137 
			- 0.11882344418770958 * progress
			+ 3.3564703325631298 * Math.pow(progress, 2) - 2.23764688837542
			* Math.pow(progress, 3);
	return p;
}

//simple decaying bounce
//adapted from http://www.motionscript.com/mastering-expressions/simulation-basics-3.html
function doBounce(progress) {
	var freq = 1.75;
	var amplitude = 1.0;
	var decay = 2.5;
	var p = 1 - (amplitude * (Math.abs(Math.cos(freq*progress*2*Math.PI))/Math.exp(decay*progress)));
	return p;
}

function doAccelerate(progress) {
	var p = Math.pow(progress, 3);
	return p;
}

function doDecelerate(progress) {
	var p =  1 - Math.pow(1-progress, 3);
	return p;
}

//interesting for testing when you just want a random path tot follow
function generateRandomPath(maxLength,maxX,maxY) {
	var arr = new Array();
	var l = 2 + Math.floor(Math.random()*maxLength);
	for (var i=0; i<l; i++) {
		arr[i] = [Math.floor(Math.random()*maxX),Math.floor(Math.random()*maxY)];
	}
	return arr;
}

