class mainGame extends Phaser.Scene {
    constructor(){
        super({key: "mainGame"})
    }

    preload(){
        this.load.image('Board', 'assets/board.png');
        this.load.image('Empty', 'assets/emptyBlocko.png');
        this.load.image('Black', 'assets/blackBlocko.png');
        this.load.image('NextWindow', 'assets/nextWindowBlocko.png');
        this.load.image('Red', 'assets/redBlocko.png');
        this.load.image('Yellow', 'assets/yellowBlocko.png');
        this.load.image('Green', 'assets/greenBlocko.png');
        this.load.image('Pink', 'assets/pinkBlocko.png');
        this.load.image('Blue', 'assets/blueBlocko.png');
        this.load.image('DarkBlue', 'assets/darkBlueBlocko.png');
        this.load.image('Orange', 'assets/orangeBlocko.png');
    }

    create(){
        //this.timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });
        this.stats = {
            score: 0,
            level: 1,
            lines: 0
        };
        this.level = 1;
        this.lines = 0;
        this.currentPostition = 0;
        this.blocksIn = 4;
        this.add.image(335,245, 'Board');
        //Create Board, 10x20 blocks
        this.board = createBoard(10, 20);
        this.nextWindow = createBoard(5, 4);
        this.board = drawBoard(this.board, this.add);
        this.currentTetrimino = getTetrimino();
        this.nextTetrimino = getTetrimino();
        drawNextTetriminoWindow(this.nextTetrimino, this.add);
        this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
        this.add.text(480, 95, this.stats.score, { fontSize: '32px', fill: '#000' });
        this.add.text(480, 185, this.stats.level, { fontSize: '32px', fill: '#000' });
        this.add.text(480, 260, this.stats.lines, { fontSize: '32px', fill: '#000' });
        this.input.keyboard.on('keydown-S', () => {
            //Clear the images from memory to avoid memory leak
            clearImagesFromCache(this.nextTetrimino, this.add, this.score, this.level, this.lines);
            this.currentPostition++;
            this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'down');
            if(this.board.end){
                this.currentPostition = 0;
                this.blocksIn = 4;
                this.currentTetrimino = this.nextTetrimino;
                this.nextTetrimino = getTetrimino();
                drawNextTetriminoWindow(this.nextTetrimino, this.add);
                this.board = updateBoard(this.board.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
            }
            //TODO Add game-over screen when Tetriminos reach the top
        });
        this.input.keyboard.on('keydown-W', () => {
            this.board = changeState(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
        });
        this.input.keyboard.on('keydown-A', () => {
            if(this.blocksIn !== 0 && !checkForCollisionLeft(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn)){
                this.blocksIn--;
                this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'left');
            }
        });
        this.input.keyboard.on('keydown-D', () => {
           let tetriCoords = getTetriminoState(this.currentTetrimino);
           if(this.blocksIn + tetriCoords[0].length !== 10){
               this.blocksIn++;
               this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'right');
           }
        });
    }
}

const clearImagesFromCache = (nextTetrimino, context, score, level, lines) => {
    //Images stored in this.add.displayList.list
    context.displayList.list = [];
    context.image(335,245, 'Board');
    context.text(480, 95, score, { fontSize: '32px', fill: '#000' });
    context.text(480, 185, level, { fontSize: '32px', fill: '#000' });
    context.text(480, 260, lines, { fontSize: '32px', fill: '#000' });
    drawNextTetriminoWindow(nextTetrimino, context);
};

const createBoard = (horizontal, vertical) => {
    return [...Array(vertical)].map(x=>Array(horizontal).fill({value: -1, colour: 'Empty'}));
};

const drawBoard = (board, context) => {
    let horizontal = 108;
    let verticle = 65;
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            context.image(horizontal, verticle, 'Black');
            horizontal += 18;
        }
        horizontal = 108;
        verticle += 18;
    }

    return board;
};

const drawNextTetriminoWindow = (tetrimino, context) => {
    let tetriCoords = tetrimino.initPosition;
    let horizontal = 475;
    let verticle = 415;
    for(let i = 0; i < 2; i++){
        for(let j = 0; j < 4; j++){
            //If not a line piece
            if(tetriCoords.length > 1){
                if(tetriCoords[i][j] === 0){
                    context.image(horizontal, verticle, tetrimino.colour);
                }else{
                    context.image(horizontal, verticle, 'NextWindow');
                }
            }else{
                if(i === 0){
                    context.image(horizontal, verticle, tetrimino.colour);
                }else{
                    context.image(horizontal, verticle, 'NextWindow');
                }
            }
            horizontal += 18;
        }
        horizontal = 475;
        verticle += 18;
    }
};

const changeState = (board, tetrimino, startingLine, blocksIn, context) => {
    //Deep copy object
    let tempTetrimino = Object.assign({}, tetrimino);
    tempTetrimino = changeTetriminoState(tempTetrimino);
    tempTetrimino = getTetriminoState(tempTetrimino);
    //Make sure when state is changed that the tetrimino does not go out of board
    if(tempTetrimino[0].length + blocksIn <= 10){
        board = clearTetrimino(board, tetrimino, startingLine, blocksIn, context);
        tetrimino = changeTetriminoState(tetrimino);
        board = updateBoard(board, tetrimino, startingLine, blocksIn, context);
        return board;
    }
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
};

const redrawBoard = (board, context) => {
    let horizontal = 108;
    let verticle = 65;
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            if(board[i][j].value === -1){
                context.image(horizontal, verticle, 'Black');
            }else{
                context.image(horizontal, verticle, board[i][j].colour);
            }
            horizontal += 18;
        }
        horizontal = 108;
        verticle += 18;
    }

    return board;
};

const checkForCompletedLines = (board) => {
    let completedLines = 0;
    let lineComplete = false;
    //Track line location of clears
    let location = [];
    for(let i = 0; i < board.length; i++){
        if(board[i][0].value === -1){
            continue;
        }
        for(let j = 0; j < board[0].length; j++){
            if(board[i][j].value === -1){
                break;
            }else if(j === board[0].length - 1 && board[i][j].value === 0){
                completedLines++;
                location.push(i);
                lineComplete = true;
            }
        }
    }
    if(lineComplete){
        //Clear Line
        //Move lines down
        //Add score
        //Update Lines Cleared
        for(let i = 0; i < location.length; i++){
            for(let j = 0; j < board[0].length; j++){
                board[location[i]][j] = {value: -1, colour: 'Empty'};
            }
        }
        dropLines(board);

    }
    console.log(lineComplete);

    return board;
};

const dropLines = (board) => {
   let line = [];
   let droppingLines = true;
   while(droppingLines){
       for(let i = 0; i < board.length; i++){
           let blockExists = false;
           for(let j = 0; j < board[0].length; j++){
               line.push(board[i][j]);
               if(board[i][j].value === 0){
                   blockExists = true;
               }
           }
           if(blockExists === true){
               if((i+1) !== board.length){
                   let lineEmpty = true;
                   for(let k = 0; k < board[0].length; k++){
                       if(board[i+1][k].value === 0){
                           lineEmpty = false;
                       }
                   }
                   if(lineEmpty){
                       for(let l = 0; l < board[0].length; l++){
                           board[i][l] = {value: -1, colour: 'Empty'};
                           board[i+1][l] = line[l];
                       }
                       dropLines(board);
                   }
               }
           }
           line = [];
           if((i+1) === board.length){
               droppingLines = false;
           }
       }
   }


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

const updateBoard = (board, tetrimino, startingLine, blocksIn, context, movement) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    let tetriIndex = 0;
    let horizontal = 108 + (18 * blocksIn);
    let verticle = 65 + (18 * startingLine);

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
        //delete everything directly above tetrimino while moving down as long as its not 0
        for(let i = 0; i < startingLine; i++){
            for(let j = blocksIn; j < blocksIn + tetriminoCoords[0].length; j++){
                board[i][j] = {value: -1, colour: 'Empty'};
            }
        }
    }

    //Fix issues with pieces moving down
    if(movement === 'down'){
        // zOne
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        // zTwo
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        //tBlock
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        //lOne
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'clockWise'){
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        //lTwo
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'clockWise'){
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
    }

    //Fix issues with pieces moving left
    if(movement === 'left'){
        //zOne
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+3] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+3] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        //zTwo
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+3] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+3] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        //Square
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        //Line
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+4] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+3][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+3][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+4] = {value: -1, colour: 'Empty'};
        }
        //tBlock
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+3] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+3] = {value: -1, colour: 'Empty'};
        }
        //lOne
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+3] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+3] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+3] = {value: -1, colour: 'Empty'};
        }
        //lTwo
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn+3] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+2] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn+2] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+3] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+3] = {value: -1, colour: 'Empty'};
        }
    }

    //Fix issues with blocks moving right
    if(movement === 'right'){
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zOne' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'zTwo' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'square' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+3][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+3][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'line' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'tBlock' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn+1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lOne' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'initPosition'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'clockWise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'counterClockwise'){
            board[startingLine][blocksIn-1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn] = {value: -1, colour: 'Empty'};
            board[startingLine+2][blocksIn] = {value: -1, colour: 'Empty'};
        }
        if(tetrimino.tetrimino === 'lTwo' && tetrimino.state === 'upsideDown'){
            board[startingLine][blocksIn+1] = {value: -1, colour: 'Empty'};
            board[startingLine+1][blocksIn-1] = {value: -1, colour: 'Empty'};
        }
    }

    board = redrawBoard(board, context);
    if(checkForCollision(board, tetrimino, startingLine, blocksIn)){
        board = checkForCompletedLines(board);
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

const checkForCollisionLeft = (board, tetrimino, startingLine, blocksIn) => {
    if(blocksIn === 0){
        return false;
    }
    let tetriminoCoords = getTetriminoState(tetrimino);
    tetriminoCoords = clearMarks(tetriminoCoords);
    tetriminoCoords = markTetriminoLeft(tetriminoCoords);
    for(let i = 0; i < tetriminoCoords.length; i++) {
        for (let j = 0; j < tetriminoCoords[0].length; j++) {
            if (!tetriminoCoords[i][j].marked) {
                if(tetriminoCoords[i][j] === 0){
                    if(board[startingLine+i][blocksIn-1].value === 0){
                        return true;
                    }
                }
            }
        }
    }
};

const clearMarks = (tetriminoCoords) => {
    //Need to create a new array here, problem in javascript overwriting objects with 0 in arrays
    let returnedArray = new Array(tetriminoCoords.length);
    for(let i = 0; i < tetriminoCoords.length; i++){
        returnedArray[i] = [];
    }
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            if(tetriminoCoords[i][j].marked){
                returnedArray[i][j] = 0;
            }else if(tetriminoCoords[i][j] === 0){
                returnedArray[i][j] = 0;
            }else{
                returnedArray[i][j] = -1;
            }
        }
    }

    return returnedArray;
}

const markTetriminoLeft = (tetriminoCoords) => {
    for(let i = 0; i < tetriminoCoords.length; i++) {
        for (let j = 0; j < tetriminoCoords[0].length; j++) {
            let blockRight = j;
            if(tetriminoCoords[i][j] === 0){
                while(blockRight < tetriminoCoords[0].length){
                    if(tetriminoCoords[i][blockRight+1] === 0){
                        tetriminoCoords[i][blockRight+1] = {value: 0, marked: true};
                    }
                    blockRight++;
                }
            }
        }
    }
    return tetriminoCoords;
}

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
};

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
};

function onEvent ()
{
    clearImagesFromCache(this.nextTetrimino, this.add);
    this.currentPostition++;
    this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'down');
    if(this.board.end){
        this.currentPostition = 0;
        this.blocksIn = 4;
        this.currentTetrimino = this.nextTetrimino;
        this.nextTetrimino = getTetrimino();
        //drawNextTetrimino(this.nextTetrimino, this.nextTetrimino.colour, this.add);
        this.board = updateBoard(this.board.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add);
    }
}