/* ==========================================================================
   Untitled.jpg (JPG) — Production Prototype Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Category Filtering for Monochromatic Grid
  const filterButtons = document.querySelectorAll('.filter-chip-btn');
  const gridCards = document.querySelectorAll('.grid-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter grid cards
      gridCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Handle card click to update the right essay reading panel dynamically
  gridCards.forEach(card => {
    card.addEventListener('click', () => {
      gridCards.forEach(c => c.classList.remove('hover-active'));
      card.classList.add('hover-active');

      const cardTitle = card.querySelector('.card-info-title')?.textContent;
      const targetTitle = document.querySelector('.essay-title-heavy');
      if (cardTitle && targetTitle) {
        targetTitle.textContent = cardTitle;
      }
    });
  });

  // Handle fullart bottom handle swipe/scroll click
  const swipeHandle = document.querySelector('.fullart-bottom-handle');
  if (swipeHandle) {
    swipeHandle.addEventListener('click', () => {
      document.querySelector('.grid-essay-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
