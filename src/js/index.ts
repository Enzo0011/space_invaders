import WelcomeState from "./WelcomeState.js";

export default class Game {
	config: any;
	KEY_LEFT: number;
	KEY_RIGHT: number;
	KEY_SPACE: number;
	KEY_ENTER: number;
	godMode: boolean;
	currentHue: number;
	lives: number;
	width: number;
	height: number;
	gameBounds: { left: number; top: number; right: number; bottom: number };
	intervalId: any;
	score: number;
	level: number;
	stateStack: any[];
	pressedKeys: { [key: number]: boolean };
	gameCanvas: HTMLCanvasElement | null;
	previousX: number;

	constructor() {
		this.config = {
			bombRate: 0.05,
			bombMinVelocity: 50,
			bombMaxVelocity: 50,
			invaderInitialVelocity: 25,
			invaderAcceleration: 0,
			invaderDropDistance: 20,
			rocketVelocity: 120,
			rocketMaxFireRate: 2,
			gameWidth: 800,
			gameHeight: 300,
			fps: 30,
			invaderRanks: 5,
			invaderFiles: 10,
			shipSpeed: 120,
			levelDifficultyMultiplier: 0.2,
			pointsPerInvader: 1,
			limitLevelIncrease: 25,
			reloadFire: 1000,
		};

		this.KEY_LEFT = 37;
		this.KEY_RIGHT = 39;
		this.KEY_SPACE = 32;
		this.KEY_ENTER = 13;

		this.godMode = false;
		this.currentHue = 0;
		this.lives = 3;
		this.width = 0;
		this.height = 0;
		this.gameBounds = { left: 0, top: 0, right: 0, bottom: 0 };
		this.intervalId = 0;
		this.score = 0;
		this.level = 1;
		this.stateStack = [];
		this.pressedKeys = {};
		this.gameCanvas = null;
		this.previousX = 0;
	}

	initialise(gameCanvas: HTMLCanvasElement) {
		this.gameCanvas = gameCanvas;
		this.width = gameCanvas.width;
		this.height = gameCanvas.height;
		this.gameBounds = {
			left: gameCanvas.width / 2 - this.config.gameWidth / 2,
			right: gameCanvas.width / 2 + this.config.gameWidth / 2,
			top: gameCanvas.height / 2 - this.config.gameHeight / 2,
			bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
		};
	}

	moveToState(state: any) {
		const currentState = this.currentState();
		if (currentState && currentState.leave) {
			currentState.leave(this);
			this.stateStack.pop();
		}
		if (state.enter) state.enter(this);
		this.stateStack.push(state);
	}

	start() {
		this.moveToState(new WelcomeState());
		this.lives = 3;
		this.intervalId = setInterval(() => {
			this.gameLoop();
		}, 1000 / this.config.fps);
	}

	currentState() {
		return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
	}

	gameLoop() {
		const currentState = this.currentState();
		if (currentState) {
			const dt = 1 / this.config.fps;
			const ctx = this.gameCanvas!.getContext("2d");
			if (currentState.update) currentState.update(this, dt);
			if (currentState.draw) currentState.draw(this, dt, ctx!);
		}
	}

	pushState(state: any) {
		if (state.enter) state.enter(this);
		this.stateStack.push(state);
	}

	popState() {
		const currentState = this.currentState();
		if (currentState) {
			if (currentState.leave) currentState.leave(this);
			this.stateStack.pop();
		}
	}

	stop() {
		clearInterval(this.intervalId);
	}

	keyDown(keyCode: number) {
		this.pressedKeys[keyCode] = true;
		if (this.currentState() && this.currentState().keyDown) this.currentState().keyDown(this, keyCode);
	}

	touchstart() {
		if (this.currentState() && this.currentState().keyDown) this.currentState().keyDown(this, this.KEY_SPACE);
	}

	touchend() {
		delete this.pressedKeys[this.KEY_RIGHT];
		delete this.pressedKeys[this.KEY_LEFT];
	}

	touchmove(e: TouchEvent) {
		let currentX = e.changedTouches[0].pageX;
		if (this.previousX > 0) {
			if (currentX > this.previousX) {
				delete this.pressedKeys[this.KEY_LEFT];
				this.pressedKeys[this.KEY_RIGHT] = true;
			} else {
				delete this.pressedKeys[this.KEY_RIGHT];
				this.pressedKeys[this.KEY_LEFT] = true;
			}
		}
		this.previousX = currentX;
	}

	keyUp(keyCode: number) {
		delete this.pressedKeys[keyCode];
		if (this.currentState() && this.currentState().keyUp) this.currentState().keyUp(this, keyCode);
	}

	toggleGodMode() {
		this.godMode = !this.godMode;

		if (this.godMode) {
			this.config.shipSpeed = 500;
			this.config.reloadFire = 50;
			this.lives = 9999;
		} else {
			this.config.shipSpeed = 120;
			this.config.reloadFire = 1000;
			this.lives = 3;
		}
	}
}
