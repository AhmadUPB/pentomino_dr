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


/** The User Interface (Frontend) */
class UI{
	
/*

This class creates all the visual structures on the screen which are not the
game itself. Those are in Visual.js

*/
	
	constructor(pd){
		
		this.pd=pd;

		//load theme according to config;
		this.setStyle(pd.config.theme);
		
		//TODO: Creation of the basic structure should happen in here
		
		var that=this;
		
		//Detect if browser is mobile and if running standalone
		//If on a mobile device running with brother GUI, give a messsage
		//pointing towards the possibility to be installed as an app
		
		this.isStandAlone= (window.navigator.standalone === true) || (window.matchMedia('(display-mode: standalone)').matches);

		var isMobile=false;
		
		if (window.navigator.vendor.includes('Apple')){
			if(window.navigator.standalone !==undefined) isMobile=true;  //try to distinguish online and offline Safari
		} else {
			if (window.navigator.userAgent.includes('Android')) isMobile=true;
		}
		
		this.isMobile=isMobile;
		
		
		
		if (pd.config.appcheck && this.isMobile && !this.isStandAlone){
			alert(this.translate('WEBAPP_NOTICE'));
		}
		
		//initialize the UI

		function addDiv(id,parent,after){
			return that.addDiv(id,parent,after);
		}
		
		function addButton(id,icon,text,parent,action){
			
			var img=document.createElement("img");
			img.src='ico/'+icon+'.png';
			img.id=id;
			img.title=that.translate(text);
			img.className='button';
			
			if(!action){
				var message='Button '+id+' has no ation!';
				console.log(message);
				action=function(){alert(message);}
			}
			
			img.onclick=function(){
				window.setTimeout(function(){ //decouple from the click handler
					action();
				},10);
			}
			
			parent.appendChild(img);
			
			
		}
		
		//add a section to the function bar
		function addSection(id,title,after,otherParent){
			
			var parent=document.getElementById(otherParent?otherParent:'functions');
			
			var that=this;
			
			addDiv(id,parent,function(div){			
				div.classList.add('section');
				if (title){
					var heading=document.createElement("h1");	
					var textnode = document.createTextNode(this.translate(title));
					heading.appendChild(textnode);
					div.appendChild(heading);
				}
				
				if (after) after.call(that,div);
			});
			
		}



		//Here starts the definition of the sidebar
		
		addDiv('functions',0,function(div){

			//PREFILLING + CATALOG
			addSection('prefill','',function(div){

				if (pd.config.boardselector){addButton('catalog','catalog','LABEL_CATALOG',div,function(){pd.ui.showBoardSelector();});}
				if (pd.config.clear) addButton('clear','clear','LABEL_CLEAR',div,function(){evaluator.clear();});
				if (pd.config.documentRoom && window.isLoggedIn) addButton('documentRoomButton','document_room','LABEL_DOCUMENTROOM',div,function(){pd.ui.openDocumentRoom();});
				if (pd.config.addDocument && window.isLoggedIn) addButton('addDocumentButton','add_document','LABEL_ADDDOCUMENT',div,function(){pd.ui.pd.game.addDocument();});
				if (pd.config.annotationButton) addButton('annotationButton','annotation','LABEL_ANNOTATION',div,function(){pd.ui.showAnnotationBar();});

				if (pd.config.fillright) addButton('fill_right','fill_right','LABEL_FILL_RIGHT',div,function(){evaluator.clear();evaluator.fill(pd.config.fillright,3)});
				if (pd.config.fillleft) addButton('fill_left','fill_left','LABEL_FILL_LEFT',div,function(){evaluator.clear();evaluator.fill(pd.config.fillleft,1)});
				if (pd.config.fillcenter) addButton('fill_center','fill_center','LABEL_FILL_CENTER',div,function(){evaluator.clear();evaluator.fill(pd.config.fillcenter,2)});

				if (pd.config.suggest) addButton('suggest','suggest','LABEL_SUGGEST',div,function(){hinter.autoPlace()});

				switch (pd.config.prefill){
					case 0: addButton('fill_gap','fill_gap','LABEL_FILL_GAP',div,function(){evaluator.gapFill()}); break;
					case 1: addButton('fill_mintouch','fill_mintouch','LABEL_FILL_MINTOUCH',div,function(){evaluator.gapFill(1)}); break;
				}

				if (pd.config.hint) addButton('hint_function','hint_function','LABEL_HINT',div,function(){pd.ui.hintRequest(pd.config.hint)});

				switch (pd.config.partition){
					case 0: break;
					case 1: addButton('partition','partition','LABEL_PARTITION',div,function(){pd.ui.startPartition()}); break;
					case 2: addButton('partition','partition','LABEL_PARTITION',div,function(){pd.ui.visualPartitions()}); break;
				}
				
			});

			//TEACHER
			addSection('teacher_functions','',function(div){

				if (pd.config.heatmap) addButton('heatbutton','noinit','TOGGLE_HEAT',div,function(){pd.ui.switchHeat();});
				
				if (pd.config.loadsave){
					addButton('savebutton','save','LABEL_SAVE',div,function(){pd.game.save();});
					addButton('loadbutton','load','LABEL_LOAD',div,function(){pd.game.load();});
				}

				if (pd.config.qrbutton){
					addButton('qrbutton','qr','LABEL_QR',div,function(){pd.game.showQRCode();});
				}
				if (pd.config.login) addButton('loginbutton',window.isLoggedIn?'logout':'login' ,window.isLoggedIn?'LABEL_LOGOUT':'LABEL_LOGIN',div,function(){window.isLoggedIn?location.href="loginsystem/logout.php":location.href="loginsystem/login.php";});

				if (pd.config.config) addButton('configbutton','config','LABEL_CONFIG',div,function(){pd.game.toConfig();});

			});

			//INFO
			addSection('info_functions','',function(div){
				if (pd.config.info) addButton('infobutton','info','LABEL_INFO',div,function(){location.href="help/info.php";});
			});
			
			
		});
		// add an annotation bar

		addDiv('annotation',0,function(div){
			document.getElementById('annotation').style.display='none';
			addSection('annotations','',function(div){

				addButton('back','back','LABEL_BACK',div,function(){pd.ui.hideAnnotationBar();});
				addButton('text','text','LABEL_TEXT',div,function(){pd.ui.addText();});
				addButton('highlight','highlight','LABEL_HIGHLIGHT',div,function(){pd.ui.activateHighlighting();});
				addButton('color','color','LABEL_COLOR',div,function(){pd.ui.showHighlightingColourBox();});
				addButton('freeze','freeze','LABEL_FREEZE',div,function(){pd.ui.activateFreezing();});
				addButton('eraser','eraser','LABEL_ERASER',div,function(){pd.ui.activateEraser();});


			},'annotation');
		});


		//here come all the other areas of the user interface which are filled with conten in the respective files
		
		addDiv('game',0,function(div){
			addDiv('tray',div);
			addDiv('field',div);
		});
		addDiv('stageContainerPR');
		addDiv('piecearea');
		addDiv('operations');
		addDiv('hint');
		addDiv('overlay',0,function(div){ //this is the overlay for board chooser or splash screen
			div.className='uiElement';
		});
		addDiv('legend');
		
		//set all buttons to the state they are in at loading time
		setTimeout(function(){
			that.updateHeatButton();
		},10);
		this.stageWidth=window.innerWidth-(7*window.innerWidth/100); //7: function-area-width, tray-height
		this.stageHeight=window.innerHeight-(7*window.innerHeight/100);
		this.stage = new Konva.Stage({
			container: 'stageContainerPR',
			width: this.stageWidth,
			height: this.stageHeight,
		});
		this.layer = new Konva.Layer();
		//this.draggingLayer = new Konva.Layer();
		this.stage.add(this.layer);
		
	}
	
    addDiv(id,parent,after){
			if (!parent) parent=document.getElementsByTagName('body')[0];
			
			var div = document.createElement("div");
			div.id=id;
			parent.appendChild(div); 
			
			if (after) after.call(this,div);
	}
	openDocumentRoom(){
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load",function(){
			var text=this.responseText
			text=text.split('¤');

			console.log(text);
			});
		oReq.open("GET", './loginsystem/reqhandler.php?type=documents');
		oReq.send();
	}

    // based on https://konvajs.org/docs/sandbox/Editable_Text.html
	addText(text,x,y,fill,width){
		var textNode = new Konva.Text({
			text: text?text:'Some text here',
			x: x?x:50,
			y: y?y:80,
			fontSize: 20,
			draggable: true,
			fill: fill?fill:"#000",
			width: width?width:200,
		});

		this.layer.add(textNode);

		var tr = new Konva.Transformer({
			node: textNode,
			enabledAnchors: ['middle-left', 'middle-right'],
			rotateEnabled: false,
			// set minimum width of text
			boundBoxFunc: function (oldBox, newBox) {
				newBox.width = Math.max(30, newBox.width);
				return newBox;
			},
		});

		textNode.on('transform', function () {
			// reset scale, so only with is changing by transformer
			textNode.setAttrs({
				width: textNode.width() * textNode.scaleX(),
				scaleX: 1,
			});
		});

		this.layer.add(tr);
        tr.hide();
		if(!text) this.pd.game.storeTextStatePR(); //avoid open loop when text state is reconstructed when is opened
		textNode.on('pointerclick', () => {
			if(!this.pd.visual.annotationMode)return;
			if(this.pd.visual.eraserActive){
				textNode.destroy();
				tr.destroy();
				this.pd.game.storeTextStatePR();
				return;
			}
			else if(this.pd.visual.highlightActive){
				let color=this.pd.visual.highlightColor?this.pd.visual.cssConf("highlighting-"+this.pd.visual.highlightColor)+"":this.pd.visual.cssConf("highlighting-color1")+"";
				textNode.fill(color);
				this.pd.game.storeTextStatePR();
				return;
			}
			tr.show();
			setTimeout(() => { window.addEventListener('click', handleOutsideClick); });
			function  handleOutsideClick(){
				tr.hide()
				window.removeEventListener('click', handleOutsideClick);

			}
		});
		textNode.on('dragend', () => {
			this.pd.game.storeTextStatePR();
		});
		textNode.on('transformend', () => {
			this.pd.game.storeTextStatePR();
		});

		textNode.on('dblclick dbltap', () => {
			if(!this.pd.visual.annotationMode)return;
			let that = this;
			that.editingText=true;
			// hide text node and transformer:
			textNode.hide();
			tr.hide();

			// create textarea over canvas with absolute position
			// first we need to find position for textarea
			// how to find it?

			// at first lets find position of text node relative to the stage:
			var textPosition = textNode.absolutePosition();

			// so position of textarea will be the sum of positions above:
			var areaPosition = {
				x: this.stage.container().offsetLeft + textPosition.x,
				y: this.stage.container().offsetTop + textPosition.y,
			};

			// create textarea and style it
			var textarea = document.createElement('textarea');
			document.body.appendChild(textarea);

			// apply many styles to match text on canvas as close as possible
			// remember that text rendering on canvas and on the textarea can be different
			// and sometimes it is hard to make it 100% the same. But we will try...
			textarea.value = textNode.text();
			textarea.style.position = 'absolute';
			textarea.style.top = areaPosition.y + 'px';
			textarea.style.left = areaPosition.x + 'px';
			textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
			textarea.style.height =
				textNode.height() - textNode.padding() * 2 + 5 + 'px';
			textarea.style.fontSize = textNode.fontSize() + 'px';
			textarea.style.border = 'none';
			textarea.style.padding = '0px';
			textarea.style.margin = '0px';
			textarea.style.overflow = 'hidden';
			textarea.style.background = 'none';
			textarea.style.outline = 'none';
			textarea.style.resize = 'none';
			textarea.style.lineHeight = textNode.lineHeight();
			textarea.style.fontFamily = textNode.fontFamily();
			textarea.style.transformOrigin = 'left top';
			textarea.style.textAlign = textNode.align();
			textarea.style.color = textNode.fill();
			let rotation = textNode.rotation();
			var transform = '';
			if (rotation) {
				transform += 'rotateZ(' + rotation + 'deg)';
			}

			var px = 0;
			// also we need to slightly move textarea on firefox
			// because it jumps a bit
			var isFirefox =
				navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			if (isFirefox) {
				px += 2 + Math.round(textNode.fontSize() / 20);
			}
			transform += 'translateY(-' + px + 'px)';

			textarea.style.transform = transform;

			// reset height
			textarea.style.height = 'auto';
			// after browsers resized it we can set actual value
			textarea.style.height = textarea.scrollHeight + 3 + 'px';

			textarea.focus();

			function removeTextarea() {
				textarea.parentNode.removeChild(textarea);
				window.removeEventListener('click', handleOutsideClick);
				textNode.show();
				tr.show();
				tr.forceUpdate();
				if(!textNode.text()){textNode.destroy(); tr.destroy();}
				that.pd.game.storeTextStatePR();
				setTimeout(function(){that.editingText=false;},100);
			}

			function setTextareaWidth(newWidth) {
				if (!newWidth) {
					// set width for placeholder
					newWidth = textNode.placeholder.length * textNode.fontSize();
				}
				// some extra fixes on different browsers
				var isSafari = /^((?!chrome|android).)*safari/i.test(
					navigator.userAgent
				);
				var isFirefox =
					navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
				if (isSafari || isFirefox) {
					newWidth = Math.ceil(newWidth);
				}

				var isEdge =
					document.documentMode || /Edge/.test(navigator.userAgent);
				if (isEdge) {
					newWidth += 1;
				}
				textarea.style.width = newWidth + 'px';
			}

			textarea.addEventListener('keydown', function (e) {
				// hide on enter
				// but don't hide on shift + enter
				console.log("event!!")
				if (e.keyCode === 13 && !e.shiftKey) {
					console.log("event enter!!!")
					textNode.text(textarea.value);
					removeTextarea();
				}
				// on esc do not set value back to node
				if (e.keyCode === 27) {
					removeTextarea();
				}
			});

			textarea.addEventListener('keydown', function (e) {
				let scale = textNode.getAbsoluteScale().x;
				setTextareaWidth(textNode.width() * scale);
				textarea.style.height = 'auto';
				textarea.style.height =
					textarea.scrollHeight + textNode.fontSize() + 'px';
			});

			function handleOutsideClick(e) {
				if (e.target !== textarea) {
					textNode.text(textarea.value);
					removeTextarea();
				}
			}
			setTimeout(() => { window.addEventListener('click', handleOutsideClick); });
		});
	}
	activateFreezing(){
		if(!this.pd.visual.freezeActive){
			if(this.pd.visual.highlightActive)this.pd.ui.activateHighlighting(); //unactivate Highlighting actually
			if(this.pd.visual.eraserActive)this.pd.ui.activateEraser(); //unactivate eraser actually
			this.pd.visual.freezeActive=true;
			document.getElementById('freeze').style.backgroundColor=this.pd.visual.cssConf('activated-button');
		}
		else{
			this.pd.visual.freezeActive=false;
			document.getElementById('freeze').style.backgroundColor="";
		}

	}

	activateEraser(){
		if(!this.pd.visual.eraserActive){
			if(this.pd.visual.highlightActive)this.pd.ui.activateHighlighting(); //unactivate Highlighting actually
			if(this.pd.visual.freezeActive)this.pd.ui.activateFreezing();
			this.pd.visual.eraserActive=true;
			document.getElementById('eraser').style.backgroundColor=this.pd.visual.cssConf('activated-button');
		}
		else{
			this.pd.visual.eraserActive=false;
			document.getElementById('eraser').style.backgroundColor="";
		}

	}

	activateHighlighting(){
		if(!this.pd.visual.highlightActive){
			if(this.pd.visual.eraserActive)this.pd.ui.activateEraser(); //unactivate eraser actually
			if(this.pd.visual.freezeActive)this.pd.ui.activateFreezing();
			this.pd.visual.highlightActive=true;
			document.getElementById('highlight').style.backgroundColor=this.pd.visual.cssConf('activated-button');;
		}
		else{
			this.pd.visual.highlightActive=false;
			document.getElementById('highlight').style.backgroundColor="";
		}

	}

	showHighlightingColourBox(){
		if(document.getElementById("highlightingBox")){return;}
		var that = this;
		var parent=document.getElementsByTagName('body')[0];
		var highlightingBox=document.createElement("div");
		highlightingBox.id="highlightingBox";
		let color1= this.pd.visual.cssConf("highlighting-color1");
		let color2= this.pd.visual.cssConf("highlighting-color2");
		let color3= this.pd.visual.cssConf("highlighting-color3");
		let color4= this.pd.visual.cssConf("highlighting-color4");
		let color5= this.pd.visual.cssConf("highlighting-color5");
		highlightingBox.innerHTML=`<h3>${that.translate("LABEL_COLOR")}</h3>\n` +
			"        <div id=\"colors\">\n" +
			`            <div id='color1' style=\"background: ${color1}\"></div>\n` +
			`            <div id='color2' style=\"background: ${color2}\"></div>\n` +
			`            <div id='color3' style=\"background: ${color3}\"></div>\n` +
			`            <div id='color4' style=\"background: ${color4}\"></div>\n` +
			`            <div id='color5' style=\"background: ${color5}\"></div>\n` +
			"        </div>\n" +
			"        <div  id=\"highlightingColorButton\">\n" +
			`            <span >${that.translate("BUTTON_CLOSE")}</span>\n` +
			"        </div>"
		parent.appendChild(highlightingBox);
		document.getElementById("highlightingColorButton").onpointerdown=function(event){
			//event.preventDefault();
			that.closeHighlightingColorBox();
		}
        if(that.pd.visual.highlightColor)document.getElementById(that.pd.visual.highlightColor).style.border = `2px solid white`
		else document.getElementById("color1").style.border = `2px solid white`
		document.getElementById("color1").onclick=function (){selectColor("color1");}
		document.getElementById("color2").onclick=function (){selectColor("color2");}
		document.getElementById("color3").onclick=function (){selectColor("color3");}
		document.getElementById("color4").onclick=function (){selectColor("color4");}
		document.getElementById("color5").onclick=function (){selectColor("color5");}
		function selectColor(id){
			for(let i=1; i<6;i++){
				document.getElementById(`color${i}`).style.border="";
			}
			document.getElementById(id).style.border = `2px solid white`;
			that.pd.visual.highlightColor=id;


		}
	}

	closeHighlightingColorBox(){
		document.getElementById("highlightingBox").remove();
	}



	showAnnotationBar(){
		document.getElementById('annotation').style.display='';
		document.getElementById('functions').style.display='none';
		document.getElementById("hint").style.display='none';
		let children=this.layer.getChildren();
		console.log(this.layer.getChildren());
		for(let i in children){
			if(children[i].getClassName()==="Text"){
				children[i].draggable(true);
			}
		}
		this.pd.visual.annotationMode=true;
	}

    hideAnnotationBar(){
		if(this.pd.visual.highlightActive)this.pd.ui.activateHighlighting(); //unactivate Highlighting actually
		if(this.pd.visual.eraserActive)this.pd.ui.activateEraser(); //unactivate eraser actually
		if(this.pd.visual.freezeActive)this.pd.ui.activateFreezing();
		document.getElementById('annotation').style.display='none';
		document.getElementById('functions').style.display='';
		document.getElementById("hint").style.display='';
		let children=this.layer.getChildren();
		console.log(this.layer.getChildren());
		for(let i in children){
			if(children[i].getClassName()==="Text"){
				children[i].draggable(false);
			}
		}
		this.pd.visual.annotationMode=false;
	}

	//display a QR code on an overlay
	showQRCode(text){
		var overlay=document.getElementById('overlay');
		overlay.style.display='block';
		
		overlay.innerHTML='<div id="qrcodeDisplay"></div>';
		overlay.innerHTML+='<p id="urlDisplay"></p>';
		overlay.innerHTML+='<button onclick="pd.ui.closeOverlay();" class="closebutton">'+this.translate('BUTTON_CLOSE')+'</button>';

		new QRCode(document.getElementById("qrcodeDisplay"), text);

		document.getElementById("urlDisplay").innerHTML='<a href="about:blank" download id="downloadLink">'+this.translate('DOWNLOAD_QR')+'</a>' + ' (' +this.translate('URL_COPIED')+')';

		window.setTimeout(function(){ // set URL for download button after image rendering
			document.getElementById('downloadLink').href=document.getElementById('overlay').getElementsByTagName('img')[0].src;
		},10)

		navigator.clipboard.writeText(text).then(function() {
			
		  }, function(err) {
			console.error('Async: Could not copy text: ', err);
		});
		
	}
	
	//displayin the board elector overview which allows players to select a board of their liking
	showBoardSelector(){
	
		var overlay=document.getElementById('overlay');
		overlay.style.display='block';
		
		overlay.innerHTML='<h1>'+this.translate('HEADING_BOARD_SELECTOR')+'</h1><div id="selector_content">'+this.translate('STATUS_LOADING')+'</id>';
		overlay.innerHTML+='<button onclick="pd.ui.closeOverlay();">'+this.translate('BUTTON_CLOSE')+'</button>';
		
		//the boardlist is fetched from the server (direcly below this eventlistener)
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load",function(){
			
			var text=this.responseText.split('\n');
			var el=document.getElementById('selector_content');
			var out='';
			
			//process the list and convert it to local data structure
			for (var i in text){
				var line=text[i];
				
				if (!line) continue;
				
				line=line.split('#');
				
				//Format: 8x8e#74#8#8#4#FFIIIIIZ VFFPPZZZ VF.PPZWW VVV.PWWY LUUX.WYY LUXXX.TY LUUXNNTY LLNNNTTT
				//        ID#Solutions#Rows#Cols#BlockedElements#Topology

				var id=line[0]; //an id of the board
				var numSolutions=line[1]; //the number of solutions in the file (withouth mirroring and rotation)
				var numRows=line[2]; //dimentions of the board
				var numCols=line[3];
				var numBlocked=line[4]; //number of blocked elements
				var topology=line[5].split(' '); //toplogy line by line

				//the topology is the first solution from the solution file. As it is only used to determine where
				//blocked elements are in contrast to the actual board area, every single solution would suffice
				
				var size=Math.max(numRows,numCols);
				var sizeString=(100/size)+'%';
				
				//all boards are displayed in a square. As most of them will not by themselves be squares,
				//empty rows and empty columns are added accordingly
				
				var addRows=size-numRows;
				var addCols=size-numCols;
				var temp=[];
				
				var emptyRow=[];
				for (var c=0;c<size;c++){emptyRow.push('.');}
				for (var r=0;r<Math.floor(addRows/2);r++){temp.push(emptyRow);}
				
				for (var r=0;r<numRows;r++){
					var row=[];
					for (var c=0;c<Math.floor(addCols/2);c++){row.push('.');}
					for (var c=0;c<numCols;c++){row.push(topology[r][c]);}
					for (var c=0;c<Math.ceil(addCols/2);c++){row.push('.');}
					temp.push(row);
				}
				
				for (var r=0;r<Math.ceil(addRows/2);r++){
					temp.push(emptyRow);
				}
				
				var topology=temp;

				//topoology now holds the necessary data which can be displayed.
				
				out+='<div class="board_prev" onclick="pd.game.loadBoardFromFile(\''+id+'\');" title="'+id+'">';
				for (var r=0;r<size;r++){
					for (var c=0;c<size;c++){
						var element=topology[r][c];
						var className=(element=='.')?'empty':'filled';
						
						out+='<div style="width:'+sizeString+';height:'+sizeString+'" class="'+className+'"></div>';
					}
				}
				out+='</div>';
				
			} //for each element of the list (=for every board configuration)
			
			el.innerHTML=out;
			
		});
		oReq.open("GET", 'boardlist.php');
		oReq.send();		
		
	}
	
	closeOverlay(){
		document.getElementById('overlay').style.display='none';
	}

	showBoard(){
		this.closeOverlay();
	}

	// Button handling fo the function bar
	
	updateHeatButton(){
		var heatbutton=document.getElementById('heatbutton');
		if (!heatbutton) return;

		heatbutton.src=(this.pd.hinter.heatMode)?'ico/heat_off.png':'ico/heat_on.png';
	}
	
	switchHeat(){

		if (!this.pd.hinter.heatMode){
			this.pd.hinter.showHeatMap();
		} else {
			this.pd.hinter.noHeatMap();
		}

		
		var legend=document.getElementById('legend');
		legend.style.display=(this.pd.hinter.heatMode)?'block':'none';
		this.updateHeatButton();
	}

	//style switching
	setStyle(selection){
		var element=document.getElementById('boardstyle');
		element.href='boardstyles/'+selection+'.css';
		
		var that=this;
		setTimeout(function(){
			that.pd.visual.updatePieces();
		},100);
		
	}

	translate(text){
		return this.pd.translate(text);
	}
	
	//Logging function. This is for development puporses only. In the edn
	//outputs need to be managed differently.
	log(text,a,b,c,d,e){
		
		//text=new Date().toLocaleTimeString('de-DE')+' '+text;
		
		if (a!==undefined) text=text+' '+a;
		if (b!==undefined) text=text+' '+b;
		if (c!==undefined) text=text+' '+c;
		if (d!==undefined) text=text+' '+d;
		if (c!==undefined) text=text+' '+e;

		console.log(text);
	}

	clearHint(){
		var element=document.getElementById('hint');	
		element.innerHTML='';
	}

	hintRequest(level){
		this.pd.hinter.hintRequest(level);
	}

	startPartition(){
		if (pd.game.currentPartition){
			this.pd.game.showPartition(0);
		} else {
			this.pd.game.showPartition(1);
		}
	}

	visualPartitions(){
		this.pd.game.visualPartitions();
	}

}