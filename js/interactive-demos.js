/**
 * ERYOPS ACADEMY - INTERACTIVE SIMULATORS & DEMOS
 * High-fidelity computer vision simulator, IoT telemetry, and ecosystem interactions
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. AI BAG COUNTING SYSTEM - LIVE COMPUTER VISION SIMULATOR
  // -------------------------------------------------------------------------
  const bagCanvas = document.getElementById('ai-bag-canvas');
  if (bagCanvas) {
    const ctx = bagCanvas.getContext('2d');
    let cw, ch;
    let bags = [];
    let bagCounter = 1248;
    let nextBagId = 1249;
    let lastTime = 0;
    let laserY = 0;
    let laserDir = 1;

    function resizeBagCanvas() {
      const rect = bagCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      cw = rect.width || 480;
      ch = rect.height || 300;
      bagCanvas.width = cw * dpr;
      bagCanvas.height = ch * dpr;
      ctx.scale(dpr, dpr);
    }

    class SimulatedBag {
      constructor() {
        this.id = nextBagId++;
        this.width = Math.floor(Math.random() * 25 + 50);
        this.height = Math.floor(Math.random() * 20 + 40);
        this.x = -this.width - Math.random() * 60;
        this.y = ch * 0.45 + (Math.random() * 40 - 20);
        this.speed = Math.random() * 0.8 + 1.2;
        this.confidence = (Math.random() * 0.05 + 0.94).toFixed(3);
        this.counted = false;
        this.color = '#38bdf8';
      }

      update() {
        this.x += this.speed;

        // Tripwire line check at 65% width
        const tripwireX = cw * 0.65;
        if (!this.counted && this.x + this.width >= tripwireX) {
          this.counted = true;
          bagCounter++;
          updateBagCounterUI(bagCounter, this.id, this.confidence);
        }
      }

      draw() {
        // Draw simulated bag shape
        ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw YOLO Bounding Box
        ctx.strokeStyle = this.counted ? '#10b981' : '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Corner brackets for futuristic CV look
        const bSize = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        // Top-left
        ctx.moveTo(this.x, this.y + bSize); ctx.lineTo(this.x, this.y); ctx.lineTo(this.x + bSize, this.y);
        // Top-right
        ctx.moveTo(this.x + this.width - bSize, this.y); ctx.lineTo(this.x + this.width, this.y); ctx.lineTo(this.x + this.width, this.y + bSize);
        // Bottom-left
        ctx.moveTo(this.x, this.y + this.height - bSize); ctx.lineTo(this.x, this.y + this.height); ctx.lineTo(this.x + bSize, this.y + this.height);
        // Bottom-right
        ctx.moveTo(this.x + this.width - bSize, this.y + this.height); ctx.lineTo(this.x + this.width, this.y + this.height); ctx.lineTo(this.x + this.width, this.y + this.height - bSize);
        ctx.stroke();

        // Label Badge
        ctx.fillStyle = this.counted ? 'rgba(16, 185, 129, 0.9)' : 'rgba(0, 240, 255, 0.9)';
        ctx.fillRect(this.x, this.y - 18, 95, 16);

        ctx.fillStyle = '#05070c';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`Bag #${this.id} ${(this.confidence * 100).toFixed(1)}%`, this.x + 4, this.y - 6);
      }
    }

    function updateBagCounterUI(count, id, conf) {
      const counterEl = document.getElementById('bag-count-metric');
      if (counterEl) counterEl.textContent = count.toLocaleString();

      const confEl = document.getElementById('bag-conf-metric');
      if (confEl) confEl.textContent = `${(conf * 100).toFixed(1)}%`;
    }

    function spawnBags() {
      if (bags.length < 4 && Math.random() < 0.02) {
        bags.push(new SimulatedBag());
      }
    }

    function renderSimulator(timestamp) {
      ctx.clearRect(0, 0, cw, ch);

      // 1. Draw Conveyor Belt Platform
      ctx.fillStyle = '#0c101a';
      ctx.fillRect(0, ch * 0.4, cw, ch * 0.35);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < cw; i += 35) {
        ctx.beginPath();
        ctx.moveTo(i, ch * 0.4);
        ctx.lineTo(i, ch * 0.75);
        ctx.stroke();
      }

      // 2. Draw Virtual Tripwire / Detection Line
      const tripwireX = cw * 0.65;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(tripwireX, 0);
      ctx.lineTo(tripwireX, ch);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Tripwire label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('COUNT TRIPWIRE', tripwireX + 6, 18);

      // 3. Draw Moving Laser Scan Line
      laserY += laserDir * 1.5;
      if (laserY > ch || laserY < 0) laserDir *= -1;

      const grad = ctx.createLinearGradient(0, laserY - 10, 0, laserY + 10);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.35)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, laserY - 10, cw, 20);

      // 4. Update and Draw Bags
      spawnBags();
      for (let i = bags.length - 1; i >= 0; i--) {
        bags[i].update();
        bags[i].draw();
        if (bags[i].x > cw + 50) {
          bags.splice(i, 1);
        }
      }

      // 5. Draw RTSP HUD elements
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('RTSP://192.168.1.104:554/live/wh_cam01', 12, 20);

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(cw - 20, 16, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('REC', cw - 48, 20);

      requestAnimationFrame(renderSimulator);
    }

    window.addEventListener('resize', resizeBagCanvas);
    resizeBagCanvas();
    requestAnimationFrame(renderSimulator);
  }


  // -------------------------------------------------------------------------
  // 2. TECHNO EMS - IOT SMART ENERGY MONITOR TELEMETRY SIMULATOR
  // -------------------------------------------------------------------------
  const voltageEl = document.getElementById('iot-voltage-val');
  const currentEl = document.getElementById('iot-current-val');
  const powerEl = document.getElementById('iot-power-val');
  const totalKwhEl = document.getElementById('iot-kwh-val');

  if (voltageEl && currentEl && powerEl) {
    let baseKwh = 1429.64;

    setInterval(() => {
      // Simulate live fluctuating electrical telemetry
      const voltage = (238.5 + (Math.random() * 2.5 - 1.25)).toFixed(1);
      const current = (14.2 + (Math.random() * 0.8 - 0.4)).toFixed(2);
      const power = ((voltage * current) / 1000).toFixed(2);
      baseKwh += 0.01;

      voltageEl.textContent = `${voltage} V`;
      currentEl.textContent = `${current} A`;
      powerEl.textContent = `${power} kW`;
      if (totalKwhEl) totalKwhEl.textContent = `${baseKwh.toFixed(2)} kWh`;
    }, 2000);
  }


  // -------------------------------------------------------------------------
  // 3. HERO TECH ECOSYSTEM INTERACTIVE NODE INSPECTOR
  // -------------------------------------------------------------------------
  const ecoNodes = document.querySelectorAll('.eco-node');
  const ecoHeaderTitle = document.querySelector('.ecosystem-title');

  if (ecoNodes && ecoHeaderTitle) {
    const nodeDescriptions = {
      'react': 'Frontend Layer: Reactive UI, State Hooks, Component Architecture',
      'node': 'Backend Core: REST APIs, Async Microservices, Secure Endpoints',
      'ai': 'AI Intelligence: LLM APIs, Computer Vision, Semantic Embeddings',
      'db': 'Persistence: High-performance MySQL, NoSQL MongoDB Schemas',
      'cloud': 'Cloud Infrastructure: AWS Deployment, CI/CD, Containerization'
    };

    ecoNodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        const type = node.getAttribute('data-node-type');
        if (nodeDescriptions[type]) {
          ecoHeaderTitle.textContent = nodeDescriptions[type];
          ecoHeaderTitle.style.color = '#00f0ff';
        }
      });

      node.addEventListener('mouseleave', () => {
        ecoHeaderTitle.textContent = 'FULL-STACK AI ECOSYSTEM';
        ecoHeaderTitle.style.color = 'var(--accent-cyan)';
      });
    });
  }

})();
