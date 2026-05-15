import Phaser from 'phaser'
import type {Level} from "../levels/level.ts";
import type {Obstacle} from "../levels/obstacle.ts";
import {LevelManager} from "../levels/level-manager.ts";
import {LevelLoader} from "../levels/level-loader.ts";

/**
 * Scene responsible for displaying any level of the game
 */
export class LevelsScene extends Phaser.Scene {

    // Game objects
    private player!: Phaser.Physics.Arcade.Image
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private collectibles!: Phaser.Physics.Arcade.Group;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private obstacles!: Phaser.Physics.Arcade.StaticGroup;
    private enemies!: Phaser.Physics.Arcade.Group;

    // Game state
    private currentLevel = 1;
    private levelConfig!: Level;
    private remainingCollectibles = 0;
    private score = 0
    private isLevelComplete = false;

    // Game information (HUD)
    private levelText!: Phaser.GameObjects.Text
    private scoreText!: Phaser.GameObjects.Text

    constructor() {
        super('level-scene')
    }

    init(data: { level: number }) {
        // init appropriate level
        const levels = LevelLoader.load(this.cache.json.get('levels'));
        LevelManager.setLevels(levels);

        this.currentLevel = data.level ?? 1;
        const level = LevelManager.get(this.currentLevel);

        if (!level) {
            console.warn(`Level ${this.currentLevel} not found`);
            return;
        }

        this.levelConfig = level;

        this.isLevelComplete = false;
        this.score = 0;
        this.remainingCollectibles = 0;
    }

    preload() {
        const g = this.add.graphics();

        // Player sprite
        this.load.image('player', 'assets/sprites/player_32x32.png');

        // Enemies sprite
        this.load.image('enemy', 'assets/sprites/enemy_32x32.png');

        // Collectibles sprite (gold star)
        g.fillStyle(0xffff00, 1);
        g.lineStyle(1, 0xffffff, 1);
        g.beginPath();
        g.moveTo(8, 1);
        g.lineTo(10, 6);
        g.lineTo(15, 6);
        g.lineTo(11, 9);
        g.lineTo(13, 14);
        g.lineTo(8, 11);
        g.lineTo(3, 14);
        g.lineTo(5, 9);
        g.lineTo(1, 6);
        g.lineTo(6, 6);
        g.closePath();
        g.fillPath();
        g.strokePath();
        g.generateTexture('collectible', 16, 16);
        g.clear();

        // Particle emitted when collecting a collectible
        g.fillStyle(0xffff00, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle', 6, 6);

        g.destroy();

        // Sounds
        this.load.audio('collect-sound', 'assets/audio/collect.mp3');
        this.load.audio('death-sound', 'assets/audio/death.mp3');
    }

    create() {
        // World bounds
        this.physics.world.setBounds(0, 0, 800, 600)

        // Player
        this.player = this.physics.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            'player'
        );
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);

        this.tweens.add({
            targets: this.player,
            scaleX: 0.8,
            scaleY: 0.9,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();

        // Collectibles group
        this.collectibles = this.physics.add.group({
            runChildUpdate: false,
            collideWorldBounds: false,
        });

        // Spawn collectibles
        this.spawnCollectibles(this.levelConfig.collectiblesCount);

        this.particles = this.add.particles(0, 0, 'particle', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            lifespan: 300,
            scale: { start: 1, end: 0 },
            quantity: 10,
            tint: [0xffd43b, 0xffa94d],
            emitting: false,
        });

        // Overlap detection
        this.physics.add.overlap(
            this.player,
            this.collectibles,
            this.collectItem as unknown as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        // Obstacles (if any)
        if (this.levelConfig.obstacles) {
            this.obstacles = this.physics.add.staticGroup();
            this.spawnObstacles(this.levelConfig.obstacles);
            this.physics.add.collider(
                this.player,
                this.obstacles
            );
        }

        // Enemies (if any)
        if (this.levelConfig.enemiesCount) {
            this.enemies = this.physics.add.group({
                runChildUpdate: false,
                collideWorldBounds: false,
            });

            this.spawnEnemies(this.levelConfig.enemiesCount);

            this.physics.add.overlap(
                this.player,
                this.enemies,
                this.touchEnemy,
                undefined,
                this
            );
        }

        // HUD information
        this.levelText = this.add.text(10, 10, `Level ${this.currentLevel}`, {
            fontSize: '20px',
            color: '#ffffff',
        });
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '20px',
            color: '#ffffff',
        });
        this.scoreText.x = this.levelText.x + this.levelText.width + 40;

        // Debug menu
        const params = new URLSearchParams(window.location.search);
        const isDebugMode = params.get('debugMode') === 'true';
        if (isDebugMode) {
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel) {
                debugPanel.style.display = 'flex';
                debugPanel.style.flexDirection = 'column';
                debugPanel.style.gap = '1%';
                debugPanel.innerHTML = `
        <div style="color: red; font-size: 1.2rem; margin-bottom: 20px; text-align: center;">DEBUG MODE</div>
        <button id="lvl1">Level 1</button>
        <button id="lvl2">Level 2</button>
        <button id="lvl3">Level 3</button>
        <button id="lvl4">Level 4</button>
        <button id="lvl5">Level 5</button>
        <button id="lvl6">Level 6</button>
        <button id="lvl7">Level 7</button>
        <button id="lvl8">Level 8</button>
    `;
                document.getElementById('lvl1')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 1 });
                });
                document.getElementById('lvl2')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 2 });
                });
                document.getElementById('lvl3')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 3 });
                });
                document.getElementById('lvl4')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 4 });
                });
                document.getElementById('lvl5')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 5 });
                });
                document.getElementById('lvl6')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 6 });
                });
                document.getElementById('lvl7')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 7 });
                });
                document.getElementById('lvl8')?.addEventListener('click', () => {
                    this.scene.start('level-scene', { level: 8 });
                });
            }
        }

        this.showLevelInstructions();
    }

    update() {
        if (this.isLevelComplete) {
            this.player.setVelocity(0)
            return
        }

        const speed = 120

        this.player.setVelocity(0)

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed)
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed)
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-speed)
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(speed)
        }

        this.player.body?.velocity.normalize().scale(speed)
    }

    private spawnCollectibles(count: number) {
        this.remainingCollectibles = count;

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);

            const item = this.collectibles.create(x, y, 'collectible');
            item.setBlendMode(Phaser.BlendModes.ADD);
            item.body.setAllowGravity(false);
            item.setCollideWorldBounds(true);
            item.setBounce(1);

            if (this.levelConfig.collectiblesMovementEnabled) {
                const speed = 40;
                const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                item.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }

            this.tweens.add({
                targets: item,
                angle: 360,
                alpha: 0.7,
                duration: 5000,
                repeat: -1,
            });
        }
    }

    private showLevelInstructions() {
        const message = this.getLevelInstructions(this.levelConfig);

        this.physics.pause();

        const overlay = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.35
        );

        overlay.setDepth(1000);

        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 60,
            message,
            {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2,
            }
        );

        text.setOrigin(0.5);
        text.setDepth(1001);

        text.setScale(0.5);
        text.setAlpha(0);

        this.tweens.add({
            targets: text,
            scale: 1,
            alpha: 1,
            duration: 500,
            ease: 'Back.Out',
            yoyo: false,
            onComplete: () => {

                this.time.delayedCall(1500, () => {

                    this.tweens.add({
                        targets: [text, overlay],
                        alpha: 0,
                        duration: 400,
                        onComplete: () => {
                            text.destroy();
                            overlay.destroy();

                            this.physics.resume();
                        }
                    });

                });

            }
        });
    }

    private getLevelInstructions(level: Level): string {
        if (level.obstacles?.length && level.enemiesCount) {
            return "Collect all stars. Avoid obstacles and enemies!";
        } else if (level.obstacles) {
            return "Collect all stars. Avoid obstacles!";
        } else if (level.enemiesCount) {
            return "Collect all stars. Avoid enemies!";
        }
        return "Collect all stars.";
    }

    private spawnObstacles(obstacles: Obstacle[]) {
        obstacles.forEach(obs => {
            const rect = this.add.rectangle(
                obs.x + obs.width / 2,
                obs.y + obs.height / 2,
                obs.width,
                obs.height,
                0x444444
            );

            this.physics.add.existing(rect, true); // true = static body

            this.obstacles.add(rect);
        });
    }

    private spawnEnemies(count: number) {

        for (let i = 0; i < count; i++) {

            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);

            const enemy = this.enemies.create(x, y, 'enemy');

            enemy.setScale(0.75);

            enemy.body.setSize(20, 20);
            enemy.body.setOffset(
                (enemy.width - 20) / 2,
                (enemy.height - 20) / 2
            );

            enemy.body.allowGravity = false;

            enemy.setCollideWorldBounds(true);
            enemy.setBounce(1);

            let speed = 60;

            // force greater speed for last level (level 8)
            if (this.levelConfig.levelNumber === 8) {
                speed = 120;
            }

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

            enemy.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
        }
    }

    private collectItem(
        _player: Phaser.GameObjects.GameObject,
        item: Phaser.GameObjects.GameObject
    ) {
        const collectible = item as Phaser.Physics.Arcade.Image;

        // Sound effect
        this.sound.play('collect-sound');

        // Particle burst at item position
        this.particles.emitParticleAt(
            collectible.x,
            collectible.y,
            12
        );

        collectible.disableBody(true, true);

        this.score += 1;
        this.remainingCollectibles -= 1;

        this.scoreText.setText(`Score: ${this.score}`);

        if (this.remainingCollectibles <= 0) {
            this.onLevelComplete();
        }
    }

    private touchEnemy() {
        if (this.isLevelComplete) {
            return;
        }

        // Sound effect
        this.sound.play('death-sound');

        this.physics.pause();

        this.cameras.main.shake(250, 0.01);
        this.cameras.main.flash(150, 255, 0, 0);

        this.player.setTint(0xff0000);

        const text = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Aaargh! Game Over.',
            {
                fontSize: '48px',
                color: '#ff0000',
                fontStyle: 'bold',
            }
        );

        text.setOrigin(0.5);
        text.setDepth(2000);

        this.time.delayedCall(2000, () => {
            this.scene.restart({
                level: this.currentLevel
            });
        });
    }

    private onLevelComplete() {
        this.isLevelComplete = true;

        const centerX = this.cameras.main.centerX
        const centerY = this.cameras.main.centerY

        this.add.rectangle(centerX, centerY, 300, 200, 0x000000, 0.8)
        this.add.text(centerX, centerY - 40, 'Level Complete!', {
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        if (this.levelConfig.levelNumber === 8) {
            this.scene.start('game-complete-scene');
            return;
        }

        const nextLevelButton = this.add.text(centerX, centerY + 40, 'Next Level\n\n(press N)', {
            fontSize: '20px',
            color: '#00ff88',
            backgroundColor: '#333333',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
        })
            .setOrigin(0.5)
            .setInteractive();

        nextLevelButton.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
        });

        nextLevelButton.on('pointerout', () => {
            this.input.setDefaultCursor('default');
        });

        nextLevelButton.on('pointerup', () => {
            this.tweens.add({
                targets: nextLevelButton,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 80,
                yoyo: true,
                ease: 'Quad.easeOut',
                onComplete: () => {
                    this.goToNextLevel();
                },
            });
        });

        const nextKey = this.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.N
        );

        nextKey.once('up', () => {
            this.goToNextLevel();
        });
    }

    private goToNextLevel() {
        const next = LevelManager.getNext(this.currentLevel);
        this.scene.start('level-scene', { level: next!.levelNumber });
    }
}