/**
 * viaSocket Assistant — Launch Website Motion & Interaction Controller
 * - Intro Curtain Morph: Full-green viewport morphs into circular SOCKET mascot
 * - Autonomous Companion: Roams, tracks scroll, assists with mood reactions & thoughts
 * - Motion Graphics Canvas: Connected workflow nodes with animated data packet flows
 * - Draggable & Voice-Simulation Mascot
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Interactive Feature Showcase Tabs
  // =========================================================================
  const tabs = document.querySelectorAll('.showcase-tab');
  const panels = {
    plan: document.getElementById('panel-plan'),
    subfunctions: document.getElementById('panel-subfunctions'),
    inputs: document.getElementById('panel-inputs'),
    copypaste: document.getElementById('panel-copypaste'),
  };

  function switchTab(tabKey) {
    tabs.forEach((t) => {
      const match = t.getAttribute('data-tab') === tabKey;
      t.classList.toggle('active', match);
      t.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    Object.entries(panels).forEach(([key, panel]) => {
      if (panel) {
        panel.classList.toggle('active', key === tabKey);
      }
    });

    // Notify companion of tab context
    if (tabKey === 'subfunctions') {
      companionController?.setMode('working', 'Native subfunctions: form builder wired into JavaScript code!');
    } else if (tabKey === 'inputs') {
      companionController?.setMode('thinking', 'Reading live data outputs from previous step test runs...');
    } else if (tabKey === 'copypaste') {
      companionController?.setMode('celebrate', 'Step duplicated with all connections and auth intact!');
    } else {
      companionController?.setMode('thinking', 'Step-by-step checklist: planning triggers, actions, and tests.');
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabKey = tab.getAttribute('data-tab');
      if (tabKey) switchTab(tabKey);
    });

    tab.addEventListener('keydown', (e) => {
      const tabList = Array.from(tabs);
      const index = tabList.indexOf(tab);
      let nextIndex = null;

      if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabList.length;
      else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabList.length) % tabList.length;

      if (nextIndex !== null) {
        e.preventDefault();
        tabList[nextIndex].focus();
        tabList[nextIndex].click();
      }
    });
  });

  // Smooth scroll offset adjustments for sticky header & mobile menu close
  const siteHeader = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');

  navToggle?.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        siteHeader?.classList.remove('nav-open');
        navToggle?.setAttribute('aria-expanded', 'false');

        const headerHeight = siteHeader?.offsetHeight || 64;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth',
        });
      }
    });
  });

  // =========================================================================
  // 2. Full-Page Green Intro Curtain Morph Animation
  // =========================================================================
  const curtain = document.getElementById('intro-curtain');
  const startBtn = document.getElementById('intro-start-btn');
  const replayBtn = document.getElementById('btn-replay-intro');
  const companionEl = document.getElementById('socket-companion');

  let hasMorphed = false;

  function runIntroMorph() {
    if (hasMorphed || !curtain || !companionEl) return;
    hasMorphed = true;

    // Get current companion center coordinates in viewport
    const compRect = companionEl.getBoundingClientRect();
    const targetX = compRect.left + compRect.width / 2;
    const targetY = compRect.top + compRect.height / 2;

    curtain.style.setProperty('--target-x', `${targetX}px`);
    curtain.style.setProperty('--target-y', `${targetY}px`);

    curtain.classList.add('morphing');

    setTimeout(() => {
      curtain.classList.add('morphed');
      companionController?.setMode('idle', "SOCKET active. Scroll through or click to test a voice command.");
    }, 950);
  }

  // Auto-morph on first scroll or button click
  startBtn?.addEventListener('click', () => {
    runIntroMorph();
    const heroTarget = document.getElementById('hero');
    if (heroTarget) {
      const headerH = document.querySelector('.site-header')?.offsetHeight || 70;
      window.scrollTo({
        top: heroTarget.offsetTop - headerH,
        behavior: 'smooth',
      });
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      if (!hasMorphed && window.scrollY > 25) {
        runIntroMorph();
      }
    },
    { passive: true },
  );

  const replayBtnMobile = document.getElementById('btn-replay-intro-mobile');

  function handleReplay() {
    siteHeader?.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (curtain) {
      curtain.classList.remove('morphed', 'morphing');
      hasMorphed = false;
    }
  }

  replayBtn?.addEventListener('click', handleReplay);
  replayBtnMobile?.addEventListener('click', handleReplay);

  // =========================================================================
  // 3. Autonomous Mascot Companion Controller (Physics, Expressions, Drag)
  // =========================================================================
  class CompanionController {
    constructor(el) {
      this.el = el;
      this.bubble = el.querySelector('#socket-bubble');
      this.thoughtEl = el.querySelector('#socket-thought');
      this.thoughtText = el.querySelector('#socket-thought-text');
      this.statusText = el.querySelector('#socket-status');
      this.closeBtn = el.querySelector('#thought-close-btn');
      this.eyes = el.querySelectorAll('.socket-eye');

      // State
      this.mode = 'idle';
      this.isPinned = false;
      this.isDragging = false;
      this.isSimulatingVoice = false;

      // Position (Viewport Coordinates)
      const isMobile = window.innerWidth < 768;
      this.x = isMobile ? window.innerWidth - 60 : window.innerWidth - 84;
      this.y = isMobile ? window.innerHeight - 72 : window.innerHeight - 96;
      this.tx = this.x;
      this.ty = this.y;

      // Drag offsets & pointer tracking
      this.dragOffset = { x: 0, y: 0 };
      this.pointerStartPos = { x: 0, y: 0 };
      this.hasPointerMoved = false;

      // Typing animation
      this.typingTimer = null;

      this.initEvents();
      this.startLoop();
    }

    setMode(mode, thought, force = false) {
      if (this.isSimulatingVoice && !force) return;
      this.mode = mode;

      // Update class
      this.el.className = `socket-companion mode-${mode}${this.isDragging ? ' is-dragging' : ''}${this.isSimulatingVoice ? ' simulating-voice' : ''}`;

      // Update status tag
      if (this.statusText) {
        this.statusText.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      }

      // Update thought bubble with typewriter effect
      if (thought && this.thoughtText) {
        clearTimeout(this.typingTimer);
        this.thoughtText.textContent = thought;
        this.thoughtText.style.opacity = '0';
        setTimeout(() => {
          this.thoughtText.style.opacity = '1';
        }, 50);

        // On mobile, if previously dismissed, unhide when state changes
        if (this.thoughtEl && this.thoughtEl.classList.contains('is-hidden')) {
          this.thoughtEl.classList.remove('is-hidden');
        }
      }

      // If sleeping, set eyes to slit
      this.eyes.forEach((eye) => {
        if (mode === 'sleeping') {
          eye.style.height = '2px';
        } else if (mode === 'celebrate') {
          eye.style.height = '12px';
        } else {
          eye.style.height = '11px';
        }
      });
    }

    setTargetPosition(x, y) {
      if (this.isPinned || this.isDragging) return;
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // On mobile, anchor at bottom-right corner to prevent covering page content
        this.tx = window.innerWidth - 60;
        this.ty = window.innerHeight - 72;
        return;
      }
      const pad = 24;
      this.tx = Math.max(pad, Math.min(window.innerWidth - 76, x));
      this.ty = Math.max(pad + 70, Math.min(window.innerHeight - 76, y));
    }

    initEvents() {
      // Close/dismiss thought bubble button
      this.closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.thoughtEl?.classList.add('is-hidden');
      });

      // Window resize handler to maintain mobile bounds
      window.addEventListener(
        'resize',
        () => {
          if (window.innerWidth < 768) {
            this.tx = window.innerWidth - 60;
            this.ty = window.innerHeight - 72;
          }
        },
        { passive: true },
      );

      // 1. Mouse Eye Tracking
      window.addEventListener(
        'mousemove',
        (e) => {
          if (this.mode === 'sleeping') return;
          const rect = this.bubble.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);

          const maxShift = 2.5;
          const angle = Math.atan2(dy, dx);
          const shiftX = Math.cos(angle) * Math.min(maxShift, dist / 25);
          const shiftY = Math.sin(angle) * Math.min(maxShift, dist / 25);

          this.eyes.forEach((eye) => {
            eye.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
          });
        },
        { passive: true },
      );

      // 2. Drag & Drop Mascot (pointer events with tap vs drag discrimination)
      this.bubble.addEventListener('pointerdown', (e) => {
        this.pointerStartPos = { x: e.clientX, y: e.clientY };
        this.hasPointerMoved = false;
        this.isDragging = false;
        this.dragOffset.x = e.clientX - this.x;
        this.dragOffset.y = e.clientY - this.y;
        this.bubble.setPointerCapture(e.pointerId);
      });

      this.bubble.addEventListener('pointermove', (e) => {
        const dx = Math.abs(e.clientX - this.pointerStartPos.x);
        const dy = Math.abs(e.clientY - this.pointerStartPos.y);
        if (dx > 5 || dy > 5) {
          this.hasPointerMoved = true;
          this.isDragging = true;
          this.isPinned = true;
          this.el.classList.add('is-dragging');
          this.x = e.clientX - this.dragOffset.x;
          this.y = e.clientY - this.dragOffset.y;
          this.tx = this.x;
          this.ty = this.y;
        }
      });

      const stopDrag = (e) => {
        if (this.isDragging) {
          this.isDragging = false;
          this.el.classList.remove('is-dragging');
        }
        try {
          this.bubble.releasePointerCapture(e.pointerId);
        } catch {}
      };
      this.bubble.addEventListener('pointerup', stopDrag);
      this.bubble.addEventListener('pointercancel', stopDrag);

      // 3. Double-click to unpin & resume auto-assist
      this.bubble.addEventListener('dblclick', () => {
        this.isPinned = false;
        this.setMode('celebrate', 'Released. Resuming auto-assist.');
        setTimeout(() => {
          this.setMode('idle', 'Following along with your scroll.');
        }, 1500);
      });

      // 4. Click / Tap to Simulate Voice Command Demo
      this.bubble.addEventListener('click', () => {
        if (this.hasPointerMoved) return;
        if (this.thoughtEl?.classList.contains('is-hidden')) {
          this.thoughtEl.classList.remove('is-hidden');
        }
        this.simulateVoiceSession();
      });
    }

    simulateVoiceSession() {
      if (this.isSimulatingVoice) return;
      this.isSimulatingVoice = true;

      // Sequence: Listening -> Thinking -> Working -> Celebrate
      this.setMode('listening', '"When a user signs up via webhook, create a contact in HubSpot."', true);

      setTimeout(() => {
        this.setMode('thinking', 'Planning 2 steps: parse JSON payload, then create HubSpot contact.', true);
      }, 2200);

      setTimeout(() => {
        this.setMode('working', 'Mapping fields (email, name) and running step test...', true);
      }, 4400);

      setTimeout(() => {
        this.setMode('celebrate', 'Step test verified. HubSpot contact created successfully.', true);
      }, 6600);

      setTimeout(() => {
        this.isSimulatingVoice = false;
        this.setMode('idle', 'Ready. Click to simulate another action or drag to park.');
      }, 9200);
    }

    startLoop() {
      const render = () => {
        // Smooth lerp (linear interpolation) for floating physics
        if (!this.isDragging) {
          this.x += (this.tx - this.x) * 0.085;
          this.y += (this.ty - this.y) * 0.085;
        }

        this.el.style.transform = `translate3d(${this.x.toFixed(1)}px, ${this.y.toFixed(1)}px, 0)`;
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }
  }

  const companionController = companionEl ? new CompanionController(companionEl) : null;

  // =========================================================================
  // 4. Scrollytelling Section Detection (IntersectionObserver)
  // =========================================================================
  const assistSections = document.querySelectorAll('[data-assist-mode]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !companionController?.isPinned && !companionController?.isSimulatingVoice) {
          const mode = entry.target.getAttribute('data-assist-mode') || 'idle';
          const thought = entry.target.getAttribute('data-assist-thought') || '';

          companionController?.setMode(mode, thought);

          // Position companion intelligently based on section and viewport
          const isMobile = window.innerWidth < 768;
          if (isMobile) {
            companionController?.setTargetPosition(window.innerWidth - 60, window.innerHeight - 72);
          } else {
            const sectionId = entry.target.id;
            if (sectionId === 'hero') {
              companionController?.setTargetPosition(window.innerWidth - 84, window.innerHeight - 96);
            } else if (sectionId === 'features') {
              companionController?.setTargetPosition(window.innerWidth - 84, window.innerHeight / 2 - 28);
            } else if (sectionId === 'how-it-works') {
              companionController?.setTargetPosition(window.innerWidth - 84, window.innerHeight * 0.6);
            } else if (sectionId === 'privacy') {
              companionController?.setTargetPosition(window.innerWidth - 84, window.innerHeight * 0.4);
            } else if (entry.target.classList.contains('site-footer')) {
              companionController?.setTargetPosition(window.innerWidth - 84, window.innerHeight - 90);
            }
          }
        }
      });
    },
    {
      threshold: 0.35,
    },
  );

  assistSections.forEach((s) => sectionObserver.observe(s));

  // =========================================================================
  // 5. Motion Graphics Canvas (Workflow Nodes & Connected Data Streams)
  // =========================================================================
  const canvas = document.getElementById('motion-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener(
      'mousemove',
      (e) => {
        mouse.tx = e.clientX / width;
        mouse.ty = e.clientY / height;
      },
      { passive: true },
    );

    // Mock Automation Nodes - placed in peripheral side gutters so center content stays unobstructed
    const nodes = [
      { id: 'trigger', label: 'Webhook', xRatio: 0.08, yRatio: 0.22, color: '#5DCAA5' },
      { id: 'js', label: 'JS Code', xRatio: 0.12, yRatio: 0.58, color: '#38BDF8' },
      { id: 'filter', label: 'Condition', xRatio: 0.88, yRatio: 0.20, color: '#AFA9EC' },
      { id: 'slack', label: 'Slack Alert', xRatio: 0.90, yRatio: 0.48, color: '#EF9F27' },
      { id: 'db', label: 'Postgres', xRatio: 0.86, yRatio: 0.74, color: '#97C459' },
    ];

    const connections = [
      { from: 0, to: 1, particles: [{ t: 0.1, speed: 0.0035 }, { t: 0.6, speed: 0.004 }] },
      { from: 1, to: 2, particles: [{ t: 0.2, speed: 0.0038 }] },
      { from: 2, to: 3, particles: [{ t: 0.45, speed: 0.0042 }] },
      { from: 2, to: 4, particles: [{ t: 0.75, speed: 0.0032 }] },
    ];

    function drawDotGrid() {
      const step = 42;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function getCubicBezierPoint(p0, p1, p2, p3, t) {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
      };
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = document.visibilityState === 'visible';
    });

    function animate() {
      if (!isVisible) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Mouse Parallax Lerp
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const shiftX = (mouse.x - 0.5) * 20;
      const shiftY = (mouse.y - 0.5) * 16;

      drawDotGrid();

      // Node absolute coordinates
      const coords = nodes.map((n) => ({
        x: n.xRatio * width + shiftX,
        y: n.yRatio * height + shiftY,
        label: n.label,
        color: n.color,
      }));

      // Draw Connections & Moving Pulse Particles
      connections.forEach((conn) => {
        const p0 = coords[conn.from];
        const p3 = coords[conn.to];
        const dx = (p3.x - p0.x) * 0.5;
        const p1 = { x: p0.x + dx, y: p0.y };
        const p2 = { x: p3.x - dx, y: p3.y };

        // Curve
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = 'rgba(93, 202, 165, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Traveling glowing data packets
        conn.particles.forEach((pt) => {
          pt.t += pt.speed;
          if (pt.t > 1) pt.t = 0;

          const point = getCubicBezierPoint(p0, p1, p2, p3, pt.t);

          // Glow
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(93, 202, 165, 0.7)';
          ctx.shadowColor = '#5DCAA5';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // Draw Automation Node Badges on desktop & tablet (keep mobile canvas purely ambient to avoid text clashes)
      if (width >= 768) {
        coords.forEach((node) => {
          const w = 92;
          const h = 26;
          const r = 13;

          // Pill background
          ctx.beginPath();
          ctx.roundRect(node.x - w / 2, node.y - h / 2, w, h, r);
          ctx.fillStyle = 'rgba(18, 25, 27, 0.75)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Dot
          ctx.beginPath();
          ctx.arc(node.x - w / 2 + 13, node.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Label
          ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
          ctx.font = '500 11px system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, node.x - w / 2 + 22, node.y + 0.5);
        });
      }

      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
});
