// this needs to run in the MAIN world as early as possible to catch the objects while still being initialized.

// The rollDice helper is buried deep as it's an ES Module.
// We're hijacking the object initialization code to get a reference to the rollDice helper and store in at global level.
(async () => {
    const key = Symbol.for("@/helpers/rollDice"),
        _defineProperty = Object.defineProperty,
        rollDice = await new Promise((resolve) => {
            Object.defineProperty = (target, prop, descriptor) => {
                const ret = _defineProperty(target, prop, descriptor);

                if (prop === "rollDice" && typeof ret[prop] === "function") {
                    const def = ret[prop].toString();
                    // heuristical best-effort matching to get the correct function in case there are ever multiple ones
                    if (def.includes("diceNotation") && def.includes("isShared3dDiceEnabled") && def.includes("rollKind")) {
                        Object.defineProperty = _defineProperty;
                        resolve(ret);
                    }
                }

                return ret;
            }
        });

    window[key] = rollDice;
})()

// TODO reload D&D Beyond character page when extension gets reloaded (or loaded for the first time and a character page is already open).
