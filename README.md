# UoA Discords API

[![Node.js CI](https://github.com/UoA-Discords/uoa-discords-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/UoA-Discords/uoa-discords-api/actions/workflows/node.js.yml)[![Deploy](https://github.com/UoA-Discords/uoa-discords-api/actions/workflows/deploy.yml/badge.svg)](https://github.com/UoA-Discords/uoa-discords-api/actions/workflows/deploy.yml)

Backend API for the UoA Discords project.

## Installation

Dependencies:

-   [NodeJS](https://nodejs.org/en/) 16 or higher.

1. Clone this repository.
2. Install dependencies using [yarn](https://yarnpkg.com/) (preferred) or npm.

    ```sh
    # yarn
    $ yarn

    # npm
    npm install
    ```

3. Copy the [`config.example.json`](./config.example.json) file and rename it to [`config.json`](./config.json), change the fields if necessary.

## Scripts

Run the scripts using `yarn <script>` or `npm run <script>`

-   `typecheck` - Runs Typescript compiler typecheck.
-   `lint` - Runs eslint (and Prettier) linting checks.
-   `test` - Runs jest tests.
-   `check-all` - Runs all of the above (yarn only).
-   `build` - Compiles into bundled JavaScript.
-   `dev` - Runs with hot-reloading.
-   `start` - Same as `node .`, runs compiled program.
