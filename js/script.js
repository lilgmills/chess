const chessboard = document.getElementById("chessboard");
const mover = document.getElementById("mover");
const undo = document.getElementById('undo');

undo.addEventListener("click", ()=>{
    chessGame.undoGameState();
    
})

const diagonal = [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],
[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],
[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],
[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7]];
const knightLs = [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]];
const cross = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],
[1, 0],[2, 0],[3, 0],[4, 0],[5, 0],[6, 0],[7, 0],
[-1, 0],[-2, 0],[-3, 0],[-4, 0],[-5, 0],[-6, 0],[-7, 0]];
const radiant = [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7],
[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],
[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],
[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],
[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
[0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],
[1, 0],[2, 0],[3, 0],[4, 0],[5, 0],[6, 0],[7, 0],
[-1, 0],[-2, 0],[-3, 0],[-4, 0],[-5, 0],[-6, 0],[-7, 0]];
const surround = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]
const Player = class {
    constructor(team) {
        this.team = team;
    }
}

const Game = class {
    constructor() {
        this.turn = "white";
        this.winner = false;
        this.player1 = "white";
        this.player2 = "black";
        this.threat = false;
        this.threatSquares = [];
        this.attack = false;
        this.whiteKing;
        this.blackKing;
        this.dir;
        this.gameState = [];
        this.moveList = [];
        this.n = 0;
        this.deadPieces = {}
        this.deadChildren = [];

        for(let j=0;j<8;j++) {
            this.gameState.push([])
            for(let i=0;i<8;i++) {
                this.gameState[j].push(false)
                
            }
        }
        
    }

    updateGameState(currentSpace, newSpace, pieceObj) {
        let fInit = file(currentSpace)
        let rInit = rank(currentSpace)
        let fNew = file(newSpace)
        let rNew = rank(newSpace)
            
        if(this.gameState[fNew][rNew]) { 
            this.deadPieces[this.n] = this.gameState[fNew][rNew]
        }
        this.gameState[fInit].splice(rInit, 1, false)
        
        this.gameState[fNew].splice(rNew, 1, pieceObj)
        
        
        this.gameState[fNew].splice(rNew, 1, pieceObj);
        
        this.moveList.push([[fInit, rInit], [fNew, rNew]]);

        this.n+=1;

    }

    lastMove() {
        return this.moveList.pop();
    }

    undoGameState() {
        
        if(this.n == 0) {
            return
        }
        this.n = this.n-1;
        
        let recentMove = this.lastMove();
        let lastSpace = recentMove[0];
        let newSpace = recentMove[1];
        let newElement;
        let pieceToReset;

        pieceToReset = this.gameState[newSpace[0]][newSpace[1]];

        this.gameState[lastSpace[0]][lastSpace[1]] = pieceToReset;
        
        try {
            pieceToReset.space = queueSpace(lastSpace[0], lastSpace[1]);
            
        }
        catch(e) {
            console.log("more info needed on ",this.gameState)
            console.error(e);
            return;
        }

        newElement = queueSpace(lastSpace[0], lastSpace[1]).querySelector('div')

        newElement = queueSpace(newSpace[0],newSpace[1]).querySelector('div')
        pieceToReset.space.appendChild(newElement)

        
        if (this.deadPieces[this.n]) {
            console.log("why are we dying?", this.deadPieces[this.n])
            
            let revivedDeadChild;
            console.log("dead children:", this.deadChildren);
            try {
                revivedDeadChild = this.deadChildren.pop();
            } 
            catch (e) {
                this.deadPieces[this.n - 1]
                console.error(e);
                return;
            }
            try {
                queueSpace(newSpace[0], newSpace[1]).appendChild(revivedDeadChild)
                
            }
            catch (e){
                console.log("look at gameState for ", newSpace[0], newSpace[1], this.gameState[newSpace[0]][newSpace[1]])
                console.log("revived child:", revivedDeadChild);
                console.error(e);
                return;
            }

            this.gameState[newSpace[0]][newSpace[1]] = this.deadPieces[this.n]
            
            delete this.deadPieces[this.n]
        }
        //returning pawns to starting rank, reset their firstMove property
        
        let isWhitePawn = (pieceToReset.team == "white" && pieceToReset.piece == "pawn")
        if (isWhitePawn && lastSpace[1]==1) {
            pieceToReset.firstMove = true;
        }
        else if (pieceToReset.piece == "pawn" && lastSpace[1]==6) {
            // console.log("piece to reset: a black pawn on f7", pieceToReset);
            pieceToReset.firstMove = true;
        }

        
        this.turn = this.turn == "white"? "black":"white";
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";

        if(this.turn == "black") {
            this.king = this.blackKing;
            if(this.squareIsThreatened(this.king.currentFile, this.king.currentRank, "black")) {
                alert("the king is in check!")
                
            }
        } else {
            this.king = this.whiteKing;
            if(this.squareIsThreatened(this.king.currentFile, this.king.currentRank, "white")) {
                alert("the king is in check!")
            }
        }
    
        

    }

    updateMove(currentSpace, newSpace, move, pieceObj) {
        
        let validMove =  this.validateMove(move, pieceObj, getOccupier(newSpace))
        
        if(!validMove) return currentSpace; 
        if(!this.gameSimReflectThreat(currentSpace, newSpace)) {return currentSpace};
        
        this.updateGameState(currentSpace, newSpace, pieceObj);
        this.turn = this.turn == "white"? "black":"white";
        
        
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";
        
        return newSpace;
             
    }

    squareIsThreatened(X,Y,team) {
        let scanForThreats = false
        cross.forEach((square)=> {
            let f = X + square[0];
            let r = Y + square[1];
            
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && getOccupier(queueSpace(f,r)) && getOccupier(queueSpace(f,r)).classList[0] != team) {
                //console.log("square from cross:",square);
                //console.log("square on board:", f, r, queueSpace(f,r))
                let gotRook = queueSpace(f,r).children[0].classList.contains("rook") 
                let gotQueen = queueSpace(f,r).children[0].classList.contains("queen")
                if(gotRook || gotQueen) {
                    let R = Math.max(Math.abs(square[0]), Math.abs(square[1]))
                    let scanX = square[0]/R;
                    let scanY = square[1]/R;
                    let scanDir = [scanX, scanY];
                    if (hitScan(X,Y,R,scanDir)) {
                        scanForThreats = true;
                    }
                }
            }
        
        })
        
        diagonal.forEach((square)=> {
            let f = X + square[0];
            let r = Y + square[1];
            let occupied = false;
            let enemy = false;
    
            if((r >= 0 && r < 8) && (f >= 0 && f < 8)) {
                occupied = getOccupier(queueSpace(f,r))
            }
            if (occupied) {
                enemy = getOccupier(queueSpace(f,r)).classList[0] != team
            }
            
            
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && enemy) {
                let gotBishop = queueSpace(f,r).children[0].classList.contains("bishop") 
                let gotQueen = queueSpace(f,r).children[0].classList.contains("queen")
                if(gotBishop || gotQueen) {
                    let R = Math.max(Math.abs(square[0]), Math.abs(square[1]))
                    let scanX = square[0]/R;
                    let scanY = square[1]/R;
                    let scanDir = [scanX, scanY];
                    
                    if (hitScan(X,Y,R,scanDir)) {
                        
                        scanForThreats = true;
                    }
                }
            }
        })

        surround.forEach((square)=> {
            let f = X + square[0];
            let r = Y + square[1];
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && getOccupier(queueSpace(f,r)) && getOccupier(queueSpace(f,r)).classList[0] != team) {
                if(queueSpace(f,r).children[0].classList.contains("king")) {
                    scanForThreats = true;
                }
            }
        })

        knightLs.forEach((square) => {
            let f = X + square[0];
            let r = Y + square[1];
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && getOccupier(queueSpace(f,r)) && getOccupier(queueSpace(f,r)).classList[0] != team) {
                if(queueSpace(f,r).children[0].classList.contains("knight")) {
                    scanForThreats = true;
                }
            }
        })

        if(team=="white") {
            [[-1,-1],[1,-1]].forEach((square)=>{
                let f = X + square[0];
                let r = Y + square[1];
                if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && getOccupier(queueSpace(f,r)) && getOccupier(queueSpace(f,r)).classList[0] != team) {
                    if(queueSpace(f,r).children[0].classList.contains("pawn")) {
                        scanForThreats = true;
                    }
                }
            })
        }
        if(team=="black") {
            [[-1,1],[1,1]].forEach((square)=>{
                let f = X + square[0];
                let r = Y + square[1];
                if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && getOccupier(queueSpace(f,r)) && getOccupier(queueSpace(f,r)).classList[0] != this.turn) {
                    if(queueSpace(f,r).children[0].classList.contains("pawn")) {
                        scanForThreats = true;
                    }
                }
            })
        }
        
        return scanForThreats
        
    }

    validateMove(move, pieceObj, occupier) {
        // sole.log(occupier)
        this.king = this.turn=="white"?this.whiteKing:this.blackKing;
        let M = pieceObj.currentFile;
        let N = pieceObj.currentRank;
        if(move[0] == 0 && move[1] == 0) {
            return false;
        }
        //this rule dictates that pieces never move on top of their own pieces and the 
        //move is immediately invalid
        //after this early return, we can assume "occupier" if it exists, is an opponent
        if(occupier) {
            if(occupier.classList.contains(this.turn)) {
                return false;
            }
            
        }

        if(pieceObj.piece == "king") {
            
            if(this.squareIsThreatened(M+move[0], N+move[1], pieceObj.team)) {

                alert("the king can't move there: the king is under threat!")
                return false;
            }
            
        }

        // experiment: try actually executing the move and then undoing it
        // to reflect whether the game state contains a threatened king at the end of the turn
        
    
        
        if(pieceObj.piece == "king") {  
            return this.ArrIncl(this.legalMoves()["king"], move)
        }
        else if(pieceObj.piece == "queen" || pieceObj.piece == "bishop" || pieceObj.piece == "rook") {  
            let r = Math.max(Math.abs(move[0]), Math.abs(move[1]));
            let queenVal =this.ArrIncl(this.legalMoves()["queen"], move)
            let bishopVal = this.ArrIncl(this.legalMoves()["bishop"], move)
            let rookVal = this.ArrIncl(this.legalMoves()["rook"], move)
            
            if (queenVal) {
                if( bishopVal ) {
                    if(move[0]==-move[1]) {
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(0,7), move)) {
                            this.dir = [-1,1];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(7,14), move)) {
                            this.dir = [1,-1];
                        }
                    }
                    else if(move[0]==move[1]) {
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(14,21), move)) {
                            this.dir = [1,1];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(21,28), move)) {
                            
                            this.dir = [-1,-1];
                        }
                    }
    
                }
                else if( rookVal ) {
                    if(move[0]==0) {
                        
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(28,35), move)) {
                            this.dir = [0,1];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(35,42), move)) {
                            this.dir = [0,-1];
                        }
                    }
                    else if(move[1]==0) {
                        
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(42,49), move)) {
                            this.dir = [1,0];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(49,56), move)) {
                            this.dir = [-1,0];
                        }
                    }
                } 
                return hitScan(M,N,r,this.dir)

            }
            
            
            
        }
        else if(pieceObj.piece == "knight") {
            return this.ArrIncl(this.legalMoves()["knight"], move)
        }    
        //console.log(pieceObj.piece);
        else if(pieceObj.piece == "pawn") {
            
            //Description of the logic for pawn
            //1. If the pawn is on its first move and is moving one square forward, check if there is an occupier there and if there is, don't move
            //2. If the pawn is on its first move and is moving two squares forward, check if there is an occupier there,
            // // and also the square one square "ahead" of it (different rank directions for white and black). don't move if there is an occupier in either
            //3. If the pawn is threatening and there is an opponent occupier in the new space, then the pawn attacks
            //4. If the pawn is threatening (moving diagonal) but there is not an opponent --invalid move
            if(pieceObj.firstMove) {
                let getMoves = this.legalMoves()
                
                let legal = getMoves[`pawn-${this.turn}-first`]; 
                
                if (this.ArrEq(legal[2],move)) {
                    return !occupier
                }
                else if (this.ArrEq(legal[3], move)) {
                    if(occupier) {
                        return false;
                    }
                    if (this.turn == "white") {
                        return(!getOccupier(queueSpace(M,N+1)))
                    }
                    else if (this.turn == "black") {
                        return(!getOccupier(queueSpace(M, N-1)))        
                    }
                }
                else if (this.ArrIncl(legal.slice(0,2), move)) {
                    return !!occupier
                }
                else return false;
            }
            else {
                
                let getMoves = this.legalMoves()
                let legal = getMoves[`pawn-${this.turn}`]; 
                
                if(this.ArrEq(legal[2], move)) {
                    return !occupier
                }
                else if (this.ArrIncl(legal.slice(0,2), move)) {
                    return !!occupier   
                }
                else {
                    return false;
                }
            }
        }
    }

    ArrIncl(A,B) { //Array A includes B as an element
        
        return A.map((item)=>JSON.stringify(item)).includes(JSON.stringify(B));
    }

    ArrEq(A,B) {
        return JSON.stringify(A) === JSON.stringify(B);
    }

    legalMoves() {
        const moves = {
            "pawn-white-first" : [[-1,1],[1,1],[0,1],[0,2]],
            "pawn-black-first" : [[1,-1],[-1,-1],[0,-1],[0,-2]],
            "pawn-white" : [[-1,1],[1,1],[0,1]],
            "pawn-black" : [[1,-1],[-1,-1],[0,-1]],
            "bishop" : diagonal,
            "knight" : knightLs,
            "rook" : cross,
            "queen" : radiant,
            "king" : surround
 
        }
        return moves
        
    }
    stepGameSim(currentSpace, newSpace) {
        let newGameSim = deepCopy(this.gameState);
        let restoreFromSaveState;

        let f = file(currentSpace)
        let r = rank(currentSpace)
        let F = file(newSpace)
        let R = rank(newSpace)

        newGameSim[F][R] = this.gameState[f][r];
        newGameSim[f][r] = false;

        restoreFromSaveState = deepCopy(this.gameState);
        
        
        this.gameState = deepCopy(newGameSim);

        let king = this.team == "white"?this.blackKing:this.whiteKing;
        let threat = this.squareIsThreatened(king.currentFile, king.currentRank, this.team=="white"?"black":"white")
        
        this.gameState = deepCopy(restoreFromSaveState);
        return threat;

        
    }

    gameSimReflectThreat (currentSpace, newSpace) {
        // RETURN FALSE  if king is threatened after new move
        // return true otherwise
        let threat = this.stepGameSim(currentSpace, newSpace);
        if (threat) {
            return false;
        }
        else if (this.ArrIncl(this.threatSquares, [King.currentFile, King.currentRank])){
            return false;
        }   
        else return true;

        
    }

    pushThreatSquares(r, f, team){
        if(team=="white") {
            this.threatSquares.push([r, f]);
        }
        else if (team =="black"){
            this.threatSquares.push([r, f]);
        }
    }

    getKingSpace() {
        return 
    }
}

class Chess extends Game {
    constructor() {
        super()
        this.board = chessboard;
        const letters = "abcdefgh"
        const numbers = "12345678"
        for(let j=0; j<8; j++) {
            const newRow = document.createElement('tr')
            for(let i=0; i<8; i++) {
                let newSquare = document.createElement('td');
                newRow.appendChild(newSquare)
                newSquare.classList.add("square");
                if((i+j)%2==0) {
                    newSquare.classList.add("white-square");
                }
                else {
                    newSquare.classList.add("black-square");
                }
                newSquare.id = letters[i] + numbers[7-j];
                
            }
            this.board.appendChild(newRow);
        }
    }

    flipBoard() {
        let flippedArray = [];
        for(let j=7; j>=0; j--) {
            let newRow = []
            for(let i=7; i>=0; i--) {
                let square = this.board.querySelectorAll('tr')[j].querySelectorAll('td')[i];
                newRow.push(square)
            }
            flippedArray.push(newRow)
        }

        for(let j=0; j<8; j++) {
            this.board.querySelectorAll('tr')[j].innerHTML = "";
            for(let i = 0; i<8; i++) {
                this.board.querySelectorAll('tr')[j].appendChild(flippedArray[j][i]);
            }
        }
    }


    
}


const Piece = class {
    constructor(space, team) {
        this.team = team;
        this.space = space;
        this.game = chessGame;
        this.piece;
        this.promotion;
        this.currentRank = rank(space);
        this.currentFile = file(space);
        this.gameAttack = true;
        // console.log(this.rank(space), this.file(space));
        this.isDragging = false;
        let newElement = document.createElement('div');
        newElement.classList.add(this.team);
        let newImg = document.createElement('img');
        newImg.setAttribute("draggable", "false");
        
        newImg.setAttribute('src', `images/pawn-${team}.svg`);
        
        newElement.appendChild(newImg);
        this.space.appendChild(newElement);

        newElement.addEventListener("mousedown", (e) => {  
            // e.preventDefault;
            if (this.team != this.game.turn) return;
            newElement.classList.add("dragging");
            this.isDragging = true;
            this.startX = e.clientX - this.space.offsetLeft;
            this.startY = e.clientY - this.space.offsetTop;
            // newElement.querySelector('img').style.opacity = "0%";
            // setTimeout(()=> newImg.style.opacity = "100%", 140)
            
            newElement.style.left = e.clientX - this.startX + "px";
            newElement.style.top = e.clientY - this.startY + "px";
            mover.appendChild(newElement);
        })

        window.addEventListener("mousemove", (e) => {
            // e.preventDefault;
            if(!this.isDragging) return
            newElement.style.left = e.clientX -this.startX + "px";
            newElement.style.top = e.clientY - this.startY + "px";

        })

        window.addEventListener("mouseup", (e)=> {
            
            if(!this.isDragging) return;
            this.isDragging = false;
            newElement.classList.remove("dragging");
            
            let nextSpace = this.queryForCloseSpace(newElement);

            newElement.style.left = 0 + "px";
            newElement.style.top = 0 + "px";
            newElement.zIndex = 3;

            let newMove = [file(nextSpace)-file(this.space), rank(nextSpace) - rank(this.space)]
            let validatedSpace = this.game.updateMove(this.space, nextSpace, newMove, this);
            if(getOccupier(validatedSpace)) this.game.attack = true;
            if(!this.space.isSameNode(validatedSpace) && this.piece == "pawn") this.firstMove = false;
            queueSpace(file(validatedSpace),rank(validatedSpace)).appendChild(newElement);

            let k = this.game.turn == "black"?this.game.blackKing:this.game.whiteKing;
            //console.log(k.currentFile, k.currentRank)
            //console.log(this.game.squareIsThreatened(k.currentFile, k.currentRank, k.team))
            if(this.game.squareIsThreatened(k.currentFile, k.currentRank, k.team)) {
                new Audio(`sounds/check.wav`).play()
                this.game.threat = true;
                alert("The king is in check!");
            }
            if(this.game.attack) {
                new Audio("sounds/attack.wav").play()
                this.game.deadChildren.push(nextSpace.children[0])
                // console.log(this.game.deadChildren[this.game.deadChildren.length-1])
                document.getElementById('dead-pieces').appendChild(this.game.deadChildren[this.game.deadChildren.length-1])
                
                
                
            }
            else if (!this.game.threat){
                new Audio(`sounds/move.wav`).play()
            }

            if(this.game.attack) {
                this.game.attack = false;
            }
            
            this.space = validatedSpace;

            this.currentFile = file(this.space);
            this.currentRank = rank(this.space);

        })

        
    } 

    queryForCloseSpace(Element) {
        if (Element.offsetLeft < 0 || Element.offsetLeft + Element.clientWidth/2 > chessboard.clientWidth){return this.space}
        if (Element.offsetTop < 0 || Element.offsetTop + Element.clientHeight/2> chessboard.clientHeight){return this.space}

        // console.log(Element.offsetLeft < 0);
        // console.log(Element.offsetLeft > chessboard.clientWidth);
        // console.log(Element.offsetTop < 0 );
        // console.log(Element.offsetTop > chessboard.clientHeight);

        let gridWidth = chessboard.clientWidth/8;
        let gridHeight =chessboard.clientHeight/8;

        let gridLetter = Math.round((Element.offsetLeft)/ gridWidth);
        let gridNumber = Math.round((Element.offsetTop)/ gridHeight);

        //console.log(gridLetter, gridNumber);

        return chessboard.querySelectorAll('tr')[gridNumber].querySelectorAll('td')[gridLetter];
    }

}


class King extends Piece {
    constructor(space, team) {
        super(space, team);
        this.piece = "king";

        if(team == "white") {
            this.game.whiteKing = this;
        } 
        else {
            this.game.blackKing = this;
        }
        const newKing = space.querySelector('div');
        newKing.classList.add("king");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/king-${team}.svg`)

    }
}

class Queen extends Piece {
    constructor(space, team) {
        super(space, team)
        this.piece = "queen"
        const newQueen = space.querySelector('div');
        newQueen.classList.add("queen");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/queen-${team}.svg`)

    }
}

class Bishop extends Piece {
    constructor(space, team) {
        super(space, team);
        this.piece = "bishop"
        const newBishop = space.querySelector('div');
        newBishop.classList.add("bishop");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/bishop-${team}.svg`)

    }
}

class Knight extends Piece {
    constructor(space, team) {
        super(space, team);
        this.piece = "knight";
        const newKnight = space.querySelector('div');
        newKnight.classList.add("knight");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/knight-${team}.svg`)

    }
}

class Rook extends Piece {
    constructor(space, team, piece) {
        super(space, team);
        this.piece = "rook";
        const newRook = space.querySelector('div');
        newRook.classList.add("rook");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/rook-${team}.svg`)

    }
}

class Pawn extends Piece{
    constructor(space, team) {
        super(space, team);
        this.piece = "pawn";
        const newPawn = space.querySelector('div');
        newPawn.classList.add("pawn");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/pawn-${team}.svg`)
        this.firstMove = true;
    }
}


function queueSpace(fileIndex, rankIndex) {
    return document.querySelectorAll('tr')[7-rankIndex].querySelectorAll('td')[fileIndex];
}
function rank(space) {
    return Number(space.id[1]) - 1;
}

function file(space) {
    let ranks = {"a": 0, "b" : 1,"c": 2, "d" : 3,"e": 4, "f" : 5, "g": 6, "h": 7};
    return ranks[space.id[0]];

}
function getOccupier (space) {
    try {
        return space.querySelector('div');
    }
        
    catch (e) {
        return false;
    }
}

function occupierQuery(f, r) {
    try {
        return getOccupier(queueSpace(f, r)).classList;
    }    
    catch (e) {
        return false;
    }
}
function hitScan(M,N,r,dir) {
    if(r > 0) {
        let rx = 0;
        let ry = 0;
        for (i=1; i< r; i++) {
            rx = i*dir[0];
            ry = i*dir[1];
            //console.log("scanning: rx=",rx,"ry=",ry,M+rx,N+ry)
            if (getOccupier(queueSpace(M+rx,N+ry))) {
                return false
            }
    
        }
    }
    
    
    return true;

}
function deepCopy(nestedArray) {
    let DeepCopy = [[]];
    // console.log("DeepCopy:",DeepCopy)
    for(let j=0;j<8;j++) {
        DeepCopy[j] = [...nestedArray[j]];
    }
    return DeepCopy;
}


const chessGame = new Chess();

for(i=0; i<8;i++) {
    const space = queueSpace(i, 6)
    chessGame.gameState[i][6] = new Pawn(space, "black");

}

for(i=0; i<8;i++) {
    const space = queueSpace(i, 1)
    chessGame.gameState[i][1] = new Pawn(space, "white");

}

chessGame.gameState[3][7] = new Queen(queueSpace(3,7), "black");
chessGame.gameState[4][7] = new King(queueSpace(4,7), "black");

chessGame.gameState[2][7] = new Bishop(queueSpace(2,7), "black");
chessGame.gameState[5][7] = new Bishop(queueSpace(5,7), "black");

chessGame.gameState[1][7] = new Knight(queueSpace(1,7), "black");
chessGame.gameState[6][7] = new Knight(queueSpace(6,7), "black");

chessGame.gameState[0][7] = new Rook(queueSpace(0,7), "black");
chessGame.gameState[7][7] = new Rook(queueSpace(7,7), "black");

chessGame.gameState[3][0] = new Queen(queueSpace(3,0), "white");
chessGame.gameState[4][0] = new King(queueSpace(4,0), "white");

chessGame.gameState[2][0] = new Bishop(queueSpace(2,0), "white");
chessGame.gameState[5][0] = new Bishop(queueSpace(5,0), "white");

chessGame.gameState[1][0] = new Knight(queueSpace(1,0), "white");
chessGame.gameState[6][0] = new Knight(queueSpace(6,0), "white");

chessGame.gameState[0][0] = new Rook(queueSpace(0,0), "white");
chessGame.gameState[7][0] = new Rook(queueSpace(7,0), "white");

document.querySelector('button').addEventListener("click", ()=>{chessGame.flipBoard()});
