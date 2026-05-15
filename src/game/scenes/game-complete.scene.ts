import Phaser from 'phaser';

export class GameCompleteScene extends Phaser.Scene {

    constructor() {
        super('game-complete-scene');
    }

    create() {

        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.cameras.main.setBackgroundColor('#000000');

        const title = this.add.text(
            centerX,
            centerY - 80,
            'YOU WIN!',
            {
                fontSize: '56px',
                color: '#00ff88',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6,
            }
        );

        title.setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scale: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        const subtitle = this.add.text(
            centerX,
            centerY,
            'All levels completed',
            {
                fontSize: '28px',
                color: '#ffffff',
            }
        );

        subtitle.setOrigin(0.5);

        const restartButton = this.add.text(
            centerX,
            centerY + 100,
            'PLAY AGAIN',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: {
                    left: 12,
                    right: 12,
                    top: 8,
                    bottom: 8,
                },
            }
        );

        restartButton
            .setOrigin(0.5)
            .setInteractive();

        restartButton.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
        });

        restartButton.on('pointerout', () => {
            this.input.setDefaultCursor('default');
        });

        restartButton.on('pointerup', () => {
            this.scene.start('level-scene', { level: 1 });
        });

        this.input.keyboard!.once('keyup-SPACE', () => {
            this.scene.start('level-scene', { level: 1 });
        });
    }
}