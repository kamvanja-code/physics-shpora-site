document.addEventListener('DOMContentLoaded', () => {
    const categoryItems = document.querySelectorAll('.category-item');
    const contentSections = document.querySelectorAll('.content-section');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // 1. Меняем активную категорию в левом меню
            categoryItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            // 2. Скрываем все правые секции
            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            // 3. Показываем нужную секцию с микро-задержкой для красивого эффекта анимации
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                setTimeout(() => {
                    targetSection.classList.add('active');
                }, 50);
            }
        });
    });
});
