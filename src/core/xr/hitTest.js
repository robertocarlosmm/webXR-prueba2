// src/core/xr/hitTest.js
// @ts-check
import { WebXRHitTest } from "@babylonjs/core/XR/features/WebXRHitTest.js";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";

/** Activa hit test y devuelve un anchor que sigue el plano detectado.
 * @param {import("@babylonjs/core/XR/webXRFeaturesManager").WebXRFeaturesManager} fm
 * @param {import("@babylonjs/core").Scene} scene
 * @param {{ onHit?:(r:any, anchor:import("@babylonjs/core").TransformNode)=>void,
 *           onNoHit?:()=>void, yOffset?:number }} [opts]
 */
export function setupHitTest(fm, scene, opts = {}) {
    /** @type {import("@babylonjs/core/XR/features/WebXRHitTest").WebXRHitTest} */
    const feature = /** @type any */ (
        fm.enableFeature(WebXRHitTest.Name, "latest")
    );

    const anchor = new TransformNode("anchor", scene);

    const sub = feature.onHitTestResultObservable.add((results) => {
        if (!results.length) {
            opts.onNoHit && opts.onNoHit();
            return;
        }
        const r = results[0];
        anchor.position.copyFrom(r.position);
        anchor.rotationQuaternion = r.rotationQuaternion;
        if (opts.yOffset) anchor.position.y += opts.yOffset;
        opts.onHit && opts.onHit(r, anchor);
    });

    function dispose() {
        feature.onHitTestResultObservable.remove(sub);
        feature.dispose();
        anchor.dispose();
    }

    return { feature, anchor, dispose };
}
