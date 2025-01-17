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
		addDiv('documentroom');
		addDiv('legend');

		//set all buttons to the state they are in at loading time
		setTimeout(function(){
			that.updateHeatButton();
		},10);
		// define Konva Stage for Annotation Mode in Play Room
		this.stageWidth=window.innerWidth-(7*window.innerWidth/100); //7: function-area-width, tray-height
		this.stageHeight=window.innerHeight-(7*window.innerHeight/100);
		this.stage = new Konva.Stage({
			container: 'stageContainerPR',
			width: this.stageWidth,
			height: this.stageHeight,
		});
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);
		this.loadDRpics();
		this.windowWidth=window.innerWidth;
	}

    addDiv(id,parent,after){
			if (!parent) parent=document.getElementsByTagName('body')[0];

			var div = document.createElement("div");
			div.id=id;
			parent.appendChild(div);

			if (after) after.call(this,div);
	}
    // load images that used in building the screenshots and cache them
    // Cloned copies of them are used to draw the screenshots in Document Room(pereformance tip)
    loadDRpics() {
        //based on: //https://konvajs.org/docs/shapes/Image.html
        let imageObj1 = new Image();
        imageObj1.onload = function () {
            let snowflake = new Konva.Image({
                image: imageObj1,
                listening: false,
                perfectDrawEnabled: false,
                shadowForStrokeEnabled: false,
            });
            snowflake.cache();
            DocumentDR.cashedSnowflake = snowflake;
        };
        imageObj1.src = './ico/freeze.png';

        let imageObj2 = new Image();
        imageObj2.onload = function () {
            let checkMark = new Konva.Image({
                image: imageObj2,
                listening: false,
                perfectDrawEnabled: false,
                shadowForStrokeEnabled: false,
            });
            checkMark.cache();
            DocumentDR.cashedCheckMark = checkMark;
        };
        imageObj2.src = './ico/dr_check.png';
    }

    openDocumentRoom() {
        this.documentRoomOpened = true;
        let that = this;
        let documentroom = document.getElementById("documentroom");
        documentroom.style.display = 'block';
        documentroom.innerHTML = '<div id="documentroom_header"><h1>' + this.translate('HEADING_DOCUMENT_ROOM') + '</h1>' + '<img onclick="pd.ui.closeDocumentsRoom();" src="./ico/dr_close.png">' +
            '</div><div id="documentroom_toolbar">' +
            '</div>' + '<div id="DRbackground"><p>' + this.translate('STATUS_WAIT') + '</p>></div>' + '<div id="documentroom_content"><div id="scroll-container">' + '<div id="large-container"><div id="DRcontainer"></div> </div></div>' + '</div>'

        var oReqDocs = new XMLHttpRequest();
        oReqDocs.addEventListener("load", function () {
            let documentRoomData = this.responseText.split('%');
            let rectangles = documentRoomData[0];
            let arrows = documentRoomData[1];
            let labels = documentRoomData[2];
            let documents = documentRoomData[3].split('¤');


            // compute the adequate Konva stage dimensions to suffice all documents
            let documentWidth = that.pd.visual.cssConf('document-width');
            let documentHeight = that.pd.visual.cssConf('document-height');
            let numberDocumentsInRow = (Math.floor(95 / (documentWidth + 2.5)));
            let rowsNumber = Math.ceil((documents.length - 1) / numberDocumentsInRow);
            let numberDocumentsInLastRow = (documents.length - 1) % numberDocumentsInRow;
            let startOfLeftMargin = (100 - ((Math.floor(95 / (documentWidth + 2.5))) * (documentWidth + 2.5))) / 2;
            that.DRDocumentDefaultY = (rowsNumber - 1) * (documentHeight + 2.5) + 2.5;
            if (numberDocumentsInLastRow !== 0) that.DRDocumentDefaultX = startOfLeftMargin + (numberDocumentsInLastRow - 1) * (documentWidth + 2.5);
            else that.DRDocumentDefaultX = startOfLeftMargin + (numberDocumentsInRow - 1) * (documentWidth + 2.5);
            that.DRStageHeight = that.DRDocumentDefaultY + documentHeight + 2.5 + 2.5;
            if (that.DRStageHeight / 100 * window.innerWidth < window.innerHeight - (6 / 100 * window.innerWidth) - 22) that.DRStageHeightPX = window.innerHeight - (6 / 100 * window.innerWidth) - 22
            else that.DRStageHeightPX = that.DRStageHeight / 100 * window.innerWidth;

            //Initialize stage and layers, build the scrolling functionality
            // based on https://konvajs.org/docs/sandbox/Canvas_Scrolling.html
            let largeContainer = document.getElementById('large-container')
            largeContainer.style.width = (window.innerWidth - 22) + "px";
            largeContainer.style.height = that.DRStageHeightPX + "px";
            let scrollContainer = document.getElementById('scroll-container')
            let scrollContainerHeight = window.innerHeight - (6 / 100 * window.innerWidth) - 22;
            scrollContainer.style.height = scrollContainerHeight + "px";
            that.PADDING = 500;
            that.DRstage = new Konva.Stage({
                container: 'DRcontainer',
                width: (window.innerWidth - (0 / 100 * window.innerWidth)) + that.PADDING * 2,
                height: window.innerHeight - (6 / 100 * window.innerWidth) + that.PADDING * 2,
            })
            that.DRlayerShapes = new Konva.Layer();
            that.DRlayerDocuments1 = new Konva.Layer();
            that.DRlayerDocumentsDragging = new Konva.Layer();
            that.DRlayerLabels = that.DRlayerDocumentsDragging;
            that.DRstage.add(that.DRlayerShapes, that.DRlayerDocuments1, that.DRlayerDocumentsDragging);

            function repositionStage() {
                let dx = scrollContainer.scrollLeft - that.PADDING;
                let dy = scrollContainer.scrollTop - that.PADDING;
                that.DRstage.container().style.transform =
                    'translate(' + dx + 'px, ' + dy + 'px)';
                that.DRstage.x(-dx);
                that.DRstage.y(-dy);
            }

            scrollContainer.addEventListener('scroll', repositionStage);
            repositionStage();


            // draw Document Room content
            DocumentDR.createCashedElements(that.pd);
            for (let i in documents) {
                if (!documents[i]) continue;
                else that.drawDocument(documents[documents.length - i], scrollContainer);
            }
            pd.game.setTextStateDR(labels);
            pd.game.setRectangleStateDR(rectangles);
            pd.game.setArrowStateDR(arrows);

        });
        oReqDocs.open("GET", './loginsystem/reqhandler.php?type=documentData');
        oReqDocs.send();
        this.createDRtoolbar();


    }


    // draw a document in Document Room by initializing a new Document
    drawDocument(documentAttributes, scrollContainer) {
        documentAttributes = documentAttributes.split('&');
        var newDocument = new DocumentDR(this.pd, documentAttributes, scrollContainer);
        this.pd.game.documents[newDocument.id] = newDocument;
    }

    //build the tool bar of the Document Room
    createDRtoolbar() {
        //todo: add labels to translation files
        let that = this;
        let DRtoolBar = document.getElementById("documentroom_toolbar");
        DRtoolBar.innerHTML = '<div id="documentroom_toolbar_general">' +
            '<div id="DRtext_button" onclick="pd.ui.addText(0,0,0,0,0,`DR`)"><img src="./ico/text_dr.png" id="" title=""><span id="label_dr">add label</span></div>' +
            '<div id="DRrectangle_button" onclick="pd.ui.addRectangleDR(0,0,0,0,0,1)"><img src="./ico/rectangle_dr.png" id="" title=""><span id="rectangle_dr">add rectangle</span></div>' +
            '<div id="arrow_button" onclick="pd.ui.addArrowDR(0,0,0,0,0,1)"><img src="./ico/arrow_dr.png" id="" title=""><span id="arrow_dr">add arrow</span></div>' +
            '<div id="DRhighlight_button" onclick="pd.ui.activateHighlighting(`DR`)"><img src="./ico/highlight_dr.png" id="" title=""><span id="highlight_dr">highlight</span></div>' +
            '<div id="DRcolor_button" onclick="pd.ui.showHighlightingColourBox(`DR`)"><img src="./ico/color_dr.png" id="" title=""><span id="color_dr">highlighting color</span></div>' +
            '<div id="DReraser_button" onclick="pd.ui.activateEraser(`DR`);"><img src="./ico/eraser_dr.png" id="" title=""><span id="eraser_dr">eraser</span></div>' +
            '<div id="DRselectmode_button" onclick="pd.ui.activateSelectModeDR();"><img src="./ico/selectmode_dr.png" id="" title=""><span id="select_dr">select</span></div>' +
            '</div>' +
            '<div id="documentroom_toolbar_selectmode">' +
            '<div id="DRselectall_button" onclick="DocumentDR.selectAll();"><img src="./ico/selectall_dr.png" id="" title=""><span id="selectall_dr">select all</span></div>' +
            '<div id="DRsend_button" onclick="pd.ui.sendSelectedDocuments();"><img src="./ico/send_dr.png" id="" title=""><span id="send_dr">send</span></div>' +
            '<div id="DRdelete_button" onclick="pd.ui.deleteSelectedDocuments();"><img src="./ico/delete_dr.png" id="" title=""><span id="delete_dr">delete</spanid></div>' +
            '</div>'

        document.querySelectorAll("#documentroom_toolbar_selectmode div")
            .forEach(button => {
                button.style.opacity = '20%';
                //TODO:remove event listeners for select mode buttons
            });
        // add the translation
        document.getElementById("label_dr").textContent = pd.ui.translate('LABEL_DR_LABEL');
        document.getElementById("rectangle_dr").textContent = pd.ui.translate('LABEL_DR_RECTANGLE');
        document.getElementById("arrow_dr").textContent = pd.ui.translate('LABEL_DR_ARROW');
        document.getElementById("highlight_dr").textContent = pd.ui.translate('LABEL_DR_HIGHLIGHT');
        document.getElementById("color_dr").textContent = pd.ui.translate('LABEL_DR_COLOR');
        document.getElementById("eraser_dr").textContent = pd.ui.translate('LABEL_DR_ERASER');
        document.getElementById("select_dr").textContent = pd.ui.translate('LABEL_DR_SELECT');
        document.getElementById("selectall_dr").textContent = pd.ui.translate('LABEL_DR_SELECTALL');
        document.getElementById("send_dr").textContent = pd.ui.translate('LABEL_DR_SEND');
        document.getElementById("delete_dr").textContent = pd.ui.translate('LABEL_DR_DELETE');
    }

    sendSelectedDocuments() {
        if (Object.keys(DocumentDR.selectedDocuments).length === 1) {
            pd.game.showQRCode("annotated");
        }
    }

    deleteSelectedDocuments() {
        if (Object.keys(DocumentDR.selectedDocuments).length >= 1) {
            let text = this.translate('DELETE_CONFIRM');
            let isSure = confirm(text);
            if (isSure) this.pd.game.deleteSelectedDocuments();
        }
    }
    // activate the select mode in Document Room if it was deactivated and vice versa.
    activateSelectModeDR() {
        if (!this.selectModeActiveDR) {
            if (this.pd.visual.eraserActive) this.pd.ui.activateEraser('DR');
            if (this.pd.visual.highlightActive) this.pd.ui.activateHighlighting('DR');
            this.selectModeActiveDR = true;
            document.getElementById('DRselectmode_button').style.backgroundColor = this.pd.visual.cssConf('activated-button');
            document.querySelectorAll("#documentroom_toolbar_general div")
                .forEach(button => {
                    if (button.id !== "DRselectmode_button") {
                        button.style.opacity = '20%';
                        //TODO:remove event listeners for general mode buttons
                    }
                });
            let DRselectall_button = document.querySelector("#DRselectall_button")
            DRselectall_button.style.opacity = '100';
            //TODO:activate event listeners for #DRselectall_button

            let documents = this.pd.game.documents;
            for (let id in documents) {
                documents[id].activateSelectMode();
            }
        } else {
            this.selectModeActiveDR = false;
            document.querySelectorAll("#documentroom_toolbar_general div")
                .forEach(button => {
                    button.style.opacity = '100%';
                    //TODO:activate event listeners for select mode buttons
                });
            document.querySelectorAll("#documentroom_toolbar_selectmode div")
                .forEach(button => {
                    button.style.opacity = '20%';
                    //TODO:remove event listeners for select mode buttons
                });
            document.getElementById('DRselectmode_button').style.backgroundColor = "";
            let documents = this.pd.game.documents;
            for (let id in documents) {
                documents[id].deactivateSelectMode();
            }
            DocumentDR.selectedDocuments = {};
            DocumentDR.allSelected = false;
        }

    }

	activateButtonDR(type){
		let DRdelete_button = document.querySelector(type);
		DRdelete_button.style.opacity='100%';
	}
	deactivateButtonDR(type){
		let DRdelete_button = document.querySelector(type);
		DRdelete_button.style.opacity='20%';
	}

    closeDocumentsRoom() {
        var documentroom = document.getElementById("documentroom");
        documentroom.style.display = 'none';
        if (document.getElementById("highlightingBox")) {
            pd.ui.closeHighlightingColorBox();
        }
        if (this.pd.visual.highlightActive) this.pd.ui.activateHighlighting("DR"); //unactivate Highlighting actually
        if (this.pd.visual.eraserActive) this.pd.ui.activateEraser("DR"); //unactivate eraser actually
        if (this.selectModeActiveDR) this.selectModeActiveDR = false;
        // destroy old stage to avoid memory leaks and better performance
        pd.ui.DRstage.clearCache();
        pd.ui.DRstage.destroy()
        this.documentRoomOpened = false;
        DocumentDR.selectedDocuments = {};
        this.pd.game.documents = {};
        pd.ui.windowWidth = window.innerWidth;
    }

    // add arrow to Document Room(for both from old sessions or new one)
	addArrowDR(x1,y1,x2,y2,stroke,isNew){
        // calculate where to add new arrow per default and consider scrolling state too
		if(this.documentRoomOpened && this.selectModeActiveDR && isNew)return;
        let scrollContainer;
        let PosY = window.innerWidth/20;
        scrollContainer = document.getElementById("scroll-container");
        let dy = scrollContainer.scrollTop - pd.ui.PADDING;
        if(dy>0)PosY+=Math.abs(dy)+500;
        else PosY+=500-Math.abs(dy);
        var arrow = new Konva.Arrow({
            points: [x1?x1:3/100*this.windowWidth, y1?y1:PosY, x2?x2:10/100*this.windowWidth, y2?y2:PosY+(10/100*this.windowWidth)],
            stroke: stroke?stroke:'white',
            strokeWidth: 8,

        });
        // add a resizing circle to the arrow
        var handleTop = new Konva.Circle({
            x: arrow.points()[2],
            y: arrow.points()[3],
            stroke: '#0fa1f7',
            fill: 'white',
            strokeWidth: 2,
            radius: 10,
            draggable: true
        });
        // add a dragging circle to the arrow
        var handleMiddle = new Konva.Circle({
            x: (arrow.points()[0]+arrow.points()[2])/2,
            y: (arrow.points()[1]+arrow.points()[3])/2,
            stroke: '#0fa1f7',
            fill: 'white',
            strokeWidth: 2,
            radius: 12,
            draggable: true
        });
        // add a resizing circle to the arrow
        var handleBottom = new Konva.Circle({
            x: arrow.points()[0],
            y: arrow.points()[1],
            stroke: '#0fa1f7',
            fill: 'white',
            strokeWidth: 2,
            radius: 10,
            draggable: true
        });
        pd.ui.DRlayerShapes.add(arrow,handleTop,handleMiddle,handleBottom);

        // define what happen when the handling circles are dragged(mathematics)
        let middleTopDifferenceX,middleTopDifferenceY,middleBottomDifferenceX,middleBottomDifferenceY,arrowHead;
        handleBottom.on('dragmove', function() {
            arrow.points([ handleBottom.x(), handleBottom.y(),arrow.points()[2], arrow.points()[3]]);
            handleMiddle.x((arrow.points()[0]+arrow.points()[2])/2);
            handleMiddle.y((arrow.points()[1]+arrow.points()[3])/2);
        });
        handleBottom.on('dragend', function() {
            draggingOrTransforming=true;
			pd.game.postArrowStateDR();
        });

        handleTop.on('dragmove', function() {
            arrow.points([arrow.points()[0], arrow.points()[1], handleTop.x(), handleTop.y()]);
            handleMiddle.x((arrow.points()[0]+arrow.points()[2])/2);
            handleMiddle.y((arrow.points()[1]+arrow.points()[3])/2);

        });
        handleTop.on('dragend', function() {
            draggingOrTransforming=true;
			pd.game.postArrowStateDR();
        });

        handleMiddle.on('dragstart', function() {
            middleBottomDifferenceX=handleBottom.x()-handleMiddle.x();
            middleBottomDifferenceY=handleBottom.y()-handleMiddle.y();
            middleTopDifferenceX=handleTop.x()-handleMiddle.x();
            middleTopDifferenceY=handleTop.y()-handleMiddle.y();
        });

        handleMiddle.on('dragmove', function() {
            handleBottom.x(handleMiddle.x()+middleBottomDifferenceX);
            handleBottom.y(handleMiddle.y()+middleBottomDifferenceY);
            handleTop.x(handleMiddle.x()+middleTopDifferenceX);
            handleTop.y(handleMiddle.y()+middleTopDifferenceY);
            arrow.points([ handleBottom.x(), handleBottom.y(), handleTop.x(), handleTop.y()]);
        });
        handleMiddle.on('dragend', function() {
            handleMiddle.x((handleBottom.x()+handleTop.x())/2);
            handleMiddle.y((handleBottom.y()+handleTop.y())/2);
            draggingOrTransforming=true;
			pd.game.postArrowStateDR();
        });

        handleTop.hide();
        handleMiddle.hide();
        handleBottom.hide();
        if(isNew) pd.game.postArrowStateDR();
        let draggingOrTransforming=false;
        arrow.on('pointerclick', () => {
			if(this.pd.visual.eraserActive){
				arrow.destroy();
				handleBottom.destroy();
				handleMiddle.destroy();
				handleTop.destroy();
				pd.game.postArrowStateDR();
				return;
			}
			else if(this.pd.visual.highlightActive){
				let color=this.pd.visual.highlightColor?this.pd.visual.cssConf("highlighting-"+this.pd.visual.highlightColor)+"":this.pd.visual.cssConf("highlighting-color1")+"";
				arrow.stroke(color);
				pd.game.postArrowStateDR();
				return;
			}
            setTimeout(()=>{
                handleTop.show();
                handleMiddle.show();
                handleBottom.show();
                scrollContainer.style.overflow="hidden"; // prevent scrolling while dragging in Document Room
            },10);
            draggingOrTransforming=true;
            setTimeout(() => { window.addEventListener('click', handleOutsideClick); });
            function  handleOutsideClick(){
                if(!draggingOrTransforming) {
                    handleTop.hide();
                    handleMiddle.hide();
                    handleBottom.hide();
                    window.removeEventListener('click', handleOutsideClick);
                    scrollContainer.style.overflow="auto";
                    scrollContainer.style.overflowX="hidden";

                }
                draggingOrTransforming=false;
            }
        });

    }

    // add rectangle to Document Room(for both from old sessions or new one)
    addRectangleDR(x, y, stroke, width, height, isNew) {
        if (this.documentRoomOpened && this.selectModeActiveDR && isNew) return;
        // calculate where to add new rectangle per default and consider scrolling state too
        let PosX = window.innerWidth / 20;
        let PosY = window.innerWidth / 20;
        let scrollContainer;
        let stageDR = pd.ui.DRstage;
        scrollContainer = document.getElementById("scroll-container");
        let dy = scrollContainer.scrollTop - pd.ui.PADDING;
        if (dy > 0) PosY += Math.abs(dy) + 500;
        else PosY += 500 - Math.abs(dy);
        let rectangle = new Konva.Rect({
            x: x ? x : PosX,
            y: y ? y : PosY,
            stroke: stroke ? stroke : "#FFF",
            strokeWidth: Math.ceil(0.35 / 100 * window.innerWidth),
            width: width ? width : 15 / 100 * window.innerWidth,
            height: height ? height : 15 / 100 * window.innerWidth,
            preventDefault: false,
        });
        this.DRlayerShapes.add(rectangle);
        let tr = new Konva.Transformer({
            node: rectangle,
            rotateEnabled: false,
        });
        let draggingOrTransforming = false;
        this.DRlayerShapes.add(tr);
        tr.hide();
        if (isNew) {
            //if(!where)this.pd.game.storeTextStatePR();
            this.pd.game.postRectangleStateDR();
        } //avoid open loop when text state is reconstructed when game is opened
        rectangle.on('pointerclick', () => {
            if (this.pd.visual.eraserActive) {
                rectangle.destroy();
                tr.destroy();
                pd.game.postRectangleStateDR();
                return;
            } else if (this.pd.visual.highlightActive) {
                let color = this.pd.visual.highlightColor ? this.pd.visual.cssConf("highlighting-" + this.pd.visual.highlightColor) + "" : this.pd.visual.cssConf("highlighting-color1") + "";
                rectangle.stroke(color);
                pd.game.postRectangleStateDR();
                return;
            }
            setTimeout(() => {
                tr.show();
                rectangle.draggable(true);

                scrollContainer.style.overflow = "hidden"; // prevent scrolling while dragging in Document Room

            }, 10);
            draggingOrTransforming = true;
            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });
            function handleOutsideClick() {
                if (!draggingOrTransforming) {
                    tr.hide()
                    rectangle.draggable(false);
                    window.removeEventListener('click', handleOutsideClick);
                    scrollContainer.style.overflow = "auto";
                    scrollContainer.style.overflowX = "hidden";
                }
                draggingOrTransforming = false;
            }
        });
        rectangle.on('dragstart', () => {
            draggingOrTransforming = true;
        });
        rectangle.on('dragend', () => {
            tr.show();
            rectangle.draggable(true);
            this.pd.game.postRectangleStateDR();
        });
        rectangle.on('transformstart', () => {
            draggingOrTransforming = true;
        });
        rectangle.on('transformend', () => {
            this.pd.game.postRectangleStateDR();
        });
    }

    // add text to Document Room or Play Room(for both from old sessions or new one)
    // based on https://konvajs.org/docs/sandbox/Editable_Text.html
    addText(text, x, y, fill, width, where) {
        if (this.documentRoomOpened && this.selectModeActiveDR) return;
        // calculate where to add new text per default and consider scrolling state of Document Room too
        let PosX = window.innerWidth / 20;
        let PosY = window.innerWidth / 20;
        let scrollContainer;
        if (where) {
            let stageDR = pd.ui.DRstage;
            scrollContainer = document.getElementById("scroll-container");
            let dy = scrollContainer.scrollTop - pd.ui.PADDING;
            if (dy > 0) PosY += Math.abs(dy) + 500;
            else PosY += 500 - Math.abs(dy);
        }
        let newText = this.translate("NEW_TEXT");
        let textNode = new Konva.Text({
            text: text ? text : newText,
            x: x ? x : PosX,
            y: y ? y : PosY,
            fontSize: 1.5 / 100 * window.innerWidth,
            fill: fill ? fill : where ? "#FFF" : "#000",
            width: width ? width : 200 / (100 * 10) * window.innerWidth, //make width relative to the window size
            preventDefault: false
        });

        if (!where)
            this.layer.add(textNode);
        else
            this.DRlayerLabels.add(textNode);

        let tr = new Konva.Transformer({
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
        let draggingOrTransforming = false;
        if (!where)
            this.layer.add(tr);
        else
            this.DRlayerLabels.add(tr);
        tr.hide();
        if (!text) {
            if (!where) this.pd.game.storeTextStatePR();
            else if (where === "DR") this.pd.game.postTextStateDR();
        } //avoid open loop when text state is reconstructed when game is opened
        textNode.on('pointerclick', () => {
            if (!this.pd.visual.annotationMode && !this.pd.ui.documentRoomOpened) return;
            if (this.pd.visual.eraserActive) {
                textNode.destroy();
                tr.destroy();
                if (!where) this.pd.game.storeTextStatePR();
                else if (where === "DR") this.pd.game.postTextStateDR();
                return;
            } else if (this.pd.visual.highlightActive) {
                let color = this.pd.visual.highlightColor ? this.pd.visual.cssConf("highlighting-" + this.pd.visual.highlightColor) + "" : this.pd.visual.cssConf("highlighting-color1") + "";
                textNode.fill(color);
                if (!where) this.pd.game.storeTextStatePR();
                else if (where === "DR") this.pd.game.postTextStateDR();
                return;
            }
            setTimeout(() => {
                tr.show();
                textNode.draggable(true);
                if (where) {
                    scrollContainer.style.overflow = "hidden"; // prevent scrolling while dragging in Document Room
                }
            }, 10);
            draggingOrTransforming = true;
            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });

            function handleOutsideClick() {
                if (!draggingOrTransforming) {
                    tr.hide()
                    textNode.draggable(false);
                    window.removeEventListener('click', handleOutsideClick);
                    if (where) {
                        scrollContainer.style.overflow = "auto";
                        scrollContainer.style.overflowX = "hidden";
                    }
                }
                draggingOrTransforming = false;
            }
        });

        textNode.on('dragstart', () => {
            draggingOrTransforming = true;
        });
        textNode.on('transformstart', () => {
            draggingOrTransforming = true;
        });
        textNode.on('dragend', () => {

            if (!where) this.pd.game.storeTextStatePR();
            else if (where === "DR") this.pd.game.postTextStateDR();
            tr.show();
            textNode.draggable(true);
        });
        textNode.on('transformend', () => {
            if (!where) this.pd.game.storeTextStatePR();
            else if (where === "DR") this.pd.game.postTextStateDR();
            console.log(textNode.width());

        });

        textNode.on('dblclick dbltap', () => {
            if (!this.pd.visual.annotationMode && !this.pd.ui.documentRoomOpened) return;
            let that = this;
            that.editingText = true;
            // hide text node and transformer:
            textNode.hide();
            setTimeout(function () {
                tr.hide();
            }, 10);
            textNode.draggable(false);

            // create textarea over canvas with absolute position
            // first we need to find position for textarea
            // how to find it?

            // at first lets find position of text node relative to the stage:
            var textPosition = textNode.absolutePosition();

            // so position of textarea will be the sum of positions above:
            let stageContainer;
            let DRScrollPadding = 0;
            let titleAndToolbarHeight = 0;
            if (!where)
                stageContainer = this.pd.ui.stage.container();
            else {
                stageContainer = this.pd.ui.DRstage.container();
                DRScrollPadding = this.pd.ui.PADDING;
                titleAndToolbarHeight = (6 / 100 * window.innerWidth);
            }
            console.log(stageContainer.offsetLeft, stageContainer.offsetTop);
            console.log(stageContainer);
            console.log(textPosition.x, textPosition.y);
            var areaPosition = {
                x: stageContainer.offsetLeft + textPosition.x - DRScrollPadding,
                y: stageContainer.offsetTop + textPosition.y - DRScrollPadding + titleAndToolbarHeight,
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
            textarea.style.zIndex = 2147483647;
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
                tr.forceUpdate();
                if (!textNode.text()) {
                    textNode.destroy();
                    tr.destroy();
                }
                if (!where) pd.game.storeTextStatePR();
                else if (where === "DR") pd.game.postTextStateDR();
                setTimeout(function () {
                    that.editingText = false;
                }, 100);
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

            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });
        });
    }

    //activate if it was activated and vice versa.
    activateFreezing() {
        if (!this.pd.visual.freezeActive) {
            if (this.pd.visual.highlightActive) this.pd.ui.activateHighlighting(); //unactivate Highlighting actually
            if (this.pd.visual.eraserActive) this.pd.ui.activateEraser(); //unactivate eraser actually
            this.pd.visual.freezeActive = true;
            document.getElementById('freeze').style.backgroundColor = this.pd.visual.cssConf('activated-button');
        } else {
            this.pd.visual.freezeActive = false;
            document.getElementById('freeze').style.backgroundColor = "";
        }

    }

    //activate if it was activated and vice versa.
    activateEraser(where) {
        if (!pd.ui.selectModeActiveDR) {
            if (!this.pd.visual.eraserActive) {
                if (this.pd.visual.highlightActive) this.pd.ui.activateHighlighting(where); //unactivate Highlighting actually
                if (this.pd.visual.freezeActive && !(where === "DR")) this.pd.ui.activateFreezing();
                this.pd.visual.eraserActive = true;
                if (where)
                    document.getElementById('DReraser_button').style.backgroundColor = this.pd.visual.cssConf('activated-button');
                else
                    document.getElementById('eraser').style.backgroundColor = this.pd.visual.cssConf('activated-button');
            } else {
                this.pd.visual.eraserActive = false;
                if (where)
                    document.getElementById('DReraser_button').style.backgroundColor = "";
                else
                    document.getElementById('eraser').style.backgroundColor = "";
            }
        }

    }

    //activate if it was activated and vice versa.
    activateHighlighting(where) {
        if (!pd.ui.selectModeActiveDR) {
            if (!this.pd.visual.highlightActive) {
                if (this.pd.visual.eraserActive) this.pd.ui.activateEraser(where); //unactivate eraser actually
                if (this.pd.visual.freezeActive && !(where === "DR")) this.pd.ui.activateFreezing();
                this.pd.visual.highlightActive = true;
                if (where === "DR")
                    document.getElementById('DRhighlight_button').style.backgroundColor = this.pd.visual.cssConf('activated-button');
                else
                    document.getElementById('highlight').style.backgroundColor = this.pd.visual.cssConf('activated-button');
            } else {
                this.pd.visual.highlightActive = false;
                if (where === "DR")
                    document.getElementById('DRhighlight_button').style.backgroundColor = "";
                else
                    document.getElementById('highlight').style.backgroundColor = "";
            }
        }
    }

    showHighlightingColourBox(where) {
        if (!pd.ui.selectModeActiveDR) {
            if (document.getElementById("highlightingBox")) {
                return;
            }
            var that = this;
            var parent = document.getElementsByTagName('body')[0];
            var highlightingBox = document.createElement("div");
            highlightingBox.id = "highlightingBox";
            let color1 = this.pd.visual.cssConf("highlighting-color1");
            let color2 = this.pd.visual.cssConf("highlighting-color2");
            let color3 = this.pd.visual.cssConf("highlighting-color3");
            let color4 = this.pd.visual.cssConf("highlighting-color4");
            let color5 = this.pd.visual.cssConf("highlighting-color5");
            let color6 = this.pd.visual.cssConf("highlighting-color6");
            highlightingBox.innerHTML = `<h3>${that.translate("LABEL_COLOR")}</h3>\n` +
                "        <div id=\"colors\">\n" +
                `            <div id='color1' style=\"background: ${color1}\"></div>\n` +
                `            <div id='color2' style=\"background: ${color2}\"></div>\n` +
                `            <div id='color3' style=\"background: ${color3}\"></div>\n` +
                `            <div id='color4' style=\"background: ${color4}\"></div>\n` +
                `            <div id='color5' style=\"background: ${color5}\"></div>\n` +
                `            <div id='color6' style=\"background: ${color6}\"></div>\n` +
                "        </div>\n" +
                "        <div  id=\"highlightingColorButton\">\n" +
                `            <span >${that.translate("BUTTON_CLOSE")}</span>\n` +
                "        </div>";
            if (where === "DR") highlightingBox.style.left = "30vw";
            parent.appendChild(highlightingBox);
            document.getElementById("highlightingColorButton").onpointerdown = function (event) {
                //event.preventDefault();
                that.closeHighlightingColorBox();
            }
            if (that.pd.visual.highlightColor) document.getElementById(that.pd.visual.highlightColor).style.border = `2px solid white`
            else document.getElementById("color1").style.border = `2px solid white`
            document.getElementById("color1").onclick = function () {
                selectColor("color1");
            }
            document.getElementById("color2").onclick = function () {
                selectColor("color2");
            }
            document.getElementById("color3").onclick = function () {
                selectColor("color3");
            }
            document.getElementById("color4").onclick = function () {
                selectColor("color4");
            }
            document.getElementById("color5").onclick = function () {
                selectColor("color5");
            }
            document.getElementById("color6").onclick = function () {
                selectColor("color6");
            }

            function selectColor(id) {
                for (let i = 1; i < 7; i++) {
                    document.getElementById(`color${i}`).style.border = "";
                }
                document.getElementById(id).style.border = `2px solid white`;
                that.pd.visual.highlightColor = id;


            }
        }
    }

	closeHighlightingColorBox(){
		document.getElementById("highlightingBox").remove();
	}


    showAnnotationBar() {
        document.getElementById('annotation').style.display = '';
        document.getElementById('functions').style.display = 'none';
        document.getElementById("hint").style.display = 'none';
        let children = this.layer.getChildren();
        this.pd.visual.annotationMode = true;
    }

    hideAnnotationBar() {
        if (this.pd.visual.highlightActive) this.pd.ui.activateHighlighting(); //unactivate Highlighting actually
        if (this.pd.visual.eraserActive) this.pd.ui.activateEraser(); //unactivate eraser actually
        if (this.pd.visual.freezeActive) this.pd.ui.activateFreezing();
        if (document.getElementById("highlightingBox")) {
            pd.ui.closeHighlightingColorBox();
        }
        document.getElementById('annotation').style.display = 'none';
        document.getElementById('functions').style.display = '';
        document.getElementById("hint").style.display = '';
        let children = this.layer.getChildren();
        for (let i in children) {
            if (children[i].getClassName() === "Text") {
                children[i].draggable(false);
            }
            if (children[i].getClassName() === "Transformer") {
                children[i].hide();
            }
        }
        this.pd.visual.annotationMode = false;
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
		console.log(text);
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