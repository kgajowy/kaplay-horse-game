import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

const SPRITE_SIZE = 200;

export class Carrot {
	readonly obj: GameObj;
	readonly glow: GameObj;
	readonly size: number;

	constructor(k: KAPLAYCtx, sprite: string, pos: Vec2, scale = 0.25) {
		this.size = SPRITE_SIZE * scale;
		this.obj = k.add([
			k.pos(pos),
			k.sprite(sprite),
			k.scale(scale),
			k.area(),
			"carrot",
		]);
		// Child inherits the parent's 0.25 scale, so draw in sprite pixels.
		this.glow = this.obj.add([
			k.rect(SPRITE_SIZE, SPRITE_SIZE, { fill: false }),
			k.outline(16, k.YELLOW, 0),
		]);
	}
}
