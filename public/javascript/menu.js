class menu extends Phaser.Scene {
    constructor(){
        super({key: "menu"})
    }

    preload(){
        this.load.image('MenuImage', 'assets/mainMenu.png');
        this.load.image('StartImage', 'assets/start.png');
        this.load.image('StartImageHover', 'assets/start_hover.png');
    }

    create(){
        this.add.image(335,245, 'MenuImage');
        this.startButton = this.add.image(340, 400, 'StartImage')
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => this.scene.start('mainGame'))
            .on('pointerover', () => this.startButton.setTexture('StartImageHover'))
            .on('pointerout', () => this.startButton.setTexture('StartImage'));

    }

}