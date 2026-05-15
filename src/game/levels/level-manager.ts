import type { Level } from "./level.ts";

export class LevelManager {
    private static levels: Level[] = [];

    static setLevels(levels: Level[]) {
        this.levels = levels;
    }

    static get(levelNumber: number): Level | undefined {
        return this.levels.find(l => l.levelNumber === levelNumber);
    }

    static getNext(currentLevel: number): Level | undefined {
        return this.get(currentLevel + 1);
    }

    static exists(levelNumber: number): boolean {
        return this.get(levelNumber) !== undefined;
    }
}