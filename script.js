document.addEventListener('DOMContentLoaded', () => {
    // Загрузка данных из LocalStorage
    let learnedThemes = JSON.parse(localStorage.getItem('learnedThemes')) || [];
    let importantFormulas = JSON.parse(localStorage.getItem('importantFormulas')) || [];
    let unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
    let sessionLearnCount = 0;

    let toastQueue = [];
    let isToastProcessing = false;

    const funnyQuotes = [
        "С большими знаниями приходит большая ответственность",
        "Осторожней, а то аурометр рядом с тобой зашкаливает!",
        "Физика — сила, а без неё ты... просто набор хаотично движущихся молекул.",
        "Ньютон гордился бы тобой. А теперь иди съешь яблоко 🍏",
        "Твоя интеллектуальная энергия совершила полезную работу. КПД стремится к 100%!",
        "Такими темпами и физматом стать можно...",
        "Поздравляем, ты только что уменьшил энтропию Вселенной!"
    ];

    // Элементы навигации
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    // Элементы модального окна
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');
    const markLearnedBtn = document.getElementById('markLearnedBtn');

    let currentOpenTemplateId = '';

    // Синхронизация данных при старте
    syncUIWithStorage();
    renderStatsAndAchievements();

    // Боковое меню (открытие/закрытие)
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    document.addEventListener('click', (e) => {
        if (sidebar && !sidebar.contains(e.target) && e.target !== menuToggleBtn) {
            sidebar.classList.remove('open');
        }
    });

    function showSection(targetId) {
        contentSections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        if (sidebar) sidebar.classList.remove('open');
    }

    // Новая логика переключения разделов физики в боковом меню
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(btn => btn.classList.remove('active-nav'));
            item.classList.add('active');
            
            // Включаем вкладку теории
            showSection('theory-section');
            
            const target = item.getAttribute('data-target');
            const allBlocks = document.querySelectorAll('.physics-block');
            
            if (target === 'all-blocks') {
                // Показываем абсолютно все разделы сплошным текстом
                allBlocks.forEach(block => block.style.display = 'block');
            } else {
                // Скрываем всё, кроме выбранного блока
                allBlocks.forEach(block => {
                    if (block.id === target) {
                        block.style.display = 'block';
                    } else {
                        block.style.display = 'none';
                    }
                });
            }
        });
    });

    // Изменение в переключении верхних табов (чтобы сбрасывать фильтр при возврате на вкладку теории)
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(b => b.classList.remove('active-nav'));

            btn.classList.add('active-nav');
            const target = btn.getAttribute('data-target');

            if (target === 'theory-section') {
                // При клике на верхнюю вкладку "Теория" показываем снова все разделы
                document.querySelectorAll('.physics-block').forEach(block => block.style.display = 'block');
                const allItem = document.querySelector('.category-item[data-target="all-blocks"]');
                if (allItem) allItem.classList.add('active');
            }

            if (target === 'learned-section') renderLearnedList();
            if (target === 'important-section') renderImportantList();
            if (target === 'stats-section') renderStatsAndAchievements();

            showSection(target);
        });
    });


    // Переключение верхних табов
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

    // Открытие модального окна с конспектом
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('advanced-btn')) {
            currentOpenTemplateId = e.target.getAttribute('data-depth');
            const template = document.getElementById(currentOpenTemplateId);

            if (template) {
                modalBody.innerHTML = '';
                modalBody.appendChild(template.content.cloneNode(true));

                if (learnedThemes.includes(currentOpenTemplateId)) {
                    markLearnedBtn.innerText = 'Изучено ✓';
                    markLearnedBtn.classList.add('completed');
                    markLearnedBtn.disabled = true;
                } else {
                    markLearnedBtn.innerText = 'Отметить изученным';
                    markLearnedBtn.classList.remove('completed');
                    markLearnedBtn.disabled = false;
                }
                modalOverlay.classList.add('open');
            }
        }
    });
    // Кнопка "Отметить изученным" в модалке
    if (markLearnedBtn) {
        markLearnedBtn.addEventListener('click', () => {
            if (currentOpenTemplateId && !learnedThemes.includes(currentOpenTemplateId)) {
                learnedThemes.push(currentOpenTemplateId);
                localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));

                markLearnedBtn.innerText = 'Изучено ✓';
                markLearnedBtn.classList.add('completed');
                markLearnedBtn.disabled = true;

                checkAndUnlockAchievement('first-step', "🚀 Получено достижение: Первый шаг!");
                if (learnedThemes.length === 3) {
                    checkAndUnlockAchievement('phys-master', "⚛️ Получено достижение: Архивариус!");
                }

                sessionLearnCount++;
                if (sessionLearnCount % 2 === 0) {
                    queueToast(funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)], false);
                }
                sessionLearnCount++;
                if (sessionLearnCount >= 2) {
                    checkAndUnlockAchievement('speed-demon', "⚡ Получено достижение: Спидраннер!");
                }
            }
        });
    }

    // Закрытие модального окна
    const closeModal = () => { if (modalOverlay) modalOverlay.classList.remove('open'); };
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Уведомления (системная очередь)
    function queueToast(text, isAchievement = false) {
        toastQueue.push({ text, isAchievement });
        processToastQueue();
    }

    function processToastQueue() {
        if (isToastProcessing || toastQueue.length === 0) return;
        isToastProcessing = true;

        const currentToast = toastQueue.shift();
        const container = document.getElementById('toast-container');
        if (!container) return;
        
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

    // Добавление формул в Избранное ("!")
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('important-toggle')) {
            const card = e.target.closest('.card');
            if (!card) return;

            const formulaId = card.getAttribute('data-formula-id');

            if (importantFormulas.includes(formulaId)) {
                importantFormulas = importantFormulas.filter(id => id !== formulaId);
                document.querySelectorAll(`.card[data-formula-id="${formulaId}"] .important-toggle`).forEach(btn => {
                    btn.classList.remove('active');
                });
            } else {
                importantFormulas.push(formulaId);
                document.querySelectorAll(`.card[data-formula-id="${formulaId}"] .important-toggle`).forEach(btn => {
                    btn.classList.add('active');
                });
                checkAndUnlockAchievement('formula-fan', "⭐ Получено достижение: Знаток формул!");
                // Проверяем, совпадает ли количество избранных формул с общим количеством карточек на сайте
                const totalCardsOnSite = document.querySelectorAll('.content-section:not(#important-section) .card').length;
                if (importantFormulas.length === totalCardsOnSite) {
                    checkAndUnlockAchievement('collector-pro', "👑 Получено достижение: Супер-коллекционер!");
                }

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
            if (importantFormulas.includes(id) && btn) {
                btn.classList.add('active');
            }
        });
    }

    // Рендеринг статистики наград (Динамический подсчет)
    function renderStatsAndAchievements() {
        // Находим все теги <template>, которые содержат подробные конспекты
        const templates = document.querySelectorAll('template');
        const totalThemes = templates.length > 0 ? templates.length : 3; // Защита от деления на 0
        
        const learnedCount = learnedThemes.length;
        const percentage = (learnedCount / totalThemes) * 100;
        
        const strokeDashOffset = 251.2 - (251.2 * percentage) / 100;

        const chartContainer = document.getElementById('pie-chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" stroke-width="12"/>
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3498db" stroke-width="12"
                        stroke-dasharray="251.2" stroke-dashoffset="${strokeDashOffset}"
                        transform="rotate(-90 50 50)" stroke-linecap="round" style="transition: stroke-dashoffset 0.5s ease;"/>
                </svg>
            `;
        }

        const counterText = document.getElementById('chartCounterText');
        if (counterText) {
            counterText.innerText = `Изучено: ${learnedCount} из ${totalThemes} разделов`;
        }

        document.querySelectorAll('.pedestal-card').forEach(card => {
            const achId = card.getAttribute('data-ach-id');
            if (unlockedAchievements.includes(achId)) {
                card.classList.add('unlocked');
            } else {
                card.classList.remove('unlocked');
            }
        });
    }

    // Логика всплывающих подсказок достижений
    document.querySelectorAll('.pedestal-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = card.classList.contains('open');
            document.querySelectorAll('.pedestal-card').forEach(c => c.classList.remove('open'));
            if (!isOpen) {
                card.classList.add('open');
            }
        });
    });

    document.addEventListener('click', () => { 
        document.querySelectorAll('.pedestal-card').forEach(c => c.classList.remove('open')); 
    });

    // Рендеринг списка изученного
    function renderLearnedList() {
        const container = document.getElementById('learned-list-container');
        if (!container) return;
        container.innerHTML = '';
        if (learnedThemes.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; padding: 10px 0;">Вы пока не отметили ни одной темы как изученную.</p>';
            return;
        }
        learnedThemes.forEach(templateId => {
            const template = document.getElementById(templateId);
            if (template) {
                const tempDiv = document.createElement('div');
                tempDiv.appendChild(template.content.cloneNode(true));
                const titleText = tempDiv.querySelector('h2') ? tempDiv.querySelector('h2').innerText : "Конспект";
                const accordionItem = document.createElement('div');
                accordionItem.classList.add('accordion-item');
                accordionItem.innerHTML = `
                    <div class="accordion-header">${titleText} <span>▼</span></div>
                    <div class="accordion-content">
                        <div class="theory-text-wrapper"></div>
                        <button class="exclude-learned-btn" data-exclude-id="${templateId}">❌ Удалить из изученного</button>
                    </div>
                `;
                accordionItem.querySelector('.theory-text-wrapper').appendChild(tempDiv);
                container.appendChild(accordionItem);
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
            renderStatsAndAchievements();
        }
    });

    // Рендеринг списка избранного
    function renderImportantList() {
        const container = document.getElementById('important-list-container');
        if (!container) return;
        container.innerHTML = '';
        if (importantFormulas.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; padding: 10px 0;">Нет формул, отмеченных как важные.</p>';
            return;
        }
        importantFormulas.forEach(formulaId => {
            const originalCard = document.querySelector(`.content-section:not(#important-section) .card[data-formula-id="${formulaId}"]`);
            if (originalCard) {
                const clonedCard = originalCard.cloneNode(true);
                container.appendChild(clonedCard);
            }
        });
    }
});
