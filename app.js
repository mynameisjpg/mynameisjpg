/* ==========================================================================
   Untitled.jpg (JPG) — Prototype Interactive Scripts
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Category Tab Filtering for the Monospace Log Table & Grid Items
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tableRows = document.querySelectorAll('.stream-row');
  const cardItems = document.querySelectorAll('.card-item');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Update active tab button style
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter Table Rows
      tableRows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');
        if (category === 'all' || rowCategory === category) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });

      // Filter Grid Cards if data-category exists
      cardItems.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (!cardCategory || category === 'all' || cardCategory === category) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Newsletter Form Handler
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        alert(`[UNTITLED.JPG DISPATCHES]\n\nThank you for subscribing (${input.value}). You will receive dispatches on AI perception & visual culture.`);
        input.value = '';
      }
    });
  });

  // Glitch effect enhancement on brand mark hover
  const brandMark = document.querySelector('.brand-mark');
  if (brandMark) {
    brandMark.addEventListener('mouseenter', () => {
      brandMark.style.letterSpacing = '-0.04em';
    });
    brandMark.addEventListener('mouseleave', () => {
      brandMark.style.letterSpacing = '-0.02em';
    });
  }
});
