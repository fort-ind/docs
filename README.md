<p align="center">
 <img src="static/img/logofornow.png" alt="Fort Docs logo" width="380" />
</p>

# fort docs

Official docs for fort.ind, fort.social, and all of our projects.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

alt command if the above doesn't work:

```bash
$env:GIT_USER="insert-your-github-username"; yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
