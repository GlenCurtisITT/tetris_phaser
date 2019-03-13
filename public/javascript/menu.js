class menu extends Phaser.Scene {
    constructor(){
        super({key: "menu"})
    }

    preload(){
        this.load.image('MenuImage', 'assets/mainMenu.png');
        this.load.image('StartImage', 'assets/start.png');
        this.load.image('StartImageHover', 'assets/start_hover.png');
        this.load.image('MenuOptionStatic', 'assets/menuOptionStatic.png');
        this.load.image('MenuOptionHover', 'assets/menuOptionHover.png');
        this.load.image('MenuOptionClicked', 'assets/menuOptionClicked.png');
    }

    create(){
        this.add.image(335,245, 'MenuImage');
        this.level = 1;
        this.add.text(275, 280, 'Level Selected:', { fontSize: '16px', fill: '#c4cfa1', fontFamily: 'Arial' });
        this.levelText = this.add.text(390, 280, this.level, { fontSize: '16px', fill: '#c4cfa1', fontFamily: 'Arial' });

        this.menuOptionOne = this.add.image(260, 200, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 1;
                this.levelText.setText(this.level);
                this.menuOptionOne.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionOne.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionOne.setTexture('MenuOptionStatic'));

        this.menuOptionTwo = this.add.image(310, 200, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 2;
                this.levelText.setText(this.level);
                this.menuOptionTwo.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionTwo.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionTwo.setTexture('MenuOptionStatic'));

        this.menuOptionThree = this.add.image(360, 200, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 3;
                this.levelText.setText(this.level);
                this.menuOptionThree.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionThree.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionThree.setTexture('MenuOptionStatic'));

        this.menuOptionFour = this.add.image(410, 200, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 4;
                this.levelText.setText(this.level);
                this.menuOptionFour.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionFour.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionFour.setTexture('MenuOptionStatic'));

        this.menuOptionFive = this.add.image(260, 250, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 5;
                this.levelText.setText(this.level);
                this.menuOptionFive.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionFive.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionFive.setTexture('MenuOptionStatic'));

        this.menuOptionSix = this.add.image(310, 250, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 6;
                this.levelText.setText(this.level);
                this.menuOptionSix.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionSix.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionSix.setTexture('MenuOptionStatic'));

        this.menuOptionSeven = this.add.image(360, 250, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 7;
                this.levelText.setText(this.level);
                this.menuOptionSeven.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionSeven.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionSeven.setTexture('MenuOptionStatic'));

        this.menuOptionEight = this.add.image(410, 250, 'MenuOptionStatic')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                this.level = 8;
                this.levelText.setText(this.level);
                this.menuOptionEight.setTexture('MenuOptionClicked')
            })
            .on('pointerover', () => this.menuOptionEight.setTexture('MenuOptionHover'))
            .on('pointerout', () => this.menuOptionEight.setTexture('MenuOptionStatic'));

        this.add.text(251, 183, '1', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(301, 183, '2', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(351, 183, '3', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(401, 183, '4', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(251, 233, '5', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(301, 233, '6', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(351, 233, '7', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });
        this.add.text(401, 233, '8', { fontSize: '32px', fill: '#414141', fontFamily: 'Arial' });

        this.startButton = this.add.image(340, 400, 'StartImage')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => this.scene.start('mainGame', {level: this.level}))
            .on('pointerover', () => this.startButton.setTexture('StartImageHover'))
            .on('pointerout', () => this.startButton.setTexture('StartImage'));

    }

}