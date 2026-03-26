/**
 * AI-SaaS Elite — Core AI Engine
 * ================================
 * Handles: real image generation via Hugging Face API,
 * plan-based token system, payment gate, and live UI updates.
 *
 * Depends on: api-config.js, token-config.js (load them first)
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'aisaas_account';

    // ─── Account / Token Management ────────────────────────────────────────

    const TokenSystem = {

        /** Read account from localStorage */
        getAccount() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : null;
            } catch { return null; }
        },

        /** Persist account to localStorage */
        saveAccount(account) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
        },

        /** First-time or returning user — ensure account exists */
        ensureAccount() {
            let account = this.getAccount();
            if (!account) {
                const cfg = window.PLAN_CONFIG;
                const billing = cfg.defaultBilling;
                const planKey = cfg.defaultPlan;
                const billingData = cfg.getBilling(planKey, billing);
                account = {
                    plan: planKey,
                    billing: billing,
                    tokens: cfg.freeTrialTokens,
                    maxTokens: billingData.tokens,
                    expiry: Date.now() + (billingData.billingDays * 86400000),
                    totalGenerated: 0,
                    activatedAt: Date.now()
                };
                this.saveAccount(account);
            }
            this.checkAndResetTokens(account);
            return account;
        },

        /** If plan period has expired, refill tokens for a new period */
        checkAndResetTokens(account) {
            if (Date.now() > account.expiry) {
                const cfg = window.PLAN_CONFIG;
                const billingData = cfg.getBilling(account.plan, account.billing);
                account.tokens = billingData.tokens;
                account.maxTokens = billingData.tokens;
                account.expiry = Date.now() + (billingData.billingDays * 86400000);
                this.saveAccount(account);
            }
        },

        /** Activate a plan (called after payment) */
        activatePlan(planKey, billing) {
            const cfg = window.PLAN_CONFIG;
            const billingData = cfg.getBilling(planKey, billing);
            const account = this.getAccount() || {};
            account.plan = planKey;
            account.billing = billing;
            account.tokens = billingData.tokens;
            account.maxTokens = billingData.tokens;
            account.expiry = Date.now() + (billingData.billingDays * 86400000);
            account.activatedAt = Date.now();
            account.totalGenerated = account.totalGenerated || 0;
            this.saveAccount(account);
            return account;
        },

        /** Try to deduct tokens. Returns true if success, false if not enough */
        deductTokens(cost) {
            const account = this.ensureAccount();
            if (account.tokens < cost) return false;
            account.tokens -= cost;
            account.totalGenerated = (account.totalGenerated || 0) + 1;
            this.saveAccount(account);
            window.dispatchEvent(new CustomEvent('aisaas:tokensUpdated', { detail: account }));
            return true;
        },

        /** Get remaining tokens */
        getTokens() {
            const a = this.ensureAccount();
            return a ? a.tokens : 0;
        },

        /** Get current plan name */
        getPlanName() {
            const a = this.getAccount();
            if (!a) return 'Free Trial';
            const cfg = window.PLAN_CONFIG;
            return cfg.getPlan(a.plan).name;
        },

        /** Get percentage of tokens used */
        getUsagePercent() {
            const a = this.ensureAccount();
            if (!a || !a.maxTokens) return 0;
            const used = a.maxTokens - a.tokens;
            return Math.min(100, Math.round((used / a.maxTokens) * 100));
        }
    };

    // ─── Image Generation ───────────────────────────────────────────────────

    const AIEngine = {

        STYLE_PROMPTS: {
            'Photorealistic': ', ultra-realistic, 8K, DSLR photo, high detail, cinematic lighting',
            'Anime': ', anime art style, Studio Ghibli, cel shading, vibrant colors, detailed illustration',
            'Oil Painting': ', oil painting, classical style, visible brushstrokes, rich texture, museum quality',
            'Pixel Art': ', pixel art, 8-bit, retro game style, colorful, crisp pixels'
        },

        SIZE_MAP: {
            '1024×1024': { width: 1024, height: 1024 },
            '1792×1024': { width: 1792, height: 1024 },
            '512×512':   { width: 512,  height: 512  }
        },

        /** Main generation function */
        async generateImage(prompt, style, size, seed = null) {
            const config = window.AI_CONFIG;

            // 2. Demo mode (no API key)
            if (!config.isConfigured()) {
                return AIEngine.getDemoImage(prompt);
            }

            // 3. Build prompt with style suffix
            const styleSuffix = this.STYLE_PROMPTS[style] || '';
            const fullPrompt = prompt + styleSuffix;
            const dimensions = this.SIZE_MAP[size] || this.SIZE_MAP['1024×1024'];

            const params = {
                width: dimensions.width,
                height: dimensions.height,
                num_inference_steps: 4,
                guidance_scale: 0
            };
            if (seed !== null) params.seed = seed;

            // 4. Call Hugging Face Inference API
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${config.HF_MODEL}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${config.HF_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: fullPrompt,
                        parameters: params
                    })
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || `API error ${response.status}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        },

        /** Returns a stylish demo placeholder — works on file:// and http:// */
        getDemoImage(prompt) {
            // Try canvas first; fall back to SVG data URL (works everywhere including file://)
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 512; canvas.height = 400;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('no ctx');
                const grad = ctx.createLinearGradient(0, 0, 512, 400);
                grad.addColorStop(0, '#0b2246');
                grad.addColorStop(1, '#2b5fe1');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 512, 400);
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.arc((i * 90) % 512, (i * 70 + 40) % 400, 60 + i * 15, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Demo Mode', 256, 155);
                ctx.font = '14px sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.75)';
                const short = prompt.substring(0, 60);
                ctx.fillText(short.substring(0, 40), 256, 190);
                if (short.length > 40) ctx.fillText(short.substring(40), 256, 212);
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.fillText('Set HF_API_KEY in api-config.js for real images', 256, 320);

                // canvas.toDataURL works on file:// without blob/fetch issues
                const dataUrl = canvas.toDataURL('image/png');
                return Promise.resolve(dataUrl);
            } catch (e) {
                // Pure SVG fallback — always works
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="400">
                    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#0b2246"/>
                        <stop offset="100%" stop-color="#2b5fe1"/>
                    </linearGradient></defs>
                    <rect width="512" height="400" fill="url(#g)"/>
                    <text x="256" y="175" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Demo Mode</text>
                    <text x="256" y="210" font-size="13" fill="rgba(255,255,255,0.7)" text-anchor="middle">${prompt.substring(0, 50)}</text>
                    <text x="256" y="320" font-size="12" fill="rgba(255,255,255,0.5)" text-anchor="middle">Add API key to api-config.js for real images</text>
                </svg>`;
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                return Promise.resolve(URL.createObjectURL(blob));
            }
        },

        /** Show the payment gate modal */
        showPaymentGate() {
            const modal = document.getElementById('paymentGateModal');
            if (modal && typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal, { backdrop: 'static', keyboard: false });
                bsModal.show();
            }
        },

        /** Check low token warning */
        checkLowTokens() {
            const tokens = TokenSystem.getTokens();
            const warnBar = document.getElementById('lowTokenWarningBar');
            if (warnBar) {
                if (tokens <= window.PLAN_CONFIG.lowTokenWarning && tokens > 0) {
                    warnBar.classList.remove('d-none');
                    const el = warnBar.querySelector('.low-token-count');
                    if (el) el.textContent = tokens;
                } else {
                    warnBar.classList.add('d-none');
                }
            }
        }
    };

    // ─── Live UI Updates ────────────────────────────────────────────────────

    function updateAllBadges() {
        const account = TokenSystem.ensureAccount();
        const tokens = account.tokens.toLocaleString();
        const planName = TokenSystem.getPlanName();
        const usedPct = TokenSystem.getUsagePercent();

        // Token count badges (all elements with class .token-count-badge)
        document.querySelectorAll('.token-count-badge').forEach(el => {
            el.textContent = tokens + ' Tokens Left';
        });

        // Plan name displays
        document.querySelectorAll('.plan-name-display').forEach(el => {
            el.textContent = planName + ' Plan';
        });

        // Generation count & progress bar (dashboard)
        const genCount = document.getElementById('dashGenCount');
        const genMax   = document.getElementById('dashGenMax');
        const genBar   = document.getElementById('dashGenBar');
        const genPct   = document.getElementById('dashGenPct');
        if (genCount) genCount.textContent = (account.maxTokens - account.tokens).toLocaleString();
        if (genMax)   genMax.textContent   = '/' + account.maxTokens.toLocaleString();
        if (genBar)   genBar.style.width   = usedPct + '%';
        if (genPct)   genPct.textContent   = usedPct + '% of monthly quota used';

        // Topbar token badge
        const topBadge = document.getElementById('dashTokenBadge');
        if (topBadge) topBadge.textContent = tokens + ' Tokens Left';

        AIEngine.checkLowTokens();
    }

    // ─── Hero Generate Button (index.html) ─────────────────────────────────

    function initHeroGenerator() {
        const btn = document.getElementById('heroGenerateBtn');
        const promptEl = document.getElementById('heroPromptInput');
        const styleEl  = document.getElementById('heroStyleSelect');
        const sizeEl   = document.getElementById('heroSizeSelect');
        const outputEl = document.getElementById('heroGeneratedOutput');
        const statsEl  = document.getElementById('heroFloatStats');
        const timeEl   = document.getElementById('heroGenTime');
        const tokenEl  = document.getElementById('heroTokensUsed');

        if (!btn || !promptEl) return;

        btn.addEventListener('click', async function () {
            const prompt = promptEl.value.trim();
            if (!prompt) {
                promptEl.classList.add('is-invalid');
                setTimeout(() => promptEl.classList.remove('is-invalid'), 2000);
                return;
            }

            const tokens = TokenSystem.getTokens();
            const singleCost = window.AI_CONFIG.TOKENS_PER_GENERATION;
            const cost = singleCost * 3; // Generate 3 variations at once
            if (tokens < cost) {
                AIEngine.showPaymentGate();
                return;
            }

            // Deduct tokens before starting
            if (!TokenSystem.deductTokens(cost)) {
                AIEngine.showPaymentGate();
                return;
            }

            const style = styleEl ? styleEl.value : 'Photorealistic';
            const size  = sizeEl  ? sizeEl.value  : '1024×1024';

            // Button loading state
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Generating 3 variations...';
            btn.disabled = true;

            const startTime = Date.now();
            try {
                // Generate 3 images in parallel with distinct random seeds
                const seedBase = Math.floor(Math.random() * 1000000);
                const promises = [
                    AIEngine.generateImage(prompt, style, size, seedBase),
                    AIEngine.generateImage(prompt, style, size, seedBase + 1),
                    AIEngine.generateImage(prompt, style, size, seedBase + 2)
                ];

                const [url1, url2, url3] = await Promise.all(promises);

                if (url1 && url2 && url3) {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

                    const updateImage = (el, url) => {
                        if (!el) return;
                        el.style.opacity = '0';
                        el.style.transition = 'none';
                        el.src = url;
                        el.alt = prompt;
                        el.classList.remove('d-none');
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                el.style.transition = 'opacity 0.6s ease';
                                el.style.opacity = '1';
                            });
                        });
                    };

                    updateImage(outputEl, url1);
                    updateImage(document.getElementById('heroGeneratedOutput2'), url2);
                    updateImage(document.getElementById('heroGeneratedOutput3'), url3);

                    if (statsEl)  statsEl.classList.remove('d-none');
                    if (timeEl)   timeEl.textContent  = elapsed + 's';
                    if (tokenEl)  tokenEl.textContent = cost + ' tokens used (3 images)';

                    btn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Complete!';
                    btn.classList.replace('btn-primary', 'btn-success');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-wand-magic-sparkles me-2"></i>Generate Image';
                        btn.classList.replace('btn-success', 'btn-primary');
                        btn.disabled = false;
                    }, 3000);
                } else {
                    // Fail fallback
                    btn.innerHTML = '<i class="fas fa-wand-magic-sparkles me-2"></i>Generate Image';
                    btn.disabled = false;
                }
            } catch (err) {
                console.error('AI Generation Error:', err);
                btn.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Error — Retry';
                btn.classList.replace('btn-primary', 'btn-danger');
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-wand-magic-sparkles me-2"></i>Generate Image';
                    btn.classList.replace('btn-danger', 'btn-primary');
                    btn.disabled = false;
                }, 3000);
                // Refund tokens on error
                const acc = TokenSystem.getAccount();
                if (acc) { acc.tokens = Math.min(acc.tokens + cost, acc.maxTokens); TokenSystem.saveAccount(acc); }
            }

            updateAllBadges();
        });
    }

    // ─── API Key inline setter (dashboard sidebar) ──────────────────────────

    function initApiKeyInput() {
        const input = document.getElementById('apiKeyInput');
        const saveBtn = document.getElementById('apiKeySaveBtn');
        if (!input || !saveBtn) return;

        // Load saved key
        const saved = localStorage.getItem('aisaas_hf_key');
        if (saved) {
            input.value = saved;
            window.AI_CONFIG.HF_API_KEY = saved;
        }

        saveBtn.addEventListener('click', () => {
            const key = input.value.trim();
            if (key && key.startsWith('hf_')) {
                localStorage.setItem('aisaas_hf_key', key);
                window.AI_CONFIG.HF_API_KEY = key;
                saveBtn.innerHTML = '<i class="fas fa-check me-1"></i>Saved!';
                saveBtn.classList.replace('btn-primary', 'btn-success');
                setTimeout(() => {
                    saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Save Key';
                    saveBtn.classList.replace('btn-success', 'btn-primary');
                }, 2500);
            } else {
                input.classList.add('is-invalid');
                setTimeout(() => input.classList.remove('is-invalid'), 2000);
            }
        });
    }

    // ─── Load saved API key from localStorage on every page ─────────────────

    function loadSavedApiKey() {
        const saved = localStorage.getItem('aisaas_hf_key');
        if (saved && window.AI_CONFIG) {
            window.AI_CONFIG.HF_API_KEY = saved;
        }
    }

    // ─── Upgrade modal "Choose Plan" buttons ─────────────────────────────────

    function initUpgradeButtons() {
        document.querySelectorAll('[data-upgrade-plan]').forEach(btn => {
            btn.addEventListener('click', function () {
                const plan    = this.getAttribute('data-upgrade-plan') || 'pro';
                const billing = this.getAttribute('data-upgrade-billing') || 'monthly';
                window.location.href = `payment.html?plan=${plan}&billing=${billing}`;
            });
        });
    }

    // ─── Init ────────────────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function () {
        if (!window.AI_CONFIG || !window.PLAN_CONFIG) {
            console.warn('AI-SaaS Elite: api-config.js or token-config.js not loaded.');
            return;
        }

        loadSavedApiKey();
        TokenSystem.ensureAccount();
        updateAllBadges();
        initHeroGenerator();
        initApiKeyInput();
        initUpgradeButtons();

        // Listen for token updates from other tabs
        window.addEventListener('storage', function (e) {
            if (e.key === STORAGE_KEY) updateAllBadges();
        });

        // Custom event listener
        window.addEventListener('aisaas:tokensUpdated', updateAllBadges);
    });

    // ─── Export to global scope ───────────────────────────────────────────────
    window.TokenSystem = TokenSystem;
    window.AIEngine    = AIEngine;

})();
