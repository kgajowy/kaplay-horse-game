import type { KAPLAYCtx } from "kaplay";
import { HorseState } from "./Horse";

export type HorseSprites = Record<HorseState, string>;

const HORSE_STATES: Record<HorseState, { path: string; frames: number }> = {
	[HorseState.Idle]: { path: "sprites/horse-1/Horse-Idle.png", frames: 4 },
	[HorseState.Walk]: { path: "sprites/horse-1/Horse-Walk.png", frames: 6 },
	[HorseState.Run]: { path: "sprites/horse-1/Horse-Run.png", frames: 6 },
	[HorseState.Eat]: { path: "sprites/horse-1/Horse-Eat.png", frames: 13 },
	[HorseState.Sit]: { path: "sprites/horse-1/Horse-Sit.png", frames: 12 },
};

export class SpriteFactory {
	constructor(private k: KAPLAYCtx) {}

	createHorse(): HorseSprites {
		const sprites = {} as HorseSprites;
		for (const [state, { path, frames }] of Object.entries(HORSE_STATES) as [
			HorseState,
			{ path: string; frames: number },
		][]) {
			const name = `horse-${state}`;
			this.k.loadSprite(name, path, {
				sliceX: frames,
				anims: {
					[state]: {
						from: 0,
						to: frames - 1,
						loop: state !== HorseState.Eat,
						speed: 7,
					},
				},
			});
			sprites[state] = name;
		}
		return sprites;
	}

	createCarrot(): string {
		this.k.loadSprite("carrot", "sprites/carrot-flat.png");
		return "carrot";
	}
}
