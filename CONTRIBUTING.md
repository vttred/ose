# Contributing

We do our best to recognize several ways one can contribute to this project.

- Become a translation contributor from English to your native language
- Become a design contributor by researching, prototyping, and drawing new interfaces and user experiences
- Become a documentation or SRD contributor, using primarily English skills or finding mistakes in our SRD compendia
- **Become a code contributor, using basic or intermediate knowledge of JavaScript to improve how the game system functions**

This guide is focused on the very last type, becoming a code contributor.

## Developer Environment Installation

Prerequisites: Node.js (v16 is recommended), a familiarity with command Foundry VTT with a valid license

[Node installers (beginner-friendly)](https://nodejs.org/en/download/)
[Node on package managers (recommended, I use nvm)](https://nodejs.org/en/download/package-manager/#windows)

1. With Node.js installed, run the command `npm i npm -g && npm -v` in your preferred command line interface to ensure **npm 7 or greater** is installed.
1. (Star) and fork this repo.
1. Clone your fork to a directory suitable for containing your code projects, such as `/yourusername/Github/`. It will create the `ose` directory. In the command line, your command should look like `git clone git@github.com:yourusername/ose.git`.
1. Open `ose` in an IDE and/or your Terminal and install dependencies. In the command line, `cd ose && npm i`.
1. Copy the `foundryconfig.json.example` file to your repo's root directory, and rename it `foundryconfig.json`

   `/foundryconfig.json`

   ```json
   {
     "dataPath": "path/to/FoundryVTT-userdata REPLACE THIS STRING",
     "symLinkName": "ose-dev"
   }
   ```

1. In your command line, run `npm run link`. A new system should now appear in your systems directory (or directories) but it doesn't yet run any code.
1. In your command line, run `npm run build` (build once) or `npm run build:watch` (build continuously, whenever a change is saved). You now have a working copy of OSE's developer build. You should be able to install releases of `ose` alongside this build.

### Addendum: Git for Beginners

Many contributors to Unofficial OSE on Foundry VTT are inexperienced with git. GitHub provides their [quickstart tutorial](https://docs.github.com/en/get-started/quickstart/hello-world) which we recommend as a first step toward becoming an OSE Contributor.

Here are some next steps to get started on your first code contribution.

1. Create a new branch for your patch. In your command line, `git checkout -b a-branchname-of-your-choosing`
1. Make any code contributions you'd like, making sure to confirm it performs the behavior you want after trying it in Foundry VTT, and testing for edge cases if relevant.
1. When you are satisfied, push the branch to your GitHub fork. In your command link, `git push origin a-branchname-of-your-choosing`.
1. Follow GitHub's instructions for creating a pull request from their website.

## Troubleshooting

To ask for a hand to help onboard you before making your first contribution to this repo, I recommend joining our [Unofficial OSE on Foundry VTT Discord server](https://discord.gg/qGrxRK2yD5).

### Errors from `node gyp` when running `npm i` on Windows.

[Follow these directions](https://github.com/nodejs/node-gyp#on-windows), then run `npm i` again. If you still have issues after trying to follow Microsoft's Node.js guidelines, chat with us on Discord.

### Error: `Operation not permitted` when trying to run `npm run link`

On Windows you may have to run your shell/command prompt in administrator mode to create a symlink. This should be rare in Linux, but `sudo npm run link` or changing the owner of the Foundry user data directory to the current user should make this command run without errors.

### Error: Cannot find module 'rollup'

You may have skipped `npm i npm -g && npm -v`. If it shows npm version <7.0, then you may have an older version of Node or older operating system and need to upgrade.

### Error: Cannot find module (any module except rollup)

You will need to `npm i` occasionally as we put out updates to the build process. We try to communicate whenever there's a change in devDependencies on Discord and in release notes.

## Repeat Contributors

Repeat contributors may ask via Discord direct message (@corporat#1282) or email (ose@vtt.red) to be added to a list of people who are interested in referrals for contract work.

## Addendum: Multiple Builds of OSE in the same Foundry VTT installation

The maintainer of this repository has three versions of OSE installed in any given version of Foundry VTT. And 2 or 3 versions of Foundry VTT installed at any given time. Their home directory looks something like this.

```console
~/
    mygithubusername/
        ose/
    vttred/
        ose/
    fvtt/
        v9/
        v9-userdata/Data/
            systems/
                ose/
                ose-dev/
                ose-test/
    v10/
         v10-userdata/Data/
            systems/
                ose/
                ose-dev/
                ose-test/
```

This is achieved with a `foundryconfig.json` files in each local version of the github repo on the maintainer's computer. Because of an npm script, each repo can make two symlinks, one for Foundry V9 and one for Foundry V10.

`~/mygithubusername/ose/foundryconfig.json`

```json
{
  "dataPath": "~/fvtt/v10-userdata",
  "symLinkName": "ose-dev"
}
```

`~/vttred/ose/foundryconfig.json`

```json
{
  "dataPath": "~/fvtt/v10-userdata",
  "symLinkName": "ose-test"
}
```

If you want to have two local versions of your repository, there will be an additional build step. Run `git config --local include.path ../.gitconfig` in each of your repositories' root directories. Then make sure they have different symlinkNames in the `foundryconfig.json` files for each repo. Run `npm run link` in each repository.

Note: you will have to provide your own .gitconfig for Windows
