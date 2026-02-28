const form = document.getElementById('scan-form');
const scanBtn = document.getElementById('scan-btn');
const loading = document.getElementById('loading');
const errorBox = document.getElementById('error');
const results = document.getElementById('results');

const seoScore = document.getElementById('seo-score');
const titleLength = document.getElementById('title-length');
const metaLength = document.getElementById('meta-length');
const headingCount = document.getElementById('heading-count');
const checks = document.getElementById('checks');
const issues = document.getElementById('issues');
const aiText = document.getElementById('ai-text');

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderList(el, items, emptyText) {
  if (!items || !items.length) {
    el.innerHTML = `<li>${emptyText}</li>`;
    return;
  }

  el.innerHTML = items
    .map((item) => {
      const cls = item.level === 'good' ? 'status-ok' : item.level === 'warning' ? 'status-warn' : 'status-bad';
      return `<li class="${cls}">${escapeHtml(item.message)}</li>`;
    })
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const url = String(formData.get('url') || '').trim();

  loading.classList.remove('hidden');
  errorBox.classList.add('hidden');
  results.classList.add('hidden');
  scanBtn.disabled = true;

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Scan failed');
    }

    seoScore.textContent = data.summary.seoScore;
    titleLength.textContent = data.summary.titleLength;
    metaLength.textContent = data.summary.metaDescriptionLength;
    headingCount.textContent = `${data.summary.h1Count} H1 / ${data.summary.h2Count} H2`;

    renderList(checks, data.checks, 'No checks available.');
    renderList(issues, data.issues, 'No major issues found.');
    aiText.textContent = data.aiRecommendation || 'No AI recommendation available.';

    results.classList.remove('hidden');
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove('hidden');
  } finally {
    loading.classList.add('hidden');
    scanBtn.disabled = false;
  }
});
