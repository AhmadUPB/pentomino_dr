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

//This is a webworker file for status evaluations. It runs in the background and posts data back to the main app when finished.

//When the worker receives a message, if calculates the heatmap
//e.data contains board,pieceData,currentSolutions and boardLayout

onmessage = function(e) {

  data=e.data;
  
  var board=data['board'];
  var pieceData=data['pieceData'];
  var currentSolutions=data['currentSolutions'];
  var boardLayout=data['boardLayout'];
  
	var heatmap=[];
	var datamap=[];
	
	for (var r in board){
		heatmap[r]=[];
		datamap[r]=[];
		for (var c in board[r]){
			heatmap[r][c]=0;
			datamap[r][c]=0;
			
			if (board[r][c]) continue; //occupied or blocked position
			
			var possibilities=tryToCover(board,pieceData,currentSolutions,r,c,true);
			
			datamap[r][c]=possibilities;
			
			var stat={};
			stat.all=0;
			stat.sensible=0;
			stat.solutions=0;
			
			for (var p in possibilities){
				var poss=possibilities[p];
				stat.all++;
				if (poss.solution) stat.solutions++;
				if (!poss.unsolvable) stat.sensible++;
			}
			
			if (currentSolutions.length){
				if (stat.all==0) heatmap[r][c]=-2;
				else if (stat.all==1 && stat.solutions==1) heatmap[r][c]=9;
				else if (stat.sensible==1 && stat.solutions==1) heatmap[r][c]=8;
				else if (stat.sensible && stat.all==stat.solutions) heatmap[r][c]=7;
				else if (stat.sensible && stat.sensible==stat.solutions) heatmap[r][c]=6;
				else if (stat.sensible && stat.sensible-stat.solutions==1) heatmap[r][c]=5;
				else if (stat.sensible && stat.sensible-stat.solutions==2) heatmap[r][c]=4;
				else if (stat.sensible && stat.sensible-stat.solutions==3) heatmap[r][c]=3;
				else if (stat.sensible && stat.sensible-stat.solutions==4) heatmap[r][c]=2;
				else heatmap[r][c]=1;
			} else { //not solvable
				heatmap[r][c]=-1;
				if (stat.all==0) heatmap[r][c]=-2;
			}
			
			//9  only one possibility and solution
			//8  only one sensible and solution
			//7  all possibles are solutions
			//6  all sensibles are solutions
			//5  1 sensible nonsolution
			//4  2 sensible nonsolutions
			//3  3 sensible nonsolutions
			//2  4 sensible nonsolutions
			//1  unknown
			//0  occupied
		}
	}

	//the neighbordMap is an additional map in addition to the heatmap
	//it determines those positions on the board, which are in edges
	//is used to determine among those interesting on the heatmap
	//which to point to.
	var neighborsMap=getNeighbors(board,boardLayout);

	//relay data back to the hinter
	
	//heatmap is map of the board indicating for each position how ambiguous it is
	//datamap contains all possibilities for every position
	//neighorsMap is a map indicating for each position how many neighbors it has

	postMessage([heatmap,datamap,neighborsMap]);
  
}

//try to cover a certain position on the board
function tryToCover(board,pieceData,currentSolutions,ir,ic){
	
	ir=ir*1;ic=ic*1; //assure the data are numbers

	var pieces={};
			
	for (var name in pieceData){
		var candidate=pieceData[name];
		var sstrings=candidate.states; //provided by hinter
 		var states=[];
		
		for (var j in sstrings){
			var sstring=sstrings[j];
			
			var bm=[];
			for (var r=0;r<5;r++){
				if (!bm[r]) bm[r]=[];
				for (var c=0;c<5;c++){
					var p=r*5+c;
					bm[r][c]=sstring[p];
				}
			}

			states[j]=bm;
			
		}
		
		pieces[name]=states;
	}
	
	//now we have a datastructure for every piece in the tray with every state as its bitmap
	
	//now we try to position it in every free position
	
	var poss=[];
	
	if (board[ir][ic]) return; //board is occupied at position
	
	function isFree(row,col){ 
		var r=board[row];
		if (r==undefined) return false;
	    if (board[row][col]=="") return true;
	    return false;
	}
	
	//6 nested for loops now ;-)
	
	for (var pieceName in pieces){      //try every piece
		var states=pieces[pieceName];
		for (var s in states){          //in every rotation and flip state
			var state=states[s];

			for (var dr=-4;dr<5;dr++){
				for (var dc=-4;dc<5;dc++){		//offsetting 5x5 over the checked position
					
					var failed=false;
					var contains=false;
					var covers=[]; //will contain all positions a piece would cover
											
					for (var pr=0;pr<5;pr++){		//checking the whole 5x5 state
						if (failed) break;
						
						for (var pc=0;pc<5;pc++){
							if (failed) break;
							
							var row=ir+dr+pr;var col=ic+dc+pc;
							
							if (state[pr][pc]!="1") {   // we skip those fields in the array where a piece not actually is
								continue;
							} 
							
							// now we are in a situation where the pice IS
							
							if (!isFree(row,col)) {
								failed=true;
							} else {
								if (row==ir&&col==ic) contains=true;
								covers.push([row,col]);
							}
							
						}
					}
					
					if (!failed && contains) { // if it has not failed and the field is covered, 
											   // a piece can cover a field
						
						//check for obviously unsolvable
						
						var unsolvable=!!fiveProblem(board,state,ir+dr,ic+dc);
								   			   
						//check if a possibility is also part of a solution
						//for performance reasons only check if, do not count
						
						var isSolution=false;
						
						for (var sol in currentSolutions){
							var solution=currentSolutions[sol];
							
							var hits=0;
							for (var c in covers){
								var position=covers[c];
								if (pieceName==solution[position[0]][position[1]]) hits++;
							}
							if (hits==5) {
								isSolution=true;
								break;
							}
						}
						
						poss.push({'pieceName':pieceName,'state':s,'position':[ir+dr+2,ic+dc+2],'solution':isSolution,'unsolvable':unsolvable});
					}				
				}
			}
		}
	}
	
	return poss;
}


//check for areas not dividable by 5;
//if piece is specified, it is added to the board for checking
//piece is bitmap state of a piece
//r,c are top left coordinates
function fiveProblem(b,piece,row,col){
	
	if (piece){ //if a piece is provided,place it onto the board
	
		//create a deep copty of the board array;
		
		var board=[];
		for (var r in b){
			board[r]=[];
			for (var c in b[r]){
				board[r][c]=b[r][c];
			}
		}		
	
		for (var r=0;r<5;r++){
			for (var c=0;c<5;c++){
				if (piece[r][c]=="1") board[row+r][col+c]="1";
			}
		}
	} else { //in the case nothing is to be added, we use the board provided
		board=b;
	}
	
	var that=this;
	var fillTemp={};
	
	function fill(r,c){ //internal function
	
		if (board[r][c]) return[]; //occupied;
	
		if (fillTemp[r+'_'+c]) return fillTemp[r+'_'+c];
		
		var temp={};
		temp.i=0;
		function f(r,c){
			
			if (temp.i>=10) return;
			if (r<0||c<0||r>=board.length||c>=board[0].length) return; //out of board
			if (board[r][c]) return; //position is occupied or blocked
		
			board[r][c]='Ö'; //mark it
			
			temp.i++;
			
			f(r*1+1,c);f(r*1-1,c);f(r,c*1+1);f(r,c*1-1); //recursion
		}
		
		f(r,c);
		
		var result=[];
		
		//count the numbr of Ö on the board whule removing them;
		for (var i in board){
			for (var j in board[0]){
				if (board[i][j]=='Ö') {
					result.push(i+'_'+j);
					fillTemp[i+'_'+j]=result;
					board[i][j]='';
				}
			}
		} 

		return result; //the size of the fill. Will be checked for %5
		
	}
	
	var results=[];     //determine all areas which have a %5 problem
	for (var r in board){
		for (var c in board[0]){
			var f=fill(r,c);

			if (f.length%5) {
				return true;	//if %5>0 means there is a rest, so the area is not dividable by 5
			}
		}
	}
	
	return false;
	
}

//determine for every free position on the board how many free neigbours it has
function getNeighbors(board,boardLayout){

	var heatMap=[];
	
	function isEmpty(r,c,boardLayout){
		
		if (r<0) return 0;
		if (c<0) return 0;
		if (r>=board.length) return 0;
		if (c>=board[0].length) return 0;
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
