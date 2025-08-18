// src/ui/screens/photo.js
// @ts-check

import { startCamera, stopCamera } from "../../photos/camera.js";
import { startPhotoOverlay } from "../../photos/overlay.js";
import { capture, download } from "../../photos/composite.js";


const $ = (id) => /** @type {HTMLElement} */(document.getElementById(id));

let overlay = null;
/** @type {'environment' | 'user'} */
let facing = 'environment'; // para V1 nos quedamos con trasera
let open = false;

/** Muestra la pantalla Photo Studio y arranca todo. */
export async function showPhotoStudio() {
    if (open) return;
    open = true;

    const screen = $("photo-screen");
    const video = /** @type {HTMLVideoElement} */($("photo-video"));
    const canvas = /** @type {HTMLCanvasElement} */($("photo-overlay"));
    const btnPrev = $("photo-prev");
    const btnNext = $("photo-next");
    const btnShot = $("photo-capture");
    const lbl = $("photo-label");

    screen.classList.remove("hidden");

    try {
        const { width, height } = await startCamera(video, facing);

        // Importante: el canvas overlay debe tener mismas dimensiones reales
        canvas.width = width;
        canvas.height = height;

        overlay = startPhotoOverlay(canvas, width, height);
        lbl.textContent = overlay.currentLabel();

        // Botones
        btnPrev.onclick = () => { overlay.prev(); lbl.textContent = overlay.currentLabel(); };
        btnNext.onclick = () => { overlay.next(); lbl.textContent = overlay.currentLabel(); };
        btnShot.onclick = async () => {
            const blob = await capture(video, canvas, { type: "image/png", quality: 0.95, mirror: false });
            download(blob, "foto-ar.png");
        };
    } catch (e) {
        console.error("No se pudo iniciar la cámara:", e);
        screen.classList.add("hidden");
        open = false;
        alert("No se pudo acceder a la cámara. Revisa permisos/HTTPS.");
    }
}

/** Oculta y limpia todo. */
export function hidePhotoStudio() {
    if (!open) return;
    open = false;

    const screen = $("photo-screen");
    const video = /** @type {HTMLVideoElement} */($("photo-video"));

    overlay?.dispose();
    overlay = null;
    stopCamera(video);

    screen.classList.add("hidden");
}

