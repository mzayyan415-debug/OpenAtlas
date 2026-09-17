const resources = [
  { name: 'Obsidian', category: 'Productivity', icon: 'O', url: 'https://obsidian.md', description: 'A private, powerful workspace for notes, knowledge, and thinking systems.' },
  { name: 'Figma Community', category: 'Design', icon: 'F', url: 'https://figma.com/community', description: 'Templates, plugins, and design inspiration from the community.' },
  { name: 'freeCodeCamp', category: 'Learning', icon: 'C', url: 'https://freecodecamp.org', description: 'Hands-on coding education with real projects and free pathways.' },
  { name: 'MDN Web Docs', category: 'Open tools', icon: 'M', url: 'https://developer.mozilla.org', description: 'Authoritative documentation for web standards and developer APIs.' },
  { name: 'Notion', category: 'Productivity', icon: 'N', url: 'https://notion.so', description: 'A flexible workspace for tasks, research, and connected knowledge.' },
  { name: 'Khan Academy', category: 'Learning', icon: 'K', url: 'https://khanacademy.org', description: 'Free world-class education built for self-directed learners.' },
  { name: 'Perplexity', category: 'AI', icon: 'P', url: 'https://perplexity.ai', description: 'A research-first AI assistant for finding and summarizing useful information.' },
  { name: 'Excalidraw', category: 'Open tools', icon: 'E', url: 'https://excalidraw.com', description: 'A quick visual collaboration tool for diagrams and idea mapping.' }
];

const toast = document.getElementById('toast');
const resourceGrid = document.getElementById('resourceGrid');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function renderResources() {
  const query = searchInput.value.toLowerCase();
  const category = filterCategory.value;

  const filtered = resources.filter((item) => {
    const matchesText = `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    return matchesText && matchesCategory;
  });

  resourceGrid.innerHTML = filtered.map((item) => `
    <article class="resource-card">
      <div class="resource-header">
        <div class="resource-icon">${item.icon}</div>
        <span>${item.category}</span>
      </div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="resource-meta">
        <span>Curated</span>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">Open ↗</a>
      </div>
    </article>
  `).join('');
}

searchInput.addEventListener('input', renderResources);
filterCategory.addEventListener('change', renderResources);
renderResources();

function startCheckout(provider, plan) {
  fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, plan })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        showToast(`${data.message}`);
        console.log('Checkout payload:', data.payment);
      } else {
        showToast('Checkout could not be created.');
      }
    })
    .catch(() => showToast('Payment request failed.'));
}

document.querySelectorAll('[data-open-checkout]').forEach((button) => {
  button.addEventListener('click', () => {
    const plan = button.dataset.openCheckout;
    const provider = plan.includes('momo') ? 'mtn_momo' : 'paypal';
    const normalizedPlan = plan.replace('-momo', '');
    startCheckout(provider, normalizedPlan);
  });
});

document.getElementById('resourceForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());

  fetch('/api/submit-resource', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      showToast(data.message || 'Submitted successfully.');
      form.reset();
    })
    .catch(() => showToast('The submission failed.'));
});
