import LevelIntroState from "./LevelIntroState.js";

export default class GameOverState {
	draw(game: any, dt: number, ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, game.width, game.height);
		ctx.font = "36px Arial";
		ctx.fillStyle = "#ffffff";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText("Partie Terminée !", game.width / 2, game.height / 2 - 40);
		ctx.font = "16px Arial";
		ctx.fillText("Vous avez marqué " + game.score + " points et êtes arrivé au niveau " + game.level, game.width / 2, game.height / 2);
		ctx.font = "16px Arial";
		ctx.fillText("Appuyez sur Espace pour rejouer.", game.width / 2, game.height / 2 + 40);
	}

	keyDown(game: any, keyCode: number) {
		if (keyCode === game.KEY_SPACE) {
			game.lives = 3;
			game.score = 0;
			game.level = 1;
			game.moveToState(new LevelIntroState(1));
		}
	}
}
