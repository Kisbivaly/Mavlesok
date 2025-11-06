// Try to find desktop track first, otherwise mobile track
let track = document.getElementById("image-track");
if (!track) track = document.getElementById("image-track-mobile");
if (!track) throw new Error('#image-track vagy #image-track-mobile nem található');

// érzékenység: nagyobb érték = erősebb elmozdulás egy görgetésre
const SENSITIVITY = 20;
// egérhúzás lassítása: 1 = eredeti, <1 lassabb
const MOUSE_SENSITIVITY = 0.6;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const handleWheel = (e) => {
  e.preventDefault(); // megakadályozzuk az alapértelmezett oldalgörgetést
  const prev = parseFloat(track.dataset.prevPercentage) || 0;
  const maxDelta = window.innerHeight || 800;
  // normáljuk a görgetés értékét és skálázzuk érzékenységgel
  const percentageChange = (e.deltaY / maxDelta) * -SENSITIVITY;
  const nextUnconstrained = prev + percentageChange;
  const next = clamp(nextUnconstrained, -100, 0);

  track.dataset.percentage = next;
  track.dataset.prevPercentage = next;

  track.animate({
    transform: `translate(${next}%, -50%)`
  }, { duration: 600, fill: "forwards" });

  for(const image of track.getElementsByClassName("image")) {
    image.animate({
      objectPosition: `${100 + next}% center`
    }, { duration: 600, fill: "forwards" });
  }
};

// wheel hallgató passive:false-ral, hogy preventDefault működjön
window.addEventListener('wheel', handleWheel, { passive: false });

// ensure dataset keys exist
track.dataset.mouseDownAt = track.dataset.mouseDownAt || "0";
track.dataset.percentage = track.dataset.percentage || "0";
track.dataset.prevPercentage = track.dataset.prevPercentage || "0";

/* --- Mouse / touch drag support --- */
const handleOnDown = e => {
  // e is a MouseEvent or a Touch-like object with clientX
  track.dataset.mouseDownAt = String(e.clientX);
};

const handleOnUp = () => {
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage || "0";
};

const handleOnMove = e => {
  if (track.dataset.mouseDownAt === "0") return;

  const startX = parseFloat(track.dataset.mouseDownAt);
  const mouseDelta = startX - e.clientX;
  const maxDelta = window.innerWidth / 1.5;

  // lassított egérmozgás alkalmazása
  const percentage = (mouseDelta / maxDelta) * -100 * MOUSE_SENSITIVITY;
  const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage || "0") + percentage;
  const nextPercentage = clamp(nextPercentageUnconstrained, -100, 0);

  track.dataset.percentage = String(nextPercentage);

  track.animate({
    transform: `translate(${nextPercentage}%, -50%)`
  }, { duration: 800, fill: "forwards" }); // hosszabb animáció = lassabb érzet

  for (const image of track.getElementsByClassName("image")) {
    image.animate({
      objectPosition: `${100 + nextPercentage}% center`
    }, { duration: 800, fill: "forwards" });
  }
};

/* Register mouse + touch listeners */
window.addEventListener('mousedown', handleOnDown);
window.addEventListener('mouseup', handleOnUp);
window.addEventListener('mousemove', handleOnMove);

window.addEventListener('touchstart', (e) => {
  if (e.touches && e.touches[0]) handleOnDown(e.touches[0]);
}, { passive: true });

window.addEventListener('touchend', (e) => {
  // touchend has no touches[0], use handleOnUp
  handleOnUp();
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches[0]) handleOnMove(e.touches[0]);
}, { passive: true });