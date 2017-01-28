var center = {x: 0, y: 0};
var zoomScale = 1;

function zoomIn(){
	zoomScale += 0.5;
 	rescale(true);
}

function zoomOut(){
	zoomScale -= 0.5;
	rescale(true);
}

function zoomReset(){
	zoomScale = 1;
	rescale(true);
}
