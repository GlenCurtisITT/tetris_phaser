class gameover extends Phaser.Scene {
    constructor(){
        super({key: "gameover"})
    }

    init(data)
    {
        this.stats = data.stats;
    }

    preload(){
        this.load.image('Board', 'assets/board.png');
        this.load.audio('GameOver', 'assets/gameover.mp3');
    }

    create(){
        this.gameover = this.sound.add('GameOver', {volume: 0.2});
        this.gameover.play();
        this.add.image(335,245, 'Board');

        this.add.text(100, 80, `GAMEOVER`, { fontSize: '32px', fill: '#c4cfa1', fontFamily: 'Arial' });
        this.add.text(160, 130, `Level: ${this.stats.level}`, { fontSize: '24px', fill: '#c4cfa1', fontFamily: 'Arial' });
        this.add.text(100, 170, `Lines Completed: ${this.stats.lines}`, { fontSize: '24px', fill: '#c4cfa1', fontFamily: 'Arial' });
        this.add.text(130, 210, `Final Score: ${this.stats.score}`, { fontSize: '24px', fill: '#c4cfa1', fontFamily: 'Arial' });
        this.add.text(85, 420, `Press 'ESC' to go back to the menu.`, { fontSize: '14px', fill: '#c4cfa1', fontFamily: 'Arial' });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('menu');
        });
    }
}