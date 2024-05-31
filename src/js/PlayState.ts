import LevelIntroState from "./LevelIntroState.js";
import PauseState from "./PauseState.js";
import GameOverState from "./GameOverState.js";
import Ship from "./Ship.js";
import Invader from "./Invader.js";
import Rocket from "./Rocket.js";
import Bomb from "./Bomb.js";

const livesElement = document.querySelector("#lives") as HTMLElement;
const levelElement = document.querySelector("#level") as HTMLElement;
const scoreElement = document.querySelector("#score") as HTMLElement;

interface GameConfig {
	levelDifficultyMultiplier: number;
	limitLevelIncrease: number;
	invaderInitialVelocity: number;
	bombRate: number;
	bombMinVelocity: number;
	bombMaxVelocity: number;
	rocketMaxFireRate: number;
	invaderRanks: number;
	invaderFiles: number;
	invaderDropDistance: number;
	invaderAcceleration: number;
	shipSpeed: number;
	reloadFire: number;
	rocketVelocity: number;
	pointsPerInvader: number;
}

interface Game {
	width: number;
	height: number;
	gameBounds: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	lives: number;
	level: number;
	score: number;
	currentHue: number;
	pressedKeys: { [key: number]: boolean };
	KEY_LEFT: number;
	KEY_RIGHT: number;
	KEY_SPACE: number;
	moveToState(state: any): void;
	pushState(state: any): void;
	toggleGodMode(): void;
}

export default class PlayState {
	private config: GameConfig;
	private level: number;
	private invaderCurrentVelocity: number;
	private invaderCurrentDropDistance: number;
	private invadersAreDropping: boolean;
	private lastRocketTime: number | null;
	private ship: Ship | null;
	private invaders: Invader[];
	private rockets: Rocket[];
	private bombs: Bomb[];
	private invaderInitialVelocity: number;
	private bombRate: number;
	private bombMinVelocity: number;
	private bombMaxVelocity: number;
	private rocketMaxFireRate: number;
	private invaderVelocity: { x: number; y: number };
	private invaderNextVelocity: { x: number; y: number } | null;

	constructor(config: GameConfig, level: number) {
		this.config = config;
		this.level = level;
		this.invaderCurrentVelocity = 10;
		this.invaderCurrentDropDistance = 0;
		this.invadersAreDropping = false;
		this.lastRocketTime = null;
		this.ship = null;
		this.invaders = [];
		this.rockets = [];
		this.bombs = [];
		this.invaderInitialVelocity = 0;
		this.bombRate = 0;
		this.bombMinVelocity = 0;
		this.bombMaxVelocity = 0;
		this.rocketMaxFireRate = 0;
		this.invaderVelocity = { x: 0, y: 0 };
		this.invaderNextVelocity = null;
	}

	enter(game: Game) {
		this.ship = new Ship(game.width / 2, game.gameBounds.bottom);

		this.invaderCurrentVelocity = 10;
		this.invaderCurrentDropDistance = 0;
		this.invadersAreDropping = false;

		const levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
		const limitLevel = this.level < this.config.limitLevelIncrease ? this.level : this.config.limitLevelIncrease;

		this.invaderInitialVelocity = this.config.invaderInitialVelocity + 1.5 * (levelMultiplier * this.config.invaderInitialVelocity);
		this.bombRate = this.config.bombRate + levelMultiplier * this.config.bombRate;
		this.bombMinVelocity = this.config.bombMinVelocity + levelMultiplier * this.config.bombMinVelocity;
		this.bombMaxVelocity = this.config.bombMaxVelocity + levelMultiplier * this.config.bombMaxVelocity;
		this.rocketMaxFireRate = this.config.rocketMaxFireRate + 0.4 * limitLevel;

		const ranks = this.config.invaderRanks + 0.1 * limitLevel;
		const files = this.config.invaderFiles + 0.2 * limitLevel;
		const invaders: Invader[] = [];
		for (let rank = 0; rank < ranks; rank++) {
			for (let file = 0; file < files; file++) {
				invaders.push(new Invader(game.width / 2 + ((files / 2 - file) * 200) / files, game.gameBounds.top + rank * 20, rank, file, "Invader"));
			}
		}
		this.invaders = invaders;
		this.invaderCurrentVelocity = this.invaderInitialVelocity;
		this.invaderVelocity = { x: -this.invaderInitialVelocity, y: 0 };
		this.invaderNextVelocity = null;
	}

	update(game: Game, dt: number) {
		if (game.pressedKeys[game.KEY_LEFT]) this.ship!.x -= this.config.shipSpeed * dt;
		if (game.pressedKeys[game.KEY_RIGHT]) this.ship!.x += this.config.shipSpeed * dt;
		if (game.pressedKeys[game.KEY_SPACE]) this.fireRocket();

		if (this.ship!.x < game.gameBounds.left) this.ship!.x = game.gameBounds.left;
		if (this.ship!.x > game.gameBounds.right) this.ship!.x = game.gameBounds.right;

		for (let i = 0; i < this.bombs.length; i++) {
			const bomb = this.bombs[i];
			bomb.y += dt * bomb.velocity;

			if (bomb.y > game.height) this.bombs.splice(i--, 1);
		}

		for (let i = 0; i < this.rockets.length; i++) {
			const rocket = this.rockets[i];
			rocket.y -= dt * rocket.velocity;

			if (rocket.y < 0) this.rockets.splice(i--, 1);
		}

		let hitLeft = false,
			hitRight = false,
			hitBottom = false;
		for (let i = 0; i < this.invaders.length; i++) {
			const invader = this.invaders[i];
			const newx = invader.x + this.invaderVelocity!.x * dt;
			const newy = invader.y + this.invaderVelocity!.y * dt;
			if (!hitLeft && newx < game.gameBounds.left) hitLeft = true;
			else if (!hitRight && newx > game.gameBounds.right) hitRight = true;
			else if (!hitBottom && newy > game.gameBounds.bottom) hitBottom = true;

			if (!hitLeft && !hitRight && !hitBottom) {
				invader.x = newx;
				invader.y = newy;
			}
		}

		if (this.invadersAreDropping) {
			this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
			if (this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
				this.invadersAreDropping = false;
				this.invaderVelocity = this.invaderNextVelocity!;
				this.invaderCurrentDropDistance = 0;
			}
		}
		if (hitLeft) {
			this.invaderCurrentVelocity += this.config.invaderAcceleration;
			this.invaderVelocity = { x: 0, y: this.invaderCurrentVelocity };
			this.invadersAreDropping = true;
			this.invaderNextVelocity = { x: this.invaderCurrentVelocity, y: 0 };
		}
		if (hitRight) {
			this.invaderCurrentVelocity += this.config.invaderAcceleration;
			this.invaderVelocity = { x: 0, y: this.invaderCurrentVelocity };
			this.invadersAreDropping = true;
			this.invaderNextVelocity = { x: -this.invaderCurrentVelocity, y: 0 };
		}
		if (hitBottom) game.lives = 0;

		for (let i = 0; i < this.invaders.length; i++) {
			const invader = this.invaders[i];
			let bang = false;

			for (let j = 0; j < this.rockets.length; j++) {
				const rocket = this.rockets[j];

				if (
					rocket.x >= invader.x - invader.width / 2 &&
					rocket.x <= invader.x + invader.width / 2 &&
					rocket.y >= invader.y - invader.height / 2 &&
					rocket.y <= invader.y + invader.height / 2
				) {
					this.rockets.splice(j--, 1);
					bang = true;
					game.score += this.config.pointsPerInvader;
					break;
				}
			}
			if (bang) this.invaders.splice(i--, 1);
		}

		const frontRankInvaders: { [key: number]: Invader } = {};
		for (let i = 0; i < this.invaders.length; i++) {
			const invader = this.invaders[i];
			if (!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
				frontRankInvaders[invader.file] = invader;
			}
		}

		for (let i = 0; i < this.config.invaderFiles; i++) {
			const invader = frontRankInvaders[i];
			if (!invader) continue;
			const chance = this.bombRate * dt;
			if (chance > Math.random()) {
				this.bombs.push(new Bomb(invader.x, invader.y + invader.height / 2, this.bombMinVelocity + Math.random() * (this.bombMaxVelocity - this.bombMinVelocity)));
			}
		}

		for (let i = 0; i < this.bombs.length; i++) {
			const bomb = this.bombs[i];
			if (
				bomb.x >= this.ship!.x - this.ship!.width / 2 &&
				bomb.x <= this.ship!.x + this.ship!.width / 2 &&
				bomb.y >= this.ship!.y - this.ship!.height / 2 &&
				bomb.y <= this.ship!.y + this.ship!.height / 2
			) {
				this.bombs.splice(i--, 1);
				game.lives--;
			}
		}

		for (let i = 0; i < this.invaders.length; i++) {
			const invader = this.invaders[i];
			if (
				invader.x + invader.width / 2 > this.ship!.x - this.ship!.width / 2 &&
				invader.x - invader.width / 2 < this.ship!.x + this.ship!.width / 2 &&
				invader.y + invader.height / 2 > this.ship!.y - this.ship!.height / 2 &&
				invader.y - invader.height / 2 < this.ship!.y + this.ship!.height / 2
			) {
				game.lives = 0;
			}
		}

		if (game.lives <= 0) game.moveToState(new GameOverState());

		if (this.invaders.length === 0) {
			game.score += this.level * 50;
			game.level += 1;
			game.moveToState(new LevelIntroState(game.level));
		}
	}

	draw(game: Game, dt: number, ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, game.width, game.height);

		this.ship!.draw(ctx);

		const startHue = game.currentHue;
		const maxDistance = Math.sqrt(this.config.invaderFiles ** 2 + this.config.invaderRanks ** 2);
		for (let i = 0; i < this.invaders.length; i++) {
			const invader = this.invaders[i];

			const distance = Math.sqrt(invader.file ** 2 + invader.rank ** 2);
			const positionFactor = distance / maxDistance;

			const hue = (startHue + positionFactor * 360) % 360;
			ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

			ctx.fillRect(invader.x - invader.width / 2, invader.y - invader.height / 2, invader.width, invader.height);
		}
		game.currentHue += 1;

		ctx.fillStyle = "#ff0000";
		for (let i = 0; i < this.bombs.length; i++) {
			const bomb = this.bombs[i];
			ctx.fillRect(bomb.x - 2, bomb.y - 2, 4, 4);
		}

		ctx.fillStyle = "#ff0000";
		for (let i = 0; i < this.rockets.length; i++) {
			const rocket = this.rockets[i];
			ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
		}

		livesElement.textContent = "Lives: " + game.lives;
		levelElement.textContent = "Level: " + game.level;
		scoreElement.textContent = "Score: " + game.score;
	}

	keyDown(game: Game, keyCode: number) {
		if (keyCode === game.KEY_SPACE) this.fireRocket();
		if (keyCode === 80) game.pushState(new PauseState());
		if (keyCode === 71) game.toggleGodMode();
	}

	fireRocket() {
		if (this.lastRocketTime === null || new Date().valueOf() - this.lastRocketTime > this.config.reloadFire / this.rocketMaxFireRate) {
			this.rockets.push(new Rocket(this.ship!.x, this.ship!.y - 12, this.config.rocketVelocity));
			this.lastRocketTime = new Date().valueOf();
		}
	}
}
