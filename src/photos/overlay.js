// @ts-check
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera.js";
import { Camera } from "@babylonjs/core/Cameras/camera.js";
import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";

/**
 * Arranca la escena overlay transparente para el Photo Studio.
 * @param {HTMLCanvasElement} canvas
 * @param {number} videoW
 * @param {number} videoH
 */
export function startPhotoOverlay(canvas, videoW, videoH) {
    // preserveDrawingBuffer no es obligatorio, pero ayuda si quisieras leer el canvas
    const engine = new Engine(canvas, true, { alpha: true, preserveDrawingBuffer: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);

    // Cámara ortográfica con “unidades en px” (coinciden con el video)
    const cam = new FreeCamera("cam", new Vector3(0, 0, 1), scene);
    cam.setTarget(Vector3.Zero());            // asegura que mira al origen
    cam.mode = Camera.ORTHOGRAPHIC_CAMERA;
    cam.orthoLeft = -videoW / 2;
    cam.orthoRight = videoW / 2;
    cam.orthoTop = videoH / 2;
    cam.orthoBottom = -videoH / 2;
    cam.minZ = 0.001;                         // recortes seguros
    cam.maxZ = 10;

    new HemisphericLight("h", new Vector3(0, 1, 0), scene);

    // Nodo para posicionar la figura (empieza un poco abajo para que se vea “en el pecho”)
    const anchor = new TransformNode("anchor", scene);
    anchor.position.set(0, -videoH * 0.18, 0);

    // --- Shape cycler (primitivas) ---
    const TYPES = ["sphere", "box", "cylinder"];
    let index = 0;
    let mesh = null;

    function makeMat(i) {
        const m = new StandardMaterial("m", scene);
        const palette = ["#4CAF50", "#FF9800", "#2196F3"].map(h => Color3.FromHexString(h));
        m.diffuseColor = palette[i % palette.length];
        // Para que se vea SIEMPRE (aunque la luz sea floja):
        m.disableLighting = true;               // ignora luces
        m.emissiveColor = palette[i % palette.length];
        // (si quieres luz real, quita disableLighting y usa diffuseColor)
        return m;
    }

    function spawn() {
        if (mesh) mesh.dispose();
        const type = TYPES[index];
        const size = Math.min(videoW, videoH) * 0.18; // tamaño relativo a pantalla
        if (type === "box") {
            mesh = MeshBuilder.CreateBox("box", { size: size * 0.9 }, scene);
        } else if (type === "cylinder") {
            mesh = MeshBuilder.CreateCylinder("cyl", { height: size * 1.1, diameter: size * 0.9 }, scene);
        } else {
            mesh = MeshBuilder.CreateSphere("sph", { diameter: size, segments: 16 }, scene);
        }
        mesh.material = makeMat(index);
        mesh.parent = anchor;
    }
    spawn();

    function currentLabel() {
        const t = TYPES[index];
        return t === "box" ? "Cubo" : t === "cylinder" ? "Cilindro" : "Esfera";
    }

    function next() { index = (index + 1) % TYPES.length; spawn(); }
    function prev() { index = (index - 1 + TYPES.length) % TYPES.length; spawn(); }

    engine.runRenderLoop(() => scene.render());

    return {
        scene, engine, cam, anchor,
        next, prev, currentLabel,
        dispose() { engine.dispose(); }
    };
}
