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

/** Hinter - The Logic and UI for helping and hinting functionality */
class Hinter{
	
	constructor(pd){
		
		this.pd=pd;

		this.heatMap=false; // store that latest heatMap for later use
		this.possibilities=false;

		this.hintFunction=function(){} //the function which is called when clicking on the hint button

		if (pd.config.autopilot) this.autoPilot();
		
	}
	
	/** translate - for convenience*/
	translate(text,args){
		return this.pd.translate(text,args);
	}
	
	/** information - Here the hinter receives messages from the evaluator or from user interaction
	@catagory What kind of information is it?
	@data What type of data is it (may also already be the data itself in some cases)
	@dataA The value (e.g. which piece causes a problem)
	@dataB The value (e.g. which piece causes a problem)
	*/
	information(category,data,dataA,dataB){

		var that=this;
		
		if (category=='clear'){   //last information is not valid any more
			this.clearHint();
			this.removeIndications();
			this.hintFunction=function(){};
			return;
		}
		
		if (category=='numberOfSolutions'){  //update on number of solutions

			this.log(this.translate('LABEL_SOLUTIONS')+': '+data);

			var visHint='';

			if (this.pd.config.solnumber) visHint+=this.translate('LABEL_SOLUTIONS')+': '+data;
			if (this.pd.config.solnumber && this.pd.config.hint) visHint+=' – ';
			if (this.pd.config.hint) visHint+=this.translate('CLICK_FOR_HELP');

			this.hint(visHint);
			
			if (data==0) {
				this.hint(this.translate('PROBLEM_UNSOLVABLE'),true);
			} 

			return;
		}
		
		if (category=='placementProblem'){  //there is a problem with placement

			switch(data){
				case 'overlapping': //pieces overlap
					//determine, which object is overlapping the other
					var AzIndex=dataA.zIndex||0;
					var BzIndex=dataB.zIndex||0;

					if (AzIndex>BzIndex){ //and act upon it
						//this.shake(dataA);
						this.offset(dataA);
						this.hint(this.translate('PROBLEM_'+data,[dataA.name,dataB.name]),true);
					} else {
						//this.shake(dataB);
						this.offset(dataB);
						this.hint(this.translate('PROBLEM_'+data,[dataB.name,dataA.name]),true);
					}
				break;
				case 'partial': //piece only partly on board
					//this.shake(dataA);
					this.offset(dataA);
					this.hint(this.translate('PROBLEM_'+data,[dataA]),true);
				break;
			}
			return;
		}

		if (category=='congratulations'){	//board finished       TODO: do something more fancy here!
			window.setTimeout(function(){
				that.hint(that.translate('CONGRATULATIONS'));
			},100);
			return;
		}

		if (category=='removeSuggestion'){  //pieces have to be removed to stay solvable
			this.setHint(this.translate('SUGGEST_REMOVAL')+': '+data.join(' '+this.translate('OR')+' '),true,false);
			return;
		}
		
		if (category=='suggestion'){	//information about the current board state, suggestions for every position
			switch (data){
				case 'possibilities':					
					
					if (dataA){
						this.heatMap=dataA[0];
						this.possibilities=dataA[1];
						this.neighborsMap=dataA[2];
					} else {
						this.heatMap=[];
						this.possibilities=[];
						this.neighborsMap=[];
					}
					
					this.evaluateBoardPositions();	//here the informatio is acted upon
					
					return;
			}
		}
		
		console.log('Hinter did not understand',category,data,dataA,dataB);
		
	}

	//react upon evaluation of boardPositions (done in EvaluationWorker)
	evaluateBoardPositions(){

		if (this.heatMode) this.showHeatMap(); 

		if (this.heatMap.length==0) return;

		//Go through the heatmap and evaluate the current board in order to create hints.

		//Meaning of values in the heatmap

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
		//-1 unsolvable
		//-2 noncoverable
		
		//Strategy:

		//If 8 or 9 present - Indicate that nonambiguous position exists, indicate where it is, indicate which piece
		//If 7 or 6 present - Indicate position where everything fits, indicate which pieces
		//If 5 present - Indicate position where everything but one fits and which pices does not fit 
		//If -2 - Indicate noncoverable, indicate where it is
		//Otherwise - Suggest autopositioning

		var unambp=[];
		var unamb=[];
		var all=[];
		var minus1=[];
		var unsolvable=false;
		var uncov=[];
		var unambiguousPieces={};

		for (var r in this.heatMap){
			for (var c in this.heatMap[r]){
				var neighbors=this.neighborsMap[r][c];
				var data=[r,c,neighbors];

				var value=this.heatMap[r][c];

				//collect, which pieces can already be positioned automatically (those which cover fields with 8 or 9)
				if (this.heatMap[r][c]>=8) {
					for (var p in this.possibilities[r][c]){
						if (this.possibilities[r][c][p].solution) unambiguousPieces[this.possibilities[r][c][p].pieceName]=true;
					}
				}

				switch (value){
					case 9: unambp.push(data); continue;
					case 8: unamb.push(data); continue;
					case 7:
					case 6: all.push(data); continue;
					case 5: minus1.push(data); continue;
					case -1: unsolvable=true; continue;
					case -2: uncov.push(data); continue;
				}
			}
		}

		unambiguousPieces=Object.keys(unambiguousPieces);
		
		if (unambiguousPieces.length) {			
			this.log(this.translate('UNAMBIGOUS_PIECES')+unambiguousPieces);
			//TODO: Do something sensible with it
		} 

		var that=this;

		//Depending on the situation, set the appropriate hint and register the appropriate hint-function

		if (unambp.length){
			this.setHint(this.translate('SUGGEST_NONAMBIGUOUSP'),false,function(){that.indicate(minNeighbors(unambp),'✓');});			
		} else if (unamb.length) {
			this.setHint(this.translate('SUGGEST_NONAMBIGUOUS'),false,function(){that.indicate(minNeighbors(unamb),'✓');});
		} else if (all.length) {
			this.setHint(this.translate('SUGGEST_ALLFIT'),false,function(){that.indicate(minNeighbors(all),'+');});
		} else if (minus1.length) {
			this.setHint(this.translate('SUGGEST_MINUS1'),false,function(){that.indicate(minNeighbors(minus1),'o');});
		} else if (uncov.length){
			this.setHint(this.translate('SUGGEST_UNCOVERABLE'),true,function(){that.indicate(uncov,'X');});
		} else if (unsolvable) { //this hint is set in removeSuggestion above. Do nothing here
		} else {
			this.setHint(this.translate('SUGGEST_HINT'),false,function(){that.autoPlace();});
		}
		
		//takes a list of board positions and returns a filtered list
		//containing only those elements with the lowest number of neighbors
		//as this is the most interesting for hints
		function minNeighbors(inList){
			var min=9;
			var list=[];

			for (var i in inList){
				var element=inList[i];
				var row=element[0];
				var col=element[1];
				var value=element[2];

				if (value>min) continue;

				if (value<min) {min=value; list=[];}

				list.push(element);
			}

			return list;
		}
	}
	
	//colorize the board according to current heatmap data
	showHeatMap(){

		this.pd.hinter.heatMode=true;
		
		//fill legend TODO: move to visual?
		
		var legend=document.getElementById('legend');
		
		var code='';
		code+='<table>';
		code+='<tr><td class="LEGEND_SINGLE_FIT">'+this.translate('LEGEND_SINGLE_FIT')+'</td></tr>';
		code+='<tr><td class="LEGEND_SENSIBLE_FIT">'+this.translate('LEGEND_SENSIBLE_FIT')+'</td></tr>';
		code+='<tr><td class="LEGEND_ALL_SENSIBLES_FIT">'+this.translate('LEGEND_ALL_SENSIBLES_FIT')+'</td></tr>';
		code+='<tr><td class="LEGEND_ONE_NONFITTING">'+this.translate('LEGEND_ONE_NONFITTING')+'</td></tr>';
		code+='<tr><td class="LEGEND_NOT_SOLVABLE">'+this.translate('LEGEND_NOT_SOLVABLE')+'</td></tr>';
		code+='<tr><td class="LEGEND_NOT_COVERABLE">'+this.translate('LEGEND_NOT_COVERABLE')+'</td></tr>';
		code+='</table>';
		
		legend.innerHTML=code;

		if (!this.heatMap.length) return this.pd.visual.noHeatMap(); // blank in case the is no heatmap data yet
		
		for (var r in this.heatMap){
			for (var c in this.heatMap[0]){
				this.pd.visual.heatMapBoard(r,c,this.heatMap[r][c]);
			}
		}
		
	}

	//turn heatmap off
	noHeatMap(){
		this.pd.hinter.heatMode=false;
		this.pd.visual.noHeatMap();
	}

	autoPlace(){

		if (this.pd.config.suggestMode==1) return this.hypothesisPlace();
		if (this.pd.config.suggestMode==0) return this.distancePlace();
	}
	
	hypothesisPlace(){
		return this.pd.evaluator.hypothesisPlace();
	}

	/* place pieces in a distance to existing pices*/
	distancePlace(){
		
		//mainly calls the evaluator function of the same name
		//if a piece cannot be positioned in distance
		//step by step increase the number of allowed
		//touches
		
		for (var i=1;i<12;i++){
			if (this.pd.evaluator.distancePlace(i)) return;
		}
	}
	
	/** functions which allow the hinter to highlight a piece */
	
	shake(piece){
		this.pd.visual.highlight(piece,10,'shake');
	}

	offset(piece){
		this.pd.visual.highlight(piece,10,'offset');
	}
	
	pulse(piece){
		this.pd.visual.highlight(piece,5,'pulse');
	}
	
	glow(piece){
		this.pd.visual.highlight(piece,1,'glow');
	}
	
	blink(piece){
		this.pd.visual.highlight(piece,10,'blink');
	}

	indicate(list,letter){

		if (!letter) letter='X';

		for (var i in list){
			var coordinates=list[i];
			this.pd.visual.indicate(coordinates[0],coordinates[1],letter);
		}
	}

	removeIndications(){
		this.pd.visual.removeIndications();
	}
	
	blinkBoard(coordinates,speed,color){
		
		if(!speed) speed=0.1;
		if(!color) color='red';
		
		if (coordinates.split) coordinates=coordinates.split('_');
		this.pd.visual.highlightBoard(coordinates[0],coordinates[1],speed,color);
	}
	
	/** send a certain piece to the tray**/
	toTray(piece){
		this.pd.game.get(piece).toTray();
	}
	
	//Logging for debug purposes
	log(text,a,b,c){
		return pd.ui.log(text,a,b,c);
	}

	//put a hint into the hint section at the bottom of the screen
	hint(text, isProblem){

		var element=document.getElementById('hint');

		element.style.display='none'; // Bug in browsers (or whereever. Sometimes status did not appear!)

		setTimeout(function(){
			var html=text;
			element.className=(isProblem)?'problem':'normal';
			element.innerHTML=html;
			element.style.display='block';
		},100);
	}

	//clear all hint data;
	clearHint(){
		this.hintStage=0;
		this.hintText='';
		this.hintIsProblem=false;
	}

	/**
	 * set the hint data for the two stage hinting
	 * @param {*} text The text of the first hint
	 * @param {*} isProblem Set to true if the first hint describes a problem
	 * @param {*} secondStage A function handling the second state of the hint
	 */
	setHint(text,isProblem,secondStage){
		this.hintStage=0;
		this.hintText=text;
		this.hintIsProblem=isProblem;
		this.hintFunction=secondStage;
	}

	//hintRequest is called by the user interface when the hint button is clicked
	//
	//activates hints in two steps. The first one being a textual hint, the second one
	//being a function which can, for example, highlight areas on the board
	//(the respective data is set in setHint)
	hintRequest(level){
		
		this.hintStage++;
		if (this.hintStage==1) this.hint(this.hintText,this.hintIsProblem);
		if (level==2 && this.hintStage==2 && this.hintFunction) this.hintFunction();;
	}

	//autopilot makes the hinting kind of proactive giving indications without ever asking
	autoPilot(){
		var that=this;

		if (this.autopilot) {
			clearInterval(this.autopilot);
			this.autopilot=false;
		} else {
			this.autopilot=setInterval(function(){
				that.hintRequest(this.pd.config.hint);
			},500);
		}
	}
	
}