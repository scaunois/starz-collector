import Phaser from 'phaser';
import {LevelLoader} from "../levels/level-loader.ts";
import {LevelManager} from "../levels/level-manager.ts";

/**
 * Scene responsible for loading assets that need to be available in init() method of other scenes.
 * This scene is the first scene to be executed by the game.
 */
export class BootScene extends Phaser.Scene {

    constructor() {
        super('boot-scene');
    }

    preload() {
        // load levels descriptions
        this.load.json('levels', 'assets/levels/levels.json');

        // load main music
        this.load.audio('game-music', 'assets/audio/game-music.mp3');
    }

    create() {
        // set levels descriptions in the LevelManager
        const levelsAsJson = this.cache.json.get('levels');
        const levels = LevelLoader.load(levelsAsJson);
        LevelManager.setLevels(levels);

        // Play game music
        const music = this.sound.add('game-music', {
            loop: true,
            volume: 0.1
        });

        music.play();

        this.scene.start('level-scene', { level: 1 });
    }
}