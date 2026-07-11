document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.endsWith(currentPage)) {
      link.classList.add('active');
    }
  });

  // Dark Mode Toggle
  const darkButton = document.createElement('button');
  darkButton.innerHTML = '🌙';
  darkButton.setAttribute('aria-label', 'Toggle dark mode');
  darkButton.style.position = 'fixed';
  darkButton.style.bottom = '20px';
  darkButton.style.right = '20px';
  darkButton.style.padding = '12px';
  darkButton.style.border = 'none';
  darkButton.style.borderRadius = '50%';
  darkButton.style.cursor = 'pointer';
  darkButton.style.fontSize = '20px';
  darkButton.style.background = '#0d6efd';
  darkButton.style.color = '#fff';
  darkButton.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
  document.body.appendChild(darkButton);

  darkButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Scroll to Top Button
  const topButton = document.createElement('button');
  topButton.innerHTML = '⬆';
  topButton.setAttribute('aria-label', 'Scroll to top');
  topButton.style.position = 'fixed';
  topButton.style.bottom = '80px';
  topButton.style.right = '20px';
  topButton.style.padding = '12px';
  topButton.style.border = 'none';
  topButton.style.borderRadius = '50%';
  topButton.style.cursor = 'pointer';
  topButton.style.display = 'none';
  topButton.style.background = '#198754';
  topButton.style.color = '#fff';
  topButton.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
  document.body.appendChild(topButton);

  window.addEventListener('scroll', () => {
    topButton.style.display = window.scrollY > 200 ? 'block' : 'none';
  });

  topButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  const searchBox = document.getElementById('searchBox');

  if (searchBox) {
    searchBox.addEventListener('keyup', function () {
      const value = this.value.toLowerCase();
      document.querySelectorAll('.card').forEach((card) => {
        card.style.display = card.innerText.toLowerCase().includes(value) ? 'inline-block' : 'none';
      });
    });
  }

  // Fade-in animation
  const cards = document.querySelectorAll('.card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = '0.6s';
    observer.observe(card);
  });
});
