import kaplay from "kaplay";
import { SpriteFactory } from "./SpriteFactory";
import { Horse } from "./Horse";
import { Carrot } from "./Carrot";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay();

k.loadRoot("./"); // A good idea for Itch.io publishing later

const spriteFactory = new SpriteFactory(k);

const carrotSprite = spriteFactory.createCarrot();
const carrots: Carrot[] = [];
for (let i = 0; i < 5; i++) {
	carrots.push(
		new Carrot(k, carrotSprite, k.vec2(k.rand(0, k.width()), k.rand(0, k.height())), 0.5),
	);
}

const horse = new Horse(k, spriteFactory.createHorse(), k.vec2(120, 80), 4);
horse.onEatEnd = () => {
	const index = carrots.findIndex((c) => horse.isInEatRange(c.obj));
	if (index === -1) return;
	carrots[index].obj.destroy();
	carrots.splice(index, 1);
};

k.onUpdate(() => {
	const pulse = 0.5 + 0.5 * Math.sin(k.time() * 6);
	for (const c of carrots) {
		c.glow.outline.opacity = horse.isInEatRange(c.obj) ? pulse : 0;
	}
});

k.onClick(() => {
	const pos = k.mousePos();
	const tapped = carrots.find(
		(c) =>
			pos.x >= c.obj.pos.x &&
			pos.x <= c.obj.pos.x + c.size &&
			pos.y >= c.obj.pos.y &&
			pos.y <= c.obj.pos.y + c.size,
	);
	if (tapped && horse.isInEatRange(tapped.obj)) {
		horse.startEating();
	} else {
		horse.moveTo(pos);
	}
});
