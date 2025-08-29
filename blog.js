(async function() {
  const container = document.getElementById('blog-list');
  if (!container) return;

  // Attempt to derive owner and repo from meta tags or current location
  let owner = 'bohamil';
  let repo = 'hanckneyconstruction';

  const metaOwner = document.querySelector('meta[name="github-owner"]')?.content;
  const metaRepo = document.querySelector('meta[name="github-repo"]')?.content;
  if (metaOwner) owner = metaOwner;
  if (metaRepo) repo = metaRepo;

  const hostname = window.location.hostname;
  if (hostname.endsWith('github.io')) {
    owner = hostname.split('.')[0];
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length) repo = pathParts[0];
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/blog`;

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error('Network error');
    const files = await resp.json();

    const posts = files.filter(f => f.name.endsWith('.html') && f.name !== 'post-template.html');

    const postsData = await Promise.all(posts.map(async file => {
      let date;
      const match = file.name.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) date = new Date(match[1]);

      let html = '';
      try {
        const postResp = await fetch(file.download_url);
        html = await postResp.text();
      } catch (e) {
        console.error('Failed to fetch post', file.name, e);
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      if (!date) {
        const timeEl = doc.querySelector('time[datetime]') || doc.querySelector('time');
        if (timeEl) {
          const dt = timeEl.getAttribute('datetime') || timeEl.textContent;
          if (dt) date = new Date(dt);
        }
      }
      if (!date || isNaN(date)) date = new Date(0);

      const title = doc.querySelector('h1')?.textContent.trim() || file.name.replace('.html', '');
      const imgEl = doc.querySelector('img');
      let imgSrc = imgEl ? imgEl.getAttribute('src') : '';
      if (imgSrc.startsWith('../')) imgSrc = imgSrc.replace('../', '');
      const excerpt = doc.querySelector('p')?.textContent.trim() || '';

      return { file, title, imgSrc, excerpt, date };
    }));

    postsData.sort((a, b) => b.date - a.date);

    postsData.forEach(({ file, title, imgSrc, excerpt, date }) => {
      const article = document.createElement('article');
      article.className = 'col-md-6 col-lg-4 mb-4';

      const link = document.createElement('a');
      link.href = `blog/${file.name}`;
      link.className = 'text-decoration-none text-dark';

      const card = document.createElement('div');
      card.className = 'card h-100 shadow-sm border-0';

      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'card-img-top';
        img.alt = '';
        card.appendChild(img);
      }

      const body = document.createElement('div');
      body.className = 'card-body';

      if (date.getTime()) {
        const p = document.createElement('p');
        p.className = 'text-muted small mb-1';
        p.textContent = `Posted ${date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
        body.appendChild(p);
      }

      const h3 = document.createElement('h3');
      h3.className = 'card-title';
      h3.textContent = title;
      body.appendChild(h3);

      if (excerpt) {
        const p = document.createElement('p');
        p.className = 'card-text';
        p.textContent = excerpt;
        body.appendChild(p);
      }

      card.appendChild(body);
      link.appendChild(card);
      article.appendChild(link);
      container.appendChild(article);
    });

    if (!postsData.length) {
      container.innerHTML = '<p>No posts available.</p>';
    }
  } catch (err) {
    console.error('Failed to load posts', err);
    container.innerHTML = '<p>No posts available.</p>';
  }
})();

