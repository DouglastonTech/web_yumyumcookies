/**
 * Animation is defined by:
 * 
 * Path[] - array of points the animtion is to pass through
 * Duration - time it takes to complete
 * Trigger - either a delay from page load or click event
 * Delay - inital delay if not triggered
 * Motion - movement pace (ease in, ease out, accellerate)
 * Loop - how many times it goes
 *   *reverse - does it reverse along it's path
 *   
 * Size - size change
 * Stretch - horizontal or vertical streching
 * 
 * Fading - opacity shift
 * 
 */

/**
 * @param target ID of the object being animated
 * @param path coordinate array of the path or null if no path
 * @param duration duration of the animation
 * @param trigger null if animation starts on page load, otherwise ID of the
 * 					page item that triggers this animation
 * @param delay number of milliseconds after page load to activate
 * @paraam motion int value key of motion variable for timing shift
 * 			-TIMING_IDX_EASE_IN_OUT = 0;
 * 			-TIMING_IDX_CONSTANT    = 1;
 * 			-TIMING_IDX_ACCELERATE  = 2;
 * 			-TIMING_IDX_DECELERATE  = 3;
 * 			-TIMING_IDX_BOUNCE      = 4;
 * @param loopCycles the number of times the animation loops, or negative
 * 			if the animation is to loop forever
 * @param reverse the path followed is reversed on every other loop
 * @param scalex X scale amount applied over one iteration
 * @param scaley Y scale amount applied over one iteration
 * @param initialOpacity initial opacity of the object
 * @param finalOpacity final opacity of the object after one iteration
 * 
 */
function animation(target,path,duration,trigger,delay,motion,loopCycles,reverse,scalex,scaley,initialOpacity,finalOpacity) {
	this.target = target;
	this.docElement = null;
	this.path = path;
	this.motion = motion;
	this.loopCycles = loopCycles;
	if (reverse && loopCycles > 0) {
		this.loopCycles = 2 * loopCycles;
	}
	this.cycleCount = 0;
	this.reverse = reverse;
	this.scalex = scalex;
	this.scaley = scaley;
	this.initialOpacity = initialOpacity;
	this.finalOpacity = finalOpacity;
	this.originalWidth = -1;
	this.originalHeight = -1;
	
	this.initialOpacity = initialOpacity;
	this.finalOpacity = finalOpacity;
	
	if (this.path!=null && this.path.length > 0) {
		//for each x,y point on the path, set a third var that is the
		//distance from the previouse coordinate and calculate the 
		//total legnth of the path
		this.path[0][2] = 0;
	
		this.pathLength = 0;
		var i=0;
		for (i=1;i<path.length;i++) {
			this.path[i][2] = distance(path[i-1][0],path[i-1][1],path[i][0],path[i][1]);
			this.pathLength += this.path[i][2];
		}
	}

	//set the starttime to -1, means it hasnt started yet
	this.starttime = Number.NaN;
	this.duration = duration;
	
	//update the trigger object, if one was passed add onclick
	//function to trigger this animation (called through the
	//pages animationManager
	this.trigger = trigger;
	this.active = this.trigger==null;
	this.delay = delay;
	
	//called after the page is loaded, so document will be valid
	this.initializeAnimation = _initializeAnimation;
	function _initializeAnimation() {
		this.docElement = document.getElementById(target);
		
		this.originalWidth = this.docElement.style.width;
		this.originalHeight = this.docElement.style.height;
		this.updateLocation(0);
		
		//set the trigger action
		if (this.trigger!=null) {
			var triggerObj = document.getElementById(trigger);
			if (triggerObj != null) {
		    	var oldFun = triggerObj.onclick;
				if (oldFun==null) {
					triggerObj.onclick = function() {
						activateAnimation(target);
					}
				} else {
					triggerObj.onclick = function() {
						oldFun();
						activateAnimation(target);
					}
				}
			}
		}
	}

	//setup the updateTarget function, called from the animationManager
	this.updateTarget = _updateTarget;	
	function _updateTarget(time) {
		//update the target object
		if (isNaN(this.starttime))
			this.starttime = time+this.delay;
		
		toff = 0;
		per = (time-this.starttime)/duration;
		if (per<0) per = 0;
		if (per>1) {
			toff = (time-this.starttime)-duration
			per = 1;
		}
		
		per = adjustForTiming(this.motion,per);
		
		//if this.reverse is true, and this is an odd cycle, invert the
		//percentage from the timer
		var use_per = per; //value to use when updating element
		if (this.reverse && !isEven(this.cycleCount)) {
			use_per = 1-use_per;
		}
		
		//update the element location
		this.updateScale(use_per);
		this.updateOpacity(use_per);
		this.updateLocation(use_per);
		
		if (per>=1) {
			this.cycleCount++;
			if (this.loopCycles<=0 || this.loopCycles>this.cycleCount) {
				//continue on
				this.starttime = time-toff;
			} else {
				this.active = false;
				this.starttime = Number.NaN;
			}
		}
	}	
	
	//update the location of the object based on it's path
	this.updateLocation = _updateLocation;	
	function _updateLocation(percent) {
		if (this.path==null || this.path.length == 0) return;
		
		//figure out the two points that this percent
		//along the path lies between
		distance = this.pathLength*percent;

		//console.log("Total: %d  Distance: %d",this.pathLength,distance);
		
		//new x and y coordinates
		var nx=0; var ny=0;
		
		if (percent>=1) {
			pt0 = this.path[this.path.length-1];
			nx = pt0[0];
			ny = pt0[1];
		} else {
		var i=0;
			for (i=1;i<this.path.length;i++) {
				var t = distance/this.path[i][2];
				if(t>=1) {
					distance = distance - this.path[i][2];
				} else {
					pt0 = this.path[i-1];
					pt1 = this.path[i];
					
					nx = pt0[0] + ((pt1[0]-pt0[0])*t);
					ny = pt0[1] + ((pt1[1]-pt0[1])*t);
					break;
				}
			}
		}
		
		// offset for scaling
		cWidth = this.calcWidth(percent);
		cHeight = this.calcHeight(percent);
		nx = nx + (this.originalWidth.slice(0,-1) - cWidth) / 2;
		ny = ny + (this.originalHeight.slice(0,-1) - cHeight) / 2;
		
		this.docElement.style.left = nx+"%";
		this.docElement.style.top = ny+"%";
	}

	//update the scale of the object
	this.updateScale = _updateScale;	
	function _updateScale(percent) {
		if (this.scalex==1 && this.scaley==1)
			return;
		
		cWidth = this.calcWidth(percent);
		cHeight = this.calcHeight(percent);
		
		this.docElement.style.width = cWidth+"%";
		this.docElement.style.height = cHeight+"%";
	}
	
	this.calcWidth = _calcWidth;
	function _calcWidth(percent) {
		return this.originalWidth.slice(0,-1) * (1*(1-percent)+this.scalex*percent);
	}

	this.calcHeight = _calcHeight;
	function _calcHeight(percent) {
		return this.originalHeight.slice(0,-1) * (1*(1-percent)+this.scaley*percent);
	}
		
	//update the opacity of the object
	//opacity is for Mozilla and Safari, filter for Explorer. 
	//    value ranges from 0 to 10.
	this.updateOpacity = _updateOpacity;	
	function _updateOpacity(percent) {
		newOpacity = this.initialOpacity*(1-percent)+this.finalOpacity*percent;
		
		this.docElement.style.opacity = newOpacity;
		if (newOpacity < 0.999) {
			this.docElement.style.filter = 'alpha(opacity=' + newOpacity*100 + ')';

			// IE doesn't play support with opacity and translucent PNGs
			correctPNGElement(this.target);
		} else {
			this.docElement.style.filter = '';
		}
	}
	
	function correctPNGElement(target) {
		if (target.substring(0, 6) == "image.") {
			var imgID = "i."+target.substring(6, target.length);
			var imgElement = document.getElementById(imgID);
			
			if (imgElement.src) {
				correctPNG(imgElement);
			}
		}
	}
}
