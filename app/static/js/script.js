const chessboard = document.getElementById("chessboard");
const mover = document.getElementById("mover");
const undo = document.getElementById('undo');
let flipped = false;

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
        this.attack = false;
        this.whiteKing;
        this.blackKing;
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

    updateMove(currentSpace, newSpace, move, pieceObj, turn) {
        
        let validMove =  this.validateMove(move, pieceObj, getOccupier(newSpace), turn)
        
        if(!validMove) return currentSpace; 
        
        if(!this.gameSimReflectThreat(currentSpace, newSpace, turn)) {return currentSpace};

        
        
        this.updateGameState(currentSpace, newSpace, pieceObj);
        this.turn = this.turn == "white"? "black":"white";
        
        
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";
        
        return newSpace;
             
    }

    validateMove(move, pieceObj, occupier, turn) {
        // sole.log(occupier)
        this.king = turn=="white"?this.whiteKing:this.blackKing;
        let M = pieceObj.currentFile;
        let N = pieceObj.currentRank;
        let dir;
        if(move[0] == 0 && move[1] == 0) {
            return false;
        }
        //this rule dictates that pieces never move on top of their own pieces and the 
        //move is immediately invalid
        //after this early return, we can assume "occupier" if it exists, is an opponent
        if(occupier) {
            if(occupier.classList.contains(turn)) {
                return false;
            }
            
        }

        if(pieceObj.piece == "king") {
            
            if(this.squareIsThreatened(M+move[0], N+move[1], turn)) {

                //alert("the king can't move there: the king is under threat!")
                return false;
            }
            
        }
        
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
                            dir = [-1,1];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(7,14), move)) {
                            dir = [1,-1];
                        }
                    }
                    else if(move[0]==move[1]) {
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(14,21), move)) {
                            dir = [1,1];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(21,28), move)) {
                            
                            dir = [-1,-1];
                        }
                    }
    
                }
                else if( rookVal ) {
                    if(move[0]==0) {
                        
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(28,35), move)) {
                            dir = [0,1];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(35,42), move)) {
                            dir = [0,-1];
                        }
                    }
                    else if(move[1]==0) {
                        
                        if(this.ArrIncl(this.legalMoves()["queen"].slice(42,49), move)) {
                            dir = [1,0];
                        }
                        else if(this.ArrIncl(this.legalMoves()["queen"].slice(49,56), move)) {
                            dir = [-1,0];
                        }
                    }
                } 
                return this.hitScan(M,N,r,dir)

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
                
                let legal = getMoves[`pawn-${turn}-first`]; 
                
                if (this.ArrEq(legal[2],move)) {
                    return !occupier
                }
                else if (this.ArrEq(legal[3], move)) {
                    if(occupier) {
                        return false;
                    }
                    if (turn == "white") {
                        return(!getOccupier(queueSpace(M,N+1)))
                    }
                    else if (turn == "black") {
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
                let legal = getMoves[`pawn-${turn}`]; 
                
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

        console.log("Piece to reset:", this.gameState[newSpace[0]][newSpace[1]])
        pieceToReset = this.gameState[newSpace[0]][newSpace[1]];
        pieceToReset.currentFile = lastSpace[0]
        pieceToReset.currentRank = lastSpace[1]


        this.gameState[lastSpace[0]].splice(lastSpace[1],1,pieceToReset);
        pieceToReset.space = queueSpace(lastSpace[0], lastSpace[1]);

        newElement = queueSpace(newSpace[0],newSpace[1]).querySelector('div')
        pieceToReset.space.appendChild(newElement)
        console.log(this.deadChildren.length > 0, "this.deadChildren.length > 0")
        
        console.log(Array.from(Object.keys(this.deadPieces)))
        let deadPieceDates = Array.from(Object.keys(this.deadPieces))
        let max = 0;
        for (i=0;i<deadPieceDates.length;i++) {
            max = Math.max(Number(deadPieceDates[i]), max)
        }
        let isDeathDate = max == this.n;

        console.log(isDeathDate, "is death date")
        if (this.deadChildren.length > 0 && isDeathDate) {
            
            let revivedDeadChild = this.deadChildren.pop();
            
            try {
                //failed to execute append child, argument 1 is not of type node
                queueSpace(newSpace[0], newSpace[1]).appendChild(revivedDeadChild)
                
            }
            catch (e){
                console.log("tried to run queueSpace(newSpace[0], newSpace[1]).appendChild(revivedDeadChild)")
                console.error(e);
                return;
            }


            
            this.gameState[newSpace[0]].splice(newSpace[1],1,this.deadPieces[this.n])
            // console.log("WHY IS THE PIECE NOT INSERTED INTO THE GAMESTATE:", this.gameState[newSpace[0]][newSpace[1]])
            this.gameState[newSpace[0]][newSpace[1]].space = queueSpace(newSpace[0], newSpace[1])
            console.log("piece: ", this.gameState[newSpace[0]][newSpace[1]], "space inserted", this.gameState[newSpace[0]][newSpace[1]].space)
            delete this.deadPieces[this.n]
            //console.log("(this runs when dead children exist while undoing) deadPieces at times (move #'s):",Object.keys(this.deadPieces))
        }
        else {
            this.gameState[newSpace[0]].splice(newSpace[1], 1, false);
        }
        //returning pawns to starting rank, reset their firstMove property
        
        let isWhitePawn = (pieceToReset.team == "white" && pieceToReset.piece == "pawn")
        if (isWhitePawn) {
            if (lastSpace[1]==1) pieceToReset.firstMove = true;
        }
        else if (pieceToReset.piece == "pawn") {
            if (lastSpace[1]==6) pieceToReset.firstMove = true;
            
        }

        
        this.turn = this.turn == "white"? "black":"white";
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";

        if(this.turn == "black") {
            this.king = this.blackKing;
            if(this.squareIsThreatened(this.king.currentFile, this.king.currentRank, "black")) {
                //alert("the king is in check!")
                
            }
        } else {
            this.king = this.whiteKing;
            if(this.squareIsThreatened(this.king.currentFile, this.king.currentRank, "white")) {
                //alert("the king is in check!")
            }
        }
    
        

    }

    

    gameSimReflectThreat (currentSpace, newSpace, turn) {
        // RETURN FALSE  if king is threatened after new move
        // return true otherwise
        let threat = this.stepGameSim(currentSpace, newSpace, turn);
        if (threat) {
            return false;
        }
        
        else return true;

        
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
        
        this.moveList.push([[fInit, rInit], [fNew, rNew]]);

        this.n+=1;

    }

    squareIsThreatened(X,Y,team) {
        let scanForThreats = false
        cross.forEach((square)=> {
            let f = X + square[0];
            let r = Y + square[1];
            let analyzePiece;
            let enemy;
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8)) {
                if (this.gameState[f][r]) {
                    enemy = this.gameState[f][r].team != team
                    analyzePiece = this.gameState[f][r];

                }
                
            }
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && enemy) {
                //console.log("square from cross:",square);
                //console.log("square on board:", f, r, queueSpace(f,r))
                let gotRook = analyzePiece.piece == "rook"; 
                let gotQueen = analyzePiece.piece == "queen"; 
                if(gotRook || gotQueen) {
                    console.log("a rook or queen is threatening!", f, r)
                    let R = Math.max(Math.abs(square[0]), Math.abs(square[1]))
                    let scanX = square[0]/R;
                    let scanY = square[1]/R;
                    let scanDir = [scanX, scanY];
                    if (this.hitScan(X,Y,R,scanDir)) {
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
                occupied = this.gameState[f][r]
            }
            if (occupied) {
                enemy = this.gameState[f][r].team != team
            }
            
            
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8) && enemy) {
                let gotBishop = this.gameState[f][r].piece == "bishop" 
                let gotQueen = this.gameState[f][r].piece == "queen" 
                
                if(gotBishop || gotQueen) {
                    
                    let R = Math.max(Math.abs(square[0]), Math.abs(square[1]))
                    let scanX = square[0]/R;
                    let scanY = square[1]/R;
                    let scanDir = [scanX, scanY];
                    
                    if (this.hitScan(X,Y,R,scanDir)) {
                        console.log("a bishop or queen is threatening!", f, r)
                        scanForThreats = true;
                    }
                }
            }
        })

        surround.forEach((square)=> {
            let f = X + square[0];
            let r = Y + square[1];
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8)) {
                if (this.gameState[f][r]) {
                    if (this.gameState[f][r].team != team && this.gameState[f][r].piece  == "king") {
                        scanForThreats = true;
                    }
                    
                }
            }
        })

        knightLs.forEach((square) => {
            let f = X + square[0];
            let r = Y + square[1];
            if ((r >= 0 && r < 8) && (f >= 0 && f < 8)) {
                if (this.gameState[f][r]) {
                    if(this.gameState[f][r].team  != team && this.gameState[f][r].piece == "knight") {
                        console.log(" a knight is threatening!", f, r)
                        scanForThreats = true;
                    }
                }
            }
        })

        if(team=="white") {
            [[-1,-1],[1,-1]].forEach((square)=>{
                let f = X + square[0];
                let r = Y + square[1];
                if ((r >= 0 && r < 8) && (f >= 0 && f < 8)) {
                    if (this.gameState[f][r]) {
                        if (this.gameState[f][r].team != team && this.gameState[f][r].piece == "pawn") {
                            console.log(" a pawn is threatening!", f, r)
                            scanForThreats = true;
                        }
                    }
                
                }
            })
        }
        if(team=="black") {
            [[-1,1],[1,1]].forEach((square)=>{
                let f = X + square[0];
                let r = Y + square[1];
                if ((r >= 0 && r < 8) && (f >= 0 && f < 8)) {
                    if (this.gameState[f][r]) {
                        if (this.gameState[f][r].team != team && this.gameState[f][r].piece == "pawn") {
                            console.log(" a pawn is threatening!", f, r)
                            scanForThreats = true;
                        }                        
                    }
                }
            })
        }
        
        return scanForThreats
        
    }

    stepGameSim(currentSpace, newSpace, turn) {
        let f;
        let r; 
        let F;
        let R;
        try {
            f = file(currentSpace)
            r = rank(currentSpace)
            F = file(newSpace)
            R = rank(newSpace)

        }
        catch (e) {
            return false;
        }
        
        let newGameSim = deepCopy(this.gameState);
        let restoreFromSaveState;


        newGameSim[F][R] = this.gameState[f][r];
        newGameSim[f][r] = false;

        restoreFromSaveState = deepCopy(this.gameState);
        
        
        this.gameState = deepCopy(newGameSim);

        
        let returnKing;
        for(let j=0;j<8;j++){
            for(let i=0;i<8;i++){
                if (this.gameState[j][i]){
                    if(this.gameState[j][i].piece == "king" && this.gameState[j][i].team == turn) {
                        
                        returnKing = [j, i];
                    } 
                }
            }
        }

        let threat = this.squareIsThreatened(returnKing[0], returnKing[1], turn)
        if (threat) {
            //console.log(returnKing);
            //alert("the king is in danger!")
        }
        
        this.gameState = deepCopy(restoreFromSaveState);
        return threat;

        
    }

    checkRegionValid(pieceObj) {
        let validMoves = []
        let regionChoice = {"king": surround,
                        "queen": radiant,
                        "bishop" : diagonal,
                        "knight" : knightLs,
                        "rook" : cross,
                    };
        let region;
        if(pieceObj.piece == "pawn") {
            
            region = this.setPawnArea(pieceObj) 
            // console.log(region);
            

        } else {
            region = regionChoice[pieceObj.piece];
        }
        region.forEach((move)=> {
            
            
            let f = pieceObj.currentFile;
            let r = pieceObj.currentRank;
            let newF = f+move[0];
            let newR = r+move[1];
            
            let occupier;
            try {
                occupier = getOccupier(queueSpace(newF, newR))
            }
            catch (e) {
                occupier = false;
            }
            //console.log(pieceObj,move,occupier,this.turn)
            // console.log("What's going on here")
            if(this.validateMove(move,pieceObj,occupier,this.turn)) {
                
                validMoves.push(move);
            }
        });

        return validMoves;
    }
    availableMoves(pieceObj) {
        let f = pieceObj.currentFile;
        let r = pieceObj.currentRank;
        let validMoves = false;
        let availMove = false;
        
        validMoves = this.checkRegionValid(pieceObj);
        ///////////////////////////////////////What's going on here ---> console.log(validMoves);
        if(!validMoves) return false;

        validMoves.forEach((move)=>{
            let safeMove = this.gameSimReflectThreat(queueSpace(f,r), queueSpace(f+move[0],r+move[1]),pieceObj.team)
            availMove = availMove || safeMove;
        })

        return availMove;

    }
    anyAvailableMoves(team) {
        let allPieces = []
        this.gameState.forEach((file)=>{
            file.filter((piece)=>piece).forEach((piece)=>{
                allPieces.push(piece);
            });
        });
        
        allPieces = allPieces.filter((piece)=>piece.team == team);
        
        let availMoves = allPieces.filter((piece)=> this.availableMoves(piece)).length > 0;
        return availMoves;
    }

    

    setPawnArea(pieceObj) {
        if(pieceObj.firstMove) {
            if(pieceObj.team == "white") {
                return [[-1,1],[1,1],[0,1],[0,2]];
            }
            else {
                return [[1,-1],[-1,-1],[0,-1],[0,-2]];
            }
        }
        else if(pieceObj.team == "white") {
            return [[-1,1],[1,1],[0,1]];
        } else {
            return [[1,-1],[-1,-1],[0,-1]];
        }

    }

    hitScan(M,N,r,dir) {
        if(r > 0) {
            let rx = 0;
            let ry = 0;
            for (i=1; i< r; i++) {
                rx = i*dir[0];
                ry = i*dir[1];
                //console.log("scanning: rx=",rx,"ry=",ry,M+rx,N+ry)
                if(0<= M+rx && M+rx < 8 && 0 <= N+ry && N+ry < 8) {
                    if (this.gameState[M+rx][N+ry]) {
                        return false
                    }
                }
                
            }
        }
        
        return true;
    
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
        flipped = !flipped;
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
        this.firstMove = true;
        // console.log(this.rank(space), this.file(space));
        this.isDragging = false;
        let newElement = document.createElement('div');
        newElement.classList.add(this.team);
        let newImg = document.createElement('img');
        newImg.setAttribute("draggable", "false");
        
        
        
        
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
            let validatedSpace = this.game.updateMove(this.space, nextSpace, newMove, this, this.game.turn);
            if(getOccupier(validatedSpace)) this.game.attack = true;
            if(!this.space.isSameNode(validatedSpace) && this.piece == "pawn") this.firstMove = false;
            queueSpace(file(validatedSpace),rank(validatedSpace)).appendChild(newElement);

            let k = this.game.turn == "black"?this.game.blackKing:this.game.whiteKing;
            //console.log(k.currentFile, k.currentRank)
            //console.log(this.game.squareIsThreatened(k.currentFile, k.currentRank, k.team))
            if(this.game.squareIsThreatened(k.currentFile, k.currentRank, k.team)) {
                new Audio(`static/sounds/check.wav`).play()
                this.game.threat = true;
                //alert("The king is in check!");
            }
            if(this.game.attack) {
                new Audio("static/sounds/attack.wav").play()
                this.game.deadChildren.push(nextSpace.firstChild)
                // console.log(this.game.deadChildren[this.game.deadChildren.length-1])
                document.getElementById('dead-pieces').appendChild(nextSpace.firstChild)
                
                
                
            }
            else if (!this.game.threat){
                new Audio(`static/sounds/move.wav`).play()
            }

            if(this.game.attack) {
                this.game.attack = false;
            }
            //console.log('this.space:', validatedSpace)
            this.space = validatedSpace;

            this.currentFile = file(this.space);
            this.currentRank = rank(this.space);

            if(!this.game.anyAvailableMoves(this.game.turn)) {
            
                alert(`Game over! ${this.game.turn=="white"?"Black":"White"} wins!`)
            }

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
        space.querySelector('div').querySelector('img').setAttribute('src', `static/images/king-${team}.svg`)

    }
}

class Queen extends Piece {
    constructor(space, team) {
        super(space, team)
        this.piece = "queen"
        const newQueen = space.querySelector('div');
        newQueen.classList.add("queen");
        space.querySelector('div').querySelector('img').setAttribute('src', `static/images/queen-${team}.svg`)

    }
}

class Bishop extends Piece {
    constructor(space, team) {
        super(space, team);
        this.piece = "bishop"
        const newBishop = space.querySelector('div');
        newBishop.classList.add("bishop");
        space.querySelector('div').querySelector('img').setAttribute('src', `static/images/bishop-${team}.svg`)

    }
}

class Knight extends Piece {
    constructor(space, team) {
        super(space, team);
        this.piece = "knight";
        const newKnight = space.querySelector('div');
        newKnight.classList.add("knight");
        space.querySelector('div').querySelector('img').setAttribute('src', `static/images/knight-${team}.svg`)

    }
}

class Rook extends Piece {
    constructor(space, team, piece) {
        super(space, team);
        this.piece = "rook";
        const newRook = space.querySelector('div');
        newRook.classList.add("rook");
        space.querySelector('div').querySelector('img').setAttribute('src', `static/images/rook-${team}.svg`)

    }
}

class Pawn extends Piece{
    constructor(space, team) {
        super(space, team);
        this.piece = "pawn";
        const newPawn = space.querySelector('div');
        newPawn.classList.add("pawn");
        space.querySelector('div').querySelector('img').setAttribute('src', `static/images/pawn-${team}.svg`)
        
    }
}


function queueSpace(fileIndex, rankIndex) {
    let id = ["a","b","c","d","e","f","g","h"][fileIndex] + String(rankIndex + 1);
    return document.getElementById(id)
    
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
