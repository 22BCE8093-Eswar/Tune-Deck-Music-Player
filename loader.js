window.addEventListener("DOMContentLoaded", () => {
  const heartbeatDuration = 2000; // 2 seconds heartbeat
  const loader = document.getElementById("loader");
  const player = document.getElementById("player");
  const miniLogo = document.getElementById("mini-logo");

  setTimeout(() => {
    // Fade out loader
    loader.classList.add("fade-out");

    setTimeout(() => {
      loader.style.display = "none";
      player.style.display = "block";

      // Show mini logo at top-left with heartbeat
      miniLogo.style.display = "block";
      miniLogo.style.opacity = 0;
      miniLogo.style.transition = "opacity 1s ease";
      setTimeout(() => { miniLogo.style.opacity = 1; }, 50);

    }, 1000); // wait 1s after fade
  }, heartbeatDuration);
});
