# Space Invaders Project

This is a TypeScript project for a simple Space Invaders game. The project includes various game states and components such as the player's ship, invaders, rockets, and bombs.

## Project Structure

```
src
│ index.html
│ server.ts
│
└───js
    │ Bombs.ts
    │ GameOverState.ts
    │ index.ts
    │ Invader.ts
    │ LevelIntroState.ts
    │ PauseState.ts
    │ PlayState.ts
    │ Rocket.ts
    │ Ship.ts
    │ WelcomeState.ts
```

## Getting Started

### Prerequisites

Make sure you have Node.js and npm (Node Package Manager) installed on your system. You can download them from [nodejs.org](https://nodejs.org/).

### Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/Enzo0011/space_invaders.git
    cd space_invaders
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Compile the TypeScript files:**

    ```sh
    npm run build
    ```

### Running the Project

To run the project, execute the compiled `server.js` file:

    ```sh
    npm start
    ```

## Project Details
index.html: The main HTML file to load the game.
server.ts: The server file (if applicable).
js/: Contains all the TypeScript files for different components and states of the game.
