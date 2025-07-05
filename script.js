document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("contentArea");
  const mobileMenuButton = document.getElementById("mobileMenuButton");
  const mobileNavMenu = document.getElementById("nav-menu");
  const currentYearSpan = document.getElementById("currentYear");
  const fixedPhoneMockupContainer = document.getElementById(
    "fixedPhoneMockupContainer"
  );

  currentYearSpan.textContent = new Date().getFullYear();

  // --- Mobile menu toggle logic ---
  mobileMenuButton.addEventListener("click", () => {
    mobileNavMenu.classList.toggle("mobile-menu-active");
    const isExpanded =
      mobileMenuButton.getAttribute("aria-expanded") === "true" || false;
    mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
  });

  // --- Modal Logic ---
  const modal = document.getElementById("popupModal");
  const closeModalBtn = document.getElementById("closeModal");

  function showModal() {
    modal.classList.add("visible");
  }

  function hideModal() {
    modal.classList.remove("visible");
  }

  document.body.addEventListener("click", function (event) {
    if (event.target.closest(".download-btn")) {
      event.preventDefault();
      showModal();
    }
  });

  closeModalBtn.addEventListener("click", hideModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) hideModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("visible")) {
      hideModal();
    }
  });

  // --- Logic functions to be re-initialized on page load ---
  function initMainPhoneImageSwap() {
    const featureItems = document.querySelectorAll(".feature-item");
    const phoneImages =
      fixedPhoneMockupContainer.querySelectorAll(".phone-img");
    if (!featureItems.length || !phoneImages.length) return;

    if (phoneImages.length > 0) {
      phoneImages[0].classList.add("visible");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgIndex = entry.target.dataset.imgIndex;
            phoneImages.forEach((img, index) => {
              img.classList.toggle("visible", parseInt(imgIndex) === index);
            });
          }
        });
      },
      { threshold: 0.6, rootMargin: "-10% 0% -10% 0%" }
    );

    featureItems.forEach((item) => observer.observe(item));
  }

  function positionFixedPhoneMockup() {
    if (!fixedPhoneMockupContainer) return;
    const mainContentContainer = document.querySelector(".max-w-7xl.mx-auto");
    if (!mainContentContainer) {
      fixedPhoneMockupContainer.style.display = "none";
      return;
    }

    if (window.innerWidth < 768) {
      fixedPhoneMockupContainer.style.display = "none";
      return;
    } else {
      fixedPhoneMockupContainer.style.display = "block";
    }

    const containerRect = mainContentContainer.getBoundingClientRect();
    const headerHeight = document.querySelector("header").offsetHeight;
    const contentLeftEdge = containerRect.left;
    const contentWidth = containerRect.width;
    const phoneMockupLeftPosition =
      contentLeftEdge + contentWidth * (3 / 5) + 30;

    fixedPhoneMockupContainer.style.left = `${phoneMockupLeftPosition}px`;
    fixedPhoneMockupContainer.style.top = `${headerHeight + 32}px`;
    fixedPhoneMockupContainer.style.transform = "translateY(0)";
  }

  let phoneScrollHandler = null;
  function initPhoneScrollBehavior() {
    const phoneContainer = document.getElementById("fixedPhoneMockupContainer");
    const triggerSection = document.getElementById("how-it-works-section");
    if (!phoneContainer || !triggerSection) return;

    if (phoneScrollHandler) {
      window.removeEventListener("scroll", phoneScrollHandler);
    }

    phoneScrollHandler = () => {
      const headerHeight = document.querySelector("header").offsetHeight;
      const phoneFixedTop = headerHeight + 32;
      const unfixPoint = triggerSection.offsetTop - phoneFixedTop - 32;

      if (window.scrollY > unfixPoint) {
        phoneContainer.style.position = "absolute";
        phoneContainer.style.top = `${triggerSection.offsetTop - 32}px`;
      } else {
        phoneContainer.style.position = "fixed";
        phoneContainer.style.top = `${phoneFixedTop}px`;
      }
    };
    window.addEventListener("scroll", phoneScrollHandler, { passive: true });
  }

  function initAnimatedPhoneCopies() {
    const featureItems = document.querySelectorAll(".feature-item");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const animatedPhoneCopy = entry.target.querySelector(
            ".animated-phone-copy"
          );
          if (animatedPhoneCopy) {
            if (entry.isIntersecting) {
              animatedPhoneCopy.classList.add("animate-in");
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" }
    );

    featureItems.forEach((item) => observer.observe(item));
  }

  // --- Router Logic ---
  const routes = {
    "/": "home",
    "/privacy": "privacy",
    "/terms-and-conditions": "terms",
    "/about": "about",
  };

  const router = async () => {
    const path = window.location.hash.slice(1) || "/";
    const pageKey = routes[path] || "home";

    // Fetch the page content
    const response = await fetch(`pages/${pageKey}.html`);
    const content = await response.text();
    contentArea.innerHTML = content;
    window.scrollTo(0, 0);

    // Close mobile menu
    mobileNavMenu.classList.remove("mobile-menu-active");
    mobileMenuButton.setAttribute("aria-expanded", "false");

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === pageKey);
    });

    // Initialize page-specific logic
    if (pageKey === "home") {
      fixedPhoneMockupContainer.classList.remove("hidden");
      // Use a short delay to ensure DOM is fully ready for position calculations
      setTimeout(() => {
        positionFixedPhoneMockup();
        initMainPhoneImageSwap();
        initAnimatedPhoneCopies();
        initPhoneScrollBehavior();
      }, 10);
    } else {
      fixedPhoneMockupContainer.classList.add("hidden");
      fixedPhoneMockupContainer.style.display = "none";
      if (phoneScrollHandler) {
        window.removeEventListener("scroll", phoneScrollHandler);
      }
    }
  };

  // Event listeners
  window.addEventListener("hashchange", router);
  window.addEventListener("resize", () => {
    if (window.location.hash.slice(1) === "/" || window.location.hash === "") {
      positionFixedPhoneMockup();
      initPhoneScrollBehavior();
    }
  });
  router(); // Initial load
});
