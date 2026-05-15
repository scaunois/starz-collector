import type {Obstacle} from "./obstacle.ts";

export interface Level {
    levelNumber: number;
    collectiblesCount: number;
    collectiblesMovementEnabled?: boolean;
    obstacles?: Obstacle[];
    enemiesCount?: number;
}
