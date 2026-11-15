import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";
import type { HorseSprites } from "./SpriteFactory";
import { Key } from "./enums";

export enum HorseState {
	Idle = "idle",
	Walk = "walk",
	Run = "run",
	Eat = "eat",
	Sit = "sit",
}

export class Horse {
	private k: KAPLAYCtx;
	private sprites: HorseSprites;
	private state: HorseState = HorseState.Idle;
	private speed = 240;
	private moveTarget: Vec2 | null = null;
	private mouthObj: GameObj;
	private lastHorizontalKey: Key.Left | Key.Right = Key.Right;
	readonly obj: GameObj;
	onEatEnd?: (mouthPos: Vec2) => void;

	// Sprite frame is 100x100; all world offsets derive from scale.
	static readonly FRAME_SIZE = 100;
	private readonly scale: number;

	constructor(
		k: KAPLAYCtx,
		sprites: HorseSprites,
		pos: Vec2 = k.vec2(120, 80),
		scale = 2,
	) {
		this.k = k;
		this.sprites = sprites;
		this.scale = scale;
		this.obj = k.add([
			k.pos(pos),
			k.sprite(this.sprites[this.state], { anim: this.state }),
			k.scale(scale),
		]);

		// Collision child at the mouth (local coords are unscaled 0-100).
		this.mouthObj = this.obj.add([
			k.pos(85, 90),
			k.area({ shape: new k.Rect(k.vec2(-12, -12), 24, 24) }),
		]);

		k.onKeyPress(Key.Left, () => (this.lastHorizontalKey = Key.Left));
		k.onKeyPress(Key.Right, () => (this.lastHorizontalKey = Key.Right));

		this.obj.onAnimEnd((anim: string) => {
			if (anim === HorseState.Eat) {
				this.onEatEnd?.(this.mouthPos());
				this.setState(HorseState.Idle);
			}
		});

		k.onUpdate(() => this.update());
	}

	moveTo(target: Vec2): void {
		// pos is top-left of the scaled sprite; center it on the tap.
		const half = (Horse.FRAME_SIZE * this.scale) / 2;
		this.moveTarget = target.sub(this.k.vec2(half, half));
	}

	startEating(): void {
		this.moveTarget = null;
		this.setState(HorseState.Eat);
	}

	isInEatRange(target: GameObj): boolean {
		return this.mouthObj.isOverlapping(target);
	}

	private mouthPos(): Vec2 {
		// Mouth sits bottom-right when facing right, mirrored on flipX.
		const mouthX = (this.obj.flipX ? 15 : 85) * this.scale;
		return this.obj.pos.add(this.k.vec2(mouthX, 90 * this.scale));
	}

	update(): void {
		const k = this.k;

		if (this.state === HorseState.Eat) return;

		if (k.isKeyDown(Key.Space)) {
			this.setState(HorseState.Eat);
			return;
		}

		let dir = k.vec2(
			(k.isKeyDown(Key.Right) ? 1 : 0) - (k.isKeyDown(Key.Left) ? 1 : 0),
			(k.isKeyDown(Key.Down) ? 1 : 0) - (k.isKeyDown(Key.Up) ? 1 : 0),
		);

		if (dir.x !== 0 || dir.y !== 0) {
			this.moveTarget = null; // manual input cancels tap-to-move
		} else if (this.moveTarget) {
			const toTarget = this.moveTarget.sub(this.obj.pos);
			if (toTarget.len() <= 4) {
				this.moveTarget = null;
			} else {
				dir = toTarget.unit();
				if (dir.x !== 0) {
					this.lastHorizontalKey = dir.x < 0 ? Key.Left : Key.Right;
				}
			}
		}

		this.mouthObj.pos.x = this.lastHorizontalKey === Key.Left ? 15 : 85;

		if (dir.x !== 0 || dir.y !== 0) {
			this.obj.move(dir.unit().scale(this.speed));
			this.obj.flipX = this.lastHorizontalKey === Key.Left;
			this.setState(HorseState.Walk);
		} else {
			this.setState(HorseState.Idle);
		}
	}

	setState(state: HorseState): void {
		if (!this.sprites[state] || state === this.state) return;
		this.state = state;
		this.obj.use(this.k.sprite(this.sprites[state]));
		this.obj.flipX = this.lastHorizontalKey === Key.Left;
		this.obj.play(state);
	}
}
