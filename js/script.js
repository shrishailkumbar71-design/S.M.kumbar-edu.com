const STORAGE_KEY = 'learnKumbarPosts';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPosts() {
  try {
    const posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return posts.map((post, index) => ({
      ...post,
      id: post.id || `${(post.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`
    }));
  } catch (error) {
    console.error('Unable to read posts', error);
    return [];
  }
}

function getLinkMarkup(post) {
  if (!post.link) return '';

  const link = escapeHtml(post.link);
  const normalizedLink = (post.link || '').toLowerCase();
  const isPdf = post.type === 'PDF' || normalizedLink.endsWith('.pdf') || normalizedLink.includes('.pdf?');
  const isVideo = post.type === 'Video' || normalizedLink.includes('youtube.com') || normalizedLink.includes('youtu.be') || normalizedLink.includes('.mp4') || normalizedLink.includes('.m3u8');
  const label = isPdf ? 'Download PDF' : isVideo ? 'Open Video' : 'Open Link';
  const attrs = isPdf
    ? `href="${link}" download`
    : `href="${link}" target="_blank" rel="noopener noreferrer"`;

  return `<p><a ${attrs}>${label}</a></p>`;
}

function savePosts(posts) {
  const normalized = posts.map((post, index) => ({
    ...post,
    id: post.id || `${(post.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('posts:updated'));
}

function renderPosts() {
  const updatesList = document.getElementById('latestUpdatesList');
  if (!updatesList) return;

  const posts = getPosts();
  updatesList.innerHTML = '';

  if (posts.length === 0) {
    updatesList.innerHTML = '<div class="card"><h3>No updates yet</h3><p>Admin posts will appear here.</p></div>';
    return;
  }

  posts.slice().reverse().forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card';
    const linkHtml = getLinkMarkup(post);
    card.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p><strong>${escapeHtml(post.type)} • ${escapeHtml(post.subject || 'General')}</strong></p>
      <p>${escapeHtml(post.description)}</p>
      ${linkHtml}
    `;
    updatesList.appendChild(card);
  });
}

function renderSubjectPosts(subject) {
  const container = document.getElementById('subjectPostsList');
  if (!container) return;

  const posts = getPosts()
    .filter((post) => (post.subject || 'General') === subject && post.type !== 'Update');

  container.innerHTML = '';

  if (posts.length === 0) {
    container.innerHTML = '<div class="card"><h3>No posts yet</h3><p>Admin-created notes, PDFs, and videos for this subject will appear here.</p></div>';
    return;
  }

  posts.slice().reverse().forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card';
    const linkHtml = getLinkMarkup(post);
    card.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p><strong>${escapeHtml(post.type)}</strong></p>
      <p>${escapeHtml(post.description)}</p>
      ${linkHtml}
    `;
    container.appendChild(card);
  });
}

function renderTypePosts(type, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const posts = getPosts().filter((post) => post.type === type);
  container.innerHTML = '';

  if (posts.length === 0) {
    const emptyText = type === 'PDF' ? 'No PDF posts added yet.' : 'No video posts added yet.';
    container.innerHTML = `<div class="card"><h3>No posts yet</h3><p>${emptyText}</p></div>`;
    return;
  }

  posts.slice().reverse().forEach((post) => {
    const card = document.createElement('div');
    card.className = 'card';
    const linkHtml = getLinkMarkup(post);
    card.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p><strong>${escapeHtml(post.type)} • ${escapeHtml(post.subject || 'General')}</strong></p>
      <p>${escapeHtml(post.description)}</p>
      ${linkHtml}
    `;
    container.appendChild(card);
  });
}

function renderAdminPosts() {
  const container = document.getElementById('adminPostsList');
  if (!container) return;

  const posts = getPosts();
  container.innerHTML = '';

  if (posts.length === 0) {
    container.innerHTML = '<div class="card admin-post-card"><h3>No posts yet</h3><p>Create your first post from the form above.</p></div>';
    return;
  }

  posts.slice().reverse().forEach((post, index) => {
    const card = document.createElement('div');
    card.className = 'card admin-post-card';
    const postId = post.id || `${post.title || 'post'}-${index + 1}`;
    card.innerHTML = `
      <h3>${escapeHtml(post.title)}</h3>
      <p><strong>${escapeHtml(post.type)} • ${escapeHtml(post.subject || 'General')}</strong></p>
      <p>${escapeHtml(post.description)}</p>
      <div class="admin-actions">
        <button type="button" class="btn edit-post-btn" data-id="${escapeHtml(postId)}">Edit</button>
        <button type="button" class="btn delete-post-btn" data-id="${escapeHtml(postId)}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function resetPostForm() {
  const form = document.getElementById('postForm');
  if (form) form.reset();
  const postIdField = document.getElementById('postId');
  if (postIdField) postIdField.value = '';
  const submitButton = document.getElementById('submitPostBtn');
  if (submitButton) submitButton.textContent = 'Publish';
  const cancelButton = document.getElementById('cancelEditBtn');
  if (cancelButton) cancelButton.style.display = 'none';
}

function populatePostForm(post) {
  const postIdField = document.getElementById('postId');
  const titleField = document.getElementById('postTitle');
  const typeField = document.getElementById('postType');
  const subjectField = document.getElementById('postSubject');
  const linkField = document.getElementById('postLink');
  const descriptionField = document.getElementById('postDescription');
  const submitButton = document.getElementById('submitPostBtn');
  const cancelButton = document.getElementById('cancelEditBtn');

  if (postIdField) postIdField.value = post.id || '';
  if (titleField) titleField.value = post.title || '';
  if (typeField) typeField.value = post.type || 'Note';
  if (subjectField) subjectField.value = post.subject || 'English';
  if (linkField) linkField.value = post.link || '';
  if (descriptionField) descriptionField.value = post.description || '';
  if (submitButton) submitButton.textContent = 'Update Post';
  if (cancelButton) cancelButton.style.display = 'inline-block';
}

function refreshContentViews() {
  renderPosts();

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const subjectPageMap = {
    'english.html': 'English',
    'kannada.html': 'Kannada',
    'hindi.html': 'Hindi',
    'socialscience.html': 'Social Science'
  };
  const currentSubject = subjectPageMap[currentPage];
  if (currentSubject) {
    renderSubjectPosts(currentSubject);
  }

  if (currentPage === 'pdfs.html') {
    renderTypePosts('PDF', 'pdfsContentList');
  }
  if (currentPage === 'videos.html') {
    renderTypePosts('Video', 'videosContentList');
  }

  renderAdminPosts();
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

  refreshContentViews();

  const adminCreateBtn = document.getElementById('adminCreateBtn');
  if (adminCreateBtn) {
    adminCreateBtn.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'admin.html';
    });
  }

  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = document.getElementById('postTitle').value.trim();
      const type = document.getElementById('postType').value;
      const subject = document.getElementById('postSubject').value;
      const link = document.getElementById('postLink').value.trim();
      const description = document.getElementById('postDescription').value.trim();

      if (!title || !description) {
        alert('Please enter both title and description.');
        return;
      }

      const posts = getPosts();
      const editingId = document.getElementById('postId').value;
      const newPost = {
        id: editingId || `post-${Date.now()}`,
        title,
        type,
        subject,
        link,
        description,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        const index = posts.findIndex((post) => post.id === editingId);
        if (index >= 0) {
          posts[index] = {
            ...posts[index],
            ...newPost,
            createdAt: posts[index].createdAt || new Date().toISOString()
          };
        }
      } else {
        posts.push(newPost);
      }

      savePosts(posts);
      resetPostForm();
      alert(editingId ? 'Post updated successfully.' : 'Post published successfully.');
    });
  }

  const adminPostsList = document.getElementById('adminPostsList');
  if (adminPostsList) {
    adminPostsList.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const postId = button.getAttribute('data-id');
      const posts = getPosts();
      const post = posts.find((item) => item.id === postId);

      if (!post) return;

      if (button.classList.contains('edit-post-btn')) {
        populatePostForm(post);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      if (button.classList.contains('delete-post-btn')) {
        const confirmed = window.confirm(`Delete "${post.title}"?`);
        if (!confirmed) return;
        const remainingPosts = posts.filter((item) => item.id !== postId);
        savePosts(remainingPosts);
        resetPostForm();
        alert('Post deleted successfully.');
      }
    });
  }

  const cancelEditButton = document.getElementById('cancelEditBtn');
  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', resetPostForm);
  }

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      refreshContentViews();
    }
  });

  window.addEventListener('posts:updated', refreshContentViews);

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
