/*
 * AI-SaaS Elite — API Configuration
 *
 * Setup:
 * - Create a free account at https://huggingface.co
 * - Go to Settings > Access Tokens > New Token (Read access)
 * - Paste your token below (starts with "hf_")
 *
 * Free tier: ~100 generations/day. Upgrade HF account for more.
 */

window.AI_CONFIG = {

    // Paste your Hugging Face API key here
    HF_API_KEY: 'YOUR_HF_API_KEY_HERE',

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
