// @ts-check
import { WebXRLightEstimation } from "@babylonjs/core/XR/features/WebXRLightEstimation.js";

/** Activa light estimation; devuelve feature + dispose().
 * @param {import("@babylonjs/core/XR/webXRFeaturesManager.js").WebXRFeaturesManager} fm
 */
export function setupLightEstimation(fm) {
    const feature = fm.enableFeature(WebXRLightEstimation.Name, "latest", {
        setSceneEnvironmentTexture: true,
        createDirectionalLightSource: true,
    });
    return { feature, dispose: () => feature.dispose() };
}
