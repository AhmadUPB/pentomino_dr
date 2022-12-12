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

/**  Evaluator functionality (backend)... Frontend is Hinter */
class Evaluator{
	
	constructor(pd){
	
		this.pd=pd;
		
		this.solutions=[]; //will contain all solutions for this board
		this.currentSolutions=[]; //this will contain the solutions for the current solutions
		this.currentPossibilities=[]; //this will contain possible valid next placements
		
		this.workerFile='EvaluatorWorker.js'; //evaluator as webworker

	}
	
	//setSolutions creates/calculates an array of all solutions for the given board
	//this is called after loading a board and has not to be solved again as
	//all solutions are put into a data structure.
	//
	//@text the board configuration textfile (coming from Game)
	setSolutions(solutionsFromFile,dimensions){
				
		this.solutions=solutionsFromFile;
		  
		  //solutions contains all solutions in the file
		  //now all rotated and mirrored solutions are added
		  
		  //Notice: At this point we ignore blocked elements.
		  //Illegal flips and rotations will be removed later		  

		  //rotate
		  
		  if (dimensions[0]==dimensions[1]){
			  for (var s in this.solutions){
			  	var solution=this.solutions[s];
			  	var newSolution=[];
			  	
			  	for (var r in solution){
			  		for (var c in solution[r]){
			  			if (!newSolution[c]) newSolution[c]=[];
			  			newSolution[c][dimensions[1]-1-r]=solution[r][c];
			  		}
			  	}
			  	
			  	this.solutions.push(newSolution);
			  }
		  }
		 
		  //flip horizontally
		  
		  for (var s in this.solutions){
		  	var solution=this.solutions[s];
		  	var newSolution=[];
		  	
		  	for (var r in solution){
		  		var row=solution[r];
		  		var newRow=[];
		  		for (var l=row.length-1;l>=0;l--){
		  			newRow.push(row[l]);
		  		}
		  		newSolution.push(newRow);
		  	}
		  	
		  	this.solutions.push(newSolution);
		  }
		  		  
		  //flip vertically
		  
		  for (var s in this.solutions){
		  	var solution=this.solutions[s];
		  	var newSolution=[];
		  	for (var l=solution.length-1;l>=0;l--){
		  		newSolution.push(solution[l]);
	
		  	}
		  	this.solutions.push(newSolution);
		  }
		  
		  //remove those "solutions" which are not compatible with
		  //the blocked elements (by comparing them with the first
		  //solution which is neither rotated nor flipped
		  
		  //determine blocked elements
		  var blockedElements=[];
		  
		  for (var r in this.solutions[0]){
		  	for (var c in this.solutions[0][r]){
		  		if (this.solutions[0][r][c]=='.') blockedElements.push([r,c]);
		  	}
		  }
		 	  
		  var realSolutions=[];
		  var doubleCheck={};  //remove douplicates. Should not be in there
		  					   //when coming from file, but there might be
							   //plenty during creation of partitions
		  
		  for (var s in this.solutions){
		  	var solution=this.solutions[s];
			  
			var string=solution.toString();
		    if (doubleCheck[string]) {continue;} //duplicate board
			doubleCheck[string]=true;

			var compatible=true;

		  	for (var b in blockedElements){
		  		var blockedElement=blockedElements[b];
		  		var r=blockedElement[0];var c=blockedElement[1];
		  		if (solution[r][c]!=='.') {compatible=false; break;} //impossible mirroring or rotation
		  	}
		  	if (compatible) realSolutions.push(solution);
		  }

		  this.solutions=realSolutions;
		  
		  return this.haveSolution();
		
	}
	
	//This is called internally when all solutions have been created
	haveSolution(){
		evaluator.log('The board has '+this.solutions.length+' solutions!');
		this.checkTheBoard(); //checking the board for the first time
		return this;
	}
	
	//stopChecking and restartChecking set a flag which prevents the evaluation
	//of the current situation to be stopped. This is done to improve performance
	//and to avoid unnecessary outputs when boards are loaded or partially autosolved.
	//these are used in fill functions
	
	stopChecking(){
		this.checkingStopped=true;
	}
	
	restartChecking(){
		this.checkingStopped=false;
		this.checkTheBoard();
	}
	
	//get a map of the pieces on the board (also determine placement problems)
	getBoardArray(){
		
		//determine the board
		var board=[];

		if (!this.pd.game) {
			console.error('No game object');
			return;
		}

		var dim=(this.pd.game.boardDimensions);
		
		for (var r=0;r<dim[1];r++){
			var line=[];
			for (var c=0;c<dim[0];c++){
				line.push('');
			}
			board.push(line);
		}
		
		//board now array repesenting the board without pieces
		
		var pieces=this.pd.game.pieceArray;
		
		var problem=false;
		var outPieces={};
		var inPieces={};
		
		//add the pieces to the board
		for (var i in pieces){
			var piece=pieces[i];
			
			if (piece.inTray) continue;
			
			for (var r=0;r<5;r++){
				
				for (var c=0;c<5;c++){
				
					if (!piece.bitMap[r][c]) continue; //empty cell
					
					var boardRow=piece.position[1]-2+r-this.pd.game.boardY;
					var boardCol=piece.position[0]-2+c-this.pd.game.boardX;
					
					if(boardRow<0 || boardRow>=dim[1] || boardCol<0 || boardCol>=dim[0]){
						
						outPieces[piece.name]=true;

					} else {
						
						if(board[boardRow][boardCol]){ //overlapped
							this.pd.hinter.information('placementProblem','overlapping',this.getPiece(board[boardRow][boardCol]),piece); //inform hinter about the overlap
						} else {
							
							//blocked pieces are marked in the boardlayout with 0
							var isBlocked=(this.pd.game.boardLayout[boardRow][boardCol]==0); 
							
							if (!isBlocked) {
								board[boardRow][boardCol]=piece.name;
								inPieces[piece.name]=true;
							} else {
								outPieces[piece.name]=true;
							}
						}
					}
				}
			} //for all cells
	
		} //foreach pieces
		
		//if the number of occupied cells is not dividable by 5
		//there must be pieces only partially inside the board
		
		if (!problem){ //only check this, if there was no overlap detected before
			
			for (var p in inPieces){
				if (outPieces[p]){ //piece both inside and outside
					problem=true;
					this.pd.hinter.information('placementProblem','partial',p);
				}
			}
			
		}
		
		if (problem) return false;
		
		return board;
		
	}
	
	
	//This is called after any change on the game field. It compares the current
	//board configuration with the array of known solutions and saves all
	//compatible solutions into currentSolutions.
	//also handles illegal configurations
	checkTheBoard(forced){
		
		if (this.checkingStopped && !forced) return;

		//determine the board
		var board=this.getBoardArray();
		if (!board) return; //no board data
		var boardString=board.toString();
		
		//only continue if the board has changed at all
		if (this.boardString==boardString && !forced) return;
		this.boardString=boardString;
		
		//board checking can proceed
		//inform hinter, that old data is invalid
		this.pd.hinter.information('clear');

		//if there was no problem, we go through all known solutions
		//and find those which are compatible and which are compatible when
		//certain pieces are removed.

		if (board){

			this.currentSuggestions={};
			this.currentSolutions=[];
			this.currentPossibilities={};
			
			var finished=true;

			for (var i in this.solutions){
				var suggestion={};
				var solution=this.solutions[i];
				for (var row in solution){
					for (var col in solution[row]){
						if (board[row][col]=='') {//only check what is occupied
							if (this.pd.game.boardLayout[row][col]) finished=false; // if there is free space, we are not yet finished
							continue; 
						}
						if (board[row][col]!=solution[row][col]) {
							suggestion[board[row][col]]=true;
						}
					}
				} 

				suggestion=Object.keys(suggestion).sort();
				var diffCounter=suggestion.length;
				if (!this.currentSuggestions[diffCounter])this.currentSuggestions[diffCounter]=[];
				this.currentSuggestions[diffCounter].push(suggestion);
				if (diffCounter==0) {
					this.currentSolutions.push(solution);

					//for this solution determine for all pieces not yet set on the board what that board would be like
					//and set it as a possibiliy

					if (this.pd.config.suggestMode==1){  //only in case of hypothesis based suggestions

						//TODO: This needs to happen in a webworker as it takes a lot of time!

						for (var piece in pd.game.getPieces(true)){ //for all pieces not on the board

							var possibility=[];

							//possibility is current board plus the possible valid position of a piece
							for(var row in solution){
								if (!possibility[row]) possibility[row]=[];
								for (var col in solution[row]){
									possibility[row][col]=board[row][col];
									if (piece==solution[row][col]) possibility[row][col]=piece;
								}
							}
							var possibilityData={};
							possibilityData.setPiece=piece;
							possibilityData.layout=possibility;
							this.currentPossibilities[possibility.toString()]=possibilityData;

						}

					}

				}
				
				//in the end currentSolutions contains all possible solutios for the current board
				//while currentSuggestions is an array which contains all suggestions with 1...12 fewer
				//pieces.

				//currentPossibilites will contain all possible valid placements
				
			}

			//make currentPossibilities an array and add additional evaluation data(e.g. hypothesis factor)
			var temp=this.currentPossibilities;
			this.currentPossibilities=[];
			
			for(var t in temp){
				var possibility=temp[t];

				if (this.pd.config.suggestMode==1){ //calculate the hypothesisFactor
				
					possibility.hFactor=0;  
					
					var neighbors=this.getNeighbors(possibility.layout,this.pd.game.boardLayout);
					
					for (var row in neighbors){
						for (var col in neighbors[row]){
							var value=neighbors[row][col];
							if (value==1) possibility.hFactor+=2;
							if (value==2) possibility.hFactor+=1;
						}
					}
				}

				this.currentPossibilities.push(possibility);
			}

			if (finished) {
				if (this.pd.game.currentPartition){
					this.pd.game.showPartition(this.pd.game.currentPartition+1);
				}  else {
					return this.pd.hinter.information('congratulations');
				}
			}
			
			var temp=[];
			
			for (var i=0;i<=11;i++){
				if (!this.currentSuggestions[i]) {
					temp[i]=[];continue;
				} 
				temp[i]=this.currentSuggestions[i];
			} 
			this.currentSuggestions=temp;
			
			if(this.currentSuggestions[0].length==0) {
				this.pd.hinter.information('numberOfSolutions',0);
				
				for (var i=1;i<11;i++){
					var suggestions=this.currentSuggestions[i];
					var numOptions=suggestions.length;
					if (!numOptions) continue;
					
					var message='There are '+numOptions+' solutions with '+i+' fewer pieces. (';
					var removeCandidates=[];
					
					var stat={};
					for (var j in suggestions){
						var suggestion=suggestions[j];
						if (!stat[suggestion]) stat[suggestion]=0;
						stat[suggestion]+=1/numOptions;
					}
					
					for (var piece in stat){
						message+=piece+':'+(Math.round(stat[piece]*10000))/100+'%; ';
						removeCandidates.push(piece);
					}
					
					message+=')';

					this.log(message); //This is more detailed debug info at the moment
					this.pd.hinter.information('removeSuggestion',removeCandidates);

					break;
				}
				
			} else {
				this.pd.hinter.information('numberOfSolutions',this.currentSuggestions[0].length);
			}
			
		} // if !problem
		else {
			this.currentSolutions=[];  //In a problem state, previous solution information is not valid any more
			this.currentPossibilites=[];
		}

		if (board) this.evaluateSituation(board);
		
	} //checkTheBoard
	
	/**
	 * starts a webworker which determines which areas of the board are more or less ambiguous
	 * see EvaluatorWorker.js for details.
	 * 
	 * @param {*} board 
	 */
	evaluateSituation(board){
		
		var that=this;
		
		var board=pd.game.getBoardArray();
		
		var fullPieceData=pd.game.getPieces(true); //TODO: This may have to be changed to onBoard
		
		var pieceData={}; //create piece data containing only the necessary information for the worker
		for (var name in fullPieceData){
			var data={};
			data.states=fullPieceData[name].getStates();
			
			pieceData[name]=data;
		}
		
		var currentSolutions=pd.evaluator.currentSolutions;

		if (this.worker) this.worker.terminate(); //kill evaluation if one is running
		this.worker=new Worker(this.workerFile); //evaluator as webworker
		
		//send this to worker (EvaluatorWorker.js)
		this.worker.postMessage(
			{'board':board,
			 'pieceData':pieceData,
			 'currentSolutions':currentSolutions,
			 'boardLayout':that.pd.game.boardLayout
			});

		this.worker.onmessage = function(e) {
			that.pd.hinter.information('suggestion','possibilities',e.data); //send the coldmap and fill possibilities to the hinter for visu
		}
	}
	
	//returns a random solution among those for the current board
	getRandomSolution(){
		var numSolutions=Object.keys(this.currentSolutions).length;
		
		if (numSolutions==0){
			console.error('Trying to getRandomSolution while not solvable.');
			return;
		}

		var random= Math.floor(Math.random() * numSolutions);
		
		var solution=this.currentSolutions[random];
		return solution;
	}
	
	//get a list of all pieces on the board (only the letters, not the objects)
	getPiecesOnBoard(){
		var out={};
		
		for(var i=0; i<this.boardString.length;i++){
			var letter=this.boardString[i];
			if (letter==',') continue;
			out[letter]=true;
		}
		
		return out;
		
	}
	
	//fill the board with pieces which touch only in a limited fashion
	//@touches number of allowed touches, if not specified, there will be a full gap
	gapFill(touches){
		this.stopChecking(); //No checking needed while filling
		
		this.clear();
		for (var i=0;i<12;i++){ //we just try it 12 times ;-)
			this.distancePlace(touches);
		}
		
		this.restartChecking();
	}

	hypothesisPlace(){
		var possibilities=pd.evaluator.currentPossibilities;

		var maxValue=0;
		var max=[];

		for(var i in possibilities){
			var pos=possibilities[i];
			var hFactor=pos.hFactor;
			if (hFactor>maxValue) {
				max=[];
				max.push(pos);
				maxValue=hFactor;
			} else if (hFactor==maxValue){
				max.push(pos);
			}
		}

		var num=max.length;
		
		if (num==0){
			console.error('Trying hypothesisPlace while not solvable.');
			return;
		}

		var random= Math.floor(Math.random() * num);
		
		var selected=max[random];

		this.placePiece(selected.setPiece,selected.layout);

		return selected;
	}
	
	//place a pice in short distance to existing pieces which does not touch them
	//but is close to existing pieces on the board
	//creates situations which allow for foreground-background separation
	//
	//@maxTouches The number of positions around candidate objects which touch existing objects
	distancePlace(maxTouches){
		
		if (!maxTouches) maxTouches=0;
		
		var piecesOnBoard=this.getPiecesOnBoard();
		
		var board=this.getBoardArray();
		
		if (!board) return; //in case of an overlap on the board, we cannot do anything sensible here
		
		//get a random solution.
		var solution=this.getRandomSolution();
		if (!solution) return; //if not solvable, we cannot do anything sensible here
		
		function getBoardPosition(r,c){ // convenience function to be able to access beyond board limits
			
			if (!board[r]) return '';
			if (!board[r][c]) return '';
			
			return board[r][c];
		}
		
		//the adjoining poisitions to those occupied are collected
		var adjoining=[];
		for (var r in board){
			for (var c in board[r]){
				if (board[r][c]) continue; //not interested in alread occupied positions
				
				//var around=getBoardPosition(r*1-1,c)+getBoardPosition(r,c*1+1)+getBoardPosition(r*1+1,c)+getBoardPosition(r,c*1-1);

				if (this.pd.config.doubleDistance){

					var around=getBoardPosition(r*1-2,c*1-2)
							+getBoardPosition(r*1-2,c*1-1)
							+getBoardPosition(r*1-2,c*1)
							+getBoardPosition(r*1-2,c*1+1)
							+getBoardPosition(r*1-2,c*1+2)

							+getBoardPosition(r*1-1,c*1-2)
							+getBoardPosition(r*1-1,c*1-1)
							+getBoardPosition(r*1-1,c*1)
							+getBoardPosition(r*1-1,c*1+1)
							+getBoardPosition(r*1-1,c*1+2)

							+getBoardPosition(r*1,c*1-2)
							+getBoardPosition(r*1,c*1-1)
							+getBoardPosition(r*1,c*1)
							+getBoardPosition(r*1,c*1+1)
							+getBoardPosition(r*1,c*1+2)

							+getBoardPosition(r*1+1,c*1-2)
							+getBoardPosition(r*1+1,c*1-1)
							+getBoardPosition(r*1+1,c*1)
							+getBoardPosition(r*1+1,c*1+1)
							+getBoardPosition(r*1+1,c*1+2)

							+getBoardPosition(r*1+2,c*1-2)
							+getBoardPosition(r*1+2,c*1-1)
							+getBoardPosition(r*1+2,c*1)
							+getBoardPosition(r*1+2,c*1+1)
							+getBoardPosition(r*1+2,c*1+2);
				} else {

					if (this.pd.config.diagonalDistance){

						var around = getBoardPosition(r*1-1,c*1-1)
									+getBoardPosition(r*1-1,c*1)
									+getBoardPosition(r*1-1,c*1+1)

									+getBoardPosition(r*1,c*1-1)
									+getBoardPosition(r*1,c*1)
									+getBoardPosition(r*1,c*1+1)

									+getBoardPosition(r*1+1,c*1-1)
									+getBoardPosition(r*1+1,c*1)
									+getBoardPosition(r*1+1,c*1+1);
									
					} else {

						var around = getBoardPosition(r*1-1,c*1)

									+getBoardPosition(r*1,c*1-1)
									+getBoardPosition(r*1,c*1+1)

									+getBoardPosition(r*1+1,c*1);						
					}

				}

				if (around.length) adjoining.push([r,c]);
			}
		}
		
		//now we find the pieces which cover the adjoining positions
		//create touchInfo. 
		//touchInfo in the end will contain the number of touches a certain 
		//piece would have if positioned here.
		
		var touchInfo=[];
		
		for (var i in this.getPiecesOnBoard()){
			touchInfo[i]=100;
		}
		
		for (var i in adjoining){
			var blockedPosition=adjoining[i];
			var r=blockedPosition[0];var c=blockedPosition[1];
			
			if (!touchInfo[solution[r][c]]) touchInfo[solution[r][c]]=0;
			
			touchInfo[solution[r][c]]++;
		}

		//touchInfo now is an array containing information about pieces already on the board
		//(with a value of 100), and adjacent pieces with the number of touches they have
		
		//for performance, we do two things at the same time
		//1. determine the remaining pieces (those having no touches)
		//2. collect all piece positions of every piece on the board (see below)
		var allPieces={};
		var solPositions={};
			
		for (var r in solution){ //determining which pieces are in the solution and their positions
				for (var c in solution[r]){
					if (solution[r][c]=='.') continue;
					
					allPieces[solution[r][c]]=true;
					if (!solPositions[solution[r][c]]){
						solPositions[solution[r][c]]=[];
					}
					solPositions[solution[r][c]].push([r,c]);
				}
		}
		
		//determine the center position of the pieces (needed for distance calculations)
		var temp={};
		for (var pieceName in solPositions){
			var data=solPositions[pieceName]; //the data for one piece
			var cr=0;
			var cc=0;
			
			//calculate the center positions
			for(var j in data){
				cr=cr+data[j][0]*1/5;
				cc=cc+data[j][1]*1/5;
			}
			temp[pieceName]=[cr,cc];
		}
		solPositions=temp;
		
		//determin the remaining pieces which could be set
		var allPieces=Object.keys(allPieces);
		var remainingPieces=[];
		
		for (var pieceName in allPieces){
			var piece=allPieces[pieceName];
			if (!touchInfo[piece] || touchInfo[piece]<=maxTouches) { //here the checking for the number of touches takes place
				remainingPieces.push(piece);
			}
		}
		
		if (!remainingPieces.length) { //no more pieces to set
			return false; 
		}
		
		var boardPieces=this.getPiecesOnBoard();
		
		//if there already are pieces on the board, the shortest distance to possible candidates is chosen
		//otherwise a random piece is chosen (below)
		if (Object.keys(boardPieces).length){
			var min=500;
			var candidate=false;
			for (var bn in boardPieces){
				var b=solPositions[bn];
				for (var ci in remainingPieces){
					var cn=remainingPieces[ci];
					var c=solPositions[cn];

					var distance=Math.pow(b[0]-c[0],2)+Math.pow(b[1]-c[1],2);
					
					if (distance<min){
						candidate=cn;
						min=distance;
					}
				}
			}
			this.placePieces([candidate], solution);
		} else {
			this.fill(1,4);
		}
		
		return true;
		
	}
	
	//Fill the board with a number of pieces from a certain direction or randomly
	//4 random, 1 left, 2 middle, 3 right 
	fill(amount,order){
		
		if (order==undefined) order=2;
		
		this.stopChecking(); //No checking needed while filling
		
		var solution=this.getRandomSolution();
		var pieces={};
		var piecesOnBoard=this.getPiecesOnBoard();
		
		if (Object.keys(piecesOnBoard).length == this.pd.game.pieceArray.length) // board is full
		
		amount=Math.min(amount, this.pd.game.pieceArray.length-Object.keys(piecesOnBoard).length);
		
		if (order!==4){ //fill from 1 left 2 middle 3 center
			for (var i=0;i<this.pd.game.boardDimensions[0];i++){
				var c;
				switch(order){
					case 1:c=i;break;
					case 3:c=this.pd.game.boardDimensions[0]-i-1;break;
					case 2:{
						var m=Math.floor(this.pd.game.boardDimensions[0]/2);
						c=(i%2)?m-Math.floor(i/2)-1:m+Math.floor(i/2);
						break;
					}	
				}
				
				for (var r=0;r<this.pd.game.boardDimensions[1];r++){
					if (Object.keys(pieces).length>=amount) continue;
					if (solution[r][c]=='.') continue; //blocked element, no piece
					
					if (piecesOnBoard[solution[r][c]]) continue; //ignore pieces already on the board
					
					if (!pieces[solution[r][c]]) pieces[solution[r][c]]=0;
					pieces[solution[r][c]]++;
					
				}
				
				if (Object.keys(pieces).length>=amount) break;
			}
		} else { //random pieces
			var allPieces={};
			
			for (var r in solution){
				for (var c in solution[r]){
					if (solution[r][c]=='.') continue;
					allPieces[solution[r][c]]=true;
				}
			}
			
			allPieces=Object.keys(allPieces);
			
			while(Object.keys(pieces).length<Math.min(allPieces.length,amount)){
				var random= Math.floor(Math.random() * allPieces.length);
				random=allPieces[random];
				
				if (piecesOnBoard[random]) continue; //ignore pieces already on the board
				
				pieces[random]=true;
			}	
		}
		
		pieces=Object.keys(pieces);
		
		//Pieces now contains an array of those pieces from a random solution
		
		this.placePieces(pieces, solution);
		this.restartChecking(); // start the checker again
		
		return this;
	}
	
	//place certain pieces according to a given solution
	//@pieces: an array of pieces (as strings)
	//@solution: that solution the pieces are to be placed according to
	//
	//if no solition is provided, a random one is selected
	placePieces(pieces, solution){
		
		if(!solution) solution=this.getRandomSolution();
		
		var boardPieces=this.pd.game.pieces;
		
		for (var p in pieces){
			var pieceName=pieces[p];			
			var piece=boardPieces[pieceName];
			
			if (!piece) continue;  // something else than a piecename in board data (e.g. blocked)
			
			//find the piece on in the solution
		
			var top=500;
			var left=500;
		
			for (var r in solution){
				for (var c in solution[0]){
					var col=solution[c];
					if ((solution[r][c])==pieceName){
						top=Math.min(top,r);left=Math.min(left,c);
					}	
				}
			}
			
			if (top==500||left==500) {
				evaluator.error('No '+pieceName+' in solution');
				return;
			}
			
			//now top contains the top row of the piece, left the leftmost column
			
			//now we try to find the bitmap pattern
			
			var pieceBitMap=piece.bitMap;
			var found=false;
			
			//as the actual pieces are smaller than the 5x5 bitmap, we have to "rub" the big element
			//over the area in order to find the correct position
			
			//TODO: Could maybe simplyfied with the state loading function now existing in the Piece class
			
			for (var offsetRow=-2;offsetRow<=2;offsetRow++){ 
				
				if (found) continue;
				
				for (var offsetCol=-2;offsetCol<=2;offsetCol++){
					
					if (found) continue;
					var matchesOriginal=0;
					var matchesRight=0;
					var matchesTurned=0;
					var matchesLeft=0;
					
					var matchesHorizontal=0;
					var matchesHorizontalRight=0;
					var matchesVertical=0;
					var matchesHorizontalLeft=0;
					
					//here we check the piece pixels agains the area of pixels on the board
					//this is done at the same time in all rotations
					//on the other hand, the way it is done here would allow for animations
					
					for (var i=0;i<5;i++){
						if (found) continue;
						
						for (var j=0;j<5;j++){
							
							if (found) continue;
							
							var boardRow=top+offsetRow+i;
							var boardCol=left+offsetCol+j;
							
							var boardPixel;
							
							if (boardRow<0||boardCol<0 ||boardRow>=solution.length || boardCol>=solution[0].length) {
								boardPixel=0;
							} else {
								boardPixel=(solution[boardRow][boardCol]==pieceName)?1:0;
							}
							
							matchesOriginal+=boardPixel*pieceBitMap[i][j];
							if (matchesOriginal==5)found='original';
							
							if (!found){
								matchesLeft+=boardPixel*pieceBitMap[j][4-i];
								if (matchesLeft==5)found='left';
							}
							
							if (!found){
								matchesTurned+=boardPixel*pieceBitMap[4-i][4-j];
								if (matchesTurned==5)found='turned';
							}
							
							if (!found){
								matchesRight+=boardPixel*pieceBitMap[4-j][i];
								if (matchesRight==5)found='right';
							}
							
							if (!found){
								matchesHorizontal+=boardPixel*pieceBitMap[i][4-j];
								if (matchesHorizontal==5)found='horizontal';
							}
							
							if (!found){
								matchesHorizontalRight+=boardPixel*pieceBitMap[4-j][4-i];
								if (matchesHorizontalRight==5)found='horizontal-right';
							}
							
							
							if (!found){
								matchesVertical+=boardPixel*pieceBitMap[4-i][j];
								if (matchesVertical==5)found='vertical';
							}
							
							
							if (!found){
								matchesHorizontalLeft+=boardPixel*pieceBitMap[j][i];
								if (matchesHorizontalLeft==5)found='horizontal-left';
							}
							
							
							if (found){
								var position={};
								position['col']=left+offsetCol+2;
								position['row']=top+offsetRow+2;
							}
						
						} //for j
						
					} // jor i
	
				} //offsetCol
			} //offsetRow
			
			//in this position, found contains the necessary rotation or flipping
			//and position contains the position on the board
			
			if (found){
				
				var piece=this.pd.game.get(pieceName);
				
				switch(found){
					case 'right':piece.rotateRight();break;
					case 'turned':piece.turn();break;
					case 'left':piece.rotateLeft();break;
					case 'horizontal':piece.flipH();break;
					case 'horizontal-right':piece.flipH();piece.rotateRight();break;
					case 'vertical':piece.flipV();break;
					case 'horizontal-left':piece.flipH();piece.rotateLeft();break;
				};
				
				piece.place(position['col'],position['row'],true);
				
			} else {
				//We should never get here!
				evaluator.error(pieceName+' could not be found!');
			}
			
			
		} //piece
	}
	
	
	//conveiniance function to place a single piece
	placePiece(piece,solution){
		return this.placePieces([piece],solution);
	}

	getPiece(name){
		return this.pd.game.getPiece(name);
	}
	
	//send all pieces to tray
	clear(){
		this.stopChecking();
		var boardPieces=this.pd.game.pieces;
		var that=this;
		
		for (var i in boardPieces){
			boardPieces[i].toTray();
		}
		
		//load the startstate if existing;
		if (this.pd.config.s){
			this.pd.game.setGameState(this.pd.config.s);
			this.pd.game.freezeState();
		}

		this.restartChecking();
		this.pd.game.showPartition(0);
		this.pd.visual.uncolorizePieces();
		
		return this;
	}

	//determine for every free position on the board how many free neigbours it has
	getNeighbors(board,boardLayout){
		
		//TODO: This is called way too often. Why? If necessary, try caching.

		var heatMap=[];
		
		function isEmpty(r,c,boardLayout){
			
			//in case of boarderValue=1 (in contrast to heatmap in evaluatorWorker, treat areas outside the)
			//board as empty to avoid placement in heatmapFill to suggest placements at the borders

			var boarderValue=0;

			if (r<0) return boarderValue;
			if (c<0) return boarderValue;
			if (r>=board.length) return boarderValue;
			if (c>=board[0].length) return boarderValue;


			if (board[r][c]) return 0;
			if (boardLayout[r][c]==0) return 0;
					
			return 1;
		}
				
		for (var r in board){r=r*1;
			var row=[];
			for (var c in board[r]){c=c*1;
				var value;
				var bl=boardLayout;

				if (board[r][c]!='' || boardLayout[r][c]==0) {
					value='X';
				} else {
					value=isEmpty(r-1,c,bl)+isEmpty(r,c-1,bl)+isEmpty(r+1,c,bl)+isEmpty(r,c+1,bl);
				}
				
				row.push(value);
			}
			heatMap.push(row);
		}

		return heatMap;

	}

	//logging
	log(text,a,b,c){
		return pd.ui.log(text,a,b,c);
	}
}