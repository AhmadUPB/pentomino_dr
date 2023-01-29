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

/** Model/Data for the Pentomino game (Backend) */
class Game{
	
	constructor(pd){
		
		var that=this;

		this.pd=pd;
		this.visual=pd.visual;
		this.evaluator=this.pd.evaluator;
		this.selected=false;
		this.frozenPieces={};
		this.highlightedPositions="";
		this.documents={};
		
	    //dimensions of the game

		this.width=pd.config.fieldWidth;
		this.height=pd.config.fieldHeight;
		
		//load the startstate(s) (from URL) if existing. 
		//otherwise load the last state
		//Otherwise load the initial board;

		if (this.pd.config.s){
			this.setGameState(this.pd.config.s,function(){
				alert('Die URL kann nicht gelsen werden. Bitte informieren Sie den Programmierer: '+that.pd.config.s);
				location.href='?';
			});
			this.freezeState();
		} else {
			// in case a document is sent, then update the loaclstoarge with the sent document state
			if(window.annotatedDocument) this.setAnnotatedDocument();
			this.restore(function(){
				that.loadBoardFromFile('a_6x10');
			})   //reload the stored state or load the standard board.
		}
	} //constructor

	//Loads a board from a given solution array (array of 2-dimenstional arrays representing the solutions)
	loadBoardFromSolutions(solutionsFromFile,keepPieces,callback){

		var that=this;
		
		var firstSolution=solutionsFromFile[0];

		if (!firstSolution) return alert('Logic error. loadBoardFromSolution called without any solution. This should never happen!');

		that.boardDimensions=[firstSolution[0].length,firstSolution.length]; //Attention: boardDimensions is c,r
		
		//create a datastructur with the boardlayout
		//array[r][c] with 0 on blocked cells, 1 on open cells
		that.boardLayout=[];
		
		for (var r in firstSolution){
			if (!that.boardLayout[r]) that.boardLayout[r]=[];
			for (var c in firstSolution[0]){
				var letter=firstSolution[r][c];
				
				if (letter=='.') {
					that.boardLayout[r][c]=0;
					continue;
				} else {
					that.boardLayout[r][c]=1;
				}					
			}
		}
		
		//determine the pieces used for solving this board
		//for this we have to go through all solutions, as not every solution
		//uses every piece on smaller boards

		var pieces={};

		for (var s in solutionsFromFile){
			var solution=solutionsFromFile[s];
			for (var r in solution){
				for (var c in solution[0]){
					var letter=solution[r][c];
					var code=letter.charCodeAt(0);
					if (code<65) continue;
					if (code>90) continue;
					pieces[letter]=true;
				}
			}
		}

		//if keepPieces is set, existing pieces remain on the board
		//used for partition functionality
		
		let pieceNames=Object.keys(pieces);
		
		if (keepPieces) {
			var oldPieces=that.pieces;
			that.pieces={};
			that.pieceArray=[];
			
			//create the datastructures for the actual pieces
			for(let i in pieceNames){
				if (oldPieces[pieceNames[i]]){
					that.pieces[pieceNames[i]]=oldPieces[pieceNames[i]];
				} else {
					that.pieces[pieceNames[i]]=new Piece(pieceNames[i],that);
				}
				that.pieceArray[i]=that.pieces[pieceNames[i]];
			}
		} else {
			that.pieces={};
			that.pieceArray=[];
			
			//create the datastructures for the actual pieces
			for(let i in pieceNames){
				that.pieces[pieceNames[i]]=new Piece(pieceNames[i],that);
				that.pieceArray[i]=that.pieces[pieceNames[i]];
			}
		}
		
		//position the board on the game field
		that.boardX=Math.floor((that.width-that.boardDimensions[0])/2);
		that.boardY=Math.floor((that.height-that.boardDimensions[1])/2);
		
		//render the visualisation
		that.pd.visual.init();
		
		//inform evaluator about the new board
		that.pd.evaluator.setSolutions(solutionsFromFile,that.boardDimensions);
		
		that.pd.ui.showBoard();

		that.unfreeze(); // no frozen pieces after loading the board.
						 // might be frozen in callback
		
		//callback function can be used to place pieces after loading the board
		//(for restoring or loading states)
		if (callback) callback();


	}
	
	//load a board from file by its file name
	loadBoardFromFile(boardname,callback){
		
		var that=this;

		if (!callback){
							//clear the annotation states of board, pieces and texts from local stoarge
							//to make sure they are not loaded in a false board when a board is loaded from the board selection overlay
			console.log("no callback!!")
			var storage=window.localStorage;
			storage.setItem('piecesState', "");
			storage.setItem('boardState', "");
			storage.setItem('TextStatePR', "");
			that.pd.ui.layer.destroy();
			that.pd.ui.layer = new Konva.Layer();
			that.pd.ui.stage.add(that.pd.ui.layer);

							//When there is no callback, the board has been loaded freshly
							//so we memorize its initial state
			callback=function(){
				that.solutionsPrePartition=false; //reset paritioning
				that.currentPartition=0;
				that.memorize();
			};
		}
		
		//The boardinformation in fetched from the server(right under this listener)
		function reqListener () {
			that.boardName=boardname;
			
			var text=this.responseText;

			if (text.includes('rror 404')) {
				alert ('Fatal error! Specified board cannot be found!');
				return;
			}
			
			//create array[r][c] structure
			text=text.split('\n');

			var solutionsFromFile=[];
			that.layoutForDocument = text[0].split(', ')[1];
			for (var i in text){
				var line=text[i].split(', ')[1];

				if (!line) continue;
				
				var lines=line.split(' ');
				
				var solution=[];
				
				for (var j in lines){
					line=[];
					for (var k=0;k<lines[j].length;k++){
						line.push(lines[j][k]);
					}
					solution.push(line);
				}
				
				solutionsFromFile.push(solution);
			}

			//Here we have solutions. These are loaded now
			that.loadBoardFromSolutions(solutionsFromFile,false,callback);

		} //reqListener in loadBoardFromFile
		
		//load the board from its configuration file
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'boards/'+boardname+".txt");
		oReq.send();
		
		return this;
		
	} //loadBoardFromFile

	//unfreeze pieces on the board
	unfreeze(){
		if (Object.keys(this.frozenPieces).length==0) return;

		console.log('Unfreezing!');
		this.frozenPieces={};
	}

	//freeze the state if configured so
	freezeState(){
		if (!pd.config.freezeState) return;
		
		var that=this;
		
		window.setTimeout(function(){
			that.freeze(); //freeze the pieces on the board
		},10); //delayed so it happens after loading is finished
	}

	//set the pieces currently on the board as frozen.
	freeze(){
		
		var boardArray=this.pd.evaluator.getBoardArray();
		var piecesOnBoard={};

		for (var r in boardArray){
			for (var c in boardArray[r]){
				var value=boardArray[r][c];
				if (value=='') continue;

				piecesOnBoard[value]=true;
			}
		}

		this.frozenPieces=piecesOnBoard;

		console.log('Freezing '+Object.keys(this.frozenPieces));

		return this.frozenPieces;

	}
	
	//get the piece object by the given name
	get(piece){ 
		piece=piece.toUpperCase();
		return this.pieces[piece];
	}

	getPiece(name){
		return this.get(name);
	}
	
	//get a map of the pieces on the board with blocked positions marked as #
	getBoardArray(){
		var board=this.pd.evaluator.getBoardArray();
		
		//mark blocked pieces
		
		for (var r in this.pd.game.boardLayout){
			for (var c in this.pd.game.boardLayout[r]){
				if (this.pd.game.boardLayout[r][c]=="0") board[r][c]='#';
			}
		}
		
		return board;
	}
	
	//get all pieces.
	//if outOfBoardOnly set, pieces on already positioned are ignored
	getPieces(outOfBoardOnly){ 
		var result={};
		
		var blacklist={}; //will contain in keys the names of those pices which are on the board
		
		if (outOfBoardOnly){
			var board=this.pd.evaluator.getBoardArray();
			for (var r in board){
				for (var c in board[r]){
					blacklist[board[r][c]]=true;
				}
			}
		}
		
		for (var name in this.pieces){
			var piece=this.pieces[name];
			if (blacklist[name]) continue;
			result[name]=piece;
		}
		return result;
	}
	
	//called in case of any change to piece data. Relays the changes to visual
	updateVisu(piece){
		if (!this.pd.visual) return;
		this.pd.visual.updatePieces(piece); 
	}


	setAnnotatedDocument(){
		let info = this.pd.annotatedDocument.split("&");
		var stoarge = window.localStorage;
		if(info[1]!=="none" && info[2]!=="none"){
			stoarge.setItem('gameState','');
			stoarge.setItem('piecesState','');
			stoarge.setItem('boardState','');
			stoarge.setItem('TextStatePR','');
			stoarge.setItem('gameState','"n":"'+info[1]+'"."s":"'+info[2]+'"');
			if(info[3]!=="none"){
				stoarge.setItem('piecesState','{"pieces":"'+info[3]+'"}');
			}
			if(info[4]!=="none"){
				stoarge.setItem('boardState','{"board":"'+info[4]+'"}');
			}
			if(info[5]!=="none"){
				stoarge.setItem('TextStatePR','{"texts":"'+info[5]+'"}');
			}

		}


	}
	
	//save the new state of a piece to history
	memorize(object, what){
		
		/* removed saving game state for the time being

		if (!this.temp) {
			this.temp={};
			this.temp.prevShape=false;
		}
		
		if (what=='position') {
			var position=object.position || 'T';
			this.temp.prevShape=false;
			this.history.push(object.name+position);
		} else if (what=='shape') {
			if (this.temp.prevShape==object.name) this.history.pop(); //remove several rotations/flips after another
			this.history.push(object.name+object.getBitmapState());
			this.temp.prevShape=object.name;
		}

		*/

		this.store(); //save the current state to localStorage
		
	}
	
	//save the current game state to local storage
	store(){		
		var storage=window.localStorage;
		storage.setItem('gameState', this.getGameState());
	}
	storeAnnotationStatePieces(){
		var storage=window.localStorage;
		storage.setItem('piecesState', this.getAnnotationStatePieces());
	}

	storeHighlightingStatePieces(postion,color){
		this.updateHighlightingStateBoard(postion,color);
		var storage=window.localStorage;
		storage.setItem('boardState', this.getHighlightingStateBoard());


	}

	storeTextStatePR(){
		var storage=window.localStorage;
		storage.setItem('TextStatePR', this.getTextStatePR());
	}



	
	unstore(){
		var storage=window.localStorage;
		storage.setItem('gameState', false);
	}
	
	//restore game from state in localstorage
	restore(altFunc){
		
		var storage=window.localStorage;
		var data=storage.getItem('gameState');

		if (data&&data!='false') {


			this.setGameState(data,altFunc);



			return true;
		}
		
		if (altFunc) return altFunc();	
	}

	updateHighlightingStateBoard(toUpdate,color){
		var postions=this.highlightedPositions.split("_");

		this.highlightedPositions="";
		for (var i in postions){
			var postion=postions[i];
			if(postion) {
				//problem postion includes # somtimes and the condtion below will not be checked correctly
				var hasOldColor=false;
				var oldColor="";
				if(postion.includes("#")){
					let info=postion.split("#");
					postion=info[0];
					oldColor="#"+info[1];
					hasOldColor=true;
				}
				if (toUpdate == postion) {

					if (color)// in this case an already highlighted postion is being highlighted with different color
						// or in this case a none highlighted postion is being highlighted
						this.highlightedPositions += "_" + postion + color;
					else //in this case highlighted postion is being erased
						this.highlightedPositions += "_" + postion;
				} else
					this.highlightedPositions += "_" + postion + oldColor;

			}
		}
		postions=this.highlightedPositions.split("_");

	}

	getTextStatePR(){
		let out={};
		out.texts='';
		let layerChildren = this.pd.ui.layer.getChildren();
		let stageWidth =this.pd.ui.stage.width();
		for(let i in layerChildren){
			if(layerChildren[i].getClassName()==="Text"){
				out.texts+="!"+layerChildren[i].text()+"_"+parseFloat(layerChildren[i].x()*100/stageWidth)+"_"+parseFloat(layerChildren[i].y()*100/stageWidth)+"_"+layerChildren[i].fill()+"_"+parseFloat(layerChildren[i].width());
			}
		}

		out=JSON.stringify(out);
		return out;

	}

	getHighlightingStateBoard(){
		var out={};
		out.board=this.highlightedPositions;
		out=JSON.stringify(out)

		return out;

	};
	getAnnotationStatePieces(){
		var out ={};
		out.pieces="";
		for (var i in this.pieceArray){
			var piece = this.pieceArray[i];
			var color = piece.highlighted===undefined?"":piece.highlighted;
			var frozen= piece.frozen===true?"f":"n";
			out.pieces+='_' + piece.name + color + "." + frozen;
		}
		out=JSON.stringify(out);
		return out;
	}

	//get the current game state (for saving and storing)
	getGameState(after){
		
		var out={};
		
		out.n=this.boardName;	
		out.s='';
		
		for (var i in this.pieceArray){	
			var piece=this.pieceArray[i];
			out.s+='_'+piece.name+piece.getBitmapState()+(piece.position || 'T');
		}
		
		//out.h=this.history;

		out=JSON.stringify(out);
		out=out.replaceAll(',','.');
		out=out.replaceAll('{','');
		out=out.replaceAll('}','');
		
		if (after) after(out); else return out;
		
	}
	
	//save the current game to a file
	save(){
		var out=this.getGameState();
		
		//creating a download
		
		var element = document.createElement('a');
	    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(out));
	    element.setAttribute('download', 'savegame.txt');
	
	    element.style.display = 'none';
	    document.body.appendChild(element);
	
	    element.click();
	
	    document.body.removeChild(element);
		
	}

	//open the configuration page with current came data as URL
	toConfig(){
		
		let url = new URL(location.href);
		let params = new URLSearchParams(url.search);

		params.set('state', this.getGameState());
		location.href=('config.php?'+params.toString());
		
	}

	showQRCode(type){
		let url = new URL(location.href);
		let params = new URLSearchParams();

		var getUrl = window.location;
		var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
		if(type){
			var docmentId = Object.keys(DocumentDR.selectedDocuments)[0];
			params.set('d', window.LoggedIn+"."+docmentId);
			url = (baseUrl + '?' + params.toString());

		}
		else {
			params.set('s', this.getGameState());
			params.set('conf', 'res');
			url = (baseUrl + '?' + params.toString());
		}
		this.pd.ui.showQRCode(url);
	}

	//set the game state according to the content string provided
	//content: string containting the state
	//errorFunc: function which is to be called in case of error
	setGameState(content,errorFunc){
		
		 this.pd.evaluator.stopChecking();

		 var that=this;

		 // make it JSON again
		 if (!content.includes("{")) {content='{'+content+'}';}
		 content=content.replaceAll('.',',');

		// in case the string cannot be parsed, revert to the standard setup.

		 try {
		 	var data=JSON.parse(content);
		 } catch (error) {
			console.error('Malformed gamestate',content);
			if (errorFunc) errorFunc(); else {
				console.error('No error handling. This will end in chaos.');
			}
			that.evaluator.restartChecking();
			return false;
		 }
		
    	 that.loadBoardFromFile(data.n,function(){

			if (!data.s) {
				//console.log('No state provided.');
				that.evaluator.restartChecking();
				return false;
			}

			that.pd.evaluator.stopChecking();
   
			data.s=content=data.s.replaceAll('#','_'); //also interpret "old" strings
			var state=data.s.split('_');
			
			for (var i in state){
				var pieceData=state[i];
				if (!pieceData) continue;
				
				var n=pieceData[0];
				var s=pieceData[1];
				var p=pieceData.substring(2);
				var piece=that.get(n);
				
				//set the pieces to the correct rotation state
				
				piece.loadState(s);
				
				//position pieces
				if (p=='T') {
					piece.toTray();
				} else {
					p=p.split(',');
					piece.place(p[0],p[1]);
				}

			}
			//after loading the game and pieces the annotation state is recreated

			 var storage=window.localStorage;
			 var piecesState = storage.getItem("piecesState");
			 var boardState = storage.getItem("boardState");
			 var TextStatePR = storage.getItem("TextStatePR");
				 that.setPiecesAnnotationState(piecesState);
				 that.setHighlightingStateBoard(boardState);
				 that.setTextStatePR(TextStatePR);

    	 	
    	 	//set history to saved one
    	 	//that.history=data.h;

			 that.evaluator.restartChecking();
    	 	
    	 });
		
	}

	setTextStatePR(content){
		if(!content)return;
		let data=JSON.parse(content);
		let texts=data.texts;
		texts=texts.split('!');
		let text="";
		let stageWidth = this.pd.ui.stage.width();
		//let stageHeight = this.pd.ui.stage.height();
		for (let i in texts){
			text=texts[i];
			if (!text) continue;
			text=text.split('_');
			this.pd.ui.addText(text[0],parseFloat(text[1]*stageWidth/100),parseFloat(text[2]*stageWidth/100),text[3],parseFloat(text[4]));

		}
		let that=this;
		setTimeout(function(){
			let children=that.pd.ui.layer.getChildren();
			for(let i in children){
				if(children[i].getClassName()==="Text"){
					children[i].draggable(false);
				}
			}
		},100);

	}


	setPiecesAnnotationState(content){
		if(!content)return;
		//this.pd.evaluator.stopChecking();
		var data=JSON.parse(content);
		var state=data.pieces.split('_');
		for (var i in state){
			var pieceData=state[i];
			if (!pieceData) continue;

			var name=pieceData[0];
			var color="";
			var piece=this.getPiece(name);
			if(pieceData.length>1){
				//we need to distinguish if a piece is colored or frozen
				if(pieceData.substring(1).includes("color") && pieceData.substring(1).includes(".")){
					color=pieceData.substring(1,7);
					if(pieceData.substring(8)==="f")piece.frozen=true;
					piece.highlighted=color;
					this.pd.visual.updatePiece(piece);
				}
				else if(pieceData.substring(1).includes("color") ){
					color=pieceData.substring(1);
					piece.highlighted=color;
					this.pd.visual.updatePiece(piece);

				}
				else{
					if(pieceData.substring(2)==="f")piece.frozen=true;
					this.pd.visual.updatePiece(piece);
				}

			}
		}
	}

	setHighlightingStateBoard(content){
		if(!content)return;
		var data=JSON.parse(content);
		this.highlightedPositions=data.board;
		var postions=data.board.split('_');
		for (var i in postions){
			var postionData=postions[i];
			if (!postionData) continue;

			if (postionData.includes("#")){
				postionData=postionData.split("#");
				this.pd.visual.highlightBoardPostion(postionData[0],"#"+postionData[1]);
			}
		}

	}
	
	//load a game from a file
	load(){
		
		var element = document.createElement('input');
		element.type='file';
		element.id='fileElem';
		element.accept='text/plain';
		element.style.display='none';
		
		document.body.appendChild(element);
		
		var that=this;
		
		fileElem.addEventListener("change", function(){
			
			if (!this.files.length) return;
			
			var file=this.files[0];
			
			const reader = new FileReader();
		    reader.onload = (function(file) { return function(e) {
		    	 var content=reader.result; 	 
		    	 that.setGameState(content,false);
		    }; })(file);
		    reader.readAsText(file);
			
		}, false);
		
		element.click();
		
		document.body.removeChild(element);
		
	}

	addDocument(){
		var stoarge = window.localStorage;
		var gameState = stoarge.getItem('gameState')
		if (!gameState) {
			alert("Error!, no board in local stoarge to load")
		}
		if (!gameState.includes("{")) {gameState='{'+gameState+'}';}
		gameState=gameState.replaceAll('.',',');
		gameState = JSON.parse(gameState);
		console.log("add: ",gameState);
		let piecesState = stoarge.getItem('piecesState')
		if(piecesState) piecesState= JSON.parse(piecesState).pieces; else piecesState='none'
		console.log("add: ",piecesState);
		let boardState = stoarge.getItem('boardState')
		if(boardState) boardState= JSON.parse(boardState).board; else boardState='none';
		console.log("add: ",boardState);
		let TextStatePR = stoarge.getItem('TextStatePR')
		if(TextStatePR){
			TextStatePR= JSON.parse(TextStatePR);
			TextStatePR=TextStatePR.texts;
			console.log(TextStatePR);
		}
		else TextStatePR = 'none';
		console.log("add: ",TextStatePR);
		let boardLayout= this.layoutForDocument;
		console.log("add: ",boardLayout);
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "./loginsystem/reqhandler.php", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("type="+"storedocumentPR"+"&x="+"none"+"&y="+"none"+"&boardname="+gameState.n+"&piecestate1="+gameState.s+"&piecestate2="+piecesState+"&boardState="+boardState+"&TextStatePR="+TextStatePR+"&boardLayout="+this.layoutForDocument+"&url="+document.documentURI);
	}

	deleteSelectedDocuments(){
		let documentIDs = "";
		Object.keys(DocumentDR.selectedDocuments).forEach(ID =>{
			documentIDs+="_"+ID
			this.documents[ID].group.destroy();
			delete this.documents[ID];
		});
		DocumentDR.selectedDocuments={};
		this.pd.ui.deactivateButtonDR("#DRdelete_button");
		this.pd.ui.deactivateButtonDR("#DRsend_button");
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "./loginsystem/reqhandler.php", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("type="+"deletedocumentsDR"+"&documentIDs="+documentIDs);
	}

	updateDocumentCoordinates(id,x,y){
		console.log("called!");
		x=x*100/window.innerWidth;
		y=y*100/window.innerWidth;
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "./loginsystem/reqhandler.php", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("type="+"updateDocumentCoordinates"+"&id="+id+"&x="+x+"&y="+y);

	}
	//*** partition handling ***

	visualPartitions(){

		if (this.partitionsVisualized){
			this.partitionsVisualized=false;
			this.pd.visual.uncolorizePieces();

			for (var r in this.boardLayout){
				for (var c in this.boardLayout[0]){
					if (this.boardLayout[r][c]){
						this.pd.visual.unColorizeBoard(r,c);
					}
				}
			}

			return;
		}

		if (!this.preparePartition()){
			alert('Unsolvable!');
			return false;
		};

		this.partitionsVisualized=true;

		//colorize board
		for (var r in this.boardLayout){
			for (var c in this.boardLayout[0]){
				if (this.boardLayout[r][c]){
					if (this.partitionData[0].boardLayout[r][c]){
						var color='var(--partition-1-board-color)';
					} else if (this.partitionData[1].boardLayout[r][c]){
						var color='var(--partition-2-board-color)';
					} else {
						var color='var(--partition-3-board-color)';
					}
					this.pd.visual.colorizeBoard(r,c,color);
				}
			}
		}

		//colorize pieces

		for (var p=0;p<=2;p++){
			switch (p){
				case 0: var pColor='var(--partition-1-piece-color)';break;
				case 1: var pColor='var(--partition-2-piece-color)';break;
				default: var pColor='var(--partition-3-piece-color)';break;
			}

			var pieces=this.partitionData[p].pieces;

			for (var piece in pieces){
				this.pd.visual.colorizePiece(piece,pColor);
			}

		}

	}

	showPartition(number){
		//partition 0 or 3: load full board
		//partition 1: left only
		//partition 2: left and middle

		if (this.currentPartition==number) return;

		if (number==0 || number==3){
			if (this.solutionsPrePartition) this.loadBoardFromSolutions(this.solutionsPrePartition,true);
			this.solutionsPrePartition=false; //reset paritioning
			this.currentPartition=0;
			this.pd.evaluator.checkTheBoard(true);
			return true;
		}

		if (number==1 ||number==2){
			if (!this.solutionsPrePartition) {
				if (!this.preparePartition()){
					alert('Unsolvable!');
					return false;
				};
			}
			this.currentPartition=number;

			var solutions=[];

			if (number==1){
				solutions=this.partitionData[0].solutions;
			} else {
				//we have to filter the solutions so they only contain those 
				//which are compatible to what is on the board in section one.

				var board=this.pd.game.getBoardArray();
				var temp=this.partitionData[1].solutions;

				for (var t in temp){
					var candidate=temp[t];
					var isSolution=true;
					for (var r in candidate){
						if (!isSolution) continue;
						for (var c in candidate[0]){
							if (!isSolution) continue;
							if (!board[r][c]) continue; //empty on board;
							if (board[r][c]=='#') continue; //blocked on board;
							if (board[r][c]!=candidate[r][c]) {
								isSolution=false;
							}
						}
					}
					if (isSolution) solutions.push(candidate);
				}
			}

			this.loadBoardFromSolutions(solutions,true);
			this.pd.evaluator.checkTheBoard(true);
			return true;
		}

		alert('We should never be here. Please consult console!');
		console.trace();
		return false;
	}

	//claculates paritions, including information about solutions and shape
	preparePartition(){

		var solutions=pd.evaluator.currentSolutions;
	
		if (solutions.length==0) return false;

		this.solutionsPrePartition=pd.evaluator.solutions; //needed to reset to full board

		var selectedNr=Math.floor(Math.random() * solutions.length); //select a random solution
		var solution=solutions[selectedNr];

		var pieces=pd.game.pieceArray;
		var numPieces=pieces.length;
		var numPiecesPerPartition=Math.floor(numPieces/3); //number of pieces of a third

		// now calculate the partitions

		this.piecesPerPartition=[];

		var temp={};
		temp['.']=true; //ignore . from the beginning

		var rowNums=[];
		for (var it=0; it<solution.length;it++){rowNums.push(it);}

		var i=0;
		for (var c in solution[0]){
	
			//go through rows in random order to create more even partitions
			var rand = rowNums.sort(function(){return Math.random()-0.5;});

			for (var sel in solution){
				var r=rand[sel];
				var element=solution[r][c];
				if (temp[element]) continue;
				temp[element]=true;
				var inPartition=Math.min(2,Math.floor(i/numPiecesPerPartition));
				
				if (!this.piecesPerPartition[inPartition]) this.piecesPerPartition[inPartition]={};
				this.piecesPerPartition[inPartition][element]=true;

				i++;
			}
		}

		//this.piecesPerPartition now contains the pieces in each partition
		//in next step calculate the parition board layouts

		this.partitionData=[];

		for (var p=0;p<2;p++){
			var partitionBoardLayout=[];

			for (var r in solution){
				if (!partitionBoardLayout[r]) partitionBoardLayout[r]=[];
				for (var c in solution[0]){
					var element=solution[r][c];

					var elementInPartition=false;
					for (var pp=p;pp>=0;pp--){
						var elementInPartition=elementInPartition||this.piecesPerPartition[pp][element];
					}
					var value=(elementInPartition)?1:0;

					partitionBoardLayout[r][c]=value;
				}
			}

			this.partitionData[p]={};
			this.partitionData[p].boardLayout=partitionBoardLayout;
			this.partitionData[p].solutions=[];
			this.partitionData[p].pieces=this.piecesPerPartition[p];

		}

		//in this.partitionData[p].boardLayout we now have the two smaller boardLayouts

		//now we have to calculate the solutions for these partitions
		//this will quite likely be more than the initiall chosen one

		this.partitionData[2]={};
		this.partitionData[2].solutions=pd.evaluator.solutions;
		this.partitionData[2].pieces=this.piecesPerPartition[2];

		for (var p=1;p>=0;p--){ //for all parititons backwards, as only those possibilities are valid for the
								//small partition which is at all part of the bigger one.
			var sol=this.partitionData[p+1].solutions; 

			for (var s in sol){
				var solution=sol[s];

				var partition=this.partitionData[p].boardLayout;
				var partSolution=[];
				var temp={}; //to count the positions covered by a piece
				temp.F=0;temp.I=0;temp.L=0;temp.N=0;temp.P=0;temp.T=0;
				temp.U=0;temp.V=0;temp.W=0;temp.X=0;temp.Y=0;temp.Z=0;
				
				for (var r in solution){
					if (!partSolution[r]) partSolution[r]=[];
					for (var c in solution[0]){
						if (partition[r][c]){
							temp[solution[r][c]]++;
							partSolution[r][c]=solution[r][c];
						} else {
							partSolution[r][c]='.';
						}
					}
				}
				
				//add those partial boards with full pieces to the solitions

				var isGood=true;
				for (var t in temp){
					if (temp[t]%5) {isGood=false;continue;} //partial pieces

					if (temp[t]==5){ // limit solutions to those with initial part set
						if (p==0) {
							if (!this.piecesPerPartition[0][t]) {
								isGood=false;continue;
							}
						} else  { //p==1
							if (!(this.piecesPerPartition[0][t] || this.piecesPerPartition[1][t])) {isGood=false;continue;}
						}
					}

				}
				if (isGood) this.partitionData[p].solutions.push(partSolution);
			}

		} //for all parititons
		
		return true;

	} //preparePartition
		
}