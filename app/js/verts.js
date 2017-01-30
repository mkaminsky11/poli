/*


click somewhere that is not a circle = deselect all
click on circle = deselect all, toggle this
shift + click on circle = toggle this
drag = deselect all, select this

*/

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
	redisplay();
}

function removeAllVerts(){
	ops.selectedVerts = [];
	_v = [];
	redisplay();
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
	selected: []
}

document.getElementById("tri-canvas-bg").addEventListener("click", function(){
	if(drag.startX === drag.endX && drag.startY === drag.endY){
		// DESELECT EVERYTHING
		deselectAll();
		_v.push([event.offsetX / (scale * zoomScale), event.offsetY / (scale * zoomScale)]);
		redisplay();
	}
}, false);

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
	if(drag.active){
		drag.active = false;
		//drag.startX = null;
		//drag.startY = null;
		//drag.endX = null;
		//drag.endY = null;
		drag.selected = [];
	}
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
		updateSelectedDisplay();
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
		updateSelectedDisplay();
		vert.setAttributeNS(null,'data-selected','true');
		vert.setAttributeNS(null,'fill','orange');
	}
}

function selectedOff(vert){
	var i = ops.selectedVerts.indexOf(vert);
	if(i !== -1){
		ops.selectedVerts = ops.selectedVerts.slice(0,i).concat(ops.selectedVerts.slice(i+1));
		updateSelectedDisplay();
		vert.setAttributeNS(null,'data-selected','false');
		vert.setAttributeNS(null,'fill','red');
	}
}

function deselectAll(){
	$(triCan).find("circle").each(function(i){
    	selectedOff(this);
    });
}

function circleClicked(event, vert){
	deselectAll();
	selectedOn(vert);
}

function redisplay(){
	resetAll();
	_t = Delaunay.triangulate(_v);
	rescale(true);
	plotTri(_t,_v);
	plotVerts(_v);	
}

function updateSelectedDisplay(){
	$("#num-verts span").text(ops.selectedVerts.length);
}