var fs = require('fs');
var imCan = document.getElementById("image-canvas");
var imCanCtx =imCan.getContext('2d');
var triCan = document.getElementById("tri-canvas");
var container = document.getElementById("container")
var loadedImage = null;
var scale = null;

//
//
// IMAGE LOADING
//
//

function rescale(reloadImage){
	var width = container.offsetWidth;
	var height = container.offsetHeight;
	if(loadedImage !== null){
		var w = loadedImage.width;
		var h = loadedImage.height;
		var w_scale = width / w;
		var h_scale = height / h;
		scale = Math.min(w_scale, h_scale);
		$(imCan).css("width",w * scale * zoomScale);
		$(imCan).css("height",h * scale * zoomScale);
		$(triCan).css("width",w * scale * zoomScale);
		$(triCan).css("height",h * scale * zoomScale);
		$(imCan).attr("width",w * scale * zoomScale);
		$(imCan).attr("height",h * scale * zoomScale);
		$(triCan).attr("width",w );
		$(triCan).attr("height",h);
		$(triCan).attr("viewBox","0 0 " + w + " " + h);
		if(reloadImage){
			imCanCtx.drawImage(loadedImage, 0, 0, imCan.width, imCan.height);
		}
	}
}

function loadImage(url,callback){
	var mimes = {
		"image/png": ["png"],
		"image/jpeg": ["jpeg","jpg"]
	}
	var ext = url.split(".").reverse()[0].toLowerCase();
	for(key in mimes){
		if(mimes[key].indexOf(ext) != -1){
			resetAll();
			var data = fs.readFileSync(url);
			loadBuffer(data, key,callback);
			return true;
		}
	}
	return false;
}

function loadBuffer(input,mime,callback) {
    var blob = new Blob([input], {type: mime});
    var url = URL.createObjectURL(blob);
    var img = new Image;

    img.onload = function() {
    	// TODO: delete everything else here
    	loadedImage = this;
    	rescale(false);
    	center.x = loadedImage.width / 2;
    	center.y = loadedImage.height / 2;
        imCanCtx.drawImage(this, 0, 0, imCan.width, imCan.height);
        URL.revokeObjectURL(url);
        zoomReset();
        callback();
    }
    img.src = url;
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function genVerts(num){
	/*
	h * w * d = num
	h * d = top_between
	w * d = left_between
	*/
	var d = num / (loadedImage.width * loadedImage.height);
	var h = loadedImage.height;
	var w = loadedImage.width;
	var v_b = Math.round(Math.sqrt(h * d));
	var h_b = Math.round(Math.sqrt(w * d));
	ret = [];

	//
	// CORNERS
	ret.push([0,0]);
	ret.push([w,h]);
	ret.push([0,h]);
	ret.push([w,0]);

	//
	// CENTRAL
	for(var i = 0; i < num; i++){
		ret.push([getRandomArbitrary(0,w),getRandomArbitrary(0,h)]);
	}

	//
	// EDGES
	//TOP
	for(var i = 0; i < h_b; i++){
		ret.push([getRandomArbitrary(0,w),0]);
	}
	//BOTTOM
	for(var i = 0; i < h_b; i++){
		ret.push([getRandomArbitrary(0,w),h]);
	}
	//LEFT
	for(var i = 0; i < v_b; i++){
		ret.push([0,getRandomArbitrary(0,h)]);
	}
	//BOTTOM
	for(var i = 0; i < v_b; i++){
		ret.push([w,getRandomArbitrary(0,h)]);
	}

	return ret;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


//
//
// PLOTTING THINGS
//
//

function plotVerts(v){
	for(var i = 0; i < v.length; i++){
		var pt = v[i];
		var svgns = "http://www.w3.org/2000/svg";
		var circle = 	document.createElementNS(svgns, "circle");
		circle.setAttributeNS(null,'cx',pt[0]);
		circle.setAttributeNS(null,'cy',pt[1]);
		circle.setAttributeNS(null,'r',1);
		circle.setAttributeNS(null,'fill','red');
		circle.setAttributeNS(null,'stroke-width',0);
		triCan.appendChild(circle);
		circle.addEventListener("click", function(){
			toggleSelected(this);
		}, false);
	}
}

function plotTri(t,v){
	for(i = t.length; i; ) {

		--i;
		var x1 = v[t[i]][0];
		var y1 = v[t[i]][1];
		--i;
		var x2 = v[t[i]][0];
		var y2 = v[t[i]][1];
		--i;
		var x3 = v[t[i]][0];
		var y3 = v[t[i]][1];

		var avgX = (x1 + x2 + x3) / 3;
		var avgY = (y1 + y2 + y3) / 3;

		var pixelData = imCanCtx.getImageData(avgX * scale * zoomScale, avgY * scale * zoomScale, 1, 1).data.slice(0,3);
		var pixelColor = rgbToHex(pixelData[0],pixelData[1],pixelData[2]);

		var svgns = "http://www.w3.org/2000/svg";
		var pol = 	document.createElementNS(svgns, "polygon");
		pol.setAttributeNS(null,'points',[x1,y1,x2,y2,x3,y3].join(","));
		pol.setAttributeNS(null,'fill',pixelColor);
		pol.setAttributeNS(null,'stroke',pixelColor);
		pol.setAttributeNS(null,'stroke-width',1);
		triCan.appendChild(pol);
	}
}

function resetAll(){
	resetOps();
	resetSvg();
	resetCanvas();
}

function resetSvg(){
	$(triCan).html("");
}

function resetCanvas(){
	imCanCtx.clearRect(0, 0, imCan.width, imCan.height);
}

function removeVertex(elem){
	// removes from _v corresponding to elem
	var x = parseFloat(elem.getAttributeNS(null,"cx"));
	var y = parseFloat(elem.getAttributeNS(null,"cy"));
	for(var i = 0; i < _v.length; i++){
		if(_v[i][0] === x && _v[i][1] === y){
			_v = _v.slice(0,i).concat(_v.slice(i+1));
			return;
		}
	}
}

function removeSelectedVerts(){
	for(var i = 0; i < ops.selectedVerts.length; i++){
		removeVertex(ops.selectedVerts[i]);
	}
	resetAll();
	_t = Delaunay.triangulate(_v);
	rescale(true);
	plotTri(_t,_v);
	plotVerts(_v);
}

//
//
// NICE UX INTERACTIONS
//
//

var drag = {
	active: false,
	startX: null,
	startY: null,
	endX: null,
	endY: null,
}

$(triCan).on('mousedown', function (e) {
    drag.active = true;
    drag.startX = e.offsetX / (scale * zoomScale);
    drag.startY = e.offsetY / (scale * zoomScale);
    drag.endX = drag.startX;
    drag.endY = drag.startY;
    //start drawing it here
    var svgns = "http://www.w3.org/2000/svg";
	var rect = 	document.createElementNS(svgns, "rect");
	rect.setAttributeNS(null,'x',drag.startX);
	rect.setAttributeNS(null,'y',drag.startY);
	rect.setAttributeNS(null,'width',0);
	rect.setAttributeNS(null,'height',0);
	rect.setAttributeNS(null,'fill','white');
	rect.setAttributeNS(null,'opacity','0.3');
	rect.setAttributeNS(null,'id','select-drag');
	rect.setAttributeNS(null,'stroke-width',0);
	triCan.appendChild(rect);
}).on('mouseup', function(e) {
	drag.active = false;
	drag.startX = null;
	drag.startY = null;
	$("#select-drag").remove();
}).on('mousemove', function(e) {
	if(drag.active){
		var x = e.offsetX / (scale * zoomScale);
	    var y = e.offsetY / (scale * zoomScale);
	    drag.endX = x;
	    drag.endY = y;
	    var w = Math.abs(x - drag.startX);
	    var h = Math.abs(y - drag.startY);
	    var _x = Math.min(x,drag.startX);
	    var _y = Math.min(y,drag.startY);
	    var rect = document.getElementById("select-drag");
	    rect.setAttributeNS(null,'x',_x);
	    rect.setAttributeNS(null,'y',_y);
	    rect.setAttributeNS(null,'width',w);
	    rect.setAttributeNS(null,'height',h);
	    //
	    $(triCan).find("circle").each(function(i){
	    	var __x = parseFloat(this.getAttributeNS(null,'cx'))
	    	var __y = parseFloat(this.getAttributeNS(null,'cy'));
	    	if(between(x,_x,__x) && between(y,_y,__y)){
	    		selectedOn(this);
	    	}
	    });
	}
});

function between(a,b,c){
	if((c >= b && c <= a) || (c <= b && c >= a)){
		return true;
	}
	return false;
}

function toggleSelected(vert){
	var i = ops.selectedVerts.indexOf(vert);
	if(i === -1){
		ops.selectedVerts.push(vert);
		vert.setAttributeNS(null,'data-selected','true');
		vert.setAttributeNS(null,'fill','orange');
	}	
	else{
		ops.selectedVerts = ops.selectedVerts.slice(0,i).concat(ops.selectedVerts.slice(i+1));
		vert.setAttributeNS(null,'data-selected','false');
		vert.setAttributeNS(null,'fill','red');
	}
}

function selectedOn(vert){
	var i = ops.selectedVerts.indexOf(vert);
	if(i === -1){
		ops.selectedVerts.push(vert);
		vert.setAttributeNS(null,'data-selected','true');
		vert.setAttributeNS(null,'fill','orange');
	}
}