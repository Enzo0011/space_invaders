export default class Ship {
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.width = 20;
		this.height = 16;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "#ffffff";
		ctx.beginPath();
		ctx.moveTo(this.x, this.y - this.height / 2);
		ctx.lineTo(this.x - this.width / 2, this.y + this.height / 2);
		ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
		ctx.closePath();
		ctx.fill();
	}
}
