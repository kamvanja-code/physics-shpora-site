document.addEventListener('DOMContentLoaded', () => {
    // Работа с памятью браузера (LocalStorage)
    let learnedThemes = JSON.parse(localStorage.getItem('learnedThemes')) || [];
    let importantFormulas = JSON.parse(localStorage.getItem('importantFormulas')) || [];

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

    // Закрытие меню при клике по любому свободному месту на экране
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== menuToggleBtn) {
            sidebar.classList.remove('open');
        }
    });

    // Общая функция переключения секций контента
    function showSection(targetId) {
        contentSections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        sidebar.classList.remove('open');
    }

    // Обработка кликов по левому меню (Разделы физики)
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(btn => btn.classList.remove('active-nav'));

            item.classList.add('active');
            showSection(item.getAttribute('data-target'));
        });
    });

    // Обработка кликов по верхним кнопкам хедера (Изученное, Важное)
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

                // Проверяем статус "Изучено" для текущего шаблона
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

    // Клик на кнопку "Отметить изученным" внутри модалки
    markLearnedBtn.addEventListener('click', () => {
        if (currentOpenTemplateId && !learnedThemes.includes(currentOpenTemplateId)) {
            learnedThemes.push(currentOpenTemplateId);
            localStorage.setItem('learnedThemes', JSON.stringify(learnedThemes));

            markLearnedBtn.innerText = 'Изучено ✓';
            markLearnedBtn.classList.add('completed');
            markLearnedBtn.disabled = true;
        }
    });

    // Закрытие модального окна
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
                // Если уже есть — удаляем
                importantFormulas = importantFormulas.filter(id => id !== formulaId);
                document.querySelectorAll(`.card[data-formula-id="${formulaId}"] .important-toggle`).forEach(btn => {
                    btn.classList.remove('active');
                });
            } else {
                // Если нет — добавляем
                importantFormulas.push(formulaId);
                document.querySelectorAll(`.card[data-formula-id="${formulaId}"] .important-toggle`).forEach(btn => {
                    btn.classList.add('active');
                });
            }
            localStorage.setItem('importantFormulas', JSON.stringify(importantFormulas));

            // Живое обновление списка на вкладке "Важное" при удалении карточки
            const currentActiveNav = document.querySelector('.nav-btn.active-nav');
            if (currentActiveNav && currentActiveNav.getAttribute('data-target') === 'important-section') {
                renderImportantList();
            }
        }
    });

    // Подсветка оранжевым кнопок "!" для сохраненных формул при обновлении страницы
    function syncUIWithStorage() {
        document.querySelectorAll('.card').forEach(card => {
            const id = card.getAttribute('data-formula-id');
            const btn = card.querySelector('.important-toggle');
            if (importantFormulas.includes(id) && btn) {
                btn.classList.add('active');
            }
        });
    }

    // 4. ГЕНЕРАЦИЯ СПИСКА ИЗУЧЕННОГО (АККОРДЕОН)
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
                    <div class="accordion-content"></div>
                `;

                accordionItem.querySelector('.accordion-content').appendChild(tempDiv);
                container.appendChild(accordionItem);

                // Событие раскрытия аккордеона по клику
                accordionItem.querySelector('.accordion-header').addEventListener('click', () => {
                    accordionItem.classList.toggle('open');
                });
            }
        });
    }

    // 5. ГЕНЕРАЦИЯ СПИСКА ВАЖНОГО
    function renderImportantList() {
        const container = document.getElementById('important-list-container');
        container.innerHTML = '';

        if (importantFormulas.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; padding: 10px 0;">Нет формул, отмеченных как важные.</p>';
            return;
        }

        importantFormulas.forEach(formulaId => {
            // Ищем шаблон карточки на скрытых страницах тем
            const originalCard = document.querySelector(`.content-section:not(#important-section) .card[data-formula-id="${formulaId}"]`);
            if (originalCard) {
                const clonedCard = originalCard.cloneNode(true);
                container.appendChild(clonedCard);
            }
        });
    }
});
