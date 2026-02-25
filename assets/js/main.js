// Apply theme immediately to prevent flashing
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();
/**
 * AI-SaaS Elite - Main JavaScript
 * Handles interactivity, form validation, and simulated AI effects.
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Bootstrap Form Validation (Login, Signup, Contact) ---
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
            } else {
                event.preventDefault(); // Prevent actual submission for template demo
                
                // Simulate Form Submission / AI Generating Effect
                const submitBtn = form.querySelector('button[type="submit"]');
                if(submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    
                    // Loading State
                    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Processing...';
                    submitBtn.disabled = true;

                    // Success State after 2 seconds
                    setTimeout(() => {
                        submitBtn.classList.remove('btn-primary');
                        submitBtn.classList.add('btn-success');
                        submitBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Success!';
                        
                        // Reset Form after another 3 seconds
                        setTimeout(() => {
                           form.reset();
                           form.classList.remove('was-validated');
                           submitBtn.classList.remove('btn-success');
                           submitBtn.classList.add('btn-primary');
                           submitBtn.innerHTML = originalText;
                           submitBtn.disabled = false;
                        }, 3000);
                    }, 2000);
                }
            }
        }, false);
    });

    // --- 2. Pricing Toggle (Monthly / Yearly) ---
    const pricingToggle = document.getElementById("pricingToggle");
    if(pricingToggle) {
        pricingToggle.addEventListener("change", (e) => {
            const isYearly = e.target.checked;
            
            // Toggle Price Values
            document.querySelectorAll(".price-display").forEach(el => {
                const monthlyPrice = el.getAttribute("data-monthly");
                const yearlyPrice = el.getAttribute("data-yearly");
                
                // Simple fade effect
                el.style.opacity = 0;
                setTimeout(() => {
                    el.innerText = isYearly ? yearlyPrice : monthlyPrice;
                    el.style.opacity = 1;
                }, 200);
            });
            
            // Toggle Billing Texts (/mo or /yr)
            document.querySelectorAll(".billing-cycle").forEach(el => {
                el.style.opacity = 0;
                setTimeout(() => {
                    el.innerText = isYearly ? "/year" : "/mo";
                    el.style.opacity = 1;
                }, 200);
            });
        });
    }

    // --- 3. Dashboard Mobile Sidebar Toggle ---
    const sidebarToggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("mobileSidebar");
    if(sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });

        // Close when clicking outside on mobile
        document.addEventListener("click", (e) => {
            if(window.innerWidth < 992 && sidebar.classList.contains("show")) {
                if(!sidebar.contains(e.target) && e.target !== sidebarToggleBtn && !sidebarToggleBtn.contains(e.target)) {
                    sidebar.classList.remove("show");
                }
            }
        });
    }

    // --- 4. Simulated AI Chat (Dashboard) ---
    const chatInput = document.getElementById("aiChatInput");
    const chatBtn = document.getElementById("aiChatForm");
    const chatContainer = document.getElementById("aiChatContainer");

    if (chatBtn && chatInput && chatContainer) {
        chatBtn.addEventListener("submit", (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            // Append User Message
            appendMessage(message, "user");
            chatInput.value = "";

            // Simulate AI Typing
            setTimeout(() => {
                const typingId = appendTypingIndicator();
                
                // Simulate AI Response
                setTimeout(() => {
                    removeTypingIndicator(typingId);
                    appendMessage("I have analyzed your request. Here is an optimized response based on AI-SaaS Elite's capabilities. How else can I assist you today?", "ai");
                }, 1500);
            }, 500);
        });

        function appendMessage(text, sender) {
            const msgDiv = document.createElement("div");
            msgDiv.className = `chat-message ${sender} mb-3`;
            
            const avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
            avatar.style.background = sender === 'user' ? 'var(--secondary-color)' : 'var(--primary-color)';

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble shadow-sm";
            bubble.innerText = text;

            if (sender === 'user') {
                msgDiv.appendChild(bubble);
                msgDiv.appendChild(avatar);
            } else {
                msgDiv.appendChild(avatar);
                msgDiv.appendChild(bubble);
            }

            chatContainer.appendChild(msgDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function appendTypingIndicator() {
            const id = "typing-" + Date.now();
            const msgDiv = document.createElement("div");
            msgDiv.className = `chat-message ai mb-3`;
            msgDiv.id = id;
            
            const avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            avatar.style.background = 'var(--primary-color)';

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble shadow-sm bg-white text-muted";
            bubble.innerHTML = '<i class="fas fa-circle text-muted" style="font-size: 0.5rem; animation: fade 1s infinite alternate;"></i> <i class="fas fa-circle text-muted" style="font-size: 0.5rem; animation: fade 1s infinite alternate 0.3s; margin: 0 2px;"></i> <i class="fas fa-circle text-muted" style="font-size: 0.5rem; animation: fade 1s infinite alternate 0.6s;"></i>';

            msgDiv.appendChild(avatar);
            msgDiv.appendChild(bubble);
            chatContainer.appendChild(msgDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            return id;
        }

        function removeTypingIndicator(id) {
            const el = document.getElementById(id);
            if(el) el.remove();
        }
    }

    // --- 5. Dark Mode Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    if(themeToggleBtn) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        updateThemeIcon(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            let activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
            let newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });

        function updateThemeIcon(theme) {
            if(theme === 'dark') {
                themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    }

    // --- 6. Mobile Navbar Hamburger Animation ---
    const mobileToggler = document.querySelector('.navbar-toggler');
    if(mobileToggler) {
        mobileToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const icon = this.querySelector('i');
            
            if(isExpanded) {
                // Changing to X
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                icon.style.transform = 'rotate(90deg)';
                icon.style.transition = 'transform 0.3s ease';
            } else {
                // Changing back to Hamburger
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                icon.style.transform = 'rotate(0deg)';
            }
        });
    }
});
