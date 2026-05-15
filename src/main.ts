import './style.css'
import Phaser from 'phaser'
import {LevelsScene} from './game/scenes/levels.scene.ts'
import {BootScene} from "./game/scenes/boot.scene.ts";
import {GameCompleteScene} from "./game/scenes/game-complete.scene.ts";

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#222222',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: [
        BootScene,
        LevelsScene,
        GameCompleteScene,
    ],
}

new Phaser.Game(config)