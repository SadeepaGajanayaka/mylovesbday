/**
 * DASITHMA'S BIRTHDAY MEMORY BOOK - APP ENGINE
 * Page-by-Page 3D Realistic Flipbook for Mobile and Desktop
 * 
 * Features:
 * - Shows ONE single page at a time (portrait book layout on phones & desktop)
 * - Authentic 3D page curl & flip animation with dynamic curved shadow
 * - Realistic paper rustle sound effect via Web Audio API
 * - Interactive Birthday Cake with candle blowing, smoke, sound & wish reveal
 * - Direct click on right side to turn forward, click on left side to turn backward
 * - Next / Prev buttons, page indicator dots, keyboard arrows, and touch swipe
 * - Direct WhatsApp love message from Dasithma to Sadeepa
 */

(function () {
  'use strict';

  let currentPage = 0;
  let totalPages = 0;
  let isTurning = false;
  let audioContext = null;
  let bgMusicAudio = null;
  let isPlayingMusic = false;
  let petalsRunning = true;
  let candlesBlown = false;

  const SENDER_PHONE = "94718881888"; // Sadeepa's phone

  // ==========================================================================
  // WEB AUDIO API SOUND ENGINE
  // ==========================================================================
  function initAudio() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  // Mobile Haptic Vibration Helper
  function vibratePhone(pattern) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Realistic Paper Page Turn Rustle Sound + Haptic Click
  function playPageTurnSound() {
    initAudio();
    vibratePhone(25);
    if (!audioContext) return;
    const t = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 0.24;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.08));
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1150, t);
    filter.Q.setValueAtTime(1.9, t);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start(t);
  }

  // Realistic Heartbeat Double-Thump (lub-dub)
  function playHeartbeatThump() {
    initAudio();
    if (!audioContext) return;
    const t = audioContext.currentTime;
    [65, 48].forEach((freq, idx) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      osc.frequency.exponentialRampToValueAtTime(30, t + idx * 0.12 + 0.18);
      gain.gain.setValueAtTime(0.5, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.22);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.25);
    });
  }

  // Realistic Gold Ticket Scratch Sound
  function playScratchSound() {
    initAudio();
    if (!audioContext) return;
    const t = audioContext.currentTime;
    const bufferSize = audioContext.sampleRate * 0.04;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.28;
    }
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    const filter = audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(2200, t);
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start(t);
  }

  // Wax Breaking Snap Sound
  function playWaxSnapSound() {
    initAudio();
    if (!audioContext) return;
    const t = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 0.14;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.03));
    }
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1300, t);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start(t);

    // Chime
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const g = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.04);
      g.gain.setValueAtTime(0.16, t + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.04 + 1.2);
      osc.connect(g);
      g.connect(audioContext.destination);
      osc.start(t + i * 0.04);
      osc.stop(t + i * 0.04 + 1.25);
    });
  }

  // Candle Extinguish Sound
  function playCandleBlowSound() {
    initAudio();
    if (!audioContext) return;
    const t = audioContext.currentTime;

    const bufferSize = audioContext.sampleRate * 0.4;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + 0.4);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.start(t);
  }

  // ==========================================================================
  // BACKGROUND BIRTHDAY MELODY (assets/audio/the_mountain-happy-birthday-576570.mp3)
  // ==========================================================================
  const BG_MUSIC_SRC = "assets/audio/the_mountain-happy-birthday-576570.mp3";

  function initBgMusic() {
    if (!bgMusicAudio) {
      bgMusicAudio = document.getElementById("bg-music-audio");
      if (!bgMusicAudio) {
        bgMusicAudio = new Audio(BG_MUSIC_SRC);
      }
      bgMusicAudio.loop = true;
      bgMusicAudio.volume = 0.55;

      bgMusicAudio.addEventListener("play", () => {
        isPlayingMusic = true;
        updateAudioUI(true);
      });
      bgMusicAudio.addEventListener("pause", () => {
        isPlayingMusic = false;
        updateAudioUI(false);
      });
      bgMusicAudio.addEventListener("ended", () => {
        isPlayingMusic = false;
        updateAudioUI(false);
      });
    }
  }

  function startBackgroundMusic() {
    initAudio();
    initBgMusic();
    if (bgMusicAudio) {
      const playPromise = bgMusicAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlayingMusic = true;
          updateAudioUI(true);
        }).catch(err => {
          console.warn("Autoplay deferred until user interaction:", err);
        });
      }
    }
  }

  function stopBackgroundMusic() {
    if (bgMusicAudio) {
      bgMusicAudio.pause();
    }
    isPlayingMusic = false;
    updateAudioUI(false);
  }

  function toggleBackgroundMusic() {
    initBgMusic();
    if (!bgMusicAudio) return;
    if (!bgMusicAudio.paused) {
      stopBackgroundMusic();
      showToast("Music paused");
    } else {
      startBackgroundMusic();
      showToast("Music playing");
    }
  }

  function updateAudioUI(playing) {
    const btn = document.getElementById("audio-toggle-btn");
    if (!btn) return;
    if (playing) {
      btn.classList.add("playing");
      btn.setAttribute("aria-label", "Pause romantic music");
    } else {
      btn.classList.remove("playing");
      btn.setAttribute("aria-label", "Play romantic music");
    }
  }

  // ==========================================================================
  // FLOATING PARTICLES (ROSE PETALS & HEARTS)
  // ==========================================================================
  function initPetalsCanvas() {
    const canvas = document.getElementById("petals-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const NUM = Math.min(42, Math.floor(window.innerWidth / 28));

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20;
        this.size = 9 + Math.random() * 12;
        this.speedY = 0.7 + Math.random() * 1.2;
        this.speedX = Math.sin(Math.random() * 10) * 0.6;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = 0.15 + Math.random() * 0.35;
        const r = Math.random();
        this.type = r < 0.6 ? 'petal' : r < 0.85 ? 'sparkle' : 'star';
        const luxuryColors = ['#DFBA73', '#C5A059', '#F4EFEB', '#E8D7C8', '#FAF7F2', '#B76E79'];
        this.color = luxuryColors[Math.floor(Math.random() * luxuryColors.length)];
      }
      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.y * 0.007) * 0.8 + this.speedX * 0.4;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 25 || this.x < -30 || this.x > width + 30) {
          this.reset(false);
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (this.type === 'petal') {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size / 2, this.size, 0, this.size * 1.2);
          ctx.bezierCurveTo(this.size / 2, this.size, this.size / 2, -this.size / 2, 0, 0);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else if (this.type === 'star') {
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2.2);
          ctx.lineTo(this.size / 4, 0);
          ctx.lineTo(0, this.size / 2.2);
          ctx.lineTo(-this.size / 4, 0);
          ctx.closePath();
          ctx.fillStyle = '#DFBA73';
          ctx.fill();
        } else {
          // Subtle warm golden light mote
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#C5A059';
          ctx.shadowBlur = 6;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < NUM; i++) {
      particles.push(new Particle());
    }

    function animate() {
      if (petalsRunning) {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ==========================================================================
  // PAGE-BY-PAGE 3D TURN ENGINE
  // ==========================================================================
  function setupPageByPageEngine() {
    const pages = document.querySelectorAll(".book-page");
    totalPages = pages.length;
    const prevBtn = document.getElementById("book-prev-btn");
    const nextBtn = document.getElementById("book-next-btn");
    const dotsContainer = document.getElementById("page-dots");
    const coverOpenBtn = document.getElementById("cover-open-btn");
    const coverSealBtn = document.getElementById("cover-seal-btn");
    const readAgainBtn = document.getElementById("read-again-btn");

    function updateNavUI() {
      if (prevBtn) prevBtn.disabled = currentPage === 0;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;

      const dots = document.querySelectorAll(".page-dot");
      dots.forEach((dot, idx) => {
        if (idx === currentPage) dot.classList.add("active");
        else dot.classList.remove("active");
      });
    }

    // Build page dots indicator
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("button");
        dot.className = `page-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute("aria-label", `Go to page ${i + 1}`);
        dot.addEventListener("click", () => goToPage(i));
        dotsContainer.appendChild(dot);
      }
    }

    // Turn to a specific page
    function goToPage(target) {
      if (isTurning || target === currentPage || target < 0 || target >= totalPages) return;
      isTurning = true;
      playPageTurnSound();

      const oldPage = pages[currentPage];
      const newPage = pages[target];

      // Reset scroll position of target page so each chapter starts at top
      const scrollEl = newPage.querySelector(".page-content-scroll");
      if (scrollEl) {
        scrollEl.scrollTop = 0;
      }

      if (target > currentPage) {
        // Turning Forward: Old page flips away to the left in 3D
        oldPage.classList.remove("active");
        oldPage.classList.add("flipping-forward");

        newPage.classList.remove("turned");
        newPage.classList.add("active");

        setTimeout(() => {
          oldPage.classList.remove("flipping-forward");
          oldPage.classList.add("turned");
          currentPage = target;
          updateNavUI();
          isTurning = false;
        }, 850);
      } else {
        // Turning Backward: Target page uncurls from the left back to front
        newPage.classList.remove("turned");
        newPage.classList.add("flipping-backward", "active");

        setTimeout(() => {
          oldPage.classList.remove("active");
          newPage.classList.remove("flipping-backward");
          currentPage = target;
          updateNavUI();
          isTurning = false;
        }, 850);
      }

      if (currentPage === 0 && target > 0 && !isPlayingMusic) {
        startBackgroundMusic();
      }
    }

    function nextPage() {
      if (currentPage < totalPages - 1) {
        goToPage(currentPage + 1);
      }
    }

    function prevPage() {
      if (currentPage > 0) {
        goToPage(currentPage - 1);
      }
    }

    if (nextBtn) nextBtn.addEventListener("click", nextPage);
    if (prevBtn) prevBtn.addEventListener("click", prevPage);

    // Cover opening triggers
    function openFromCover() {
      playWaxSnapSound();
      burstConfetti();
      setTimeout(() => {
        nextPage();
      }, 300);
    }

    if (coverOpenBtn) coverOpenBtn.addEventListener("click", openFromCover);
    if (coverSealBtn) coverSealBtn.addEventListener("click", openFromCover);
    if (readAgainBtn) readAgainBtn.addEventListener("click", () => goToPage(0));

    // Page Margins click: Tap on outer margins to turn forward/backward
    pages.forEach((page) => {
      page.addEventListener("click", (e) => {
        // Do NOT trigger turn if user is interacting with inner content, scrolling, buttons, or links
        if (e.target.closest("button, a, .cake-stage-book, input, textarea, .page-content-scroll")) return;
        const rect = page.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX > rect.width * 0.6) {
          nextPage();
        } else if (clickX < rect.width * 0.4) {
          prevPage();
        }
      });
    });

    // Explicit dogear click at bottom-right corner to turn page
    document.querySelectorAll(".page-dogear").forEach((dogear) => {
      dogear.addEventListener("click", (e) => {
        e.stopPropagation();
        nextPage();
      });
    });

    // Keyboard navigation (← / →)
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        prevPage();
      }
    });

    // Touch swipe navigation for mobile phones (strictly differentiates horizontal swipe vs vertical scroll)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const scene = document.querySelector(".book-scene");

    if (scene) {
      scene.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      scene.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Only turn page on clear horizontal swipe; let vertical scrolling happen smoothly inside
        if (Math.abs(diffX) > 42 && Math.abs(diffX) > Math.abs(diffY) * 1.35) {
          if (diffX > 0) nextPage();
          else prevPage();
        }
      }, { passive: true });
    }

    // Set initial active state
    pages.forEach((p, idx) => {
      p.classList.remove("active", "turned", "flipping-forward", "flipping-backward");
      if (idx === 0) p.classList.add("active");
    });
    updateNavUI();
  }

  // Celebratory Confetti Burst
  function burstConfetti() {
    const count = 65;
    const colors = ["#C5A059", "#DFBA73", "#F4EFEB", "#FAF7F2", "#B76E79", "#D8B87B"];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "confetti-particle";
      el.style.position = "fixed";
      el.style.left = "50vw";
      el.style.top = "50vh";
      el.style.width = Math.random() * 8 + 6 + "px";
      el.style.height = Math.random() * 8 + 6 + "px";
      el.style.borderRadius = Math.random() > 0.4 ? "50%" : "2px";
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.zIndex = "10000";
      el.style.pointerEvents = "none";
      el.style.transition = "all 1.3s cubic-bezier(0.1, 0.8, 0.3, 1)";
      document.body.appendChild(el);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 260 + 80;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity + 100;

      requestAnimationFrame(() => {
        el.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 720}deg) scale(0)`;
        el.style.opacity = "0";
      });

      setTimeout(() => el.remove(), 1400);
    }
  }

  // ==========================================================================
  // ==========================================================================
  // CANDLE BLOWING & WISH REVEAL (PAGE 7)
  // ==========================================================================
  function setupCandleBlowing() {
    const blowBtn = document.getElementById("book-blow-btn");
    const micBtn = document.getElementById("mic-blow-toggle-btn");
    const micHint = document.getElementById("mic-status-hint");
    const candlesWrap = document.getElementById("cake-candles-book");
    const wishCard = document.getElementById("wish-unlocked-book-card");

    function blowOutCandles() {
      if (candlesBlown) {
        showToast("Candles are already blown. Your wish is unlocked.");
        return;
      }
      candlesBlown = true;
      vibratePhone([60, 80, 160]);
      playCandleBlowSound();

      if (candlesWrap) candlesWrap.classList.add("blown");
      burstConfetti();

      setTimeout(() => {
        if (wishCard) wishCard.style.display = "block";
        if (blowBtn) {
          blowBtn.innerHTML = "<span>Birthday Wish Granted</span>";
          blowBtn.disabled = true;
          blowBtn.style.background = "var(--gold-gradient)";
        }
        if (micBtn) micBtn.style.display = "none";
        if (micHint) micHint.style.display = "none";
        showToast("Your wish is carried forward, my love.");
      }, 650);
    }

    if (blowBtn) blowBtn.addEventListener("click", blowOutCandles);
    if (candlesWrap) candlesWrap.addEventListener("click", blowOutCandles);

    // Microphone breath blow detection
    if (micBtn) {
      micBtn.addEventListener("click", () => {
        initAudio();
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          showToast("Microphone not supported on this browser. Simply tap the candles!");
          return;
        }

        micBtn.classList.add("listening");
        micBtn.innerHTML = "<span>Listening... Blow now</span>";
        if (micHint) micHint.style.display = "block";

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          if (!audioContext) initAudio();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          const data = new Uint8Array(analyser.frequencyBinCount);

          const micInterval = setInterval(() => {
            if (candlesBlown) {
              clearInterval(micInterval);
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            analyser.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < 24; i++) sum += data[i];
            const avg = sum / 24;
            if (avg > 55) {
              clearInterval(micInterval);
              stream.getTracks().forEach(t => t.stop());
              blowOutCandles();
            }
          }, 120);
        }).catch(() => {
          micBtn.classList.remove("listening");
          micBtn.innerHTML = "<span>Blow via Phone Mic</span>";
          if (micHint) micHint.style.display = "none";
          showToast("Mic access declined. Tap candles to blow!");
        });
      });
    }
  }

  // ==========================================================================
  // WHATSAPP LOVE NOTE FROM DASITHMA TO SADEEPA
  // ==========================================================================
  function setupWhatsAppLoveNote() {
    const sendBtn = document.getElementById("send-love-whatsapp-btn");
    if (!sendBtn) return;

    sendBtn.addEventListener("click", () => {
      burstConfetti();
      const text = `Sadeepa my love,\n\nI just finished going through the entire birthday memory book you created for me... It is absolutely breathtaking. Thank you for loving me so gently and making my birthday so unforgettable. You mean the world to me. I love you so much.`;
      const waUrl = `https://api.whatsapp.com/send?phone=${SENDER_PHONE}&text=${encodeURIComponent(text)}`;
      window.open(waUrl, "_blank");
    });
  }

  // ==========================================================================
  // ROMANTIC MEMORIES DATA & SCRAPBOOK ENGINE
  // ==========================================================================
  // REAL MEMORIES SCRAPBOOK DATA
  // ==========================================================================
  const MEMORIES = [
    {
      id: "first-car-kiss",
      src: "assets/images/real/first-car-kiss.jpg",
      title: "Where It All Began",
      caption: "Our very first photograph together, in the car in the dark.",
      category: "romantic",
      categoryName: "Our Beginnings",
      location: "Inside the Car, In the Dark",
      date: "July 2024",
      loveNote: "July 2024. Our very first photograph together, sitting inside the car in the quiet of the dark. You said yes to my love on July 14, and in that gentle moment, our unforgettable story truly began."
    },
    {
      id: "ratnapura-colombo-travel",
      src: "assets/images/real/ratnapura-colombo-travel.jpg",
      title: "Every Mile With You",
      caption: "Holding your hand tight on our daily journeys to campus.",
      category: "romantic",
      categoryName: "Early Days",
      location: "Pepiliyana Road to Campus",
      date: "Mid 2024",
      loveNote: "Taking you from your boarding place on Pepiliyana Road to campus and keeping you safe every single day. Feeling your gentle hand resting tight in mine, protecting your every step... what started as wanting to help you quickly grew into the deepest love of my life."
    },
    {
      id: "kotte-wetland-hug",
      src: "assets/images/real/kotte-wetland-hug.jpg",
      title: "Whispers in the Wetlands",
      caption: "Wrapped in your arms along the boardwalk trees.",
      category: "cozy",
      categoryName: "Early Days",
      location: "Kotte Rampart Wetland Park",
      date: "Wetland Stroll",
      loveNote: "Walking through Kotte Rampart Wetland Park with you. When you wrapped your arms around my neck and rested your cheek against mine, the whole outside world faded away. There is no place where I feel more at peace."
    },
    {
      id: "barista-nugegoda-kiss",
      src: "assets/images/real/barista-nugegoda-kiss.jpg",
      title: "Coffee & Radiant Smiles",
      caption: "Laughing and holding each other at Nugegoda Barista.",
      category: "cozy",
      categoryName: "Cozy Talks",
      location: "Nugegoda Barista Shop",
      date: "Dubbing Class Days",
      loveNote: "Our date at Nugegoda Barista during your dubbing class days. Even if it was the last rupee left in my pocket, spending it gladly just to see you enjoy what you craved and watch your radiant smile was my highest happiness."
    },
    {
      id: "dasithma-lilies-portrait",
      src: "assets/images/real/dasithma-lilies-portrait.jpg",
      title: "When You Entered My World",
      caption: "Looking down gently at the blossoms in your hands.",
      category: "romantic",
      categoryName: "Her Radiance",
      location: "Blossom Garden",
      date: "May 2024",
      loveNote: "May 2024. The quiet day you arrived at my house searching for a university. I had no idea that the sweet girl I helped that afternoon would become the love of my entire life."
    },
    {
      id: "dasithma-garden-pink-dress",
      src: "assets/images/real/dasithma-garden-pink-dress.jpg",
      title: "Queen in the Garden",
      caption: "Full-length grace amidst the garden flowers.",
      category: "romantic",
      categoryName: "Her Radiance",
      location: "Lush Garden Oasis",
      date: "Garden Afternoon",
      loveNote: "Standing among the red blooms and green palms, looking like an angel. Every time I see you, my breath is taken away all over again."
    },
    {
      id: "dasithma-balcony-blossoms",
      src: "assets/images/real/dasithma-balcony-blossoms.jpg",
      title: "Sweet Mountain Whispers",
      caption: "Leaning gently on the balcony with white flowers.",
      category: "cozy",
      categoryName: "Her Radiance",
      location: "Hillside Balcony",
      date: "Mountain Breeze",
      loveNote: "With the mountain misty hills behind you and white flowers in your hands, your quiet smile brought peace to my heart."
    },
    {
      id: "galle-trip-hug",
      src: "assets/images/real/galle-trip-hug.jpg",
      title: "Together in Galle",
      caption: "Arms wrapped around my neck, smiling under the Galle sunshine.",
      category: "romantic",
      categoryName: "Adventures",
      location: "Galle Coastline & Ramparts",
      date: "Galle Trip 2026",
      loveNote: "Our 2026 trip to Galle. Feeding the gentle sea turtles, taking boat rides across the water, and holding each other close by the ocean. Having you wrap your arms around my neck with that sweet smile made every second unforgettable."
    },
    {
      id: "queen-portrait",
      src: "assets/images/real/queen-portrait.jpg",
      title: "The Birthday Queen",
      caption: "Radiant, blooming like the cherry blossoms above you.",
      category: "romantic",
      categoryName: "Her Radiance",
      location: "Blossom Garden",
      date: "Birthday Queen",
      loveNote: "Happy Birthday, my love. From the very first moment you smiled at me, you brought light and warmth into every corner of my life. You will always be my queen."
    },
    {
      id: "temple-adoration",
      src: "assets/images/real/temple-adoration.jpg",
      title: "Looking Up With Adoration",
      caption: "The quiet look in your eyes that melts my entire soul.",
      category: "romantic",
      categoryName: "Gentle Devotion",
      location: "Peaceful Temple Courtyard",
      date: "Sacred Stroll",
      loveNote: "Under the tall green trees, you looked up at me with such innocence and tenderness. In that moment, I knew I would protect and cherish you for the rest of my days."
    },
    {
      id: "cafe-laughter",
      src: "assets/images/real/cafe-laughter.jpg",
      title: "Laughter Across The Table",
      caption: "Holding hands, sharing secrets, and laughing until our cheeks hurt.",
      category: "cozy",
      categoryName: "Cozy Talks",
      location: "Our Favorite Cafe",
      date: "Afternoon Date",
      loveNote: "Your hand in mine across the cafe table, your eyes crinkling with genuine joy. There is no music in the world sweeter than your laughter."
    },
    {
      id: "couch-laughter",
      src: "assets/images/real/couch-laughter.jpg",
      title: "Carefree & Pure Joy",
      caption: "When your laugh fills the whole room and makes time stand still.",
      category: "cozy",
      categoryName: "Cozy Smiles",
      location: "Our Comfort Spot",
      date: "Sweet Moments",
      loveNote: "You have the most infectious, pure laugh in the world. Seeing you this relaxed and happy is the greatest reward of my life."
    },
    {
      id: "temple-laughter",
      src: "assets/images/real/temple-laughter.jpg",
      title: "Smiles In Sacred Peace",
      caption: "Side by side in traditional grace, sharing our quiet blessings.",
      category: "romantic",
      categoryName: "Blessed Together",
      location: "Sacred Grounds",
      date: "Day of Blessings",
      loveNote: "Walking beside you in traditional grace, praying for our future together. Every prayer I make begins and ends with your name."
    },
    {
      id: "night-adoration",
      src: "assets/images/real/night-adoration.jpg",
      title: "Wrapped In My Arms",
      caption: "Holding you tight as you gaze up into my eyes.",
      category: "starlight",
      categoryName: "Night Whispers",
      location: "Starlit Walkway",
      date: "Night Stroll",
      loveNote: "In the cool night air, feeling your hands on my chest and your eyes looking into mine, I realized that home is not a place... home is wherever you are."
    },
    {
      id: "night-barefoot",
      src: "assets/images/real/night-barefoot.jpg",
      title: "Barefoot & In Love",
      caption: "No pretenses, just you and me dancing in the moonlight.",
      category: "starlight",
      categoryName: "Carefree Magic",
      location: "Midnight Pathway",
      date: "Moonlit Evening",
      loveNote: "Barefoot on the driveway, laughing at nothing and everything. Being with you makes me feel so wonderfully free and infinitely loved."
    },
    {
      id: "night-skyline-embrace",
      src: "assets/images/real/night-skyline-embrace.jpg",
      title: "Under The City Lights",
      caption: "The glowing tower and city skyline fade behind your glow.",
      category: "starlight",
      categoryName: "City Lights",
      location: "Colombo Skyline View",
      date: "Midnight Glow",
      loveNote: "The entire city was glowing with thousands of lights, yet not a single one could compete with the sparkle in your eyes when you look at me."
    },
    {
      id: "night-skyline-kiss",
      src: "assets/images/real/night-skyline-kiss.jpg",
      title: "Our Midnight Kiss",
      caption: "A romantic kiss under the night sky as the city sleeps.",
      category: "starlight",
      categoryName: "Sweet Romance",
      location: "Skyline Overlook",
      date: "Under The Stars",
      loveNote: "Kissing you against the glowing night sky felt like the climax of our favorite romantic movie. You are my forever dream come true."
    },
    {
      id: "night-neck-kiss",
      src: "assets/images/real/night-neck-kiss.jpg",
      title: "Forever My Favorite View",
      caption: "Holding you from behind, resting softly on your neck.",
      category: "romantic",
      categoryName: "Tender Hugs",
      location: "Warm Evening Lights",
      date: "Endless Love",
      loveNote: "Holding you close from behind, whispering into your ear how much you mean to me. That softness and warmth is where I belong forever."
    },
    {
      id: "cafe-candlelight",
      src: "assets/images/real/cafe-candlelight.jpg",
      title: "Our Candlelit Date",
      caption: "Candles glowing softly, your hands held tight in mine.",
      category: "romantic",
      categoryName: "Candlelit Haven",
      location: "Intimate Bistro",
      date: "Candlelit Evening",
      loveNote: "The warm flicker of the candles, the delicate aroma of coffee, and your enchanting face across from me. Tonight is all about you, my love."
    },
    {
      id: "cameo-couple",
      src: "assets/images/real/cameo-couple.jpg",
      title: "You & Me, Always",
      caption: "Two souls, one heart, walking toward our forever.",
      category: "romantic",
      categoryName: "Our Journey",
      location: "Lakeside Stroll",
      date: "Timeless Memory",
      loveNote: "Keep this memory close to your heart, just like the locket. No matter where life takes us, my love for you will remain unwavering and eternal."
    },
    {
      id: "night-skyline-selfie",
      src: "assets/images/real/night-skyline-selfie.jpg",
      title: "Tonight & Forever",
      caption: "Our glowing smiles framed against the Colombo tower lights.",
      category: "starlight",
      categoryName: "City Lights",
      location: "Colombo Starlight",
      date: "Golden Night",
      loveNote: "Even in the darkness of the night, your smile shines brighter than all the city neon. Thank you for making every night an adventure."
    },
    {
      id: "dasithma-couch-greenery",
      src: "assets/images/real/dasithma-couch-greenery.jpg",
      title: "Graceful Elegance",
      caption: "Sitting gracefully amidst the greenery, glowing effortlessly.",
      category: "cozy",
      categoryName: "Her Radiance",
      location: "Garden Lounge",
      date: "Afternoon Glow",
      loveNote: "The way you carry yourself with such quiet poise, natural kindness, and effortless beauty will never stop amazing me."
    },
    {
      id: "dasithma-blossom-chair",
      src: "assets/images/real/dasithma-blossom-chair.jpg",
      title: "Blossom Princess",
      caption: "Framed beneath pink cherry blossoms, looking divine.",
      category: "romantic",
      categoryName: "Her Radiance",
      location: "Cherry Blossom Cafe",
      date: "Spring Afternoon",
      loveNote: "Surrounded by delicate pink blossoms, yet you are the only flower I see. Your sweetness is a breath of fresh air every day."
    },
    {
      id: "dasithma-blossom-calm",
      src: "assets/images/real/dasithma-blossom-calm.jpg",
      title: "Serene & Beautiful",
      caption: "A calm, gentle gaze that brings peace to my restless soul.",
      category: "cozy",
      categoryName: "Gentle Soul",
      location: "Blossom Haven",
      date: "Quiet Serenity",
      loveNote: "Whenever the world feels loud, one look into your calm, gentle eyes restores my serenity. You are my safe harbor, my love."
    },
    {
      id: "dasithma-blossom-glow",
      src: "assets/images/real/dasithma-blossom-glow.jpg",
      title: "Golden Smile",
      caption: "That sweet, shy smile that stole my heart on day one.",
      category: "romantic",
      categoryName: "Her Radiance",
      location: "Pink Blossom Table",
      date: "Sunny Day",
      loveNote: "That tender smile on your lips is my favorite thing to wake up to and my sweetest thought before I sleep."
    },
    {
      id: "dasithma-close-portrait",
      src: "assets/images/real/dasithma-close-portrait.jpg",
      title: "Eyes Full Of Stars",
      caption: "Close up portrait capturing your natural perfection.",
      category: "cozy",
      categoryName: "Her Radiance",
      location: "Intimate Moments",
      date: "Pure Beauty",
      loveNote: "No filters, no pretenses — just your raw, breathtaking beauty. You are stunning inside and out, my love."
    },
    {
      id: "cafe-table-tender",
      src: "assets/images/real/cafe-table-tender.jpg",
      title: "Tender Hands",
      caption: "Intertwined fingers across the wood table, lost in our own universe.",
      category: "cozy",
      categoryName: "Cozy Talks",
      location: "Cafe Corner",
      date: "Coffee Date",
      loveNote: "Holding your soft fingers while we talk about our dreams for the future. I want to hold this hand through every season of life."
    },
    {
      id: "cafe-table-blossom",
      src: "assets/images/real/cafe-table-blossom.jpg",
      title: "Sweet Afternoons",
      caption: "Sipping drinks and smiling under the floral canopy.",
      category: "cozy",
      categoryName: "Cozy Talks",
      location: "Blossom Terrace",
      date: "Sunny Afternoon",
      loveNote: "Every cafe date with you feels like our very first date all over again — filled with butterflies, laughter, and sweet glances."
    },
    {
      id: "night-playful-hug",
      src: "assets/images/real/night-playful-hug.jpg",
      title: "Playful Love",
      caption: "Silly faces, warm hugs, and moments of pure innocence.",
      category: "starlight",
      categoryName: "Sweet Romance",
      location: "Night Walk",
      date: "Playful Nights",
      loveNote: "I love our silly, playful side just as much as our romantic side. With you, I can be 100% myself without fear."
    },
    {
      id: "night-sweet-hug",
      src: "assets/images/real/night-sweet-hug.jpg",
      title: "Safe In My Arms",
      caption: "Resting your chin on my shoulder, fitting together perfectly.",
      category: "starlight",
      categoryName: "Tender Hugs",
      location: "Midnight Sanctuary",
      date: "Warm Night",
      loveNote: "Your chin resting on my shoulder, your breath soft against my collarbone. There is no place in the world where you are safer than in my arms."
    },
    {
      id: "night-driveway-selfie",
      src: "assets/images/real/night-driveway-selfie.jpg",
      title: "Midnight Memories",
      caption: "Spontaneous night photos because we never want our dates to end.",
      category: "starlight",
      categoryName: "Night Whispers",
      location: "Driveway Under The Stars",
      date: "Midnight Memories",
      loveNote: "Those late nights when neither of us wants to say goodbye, so we linger for another hug, another selfie, another sweet kiss."
    },
    {
      id: "celebration-friends-1",
      src: "assets/images/real/celebration-friends-1.jpg",
      title: "Surrounded By Love",
      caption: "Celebrating milestones with the people who matter most.",
      category: "cozy",
      categoryName: "Celebration",
      location: "Celebration Gathering",
      date: "Special Gathering",
      loveNote: "Seeing you happy, celebrating life with our loved ones, makes my heart overflow with pride. You deserve to be celebrated every single day."
    },
    {
      id: "celebration-friends-2",
      src: "assets/images/real/celebration-friends-2.jpg",
      title: "Joyous Moments",
      caption: "Sharing laughter, good vibes, and lasting memories.",
      category: "cozy",
      categoryName: "Celebration",
      location: "Festive Evening",
      date: "Unforgettable Night",
      loveNote: "To many more celebrations, many more laughter-filled nights, and a lifetime of shared dreams. Happy Birthday, my love!"
    },
    {
      id: "ending-together",
      src: "assets/images/real/ending-together.jpg",
      title: "My Favorite View in the World",
      caption: "Sitting across from each other, holding hands and smiling.",
      category: "romantic",
      categoryName: "Forever Love",
      location: "Our Comfort Corner",
      date: "Forever & Always",
      loveNote: "Sitting across the table from you, holding your gentle hand, and watching your smile light up the room will always be my happiest place. Happy Birthday, my love, my entire world."
    }
  ];

  // Sweet gentle harp chime for heart reactions
  function playHeartChime() {
    initAudio();
    if (!audioContext) return;
    const t = audioContext.currentTime;
    [659.25, 830.61, 987.77, 1318.51].forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const g = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      g.gain.setValueAtTime(0.12, t + i * 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.9);
      osc.connect(g);
      g.connect(audioContext.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.95);
    });
  }

  function spawnFloatingHeart(x, y) {
    const heart = document.createElement("div");
    heart.className = "floating-heart-burst";
    heart.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#C5A059"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--dx", `${(Math.random() * 80 - 40)}px`);
    heart.style.setProperty("--rot", `${(Math.random() * 60 - 30)}deg`);
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1400);
  }

  // Setup Scrapbook Drawer & Lightbox Modal
  function setupScrapbookAndLightbox() {
    const photoAlbumBtn = document.getElementById("photo-album-btn");
    const scrapbookDialog = document.getElementById("scrapbook-dialog");
    const scrapbookCloseBtn = document.getElementById("scrapbook-close-btn");
    const scrapbookGrid = document.getElementById("scrapbook-album-grid");
    const filterPills = document.querySelectorAll(".filter-pill");

    const lightboxDialog = document.getElementById("photo-lightbox-dialog");
    const lightboxCloseBtn = document.getElementById("lightbox-close-btn");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxLocation = document.getElementById("lightbox-location");
    const lightboxCategory = document.getElementById("lightbox-category");
    const lightboxNote = document.getElementById("lightbox-note");
    const lightboxPrevBtn = document.getElementById("lightbox-prev-btn");
    const lightboxNextBtn = document.getElementById("lightbox-next-btn");
    const heartReactBtn = document.getElementById("lightbox-heart-btn");
    const heartCountEl = document.getElementById("heart-count");

    let currentLightboxIndex = 0;
    let heartReactionCounts = {};
    MEMORIES.forEach(m => {
      heartReactionCounts[m.id] = Math.floor(Math.random() * 15) + 18;
    });

    const photoCountBadge = document.getElementById("photo-count-badge");
    if (photoCountBadge) {
      photoCountBadge.textContent = MEMORIES.length;
    }

    // Render Scrapbook Grid Items
    function renderScrapbookGrid(category = "all") {
      if (!scrapbookGrid) return;
      scrapbookGrid.innerHTML = "";

      const filtered = category === "all" 
        ? MEMORIES 
        : MEMORIES.filter(m => m.category === category);

      filtered.forEach((item, idx) => {
        const tilt = (idx % 2 === 0 ? -1.8 : 2.2) * (0.8 + (idx % 3) * 0.3);
        const card = document.createElement("div");
        card.className = "scrapbook-card-item";
        card.style.transform = `rotate(${tilt}deg)`;
        card.innerHTML = `
          <div class="polaroid-tape"></div>
          <div class="polaroid-heart-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
          <img src="${item.src}" alt="${item.title}" loading="lazy">
          <h4 class="scrapbook-card-title">${item.title}</h4>
          <p class="scrapbook-card-caption">${item.caption}</p>
          <span class="scrapbook-card-date">${item.date}</span>
        `;
        card.addEventListener("click", () => {
          if (scrapbookDialog && scrapbookDialog.open) {
            scrapbookDialog.close();
          }
          openLightbox(item.id);
        });
        scrapbookGrid.appendChild(card);
      });
    }

    // Filter pill events
    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        renderScrapbookGrid(pill.getAttribute("data-category"));
      });
    });

    // Open & Close Scrapbook Modal
    if (photoAlbumBtn && scrapbookDialog) {
      photoAlbumBtn.addEventListener("click", () => {
        renderScrapbookGrid("all");
        scrapbookDialog.showModal();
      });
    }

    if (scrapbookCloseBtn && scrapbookDialog) {
      scrapbookCloseBtn.addEventListener("click", () => {
        scrapbookDialog.close();
      });
    }

    // Backdrop click on scrapbook dialog
    if (scrapbookDialog) {
      scrapbookDialog.addEventListener("click", (e) => {
        const rect = scrapbookDialog.querySelector(".modal-card").getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          scrapbookDialog.close();
        }
      });
    }

    // Open Lightbox
    function openLightbox(photoIdOrIndex) {
      if (!lightboxDialog) return;

      if (typeof photoIdOrIndex === "string") {
        const found = MEMORIES.findIndex(m => m.id === photoIdOrIndex);
        currentLightboxIndex = found !== -1 ? found : 0;
      } else {
        currentLightboxIndex = photoIdOrIndex;
      }

      updateLightboxContent();
      lightboxDialog.showModal();
    }

    function updateLightboxContent() {
      const memory = MEMORIES[currentLightboxIndex];
      if (!memory) return;

      if (lightboxImg) {
        lightboxImg.src = memory.src;
        lightboxImg.alt = memory.title;
      }
      if (lightboxTitle) lightboxTitle.textContent = memory.title;
      if (lightboxCaption) lightboxCaption.textContent = `“${memory.caption}”`;
      if (lightboxLocation) lightboxLocation.textContent = memory.location;
      if (lightboxCategory) lightboxCategory.textContent = memory.categoryName;
      if (lightboxNote) lightboxNote.textContent = memory.loveNote;
      if (heartCountEl) heartCountEl.textContent = heartReactionCounts[memory.id] || 25;
    }

    function closeLightbox() {
      if (lightboxDialog && lightboxDialog.open) {
        lightboxDialog.close();
      }
    }

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);

    // Backdrop click on lightbox dialog
    if (lightboxDialog) {
      lightboxDialog.addEventListener("click", (e) => {
        const card = lightboxDialog.querySelector(".lightbox-card");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          closeLightbox();
        }
      });
    }

    // Lightbox Prev / Next
    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener("click", () => {
        currentLightboxIndex = (currentLightboxIndex - 1 + MEMORIES.length) % MEMORIES.length;
        updateLightboxContent();
        playPageTurnSound();
      });
    }

    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener("click", () => {
        currentLightboxIndex = (currentLightboxIndex + 1) % MEMORIES.length;
        updateLightboxContent();
        playPageTurnSound();
      });
    }

    // Heart Reaction
    if (heartReactBtn) {
      heartReactBtn.addEventListener("click", (e) => {
        const memory = MEMORIES[currentLightboxIndex];
        if (memory) {
          heartReactionCounts[memory.id] = (heartReactionCounts[memory.id] || 20) + 1;
          if (heartCountEl) heartCountEl.textContent = heartReactionCounts[memory.id];
        }

        playHeartChime();

        const rect = heartReactBtn.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            spawnFloatingHeart(
              rect.left + rect.width / 2 + (Math.random() * 40 - 20),
              rect.top + (Math.random() * 20 - 10)
            );
          }, i * 120);
        }
      });
    }

    // Connect all .clickable-photo elements in the book
    document.querySelectorAll(".clickable-photo").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation(); // Do not trigger book page turn
        const photoId = el.getAttribute("data-photo-id");
        if (photoId) {
          openLightbox(photoId);
        }
      });
    });

    // Keyboard support for Lightbox
    document.addEventListener("keydown", (e) => {
      if (lightboxDialog && lightboxDialog.open) {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowLeft") {
          currentLightboxIndex = (currentLightboxIndex - 1 + MEMORIES.length) % MEMORIES.length;
          updateLightboxContent();
        } else if (e.key === "ArrowRight") {
          currentLightboxIndex = (currentLightboxIndex + 1) % MEMORIES.length;
          updateLightboxContent();
        }
      }
    });
  }

  // ==========================================================================
  // MOBILE-FIRST ENVELOPE OPENING OVERLAY & CYCLING PHOTOS
  // ==========================================================================
  function setupEnvelopeOpening() {
    const stage = document.getElementById("mobile-envelope-stage");
    const sealBtn = document.getElementById("envelope-seal-btn");
    const slides = document.querySelectorAll(".envelope-slide");

    // Cycle photos one by one
    let currentSlide = 0;
    let slideTimer = null;

    if (slides && slides.length > 1) {
      slideTimer = setInterval(() => {
        if (!stage || stage.classList.contains("opened")) {
          clearInterval(slideTimer);
          return;
        }
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
      }, 2000); // Changes one by one every 2 seconds
    }

    if (!stage || !sealBtn) return;

    function openEnvelope() {
      if (slideTimer) clearInterval(slideTimer);
      vibratePhone([40, 60, 90]);
      playWaxSnapSound();
      burstConfetti();
      startBackgroundMusic();
      stage.classList.add("opened");
      setTimeout(() => {
        stage.style.display = "none";
      }, 850);
      showToast("Happy Birthday, my love. Turn pages to explore our story.");
    }

    sealBtn.addEventListener("click", openEnvelope);
  }

  // ==========================================================================
  // LIVE LOVE MILESTONE COUNTER (CHAPTER II)
  // ==========================================================================
  function setupLoveCounter() {
    const daysEl = document.getElementById("counter-days");
    const hoursEl = document.getElementById("counter-hours");
    const minsEl = document.getElementById("counter-mins");
    const secsEl = document.getElementById("counter-secs");
    if (!daysEl) return;

    // Official relationship anniversary date: 14 July 2024
    const startDate = new Date("2024-07-14T00:00:00+05:30");

    function tick() {
      const now = new Date();
      const diff = Math.max(0, now - startDate);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = days;
      hoursEl.textContent = String(hours).padStart(2, "0");
      minsEl.textContent = String(mins).padStart(2, "0");
      secsEl.textContent = String(secs).padStart(2, "0");
    }

    tick();
    setInterval(tick, 1000);
  }

  // ==========================================================================
  // INTERACTIVE MOBILE HEARTBEAT SENSOR (CHAPTER V)
  // ==========================================================================
  function setupHeartbeatSensor() {
    const target = document.getElementById("heartbeat-touch-target");
    const msg = document.getElementById("heartbeat-message");
    if (!target) return;

    let heartbeatTimer = null;

    function startHeartbeat(e) {
      if (e) e.preventDefault();
      target.classList.add("active");
      if (msg) msg.classList.add("visible");
      playHeartbeatThump();
      vibratePhone([60, 80, 60, 500]);

      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        playHeartbeatThump();
        vibratePhone([60, 80, 60, 500]);
        const rect = target.getBoundingClientRect();
        spawnFloatingHeart(
          rect.left + rect.width / 2 + (Math.random() * 40 - 20),
          rect.top + rect.height / 2 + (Math.random() * 30 - 15)
        );
      }, 720);
    }

    function stopHeartbeat() {
      target.classList.remove("active");
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    }

    target.addEventListener("pointerdown", startHeartbeat);
    window.addEventListener("pointerup", stopHeartbeat);
    target.addEventListener("pointercancel", stopHeartbeat);
  }

  // ==========================================================================
  // INTERACTIVE GOLD FOIL SCRATCH CARD (CHAPTER VIII)
  // ==========================================================================
  function setupScratchCard() {
    const canvas = document.getElementById("scratch-canvas");
    const hint = document.getElementById("scratch-hint-text");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    // Draw luxury gold shimmering foil
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#C5A059");
    grad.addColorStop(0.25, "#E8C787");
    grad.addColorStop(0.5, "#FAF1D8");
    grad.addColorStop(0.75, "#C5A059");
    grad.addColorStop(1, "#9E7935");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Add gold sparkles
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    for (let i = 0; i < 45; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Calligraphic instruction on card
    ctx.font = "bold 12px 'Outfit', sans-serif";
    ctx.fillStyle = "#2D141D";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH WITH FINGER TO REVEAL", w / 2, h / 2 - 8);
    ctx.font = "italic 11px 'Playfair Display', Georgia, serif";
    ctx.fillText("A Special Birthday Gift For My Love", w / 2, h / 2 + 15);

    let isScratching = false;
    let scratchedCount = 0;
    let cardUnlocked = false;

    function scratch(e) {
      if (cardUnlocked) return;
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = (clientX - r.left) * (w / r.width);
      const y = (clientY - r.top) * (h / r.height);

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      playScratchSound();
      vibratePhone(10);

      if (Math.random() > 0.65) {
        spawnFloatingHeart(clientX, clientY);
      }

      scratchedCount++;
      if (scratchedCount % 12 === 0) {
        checkCleared();
      }
    }

    function checkCleared() {
      if (cardUnlocked) return;
      const imgData = ctx.getImageData(0, 0, w, h);
      let cleared = 0;
      const total = imgData.data.length / 4;
      for (let i = 3; i < imgData.data.length; i += 16) {
        if (imgData.data[i] === 0) cleared++;
      }
      if (cleared / (total / 4) > 0.42) {
        cardUnlocked = true;
        ctx.clearRect(0, 0, w, h);
        burstConfetti();
        playHeartChime();
        vibratePhone([50, 70, 120]);
        if (hint) {
          hint.innerHTML = "<strong>SURPRISE UNLOCKED</strong> Show this to Sadeepa tonight";
          hint.style.color = "var(--gold-accent)";
        }
        showToast("Golden Pass Unlocked, my love.");
      }
    }

    canvas.addEventListener("mousedown", (e) => { isScratching = true; scratch(e); });
    window.addEventListener("mouseup", () => { isScratching = false; });
    canvas.addEventListener("mousemove", (e) => { if (isScratching) scratch(e); });

    canvas.addEventListener("touchstart", (e) => { isScratching = true; scratch(e); }, { passive: true });
    canvas.addEventListener("touchend", () => { isScratching = false; });
    canvas.addEventListener("touchmove", (e) => { if (isScratching) scratch(e); }, { passive: true });
  }

  // ==========================================================================
  // DOUBLE-TAP ANYWHERE FOR LOVE BURST
  // ==========================================================================
  function setupDoubleTapLove() {
    let lastTap = 0;
    const loveCounterVal = document.getElementById("love-sent-val");
    let count = parseInt(localStorage.getItem("loveSentCount") || "0", 10);
    if (loveCounterVal) loveCounterVal.textContent = count;

    const bookScene = document.querySelector(".book-scene");
    if (!bookScene) return;

    bookScene.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 360) {
        const touch = e.changedTouches[0];
        popLoveHeart(touch.clientX, touch.clientY);
        lastTap = 0;
      } else {
        lastTap = now;
      }
    });

    bookScene.addEventListener("dblclick", (e) => {
      popLoveHeart(e.clientX, e.clientY);
    });

    function popLoveHeart(x, y) {
      count++;
      if (loveCounterVal) loveCounterVal.textContent = count;
      try { localStorage.setItem("loveSentCount", count); } catch (e) {}

      vibratePhone(35);
      playHeartChime();

      const el = document.createElement("div");
      el.className = "double-tap-heart";
      el.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="#C5A059"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 850);

      showToast(`Favorite memory saved. (${count})`);
    }
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(message) {
    let toast = document.getElementById("toast-notification");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast-notification";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("active");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("active");
    }, 3000);
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    initPetalsCanvas();
    setupEnvelopeOpening();
    setupPageByPageEngine();
    setupCandleBlowing();
    setupWhatsAppLoveNote();
    setupScrapbookAndLightbox();
    setupLoveCounter();
    setupHeartbeatSensor();
    setupScratchCard();
    setupDoubleTapLove();

    const audioBtn = document.getElementById("audio-toggle-btn");
    if (audioBtn) {
      audioBtn.addEventListener("click", toggleBackgroundMusic);
    }
  });

})();
