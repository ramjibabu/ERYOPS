/**
 * ERYOPS ACADEMY - INTERACTIVE TECHNOLOGY MATRIX FILTER
 */

(function () {
  'use strict';

  const filterButtons = document.querySelectorAll('.filter-btn');
  const techCards = document.querySelectorAll('.tech-card');

  if (filterButtons.length > 0 && techCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active class
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterCategory = btn.getAttribute('data-filter');

        techCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');

          if (filterCategory === 'all' || cardCategory === filterCategory) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }
})();
