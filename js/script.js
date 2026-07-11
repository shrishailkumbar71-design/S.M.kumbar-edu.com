const STORAGE_KEY = 'learnKumbarPosts';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPosts() {
  const updatesList = document.getElementById('latestUpdatesList');
  if (!updatesList) return;

  const posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  updatesList.innerHTML = '';

  if (posts.length === 0) {
    updatesList.innerHTML = '<div class="card"><h3>No updates yet</h3><p>Admin posts will appear here.</p></div>';
    return;
  }

  posts.slice().reverse().forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p><strong>${escapeHtml(post.type)}</strong></p>
      <p>${escapeHtml(post.description)}</p>
    `;
    updatesList.appendChild(card);
  });
}

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

  renderPosts();

  const adminCreateBtn = document.getElementById('adminCreateBtn');
  if (adminCreateBtn) {
    adminCreateBtn.addEventListener('click', (event) => {
      event.preventDefault();
      const password = prompt('Enter admin password:');
      if (password === 'learnwithkumbar') {
        window.location.href = 'admin.html';
      } else if (password) {
        alert('Wrong password');
      }
    });
  }

  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = document.getElementById('postTitle').value.trim();
      const type = document.getElementById('postType').value;
      const description = document.getElementById('postDescription').value.trim();

      if (!title || !description) {
        alert('Please enter both title and description.');
        return;
      }

      const posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      posts.push({ title, type, description, createdAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      alert('Post published successfully.');
      window.location.href = 'index.html';
    });
  }

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
