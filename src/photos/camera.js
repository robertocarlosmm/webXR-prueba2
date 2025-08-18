// @ts-check

/**
 * Inicia la cámara en el <video>. Devuelve { stream, width, height }.
 * @param {HTMLVideoElement} video
 * @param {'user'|'environment'} facing
 */
export async function startCamera(video, facing = 'environment') {
    // atributos recomendados para móvil (iOS sobre todo)
    video.setAttribute('playsinline', 'true');
    video.muted = true;
    video.autoplay = true;

    //para el control de la cámara: getUserMedia
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: facing,                 // 'user' (frontal) | 'environment' (trasera)
            width: { ideal: 1280 },             // puedes ajustar
            height: { ideal: 720 }
        }
    });

    video.srcObject = stream;
    await video.play();
    // Espera metadatos para tener dimensiones reales
    if (!video.videoWidth || !video.videoHeight) {
        await new Promise(r => video.addEventListener('loadedmetadata', r, { once: true }));
    }
    return { stream, width: video.videoWidth, height: video.videoHeight };
}

/** Detiene todos los tracks del stream actual del <video>. */
export function stopCamera(video) {
    const s = /** @type {MediaStream|null} */ (video.srcObject);
    if (s) { s.getTracks().forEach(t => t.stop()); }
    video.srcObject = null;
}
