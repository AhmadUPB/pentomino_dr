// methods for drawing board and pieces are based heavily on similar methods in the Visual.js class
// this class represents a document in the Document Room and contains mainly methods for drawing them
class DocumentDR {
    static cashedFrame;
    static cashedTray;
    static cashedBoardField;
    static cashedCheckbox;
    static cashedSnowflake;
    static widthOfOneFieldSquare;
    static helpPieceObjects = {};
    static selectedDocuments= {};
    static allSelected;

    constructor(PD, documentAttributes, scrollContainer) {
        this.pd = PD;
        this.boardDimensions = [];
        this.boardLayout = [];
        this.boardX = 0;
        this.boardY = 0;
        this.pieces = {};
        this.highlightedFields = [];
        this.id = documentAttributes[0];
        this.x = documentAttributes[1];
        this.y = documentAttributes[2];
        this.pieceState1 = documentAttributes[4];
        this.pieceState2 = documentAttributes[5];
        this.boardstate = documentAttributes[6];
        this.texts = documentAttributes[7];
        this.boardLayoutText = documentAttributes[8];

        this.computeBoardLayout();
        this.createGroup();
        this.drawFrameAndTray();
        this.drawBoard();
        this.drawPieces();
        this.drawTexts();
        this.drawCheckBox();
        this.drawTopFrame();
        let documentWidth = this.pd.visual.cssConf('document-width');
        let documentHeight = this.pd.visual.cssConf('document-height');
        // if document was not repositioned before then update the coordinates for next none-repositioned documents
        if (this.x === 'none') {
            let numberDocumentsInRow = (Math.floor(95 / (documentWidth + 2.5)));
            let startOfLeftMargin = (100 - ((Math.floor(95 / (documentWidth + 2.5))) * (documentWidth + 2.5))) / 2
            if ((this.pd.ui.DRDocumentDefaultX - documentWidth - 2.5) < startOfLeftMargin) {
                this.pd.ui.DRDocumentDefaultX = startOfLeftMargin + (numberDocumentsInRow - 1) * (documentWidth + 2.5);
                this.pd.ui.DRDocumentDefaultY -= documentHeight + 2.5;

            } else {
                this.pd.ui.DRDocumentDefaultX -= documentWidth + 2.5;
            }
        }

        let that = this;
        // Continue playing the document on a double pointer click
        this.group.on("pointerdblclick", function () {
            that.pd.game.showQRCode("playDocument", that.id);

        });
        //click event mainly for selecting process of documents in Select Mode of the Document Room
        this.group.on("pointerclick", function () {
            if (that.selectModeActive) {
                if (that.selected) {
                    that.selected = false;
                    that.checkMark.visible(false);
                    delete DocumentDR.selectedDocuments[that.id];
                } else {
                    that.selected = true;
                    that.checkMark.visible(true);
                    DocumentDR.selectedDocuments[that.id] = that;
                }
                // depending on the number of selected document activate or deactivate send and delete buttons
                if (Object.keys(DocumentDR.selectedDocuments).length === 1) {
                    pd.ui.activateButtonDR("#DRdelete_button");
                    pd.ui.activateButtonDR("#DRsend_button");
                } else if (Object.keys(DocumentDR.selectedDocuments).length > 1) {
                    pd.ui.activateButtonDR("#DRdelete_button");
                    pd.ui.deactivateButtonDR("#DRsend_button");
                } else {
                    pd.ui.deactivateButtonDR("#DRdelete_button");
                    pd.ui.deactivateButtonDR("#DRsend_button");
                }
            }

        });

        // click and hold event, some ideas based on https://www.youtube.com/watch?v=A95mIE2HdcY&ab_channel=dcode
        this.isHeld = false;
        this.activeHoldTimeoutID = null;
        let dragOnMove;
        let Xpos;
        let Ypos;

        that.group.on("dragend", function () {
            //console.log("dragend")
            that.isHeld = false;
            dragOnMove = false;
            clearTimeout(that.activeHoldTimeoutID);
            that.group.scale({x: 1, y: 1});
            that.pd.game.updateDocumentCoordinates(that.id, that.group.x(), that.group.y());
            that.group.moveTo(that.pd.ui.DRlayerDocuments1);


        });
        scrollContainer.addEventListener('scroll', () => {
            that.isHeld = false;
            clearTimeout(that.activeHoldTimeoutID);
        });
        let mousePos;
        ['pointerdown', 'touchstart', 'pointermove', 'pointerout', 'pointerup'].forEach(type => {
            this.documentTopFrame.on(type, function () {
                switch (type) {
                    case 'pointerdown':
                    case 'touchstart' : {
                        //console.log(type)
                        mousePos = pd.ui.DRstage.getPointerPosition();
                        Xpos = mousePos.x;
                        Ypos = mousePos.y;
                        that.group.scale({x: 1, y: 1});
                        dragOnMove = false;
                        that.isHeld = true;
                        that.activeHoldTimeoutID = setTimeout(() => {
                            if (that.isHeld) {
                                //console.log("drag on move is true");
                                dragOnMove = true;
                                that.group.scale({x: 1.1, y: 1.1});
                            }
                        }, 600);
                        break;
                    }
                    case 'pointermove' : {
                        //console.log("pointermove")

                        if (that.isHeld) {
                            mousePos = pd.ui.DRstage.getPointerPosition();
                            let z = Math.sqrt((Xpos - mousePos.x) ** 2 + (Ypos - mousePos.y) ** 2)
                            //console.log(z)
                            if (dragOnMove && z < 5) {
                                that.group.startDrag();
                                that.group.moveTo(that.pd.ui.DRlayerDocumentsDragging);
                                that.group.moveToBottom();
                                //console.log("dragging started")
                            } else if (z > 5) {
                                that.isHeld = false;
                                dragOnMove = false;
                                clearTimeout(that.activeHoldTimeoutID);
                                that.group.scale({x: 1, y: 1});
                            }
                        }
                        break;
                    }
                    default: {
                        //console.log(type)
                        that.isHeld = false;
                        dragOnMove = false;
                        clearTimeout(that.activeHoldTimeoutID);
                        that.group.stopDrag();
                        that.group.scale({x: 1, y: 1});

                    }
                }
            });
        });
    }
    //select or deselect all documents
    static selectAll(){
        let documents = pd.game.documents;
        if(pd.ui.selectModeActiveDR && Object.keys(documents).length > 0){
        if(!DocumentDR.allSelected){
            DocumentDR.allSelected=true;
        for(let id in documents){
            if(DocumentDR.selectedDocuments[id]) continue;
            documents[id].selected = true;
            documents[id].checkMark.visible(true);
            DocumentDR.selectedDocuments[id] = documents[id];
        }
            pd.ui.activateButtonDR("#DRdelete_button");
            pd.ui.deactivateButtonDR("#DRsend_button");
            if(Object.keys(documents).length === 1)pd.ui.activateButtonDR("#DRsend_button");
        }
        else{
            DocumentDR.allSelected=false;
            DocumentDR.selectedDocuments={};
            for(let id in documents) {
                documents[id].selected = false;
                documents[id].checkMark.visible(false);
            }
            pd.ui.deactivateButtonDR("#DRdelete_button");
            pd.ui.deactivateButtonDR("#DRsend_button");
        }}
    }

    //performance tip: create cached version of elements that are drawn repeatedly on documents in this method
    //later in other methods lone the cached copies when drawing the documents
    static createCashedElements(pd) {
        let documentWidth = pd.visual.cssConf('document-width');
        let documentHeight = pd.visual.cssConf('document-height');
        let that = this;
        DocumentDR.widthOfOneFieldSquare = documentWidth / pd.game.width;
        let documentFrame = new Konva.Rect({

            width: documentWidth / 100 * window.innerWidth,
            height: documentHeight / 100 * window.innerWidth,
            fill: pd.visual.cssConf('field-color'),
            listening: false,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false,
            //preventDefault: false,
        });

        let documentTray = new Konva.Rect({

            width: documentWidth / 100 * window.innerWidth,
            height: pd.visual.cssConf('document-tray-height') / 100 * window.innerWidth,
            fill: pd.visual.cssConf('tray-color'),
            listening: false,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false,
            //preventDefault: false,
        });

        let boardField = new Konva.Rect({
            width: DocumentDR.widthOfOneFieldSquare / 100 * window.innerWidth,
            height: DocumentDR.widthOfOneFieldSquare / 100 * window.innerWidth,
            fill: pd.visual.cssConf('board-color'),
            listening: false,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false,
            //preventDefault: false,
        });

        let checkBox = new Konva.Rect({
            width: 2 * DocumentDR.widthOfOneFieldSquare / 100 * window.innerWidth,
            height: 2 * DocumentDR.widthOfOneFieldSquare / 100 * window.innerWidth,
            fill: 'white',
            stroke: '#444',
            strokeWidth: 1,
            listening: false,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false,
            //preventDefault: false,

        });

        documentTray.cache();
        documentFrame.cache();
        boardField.cache();
        checkBox.cache();
        DocumentDR.cashedCheckbox = checkBox;
        DocumentDR.cashedTray = documentTray;
        DocumentDR.cashedFrame = documentFrame;
        DocumentDR.cashedBoardField = boardField;

        // create helpPieceObjects to help by drawing the pieces of document
        DocumentDR.helpPieceObjects["F"] = new Piece("F");
        DocumentDR.helpPieceObjects["I"] = new Piece("I");
        DocumentDR.helpPieceObjects["L"] = new Piece("L");
        DocumentDR.helpPieceObjects["N"] = new Piece("N");
        DocumentDR.helpPieceObjects["P"] = new Piece("P");
        DocumentDR.helpPieceObjects["T"] = new Piece("T");
        DocumentDR.helpPieceObjects["U"] = new Piece("U");
        DocumentDR.helpPieceObjects["V"] = new Piece("V");
        DocumentDR.helpPieceObjects["W"] = new Piece("W");
        DocumentDR.helpPieceObjects["X"] = new Piece("X");
        DocumentDR.helpPieceObjects["Y"] = new Piece("Y");
        DocumentDR.helpPieceObjects["Z"] = new Piece("Z");

    };

    // each document is basically a group of konva nodes
    createGroup() {
        let layer = this.pd.ui.DRlayerDocuments1;
        // depending on whether the document was repositioned before or not, decide to give default postion or not
        let x, y;
        if (this.x === 'none') {
            x = this.pd.ui.DRDocumentDefaultX / 100 * window.innerWidth;
            y = this.pd.ui.DRDocumentDefaultY / 100 * window.innerWidth;
        } else {
            x = this.x * window.innerWidth / 100;
            y = this.y * window.innerWidth / 100;
        }
        let group = new Konva.Group({
            x: x,
            y: y,
        });
        this.group = group;
        layer.add(group);
    }

    drawFrameAndTray() {
        this.frame = DocumentDR.cashedFrame.clone();
        let tray = DocumentDR.cashedTray.clone()
        this.group.add(this.frame, tray)
    };


    drawBoard() {
        let boardHighlighting = this.boardstate.split("_");
        let index = 0;
        let layer= this.pd.ui.DRlayerDocuments1;
        for (var row = 0; row < this.pd.game.height; row++) { //2x height to allow for portrait usage
            for (var col = 0; col < this.pd.game.width; col++) {

                var isBoard = true;
                var isBlocked = false;

                if (col < this.boardX) isBoard = false;
                if (col >= this.boardX + this.boardDimensions[0]) isBoard = false;
                if (row < this.boardY) isBoard = false;
                if (row >= this.boardY + this.boardDimensions[1]) isBoard = false;

                if (isBoard) {
                    index++;
                    var bR = row - this.boardY;
                    var bC = col - this.boardX;
                    if (this.boardLayout[bR][bC] === 0) isBlocked = true;
                }

                if (isBoard && !isBlocked) {
                    let color = "";

                    if (boardHighlighting[0] !== "none" && boardHighlighting[index].includes("#")) {
                        color = '#' + boardHighlighting[index].split("#")[1];
                    }
                    color = color ? color : pd.visual.cssConf('board-grid-color');
                    let boardField = DocumentDR.cashedBoardField.clone({
                        x: (col * DocumentDR.widthOfOneFieldSquare) / 100 * window.innerWidth,
                        y: (row * DocumentDR.widthOfOneFieldSquare + this.pd.visual.cssInt('document-tray-height')) / 100 * window.innerWidth,
                        stroke: color,
                        strokeWidth: 1,
                    });
                    //boardField.cache();
                    this.group.add(boardField);

                    if (boardHighlighting[0] !== "none" && boardHighlighting[index].includes("#")) {
                        this.highlightedFields.push(boardField);
                    }
                }

            }
        }
        // after finishing drawing the board move all the highlighted postions to top to not be covered by other
        // not highlighted positions
        while (this.highlightedFields.length !== 0) this.highlightedFields.pop().moveToTop();
    }

    drawPieces() {
        let stateArray1 = this.pieceState1.split('_');
        let stateArray2;
        if (this.pieceState2 && this.pieceState2 !== "none") {
            this.pieceState2 = this.pieceState2.replaceAll('.', ',');
            stateArray2 = this.pieceState2.split('_');
        }
        // similar to the methods of drawing in Visual class, load the state of the piece rotation first
        // extract the information about highlighting and freezing state too and bypass it to drawPiece()
        for (let i in stateArray1) {
            let pieceData = stateArray1[i];
            if (!pieceData) continue;
            let n = pieceData[0];
            let s = pieceData[1];
            let p = pieceData.substring(2);
            //set the pieces to the correct rotation state
            let piece = DocumentDR.helpPieceObjects[n];
            piece.loadState(s, true);
            p = p.split(',');
            if (typeof (stateArray2) == 'object') {
                let pieceData2 = stateArray2[i];
                pieceData2 = pieceData2.split(",");
                let frozen = pieceData2[1];
                let highlightingColor = "none";
                if (pieceData2[0][1] == 'c') {
                    highlightingColor = pieceData2[0].substring(1);
                }
                this.drawPiece(p, piece, frozen, highlightingColor);
                continue;
            }
            this.drawPiece(p, piece)

        }
    }

    // implemented similar to method updatePiece() from the Visualclass
    drawPiece(p, piece, frozen, highlightingColor) {
        for (let i = 0; i < piece.bitMap.length; i++) {

            for (let j = 0; j < piece.bitMap[i].length; j++) {

                let set = piece.bitMap[i][j];
                let color = piece.color;
                let widthAndHeight = DocumentDR.widthOfOneFieldSquare / 100 * window.innerWidth;
                if (set) {
                    let strokeColor;
                    if (highlightingColor && highlightingColor !== 'none') strokeColor = this.pd.visual.cssConf('highlighting-' + highlightingColor);
                    let x = ((j + (piece.trayPosition * 3.3)) * 0.65 * DocumentDR.widthOfOneFieldSquare) / 100 * window.innerWidth;
                    let y = (((i * 0.65) * DocumentDR.widthOfOneFieldSquare)) / 100 * window.innerWidth;
                    // if the piece is on the tray then draw it there
                    if (p == "T") {
                        let pieceFeld = new Konva.Rect({
                            x: x,
                            y: y,
                            width: widthAndHeight,
                            height: widthAndHeight,
                            fill: this.pd.visual.cssConf(color.substring(6, 19)),
                            stroke: strokeColor,
                            strokeWidth: 1,
                            listening: false,
                            perfectDrawEnabled: false,
                            shadowForStrokeEnabled: false,
                            //preventDefault: false,
                        });
                        pieceFeld.scale({x: 0.65, y: 0.65});
                        this.group.add(pieceFeld);
                        if (frozen === 'f') {
                            this.drawFreezingPic(x, y, widthAndHeight, true);
                        }

                    } else {
                        if (j + parseInt(p[0]) - 1 > this.pd.game.width || i + parseInt(p[1]) - 1 > this.pd.game.height || j + parseInt(p[0]) - 2 < 0) continue; //ignore part of pieces or full pieces out of screenshot
                        let x = ((j + parseInt(p[0]) - 2) * DocumentDR.widthOfOneFieldSquare) / 100 * window.innerWidth;
                        let y = (((i + parseInt(p[1]) - 2) * DocumentDR.widthOfOneFieldSquare) + this.pd.visual.cssInt('document-tray-height')) / 100 * window.innerWidth;
                        let pieceFeld = new Konva.Rect({
                            x: x,
                            y: y,
                            width: widthAndHeight,
                            height: widthAndHeight,
                            fill: this.pd.visual.cssConf(color.substring(6, 19)),
                            stroke: strokeColor,
                            strokeWidth: 1,
                            listening: false,
                            perfectDrawEnabled: false,
                            shadowForStrokeEnabled: false,
                            //preventDefault: false,
                        });
                        this.group.add(pieceFeld);
                        if (frozen === 'f') {
                            this.drawFreezingPic(x, y, widthAndHeight);
                        }
                    }
                }
            }
        }
    }

    // Draw snowflake  on frozen pieces
    drawFreezingPic(x, y, widthAndHeight, Tray) {
        //based on: //https://konvajs.org/docs/shapes/Image.html
        let snowflake = DocumentDR.cashedSnowflake.clone({
            x: x,
            y: y,
            width: widthAndHeight,
            height: widthAndHeight,
        });
        this.group.add(snowflake);
        if (Tray) {
            snowflake.scale({x: 0.65, y: 0.65});
        }
    }

    //draw the notes of the document
    drawTexts() {
        // text size and position must be relative to the document width
        let documentWidth = this.pd.visual.cssConf('document-width');
        if (this.texts !== "none") {
            let texts = this.texts.split('!');
            for (let i in texts) {
                if (!texts[i]) continue;
                let text = texts[i].split("_");
                let textNode = new Konva.Text({
                    x: text[1] / 100 * documentWidth / 100 * window.innerWidth,
                    y: (text[2] / 100 * documentWidth + this.pd.visual.cssInt('document-tray-height')) / 100 * window.innerWidth,
                    text: text[0],
                    fontSize: 5 / (100 * documentWidth) * window.innerWidth,
                    fontFamily: 'Calibri',
                    fill: text[3],
                    width: text[4] / 100 * documentWidth / 100 * window.innerWidth,
                    //width: text[4]/(100*(documentWidth*0.35)) * window.innerWidth,
                });
                this.group.add(textNode);
            }
        }
    }

    // draw chack box, needed when select mode active, so hide it first ;)
    drawCheckBox() {
        let documentWidth = pd.visual.cssConf('document-width');
        let widthOfOneFieldSquare = documentWidth / pd.game.width;
        let checkbox = DocumentDR.cashedCheckbox.clone({
            x: 1 / 100 * window.innerWidth,
            y: 1 / 100 * window.innerWidth,
            visible: false,
        });
        let checkMark = DocumentDR.cashedCheckMark.clone({
            x: 1.1 / 100 * window.innerWidth,
            y: 1.1 / 100 * window.innerWidth,
            width: 1.5 * widthOfOneFieldSquare / 100 * window.innerWidth,
            height: 1.5 * widthOfOneFieldSquare / 100 * window.innerWidth,
            visible: false,
        });
        this.checkBox = checkbox;
        this.checkMark = checkMark;
        this.group.add(checkbox, checkMark);
    }

    // draw a frame on the top to drag document properly
    drawTopFrame() {
        let documentWidth = pd.visual.cssConf('document-width');
        let documentHeight = pd.visual.cssConf('document-height');
        //let group = new Konva.Group({});
        let documentTopFrame = new Konva.Rect({

            width: documentWidth / 100 * window.innerWidth,
            height: documentHeight / 100 * window.innerWidth,
            stroke: 'white',
            strokeWidth: 2,
            perfectDrawEnabled: false,
            shadowForStrokeEnabled: false,
            preventDefault: false,
        });

        this.documentTopFrame = documentTopFrame;
        this.group.add(documentTopFrame)
    };

    // board layout help by drawing the board, this is based on old methods from other classes
    computeBoardLayout() {
        var line = this.boardLayoutText;
        var lines = line.split(' ');
        var firstSolution = []
        for (var j in lines) {
            line = []
            for (var k in lines[j]) {
                line.push(lines[j][k])
            }
            firstSolution.push(line)
        }
        this.boardDimensions = [firstSolution[0].length, firstSolution.length]; //c,r
        this.boardLayout = [];

        for (var r in firstSolution) {
            if (!this.boardLayout[r]) this.boardLayout[r] = [];
            for (var c in firstSolution[0]) {
                var letter = firstSolution[r][c];

                if (letter == '.') {
                    this.boardLayout[r][c] = 0;
                    continue;
                } else {
                    this.boardLayout[r][c] = 1;
                }
            }
        }
        //position the board on the game field
        this.boardX = Math.floor((this.pd.game.width - this.boardDimensions[0]) / 2);
        this.boardY = Math.floor((this.pd.game.height - this.boardDimensions[1]) / 2);

    }

    activateSelectMode() {
        this.selectModeActive = true;
        this.checkBox.visible(true);

    }

    deactivateSelectMode() {
        this.selectModeActive = false;
        this.selected = false;
        this.checkBox.visible(false);
        this.checkMark.visible(false);
    }

}