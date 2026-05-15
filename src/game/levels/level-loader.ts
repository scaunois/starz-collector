import type {Level} from "./level.ts";

export class LevelLoader {
    static load(data: any): Level[] {
        return data as Level[];
    }
}