var config = {
    type: Phaser.AUTO,
    width: 670,
    height: 490,
    audio: {
        disableWebAudio: true
    },
    scene: [menu, mainGame, gameover]
};

var game = new Phaser.Game(config);

