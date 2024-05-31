import LevelIntroState from "./LevelIntroState.js";

export default class WelcomeState {
	draw(game: any, dt: number, ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, game.width, game.height);
		ctx.font = "30px Arial";
		ctx.fillStyle = "#ffffff";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText("Space Invaders", game.width / 2, game.height / 2 - 40);
		ctx.font = "16px Arial";
		ctx.fillText("Appuyez sur Espace pour commencer.", game.width / 2, game.height / 2);
	}

	keyDown(game: any, keyCode: number) {
		if (keyCode === game.KEY_SPACE) {
			game.level = 1;
			game.score = 0;
			game.lives = 3;
			game.moveToState(new LevelIntroState(game.level));
		}
	}
}
