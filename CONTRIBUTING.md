# Contributing

For a more hands-on onboarding experience before making your first contributiion to this repo, I recommend joining our [Unofficial OSE on Foundry VTT Discord server](https://discord.gg/qGrxRK2yD5).

## Developer Environment Installation

Prerequisites: Node.js (v16 is recommended), a familiarity with command Foundry VTT with a valid license

[Node installers (beginner-friendly)](https://nodejs.org/en/download/)
[Node on package managers (recommended, I use nvm)](https://nodejs.org/en/download/package-manager/#windows)

1. With Node.js installed, run the command `npm i npm -g && npm -v` in your preferred command line interface to ensure npm 7 or greater is installed.
1. (Star) and fork this repo.
1. Clone your fork to a directory suitable for containing your code projects, such as `/yourusername/Github/`. It will create the `ose` directory. In the command line, your command should look like `git clone git@github.com:yourusername/ose.git`.
1. Open `ose` in an IDE and/or your Terminal and install dependencies. In the command line, `cd ose && npm i`.
1. Create a `foundryconfig.json` file in the `ose` directory containing a single

`/foundryconfig.json`

```json
{
  "dataPath": "path/to/FoundryVTT REPLACE THIS STRING",
  "symLinkName": "ose"
}
```

1. In your command line, run `npm run link`. A new system should now appear in your systems directory but it doesn't yet run any code.
1. In your command line, run `npm run build` (build once) or `npm run build:watch` (build whenever a change is saved). You now have a working copy of OSE.

## Addendum: Git for Beginners

Many contributors to Unofficial OSE on Foundry VTT are inexperienced with git. Here are some next steps to get started on your first code or translation contribution.

1. Create a new branch for your patch. In your command line, `git checkout -b a-branchname-of-your-choosing`
1. Make any code contributions you'd like, making sure to confirm the behavior you want in Foundry VTT and testing for edge cases if relevant.
1. When you are satisfied, push the branch to your fork. In your command link, `git push origin a-branchname-of-your-choosing`.
1. Follow GitHub's instructions for creating a pull request from their website.

## Troubleshooting

**Errors from `node gyp` when running `npm i` on Windows.**

[Follow these directions](https://github.com/nodejs/node-gyp#on-windows), then run `npm i` again. If you still have issues after trying to follow Microsoft's Node.js guidelines, chat with us on Discord.

**Error: Cannot find module 'rollup'**

You may have skipped `npm i npm -g && npm -v`. If it shows npm version <7.0, then you may have an older version of Node or older operating system and need to upgrade.

**Error: Cannot find module (any module except rollup)**

You will need to `npm i` occasionally as we put out updates to the build process. We try to communicate whenever there's a change in devDependencies on Discord and in release notes.
