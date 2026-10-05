document.addEventListener('DOMContentLoaded', () => {
    // База данных в LocalStorage
    let learnedThemes = JSON.parse(localStorage.getItem('learnedThemes')) || [];
    let importantFormulas = JSON.parse(localStorage.getItem('importantFormulas')) || [];

    // Элементы навигации
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    // Элементы модалки
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');
    const markLearnedBtn = document.getElementById('markLearnedBtn');

    let currentOpenTemplateId = '';

    // Синхронизируем кнопки восклицательных знаков при старте
    syncUIWithStorage();

    // 1. УПРАВЛЕНИЕ БОКОВЫМ МЕНЮ
    menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    // Закрытие меню при клике в любое свободное место
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== menuToggleBtn) {
            sidebar.classList.remove('open');
        }
    });

    // 2. ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ СЕКЦИЙ (исправленная версия)
    function switchActiveSection(targetId) {
        contentSections.forEach(section => {
            section.classList.remove('active', 'leaving');
        });

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        sidebar.classList.remove('open');
    }

    // Клик по левому меню (категории физики)
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(btn => btn.classList.remove('active-nav'));

            item.classList.add('active');
            const target = item.getAttribute('data-target');
            switchActiveSection(target);
        });
    });

    // Клик по верхним кнопкам хедера ("Изученное", "Важное")
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryItems.forEach(el => el.classList.remove('active'));
            navButtons.forEach(b => b.classList.remove('active-nav'));

            btn.classList.add('active-nav');
            const target = btn.getAttribute('data-target');

            if (target === 'learned-section') renderLearnedList();
            if (target === 'important-section') renderImportantList();

            switchActiveSection(target);
        });
    });

    // 3. ОТКРЫТИЕ МОДАЛКИ (УГЛУБЛЕННОЕ ИЗУЧЕНИЕ) — Глобальный перехватчик клика
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('advanced-btn')) {
            e.preventDefault();
            currentOpenTemplateId = e.target.getAttribute('data-depth');
            const template = document.getElementById(currentOpenTemplateId);

            if (template) {
                modalBody.innerHTML = '';
                modalBody.appendChild(template.content.cloneNode(true));

                // Проверяем, изучено ли уже
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

    // Нажатие кнопки "Отметить изученным" в модалке
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

    // 4. ДОБАВЛЕНИЕ ФОРМУЛ В ВАЖНОЕ
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('important-toggle')) {
            const card = e.target.closest('.card');
            if (!card) return;

            const formulaId = card.getAttribute('data-formula-id');

            if (importantFormulas.includes(formulaId)) {
                importantFormulas = importantFormulas.filter(id => id !== formulaId);
                // Находим все копии этой кнопки на экране и гасим их оранжевый цвет
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

            // Если мы находимся на вкладке "Важное", сразу обновляем список при удалении элемента
            const activeNavBtn = document.querySelector('.nav-btn.active-nav');
            if (activeNavBtn && activeNavBtn.getAttribute('data-target') === 'important-section') {
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

    // 5. РЕНДЕРИНГ СПИСКА ИЗУЧЕННОГО (АККОРДЕОН)
    function renderLearnedList() {
        const container = document.getElementById('learned-list-container');
        container.innerHTML = '';

        if (learnedThemes.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; padding: 10px;">Вы пока не отметили ни одной темы.</p>';
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
                    <div class="accordion-content"></div>
                `;

                accordionItem.querySelector('.accordion-content').appendChild(tempDiv);
                container.appendChild(accordionItem);

                accordionItem.querySelector('.accordion-header').addEventListener('click', () => {
                    accordionItem.classList.toggle('open');
                });
            }
        });
    }

    // 6. РЕНДЕРИНГ СПИСКА ВАЖНОГО
    function renderImportantList() {
        const container = document.getElementById('important-list-container');
        container.innerHTML = '';

        if (importantFormulas.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; padding: 10px;">Нет формул, отмеченных как важные.</p>';
            return;
        }

        // Чтобы найти карточки, ищем оригиналы в шаблонах или скрытых секциях
        importantFormulas.forEach(formulaId => {
            const originalCard = document.querySelector(`.content-section:not(#important-section) .card[data-formula-id="${formulaId}"]`);
            if (originalCard) {
                const clonedCard = originalCard.cloneNode(true);
                // Делаем так, чтобы кнопку "!" можно было нажать и в списке "Важное" для удаления
                container.appendChild(clonedCard);
            }
        });
    }
});
