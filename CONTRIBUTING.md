# Contributing

For a more hands-on onboarding experience before making your first contributiion to this repo, I recommend joining our [Unofficial OSE on Foundry VTT Discord server](https://discord.gg/qGrxRK2yD5).

## Installation

Prerequisites: Node.js, npm, Foundry VTT with a valid license

1. (Star) and Fork this repo.
1. Clone your fork to a directory suitable for containing your code projects, such as `/yourusername/Github/`. It will create the `ose` directory.
1. Open `ose` in an IDE and/or your Terminal.
1. In Terminal (you are in the `ose` directory), run `npm i`.
1. Create a `foundryconfig.json` file in the `ose` directory.

`/foundryconfig.json`

```
{
  "dataPath": "path/to/your/user/Data/ REPLACE THIS STRING"
}
```

1. In Terminal run `npm run build`.
1. Make any code contributions in the `/src` directory.
1. Run `npm run build` any time you need to apply those changes, or run `npm run watch` to have it apply changes automatically.
