import { OseCombat } from "./module/combat";
import type { OseConfig } from "./module/config";

declare global {
  interface LenientGlobalVariableTypes {
    // Allowing game to be accessible as a typescript type regardless of whether or not the object has been initialized.
    // See documentation for LenientGlobalVariableTypes in @league-of-foundry-developers/foundry-vtt-types
    game: never;
    canvas: never;
  }

  interface CONFIG {
    OSE: OseConfig;
  }

  interface Game {
    ose: {
      id: "ose",
      rollItemMacro: (itemName: string) => Promise<void>;
      oseCombat: OseCombat;
    };
  }
}
