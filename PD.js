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

/** PentominoDigital. Create the necessary structures and connect them with each other */
class PD{

	constructor(){

		this.translations={};
		
		var that=this;

		//get the configurations from URL and parse it to configuration
		//standard values are configured in config.js
		let params = (new URL(document.location)).searchParams;

		this.config={};

		for (var section in PentominoConfig){
			for (var variable in PentominoConfig[section]){
				var value=PentominoConfig[section][variable].standard;
				configParam(variable, value);
			}
		}

		//Language handling. If not specified, get it from browser spec

		if (!this.config.language) {
			switch(navigator.language.substring(0,2)){
				case 'de': that.config['language']='de'; break;
				default: that.config['language']='en'; break;
			}

		}
		
		function configParam(name,standard){

			//standard is the value from main configuration (config.js)

			//look if there is an AddConfig and if so, overwrite standard
			if (window.AddConfig && window.AddConfig[name]!==undefined) {
				standard=window.AddConfig[name];
				console.log('setting',name,window.AddConfig[name]);
			}

			var param=params.get(name);
			if (param==1*param) param=1*param; //convert to int if possible

			that.config[name]=(params.get(name)!==null)?param:standard;
		}

		this.loadTranslations(function(){

			that.ui=new UI(that);
			that.evaluator=new Evaluator(that);
			that.hinter=new Hinter(that);
			that.game=new Game(that);
			that.visual=new Visual(that);
			
			window.evaluator=that.evaluator;
			window.hinter=that.hinter;
			
		}); 

		//web worker for cache control
		if ('serviceWorker' in navigator) {

			if (this.config.nocache){ //https://stackoverflow.com/questions/33704791/how-do-i-uninstall-a-service-worker

				navigator.serviceWorker.getRegistrations().then(function(registrations) {
				for(let registration of registrations) {
					registration.unregister();
				} });

			} else {
				if (this.config.registerCache) navigator.serviceWorker.register('serviceworker.js.php');
			}
		}
		
		
	} //constructor
	
	loadTranslations(afterwards){

		var that=this;
			
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load",function(){
			
			var text=this.responseText.split('\n'); //get the file line by line
			
			that.translations={};
			
			for (var i in text){
				var line=text[i];
				
				if (!line.includes('::')) continue; // ignore all lines which are no translations

				line=line.split('::');				
				that.translations[line[0]]=line[1];
				
			}
			
			if (afterwards) afterwards.call(that);
			
		});

		oReq.open("GET", 'translations/'+this.config.language+'.txt');
		oReq.send();
		
	}
	
	translate(text,args){
		
		//return the translation from tranlation array
		if (this.translations[text]) {
			
			var translation=this.translations[text];
			
			if (args){
				for (var i=0;i<args.length;i++){
					var value=args[i];
					translation=translation.replace('%'+(i+1),value);
				}
			}
			
			return translation;
		}
	
		//in case no translation has been found
		console.log('Missing translation in '+this.config.language+' for '+text);
		return text;
	}
	
}