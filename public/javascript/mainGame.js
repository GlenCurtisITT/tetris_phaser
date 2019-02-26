class mainGame extends Phaser.Scene {
    constructor(){
        super({key: "mainGame"})
    }

    preload(){
        this.load.image('Board', 'assets/board.png');
        this.load.image('Empty', 'assets/emptyBlocko.png');
        this.load.image('Red', 'assets/redBlocko.png');
        this.load.image('Yellow', 'assets/yellowBlocko.png');
        this.load.image('Green', 'assets/greenBlocko.png');
        this.load.image('Pink', 'assets/pinkBlocko.png');
        this.load.image('Blue', 'assets/blueBlocko.png');
        this.load.image('DarkBlue', 'assets/darkBlueBlocko.png');
        this.load.image('Orange', 'assets/orangeBlocko.png');
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
        this.input.keyboard.on('keydown-W', () => {
            this.board = changeState(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
        })
        this.input.keyboard.on('keydown-A', () => {
            if(this.blocksIn !== 0){
                this.blocksIn--;
                this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
            }
        })
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

const changeState = (board, tetrimino, startingLine, blocksIn, context) => {
    board = clearTetrimino(board, tetrimino, startingLine, blocksIn, context);
    tetrimino = changeTetriminoState(tetrimino);
    board = updateBoard(board, tetrimino, startingLine, blocksIn, context);
    return board;
};

const changeTetriminoState = (tetrimino) => {
    let currentState = tetrimino.state;
    if(currentState === 'initPosition'){
        tetrimino.state = 'clockWise'
    }else if(currentState === 'clockWise'){
        tetrimino.state = 'upsideDown'
    }else if(currentState === 'upsideDown'){
        tetrimino.state = 'counterClockwise'
    }else if(currentState === 'counterClockwise'){
        tetrimino.state = 'initPosition'
    }

    return tetrimino;
}

const clearTetrimino = (board, tetrimino, startingLine, blocksIn, context) => {
    let tetriminoCoords = getTetriminoState(tetrimino)
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            board[i+startingLine][j+blocksIn] = {value: -1, colour: 'Empty'};
        }
    }
    board = redrawBoard(board, context);
    return board;
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
        initPosition: [[0,0,0],[-1,0,-1]],
        clockWise: [[-1,0], [0,0], [-1,0]],
        counterClockwise: [[0,-1], [0, 0], [0,-1]],
        upsideDown: [[-1,0,-1],[0,0,0]],
        colour: 'Red',
        tetrimino: 'tBlock',
        state: 'initPosition'
    };
    let line = {
        initPosition: [[0,0,0,0]],
        clockWise: [[0],[0],[0],[0]],
        counterClockwise: [[0],[0],[0],[0]],
        upsideDown: [[0,0,0,0]],
        colour: 'Green',
        tetrimino: 'line',
        state: 'initPosition'
    };
    let square = {
        initPosition: [[0,0], [0,0]],
        clockWise: [[0,0], [0,0]],
        counterClockwise: [[0,0], [0,0]],
        upsideDown: [[0,0], [0,0]],
        colour: 'Yellow',
        tetrimino: 'square',
        state: 'initPosition'
    };
    let zOne = {
        initPosition: [[0,0,-1],[-1,0,0]],
        clockWise: [[-1,0],[0,0],[0,-1]],
        counterClockwise: [[-1,0],[0,0],[0,-1]],
        upsideDown: [[0,0,-1],[-1,0,0]],
        colour: 'Blue',
        tetrimino: 'zOne',
        state: 'initPosition'
    };
    let zTwo = {
        initPosition: [[-1,0,0],[0,0,-1]],
        clockWise: [[0,-1],[0,0],[-1,0]],
        counterClockwise: [[0,-1],[0,0],[-1,0]],
        upsideDown: [[-1,0,0],[0,0,-1]],
        colour: 'DarkBlue',
        tetrimino: 'zTwo',
        state: 'initPosition'
    };
    let lOne = {
        initPosition: [[0,0,0],[-1,-1,0]],
        clockWise: [[-1,0],[-1,0],[0,0]],
        counterClockwise: [[0,0],[0,-1],[0,-1]],
        upsideDown: [[0,-1,-1],[0,0,0]],
        colour: 'Pink',
        tetrimino: 'lOne',
        state: 'initPosition'
    };
    let lTwo = {
        initPosition: [[0,0,0],[0,-1,-1]],
        clockWise:[[0,-1],[0,-1],[0,0]],
        counterClockwise: [[0,0],[-1,0],[-1,0]],
        upsideDown: [[-1,-1,0], [0,0,0]],
        colour: 'Orange',
        tetrimino: 'lTwo',
        state: 'initPosition'
    }
    tetriminos.push(tBlock);
    tetriminos.push(line);
    tetriminos.push(square);
    tetriminos.push(zOne);
    tetriminos.push(zTwo);
    tetriminos.push(lOne);
    tetriminos.push(lTwo);

    let randomNumber = Math.floor((Math.random() * tetriminos.length));
    return tetriminos[randomNumber];
}

const updateBoard = (board, tetrimino, startingLine, blocksIn, context) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    let tetriIndex = 0;
    let horizontal = 108 + (18 * blocksIn);
    let verticle = 65 + (18 * startingLine);

    //TODO Fix this
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            if(tetriminoCoords[i][tetriIndex] === 0 || tetriminoCoords[i][tetriIndex].marked){
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
        //delete everything directly above tetrimino
        for(let i = 0; i < startingLine; i++){
            for(let j = blocksIn; j < blocksIn + tetriminoCoords[0].length; j++){
                board[i][j] = {value: -1, colour: 'Empty'};
            }
        }

        //Fix issues with certain pieces moving down. Delete left over blockos
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'initPosition' || tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn + 2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'clockWise' || tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn] = {value: 0, colour: 'Red'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'initPosition' || tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'clockWise' || tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'clockWise'){
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: 0, colour: tetrimino.colour};
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
    }
    board = redrawBoard(board, context);
    if(checkForCollision(board, tetrimino, startingLine, blocksIn)){
        return {board: board, end: true};
    }else{
        return board;
    }
};

const checkForCollision = (board, tetrimino, startingLine, blocksIn) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    tetriminoCoords = markTetrimino(tetriminoCoords);
    if(startingLine + tetriminoCoords.length === 20){
        return true;
    }
    //Check for collision with another piece
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            if(!tetriminoCoords[i][j].marked){
                if(tetriminoCoords[i][j] === 0){
                    if(board[startingLine+i+1][blocksIn+j].value === 0){
                        return true;
                    }
                }
            }
        }
    }
};

//Mark a tetrimino so it can't collide with itself
const markTetrimino = (tetriminoCoords) => {
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            if(tetriminoCoords[i][j] === 0){
                //Check there is a block under current
                if(tetriminoCoords[i+1]){
                    //If there is a block that is also 0 we will be using that for collision
                    //Mark current block as not needed for collision detection
                    if(tetriminoCoords[i+1][j] === 0){
                        tetriminoCoords[i][j] = {value: 0, marked: true};
                    }
                }
            }
        }
    }

    return tetriminoCoords;
}

const getTetriminoState = (tetrimino) => {
    let tetriminoCoords;
    if(tetrimino.state === 'initPosition'){
        tetriminoCoords = tetrimino.initPosition;
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
    for(let i = 0; i < tetrimino.initPosition.length; i++){
        for(let j = 0; j < tetrimino.initPosition[0].length; j++){
            if(tetrimino.initPosition[i][j] === 0){
                context.image(horizontal, verticle, colour);
            }
            horizontal += 18;
        }
        horizontal = horizontalInit;
        verticle += 18;
    }
}