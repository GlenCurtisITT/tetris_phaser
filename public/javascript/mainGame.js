class mainGame extends Phaser.Scene {
    constructor(){
        super({key: "mainGame"})
    }

    init(data)
    {
        this.level = data.level;
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

        this.load.audio('backgroundMusic', 'assets/Tetris.mp3');
        this.load.audio('PieceRotation', 'assets/whoosh.mp3');
        this.load.audio('Drop', 'assets/drop.mp3');
        this.load.audio('LineClear', 'assets/lineClear.mp3');
    }

    create(){
        this.backgroundMusic = this.sound.add('backgroundMusic', {volume: 0.2});
        this.backgroundMusic.loop = true;
        this.pieceRotation = this.sound.add('PieceRotation', {volume: 0.2});
        this.pieceDrop = this.sound.add('Drop', {volume: 0.2});
        this.lineClear = this.sound.add('LineClear', {volume: 0.2});
        this.backgroundMusic.play();
        this.timedEvent = this.time.addEvent({ delay: 900 - (this.level * 100), callback: moveDownOnTimer, callbackScope: this, loop: true });
        this.stats = {
            score: 0,
            level: this.level,
            lines: 0
        };
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
        this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, '', this.stats, this.lineClear);
        //Add stats onto page
        this.add.text(480, 95, this.stats.score, { fontSize: '32px', fill: '#000' });
        this.add.text(480, 185, this.stats.level, { fontSize: '32px', fill: '#000' });
        this.add.text(480, 260, this.stats.lines, { fontSize: '32px', fill: '#000' });
        /*
        When down key is pressed:
        - Clear images from cache.
        - ++ Current Position.
        - Update the board. If board is returned with end flag reset position to top.
         */
        this.input.keyboard.on('keydown-S', () => {
            clearImagesFromCache(this.nextTetrimino, this.add, this.stats);
            this.currentPostition++;
            this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'down', this.stats, this.lineClear);
            if(this.board.end){
                this.currentPostition = 0;
                this.blocksIn = 4;
                this.currentTetrimino = this.nextTetrimino;
                this.nextTetrimino = getTetrimino();
                if(gameOver(this.board, this.currentTetrimino, this.blocksIn)){
                    //Pass stats to gameover scene
                    this.backgroundMusic.stop();
                    this.scene.start('gameover', {stats: this.stats});
                }
                this.pieceDrop.play();
                drawNextTetriminoWindow(this.nextTetrimino, this.add);
                this.board = updateBoard(this.board.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, '', this.stats, this.lineClear);
            }
        });
        /*
        When w key is pressed:
        - Change state of Tetrimino
        - Check change state function for more information.
         */
        this.input.keyboard.on('keydown-W', () => {
            this.board = changeState(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, this.stats, this.pieceRotation, this.lineClear);
        });
        /*
        When A key is pressed:
        - First check that you are not in the first position on the board. (Furthest Left)
        - Also check you are not colliding with another block. Check checkForCollisionLeft function for more info
        - If these checks pass move position (blocksIn) to the left (-1)
        - Update board
         */
        this.input.keyboard.on('keydown-A', () => {
            if(this.blocksIn !== 0 && !checkForCollisionLeft(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn)){
                this.blocksIn--;
                this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'left', this.stats, this.lineClear);
            }
        });
        /*
        When D key is pressed:
        - First get the current state of the Tetrimino (To find length)
        - Check if the current position of the Tetrimino + the length will go past the edge
        - If it does not most the position of the Tetrimino (+1)
        - Update board
         */
        this.input.keyboard.on('keydown-D', () => {
            checkForCollisionRight(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn);
           let tetriCoords = getTetriminoState(this.currentTetrimino);
           if(this.blocksIn + tetriCoords[0].length !== 10 && !checkForCollisionRight(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn)){
               this.blocksIn++;
               this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'right', this.stats, this.lineClear);
           }
        });
        this.input.keyboard.on('keydown-ESC', () => {
            this.backgroundMusic.stop();
            this.scene.start('menu');
        });
    }
}

/*
- Check if any coloured blocks exist in the first three lines of the board under the current tetrimino
- If they do game over
 */
const gameOver = (board, currentTetrimino, blocksIn) => {
    for(let i = 0; i < 3; i++){
        for(let j = blocksIn; j < board.board[0].length - currentTetrimino.initPosition[0].length; j++){
            if(board.board[i][j].value === 0){
                return true;
            }
        }
    }
    return false;
};

/*
- This probably is not the most optimal solution to deal with images.
- Issue with images building up in memory each time the board is updated causing lag
- This function clears all images from memory and draws images that are necessary
 */
const clearImagesFromCache = (nextTetrimino, context, stats) => {
    //Images stored in this.add.displayList.list
    context.displayList.list = [];
    context.image(335,245, 'Board');
    context.text(480, 95, stats.score, { fontSize: '32px', fill: '#000' });
    context.text(480, 185, stats.level, { fontSize: '32px', fill: '#000' });
    context.text(480, 260, stats.lines, { fontSize: '32px', fill: '#000' });
    drawNextTetriminoWindow(nextTetrimino, context);
};

/*
- Create a Tetris board
- This is a 2d array 10x20 filled initially with the object {-1, 'Empty'}
 */
const createBoard = (horizontal, vertical) => {
    return [...Array(vertical)].map(x=>Array(horizontal).fill({value: -1, colour: 'Empty'}));
};

/*
- Draw the Tetris board to the screen.
- Define an initial horizontal and verticle
- For each entry in the 2d Array draw a 6x6px Black square.
 */
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

/*
- Draw the map of the Next Tetrimino Window and fill with colours of next Tetrimino
- Line pieces don't display correctly without the if statement here
 */
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

/*
(Parent function of changeTetriminoState)
- Change the state of the Tetrimino
- Error checking to make sure that the state change does not overflow the right side of the screen
- If it does overflow do nothing and return board.
 */
const changeState = (board, tetrimino, startingLine, blocksIn, context, stats, sound, soundTwo) => {
    //Deep copy object
    let tempTetrimino = Object.assign({}, tetrimino);
    tempTetrimino = changeTetriminoState(tempTetrimino);
    tempTetrimino = getTetriminoState(tempTetrimino);
    //Make sure when state is changed that the tetrimino does not go out of board
    if(tempTetrimino[0].length + blocksIn <= 10){
        board = clearTetrimino(board, tetrimino, startingLine, blocksIn, context);
        tetrimino = changeTetriminoState(tetrimino);
        board = updateBoard(board, tetrimino, startingLine, blocksIn, context, stats, sound);
        sound.play();
        return board;
    }
    return board;
};

/*
- Look at current state
- Change state in a clockwise manner
- Return Tetrimino
 */
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
};

/*
- Function to clear the position of the Tetrimino on the board
- Replaces where ever the tetris is on the board with empty object {-1, 'Empty'}
- Redraw the board so user can see changes
 */
const clearTetrimino = (board, tetrimino, startingLine, blocksIn, context) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            board[i+startingLine][j+blocksIn] = {value: -1, colour: 'Empty'};
        }
    }
    board = redrawBoard(board, context);
    return board;
};

/*
- Take the current state of the board and draw it to the screen
- Usually called after clearing images from cache
- Simple if check, if value = -1 draw black square otherwise draw the colour
 */
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

/*
- Called when the End board flag is pushed to board (Tetrimino has collision or reaches bottom)
 */
const checkForCompletedLines = (board, stats, sound) => {
    let completedLines = 0;
    let lineComplete = false;
    let location = [];
    for(let i = 0; i < board.length; i++){
        //If the first value is not a colour the line is not complete. Skip
        if(board[i][0].value === -1){
            continue;
        }
        for(let j = 0; j < board[0].length; j++){
            //If any value in the line is not 0 break and skip to next line
            if(board[i][j].value === -1){
                break;
                /*
                - If we have not broken out and are at the last value,
                and that value is 0 the line is complete. Push that line number
                to a temp array to use later for replacing. This is an array because
                multiple lines can be cleared with the same drop.
                */
            }else if(j === board[0].length - 1 && board[i][j].value === 0){
                completedLines++;
                location.push(i);
                lineComplete = true;
            }
        }
    }
    //If the line is complete we want to clear it from the board
    if(lineComplete){
        //Loop for how many values pushed to the location array
        for(let i = 0; i < location.length; i++){
            for(let j = 0; j < board[0].length; j++){
                //Clear the line where the value of the location array is
                board[location[i]][j] = {value: -1, colour: 'Empty'};
            }
        }
        sound.play();
        updateScore(completedLines, stats);
        dropLines(board);
    }
    return board;
};

/*
- Take in the Lines Cleared and update score.
- Using score of classic 1989 Tetris
 */
const updateScore = (linesCleared, stats) => {
  switch(linesCleared){
      case 0:
          return;
      case 1:
          stats.score += 40;
          stats.lines += 1;
          return;
      case 2:
          stats.score += 80;
          stats.lines += 2;
          return;
      case 3:
          stats.score += 120;
          stats.lines += 3;
          return;
      case 4:
          stats.score += 140;
          stats.lines += 4;
          return;
  }
};

/*
- Recursive function for dropping lines to the bottom of the board.
- Check inline comments
 */
const dropLines = (board) => {
   let line = [];
   let droppingLines = true;
   while(droppingLines){
       //Begin looping through the entire board
       for(let i = 0; i < board.length; i++){
           let blockExists = false;
           //Loop through line
           for(let j = 0; j < board[0].length; j++){
               //Put line values into temp variable
               //This is used later to move the line down
               line.push(board[i][j]);
               if(board[i][j].value === 0){
                   blockExists = true;
               }
           }
           if(blockExists === true){
               //If we are not at the bottom of the board already
               if((i+1) !== board.length){
                   let lineEmpty = true;
                   //Check if the line under current line is empty
                   for(let k = 0; k < board[0].length; k++){
                       if(board[i+1][k].value === 0){
                           lineEmpty = false;
                       }
                   }
                   //This if statement fires if there is a line with a block
                   //directly above a line that is currently empty. Resulting in a floating block
                   if(lineEmpty){
                       //If this is the case loop from left to right of the board at current position (i)
                       for(let l = 0; l < board[0].length; l++){
                           //Make current line empty
                           board[i][l] = {value: -1, colour: 'Empty'};
                           //Make line below = this current line with blocks
                           board[i+1][l] = line[l];
                       }
                       //Recursively call function until there is no floating block lines
                       dropLines(board);
                   }
               }
           }
           line = [];
           //If we are at the bottom of the board we have dropped all lines to the correct position
           //Set while variable to false and exit
           if((i+1) === board.length){
               droppingLines = false;
           }
       }
   }
};
/*
- Define the shape of each Tetrimino and what they look like in each state
- Put shapes into an array
- Use sudo-randomly generated number to pull a Tetrimino from array and return.
 */
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
    };
    tetriminos.push(tBlock);
    tetriminos.push(line);
    tetriminos.push(square);
    tetriminos.push(zOne);
    tetriminos.push(zTwo);
    tetriminos.push(lOne);
    tetriminos.push(lTwo);

    let randomNumber = Math.floor((Math.random() * tetriminos.length));
    return tetriminos[randomNumber];
};

/*
- Take in current state of the board, what line we are on, how many blocks we are in etc
- Use this info to draw the images to the board and fix issues from Tetrimino's moving around
- More information in inline comments
 */
const updateBoard = (board, tetrimino, startingLine, blocksIn, context, movement, stats, sound) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    tetriminoCoords = clearMarks(tetriminoCoords);
    //Issue caused by moving a piece left or right while it is over another piece
    //End flag is set. Get rid of this flag and check for collision.
    if(board.board){
        board = board.board;
        if(checkForCollision(board, tetrimino, startingLine, blocksIn)){
            board = checkForCompletedLines(board, stats, sound);
            return {board: board, end: true};
        }
    }
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
        //zOne
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
        //zTwo
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
        //square
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
        //line
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
        //tBlock
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
        //lOne
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
        //lTwo
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
    //After updates have been done redraw the board.
    board = redrawBoard(board, context);
    //Check for collision going down vertically
    if(checkForCollision(board, tetrimino, startingLine, blocksIn)){
        board = checkForCompletedLines(board, stats, sound);
        return {board: board, end: true};
    }else{
        return board;
    }
};

/*
- Function to check for collision (For Tetrimino's going down)
- First we mark a tetris piece to ensure it doesn't fire for "colliding with itself"
- Example:
    - Tblock (Init Position):
    - Unmarked:
    [0, 0, 0]
    [-1,0,-1]
    This would fire a false position as [0][1] is colliding with [1][1]
    -Marked:
    [0, {}, 0]
    [-1, 0,-1]
    Now the false positive position is an object with a value and marked flag
    We check for this in the if statement to avoid false positives
 */
const checkForCollision = (board, tetrimino, startingLine, blocksIn) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    tetriminoCoords = markTetrimino(tetriminoCoords);
    if(startingLine + tetriminoCoords.length === 20){
        return true;
    }
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

/*
- Check for collisions when pieces moving left. Same principle as checkForCollision function
 */
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

const checkForCollisionRight = (board, tetrimino, startingLine, blocksIn) => {
    let tetriminoCoords = getTetriminoState(tetrimino);
    if((blocksIn + tetriminoCoords[0].length === 10)){
        return false;
    }
    tetriminoCoords = clearMarks(tetriminoCoords);
    tetriminoCoords = markTetriminoRight(tetriminoCoords);
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            if (!tetriminoCoords[i][j].marked) {
                if(tetriminoCoords[i][j] === 0){
                    if(board[startingLine+i][blocksIn+tetriminoCoords[0].length].value === 0){
                        return true;
                    }
                }
            }
        }
    }
};

/*
- If we add a mark into a Tetrimino we want to remove it before updating the board
 */
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
};
/*
- Mark a tetrimino so it can't collide with itself
 */
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

/*
- Mark a Tetris block so it can't collide with itself when moving left
 */
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
};

/*
- Mark a Tetris block so it can't collide with itself when moving right
 */
const markTetriminoRight = (tetriminoCoords) => {
    for(let i = 0; i < tetriminoCoords.length; i++){
        for(let j = 0; j < tetriminoCoords[0].length; j++){
            let blockLeft = tetriminoCoords[0].length-1;
            if(tetriminoCoords[i][j] === 0){
                while(blockLeft > 0){
                    if(tetriminoCoords[i][blockLeft-1] === 0){
                        tetriminoCoords[i][blockLeft-1] = {value: 0, marked: true};
                    }
                    blockLeft--;
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

function moveDownOnTimer(){
    clearImagesFromCache(this.nextTetrimino, this.add, this.stats);
    this.currentPostition++;
    this.board = updateBoard(this.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, 'down', this.stats, this.lineClear);
    if(this.board.end){
        this.currentPostition = 0;
        this.blocksIn = 4;
        this.currentTetrimino = this.nextTetrimino;
        this.nextTetrimino = getTetrimino();
        if(gameOver(this.board, this.currentTetrimino, this.blocksIn)){
            this.backgroundMusic.stop();
            this.scene.start('gameover', {stats: this.stats});
        }
        this.pieceDrop.play();
        drawNextTetriminoWindow(this.nextTetrimino, this.add);
        this.board = updateBoard(this.board.board, this.currentTetrimino, this.currentPostition, this.blocksIn, this.add, this.stats);
    }
}