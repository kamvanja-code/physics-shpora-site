document.addEventListener('DOMContentLoaded', () => {
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const categoryItems = document.querySelectorAll('.category-item');
    const contentSections = document.querySelectorAll('.content-section');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');

    // 1. ОТКРЫТИЕ / ЗАКРЫТИЕ МЕНЮ (по кнопке)
    menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // 2. СМЕНА РАЗДЕЛОВ С АНИМАЦИЕЙ
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const currentActiveSection = document.querySelector('.content-section.active');
            const targetSection = document.getElementById(targetId);

            if (currentActiveSection === targetSection) return;

            categoryItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            if (currentActiveSection) {
                currentActiveSection.classList.remove('active');
                currentActiveSection.classList.add('leaving');

                setTimeout(() => {
                    currentActiveSection.classList.remove('leaving');
                    targetSection.classList.add('active');
                }, 250);
            } else {
                targetSection.classList.add('active');
            }

            // Закрываем меню после выбора темы, чтобы расширить область чтения
            sidebar.classList.remove('open');
        });
    });

    // 3. МОДАЛЬНОЕ ОКНО
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('advanced-btn')) {
            const templateId = e.target.getAttribute('data-depth');
            const template = document.getElementById(templateId);

            if (template) {
                modalBody.innerHTML = '';
                modalBody.appendChild(template.content.cloneNode(true));
                modalOverlay.classList.add('open');
            }
        }
    });

    const closeModal = () => modalOverlay.classList.remove('open');
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
});
