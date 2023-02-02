/* #################################################################

     Pentomino Digital
     
     DDI Paderborn, 2020-2022
     
     Realisation: Felix Winkelnkemper,
                  felix.winkelnkemper@uni-paderborn.de
                  
     Published under the European Union Public License
     
     https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
     
     This project uses material from other sources.
     See acknowledgements.md for details.
     
   #################################################################

*/

/** The visual aspects of the game (Frontend) */
class Visual{
	
	constructor(pd){
		
		//convenience
		
		this.PD=pd;
		this.pd=pd;
		this.game=pd.game;

		
		//Create interaction listeners
		
		this.initalizeListeners();
	}
	
	init(){
		//Create all visual structures of the game
		
		this.renderBoard();
		this.renderPieces();
	}
	
	//Create the field on which pieces can be put
	renderBoard(){
		
		var field=document.getElementById('field');
		
		//empty the field;
		while (field.firstChild) {
		    field.removeChild(field.lastChild);
		}

		var width=this.cssInt('game-area-width')/this.game.width;
		
		//The field consists of divs. Each div saves in its id field its resepective
		//coorinates
		this.pd.game.highlightedPositions="";
		for (var row=0;row<(this.game.height)*4;row++){ //4x height to allow for portrait usage
			for (var col=0;col<this.game.width;col++){
				
				var isBoard=true;
				var isBlocked=false;
				
				//indicate where on the field the board is
				
				if (col<this.game.boardX) isBoard=false;
				if (col>=this.game.boardX+this.game.boardDimensions[0]) isBoard=false;
				if (row<this.game.boardY) isBoard=false;
				if (row>=this.game.boardY+this.game.boardDimensions[1]) isBoard=false;
				
				if (isBoard){
					var bR=row-this.game.boardY;
					var bC=col-this.game.boardX;
					
					if (this.game.boardLayout[bR][bC]==0) isBlocked=true;
				}
				
				var fieldElement=document.createElement("div");
				
				var className='gamearea';
				if (isBoard) {className+=' boardarea'
				              this.pd.game.highlightedPositions+="_"+col+","+row;}
				if (isBlocked) className+=' blocked';
				
				fieldElement.className=className;
				fieldElement.id='field_'+col+','+row;
				//fieldElement.title=fieldElement.id;
				
				fieldElement.style.width='calc('+width+'vw - 0px)';
				fieldElement.style.height='calc('+width+'vw - 0px)';
				
				//Notice: Original approach with float=left not possible in Safari and Firefox
				fieldElement.style.top=(row*width)+'vw';
				fieldElement.style.left=(col*width)+'vw';
				
				field.appendChild(fieldElement);
				
			}
		}
	}
	
	cssInt(varname){
		
		return parseInt(this.cssConf(varname));
		
	}

	cssConf(varname){
		var content=getComputedStyle(document.documentElement).getPropertyValue('--'+varname).trim();
		
		if (content=='true') return true;
		if (content=='false') return false;
		
		if (content*1==content) return content*1; //convert to number
		
		return content;
		
	}
	
	updatePieces(piece){
		
		if (piece) return this.updatePiece(piece); //if a piece was specified, call the concrete update instead
		
		var pieces=this.pd.game.pieceArray;
		
		for (var p in pieces){
			this.updatePiece(pieces[p]);
		}

	}
	
	updatePiece(piece){
		
	   var width=this.cssInt('game-area-width')/this.game.width;
	   var pieceContainer=document.getElementById('piece_'+piece.name);
	
		//empty the pieceContainer; could be already filled if a new board is loaded
		while (pieceContainer.firstChild) {
		    pieceContainer.removeChild(pieceContainer.lastChild);
		}
				
		for(var i=0;i<piece.bitMap.length;i++){
			
			for (var j=0;j<piece.bitMap[i].length;j++){
				
				var set=piece.bitMap[i][j];
				var color=piece.color;
				
				var element=document.createElement("div");
				element.style.width='calc('+width+'vw - 1px)';
				element.style.height='calc('+width+'vw - 1px)';
				
				element.style.top=(i*width)+'vw';
				element.style.left=(j*width)+'vw';
				if(piece.highlighted){var borders=true;
				}
				else{
				var borders=this.cssConf('piece-borders');
				}
				var innerBorders=this.cssConf('piece-inner-borders');
				var innerBordersColor=this.cssConf('piece-inner-borders-color');
				
				if (set){
					element.style.backgroundColor=color;
					if(piece.frozen){element.style.backgroundImage="url('ico/freeze.png')";
						element.style.backgroundRepeat="no-repeat";
						element.style.backgroundSize="contain";
						}
					element.className='bmPoint';

					
					if (!borders) {
						element.style.borderColor=piece.color;  //no boarder means border-color equals piece color
					} else {
						if (piece.highlighted) element.style.border = "2px solid " + this.cssConf("highlighting-"+piece.highlighted);
						else {
							//for inner boarders means we have to check the border above,left,right or bottom
							var topSet = (i == 0) ? false : piece.bitMap[i - 1][j];
							var bottomSet = (i == 4) ? false : piece.bitMap[i + 1][j];
							var leftSet = (j == 0) ? false : piece.bitMap[i][j - 1];
							var rightSet = (j == 4) ? false : piece.bitMap[i][j + 1];

							if (!innerBorders) {  //if no boarder is to be seen, we set it to the piece color

								if (topSet) element.style.borderTopColor = piece.color;
								if (bottomSet) element.style.borderBottomColor = piece.color;
								if (leftSet) element.style.borderLeftColor = piece.color;
								if (rightSet) element.style.borderRightColor = piece.color;

							} else { // otherwise, we take the specified color (see style definition files)

								if (topSet) element.style.borderTopColor = innerBordersColor;
								if (bottomSet) element.style.borderBottomColor = innerBordersColor;
								if (leftSet) element.style.borderLeftColor = innerBordersColor;
								if (rightSet) element.style.borderRightColor = innerBordersColor;

							}
						}
					}

				} else {
					element.className='bmAround';
				}

				
				pieceContainer.appendChild(element);
				
			}
		}
		
		pieceContainer.style.marginLeft='0vw'; //reset a possible offset (in case of an overlap)
    	pieceContainer.style.marginTop='0vw';

	   if (piece.inTray){
	   	   var trayPosition=piece.trayPosition;	   
	   	   
	   	   var widthVW=(100-this.cssInt('game-area-width'))+(piece.trayPosition)*7; //7 is trayHeight TODO get from CSS
	   	   
	   	   var magnification=6/(5*width);
	   	   
	   	   //TODO. This should be done in the CSS file
	   	   
	   	   pieceContainer.style.left=widthVW+'vw';
	   	   pieceContainer.style.top=0;
	   	   pieceContainer.style.transform='scale('+magnification+')';
	   	   pieceContainer.style.transformOrigin='0 5%';
	   	   
	   	   this.deleteSelection(); //if the updated element was selected, it can now be unselected

	   } else {
	   	   
	   	   var left=(100-this.cssInt('game-area-width'))+width*(piece.position[0]-2);
	   	   var top=7+width*(piece.position[1]-2);
	   	   
	   	   pieceContainer.style.left=left+'vw';
	   	   pieceContainer.style.top=top+'vw';
	   	   pieceContainer.style.transform='scale(1)';
	   	   pieceContainer.style.transformOrigin='50% 50%'; 	
	   	
	   }
	   
	   //making the element visible (see remark in renderPieces)
	   pieceContainer.style.display='block'; 
	
	}
	
	//Create the visual representations of the pieces
	renderPieces(){
		
		//TODO: Check whether in the innerHTML approach is good here.
		
		var pieceArea=document.getElementById('piecearea');
		
		let out='';

		var width=this.cssInt('game-area-width')/this.game.width;
		
		//create the pieces
		
		for (var p in this.game.pieces){
			var piece=this.game.pieces[p];		
			
			//these are the bouding boxes into which the piece itself is "painted"
			//setting to display:none avoids the appearing for a split second before positioning
			
			//TODO: Update this to DOM operations
			
			out+='<div class="piece" id="piece_'+piece.name+'" style="width:calc('+(5*width)+'vw + 1px);height:calc('+(5*width)+'vw + 1px);display:none">';
			out+='</div>';
			
			//updating the pieces has to happen after the elements are created
			//TODO: this is a disadvantage of chosing the innerHTML approach. 
			
			setTimeout(function(that,piece){
				that.updatePiece(piece);
			},0,this,piece);
			
			
		}
		
		pieceArea.innerHTML=out;
		
	}
	
	//show or hide the manipulation buttons
	showManipulations(piece){
		
		var htmlElement=document.getElementById('piece_'+piece.name);
		
		var that=this;
		
		setTimeout(function(){
			var opDiv=document.getElementById('operations');
			
			opDiv.innerHTML=
'<img src="ico/rotate_right.png" style="right:0;" onclick="pd.visual.rotateRight();" class="uiElement button">'+
'<img src="ico/rotate_left.png" style="left:0" onclick="pd.visual.rotateLeft();" class="uiElement button">'+
'<img src="ico/flip_horizontally.png" style="bottom:0;left:37.5%" onclick="pd.visual.flipH();" class="uiElement button">'+
'<img src="ico/flip_vertically.png" style="top:37.5%;left:0" onclick="pd.visual.flipV();" class="uiElement button">';
			
			opDiv.style.display='block';
			opDiv.style.position='fixed';
			opDiv.style.left=htmlElement.style.left;
			opDiv.style.top=htmlElement.style.top;
			opDiv.style.width=htmlElement.style.width;
			opDiv.style.height=htmlElement.style.height;
			opDiv.style.zIndex=new Date().valueOf()+5;    //TODO Check if this is a good idea

		},1);
	
	}
	
	hideManipulations(){
		document.getElementById('operations').style.display='none';
	}

	setSelection(piece){
		
		this.selected=piece;
		
		this.showManipulations(piece);
	}
	
	deleteSelection(){
		
		if (!this.selected) return;
		
		this.selected=false;
	
		this.hideManipulations();
	}
	
	heatMapBoard(r,c,value){
		
		//find the piece
		r=r*1+this.game.boardY;
		c=c*1+this.game.boardX;
		
		var htmlElement=document.getElementById('field_'+c+','+r);
		
		var b=100;
		var r=40;
		var s=100;
		var c=true;
		
		switch (value){
			case -2: b=65;r=-50;s=1600;break;
			case -1: b=85;r=-50;s=100;break;
			
			case 9: b=60;r=60;s=300;break;
			case 8: b=80;r=60;s=100;break;
			
			case 7:
			case 6: b=80;r=30;s=100;break;
			
			case 5: b=75;r=0;s=0;break;
			case 4:
			case 3:  
			case 2: 
			default: b=85;r=0;s=0;break;
		}
		
		var filter='grayscale(100%) brightness('+b+'%) sepia('+((c)?'100':'0')+'%) hue-rotate('+r+'deg) saturate('+s+'%) contrast(0.8)';
		
		htmlElement.style.filter=filter;
		
	}

	noHeatMap(){
		var dimension=this.pd.game.boardDimensions;

		for (var tc=0; tc<dimension[0];tc++){
			for (var tr=0;tr<dimension[1];tr++){
				
				//find the piece
				var r=tr*1+this.game.boardY;
				var c=tc*1+this.game.boardX;
				
				var htmlElement=document.getElementById('field_'+c+','+r);
				htmlElement.style.filter='grayscale(0%) brightness(100%) sepia(0%) hue-rotate(0deg) saturate(100%) contrast(1)';

			}
		}	
	}

	indicate(r,c,letter){

		//find the piece
		r=r*1+this.game.boardY;
		c=c*1+this.game.boardX;
		
		var htmlElement=document.getElementById('field_'+c+','+r);

		htmlElement.innerHTML=letter;
	}

	removeIndications(){
		for (var c=0;c<this.game.width;c++){
			for (var r=0;r<this.game.height;r++){
				var htmlElement=document.getElementById('field_'+c+','+r);
				htmlElement.innerHTML='';
			}
		}
	}
	
	highlightBoard(r,c,speed,color){
		
		//find the piece
		r=r*1+this.game.boardY;
		c=c*1+this.game.boardX;
		
		var htmlElement=document.getElementById('field_'+c+','+r);
		
		function end(){
			htmlElement.style.filter='';
		}
		
		var rot='0 deg';
		switch (color){
			case 'green':rot='50deg'; break;
			default: rot='-50deg';
		}
		
		function move(i){
			
			if (!i) i=0;
			if (i==10) return end();
			
			if (i%2){
				var filter='grayscale(0%) brightness(100%) sepia(0%) hue-rotate(0deg) saturate(100%) contrast(1)';
			} else {
				var filter='grayscale(100%) brightness(40%) sepia(100%) hue-rotate('+rot+') saturate(600%) contrast(0.8)';
			}
			
			htmlElement.style.filter=filter;
			htmlElement.style.transition='filter '+speed+'s';
			
			setTimeout(function(){
				move(i+1);
			},speed*1000);
		}
		
		move();
	}

	highlightBoardPostion(postion,color){
		let element=document.getElementById("field_"+postion);
		element.style.border="2px solid "+color
		element.style.zIndex=1;
	}
	removeHighlightBoardPostion(postion){
		let element=document.getElementById("field_"+postion);
		element.style.border="";
		element.style.zIndex="";
	}

	unColorizeBoard(r,c){
		return this.colorizeBoard(r,c,'');
	}

	colorizeBoard(r,c,color){
		
		//find the piece
		r=r*1+this.game.boardY;
		c=c*1+this.game.boardX;
		
		var htmlElement=document.getElementById('field_'+c+','+r);
		
		htmlElement.style.background=color;
	}

	colorizePiece(piece, color){

		if (piece.name) piece=piece.name;

		var r = document.querySelector(':root');
		r.style.setProperty('--piece-'+piece.toLowerCase()+'-color', color);
	}
	
	uncolorizePieces(){

		var r = document.querySelector(':root');
		for (var piece in pd.game.pieces){
			r.style.setProperty('--piece-'+piece.toLowerCase()+'-color', 'var(--'+piece.toLowerCase()+'-color)');
		}

	}

	highlight(piece,speed,type){
		
		if (!type) type='shake';
		
		if (!speed) speed=10;
		
		if (speed<1) speed=1;
		
		speed=1/speed;
		
		if (piece.name) piece=piece.name;
		
		var htmlElement=document.getElementById('piece_'+piece);
		
		function end(){
			if (type=='shake') htmlElement.style.transform='rotate(0deg)';		
			if (type=='pulse') htmlElement.style.transform='scale(1)';
			if (type=='glow') htmlElement.style.filter='drop-shadow(0 0 0rem crimson)';
			if (type=='blink') htmlElement.style.filter='invert(0)';
			
			setTimeout(function(){
				htmlElement.style.transition='transform 0s, filter 0s';
			},speed*1000);
		}
		
		function move(i){
			
			if (!i) i=0;
			if (i==5) return end();
			
			if (type=='offset'){
				//htmlElement.style.marginLeft='1vw';
    			//htmlElement.style.marginTop='1vw';
				htmlElement.style.transform='rotate(6deg)';
			}

			if (type=='shake'){
				htmlElement.style.transform='rotate('+((i%2)?'10':'-10')+'deg)';
		    	htmlElement.style.transition='transform '+speed+'s';
			}
			
			if (type=='pulse'){
				htmlElement.style.transform='scale('+((i%2)?'1.3':'1')+')';
		    	htmlElement.style.transition='transform '+speed+'s';
			}
			
			if (type=='glow'){
				htmlElement.style.filter='drop-shadow(0 0 '+((i%2)?'0.5':'1')+'rem crimson)';
				htmlElement.style.transition='filter '+speed+'s';
			}
			
			if (type=='blink'){
				htmlElement.style.filter='invert('+((i%2)?'0':'1')+')';
				htmlElement.style.transition='filter '+speed+'s';
			}
			
			if (type!='offset'){ //offsets are fixed. no animation needed there
				setTimeout(function(){
					move(i+1);
				},speed*1000);
			}
		}
		
		move();
	}
	
	// ROTATION and FLIPPING
	
	
	rotateRight(){
		var piece=this.pd.visual.selected;
		if (!piece) return;
		
		var element=document.getElementById('piece_'+piece.name);
		
		element.style.transform='rotate(90deg)';
		element.style.transition='transform 0.2s';
		
		setTimeout(function(){
			element.style.transform='rotate(0deg)';
			element.style.transition='transform 0s';
			piece.rotateRight();
		},200);
	}
	
	rotateLeft(){
		var piece=this.pd.visual.selected;
		if (!piece) return;
		
		var element=document.getElementById('piece_'+piece.name);
		
		element.style.transform='rotate(-90deg)';
		element.style.transition='transform 0.2s';
		
		setTimeout(function(){
			element.style.transform='rotate(0deg)';
			element.style.transition='transform 0s';
			piece.rotateLeft();
		},200);
	}
	
	flipV(){
		var piece=this.pd.visual.selected;
		if (!piece) return;
		
		var element=document.getElementById('piece_'+piece.name);
		
		element.style.transform='scaleY(-1)';
		element.style.transition='transform 0.2s';
		
		setTimeout(function(){
			element.style.transform='scaleY(0)';
			element.style.transition='transform 0s';
			piece.flipV();
		},200);
	}
	
	flipH(){
		var piece=this.pd.visual.selected;
		if (!piece) return;
		
		var element=document.getElementById('piece_'+piece.name);
		
		element.style.transform='scaleX(-1)';
		element.style.transition='transform 0.2s';
		
		setTimeout(function(){
			element.style.transform='scaleX(0)';
			element.style.transition='transform 0s';
			piece.flipH();
		},200);
	}
	
	toTop(container){
		
		if (!this.lastZIndex) this.lastZIndex=5;
		
		this.lastZIndex++;

		var piece=this.getPiece(container.id.split('_')[1]); //adding zIndex to piece object in order to be able to determine which
		piece.zIndex=this.lastZIndex;		  //object overlaps the other

		container.style.zIndex=this.lastZIndex;
	}
	
	//initialize input listeners.
	initalizeListeners(){
		
		var that=this;
		
		var body=document.getElementsByTagName('body')[0];
		
		//keyhandling
		//Note: As Pentomino is supposed to be played on tablets, key interaction is
		//for debug and expert interaction only
		document.onkeyup=function(event){
			var key=event.key;

			switch (key){

				// * for creating a QR code
				case '*': 
					that.pd.game.showQRCode();
				break;

				// ? for freezing and unfreezing pieces on the board
				case '?': 
					if (Object.keys(that.pd.game.frozenPieces).length==0){
						that.pd.game.freeze();
					} else {
						that.pd.game.unfreeze();
					}
				break;
			}
		}

		//prevent context menu from being opened
		document.oncontextmenu=function(event){
			return false;
		}
		

		//the following event listeners are there to prevent zoom actions in various browserss
		document.addEventListener('gesturestart', function (e) {
			e.preventDefault();
			return false;
		});

		document.ontouchstart = function(e){
			e.preventDefault();
			return false;
		}

		document.ondblclick = function(e){
			e.preventDefault();
			return false;
		}
		// based on https://stackoverflow.com/questions/5489946/how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-action
		let toDo1;
		function resizeAction(){
			if(that.pd.ui.editingText) return;// avoid resizing the konva stage when editing text in Annotation mode.
			                                  // this is meant when window size changes after appearing the keyboard on touch devices and the window size changes
			                                  // the keyboard appear when the text is double clicked to edit it
			if(!that.pd.ui.documentRoomOpened)that.pd.ui.windowWidth=window.innerWidth;
			that.pd.ui.layer.destroy();
			that.pd.ui.stage.destroy();
			that.pd.ui.stageWidth=window.innerWidth-(7*window.innerWidth/100); //7: function-area-width, tray-height
			that.pd.ui.stageHeight=window.innerHeight-(7*window.innerHeight/100);
			that.pd.ui.stage = new Konva.Stage({
				container: 'stageContainerPR',
				width: that.pd.ui.stageWidth,
				height: that.pd.ui.stageHeight,
			});
			that.pd.ui.layer = new Konva.Layer();
			that.pd.ui.stage.add(that.pd.ui.layer);

			var storage=window.localStorage;
			var TextStatePR = storage.getItem("TextStatePR");
			that.pd.game.setTextStatePR(TextStatePR);
			if(that.pd.visual.annotationMode){
				clearTimeout(toDo1);
				toDo1 = setTimeout(function (){  // on touch devices make the texts draggable again after editing them
				let children=that.pd.ui.layer.getChildren();
				for(let i in children){
					if(children[i].getClassName()==="Text"){
						children[i].draggable(true);
					}
				}},100);}


		}

		//resize the document room to fit the new window size
		function resizeAction2(){
			if(that.pd.ui.documentRoomOpened ) {
				that.pd.ui.DRstage.width((window.innerWidth-(0/100*window.innerWidth))+ that.pd.ui.PADDING*2);
				that.pd.ui.DRstage.height(window.innerHeight-(6/100*window.innerWidth)+that.pd.ui.PADDING*2);
				if(that.pd.ui.DRStageHeight/100*window.innerWidth<window.innerHeight-(6/100*window.innerWidth)-22) that.pd.ui.DRStageHeightPX= window.innerHeight-(6/100*window.innerWidth)-22
				else that.pd.ui.DRStageHeightPX=that.pd.ui.DRStageHeight/100*window.innerWidth;
				let largeContainer = document.getElementById('large-container')
				largeContainer.style.width=(window.innerWidth-22)+"px";
				largeContainer.style.height=that.pd.ui.DRStageHeightPX+"px";
				let scrollContainer = document.getElementById('scroll-container')
				let scrollContainerHeight=window.innerHeight-(6/100*window.innerWidth)-22;
				scrollContainer.style.height= scrollContainerHeight+"px";
				that.pd.ui.DRstage.scaleX(window.innerWidth/that.pd.ui.windowWidth);
				that.pd.ui.DRstage.scaleY(window.innerWidth/that.pd.ui.windowWidth);
			}
		}

		let toDo2;
		let toDo3;
		window.onresize = function(){

			clearTimeout(toDo2);
			clearTimeout(toDo3);
			toDo2 = setTimeout(resizeAction, 100);
			toDo3 = setTimeout(resizeAction2, 100);
		}

		//Differnt things have to happen in relation to different
		//kinds of objects and in different states of the application
		//this basically becomes a big state automaton.
	
  		if (window.PointerEvent) {

			document.onpointerdown=function(event){
				return pointerdown(event.clientX,event.clientY);
			}

			document.onpointermove=function(event){
				event.preventDefault();
				return pointerMove(event.clientX,event.clientY);
			}

			document.onpointerup=function(event){
				//event.preventDefault();
				return pointerup(event.clientX,event.clientY);
			}	

		} else {

			var el = document.getElementsByTagName("body")[0];
			
			document.ontouchstart = function(e){
				e.preventDefault();
				return pointerdown(e.changedTouches[0].clientX,e.changedTouches[0].clientY,true);
			}

			document.ontouchmove=function(e){
				e.preventDefault();
				return pointerMove(e.changedTouches[0].clientX,e.changedTouches[0].clientY,true);
			}

			document.ontouchend = function(e){ 
				return pointerup(e.changedTouches[0].clientX,e.changedTouches[0].clientY,true);
			}

		}


		function pointerdown(x,y,fallback){//clicking or moving begins

				
			//check, whether action started on a gamepiece
			
			//get all elements on the given positions and go through them.
			//This has to be done instead of getting the element which has been
			//clicked onto from the event, as transparent parts of
			//bounding box pieces can overlap other pieces, so the element
			//which is technically clicked onto may not be the one visually
			//clicked onto. But we need that one.
			
			var elements=document.elementsFromPoint(x,y);
				
			for (var i in elements){
				
				var clickedElement=elements[i];
				
				var check=clickedElement.className;
				
				if (check.includes('uiElement')) {return;} //if we have an element of ui, we do nothing here

				if(that.annotationMode && check=='gamearea boardarea' && that.highlightActive ){
					let color = that.highlightColor?that.cssConf("highlighting-"+that.highlightColor):that.cssConf("highlighting-color1");
					that.highlightBoardPostion(clickedElement.id.split('_')[1],color);
					that.pd.game.storeHighlightingStatePieces(clickedElement.id.split('_')[1],color);

				}
				if(that.annotationMode && check=='gamearea boardarea' && that.eraserActive ){
					that.removeHighlightBoardPostion(clickedElement.id.split('_')[1]);
					that.pd.game.storeHighlightingStatePieces(clickedElement.id.split('_')[1],"");

				}
				if (!(check=='bmPoint'||check=='bmAround')) continue; //did we hit a pixel of a piece?
				
				var container=elements[i*1+1];
				
				var piece=container.id.split('_')[1];

				if (!piece) return; //should not happen. just in case

				var pieceObject=that.pd.game.get(piece);
				if(that.annotationMode){
					if(that.highlightActive && check=='bmPoint'){
						that.toTop(container);
						pieceObject.highlighted=that.highlightColor?that.highlightColor:"color1";
						that.updatePiece(pieceObject)
						that.pd.game.storeAnnotationStatePieces();
						return;
					}
					if(that.eraserActive && check=='bmPoint' && pieceObject.highlighted){
						that.toTop(container);
						pieceObject.highlighted='';
						that.updatePiece(pieceObject);
						that.pd.game.storeAnnotationStatePieces();
						return;
					}
					if(that.freezeActive && check=='bmPoint'){
						if (!pieceObject.frozen){
							that.toTop(container);
							console.log("freeze piece")
							pieceObject.frozen=true;
							that.updatePiece(pieceObject);
							that.pd.game.storeAnnotationStatePieces();
							return;
						}
						else{
							that.toTop(container);
							console.log("unfreeze piece")
							pieceObject.frozen=false;
							that.updatePiece(pieceObject);
							that.pd.game.storeAnnotationStatePieces();
							return;
						}
					}


				}
				else {
					if(pieceObject.frozen)continue;//ignore frozen pieces but continue for none frozen others
					//the surrounding area must only be a valid target in the tray
					if (!that.pd.game.get(piece).inTray && check == 'bmAround') continue;

					//check if piece is frozen. If this is the case, no interaction is possible
					if (that.pd.game.frozenPieces[piece]) {
						console.log(piece + ' is frozen!');
						continue;
					}

					//as soon as we have a bmPoint(an element of a piece),
					//have determined the bounding box and the piece object itself
					//and save those into a global variable "currentlyMoving"
					//which we access during movement and at the end of movement.

					//bring the element to top, so it moves in front of the others.
					that.toTop(container);

					//determine the offset, so the piece can be dragged at any position

					var pixels = container.children;
					for (var p in pixels) {
						var pixel = pixels[p];
					}

					//determine the offset to allow other areas except the center to be moved
					//needed for finally placing the piece correctly

					for (var p in pixels) {
						var pixel = pixels[p];
						if (pixel == clickedElement) {
							var oRow = Math.floor(p / 5) - 2;
							var oCol = p % 5 - 2;
							break;
						}
					}

					var piece = that.PD.game.get(piece);

					var pieceWidth = that.cssInt('game-area-width') / that.PD.game.width;
					var px = piece.position[0] * pieceWidth;
					var py = piece.position[1] * pieceWidth;

					if (isNaN(px) || isNaN(px)) {
						// most likely piece in tray which has no game coordinates;
						// in this case we take the center of the object as its origin
						dx = -2.5 * pieceWidth;
						dy = -2.5 * pieceWidth;
						oRow = 0;
						oCol = 0;
					} else {
						var dx = px - 100 * x / document.documentElement.clientWidth;
						var dy = py - 100 * y / document.documentElement.clientWidth;
					}

					window.currentlyMoving = [container, piece, oRow, oCol, dx, dy];

					break;
				}}
			
			return;
		}
		
		function pointerMove(x,y,fallback){
			
			//move an object in case a drag operation started on a piece (see above)
			
			if (window.currentlyMoving){
				
				that.PD.visual.hideManipulations();
				
				var container=window.currentlyMoving[0];
				var dx=window.currentlyMoving[4];
				var dy=window.currentlyMoving[5];
				
				//resize object to full size while moving and attach the quare used (oCol,oRow) to pull it to the pointer

				container.style.left='calc('+x+'px + '+(dx)+'vw)';
				container.style.top='calc('+y+'px + '+(dy)+'vw)';
				container.style.transform='scale(1)';
	   	   		container.style.transformOrigin='50% 50%';
	
			} 
			
		}

		function pointerup(x,y,fallback){

			//this is called when mouse key is released or fingers are removed from the screen
			
			if (window.currentlyMoving){
				
				that.PD.visual.hideManipulations();
				
				//in case an object was in the process of being moved, this changes the movement.
				//which means it is determined, where it was moved to and then the backend is informed
				//about that movement (which in turn  repositions the element so it snaps to the grid)
				
				var data=window.currentlyMoving;
				window.currentlyMoving=false;

				//determine the target
				
				var elements=document.elementsFromPoint(x, y);

				//send back to tray if out of bounds
				if (x<=0 || y<=0) return data[1].toTray();
				if (elements.length==0) return data[1].toTray();
				
				for (var i in elements){
					var element=elements[i];
					var id=element.id;if (!id) id='';

					//determine the position the piece ended on
					
					if (id=='tray') return data[1].toTray();
					if (id=='functions') return data[1].toTray();
					
					if (id.split('_')[0]=='field'){
						
						var coords=id.split('_')[1];   // actual information about where pointerposition was
						if (!coords) continue;         // is now calculated otherwise to allow for more fine grained positioning

						var oRow=data[2]; // offset indicating which quare is being dragged
						var oCol=data[3];
						var dx=data[4]; // offset of starting mouse position to bounding box (x,y)
						var dy=data[5];

						var nCoords=[];

						// determine board position of pointer in vw in relation to game area

						var cx=100*x/document.documentElement.clientWidth-that.cssInt('function-area-width');
						var cy=100*y/document.documentElement.clientWidth-that.cssInt('tray-height');
						
						// convert to game coordinates (including offset withing the dragged piece)

						var pieceWidth=that.cssInt('game-area-width')/that.PD.game.width;
						nCoords[0]=cx/pieceWidth + (dx/pieceWidth)%1;
						nCoords[1]=cy/pieceWidth + (dy/pieceWidth)%1;
						
						//	make game coordinates integer (snapping)
						coords=[];
						coords[0]=Math.round(nCoords[0]);coords[1]=Math.round(nCoords[1]);

						if (coords[0]-oCol==data[1].position[0] && coords[1]-oRow==data[1].position[1]){
							// in case no actual movement took place (just a click)
							// make this the selected element which activates manipulation GUI
							data[1].select();
						} 

						data[1].place(coords[0]-oCol,coords[1]-oRow);
						
						return;
						
					}
				}
			
				
			} else {
				
				// in case nothing was moving, this becomes an unselect operation
				
				var elements=document.elementsFromPoint(x, y);
				
				for (var i in elements){
					var element=elements[i];

					//determine 5 clicks on tray to invoke config
					if (element.id=='tray'){

						if (!that.trayClicks) that.trayClicks=0;
						that.trayClicks++;

						if (that.trayClicks==5 && !that.annotationMode) that.pd.game.toConfig(); //avoid opening configurations in Annoatation Mode
						
						if (that.trayTimeout) {
							window.clearTimeout(that.trayTimeout);
							that.trayTimeout=false;
						}

						that.trayTimeout=window.setTimeout(function(){
							that.trayClicks=0;
							that.trayTimeout=false;
						},2000)
					}

					if (element.onclick) {
						if (fallback) element.click();

						return; //do not unselect if operations have been applied to UI elements
					}
					
					if (element.id=='functions') return; //do not unselect if operations have been applied to the functions panel
				}
				
				that.pd.visual.deleteSelection();
				
			}
		} //pointerup
		

		
	}
	
	getPiece(name){
		return this.pd.game.getPiece(name);
	}

	log(text,a,b,c,d,e){
		
		return pd.ui.log(text,a,b,c,d,e);
	}
	
}