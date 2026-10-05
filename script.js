document.addEventListener('DOMContentLoaded', () => {
    // Элементы меню
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const contentSections = document.querySelectorAll('.content-section');

    // Элементы модального окна
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');

    // 1. ЛОГИКА ВЫПАДАЮЩЕГО МЕНЮ
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Закрываем меню при клике по контенту (удобно для мобилок)
    document.querySelector('.content-area').addEventListener('click', () => {
        sidebar.classList.remove('open');
    });


    // 2. КРАСИВАЯ АНИМАЦИЯ СМЕНЫ РАЗДЕЛОВ
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const currentActiveSection = document.querySelector('.content-section.active');
            const targetSection = document.getElementById(targetId);

            // Если кликнули на уже открытый раздел — ничего не делаем
            if (currentActiveSection === targetSection) return;

            // Переключаем активный пункт в меню
            categoryItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            if (currentActiveSection) {
                // Запускаем анимацию исчезновения старого блока
                currentActiveSection.classList.remove('active');
                currentActiveSection.classList.add('leaving');

                // Ждем окончания анимации скрытия (300мс) перед показом нового блока
                setTimeout(() => {
                    currentActiveSection.classList.remove('leaving');

                    // Включаем новый блок
                    targetSection.classList.add('active');
                }, 250);
            } else {
                targetSection.classList.add('active');
            }

            // Закрываем меню после выбора, чтобы не мешало читать
            sidebar.classList.remove('open');
        });
    });


    // 3. ОТКРЫТИЕ КУРСА УГЛУБЛЕННОГО ИЗУЧЕНИЯ (МОДАЛКА)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('advanced-btn')) {
            const templateId = e.target.getAttribute('data-depth');
            const template = document.getElementById(templateId);

            if (template) {
                // Очищаем старый текст в модалке и копируем контент из тега <template>
                modalBody.innerHTML = '';
                modalBody.appendChild(template.content.cloneNode(true));

                // Показываем модалку
                modalOverlay.classList.add('open');
            }
        }
    });

    // Закрытие модалки
    const closeModal = () => modalOverlay.classList.remove('open');
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal(); // закрыть при клике на фон
    });
});
