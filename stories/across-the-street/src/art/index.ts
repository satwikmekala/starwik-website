/**
 * Every drawing in the story, one file each. To add a sprite: create
 * src/art/<name>.ts exporting `sprite(...)`, list it here, run
 * `npm run story:art`. The compiled paths land in generated/sprites.json.
 */
import breakfastTable from './breakfast-table.ts'
import chair from './chair.ts'
import cloud from './cloud.ts'
import coffeeTable from './coffee-table.ts'
import corkboard from './corkboard.ts'
import dishcloth from './dishcloth.ts'
import door from './door.ts'
import flatShellDesktop from './flat-shell-desktop.ts'
import flatShellMobile from './flat-shell-mobile.ts'
import lamp from './lamp.ts'
import mug from './mug.ts'
import oldBuilding from './old-building.ts'
import photo from './photo.ts'
import plant from './plant.ts'
import postcard from './postcard.ts'
import rug from './rug.ts'
import sofa from './sofa.ts'
import tramPass from './tram-pass.ts'
import windowArt from './window.ts'
import wristband from './wristband.ts'

export const SPRITES = [
  flatShellDesktop, flatShellMobile, oldBuilding, cloud,
  windowArt, door, corkboard, tramPass, wristband, photo, postcard,
  sofa, lamp, coffeeTable, rug, plant, chair, dishcloth, breakfastTable, mug,
]
