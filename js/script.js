const chessboard = document.getElementById("chessboard");
const mover = document.getElementById("mover");

const Chess = class {
    constructor() {
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

    
}

const King = class {
    constructor(space, team) {
        new Pawn(space, team);
        const newKing = space.querySelector('div');
        newKing.classList.remove("pawn");
        newKing.classList.add("king");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/king-${team}.svg`)

    }
}

const Queen = class {
    constructor(space, team) {
        new Pawn(space, team);
        const newKing = space.querySelector('div');
        newKing.classList.remove("pawn");
        newKing.classList.add("queen");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/queen-${team}.svg`)

    }
}

const Bishop = class {
    constructor(space, team) {
        new Pawn(space, team);
        const newKing = space.querySelector('div');
        newKing.classList.remove("pawn");
        newKing.classList.add("bishop");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/bishop-${team}.svg`)

    }
}

const Knight = class {
    constructor(space, team) {
        new Pawn(space, team);
        const newKing = space.querySelector('div');
        newKing.classList.remove("pawn");
        newKing.classList.add("knight");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/knight-${team}.svg`)

    }
}

const Rook = class {
    constructor(space, team) {
        new Pawn(space, team);
        const newKing = space.querySelector('div');
        newKing.classList.remove("pawn");
        newKing.classList.add("rook");
        space.querySelector('div').querySelector('img').setAttribute('src', `images/rook-${team}.svg`)

    }
}

const Pawn = class {
    constructor(space, team) {
        this.team = team
        this.space = space
        this.isDragging = false;
        let newElement = document.createElement('div');
        let newImg = document.createElement('img');
        newImg.setAttribute("draggable", "false")

        newElement.classList.add("piece");
        newImg.setAttribute("src", `images/pawn-${team}.svg`);
        newElement.appendChild(newImg);
        this.space.appendChild(newElement);

        newElement.addEventListener("mousedown", (e) => {  
            e.preventDefault;
            mover.appendChild(newElement);
            newElement.classList.add("dragging");
            this.isDragging = true;
            this.startX = e.clientX - this.space.offsetLeft;
            this.startY = e.clientY - this.space.offsetTop;
            newElement.style.left = e.clientX - this.startX + "px";
            newElement.style.top = e.clientY - this.startX + "px";
        })

        window.addEventListener("mousemove", (e) => {
            e.preventDefault;
            if(!this.isDragging) return
            newElement.style.left = e.clientX -this.startX + "px";
            newElement.style.top = e.clientY - this.startY + "px";

        })

        window.addEventListener("mouseup", (e)=> {
            if(!this.isDragging) return;
            this.isDragging = false;
            newElement.classList.remove("dragging");
            
            let nextSpace = this.queryForCloseSpace(newElement);
            nextSpace.appendChild(newElement);
            console.log(this.space, nextSpace)
            this.space = nextSpace;

            newElement.style.left = nextSpace.offsetLeft + "px";
            newElement.style.top = nextSpace.offsetTop + "px";
            

        })

        
    } 

    queryForCloseSpace(Element) {
        if (Element.offsetLeft < 0 || Element.offsetLeft + Element.clientWidth/2 > chessboard.clientWidth){return this.space}
        if (Element.offsetTop < 0 || Element.offsetTop + Element.clientHeight/2> chessboard.clientHeight){return this.space}

        console.log(Element.offsetLeft < 0);
        console.log(Element.offsetLeft > chessboard.clientWidth);
        console.log(Element.offsetTop < 0 );
        console.log(Element.offsetTop > chessboard.clientHeight);

        let gridWidth = chessboard.clientWidth/8;
        let gridHeight =chessboard.clientHeight/8;

        let gridLetter = Math.round((Element.offsetLeft)/ gridWidth);
        let gridNumber = Math.round((Element.offsetTop)/ gridHeight);

        console.log(gridLetter, gridNumber);

        let newSpace = chessboard.querySelectorAll('tr')[gridNumber].querySelectorAll('td')[gridLetter];

        return newSpace;
    }
}

new Chess()
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


