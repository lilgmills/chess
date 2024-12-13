const chessboard = document.getElementById("chessboard");
const mover = document.getElementById("mover");

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
    }

    updateMove(currentSpace, newSpace, move, pieceObj) {
        
        //console.log(xMove, yMove);
        if(!this.validateMove(move, pieceObj, this.getOccupier(newSpace))) return currentSpace; 
        this.turn = this.turn == "white"? "black":"white";
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";
        return newSpace;
             
    }

    validateMove(move, pieceObj, occupier) {
        // console.log(pieceObj)
        let M = pieceObj.currentRank;
        let N = pieceObj.currentFile;
        if(move[0] == 0 && move[1] == 0) {
            return false;
        }
        if(occupier) {
            if(occupier.classList.contains(this.turn)) {
                return false;
            }
            
        }
        
        //console.log(pieceObj.piece);
        if(pieceObj.piece == "pawn") {
            if(pieceObj.firstMove) {
                
            }
            else {
                
            }

            //Description of the logic for pawn
            //1. If the pawn is on its first move and is moving one square forward, check if there is an occupier there
            //2. If the pawn is on its first move and is moving two squares forward, check if there is an occupier there,
            // // and also the square one square "ahead" of it (different rank directions for white and black) 
            //3. 

            if(pieceObj.firstMove) {
                let getMoves = this.legalMoves()
                let legal = getMoves[`pawn-${this.turn}-first`]; 
                if (this.ArrEq(legal[0],move)) {
                    if(occupier) {
                        return false;
                    }
                    else{
                        pieceObj.firstMove = false;
                        return true;
                    }
                }
                else if (this.ArrEq(legal[1], move)) {
                    if(occupier) {
                        return false;
                    }
                    if (this.turn == "white") {
                        if (this.getOccupier(queueSpace(M+1, N))) {
                            return false;
                        }
                        else {
                            pieceObj.firstMove = false;
                            return true;
                        }
        
                    }
                    else if (this.turn == "black") {
                        if (this.getOccupier(queueSpace(M-1, N))) {
                            return false;

                        }
                        else {
                            pieceObj.firstMove = false;
                            return true;
                        }
                    }
                }
                else if (this.ArrIncl(legal.slice(2), move)) {
                    if(occupier) {
                        pieceObj.firstMove = false;
                        occupier.parentElement.removeChild(occupier);
                        return true;
                    }
                }
                
            }
            else if(!pieceObj.firstMove){
                let getMoves = this.legalMoves()
                let legal = getMoves[`pawn-${this.turn}`]; 
                
                if(this.ArrEq(legal[0], move)) {
                    
                    if(occupier) {
                        return false;
                    }
                    else {
                        return true;
                    }

                }
                
                if ((occupier && this.ArrIncl(legal.slice(1), move))) {
                    occupier.parentElement.removeChild(occupier);
                    return true;
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
            "pawn-white-first" : [[0,1],[0,2],[-1,1],[1,1]],
            "pawn-black-first" : [[0,-1],[0,-2],[1,-1],[-1,-1]],
            "pawn-white" : [[0,1],[-1,1],[1,1]],
            "pawn-black" : [[0,-1],[1,-1],[-1,-1]],
            "bishop" : [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7]
                       [1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],
                       [1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],
                       [-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7]],
            "knight" : [[1,2],[2,1],[-1,2],[-2,1],[-1,-2],[1,-2],[2,-1]],
            "rook" : [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
                      [0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],
                      [1, 0],[2, 0],[3, 0],[4, 0],[5, 0],[6, 0],[7, 0],
                      [-1, 0],[-2, 0],[-3, 0],[-4, 0],[-5, 0],[-6, 0],[-7, 0]],
            "queen" : [[-1,1],[-2,2],[-3,3],[-4,4],[-5,5],[-6,6],[-7,7]
                       [1,-1],[2,-2],[3,-3],[4,-4],[5,-5],[6,-6],[7,-7],
                       [1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7],
                       [-1,-1],[-2,-2],[-3,-3],[-4,-4],[-5,-5],[-6,-6],[-7,-7],
                       [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
                       [0,-1],[0,-2],[0,-3],[0,-4],[0,-5],[0,-6],[0,-7],
                       [1, 0],[2, 0],[3, 0],[4, 0],[5, 0],[6, 0],[7, 0],
                       [-1, 0],[-2, 0],[-3, 0],[-4, 0],[-5, 0],[-6, 0],[-7, 0]],
            "king" : [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]
 
        }
        return moves
        
    }
    getOccupier = (space) => {
        try {
            return space.querySelector('div');
        }
            
        catch (e) {
            return false;
        }
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
        this.currentRank = this.rank(space);
        this.currentFile = this.file(space);
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
            
            let newMove = [this.file(nextSpace)-this.file(this.space), this.rank(nextSpace) - this.rank(this.space)]
            
            this.space = this.game.updateMove(this.space, nextSpace, newMove, this);
            this.space.appendChild(newElement);

            this.currentFile = this.file(this.space);
            this.currentRank = this.rank(this.space);

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

        let newSpace = chessboard.querySelectorAll('tr')[gridNumber].querySelectorAll('td')[gridLetter];

        return newSpace;
    }

    rank(space) {
        return Number(space.id[1]) - 1;
    }

    file(space) {
        let ranks = {"a": 0, "b" : 1,"c": 2, "d" : 3,"e": 4, "f" : 5, "g": 6, "h": 7};
        return ranks[space.id[0]];

    }
}


class King extends Piece {
    constructor(space, team) {
        super(space, team);
        this.piece = "king";
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
function queueSpace(rankIndex, fileIndex) {
    return document.querySelectorAll('tr')[rankIndex].querySelectorAll('td')[fileIndex];
}
for(i=0; i<8;i++) {
    const space = queueSpace(1, i)
    new Pawn(space, "black");

}

for(i=0; i<8;i++) {
    const space = queueSpace(6, i)
    new Pawn(space, "white");

}

new Queen(queueSpace(0,3), "black");
new King(queueSpace(0, 4), "black");

new Bishop(queueSpace(0,2), "black");
new Bishop(queueSpace(0,5), "black");

new Knight(queueSpace(0,1), "black");
new Knight(queueSpace(0,6), "black");

new Rook(queueSpace(0,0), "black");
new Rook(queueSpace(0,7), "black");

new Queen(queueSpace(7,3), "white");
new King(queueSpace(7, 4), "white");

new Bishop(queueSpace(7,2), "white");
new Bishop(queueSpace(7,5), "white");

new Knight(queueSpace(7,1), "white");
new Knight(queueSpace(7,6), "white");

new Rook(queueSpace(7,0), "white");
new Rook(queueSpace(7,7), "white");

document.body.appendChild(document.createElement('button'))

document.querySelector('button').addEventListener("click", ()=>{chessGame.flipBoard()});
document.querySelector('button').textContent = "flip board";