// @ts-check
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

/** Crea Engine + Scene + cámara/luz para modo no-XR (menús)
 * @param {HTMLCanvasElement} canvas
 */
export function createEngineAndScene(canvas) {
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);

    // Cámara orbital para navegar fuera de AR.
    // OJO: el 5º parámetro (target) debe ser un Vector3.
    const cam = new ArcRotateCamera(
        "cam",
        Math.PI / 2,
        Math.PI / 3,
        5,
        Vector3.Zero(),     // antes: undefined
        scene
    );
    cam.attachControl(canvas, true);

    // La luz hemisférica también necesita un Vector3 para la dirección.
    new HemisphericLight("h", new Vector3(0, 1, 0), scene); // antes: {x:0,y:1,z:0}

    return { engine, scene };
}
