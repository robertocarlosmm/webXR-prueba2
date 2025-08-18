// @ts-check

/**
 * Devuelve un Blob con la foto compuesta (video + overlay)
 * - type: "image/png" | "image/jpeg"
 * - quality: 0..1 (solo para jpeg)
 * - mirror: espejar horizontalmente (selfie)
 * - dpr: factor de resolución (por defecto devicePixelRatio)
 */
export async function capture(
    video,
    overlay,
    { type = "image/png", quality = 0.92, mirror = false, dpr = window.devicePixelRatio || 1 } = {}
) {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) throw new Error("El <video> aún no tiene dimensiones (¿loadedmetadata?).");

    // Canvas a resolución física (para nitidez)
    const c = document.createElement("canvas");
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);

    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas.");

    // Escala todo por dpr para dibujar en 'px CSS'
    ctx.scale(dpr, dpr);

    // Si quieres selfie espejo, invierte el eje X antes de dibujar el video
    if (mirror) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
    }

    // 1) frame de video
    ctx.drawImage(video, 0, 0, w, h);

    // 2) overlay 3D
    // Si espejaste el video, “deshace” el espejo solo para dibujar el overlay correcto
    if (mirror) {
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(overlay, 0, 0, w, h);
        ctx.restore();
    } else {
        ctx.drawImage(overlay, 0, 0, w, h);
    }

    // A veces toBlob puede devolver null (o no existir): usa fallback
    const blob = await canvasToBlob(c, type, quality);
    return blob;
}

export function download(blob, filename = "foto.png") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ----- utilidades -----
function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        if (canvas.toBlob) {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else {
                    // Fallback: toDataURL -> Blob
                    try {
                        const blob = dataURLtoBlob(canvas.toDataURL(type, quality));
                        resolve(blob);
                    } catch (e) {
                        reject(e);
                    }
                }
            }, type, quality);
        } else {
            try {
                const blob = dataURLtoBlob(canvas.toDataURL(type, quality));
                resolve(blob);
            } catch (e) {
                reject(e);
            }
        }
    });
}

function dataURLtoBlob(dataURL) {
    const [meta, data] = dataURL.split(",");
    const isBase64 = /;base64$/.test(meta.split(";")[1] || "");
    const mime = meta.split(":")[1].split(";")[0] || "application/octet-stream";
    const binary = isBase64 ? atob(data) : decodeURIComponent(data);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new Blob([u8], { type: mime });
}
