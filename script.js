document.addEventListener('DOMContentLoaded', () => {
    let learnedThemes = JSON.parse(localStorage.getItem('learnedThemes')) || [];
    let importantFormulas = JSON.parse(localStorage.getItem('importantFormulas')) || [];
    let unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    let sessionLearnCount = 0;

    let toastQueue = [];
    let isToastProcessing = false;

    const funnyQuotes = [
        "С большими знаниями приходит большая ответственность. Не сломай диван ею!",
        "Ого, теперь твой мозг весит на пару граммов больше. Осторожно при ходьбе!",
        "Физика — сила, а без неё ты... просто набор хаотично движущихся молекул.",
        "Ньютон гордился бы тобой. А теперь иди съешь яблоко 🍏",
        "Твоя ментальная энергия совершила полезную работу. КПД стремится к 100%!"
    ];

    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');
    const markLearnedBtn = document.getElementById('markLearnedBtn');
    const excludeModalBtn = document.getElementById('excludeModalBtn');

    let currentOpenTemplateId = '';

    initConfettiEngine();
    syncUIWithStorage();
    checkAchievementsSilent();

    menuToggleBtn.addEventListener('click', (e) => { e.stopPropagation(); sidebar.classList.toggle('open'); });
    document.addEventListener('click', (e) => { if (!sidebar.contains(e.target) && e.target !== menuToggleBtn) sidebar.classList.remove('open'); });

    function showSection(targetId) {
        contentSections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        sidebar.classList.remove('open');
    }

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(btn => btn.classList.remove('active-nav'));
            item.classList.add('active');
            showSection(item.getAttribute('data-target'));
        });
    });

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(b => b.classList.remove('active-nav'));
            btn.classList.add('active-nav');
            const target = btn.getAttribute('data-target');

            if (target === 'learned-section') renderLearnedList();
            if (target === 'important-section') renderImportantList();
            if (target === 'stats-section') renderStatsAndAchievements();

            showSection(target);
        });
    });
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('advanced-btn')) {
            currentOpenTemplateId = e.target.getAttribute('data-depth');
            const template = document.getElementById(currentOpenTemplateId);

            if (template) {
                modalBody.innerHTML = '';
                modalBody.appendChild(template.content.cloneNode(true));
                updateModalButtonsState();
                modalOverlay.classList.add('open');
            }
        }
    });

    function updateModalButtonsState() {
        if (learnedThemes.includes(currentOpenTemplateId)) {
            markLearnedBtn.innerText = 'Изучено ✓';
            markLearnedBtn.classList.add('completed');
            markLearnedBtn.disabled = true;
            excludeModalBtn.style.display = 'block';
        } else {
            markLearnedBtn.innerText = 'Отметить изученным';
            markLearnedBtn.classList.remove('completed');
            markLearnedBtn.disabled = false;
            excludeModalBtn.style.display = 'none';
        }
    }

    markLearnedBtn.addEventListener('click', () => {
        if (currentOpenTemplateId && !learnedThemes.includes(currentOpenTemplateId)) {
            learnedThemes.push(currentOpenTemplateId);
            localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));
            updateModalButtonsState();

            fireConfettiBurst();

            checkAndUnlockAchievement('first-step', "🚀 Получено достижение: Первый шаг!");
            if (learnedThemes.length === 3) {
                checkAndUnlockAchievement('phys-master', "⚛️ Получено достижение: Архивариус!");
            }

            sessionLearnCount++;
            if (sessionLearnCount % 2 === 0) {
                queueToast(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)], false);
            }
        }
    });

    excludeModalBtn.addEventListener('click', () => {
        if (currentOpenTemplateId && learnedThemes.includes(currentOpenTemplateId)) {
            learnedThemes = learnedThemes.filter(id => id !== currentOpenTemplateId);
            localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));
            updateModalButtonsState();
        }
    });

    const closeModal = () => modalOverlay.classList.remove('open');
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    let canvas, ctx, confettiParticles = [];
    function initConfettiEngine() {
        canvas = document.getElementById('confetti-canvas');
        ctx = canvas.getContext('2d');
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    }

    function fireConfettiBurst() {
        confettiParticles = [];
        const colors = ['#3498db', '#2ecc71', '#e74c3c', '#e67e22', '#9b59b6', '#f1c40f'];
        for (let i = 0; i < 150; i++) {
            confettiParticles.push({
                x: canvas.width / 2,
                y: canvas.height * 0.6,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: Math.random() * 12 - 6,
                speedY: Math.random() * -15 - 5,
                gravity: 0.4,
                opacity: 1
            });
        }
        requestAnimationFrame(updateConfettiLoop);
    }

    function updateConfettiLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        confettiParticles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY; p.speedY += p.gravity; p.opacity -= 0.01;
            if (p.opacity > 0) {
                active = true;
                ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        });
        ctx.globalAlpha = 1;
        if (active) requestAnimationFrame(updateConfettiLoop);
    }
    function queueToast(text, isAchievement = false) {
        toastQueue.push({ text, isAchievement });
        processToastQueue();
    }

    function processToastQueue() {
        if (isToastProcessing || toastQueue.length === 0) return;
        isToastProcessing = true;

        const currentToast = toastQueue.shift();
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');

        toast.classList.add('toast');
        if (currentToast.isAchievement) {
            toast.classList.add('achievement-toast');
        }
        toast.innerText = currentToast.text;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 50);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                isToastProcessing = false;
                processToastQueue();
            }, 300);
        }, 4000);
    }

    function checkAndUnlockAchievement(id, notificationText) {
        if (!unlockedAchievements.includes(id)) {
            unlockedAchievements.push(id);
            localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
            queueToast(notificationText, true);
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('important-toggle')) {
            const card = e.target.closest('.card');
            if (!card) return;
            const formulaId = card.getAttribute('data-formula-id');

            if (importantFormulas.includes(formulaId)) {
                importantFormulas = importantFormulas.filter(id => id !== formulaId);
                document.querySelectorAll(`.card[data-formula-id="${formulaId}"] .important-toggle`).forEach(btn => btn.classList.remove('active'));
            } else {
                importantFormulas.push(formulaId);
                document.querySelectorAll(`.card[data-formula-id="${formulaId}"] .important-toggle`).forEach(btn => btn.classList.add('active'));
                checkAndUnlockAchievement('formula-fan', "⭐ Получено achievement: Знаток формул!");
            }
            localStorage.setItem('importantFormulas', JSON.stringify(importantFormulas));

            const currentActiveNav = document.querySelector('.nav-btn.active-nav');
            if (currentActiveNav && currentActiveNav.getAttribute('data-target') === 'important-section') {
                renderImportantList();
            }
        }
    });

    function syncUIWithStorage() {
        document.querySelectorAll('.card').forEach(card => {
            const id = card.getAttribute('data-formula-id');
            const btn = card.querySelector('.important-toggle');
            if (importantFormulas.includes(id) && btn) btn.classList.add('active');
        });
    }
    function renderStatsAndAchievements() {
        const totalThemesCount = 3;
        const learnedCount = learnedThemes.length;
        const percentage = totalThemesCount > 0 ? (learnedCount / totalThemesCount) * 100 : 0;
        const strokeDashOffset = 251.2 - (251.2 * percentage) / 100;

        const chartContainer = document.getElementById('pie-chart-container');
        chartContainer.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" stroke-width="12"/>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3498db" stroke-width="12"
                    stroke-dasharray="251.2" stroke-dashoffset="${strokeDashOffset}"
                    transform="rotate(-90 50 50)" stroke-linecap="round" style="transition: stroke-dashoffset 0.5s ease;"/>
            </svg>
        `;

        document.getElementById('chartCounterText').innerText = `Изучено: ${learnedCount} из ${totalThemesCount} конспектов`;

        document.querySelectorAll('.pedestal-card').forEach(card => {
            const achId = card.getAttribute('data-ach-id');
            if (unlockedAchievements.includes(achId)) card.classList.add('unlocked');
            else card.classList.remove('unlocked');
        });
    }

    document.querySelectorAll('.pedestal-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = card.classList.contains('open');
            document.querySelectorAll('.pedestal-card').forEach(c => c.classList.remove('open'));
            if (!isOpen) card.classList.add('open');
        });
    });
    document.addEventListener('click', () => { document.querySelectorAll('.pedestal-card').forEach(c => c.classList.remove('open')); });

    function checkAchievementsSilent() {
        if (learnedThemes.length >= 1 && !unlockedAchievements.includes('first-step')) unlockedAchievements.push('first-step');
        if (importantFormulas.length >= 1 && !unlockedAchievements.includes('formula-fan')) unlockedAchievements.push('formula-fan');
        if (learnedThemes.length === 3 && !unlockedAchievements.includes('phys-master')) unlockedAchievements.push('phys-master');
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    }

    function renderLearnedList() {
        const container = document.getElementById('learned-list-container'); container.innerHTML = '';
        if (learnedThemes.length === 0) { container.innerHTML = '<p style="color: #7f8c8d;">Нет изученных тем.</p>'; return; }

        learnedThemes.forEach(templateId => {
            const template = document.getElementById(templateId);
            if (template) {
                const tempDiv = document.createElement('div'); tempDiv.appendChild(template.content.cloneNode(true));
                const titleText = tempDiv.querySelector('h2') ? tempDiv.querySelector('h2').innerText : "Конспект";
                const accordionItem = document.createElement('div'); accordionItem.classList.add('accordion-item');
                accordionItem.innerHTML = `
                    <div class="accordion-header">${titleText} <span>▼</span></div>
                    <div class="accordion-content"><div class="theory-text-wrapper"></div><button class="exclude-learned-btn" data-exclude-id="${templateId}">❌ Удалить из изученного</button></div>
                `;
                accordionItem.querySelector('.theory-text-wrapper').appendChild(tempDiv); container.appendChild(accordionItem);
                accordionItem.querySelector('.accordion-header').addEventListener('click', () => accordionItem.classList.toggle('open'));
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('exclude-learned-btn')) {
            const idToRemove = e.target.getAttribute('data-exclude-id');
            learnedThemes = learnedThemes.filter(id => id !== idToRemove);
            localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));
            renderLearnedList();
        }
    });

    function renderImportantList() {
        const container = document.getElementById('important-list-container'); container.innerHTML = '';
        if (importantFormulas.length === 0) { container.innerHTML = '<p style="color: #7f8c8d;">Нет важных формул.</p>'; return; }
        importantFormulas.forEach(formulaId => {
            const originalCard = document.querySelector(`.content-section:not(#important-section) .card[data-formula-id="${formulaId}"]`);
            if (originalCard) container.appendChild(originalCard.cloneNode(true));
        });
    }
});
