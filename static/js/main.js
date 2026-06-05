const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const roles = ["Aspiring Software Developer", "Frontend Developer", "AI & Machine Learning Enthusiast"];
const githubUser = "rajappriyanraja-ui";

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
};

const setupRoleTyping = () => {
  const target = document.querySelector("#typed-role");
  if (!target) {
    return;
  }

  if (prefersReducedMotion) {
    target.textContent = roles.join(" | ");
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const role = roles[roleIndex];
    target.textContent = role.slice(0, charIndex);

    if (!deleting && charIndex < role.length) {
      charIndex += 1;
      window.setTimeout(tick, 58);
      return;
    }

    if (!deleting) {
      deleting = true;
      window.setTimeout(tick, 1100);
      return;
    }

    if (charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(tick, 32);
      return;
    }

    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    window.setTimeout(tick, 240);
  };

  tick();
};

const setupRevealAnimations = () => {
  const elements = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 28, 180)}ms`;
    observer.observe(element);
  });
};

const setupNavigation = () => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#site-menu");
  const links = document.querySelectorAll(".nav-links a");

  toggle?.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu?.classList.toggle("is-open", !isOpen);
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      toggle?.setAttribute("aria-expanded", "false");
      menu?.classList.remove("is-open");
    });
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  if (!sections.length || prefersReducedMotion || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-38% 0px -54% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
};

const setupScrollProgress = () => {
  const progress = document.querySelector(".scroll-progress");
  if (!progress) {
    return;
  }

  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${percentage}%`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
};

const setupMarquee = () => {
  const track = document.querySelector(".signal-track");
  if (!track) {
    return;
  }

  track.innerHTML = `${track.innerHTML}${track.innerHTML}`;
};

const setupPortraitFallback = () => {
  const image = document.querySelector(".portrait-image");
  if (!image) {
    return;
  }

  const replacePortrait = () => {
    if (image.dataset.fallbackApplied === "true") {
      const fallback = createElement("div", "portrait-fallback", "RR");
      image.replaceWith(fallback);
      return;
    }

    image.dataset.fallbackApplied = "true";
    image.src = "static/images/rajappriyan-portrait.svg";
  };

  image.addEventListener("error", replacePortrait);

  if (image.complete && image.naturalWidth === 0) {
    replacePortrait();
  }
};

const setupGithubStats = async () => {
  const repoCount = document.querySelector("#repo-count");
  const topLanguages = document.querySelector("#top-languages");
  const contributionStatus = document.querySelector("#contribution-status");

  try {
    const response = await fetch(`https://api.github.com/users/${githubUser}/repos?per_page=100&sort=updated`);
    if (!response.ok) {
      throw new Error("GitHub API unavailable");
    }

    const repos = await response.json();
    const languageCounts = repos.reduce((counts, repo) => {
      if (repo.language) {
        counts[repo.language] = (counts[repo.language] || 0) + 1;
      }
      return counts;
    }, {});
    const languages = Object.entries(languageCounts)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 3)
      .map(([language]) => language);

    if (repoCount) {
      repoCount.textContent = String(repos.length).padStart(2, "0");
    }
    if (topLanguages && languages.length) {
      topLanguages.textContent = languages.join(", ");
    }
    if (contributionStatus) {
      contributionStatus.textContent = repos.length ? "Active" : "Growing";
    }
  } catch {
    if (repoCount) {
      repoCount.textContent = "Public";
    }
    if (contributionStatus) {
      contributionStatus.textContent = "Active";
    }
  }
};

const setupContactForm = () => {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    status.textContent = "Sending...";

    try {
      const formspreeResponse = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (formspreeResponse.ok) {
        form.reset();
        status.textContent = "Message sent successfully.";
        return;
      }

      throw new Error("Formspree endpoint is not active yet");
    } catch {
      status.textContent = "Sorry, the contact service is unavailable. Please email rajappriyanraja@gmail.com directly.";
    }
  });
};

const init = () => {
  setupRoleTyping();
  setupRevealAnimations();
  setupNavigation();
  setupScrollProgress();
  setupMarquee();
  setupPortraitFallback();
  setupGithubStats();
  setupContactForm();
};

window.openImageModal = (imageSrc, caption) => {
  const modal = document.querySelector("#imageModal");
  const modalImage = document.querySelector("#modalImage");
  const modalCaption = document.querySelector("#modalCaption");
  
  if (!modal || !modalImage || !modalCaption) {
    return;
  }
  
  modalImage.src = imageSrc;
  modalImage.alt = caption;
  modalCaption.textContent = caption;
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeImageModal = () => {
  const modal = document.querySelector("#imageModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
};

// Initialize the page when the DOM is ready
const initializePage = () => {
  init();

  const modal = document.querySelector("#imageModal");
  if (modal) {
    // Click outside to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeImageModal();
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", initializePage);

// Escape key to close
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeImageModal();
  }
});
