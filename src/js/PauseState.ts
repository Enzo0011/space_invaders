export default class PauseState {
	keyDown(game: any, keyCode: number) {
		if (keyCode == 80) game.popState();
	}

	draw(game: any, dt: number, ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, game.width, game.height);
		ctx.font = "36px Arial";
		ctx.fillStyle = "#ffffff";
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillText("Pause", game.width / 2, game.height / 2);
	}
}
