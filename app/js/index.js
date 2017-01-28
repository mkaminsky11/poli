var _v = null;
var _t = null;
var panZoom = null;
window.onload = function(){
	$(document).ready(function(){
		loadImage("app/img/test.jpg",function(){
			init();
		});
	});

	$(window).resize(function(){
		rescale(true);
	});
}

function init(){
	_v = genVerts(ops.numVerts);
	_t = Delaunay.triangulate(_v);
	plotTri(_t,_v);
	plotVerts(_v);
}