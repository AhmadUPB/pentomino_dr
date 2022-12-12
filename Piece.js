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

/** Model/Data for the pieces (Backend) */
class Piece {
	
 constructor(type, game){
 	
 	//convenience 
 	this.Game=game;
 	
 	if (!type) type='';
 	
 	type=type.toUpperCase();
 	this.name=type;
 	
 	//every piece has its shape as a bitmap and other
 	//properties describing its presentation
 	switch (type){
 		
		case 'F':this.trayPosition=0;
				 this.color='var(--piece-f-color)';
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,0,1,1,0],
                 [0,1,1,0,0],
                 [0,0,1,0,0],
                 [0,0,0,0,0]
                ]; break;

 		case 'I':this.trayPosition=1;
				 this.color='var(--piece-i-color)'; 		
 				 this.bitMap=[
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0]
                ]; break;

 		case 'L':
 				 this.trayPosition=2;
				 this.color='var(--piece-l-color)'; 		
 				 this.bitMap=[
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,0,1,1,0],
                 [0,0,0,0,0]
                ]; break;N
 		case 'N':
 				 this.trayPosition=3;
				 this.color='var(--piece-n-color)'; 		
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,1,1,0,0],
                 [0,1,0,0,0]
                ]; break;

 		case 'P':
 				 this.trayPosition=4;
				 this.color='var(--piece-p-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,0,1,1,0],
                 [0,0,1,1,0],
                 [0,0,1,0,0],
                 [0,0,0,0,0]
                ]; break;

 		case 'T':
 				 this.trayPosition=5;
				 this.color='var(--piece-t-color)'; 	
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,1,1,1,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0],
                 [0,0,0,0,0]
                ]; break;

 		case 'U':this.trayPosition=6;
				 this.color='var(--piece-u-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,1,0,1,0],
                 [0,1,1,1,0],
                 [0,0,0,0,0],
                 [0,0,0,0,0]
                ]; break;
                
 		case 'V':this.trayPosition=7;
				 this.color='var(--piece-v-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,1,0,0,0],
                 [0,1,0,0,0],
                 [0,1,1,1,0],
                 [0,0,0,0,0]
                ]; break;
                
 		case 'W':this.trayPosition=8;
				 this.color='var(--piece-w-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,1,0,0,0],
                 [0,1,1,0,0],
                 [0,0,1,1,0],
                 [0,0,0,0,0]
                ]; break;

 		case 'X':this.trayPosition=9;
				 this.color='var(--piece-x-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,0,1,0,0],
                 [0,1,1,1,0],
                 [0,0,1,0,0],
                 [0,0,0,0,0]
                ]; break;

 		case 'Y':this.trayPosition=10;
				 this.color='var(--piece-y-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,0,1,0,0],
                 [0,0,1,1,0],
                 [0,0,1,0,0],
                 [0,0,1,0,0]
                ]; break;

 		case 'Z':this.trayPosition=11;
				 this.color='var(--piece-z-color)'; 
 				 this.bitMap=[
                 [0,0,0,0,0],
                 [0,1,1,0,0],
                 [0,0,1,0,0],
                 [0,0,1,1,0],
                 [0,0,0,0,0]
                ]; break;

         default:this.trayPosition=-1;
				 this.color='#ff0000';         
 				 this.name='ERROR';
                 this.bitMap=[  //here we should never get
                 [1,1,1,1,1],
                 [1,1,1,1,1],
                 [1,1,1,1,1],
                 [1,1,1,1,1],
                 [1,1,1,1,1]
                ];	
 	}
 	
 	//positioning information.
 	//Upon creation, pieces are in the tray
 	
 	this.inTray=true;
 	this.position=false;
 	
 	//save all bitmap variants. This is necessary for saving states.
 	//with stateToId, the index of an id can be determined
 	//with idToState, the state(rotation, flip) variant of a id can be determined
	//needed for loading and saving
 	
 	this.stateToId={};
 	this.idToState=[];
 	
 	//the unrotated state
 	this.stateToId[this.getBitmapString()]=this.bitMap;
 	
 	//the rotated state
 	var bm=[[],[],[],[],[]];
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){  		
  		   let newRow=col;let newCol=4-row; 
  		   bm[newRow][newCol]=this.bitMap[row][col];
  		}
  	}
  	this.stateToId[this.getBitmapString(bm)]=bm;
  	
  	//horizontally flipped
  	for(var i in this.stateToId){
  		var inBm=this.stateToId[i];
  		var bm=[[],[],[],[],[]];
  	
	  	for (let row=0;row<5;row++){
	  		for (let col=0;col<5;col++){
	  		   let newRow=row;let newCol=4-col;
	  		   bm[newRow][newCol]=inBm[row][col];
	  		}
	  	}
		this.stateToId[this.getBitmapString(bm)]=bm;
  		
  	}
  	
  	//vertically flipped
  	for(var i in this.stateToId){
  		var inBm=this.stateToId[i];
  		var bm=[[],[],[],[],[]];
  	
	  	for (let row=0;row<5;row++){
	  		for (let col=0;col<5;col++){
	  		   let newRow=4-row;let newCol=col;
	  		   bm[newRow][newCol]=inBm[row][col];
	  		}
	  	}
		this.stateToId[this.getBitmapString(bm)]=bm;
  		
  	}
  	
  	//now update the two data structures so they reflect each other
  	var id=0;
  	for(var state in this.stateToId){
  		
  		this.stateToId[state]=id;
  		this.idToState[id]=state;
  		
  		id++;
  	}
 	
  }
  
  //get the bitMap of the piece as a string
  getBitmapString(bm){
  	
  		if (!bm) bm=this.bitMap;
 		var out='';
 		for (var r in bm){for (var c in bm[r]){out+=bm[r][c];}}
 		return out;
 	}
  
  //gets the bitmap state of the current bitmap
  getBitmapState(){
  	return this.stateToId[this.getBitmapString()];
  }
  
  //getStates
  getStates(){
  	return this.idToState;
  }
  
  //called on all manipulation functions. Saves the game state to local storage.
  memorize(what){
  	this.Game.memorize(this,what);
  }
  
  //function to set the bitmap to a certain state
  //TODO: check where this is acutally used and update descripts accordingly
  loadState(id){
  	
  	var state=this.idToState[id];
  	
  	var output=[[],[],[],[],[]];
  	
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){
  			var p=row*5+col;
  			output[row][col]=state[p]*1;
  		}
  	}
  	
  	this.bitMap=output;
  	
  	this.Game.updateVisu(this);
  	this.Game.evaluator.checkTheBoard();
  	
  }
  
  //Rotation and flipping functions: Create a new bitmap by processing the old one
  
  rotateRight(){
  	
  	var output=[[],[],[],[],[]];
  	
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){  		
  		   let newRow=col;let newCol=4-row;  // this line is different in all the following functions
  		   output[newRow][newCol]=this.bitMap[row][col];
  		}
  	}
  	
  	this.bitMap=output;
  	
  	this.Game.updateVisu(this);
  	this.Game.evaluator.checkTheBoard();
  	
  	this.memorize('shape');
  	
  	return this;
  }
  
  rotateLeft(){
  	
  	var output=[[],[],[],[],[]];
  	
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){
  		   let newRow=4-col;let newCol=row;
  		   output[newRow][newCol]=this.bitMap[row][col];
  		}
  	}
  	
  	this.bitMap=output;
  	
  	this.Game.updateVisu(this); // inform the frontend about changes (repainting the piece)
  	this.Game.evaluator.checkTheBoard(); // let the evaluator handle the new situation
  	
  	this.memorize('shape');
  	
  	return this;
  }
  
  turn(){
  	
  	var output=[[],[],[],[],[]];
  	
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){
  		   let newRow=4-row;let newCol=4-col; 		   
  		   output[newRow][newCol]=this.bitMap[row][col];
  		}
  	}
  	
  	this.bitMap=output;
  	
  	this.Game.updateVisu(this);
  	
  	this.Game.evaluator.checkTheBoard();
  	
  	this.memorize('shape');
  	
  	return this;
  }
  
  flipH(){
  	
  	var output=[[],[],[],[],[]];
  	
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){
  		   let newRow=row;let newCol=4-col;
  		   output[newRow][newCol]=this.bitMap[row][col];
  		}
  	}
  	
  	this.bitMap=output;
  	
  	this.Game.updateVisu(this);
  	this.Game.evaluator.checkTheBoard();
  	
  	this.memorize('shape');
  	
  	return this;
  }
  
  flipV(){
  	
  	var output=[[],[],[],[],[]];
  	
  	for (let row=0;row<5;row++){
  		for (let col=0;col<5;col++){
  		   let newRow=4-row;let newCol=col;
  		   output[newRow][newCol]=this.bitMap[row][col];
  		
  		}
  	}
  	
  	this.bitMap=output;
  	
  	this.Game.updateVisu(this); 
  	this.Game.evaluator.checkTheBoard();
  	
  	this.memorize('shape');
  	
  	return this;	
  	
  }
    
  /** place a pice onto a position within the game grid or within the board 
  
  @x The x-position of the piece (a.k.a the column)
  @y The y-position of the piece (a.k.a the column)
  @board if a board data structure is provided here (e.g. from evaluator), the placement is carried out in relation to the board stead of the while game grid

  */
  place(x,y,board){

	if (isNaN(x) || isNaN(x) ){
		console.error('Invalid coordinates ',x,y);
		return;
	}
  	
  	let position=[x,y];
  	
  	if (board) { 
  		var ox=this.Game.boardX;
  		var oy=this.Game.boardY;
  		position=[x+ox,y+oy];
  	}
  	
  	this.inTray=false;
  	this.position=position;
  	
  	this.Game.updateVisu(this); //inform the frontend about changes
  	this.Game.evaluator.checkTheBoard(); //let the evaluator check the situation
  	
  	this.memorize('position');
  	
  	return this;
  }
  
  //remove pieces from the game grid and put it back into the tray
  toTray(){
  	
  	this.inTray=true;
  	this.position=false;
  	
  	this.Game.updateVisu(this); //inform the frontend about changes
  	this.Game.evaluator.checkTheBoard(); //let the evaluator check the situation
  	
  	this.memorize('position');
  	
  	return this;
  }
  
  //for convenience. Allows elements to be selected from here
  select(){	
  	this.Game.pd.visual.setSelection(this);
  }

  //for debug puporsed in order to be able to log piece objects easily
  toString(){
  	let out=this.name;
  	
  	if (this.inTray) {
  		out+=' in tray';
  	} else {
  		out+=' on '+this.position;
  	}
  	
  	return out;
  }
  

}
