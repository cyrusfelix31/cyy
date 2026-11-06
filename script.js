const portfolioIntro = document.getElementById("portfolioIntro");
const introCanvas = document.getElementById("introCanvas");
const introTitle = document.getElementById("introTitle");
const introSkip = document.getElementById("introSkip");

if (portfolioIntro && introCanvas && introTitle && introSkip) {
  const introContext = introCanvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
  const introTimers = [];
  const stars = [];
  const particles = [];
  let animationFrame = 0;
  let introFinished = false;
  let canvasWidth = 0;
  let canvasHeight = 0;

  if (!prefersReducedMotion) {
    const titleText = introTitle.textContent ?? "";
    introTitle.replaceChildren();

    titleText.split(" ").forEach((word, wordIndex, words) => {
      const wordNode = document.createElement("span");
      wordNode.className = "intro-word";
      wordNode.setAttribute("aria-hidden", "true");

      Array.from(word).forEach((character, characterIndex) => {
        const letter = document.createElement("span");
        letter.className = "intro-letter";
        letter.style.setProperty("--letter-index", String(
          words.slice(0, wordIndex).reduce((count, item) => count + item.length, 0) + wordIndex + characterIndex,
        ));
        letter.textContent = character;
        wordNode.append(letter);
      });

      introTitle.append(wordNode);
    });
  }

  const resizeCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    introCanvas.width = Math.round(canvasWidth * pixelRatio);
    introCanvas.height = Math.round(canvasHeight * pixelRatio);
    introContext?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const createStar = () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: Math.random() * 0.85 + 0.12,
    radius: Math.random() * 1.15 + 0.2,
    alpha: Math.random() * 0.58 + 0.22,
  });

  const createParticle = () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: Math.random() * 1.4 + 0.35,
    drift: Math.random() * 0.32 + 0.08,
    phase: Math.random() * Math.PI * 2,
    alpha: Math.random() * 0.42 + 0.12,
  });

  if (introContext && !prefersReducedMotion) {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    const starCount = isSmallScreen ? 54 : 105;
    const particleCount = isSmallScreen ? 18 : 34;
    for (let index = 0; index < starCount; index += 1) stars.push(createStar());
    for (let index = 0; index < particleCount; index += 1) particles.push(createParticle());

    const drawCosmos = (time) => {
      if (introFinished || !introContext) return;

      introContext.clearRect(0, 0, canvasWidth, canvasHeight);
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const spread = Math.max(canvasWidth, canvasHeight) * 0.7;

      stars.forEach((star) => {
        star.z += 0.0016;
        if (star.z > 0.98) {
          Object.assign(star, createStar(), { z: 0.12 });
        }

        const perspective = 1.05 - star.z;
        const x = centerX + (star.x / perspective) * spread * 0.23;
        const y = centerY + (star.y / perspective) * spread * 0.23;
        if (x < -3 || x > canvasWidth + 3 || y < -3 || y > canvasHeight + 3) return;

        const radius = star.radius * (0.55 + star.z * 1.15);
        introContext.globalAlpha = star.alpha * (0.38 + star.z * 0.62);
        introContext.fillStyle = star.z > 0.82 ? "#ddffe5" : "#b4f5c5";
        introContext.shadowBlur = star.z > 0.78 ? 8 : 0;
        introContext.shadowColor = "#72e89a";
        introContext.beginPath();
        introContext.arc(x, y, radius, 0, Math.PI * 2);
        introContext.fill();
      });

      particles.forEach((particle) => {
        particle.y -= particle.drift;
        if (particle.y < -4) {
          particle.y = canvasHeight + 4;
          particle.x = Math.random() * canvasWidth;
        }

        introContext.globalAlpha = particle.alpha * (0.62 + Math.sin(time / 650 + particle.phase) * 0.38);
        introContext.fillStyle = "#9ce3b0";
        introContext.shadowBlur = 9;
        introContext.shadowColor = "#5cd987";
        introContext.beginPath();
        introContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        introContext.fill();
      });

      introContext.globalAlpha = 1;
      introContext.shadowBlur = 0;
      animationFrame = window.requestAnimationFrame(drawCosmos);
    };

    animationFrame = window.requestAnimationFrame(drawCosmos);
  }

  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;
    introTimers.forEach(window.clearTimeout);
    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", resizeCanvas);
    portfolioIntro.classList.add("is-leaving");
    document.body.classList.remove("intro-active");

    window.setTimeout(() => {
      portfolioIntro.remove();
      const homeTitle = document.getElementById("home-title");
      if (homeTitle) {
        homeTitle.tabIndex = -1;
        homeTitle.focus({ preventScroll: true });
      }
    }, prefersReducedMotion ? 50 : 900);
  };

  const scheduleScene = (delay, scene) => {
    introTimers.push(window.setTimeout(() => {
      if (!introFinished) portfolioIntro.classList.add(scene);
    }, delay));
  };

  document.body.classList.add("intro-active");
  introSkip.focus({ preventScroll: true });
  introSkip.addEventListener("click", finishIntro);
  portfolioIntro.addEventListener("keydown", (event) => {
    if (event.key === "Escape") finishIntro();
    if (event.key === "Tab") {
      event.preventDefault();
      introSkip.focus();
    }
  });

  if (prefersReducedMotion) {
    portfolioIntro.classList.add("scene-stars", "scene-title", "scene-subtitle");
    introTimers.push(window.setTimeout(finishIntro, 1500));
  } else {
    scheduleScene(100, "scene-stars");
    scheduleScene(1000, "scene-particles");
    scheduleScene(2050, "scene-strike");
    scheduleScene(2850, "scene-title");
    scheduleScene(4050, "scene-subtitle");
    introTimers.push(window.setTimeout(finishIntro, 7100));
  }
}

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
const navLinks = document.querySelectorAll(".nav-link");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle && (menuToggle.textContent = "☰");
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const typewriterText = document.querySelector("[data-typewriter]");
if (typewriterText && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const phrase = typewriterText.textContent;
  typewriterText.textContent = "";
  typewriterText.classList.add("is-typing");

  let characterIndex = 0;
  const typeNextCharacter = () => {
    if (characterIndex >= phrase.length) {
      typewriterText.classList.remove("is-typing");
      return;
    }

    typewriterText.textContent += phrase[characterIndex];
    characterIndex += 1;
    window.setTimeout(typeNextCharacter, 62);
  };

  window.setTimeout(typeNextCharacter, 450);
}

const heroArt = document.querySelector(".hero-art");
const profilePortrait = document.querySelector(".profile-portrait");

if (heroArt && profilePortrait && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  heroArt.addEventListener("pointermove", (event) => {
    const rect = heroArt.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

    heroArt.style.setProperty("--pointer-x", `${offsetX * 12}px`);
    heroArt.style.setProperty("--pointer-y", `${offsetY * 12}px`);
    profilePortrait.style.setProperty("--tilt-x", `${-offsetY * 7}deg`);
    profilePortrait.style.setProperty("--tilt-y", `${offsetX * 9}deg`);
  });

  heroArt.addEventListener("pointerleave", () => {
    heroArt.style.setProperty("--pointer-x", "0px");
    heroArt.style.setProperty("--pointer-y", "0px");
    profilePortrait.style.setProperty("--tilt-x", "0deg");
    profilePortrait.style.setProperty("--tilt-y", "0deg");
  });
}

const aboutPortraitStage = document.querySelector(".about-portrait-stage");
const aboutPortrait = document.querySelector(".about-portrait");

if (aboutPortraitStage && aboutPortrait && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  aboutPortraitStage.addEventListener("pointermove", (event) => {
    const bounds = aboutPortraitStage.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    aboutPortrait.style.setProperty("--portrait-x", `${offsetX * 5}px`);
    aboutPortrait.style.setProperty("--portrait-y", `${offsetY * 5}px`);
    aboutPortrait.style.setProperty("--portrait-tilt-x", `${-offsetY * 4}deg`);
    aboutPortrait.style.setProperty("--portrait-tilt-y", `${offsetX * 5}deg`);
  });

  aboutPortraitStage.addEventListener("pointerleave", () => {
    aboutPortrait.style.setProperty("--portrait-x", "0px");
    aboutPortrait.style.setProperty("--portrait-y", "0px");
    aboutPortrait.style.setProperty("--portrait-tilt-x", "0deg");
    aboutPortrait.style.setProperty("--portrait-tilt-y", "0deg");
  });
}

const revealItems = document.querySelectorAll(
  ".section-heading, .about-intro, .about-note, .about-portrait-stage, .about-content, .quick-facts > div, .skill-card, .project-card, .credential-item, .experience-item, .contact-card",
);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  revealItems.forEach((item) => {
    item.classList.add("reveal-item");
    revealObserver.observe(item);
  });
}

// Highlight the navigation item for the section currently in view.
const sections = document.querySelectorAll("main section[id]");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach((section) => observer.observe(section));
