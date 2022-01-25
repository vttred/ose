# Changelog

All notable changes to this project were documented in this file prior to the the VTT Red fork. For a detailed description of changes for releases after 1.2.2, please see the [releases](https://github.com/vttred/ose/releases) page.

## [1.2.2] - 2021-06-17

## Added

- Italian language

## Changed

- Fixed treasure rolls displaying all items

## [1.2.1] - 2021-06-17

## Changed

- Fixed entity tweaks displaying ac modifier when it should display aac
- Fixed weight calculation of containers
- Fixed containers on monster inventories
- Fixed container cost not registered in template.json

## [1.2.0] - 2021-06-16

## Added

- Items can now be sorted with drag/dropping
- Containers entity can be added to sheets and can sort items with drag/dropping

### Changed

- Fixed monster attack groups
- Fixed monster spell counters
- Fixed monster spells

## [1.1.13] - 2021-06-10

### Changed

- Fixed compendium rendering issue
- Fixed monster items can't be edited issue #179

## [1.1.12] - 2021-06-09

### Changed

- Fixed shield computation for AAC
- Fixed treasure roll

## [1.1.10] - 2021-06-02

### Added

- Added one click character generation
- Show properties on item cards

### Changed

- Fix item icons
- Fix Stats generation
- Fix ability rollable display
- Fix item macros

## [1.1.8] - 2021-05-06

### Added

- Foundry VTT 0.8.2 compatibility

## [1.1.7] - 2021-03-29

### Added

- Display tags in items directory
- Can enable inventory on Monsters

### Changed

- Rounded treasure cost to 2 decimals

## [1.1.6] - 2021-03-28

### Added

- Compute AAC/AC, Thac0/BBA values on actor updates, issue #157
- Monster saves generation also generates THAC0/BAB
- Added a consumable counter bar

### Changed

- Fixed party sheet not showing AB when using AAC

## [1.1.5] - 2021-03-27

### Added

- Added a menu that appears when hovering the portrait
- Custom languages setting
- Display tags in spell compendiums

### Changed

- Modifiers button has been moved to the portrait menu
- Changed XP dealing formula to apply share after splitting XP, issue #105
- Fixed modifier button visibility
- Floored encounter rate division
- Improved roll chat messages
- Improved party sheet layout
- Reworked party select dialog

## [1.1.4] - 2021-01-26

### Added

### Changed

- Exploration rolls are blind
- Fixed total treasure value rounding
- Fixed treasure height icon in rollable tables

## [1.1.3] - 2021-01-03

### Changed

- Fix template preloading url error
- Fix reaction roll with negative values, issue #148
- Fix vs magic bonus applied to roll, issue #147
- Fix creation dialog not closing, issue #146

## [1.1.1] - 2020-11-4

### Changed

- Fixed Item creation dialog on monsters

## [1.1.1] - 2020-10-25

### Changed

- Fixed css rules
- Changed roll.parts to roll.terms
- Fixed editor custom buttons

## [1.1.0] - 2020-10-21

### Changed

- Fixed tab height css rules for 0.7.4

## [1.0.9] - 2020-10-04

### Changed

- Hp roll no longer add nested hp balues, fixing issue #141
- Added basic compatibility with 0.7.3

## [1.0.8] - 2020-09-11

### Added

- Combat Tracker: Spell and Move in Combat announcement toggles
- Combat Tracker: Set Active context menu options

### Changed

- FIX tweaks ac bonus not applied with ascending AC, issue #138

## [1.0.7] - 2020-09-11

### Changed

- Fix individual initiative reroll

## [1.0.5] - 2020-09-04

### Added

- Deal XP now allow preview and modifying values

### Changed

- Fix dropping treasure table on monster from compendium
- Fix polyglot editor not initializing, [issue #41 from PolyGlot](https://github.com/kakaroto/fvtt-module-polyglot/issues/41#issuecomment-686964145)

## [1.0.4] - 2020-09-04

### Changed

- Fix monster saving throws, issue #135
