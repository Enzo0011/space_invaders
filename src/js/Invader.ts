export default class Invader {
	x: number;
	y: number;
	rank: number;
	file: number;
	type: string;
	width: number;
	height: number;

	constructor(x: number, y: number, rank: number, file: number, type: string) {
		this.x = x;
		this.y = y;
		this.rank = rank;
		this.file = file;
		this.type = type;
		this.width = 18;
		this.height = 14;
	}
}
