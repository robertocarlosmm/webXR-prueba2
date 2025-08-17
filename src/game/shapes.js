// @ts-check
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";

const ORDER = ["sphere", "box", "cylinder"];

export class ShapeCycler {
    /** @param {import("@babylonjs/core").Scene} scene */
    constructor(scene) {
        this.scene = scene;
        this.index = 0;
        this.node = null;   // TransformNode al que nos “colgamos”
        this.mesh = null;
    }

    /** @param {import("@babylonjs/core").TransformNode} node */
    attachTo(node) {
        this.node = node;
        this._spawn();
    }

    next() { this.index = (this.index + 1) % ORDER.length; this._spawn(); }
    prev() { this.index = (this.index - 1 + ORDER.length) % ORDER.length; this._spawn(); }
    currentLabel() {
        const t = ORDER[this.index];
        return t === "box" ? "Cubo" : t === "cylinder" ? "Cilindro" : "Esfera";
    }

    _spawn() {
        if (!this.node) return;
        if (this.mesh) this.mesh.dispose();
        const type = ORDER[this.index];

        const size = 0.15; // ~15 cm
        let m;
        if (type === "box") m = MeshBuilder.CreateBox("box", { size: size * 2 }, this.scene);
        else if (type === "cylinder")
            m = MeshBuilder.CreateCylinder("cyl", { height: size * 2, diameter: size * 1.5 }, this.scene);
        else m = MeshBuilder.CreateSphere("sph", { diameter: size * 2, segments: 16 }, this.scene);

        const mat = new StandardMaterial("mat", this.scene);
        const palette = [Color3.FromHexString("#4CAF50"), Color3.FromHexString("#FF9800"), Color3.FromHexString("#2196F3")];
        mat.diffuseColor = palette[this.index % palette.length];
        m.material = mat;

        m.parent = this.node;
        this.mesh = m;
    }
}
