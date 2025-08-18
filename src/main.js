import "./style.css";
// @ts-check
import { createEngineAndScene } from "./core/xr/engine.js";
import { createXRExperience } from "./core/xr/experience.js";
import { setupHitTest } from "./core/xr/hitTest.js";
import { setupLightEstimation } from "./core/xr/lightEstimation.js";
import { ShapeCycler } from "./game/shapes.js";
import { showPhotoStudio, hidePhotoStudio } from "./ui/screens/photo.js";

const $ = (id) => /** @type {HTMLElement} */(document.getElementById(id));

const lobby = $("lobby");
const hud = $("hud");
const label = $("shape-label");
const msg = $("center-msg");

(async function boot() {
  const { engine, scene } = createEngineAndScene(/** @type {HTMLCanvasElement} */($("app")));

  // botones del lobby/hud
  $("btn-play").addEventListener("click", () => startAR());
  $("btn-exit").addEventListener("click", () => exitAR());
  // 👉 Álbum = abre Photo Studio (fuera de XR)
  $("btn-album").addEventListener("click", async () => {
    // Si estabas en AR, sal para liberar cámara/recursos antes de abrir la otra
    if (xrExp) await exitAR();

    // Oculta el lobby si no quieres que se vea detrás (Photo Studio ya cubre toda la pantalla)
    lobby.classList.remove("is-active");
    hud.classList.add("hidden");

    await showPhotoStudio();
  });

  // Botón “Volver” dentro del Photo Studio
  $("photo-back")?.addEventListener("click", () => {
    hidePhotoStudio();
    // Te dejo de vuelta en el lobby; desde ahí puedes “Jugar” otra vez si quieres volver a AR
    lobby.classList.add("is-active");
  });

  let xrExp = null;
  let hit = null;
  let light = null;
  let cycler = null;

  async function startAR() {
    lobby.classList.remove("is-active");
    hud.classList.remove("hidden");

    // 1) sesión XR con DOM overlay
    xrExp = await createXRExperience(scene, hud);

    // 2) features
    hit = setupHitTest(xrExp.fm, scene, {
      onNoHit: () => { if (msg) msg.style.opacity = "1"; },
      onHit: () => { if (msg) msg.style.opacity = "0"; },
      yOffset: 0.0, // pon 0.05 si quieres “levantar” el objeto 5 cm
    });
    light = setupLightEstimation(xrExp.fm); // opcional

    // 3) lógica de juego — cuelga la figura del anchor del hit-test
    cycler = new ShapeCycler(scene);
    cycler.attachTo(hit.anchor);
    label.textContent = cycler.currentLabel();
    $("btn-next").onclick = () => { cycler.next(); label.textContent = cycler.currentLabel(); };
    $("btn-prev").onclick = () => { cycler.prev(); label.textContent = cycler.currentLabel(); };
  }

  async function exitAR() {
    // apaga features primero (evita listeners duplicados si re-entras)
    hit && hit.dispose(); hit = null;
    light && light.dispose(); light = null;

    if (xrExp) { await xrExp.exit(); xrExp = null; }

    hud.classList.add("hidden");
    lobby.classList.add("is-active");
  }

  // render loop
  engine.runRenderLoop(() => scene.render());
  addEventListener("resize", () => engine.resize());
})();
