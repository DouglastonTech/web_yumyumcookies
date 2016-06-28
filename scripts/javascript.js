<!--
//Tech4Learning, Inc.
//www.tech4learning.com

pagewidth = -1;
pageheight = -1;
pagetype = -1;
function initialize(w1,h1,t1) {
	//w = the optomized page width
	//h = the optomized page height
	//t = scaling type
	//		0 = no scaling
	//		1 = scaled by page width
	//		2 = scaled to fit
	pagewidth = w1;
	pageheight = h1;
	pagetype = t1;
}

NS4 = (document.layers);
IE4 = (document.all);
var newW;
var newH;
var lctr=0;
function layout() {
	
	winW = (NS4) ? innerWidth : document.body.clientWidth;
	winH = (NS4) ? innerHeight : document.body.clientHeight;
	if (pagetype==1) {
		newW = winW;
		newH = (winW * (pageheight/pagewidth));
		document.getElementById('canvas').style.width = newW;
		document.getElementById('canvas').style.height = newH;	
	} else if (pagetype==2) {
		newW = winW;
		newH = winH;
		if (winW>winH) {
			newW = (newH * pagewidth)/pageheight;
			if (newW>winW) {
				newW = winW;
				newH = (newW * pageheight)/pagewidth;
			}
		} else {
			newH = (newW * pageheight)/pagewidth;
			if (newH>winH) {
				newH = winH;
				newW = (newH * pagewidth)/pageheight;
			}
		}
		document.getElementById('canvas').style.width = newW-20;
		document.getElementById('canvas').style.height = newH-20;
	} else if (pagetype==0) {
		//for cross browser compatibility, calculate the correct location
		//so the canvas element is centered
		posX = winW/2 -pagewidth/2;
		document.getElementById('canvas').style.left = posX;
	}
	
	if (pagetype>0 && document.styleSheets.length>0) {
		//scale text
		//identify the t4l style sheets
		var rules = get_tech4learning_rules();
		if (rules!=null) {
			for (var i = 0; i < rules.length; i++) {
				live_style = rules[i];
				style_name = live_style.selectorText;
				//normalize name (trim preceeding '.')
				if (style_name.indexOf(".")==0) {
					style_name = style_name.substring(1);
			}
				if (style_name.indexOf("tech4learning_style")==0) {
					cache_style =  find_rule(rules, "cache_"+style_name);
					if (cache_style!=null) {
						size = parseInt(cache_style.style.fontSize);
				if (pagetype==1) {
                	nsize = (size * ((winW / pagewidth)-0.025));
				} else if (pagetype==2) {
					if (winW>winH) {
						nsize = (size*((newH/pageheight)-0.025));
					} else {
						nsize = (size*((newW/pagewidth)-0.025));
					}
				}
						live_style.style.fontSize = nsize + 'px';
					}
				}
			}
		}
	}
	
	if (IE4) {
		correctPNGs();
	}
	
	//deal with vertical alignment placements
	correct_alignments();
	
	
	//force the layout to happen at least twice
	if (lctr++==0) {
		layout();
	}
	
	//make sure the canvas is visible
	document.getElementById('canvas').style.visibility = 'visible';
}
window.onload = layout;
window.onresize = layout;

//identify the tech4learning style sheet (only check the first 10 style sheets, document.styleSheets.length
//can return an incorrect value in some instances, so if there are more than 10 sheets, return null)
//due to cross-browser issues, this will return normalized rules from out style sheet
function get_tech4learning_rules() {
	for (var i = 0; i < 10; i++) {
		css = document.styleSheets[0];
		if (css!=null) {
			if (IE4) {
				// normalize for IE
				rules = css.rules;
			} else {
				rules = css.cssRules;
			}
			for (var j = 0; j < rules.length; j++) {
				if (rules[j].selectorText.indexOf("tech4learning_style")!=-1) {
					return rules;
				}
			}
		}
	}
	return null;
}

//find the css rule that begins with the name var
function find_rule(rules, name) {
	for (var i = 0; i < rules.length; i++) {
		style_name = rules[i].selectorText;
		if (style_name.indexOf(name)==0 || style_name.indexOf(name)==1) {
			return rules[i];
		}
	}
	return null;
}

//deal with vertical alignment placements
function correct_alignments() {
	var de = document.getElementsByTagName("span");
	var target;
	for(var i=0; i<de.length; i++){
		var name = de[i].id;
		if (name.indexOf("valign_top")!=-1) {
			de[i].style.position = 'absolute';
			de[i].style.top = '0px';
		} else if (name.indexOf("valign_middle")!=-1) {
			var h = de[i].offsetHeight;
			var ph = de[i].parentNode.offsetHeight;			
			var newTop = ((ph/2)-(h/2));
			if (newTop < 0){
				newTop = 0;
			}			
			de[i].style.position = 'absolute';
			de[i].style.top = newTop + 'px';
		} else if (name.indexOf("valign_bottom")!=-1) {
			var h = de[i].offsetHeight;
			var ph = de[i].parentNode.offsetHeight;			
			var newTop = (ph-h);
			if (newTop<0){
				newTop = 0;
			}
			de[i].style.position = 'absolute';
			de[i].style.top = newTop + 'px';
		}
	}
}



//correctly handle PNG transparency in Win IE 5.5 or higher.
function correctPNGs() {
	if(navigator.appVersion.lastIndexOf('Win') != -1) {
		//Detect IE Version 
		var versionCode=0
		if (navigator.appVersion.indexOf("MSIE")!=-1){
			temp=navigator.appVersion.split("MSIE")
			versionCode=parseFloat(temp[1])
		}
		if ((versionCode>0) && (versionCode<7)) {
			for(var i=0; i<document.images.length; i++) {
				var img = document.images[i]

				if (correctPNG(img)) {
					i = i - 1;
				}
			}
		}
	}
}

function correctPNG(img) {
	if (!IE4) {
		return;
	}
	var imgName = img.src.toUpperCase()
	if (imgName.substring(imgName.length-3, imgName.length) == "PNG") {
		var imgID = (img.id) ? "id='" + img.id + "' " : ""
		var imgClass = (img.className) ? "class='" + img.className + "' " : ""
		var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' "
		var imgStyle = "display:inline-block;" + img.style.cssText 
		if (img.align == "left") imgStyle = "float:left;" + imgStyle
		if (img.align == "right") imgStyle = "float:right;" + imgStyle
		if (img.parentElement && img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle
		var strNewHTML = "<span " + imgID + imgClass + imgTitle
		+ " style=\"" + "width:100%; height:100%;" + imgStyle + ";"
		+ "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"
		+ "(src=\'" + img.src + "', sizingMethod='scale');\"></span>" 
		img.outerHTML = strNewHTML
		return true;
	}
	return false;
}


function swapImage(evt,obj,source) {
	//Detect IE Version 
	var versionCode=0
	if (navigator.appVersion.indexOf("MSIE")!=-1){
		temp=navigator.appVersion.split("MSIE")
		versionCode=parseFloat(temp[1])
	}
		
	var img = document.getElementById(obj);
	if ((versionCode>0) && (versionCode<7) && (img.src==null)) {
		img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + source + "', sizingMethod='scale')" ;
		img.filters.item(0).apply();
	} else {
		img.src=source;
	}
}

function insertTTS(tts,loop) {
	document.write('<object classid="clsid:166B1BCA-3F9C-11CF-8075-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,0,0" ID=ib_tts width=1 height=1>\n');
	document.write('<param name=src value="resources/tts.dcr">\n');
	document.write('<param name=swRemote value="swSaveEnabled=\'true\' swVolume=\'true\' swRestart=\'true\' swPausePlay=\'true\' swFastForward=\'true\' swContextMenu=\'true\' ">\n');
	document.write('<param name=swStretchStyle value=none>\n');
	document.write('<param name="sw9" value="'+tts+'">\n');
	document.write('<param name="sw8" value="'+loop+'">\n');
	document.write('<embed src="resources/tts.dcr" bgColor=#FFFFFF  width=1 height=1 swRemote="swSaveEnabled=\'true\' swVolume=\'true\' swRestart=\'true\' swPausePlay=\'true\' swFastForward=\'true\' swContextMenu=\'true\' " swStretchStyle=none type="application/x-director" pluginspage="http://www.macromedia.com/shockwave/download/" sw9="'+tts+'" sw8="'+loop+'"></embed>\n');
	document.write('</object>\n');
}

function isMSIE() {
    return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') &&
            (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null)));
}

-->