import PlayState from "./PlayState.js";

export default class LevelIntroState {
	level: number;

	constructor(level: number) {
		this.level = level;
	}

	update(game: any, dt: number) {
		if (this.level === 1) game.moveToState(new PlayState(game.config, this.level));
		if (game.pressedKeys[game.KEY_ENTER]) game.moveToState(new PlayState(game.config, this.level));
	}

	draw(game: any, dt: number, ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, game.width, game.height);
		ctx.font = "36px Arial";
		ctx.fillStyle = "#ffffff";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText("Niveau " + this.level, game.width / 2, game.height / 2);
		ctx.font = "24px Arial";
		ctx.fillText("Appuyez sur Entrer pour continuer", game.width / 2, game.height / 2 + 36);
	}
}
