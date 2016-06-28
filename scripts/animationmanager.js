/**
 * Has the list of objects to animate on the page and all their attributes
 */
document.write('<scr'+'ipt type="text/javascript" src="scripts/animation.js" ></scr'+'ipt>'); 
document.write('<scr'+'ipt type="text/javascript" src="scripts/animationutils.js" ></scr'+'ipt>'); 


var animations = new Array();
var _testMode = false;

//add an Animation to the animation array to me managed
function addAnimation(animation) {
	animations[animations.length] = animation;
}

// gets called on page load
function initializeAnimations() {
	initializeAnimations(false);
}
function initializeAnimations(testMode) {
	//set the overflow of the canvas to  hidden, clips objects outside the canvas
	document.getElementById('canvas').style.overflow = 'hidden';
	
	if (animations.length > 0) {
		for (i in animations) {
			animations[i].initializeAnimation();
		}
		updateAnimations();
	}
	if (testMode) {
		 _testMode = true;
		// document.write('<div id="footer" style="position:fixed;bottom:0px"><p id="fps">Not calculated yet.</p></div>'); 	 
		
		 var _body = document.getElementsByTagName('body') [0];
		 var _div = document.createElement('div');
		 _div.setAttribute('id',"fps");
		 _div.setAttribute('style',"position:fixed;bottom:0px");
		 _div.innerHTML = "Not calculated yet.";
		  
		 _body.appendChild(_div);
	
	}
}

var fps_count = 0;
var last_fps = -1;
//<div id="footer" style="position:fixed;bottom:0px">
//<p id="fps">This should be on the bottom.</p>
//</div> 

function updateAnimations() {
	var updated = false;
	var updateTime = new Date().getTime();
	for (i in animations) {
		if (animations[i].active) {
			animations[i].updateTarget(updateTime);
			updated = true;
		}
	}
	
	if (_testMode) {
		if (last_fps==-1) {
			document.getElementById("fps").innerHTML = "Not calculated yet";
			last_fps = updateTime;
		} else {
			if (updateTime-last_fps>1000) {
				document.getElementById("fps").innerHTML = fps_count+" fps";
				last_fps = updateTime;
				fps_count = 0;
			}
			fps_count++;
		}
	}
	
	if (updated)
		setTimeout('updateAnimations()', 30);
	else
		setTimeout('updateAnimations()', 100);
}


// Set the target animation active
function activateAnimation(target) {
	for (i in animations) {
		if (animations[i].target==target) {
			animations[i].active = true;
			animations[i].cycleCount = 0;
			animations[i].starttime = Number.NaN;
		}
	}
}

