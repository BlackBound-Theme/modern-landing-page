(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
            } else {
                event.preventDefault();
                
                const submitBtn = form.querySelector('button[type="submit"]');
                if(submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    
                    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Processing...';
                    submitBtn.disabled = true;

                    setTimeout(() => {
                        submitBtn.classList.remove('btn-primary');
                        submitBtn.classList.add('btn-success');
                        submitBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Success!';
                        
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

    const pricingToggle = document.getElementById("pricingToggle");
    if(pricingToggle) {
        pricingToggle.addEventListener("change", (e) => {
            const isYearly = e.target.checked;
            
            document.querySelectorAll(".price-display").forEach(el => {
                const monthlyPrice = el.getAttribute("data-monthly");
                const yearlyPrice = el.getAttribute("data-yearly");
                
                el.style.opacity = 0;
                setTimeout(() => {
                    el.innerText = isYearly ? yearlyPrice : monthlyPrice;
                    el.style.opacity = 1;
                }, 200);
            });
            
            document.querySelectorAll(".billing-cycle").forEach(el => {
                el.style.opacity = 0;
                setTimeout(() => {
                    el.innerText = isYearly ? "/year" : "/mo";
                    el.style.opacity = 1;
                }, 200);
            });
        });
    }

    const sidebarToggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("mobileSidebar");
    if(sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if(window.innerWidth < 992 && sidebar.classList.contains("show")) {
                if(!sidebar.contains(e.target) && e.target !== sidebarToggleBtn && !sidebarToggleBtn.contains(e.target)) {
                    sidebar.classList.remove("show");
                }
            }
        });
    }

    const chatInput = document.getElementById("aiChatInput");
    const chatBtn = document.getElementById("aiChatForm");
    const chatContainer = document.getElementById("chatContainer");

    if (chatBtn && chatInput && chatContainer) {
        chatBtn.addEventListener("submit", (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            appendMessage(message, "user");
            chatInput.value = "";

            setTimeout(() => {
                const typingId = appendTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator(typingId);
                    appendMessage("I have analyzed your request. Here is an optimized response based on AI-SaaS Elite's capabilities.", "ai");
                }, 1500);
            }, 500);
        });

        // XSS Sanitization helper
        function sanitizeHTML(str) {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        }

        function appendMessage(text, sender) {
            const sanitizedText = sanitizeHTML(text);
            const msgDiv = document.createElement("div");
            msgDiv.className = `chat-message ${sender} mb-3`;
            
            const avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
            avatar.style.background = sender === 'user' ? 'var(--secondary-color)' : 'var(--primary-color)';

            const bubble = document.createElement("div");
            bubble.className = "chat-bubble shadow-sm";
            bubble.innerHTML = sanitizedText;

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

    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    if(themeToggleBtns.length > 0) {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        updateThemeIcon(currentTheme);

        themeToggleBtns.forEach(btn => btn.addEventListener('click', () => {
            let activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
            let newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        }));

        function updateThemeIcon(theme) {
            if(theme === 'dark') {
                themeToggleBtns.forEach(btn => btn.innerHTML = '<i class="fas fa-sun"></i>');
            } else {
                themeToggleBtns.forEach(btn => btn.innerHTML = '<i class="fas fa-moon"></i>');
            }
        }
    }

    const mobileToggler = document.querySelector('.navbar-toggler');
    if(mobileToggler) {
        mobileToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const icon = this.querySelector('i');
            
            if(isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                icon.style.transform = 'rotate(90deg)';
                icon.style.transition = 'transform 0.3s ease';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                icon.style.transform = 'rotate(0deg)';
            }
        });
    }

    const apiTokenCtx = document.getElementById('apiTokenChart');
    const resourceLoadCtx = document.getElementById('resourceLoadChart');

    if (apiTokenCtx && resourceLoadCtx && typeof Chart !== 'undefined') {
        new Chart(apiTokenCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Tokens Used',
                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#8b5cf6',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [5, 5], color: '#e2e8f0' },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });

        new Chart(resourceLoadCtx, {
            type: 'bar',
            data: {
                labels: ['CPU', 'RAM', 'Storage', 'Network'],
                datasets: [{
                    label: 'Load %',
                    data: [65, 85, 45, 30],
                    backgroundColor: '#ec4899',
                    borderRadius: 6,
                    barThickness: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { borderDash: [5, 5], color: '#e2e8f0' },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }
});
