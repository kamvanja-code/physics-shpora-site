document.addEventListener('DOMContentLoaded', () => {
    // Работа с памятью браузера (LocalStorage)
    let learnedThemes = JSON.parse(localStorage.getItem('learnedThemes')) || [];
    let importantFormulas = JSON.parse(localStorage.getItem('importantFormulas')) || [];

    // Счетчик изучений за текущую сессию пользователя (для каждого 2-го раза)
    let sessionLearnCount = 0;

    // Массив комичных мотивационных фраз
    const funnyQuotes = [
        "С большими знаниями приходит большая ответственность. Не сломай диван ею!",
        "Ого, теперь твой мозг весит на пару граммов больше. Осторожно при ходьбе!",
        "Физика — сила, а без неё ты... просто набор хаотично движущихся молекул.",
        "Ньютон гордился бы тобой. А теперь иди съешь яблоко 🍏",
        "Твоя ментальная энергия совершила полезную работу. КПД стремится к 100%!",
        "Осторожно! Уровень интеллекта зашкаливает, датчики зафиксировали аномалию!",
        "Поздравляем, ты только что уменьшил энтропию Вселенной на крошечную долю!"
    ];

    // Навигационные элементы
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    // Элементы управления модалкой
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');
    const markLearnedBtn = document.getElementById('markLearnedBtn');

    let currentOpenTemplateId = '';

    // Подсвечиваем сохраненные формулы при старте страницы
    syncUIWithStorage();

    // 1. ОТКРЫТИЕ И ЗАКРЫТИЕ МЕНЮ РАЗДЕЛОВ
    menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== menuToggleBtn) {
            sidebar.classList.remove('open');
        }
    });

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

            showSection(target);
        });
    });
    // 2. ОТКРЫТИЕ МОДАЛЬНОГО ОКНА (УГЛУБЛЕННОЕ ИЗУЧЕНИЕ)
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

    // КЛИК "ОТМЕТИТЬ ИЗУЧЕННЫМ" (+ КОНФЕТТИ + УВЕДОМЛЕНИЕ)
    markLearnedBtn.addEventListener('click', () => {
        if (currentOpenTemplateId && !learnedThemes.includes(currentOpenTemplateId)) {
            learnedThemes.push(currentOpenTemplateId);
            localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));

            markLearnedBtn.innerText = 'Изучено ✓';
            markLearnedBtn.classList.add('completed');
            markLearnedBtn.disabled = true;

            // Салют конфетти
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }

            // Срабатывание триггера на каждое второе изучение
            sessionLearnCount++;
            if (sessionLearnCount % 2 === 0) {
                showMotivationalToast();
            }
        }
    });

    // Функция генерации всплывающих цитат сверху экрана
    function showMotivationalToast() {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.classList.add('toast');

        const randomQuote = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
        toast.innerText = randomQuote;

        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }

    const closeModal = () => modalOverlay.classList.remove('open');
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    // 3. ДОБАВЛЕНИЕ / УДАЛЕНИЕ ИЗ ВАЖНОГО (КНОПКА "!")
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

    // 4. ГЕНЕРАЦИЯ СПИСКА ИЗУЧЕННОГО + ИСКЛЮЧЕНИЕ ИЗ СПИСКА
    function renderLearnedList() {
        const container = document.getElementById('learned-list-container');
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
                const titleText = tempDiv.querySelector('h2') ? tempDiv.querySelector('h2').innerText : "Подробный конспект";

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

                accordionItem.querySelector('.accordion-header').addEventListener('click', () => {
                    accordionItem.classList.toggle('open');
                });
            }
        });
    }

    // Исключение темы из изученного
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('exclude-learned-btn')) {
            const idToRemove = e.target.getAttribute('data-exclude-id');
            learnedThemes = learnedThemes.filter(id => id !== idToRemove);
            localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));
            renderLearnedList();
        }
    });

    // 5. ГЕНЕРАЦИЯ СПИСКА ВАЖНОГО
    function renderImportantList() {
        const container = document.getElementById('important-list-container');
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
