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
		function addSection(id,title,after){
			
			var parent=document.getElementById('functions');
			
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

		//Here starts the definition of the sidebr
		
		addDiv('functions',0,function(div){

			//PREFILLING + CATALOG
			addSection('prefill','',function(div){

				if (pd.config.boardselector){addButton('catalog','catalog','LABEL_CATALOG',div,function(){pd.ui.showBoardSelector();});}
				if (pd.config.clear) addButton('clear','clear','LABEL_CLEAR',div,function(){evaluator.clear();});

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

				if (pd.config.config) addButton('configbutton','config','LABEL_CONFIG',div,function(){pd.game.toConfig();});

			});

			//INFO
			addSection('info_functions','',function(div){
				if (pd.config.info) addButton('infobutton','info','LABEL_INFO',div,function(){location.href="help/info.php";});
			});
			
			
		});

		//here come all the other areas of the user interface which are filled with conten in the respective files
		
		addDiv('game',0,function(div){
			addDiv('tray',div);
			addDiv('field',div);
		});
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
		
	}
	
    addDiv(id,parent,after){
			if (!parent) parent=document.getElementsByTagName('body')[0];
			
			var div = document.createElement("div");
			div.id=id;
			parent.appendChild(div); 
			
			if (after) after.call(this,div);
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