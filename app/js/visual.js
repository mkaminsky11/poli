function toggleSide(side){
	var hidden = {};
	var shown = {};
	hidden[side] = -200;
	shown[side] = 0;

	var id = "#" + side + "-side";
	if($(id).css("display") === "none"){
		// hidden, show it
		$(id).css(side,"-200px"); // initialize it
		$(id).css("display","block");
		$(id).velocity(shown);
	}
	else{
		$(id).velocity(hidden,{
			complete: function(){
				$(id).css("display","none");
			}
		});
	}
}