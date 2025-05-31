function toggleMenu() {
  const navLinks = document.querySelector(".nav-links");
  navLinks.classList.toggle("active");
  const menuIcon = document.querySelector(".menu-icon");
  menuIcon.classList.toggle("active"); // For potential icon animation
}

const stepTabs = document.querySelectorAll(".step-tab");
const stepCards = document.querySelectorAll(".step-cards");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");
let currentStep = 0;

function showStep(stepIndex) {
  stepTabs.forEach((tab) => tab.classList.remove("active"));
  stepCards.forEach((cards) => cards.classList.remove("active"));

  if (stepTabs[stepIndex]) {
    stepTabs[stepIndex].classList.add("active");
  }
  if (stepCards[stepIndex]) {
    stepCards[stepIndex].classList.add("active");
  }

  currentStep = stepIndex;
  updateNavigationButtons();
}

function updateNavigationButtons() {
  if (prevButton) {
    prevButton.disabled = currentStep === 0;
  }
  if (nextButton) {
    nextButton.disabled = currentStep === stepTabs.length - 1;
  }
}

stepTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    showStep(index);
  });
});

if (prevButton) {
  prevButton.addEventListener("click", () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (currentStep < stepTabs.length - 1) {
      showStep(currentStep + 1);
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && currentStep > 0) {
    showStep(currentStep - 1);
  } else if (e.key === "ArrowRight" && currentStep < stepTabs.length - 1) {
    showStep(currentStep + 1);
  }
});

if (stepTabs.length > 0 && stepCards.length > 0) {
  showStep(0);
}

const testimonialsCarousel = document.getElementById("testimonials-carousel");
const testimonialsNext = document.getElementById("testimonials-next");
const testimonialDots = document.querySelectorAll(".testimonial-dot");
const testimonialCards = document.querySelectorAll(".testimonial-card");
let currentSet = 0;
let autoPlayInterval;
let isAnimating = false;

function getCardsPerView() {
  const container = document.querySelector(".testimonials-container");
  if (!container) return 3;

  const width = window.innerWidth;
  if (width <= 576) return 1;
  if (width <= 768) return 1;
  if (width <= 1024) return 2;
  return 3;
}

function getTotalSets() {
  const cardsPerView = getCardsPerView();
  return Math.ceil(testimonialCards.length / cardsPerView);
}

function showCurrentSet() {
  if (!testimonialsCarousel || !testimonialCards.length || isAnimating) return;

  isAnimating = true;

  const cardsPerView = getCardsPerView();
  const startIndex = currentSet * cardsPerView;

  testimonialCards.forEach((card, index) => {
    const shouldShow = index >= startIndex && index < startIndex + cardsPerView;
    if (shouldShow) {
      card.classList.remove("hidden");
      card.style.opacity = "0";
    } else {
      card.classList.add("hidden");
    }
  });

  setTimeout(() => {
    testimonialCards.forEach((card, index) => {
      const shouldShow =
        index >= startIndex && index < startIndex + cardsPerView;
      if (shouldShow) {
        card.style.opacity = "1";
      }
    });
  }, 50);

  testimonialDots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentSet);
  });

  setTimeout(() => {
    isAnimating = false;
  }, 600);
}

function nextSet() {
  if (isAnimating) return;

  const totalSets = getTotalSets();
  currentSet = (currentSet + 1) % totalSets;
  showCurrentSet();
}

function goToSet(setIndex) {
  if (isAnimating) return;

  const totalSets = getTotalSets();
  currentSet = Math.min(setIndex, totalSets - 1);
  showCurrentSet();
  restartAutoPlay();
}

function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(nextSet, 4000);
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function restartAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

function updateGridLayout() {
  const cardsPerView = getCardsPerView();
  const carousel = document.querySelector(".testimonials-carousel");

  if (carousel) {
    if (cardsPerView === 1) {
      carousel.style.gridTemplateColumns = "1fr";
      carousel.style.maxWidth = "320px";
    } else if (cardsPerView === 2) {
      carousel.style.gridTemplateColumns = "repeat(2, 1fr)";
      carousel.style.maxWidth = "700px";
    } else {
      carousel.style.gridTemplateColumns = "repeat(3, 1fr)";
      carousel.style.maxWidth = "1000px";
    }
  }
}

if (testimonialsCarousel && testimonialCards.length > 0) {
  if (testimonialsNext) {
    testimonialsNext.addEventListener("click", () => {
      nextSet();
      restartAutoPlay();
    });
  }

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToSet(index));
  });

  const carouselWrapper = document.querySelector(
    ".testimonials-carousel-wrapper"
  );
  if (carouselWrapper) {
    carouselWrapper.addEventListener("mouseenter", stopAutoPlay);
    carouselWrapper.addEventListener("mouseleave", startAutoPlay);
  }

  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  testimonialsCarousel.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
      isDragging = true;
      stopAutoPlay();
    },
    { passive: true }
  );

  testimonialsCarousel.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    },
    { passive: true }
  );

  testimonialsCarousel.addEventListener(
    "touchend",
    () => {
      if (!isDragging) return;
      isDragging = false;

      const diffX = startX - currentX;
      const threshold = 50;

      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          nextSet();
        } else {
          const totalSets = getTotalSets();
          currentSet = currentSet > 0 ? currentSet - 1 : totalSets - 1;
          showCurrentSet();
        }
      }

      restartAutoPlay();
    },
    { passive: true }
  );

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateGridLayout();
      showCurrentSet();
    }, 250);
  });

  updateGridLayout();
  showCurrentSet();
  startAutoPlay();
}
