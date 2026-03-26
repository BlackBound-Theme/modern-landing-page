/**
 * AI-SaaS Elite — API Configuration
 * ====================================
 * HOW TO SET UP YOUR API KEY:
 *
 * 1. Go to https://huggingface.co and create a FREE account.
 * 2. Navigate to: Settings → Access Tokens → New Token
 * 3. Create a token with "Read" permissions.
 * 4. Copy your token (it starts with "hf_...")
 * 5. Paste it below, replacing "YOUR_HF_API_KEY_HERE".
 *
 * That's it! Your template will now generate real AI images.
 *
 * NOTE: The Hugging Face free tier allows ~100 image generations/day.
 * For higher limits, upgrade your HF account or use a Pro API key.
 */

window.AI_CONFIG = {

    // ── PASTE YOUR HUGGING FACE API KEY HERE ──────────────────────────────
    HF_API_KEY: 'YOUR_HF_API_KEY_HERE',
    // ──────────────────────────────────────────────────────────────────────

    // Model to use for image generation (free, high-quality)
    // Other options: 'stabilityai/stable-diffusion-xl-base-1.0', 'runwayml/stable-diffusion-v1-5'
    HF_MODEL: 'black-forest-labs/FLUX.1-schnell',

    // Cost in tokens per image generation
    TOKENS_PER_GENERATION: 50,

    // Demo mode text (shown if API key is not set)
    DEMO_MESSAGE: 'This is a live demo preview. To enable real AI image generation, open assets/js/api-config.js and paste your Hugging Face API key.',

    // Used to determine if the key has been configured
    isConfigured() {
        return this.HF_API_KEY && this.HF_API_KEY !== 'YOUR_HF_API_KEY_HERE' && this.HF_API_KEY.startsWith('hf_');
    }
};
