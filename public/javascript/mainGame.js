class mainGame extends Phaser.Scene {
    constructor(){
        super({key: "mainGame"})
    }

    preload(){
        this.load.image('Board', 'assets/board.png');
        this.load.image('Empty', 'assets/emptyBlocko.png');
        this.load.image('Red', 'assets/redBlocko.png');
        this.load.image('Yellow', 'assets/yellowBlocko.png');
        this.load.image('Green', 'assets/greenBlocko.png')
    }

    create(){
        this.currentPostition = 0;
        this.blocksIn = 4;
        this.add.image(335,245, 'Board');
        //Create Board, 10x20 blocks
        this.board = createBoard(10, 20);
        this.board = drawBoard(this.board, this.add);
        this.currentTetrimino = getTetrimino();
        this.nextTetrimino = getTetrimino();
        drawNextTetrimino(this.nextTetrimino, this.nextTetrimino.colour, this.add);
        this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
        this.input.keyboard.on('keydown-S', () => {
            this.currentPostition++;
            this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
            if(this.board.end){
                this.currentPostition = 0;
                this.blocksIn = 4;
                this.currentTetrimino = this.nextTetrimino;
                this.nextTetrimino = getTetrimino();
                //drawNextTetrimino(this.nextTetrimino, this.nextTetrimino.colour, this.add);
                this.board = updateBoard(this.board.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
            }
        });
    }

}

const createBoard = (horizontal, vertical) => {
    return [...Array(vertical)].map(x=>Array(horizontal).fill({value: -1, colour: 'Empty'}));
};

const drawBoard = (board, context) => {
    let horizontal = 108;
    let verticle = 65;
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            context.image(horizontal, verticle, 'Empty');
            horizontal += 18;
        }
        horizontal = 108;
        verticle += 18;
    }

    return board;
};

const newTetrimino = (board, context) => {

}

const redrawBoard = (board, context) => {
    let horizontal = 108;
    let verticle = 65;
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            if(board[i][j].value === -1){
                context.image(horizontal, verticle, 'Empty');
            }
            horizontal += 18;
        }
        horizontal = 108;
        verticle += 18;
    }

    return board;
};

const getTetrimino = () => {
    let tetriminos = [];
    let tBlock = {
        /*
        Init position Example
        0   0   0
        -1  0   -1
         */
        init: [[0,0,0],[-1,0,-1]],
        clockWise: [[-1,0], [0,0], [-1,0]],
        counterClockwise: [[0,-1], [0, 0], [0,-1]],
        upsideDown: [[-1,0,-1],[0,0,0]],
        colour: 'Red',
        tetrimino: 'tBlock',
        state: 'init'
    };
    let line = {
        init: [[0,0,0,0]],
        clockWise: [[0],[0],[0],[0]],
        counterClockwise: [[0],[0],[0],[0]],
        upsideDown: [[0,0,0,0]],
        colour: 'Green',
        tetrimino: 'line',
        state: 'init'
    };
    let square = {
        init: [[0,0], [0,0]],
        clockWise: [[0,0], [0,0]],
        counterClockwise: [[0,0], [0,0]],
        upsideDown: [[0,0], [0,0]],
        colour: 'Yellow',
        tetrimino: 'square',
        state: 'init'
    };
    let zOne = {
        init: [[0,0,-1],[-1,0,0]],
        clockWise: [[-1,0],[0,0],[0,-1]],
        counterClockwise: [[-1,0],[0,0],[0,-1]],
        upsideDown: [[0,0,-1],[-1,0,0]],
        colour: 'Green',
        tetrimino: 'zOne',
        state: 'init'
    };
    let zTwo = {
        init: [[-1,0,0],[0,0,-1]],
        clockWise: [[0,-1],[0,0],[-1,0]],
        counterClockwise: [[0,-1],[0,0],[-1,0]],
        upsideDown: [[-1,0,0],[0,0,-1]],
        colour: 'Green',
        tetrimino: 'zTwo',
        state: 'init'
    };
    let lOne = {
        init: [[0,0,0],[-1,-1,0]],
        clockWise: [[-1,0],[-1,0],[0,0]],
        counterClockwise: [[0,0],[0,-1],[0,-1]],
        upsideDown: [[0,-1,-1],[0,0,0]],
        colour: 'Green',
        tetrimino: 'lOne',
        state: 'init'
    };
    let lTwo = {
        init: [[0,0,0],[0,-1,-1]],
        clockWise:[[0,-1],[0,-1],[0,0]],
        counterClockwise: [[0,0],[-1,0],[-1,0]],
        upsideDown: [[-1,-1,0], [0,0,0]],
        colour: 'Green',
        tetrimino: 'lTwo',
        state: 'init'
    }
    tetriminos.push(tBlock);
    tetriminos.push(line);
    tetriminos.push(square);
    tetriminos.push(zOne);
    tetriminos.push(zTwo);
    tetriminos.push(lOne);
    tetriminos.push(lTwo);

    let randomNumber = Math.floor((Math.random() * tetriminos.length) + 0);
    return tetriminos[randomNumber];
}

const updateBoard = (board, tetrimino, startingLine, blocksIn, context) => {
    if(!checkForCollision(board, tetrimino, startingLine, blocksIn)){
        if(startingLine < 19 || tetrimino.tetrimino === 'line'){
            if(startingLine < 20){
                let tetriminoCoords = getTetriminoState(tetrimino);
                let tetriIndex = 0;
                let horizontal = 108 + (18 * blocksIn);
                let verticle = 65 + (18 * startingLine);
                for(let i = 0; i < tetriminoCoords.length; i++){
                    for(let j = 0; j < tetriminoCoords[0].length; j++){
                        if(tetriminoCoords[i][tetriIndex] === 0){
                            board[startingLine+i][blocksIn+j] = {value: 0, colour: tetrimino.colour};
                            context.image(horizontal, verticle, tetrimino.colour);
                        }
                        tetriIndex++;
                        horizontal += 18;
                    }
                    horizontal = 108 + (18 * blocksIn);
                    tetriIndex = 0;
                    verticle += 18;
                }

                if(startingLine !== 0){
                    for(let i = 0; i < startingLine; i++){
                        for(let j = 0; j < board[0].length; j++){
                            if(board[i][j].value === 0){
                                board[i][j] = {value: -1, colour: 'Empty'};
                            }
                        }
                    }
                    if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'init' || tetrimino.state === 'upsideDown'){
                        board[startingLine][blocksIn + 2] = {value: -1, colour: 'Empty'};
                    }
                    if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'init' || tetrimino.state === 'upsideDown'){
                        board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
                    }
                }

                board = redrawBoard(board, context);
                return board;
            }else{
                return {board: board, end: true};
            }
        }else{
            return {board: board, end: true};
        }
    }else{
        return {board: board, end: true};
    }

};

const checkForCollision = (board, tetrimino, startingLine, blocksIn) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    if(tetriminoCoords.length > 1){
        for(let i = 0; i < tetriminoCoords[0].length; i++){
            //console.log(tetriminoCoords[tetriminoCoords.length-1][i])
            if(tetriminoCoords[tetriminoCoords.length-1][i] === 0){
                if(startingLine < 19){
                    console.log(board[startingLine+1][blocksIn+i].value)
                    if(board[startingLine+1][blocksIn+i].value === 0){
                        //console.log('Collision');
                        return true;
                    }else{
                        //console.log('No Collision');
                    }
                }
            }
        }
    }else{
        for(let i = 0; i < tetriminoCoords[0].length; i++){
            //console.log(tetriminoCoords[tetriminoCoords.length-1][i])
            if(tetriminoCoords[tetriminoCoords.length-1][i] === 0){
                if(startingLine < 20){
                    //console.log(board[startingLine+1][blocksIn+i].value)
                    if(board[startingLine][blocksIn+i].value === 0){
                        //console.log('Collision');
                        return true;
                    }else{
                        //console.log('No Collision');
                    }
                }
            }
        }
    }
};

const getTetriminoState = (tetrimino) => {
    let tetriminoCoords;
    if(tetrimino.state === 'init'){
        tetriminoCoords = tetrimino.init;
    }else if(tetrimino.state === 'clockWise'){
        tetriminoCoords = tetrimino.clockWise;
    }else if(tetrimino.state === 'counterClockwise'){
        tetriminoCoords = tetrimino.counterClockwise;
    }else if(tetrimino.state === 'upsideDown'){
        tetriminoCoords = tetrimino.upsideDown;
    }
    return tetriminoCoords;
}

const drawNextTetrimino = (tetrimino, colour, context) => {
    let horizontal;
    let horizontalInit;
    let verticle;
    if(tetrimino.tetrimino === "tBlock" || tetrimino.tetrimino === 'zOne' || tetrimino.tetrimino === 'zTwo' || tetrimino.tetrimino === 'lOne' || tetrimino.tetrimino === 'lTwo'){
        horizontal = 480;
        horizontalInit = horizontal;
        verticle = 420;
    }
    if(tetrimino.tetrimino === 'line'){
        horizontal = 470;
        horizontalInit = horizontal;
        verticle = 425;
    }
    if(tetrimino.tetrimino === 'square'){
        horizontal = 488;
        horizontalInit = horizontal;
        verticle = 420;
    }
    for(let i = 0; i < tetrimino.init.length; i++){
        for(let j = 0; j < tetrimino.init[0].length; j++){
            if(tetrimino.init[i][j] === 0){
                context.image(horizontal, verticle, colour);
            }
            horizontal += 18;
        }
        horizontal = horizontalInit;
        verticle += 18;
    }
}