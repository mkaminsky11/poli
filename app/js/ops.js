const {dialog} = require('electron').remote;
var nativeImage = require('electron').nativeImage;

var ops = {
	showVerts: true,
	numVerts: 10000,
	selectedVerts: []
};

function changeShowVerts(){
	ops.showVerts = !ops.showVerts;
	if(ops.showVerts){
		$(triCan).find("circle").css("display","block");
	}
	else{
		$(triCan).find("circle").css("display","none");
	}
}

function changeNumVerts(){
	var val = parseInt($("#num-verts").val());
	if(!isNaN(val)){
		ops.numVerts = val;
		resetAll();
		_v = genVerts(ops.numVerts);
		_t = Delaunay.triangulate(_v);
		rescale(true);
		plotTri(_t,_v);
		plotVerts(_v);
	}
}

var triCanCopy;

function exportImg(mime){
	if(mime === "image/png" || mime === "image/jpeg"){
		$("#export-status").css("display","block");
		setExportStatus("Initializing...",10);
		var expScale = parseInt($("#export-scaling").val());
		triCanCopy = triCan.cloneNode(true);
		var w = parseInt(triCanCopy.getAttribute("width")) * expScale;
		var h = parseInt(triCanCopy.getAttribute("height")) * expScale;
		triCanCopy.setAttribute("width", w );
		triCanCopy.setAttribute("height", h );

		setExportStatus("Parsing...",30);

		var svgString = new XMLSerializer().serializeToString(triCanCopy);
		var canvas = document.getElementById("canvas");
		var ctx = canvas.getContext("2d");
		var DOMURL = self.URL || self.webkitURL || self;
		var img = new Image();
		var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
		var url = DOMURL.createObjectURL(svg);
		img.onload = function() {

			setExportStatus("Converting...",60);

			canvas.width = w;
			canvas.height = h;
		    ctx.drawImage(img, 0, 0);
		    var url = canvas.toDataURL(mime);
		    var nimg = nativeImage.createFromDataURL(url);

		    if(mime == "image/png"){
		    	nimg = nimg.toPng();
		    }
		    else{
		    	nimg = nimg.toJpeg(100);
		    }

		    var path = dialog.showSaveDialog();
			if(typeof(path) !== typeof(undefined)){

				setExportStatus("Writing...",80);

				fs.writeFile(path, nimg, function (err) {
					// TODO: more obvious error handling
					if(err){
						setExportStatus("An Error Occurred",100);
					}
					else{
						setExportStatus("Done",100);
					}

		        });
			}
			else{
				$("#export-status").css("display","none");
			}

		};
		img.src = url;
	}
	else{
		$("#export-status").css("display","none");
	}
}

function setExportStatus(text, per){
	$("#export-status h6").text(text);
	$("#export-status .progress-bar > div").css("width", per + "%");
}

function showLoad(){
	var path = dialog.showOpenDialog({
	    properties: ['openFile']
	});
	if(typeof(path) !== typeof(undefined)){
		loadImage(path[0],function(){
			init();
		});
	}
}

function resetOps(){
	ops.selectedVerts = [];
}