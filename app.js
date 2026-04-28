/* ============================================================
   THE USELESS MACHINE 3000 — Application Logic
   An exercise in futility, perfected.
   ============================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------
     CONFIGURATION
     -------------------------------------------------------- */
  const CONFIG = {
    particles: {
      count: 70,
      connectionDistance: 130,
      mouseInfluence: 100,
    },
    arm: {
      deployDelay: 600,
      deployDuration: 700,
      holdDuration: 300,
      retractDuration: 500,
      // Total arm cycle ≈ 2.1s
    },
    sound: {
      enabled: true,
      volume: 0.15,
    },
    loading: {
      duration: 3200,
      messages: [
        'Booting futility engine...',
        'Calibrating uselessness parameters...',
        'Loading existential frameworks...',
        'Establishing connection to the void...',
        'Optimizing for zero productivity...',
        'Preparing disappointment protocols...',
        'Initializing entropy handlers...',
        'Ready to waste your time.',
      ],
    },
  };

  const STATUS_MESSAGES = [
    'System restored to factory settings.',
    'Order has been maintained.',
    'Your input has been noted and ignored.',
    'The universe remains in balance.',
    'Nothing has changed. As intended.',
    'Existential crisis averted.',
    'Purpose: undefined. Status: optimal.',
    'Your click has been forwarded to /dev/null.',
    'Achievement: Nothing accomplished.',
    'The machine has spoken.',
    'Resistance is futile. Also unnecessary.',
    'Another toggle. Another lesson.',
    'The definition of insanity is...',
    'Have you considered a hobby?',
    'Perfectly balanced, as all things should be.',
    'This is the way.',
    'Error 200: Success at failing.',
    'Task completed: 0 tasks completed.',
    'Processing... just kidding.',
    'Your effort has been carefully discarded.',
    'Thank you for your contribution to nothing.',
    'The void acknowledges your persistence.',
    'Somewhere, a developer weeps.',
    'Congratulations. You played yourself.',
    'Fun fact: you\'ll never get this time back.',
    'The switch is off. The switch was always off.',
    'In a parallel universe, this did something.',
    'Your mouse click was not wasted. Wait. Yes it was.',
  ];

  const ACHIEVEMENTS = [
    { id: 'first-contact', name: 'First Contact', desc: 'Toggle the switch for the first time', count: 1, icon: '👆' },
    { id: 'curious', name: 'Curious', desc: 'Toggle 5 times', count: 5, icon: '🤔' },
    { id: 'persistent', name: 'Persistent', desc: 'Toggle 10 times', count: 10, icon: '💪' },
    { id: 'dedicated', name: 'Dedicated', desc: 'Toggle 25 times', count: 25, icon: '🎯' },
    { id: 'questioning', name: 'Questioning Choices', desc: 'Toggle 50 times', count: 50, icon: '😰' },
    { id: 'committed', name: 'Fully Committed', desc: 'Toggle 100 times', count: 100, icon: '🏆' },
    { id: 'obsessed', name: 'Obsessed', desc: 'Toggle 250 times', count: 250, icon: '😵' },
    { id: 'why', name: '...Why?', desc: 'Toggle 500 times', count: 500, icon: '🕳️' },
    { id: 'seek-help', name: 'Please Seek Help', desc: 'Toggle 1000 times', count: 1000, icon: '🆘' },
  ];

  /* --------------------------------------------------------
     DOM REFERENCES
     -------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const dom = {
    canvas: $('#particleCanvas'),
    loadingScreen: $('#loadingScreen'),
    loadingBar: $('#loadingBar'),
    loadingMessage: $('#loadingMessage'),
    app: $('#app'),
    deviceCard: $('#deviceCard'),
    toggleTrack: $('#toggleTrack'),
    toggleKnob: $('#toggleKnob'),
    armContainer: $('#armContainer'),
    statusDot: $('#statusDot'),
    statusText: $('#statusText'),
    burstContainer: $('#burstContainer'),
    toastContainer: $('#toastContainer'),
    timeWasted: $('#timeWasted'),
    totalToggles: $('#totalToggles'),
    toggleRate: $('#toggleRate'),
    productivity: $('#productivity'),
    purposeFound: $('#purposeFound'),
    enlightenmentFill: $('#enlightenmentFill'),
    shareBtn: $('#shareBtn'),
  };

  /* --------------------------------------------------------
     STATE
     -------------------------------------------------------- */
  const state = {
    isAnimating: false,
    isToggleOn: false,
    toggleCount: 0,
    startTime: Date.now(),
    unlockedAchievements: new Set(),
    statusIndex: 0,
    mouseX: 0,
    mouseY: 0,
  };

  // Load persisted state from localStorage
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('useless-machine-state'));
      if (saved) {
        state.toggleCount = saved.toggleCount || 0;
        state.startTime = saved.startTime || Date.now();
        state.unlockedAchievements = new Set(saved.unlockedAchievements || []);
      }
    } catch { /* ignored */ }
  }

  function saveState() {
    try {
      localStorage.setItem('useless-machine-state', JSON.stringify({
        toggleCount: state.toggleCount,
        startTime: state.startTime,
        unlockedAchievements: [...state.unlockedAchievements],
      }));
    } catch { /* ignored */ }
  }

  /* --------------------------------------------------------
     SOUND ENGINE (Web Audio API)
     -------------------------------------------------------- */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = CONFIG.sound.enabled;
    }

    init() {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.enabled = false;
      }
    }

    ensureContext() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, duration, type = 'sine', volume = CONFIG.sound.volume) {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }

    clickOn() {
      this.ensureContext();
      this.playTone(880, 0.08, 'sine', 0.1);
      setTimeout(() => this.playTone(1320, 0.06, 'sine', 0.08), 40);
    }

    clickOff() {
      this.ensureContext();
      this.playTone(440, 0.1, 'sine', 0.1);
      setTimeout(() => this.playTone(330, 0.08, 'sine', 0.06), 50);
    }

    armDeploy() {
      this.ensureContext();
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTone(150 + i * 30, 0.15, 'sawtooth', 0.02);
        }, i * 80);
      }
    }

    armRetract() {
      this.ensureContext();
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.playTone(300 - i * 30, 0.12, 'sawtooth', 0.015);
        }, i * 70);
      }
    }

    achievement() {
      this.ensureContext();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.08), i * 100);
      });
    }
  }

  const sound = new SoundEngine();

  /* --------------------------------------------------------
     PARTICLE SYSTEM (Canvas)
     -------------------------------------------------------- */
  class ParticleSystem {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.burstParticles = [];
      this.resize();
      this.createParticles();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      this.particles = [];
      for (let i = 0; i < CONFIG.particles.count; i++) {
        this.particles.push(this.createParticle());
      }
    }

    createParticle() {
      const isCyan = Math.random() > 0.6;
      return {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
        baseOpacity: Math.random() * 0.4 + 0.1,
        color: isCyan ? '6, 182, 212' : '124, 58, 237',
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    }

    addBurst(x, y, count = 20) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = Math.random() * 3 + 1;
        this.burstParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          opacity: 1,
          color: Math.random() > 0.5 ? '124, 58, 237' : '167, 139, 250',
          life: 1,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    }

    update(time) {
      // Background particles
      for (const p of this.particles) {
        p.x += p.speedX;
        p.y += p.speedY;

        // Mouse influence
        const dx = state.mouseX - p.x;
        const dy = state.mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.particles.mouseInfluence) {
          const force = (CONFIG.particles.mouseInfluence - dist) / CONFIG.particles.mouseInfluence;
          p.x -= dx * force * 0.01;
          p.y -= dy * force * 0.01;
        }

        // Wrap around edges
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Pulse opacity
        p.opacity = p.baseOpacity + Math.sin(time * p.pulseSpeed + p.pulsePhase) * 0.1;
      }

      // Burst particles
      for (let i = this.burstParticles.length - 1; i >= 0; i--) {
        const bp = this.burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vy += 0.05; // gravity
        bp.life -= bp.decay;
        bp.opacity = bp.life;
        if (bp.life <= 0) {
          this.burstParticles.splice(i, 1);
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw connections
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.particles.connectionDistance) {
            const alpha = 0.06 * (1 - dist / CONFIG.particles.connectionDistance);
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }

      // Draw background particles
      for (const p of this.particles) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        this.ctx.fill();
      }

      // Draw burst particles
      for (const bp of this.burstParticles) {
        this.ctx.beginPath();
        this.ctx.arc(bp.x, bp.y, bp.size * bp.life, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${bp.color}, ${bp.opacity})`;
        this.ctx.fill();
      }
    }

    animate(time) {
      this.update(time);
      this.draw();
      requestAnimationFrame((t) => this.animate(t));
    }

    start() {
      requestAnimationFrame((t) => this.animate(t));
    }
  }

  /* --------------------------------------------------------
     LOADING SCREEN
     -------------------------------------------------------- */
  function runLoadingSequence() {
    return new Promise((resolve) => {
      const messages = CONFIG.loading.messages;
      const totalDuration = CONFIG.loading.duration;
      const interval = totalDuration / messages.length;

      let progress = 0;
      const progressStep = 100 / messages.length;

      messages.forEach((msg, i) => {
        setTimeout(() => {
          dom.loadingMessage.style.opacity = '0';
          setTimeout(() => {
            dom.loadingMessage.textContent = msg;
            dom.loadingMessage.style.opacity = '1';
          }, 100);
          progress = Math.min(100, (i + 1) * progressStep);
          dom.loadingBar.style.width = progress + '%';
        }, i * interval);
      });

      setTimeout(() => {
        dom.loadingScreen.classList.add('fade-out');
        dom.app.classList.remove('hidden');
        setTimeout(() => {
          dom.loadingScreen.style.display = 'none';
          resolve();
        }, 800);
      }, totalDuration + 300);
    });
  }

  /* --------------------------------------------------------
     STATUS MESSAGES
     -------------------------------------------------------- */
  function getNextStatus() {
    const msg = STATUS_MESSAGES[state.statusIndex % STATUS_MESSAGES.length];
    state.statusIndex++;
    return msg;
  }

  function setStatus(text, dotClass = 'idle') {
    dom.statusDot.className = 'status-dot ' + dotClass;
    dom.statusText.textContent = text;
  }

  /* --------------------------------------------------------
     BURST PARTICLES (CSS-based, on device card)
     -------------------------------------------------------- */
  function createCSSBurst(originX, originY) {
    const colors = ['#7c3aed', '#a78bfa', '#06b6d4', '#c4b5fd', '#818cf8'];
    for (let i = 0; i < 16; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      const angle = (Math.PI * 2 * i) / 16;
      const distance = 40 + Math.random() * 80;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      particle.style.cssText = `
        left: ${originX}px;
        top: ${originY}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        --tx: ${tx}px;
        --ty: ${ty}px;
        box-shadow: 0 0 6px currentColor;
      `;
      dom.burstContainer.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  }

  /* --------------------------------------------------------
     SCREEN FLASH
     -------------------------------------------------------- */
  function screenFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
  }

  /* --------------------------------------------------------
     ARM ANIMATION
     -------------------------------------------------------- */
  async function deployArm() {
    const arm = dom.armContainer;
    const cfg = CONFIG.arm;

    // Phase 1: Deploy arm
    sound.armDeploy();
    arm.style.transition = `opacity 0.2s ease, transform ${cfg.deployDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
    arm.style.opacity = '1';
    arm.style.transform = 'translateX(-50%) translateY(105px)';
    arm.classList.add('deploying');

    await wait(cfg.deployDuration + cfg.holdDuration);

    // Phase 2: Push toggle off
    arm.classList.remove('deploying');
    arm.classList.add('deployed');
    sound.clickOff();
    toggleOff();
    dom.deviceCard.classList.add('shake');
    screenFlash();

    // Get toggle position for burst
    const toggleRect = dom.toggleTrack.getBoundingClientRect();
    const cardRect = dom.deviceCard.querySelector('.device-inner').getBoundingClientRect();
    const burstX = toggleRect.left - cardRect.left + toggleRect.width / 2;
    const burstY = toggleRect.top - cardRect.top + toggleRect.height / 2;
    createCSSBurst(burstX, burstY);

    await wait(200);
    dom.deviceCard.classList.remove('shake');

    await wait(300);

    // Phase 3: Retract arm
    sound.armRetract();
    arm.style.transition = `opacity 0.3s ease ${cfg.retractDuration * 0.6}ms, transform ${cfg.retractDuration}ms cubic-bezier(0.6, 0, 0.4, 1)`;
    arm.style.transform = 'translateX(-50%) translateY(-10px)';
    arm.style.opacity = '0';
    arm.classList.remove('deployed');

    await wait(cfg.retractDuration + 100);

    // Reset arm
    arm.style.transition = 'none';
    arm.style.transform = 'translateX(-50%) translateY(-10px)';
    arm.style.opacity = '0';

    // Update status
    setStatus(getNextStatus(), 'idle');
  }

  /* --------------------------------------------------------
     TOGGLE LOGIC
     -------------------------------------------------------- */
  function toggleOn() {
    state.isToggleOn = true;
    dom.toggleTrack.classList.add('active');
    dom.toggleTrack.setAttribute('aria-checked', 'true');
    dom.deviceCard.classList.add('active');
    document.querySelector('.label-off').classList.remove('highlight');
    document.querySelector('.label-on').classList.add('highlight');
  }

  function toggleOff() {
    state.isToggleOn = false;
    dom.toggleTrack.classList.remove('active');
    dom.toggleTrack.setAttribute('aria-checked', 'false');
    dom.deviceCard.classList.remove('active');
    document.querySelector('.label-on').classList.remove('highlight');
    document.querySelector('.label-off').classList.add('highlight');
    setTimeout(() => {
      document.querySelector('.label-off').classList.remove('highlight');
    }, 1000);
  }

  async function handleToggle() {
    if (state.isAnimating) return;
    state.isAnimating = true;

    // Ensure audio context is initialized on user gesture
    sound.ensureContext();

    // Toggle ON
    sound.clickOn();
    toggleOn();
    setStatus('PROCESSING...', 'processing');

    // Add canvas burst at toggle position
    const toggleRect = dom.toggleTrack.getBoundingClientRect();
    particleSystem.addBurst(
      toggleRect.left + toggleRect.width * 0.75,
      toggleRect.top + toggleRect.height / 2,
      15
    );

    // Wait, then deploy arm
    await wait(CONFIG.arm.deployDelay);

    setStatus('CORRECTING...', 'active');
    await deployArm();

    // Increment stats
    state.toggleCount++;
    updateStats();
    checkAchievements();
    saveState();

    // Update page title
    document.title = `The Useless Machine 3000 | ${state.toggleCount} accomplishment${state.toggleCount !== 1 ? 's' : ''}`;

    state.isAnimating = false;
  }

  /* --------------------------------------------------------
     STATS
     -------------------------------------------------------- */
  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateStats() {
    const elapsed = Date.now() - state.startTime;

    dom.timeWasted.textContent = formatTime(elapsed);
    dom.totalToggles.textContent = state.toggleCount.toLocaleString();

    const minutes = elapsed / 60000;
    const rate = minutes > 0 ? (state.toggleCount / minutes).toFixed(2) : '0.00';
    dom.toggleRate.innerHTML = `${rate}<span class="stat-unit">/min</span>`;

    dom.productivity.textContent = '0%'; // Always 0, that's the joke

    // Purpose cycles through increasing levels of despair
    const purposes = ['None', 'None', 'Still none', 'Nope', 'Absolutely not', '404', '???', 'lol', '💀'];
    const idx = Math.min(Math.floor(state.toggleCount / 15), purposes.length - 1);
    dom.purposeFound.textContent = purposes[idx];

    // Enlightenment bar — approaches but never reaches 100%
    const enlightenment = Math.min(99, Math.floor((state.toggleCount / (state.toggleCount + 50)) * 100));
    dom.enlightenmentFill.style.width = enlightenment + '%';
  }

  // Run the timer update every second
  function startStatsTimer() {
    setInterval(() => {
      const elapsed = Date.now() - state.startTime;
      dom.timeWasted.textContent = formatTime(elapsed);
    }, 1000);
  }

  /* --------------------------------------------------------
     ACHIEVEMENTS
     -------------------------------------------------------- */
  function checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
      if (state.toggleCount >= ach.count && !state.unlockedAchievements.has(ach.id)) {
        state.unlockedAchievements.add(ach.id);
        showAchievementToast(ach);
        sound.achievement();
      }
    }
  }

  function showAchievementToast(achievement) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${achievement.icon}</div>
      <div class="toast-content">
        <div class="toast-title">${achievement.name}</div>
        <div class="toast-desc">${achievement.desc}</div>
      </div>
    `;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  /* --------------------------------------------------------
     SHARE BUTTON
     -------------------------------------------------------- */
  function handleShare() {
    const elapsed = Date.now() - state.startTime;
    const text = `🔘 I've toggled The Useless Machine 3000 exactly ${state.toggleCount} time${state.toggleCount !== 1 ? 's' : ''}, wasting ${formatTime(elapsed)} of my life and accomplishing absolutely nothing.\n\nProductivity impact: 0%\nPurpose found: None\n\n#UselessMachine3000`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        dom.shareBtn.classList.add('copied');
        dom.shareBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied to clipboard!
        `;
        setTimeout(() => {
          dom.shareBtn.classList.remove('copied');
          dom.shareBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share Futility Score
          `;
        }, 2000);
      });
    }
  }

  /* --------------------------------------------------------
     UTILITIES
     -------------------------------------------------------- */
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /* --------------------------------------------------------
     EVENT LISTENERS
     -------------------------------------------------------- */
  function setupEvents() {
    // Toggle click
    dom.toggleTrack.addEventListener('click', (e) => {
      if (dom.toggleTrack.classList.contains('disabled')) return;
      handleToggle();
    });

    // Keyboard support for toggle
    dom.toggleTrack.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!dom.toggleTrack.classList.contains('disabled')) {
          handleToggle();
        }
      }
    });

    // Disable toggle during animation
    const observer = new MutationObserver(() => {
      if (state.isAnimating) {
        dom.toggleTrack.classList.add('disabled');
      } else {
        dom.toggleTrack.classList.remove('disabled');
      }
    });

    // Track mouse for particle influence
    document.addEventListener('mousemove', (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
    });

    // Share button
    dom.shareBtn.addEventListener('click', handleShare);
  }

  /* --------------------------------------------------------
     NEW USELESS FEATURES
     -------------------------------------------------------- */
  function setupUselessFeatures() {
    // Cookie Banner
    const cookieBtns = document.querySelectorAll('.cookie-btn');
    const cookieBanner = document.getElementById('cookieBanner');
    cookieBtns.forEach(btn => btn.addEventListener('click', () => {
      cookieBanner.style.display = 'none';
      // It comes back
      setTimeout(() => {
        cookieBanner.style.display = 'flex';
      }, Math.random() * 20000 + 10000);
    }));

    // Fake Mode Toggle
    const fakeMode = document.getElementById('fakeMode');
    fakeMode.addEventListener('click', () => {
      document.body.style.opacity = '0';
      setTimeout(() => { document.body.style.opacity = '1'; }, 150);
    });

    // Theme Switcher
    const themeSelect = document.getElementById('themeSelect');
    themeSelect.addEventListener('change', () => {
      // Just shake the screen
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 400);
    });

    // Volume Slider
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    volumeSlider.addEventListener('input', (e) => {
      volumeValue.textContent = e.target.value + '%';
    });
    volumeSlider.addEventListener('change', (e) => {
      // Revert to 73
      setTimeout(() => {
        volumeSlider.value = 73;
        volumeValue.textContent = '73%';
      }, 500);
    });

    // System Monitor
    const cpuFill = document.getElementById('cpuFill');
    const cpuPercent = document.getElementById('cpuPercent');
    const ramFill = document.getElementById('ramFill');
    const ramPercent = document.getElementById('ramPercent');
    const diskFill = document.getElementById('diskFill');
    const diskPercent = document.getElementById('diskPercent');
    const soulFill = document.getElementById('soulFill');
    const soulPercent = document.getElementById('soulPercent');
    setInterval(() => {
      const c = Math.floor(Math.random() * 100);
      const r = Math.floor(Math.random() * 100);
      const d = Math.floor(Math.random() * 100);
      const s = 0; // Soul is always 0
      cpuFill.style.width = c + '%'; cpuPercent.textContent = c + '%';
      ramFill.style.width = r + '%'; ramPercent.textContent = r + '%';
      diskFill.style.width = d + '%'; diskPercent.textContent = d + '%';
      soulFill.style.width = s + '%'; soulPercent.textContent = s + '%';
    }, 1500);

    // Progress Bar
    const statuses = ["Downloading more RAM...", "Reticulating splines...", "Deleting System32...", "Optimizing the void...", "Loading nothing..."];
    const nowhereStatus = document.getElementById('nowhereStatus');
    setInterval(() => {
      nowhereStatus.textContent = statuses[Math.floor(Math.random() * statuses.length)];
    }, 4000);

    // Newsletter
    const newsletterBtn = document.getElementById('newsletterBtn');
    const subscriberCount = document.getElementById('subscriberCount');
    let subs = 2847291;
    newsletterBtn.addEventListener('click', () => {
      subs++;
      subscriberCount.textContent = subs.toLocaleString();
      document.getElementById('newsletterInput').value = '';
    });

    // TOS
    const tosPanel = document.querySelector('.tos-panel');
    document.getElementById('tosAgree').addEventListener('click', () => tosPanel.style.opacity = '0.5');
    document.getElementById('tosDisagree').addEventListener('click', () => tosPanel.style.opacity = '0.5');

    // Password Strength
    const passwordInput = document.getElementById('passwordInput');
    const passwordMeterFill = document.getElementById('passwordMeterFill');
    const passwordVerdict = document.getElementById('passwordVerdict');
    const verdicts = ["Weak", "Still weak", "Pathetic", "Try harder", "Terrible", "Just awful"];
    passwordInput.addEventListener('input', () => {
      passwordMeterFill.style.width = Math.random() * 30 + '%';
      passwordVerdict.textContent = verdicts[Math.floor(Math.random() * verdicts.length)];
    });

    // Poll
    const pollOptions = document.querySelectorAll('.poll-option');
    pollOptions.forEach(opt => opt.addEventListener('click', () => {
      opt.style.background = 'var(--accent-violet)';
      setTimeout(() => { opt.style.background = 'var(--surface)'; }, 300);
    }));

    // Download
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadBar = document.getElementById('downloadBar');
    const downloadStatus = document.getElementById('downloadStatus');
    downloadBtn.addEventListener('click', () => {
      downloadBtn.disabled = true;
      downloadStatus.textContent = 'Downloading...';
      let progress = 0;
      const int = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 99) {
          progress = 99.9;
          clearInterval(int);
          downloadStatus.textContent = 'Stuck at 99.9% (Forever)';
        }
        downloadBar.style.width = progress + '%';
      }, 200);
    });

    // Chatbot
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');

    chatbotToggle.addEventListener('click', () => chatbotWindow.classList.add('active'));
    chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('active'));

    const botReplies = [
      "I literally cannot help you.",
      "Have you tried turning it off and on again?",
      "That sounds like a you problem.",
      "Error 404: Care not found.",
      "I am just a bunch of if-statements."
    ];

    chatbotSend.addEventListener('click', sendMsg);
    chatbotInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') sendMsg(); });

    function sendMsg() {
      const val = chatbotInput.value.trim();
      if(!val) return;
      
      const uMsg = document.createElement('div');
      uMsg.className = 'chat-msg user';
      uMsg.innerHTML = `<p>${val}</p>`;
      chatbotMessages.appendChild(uMsg);
      chatbotInput.value = '';
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

      setTimeout(() => {
        const bMsg = document.createElement('div');
        bMsg.className = 'chat-msg bot';
        bMsg.innerHTML = `<p>${botReplies[Math.floor(Math.random() * botReplies.length)]}</p>`;
        chatbotMessages.appendChild(bMsg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }, 500 + Math.random() * 1000);
    }

    // Notifications
    const notifBell = document.getElementById('notifBell');
    const notifPanel = document.getElementById('notifPanel');
    const notifClear = document.getElementById('notifClear');
    const notifBadge = document.getElementById('notifBadge');
    
    notifBell.addEventListener('click', () => {
      notifPanel.classList.toggle('active');
    });
    notifClear.addEventListener('click', () => {
      document.getElementById('notifList').innerHTML = '';
      notifBadge.textContent = '0';
    });

    // Visitor counter
    setInterval(() => {
      document.getElementById('visitorCount').textContent = Math.floor(Math.random() * 1000000).toLocaleString();
    }, 5000);

    // Cursor Trail
    document.addEventListener('mousemove', (e) => {
      if (Math.random() > 0.8) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        document.getElementById('cursorTrail').appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
      }
    });

    // Fake Ad
    const fakeAd = document.getElementById('fakeAd');
    setTimeout(() => fakeAd.classList.add('active'), 5000);
    document.getElementById('fakeAdClose').addEventListener('click', () => {
      fakeAd.classList.remove('active');
      setTimeout(() => fakeAd.classList.add('active'), Math.random() * 15000 + 5000);
    });

    // Update Popup
    const updatePopup = document.getElementById('updatePopup');
    setTimeout(() => updatePopup.classList.add('active'), 12000);
    document.getElementById('updateBtn').addEventListener('mouseover', (e) => {
      // Moves away when hovered
      const x = Math.random() * (window.innerWidth - 300);
      const y = Math.random() * (window.innerHeight - 200);
      updatePopup.style.left = x + 'px';
      updatePopup.style.top = y + 'px';
      updatePopup.style.transform = 'scale(1)';
    });

    // Impossible Captcha
    const captchaImgs = document.querySelectorAll('.captcha-img');
    const captchaVerify = document.getElementById('captchaVerify');
    const captchaError = document.getElementById('captchaError');
    captchaImgs.forEach(img => {
      img.addEventListener('click', () => img.classList.toggle('selected'));
    });
    captchaVerify.addEventListener('click', () => {
      captchaError.textContent = 'Incorrect. Try again.';
      setTimeout(() => { captchaError.textContent = ''; }, 2000);
    });

    // Do Not Click
    const donotContainer = document.getElementById('donotContainer');
    document.getElementById('donotBtn').addEventListener('click', function spawnBtn() {
      const newBtn = document.createElement('button');
      newBtn.className = 'donot-btn';
      newBtn.textContent = 'DO NOT CLICK';
      newBtn.addEventListener('click', spawnBtn);
      donotContainer.appendChild(newBtn);
    });

    // Fake Error Logs
    const logsWindow = document.getElementById('logsWindow');
    const logMessages = [
      "[WARN] Entropy levels critical",
      "[INFO] Doing nothing successfully",
      "[ERR] Failed to find purpose at line 42",
      "[SYS] Re-calibrating futility drive",
      "[INFO] Ignored user input",
      "[WARN] Memory leak detected in soul component",
      "[ERR] NullPointerException: MeaningOfLife is null",
      "[DEBUG] Yes, it's supposed to do that",
      "[INFO] Spawning child process to do nothing"
    ];
    setInterval(() => {
      const line = document.createElement('div');
      line.className = 'log-line';
      const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
      line.textContent = `${timestamp} ${logMessages[Math.floor(Math.random() * logMessages.length)]}`;
      logsWindow.appendChild(line);
      if (logsWindow.children.length > 20) {
        logsWindow.removeChild(logsWindow.firstChild);
      }
    }, 800);
  }

  /* --------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------- */
  let particleSystem;

  async function init() {
    // Load saved state
    loadState();

    // Initialize particle system
    particleSystem = new ParticleSystem(dom.canvas);
    particleSystem.start();

    // Set initial stats display
    updateStats();

    // Set initial status
    document.querySelector('.label-off').classList.add('highlight');
    setTimeout(() => {
      document.querySelector('.label-off').classList.remove('highlight');
    }, 2000);

    // Setup new useless UI features
    setupUselessFeatures();

    // Run loading sequence
    await runLoadingSequence();

    // Initialize sound on first interaction
    sound.init();

    // Setup event listeners
    setupEvents();

    // Start stats timer
    startStatsTimer();

    // Set initial arm position
    dom.armContainer.style.transform = 'translateX(-50%) translateY(-10px)';
    dom.armContainer.style.opacity = '0';

    console.log(
      '%c🔘 THE USELESS MACHINE 3000 %cv3000.0.0\n%cAn exercise in futility, perfected.',
      'font-size: 16px; font-weight: bold; color: #a78bfa;',
      'font-size: 12px; color: #64748b;',
      'font-size: 11px; color: #94a3b8; font-style: italic;'
    );
  }

  // Kick off everything on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
