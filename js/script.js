const chessboard = document.getElementById("chessboard");
const mover = document.getElementById("mover");
const diagonal = [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7]
[1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],
[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],
[-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7]];
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

    }

    updateMove(currentSpace, newSpace, move, pieceObj) {
        
        let validMove =  this.validateMove(move, pieceObj, getOccupier(newSpace))
        if(!validMove) return currentSpace; 
        if(!this.gameSimReflectThreat(currentSpace, move)) {return currentSpace};
        this.turn = this.turn == "white"? "black":"white";
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";
        
        return newSpace;
             
    }

    validateMove(move, pieceObj, occupier) {
        // sole.log(occupier)
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
        // this is where logic needs to go to determine whether the king
        // is under threat in the new position

        // if the king is moving to a legal spot he will move there, and
        // if the target square has an occupier, he will move there and attack
        
        if(pieceObj.piece == "king") {  
            return this.ArrIncl(this.legalMoves()["king"], move)
        }
        else if(pieceObj.piece == "queen") {  
            return this.ArrIncl(this.legalMoves()["queen"], move)
        }
        else if(pieceObj.piece == "bishop") {  
            return this.ArrIncl(this.legalMoves()["bishop"], move)
        }
        else if(pieceObj.piece == "rook") {  
            return this.ArrIncl(this.legalMoves()["rook"], move)
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
            "knight" : [[2,1],[1,2],[-1,2],[-2,1],[-2,-1],[-1,-2],[1,-2],[2,-1]],
            "rook" : cross,
            "queen" : radiant,
            "king" : surround
 
        }
        return moves
        
    }
    updateThreatSquares() {
        let pieces = chessboard.querySelectorAll('td > div');
        pieces.forEach((piece)=> {
            let team = piece.classList[0];
            let type = piece.classList[1];
            if(type == "pawn") {
                let threatSquares = this.legalMoves()[`pawn-${team}`].slice(0,2);
                
                let M = file(piece.parentElement);
                let N = rank(piece.parentElement);
                
                let f1 = M + threatSquares[0][1]; 
                let r1 = N + threatSquares[0][0];
                 
                let f2 = M + threatSquares[1][1]; 
                let r2 = N + threatSquares[1][0];

                if (occupierQuery(r1, f1)) {
                    if(occupierQuery(r1, f1)[0]==team){
                        
                    }
                    else if(0<=r1<8 && 0<=f1<8) {
                        this.pushThreatSquares(r1, f1, team);
                    }
                }
                if (occupierQuery(r2, f2)) {
                    if(occupierQuery(r2, f2)[0]==team){
                        
                    }
                    else if(0<=r2<8 && 0<=f2<8) {
                        this.pushThreatSquares(r2, f2, team)
                    }
                }
                
                if(0<=r1 && r1<8 && 0<=f1 && f1<8) {
                    // console.log(this.blackThreatSquares,this.whiteThreatSquares);
                    this.pushThreatSquares(r1, f1, team)
                }
                if(0<=r2 && r2<8 && 0<=f2 && f2<8) {
                    this.pushThreatSquares(r2, f2, team)
                }
            }
            
            



        })
    }

    gameSimReflectThreat (currentSpace, newMove) {
        // RETURN FALSE  if king is threatened after new move
        // return true otherwise
        
        // screen space for loops:
        // top to bottom (rank) 
        // left to right (file)

        // first coordinate "Y" will count rank backwards: [0,7] stands for 7=>H 0=>8 => H8
        // second coordinate "X" will also exchange coordinate positions with file-rank (ex: "E4") board index
        this.updateThreatSquares();
        return true;

        
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
        this.firstMove = false;
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
            let x = this.game.updateMove(this.space, nextSpace, newMove, this);
            if(getOccupier(x)) this.game.attack = true;
            if(x.isSameNode(nextSpace) && this.piece == "pawn") this.firstMove = false;
            if(this.game.attack) {
                new Audio("sounds/attack.wav").play()
                queueSpace(file(nextSpace),rank(nextSpace)).removeChild(nextSpace.children[0])
                
            }
            else {
                new Audio(`sounds/move.wav`).play()
            }
            if(this.game.attack) {
                this.game.attack = false;
            }
            

            queueSpace(file(x),rank(x)).appendChild(newElement);
            this.space = x;

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

const chessGame = new Chess();
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
for(i=0; i<8;i++) {
    const space = queueSpace(i, 6)
    new Pawn(space, "black");

}

for(i=0; i<8;i++) {
    const space = queueSpace(i, 1)
    new Pawn(space, "white");

}

new Queen(queueSpace(3,7), "black");
new King(queueSpace(4, 7), "black");

new Bishop(queueSpace(2, 7), "black");
new Bishop(queueSpace(5, 7), "black");

new Knight(queueSpace(1, 7), "black");
new Knight(queueSpace(6, 7), "black");

new Rook(queueSpace(0, 7), "black");
new Rook(queueSpace(7, 7), "black");

new Queen(queueSpace(3, 0), "white");
new King(queueSpace(4, 0), "white");

new Bishop(queueSpace(2, 0), "white");
new Bishop(queueSpace(5, 0), "white");

new Knight(queueSpace(1, 0), "white");
new Knight(queueSpace(6,0), "white");

new Rook(queueSpace(0, 0), "white");
new Rook(queueSpace(7, 0), "white");

document.body.appendChild(document.createElement('button'))

document.querySelector('button').addEventListener("click", ()=>{chessGame.flipBoard()});
document.querySelector('button').textContent = "flip board";