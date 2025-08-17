// src/core/xr/experience.js
// @ts-check
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience.js";

/** Inicia WebXR en AR y entra a la sesión con (opcional) DOM Overlay.
 * @param {import("@babylonjs/core").Scene} scene
 * @param {HTMLElement} [domOverlayRoot]
 */
export async function createXRExperience(scene, domOverlayRoot) {
    // Crea la experiencia XR (aún sin entrar a la sesión)
    const xr = await WebXRDefaultExperience.CreateAsync(scene);

    // Opciones de creación de la sesión XR (XRSessionInit)
    const sessionInit = domOverlayRoot
        ? {
            optionalFeatures: ["dom-overlay"], // pide soporte de dom overlay
            domOverlay: { root: domOverlayRoot }, // aquí va el overlay
        }
        : undefined;

    // Entra a la sesión AR con esas opciones
    await xr.baseExperience.enterXRAsync("immersive-ar", "local", undefined, sessionInit);

    const fm = xr.baseExperience.featuresManager;

    async function exit() {
        await xr.baseExperience.exitXRAsync();
    }

    return { xr, fm, exit };
}
