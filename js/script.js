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
        this.turnPlayed = false;
        this.player1 = "white";
        this.player2 = "black";
    }

    updateMove(currentSpace, newSpace, piece) {
        if(!this.validateMove(currentSpace, newSpace, piece)) return currentSpace; 
            
        this.turn = this.turn == "white"? "black":"white";
        document.getElementById("turn-tip").textContent = this.turn == "white"? "White to move":"Black to move";
        return newSpace;
             
    }

    validateMove(currentSpace, newSpace, piece) {
        if(newSpace != currentSpace) {
            return true;
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
        this.currentRank = this.rank(space);
        this.currentFile = this.file(space);
        console.log(this.rank(space), this.file(space));
        this.isDragging = false;
        let newElement = document.createElement('div');
        let newImg = document.createElement('img');
        newImg.setAttribute("draggable", "false")
        
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
            newImg.classList.remove("dragging");
            
            let nextSpace = this.queryForCloseSpace(newElement);
            nextSpace.appendChild(newElement);
            //console.log(this.space, nextSpace)
            

            newElement.style.left = 0 + "px";
            newElement.style.top = 0 + "px";
            newElement.zIndex = 3;

            this.space = this.game.updateMove(this.space, nextSpace, newElement.classList[0]);
            

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

    legalMoves() {
        const moves = {
            "pawn" : [[0,1],[0,2],[-1,1],[1,1]],
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

    file(space) {
        return Math.round((space.offsetLeft)/ (chessboard.clientWidth/8));
        

    }

    rank(space) {
        return Math.round((space.offsetTop)/ (chessboard.clientHeight/8));

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
        const newRook = space.querySelector('div');
        newRook.classList.add("rook");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/rook-${team}.svg`)

    }
}

class Pawn extends Piece{
    constructor(space, team) {
        super(space, team)
        const newPawn = space.querySelector('div');
        newPawn.classList.add("pawn");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/pawn-${team}.svg`)
    }
}

const chessGame = new Chess();
function queueSpace(numIndex, letIndex) {
    return document.querySelectorAll('tr')[numIndex].querySelectorAll('td')[letIndex];
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