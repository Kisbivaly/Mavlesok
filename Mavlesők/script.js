const track = document.getElementById("image-track");
if (!track) throw new Error('#image-track nem található');

// érzékenység: nagyobb érték = erősebb elmozdulás egy görgetésre
const SENSITIVITY = 20;

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