const CHARSET = '0123456789';
const POSITIONS = 8;
const TOTAL_COMBINATIONS = CHARSET.length ** POSITIONS;

function generateItem(prefix, suffix) {
  let core = '';
  for (let i = 0; i < POSITIONS; i++) {
    core += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return prefix + core + suffix;
}

function duplicateProbability(combinations, draws) {
  if (draws <= 1) return 0;
  let p = 1;
  const limit = Math.min(draws, combinations);
  for (let i = 1; i < limit; i++) {
    p *= (combinations - i) / combinations;
  }
  return (1 - p) * 100;
}

function formatProb(p) {
  if (p < 0.0001) return '< 0.0001%';
  if (p >= 99.9999) return '~100%';
  return p.toPrecision(3) + '%';
}

function generate() {
  const prefix = document.getElementById('prefix').value;
  const suffix = document.getElementById('suffix').value;
  const count = Math.max(1, Math.min(100000, parseInt(document.getElementById('count').value, 10) || 1));

  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(generateItem(prefix, suffix));
  }

  // Render
  const dataEl = document.getElementById('data');
  dataEl.textContent = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'data-item';
    div.textContent = item;
    dataEl.appendChild(div);
  });

  // Stats
  document.getElementById('results-count').textContent = count.toLocaleString() + ' items';
  const prob = duplicateProbability(TOTAL_COMBINATIONS, count);
  document.getElementById('probability').textContent = 'Duplicate probability: ' + formatProb(prob);

  document.getElementById('results').hidden = false;
  resetCopyButton();
}

function resetCopyButton() {
  const label = document.getElementById('btn-copy-label');
  label.textContent = 'Copy All';
  document.getElementById('btn-copy').classList.remove('btn--copied');
}

function copyAll() {
  const items = [...document.querySelectorAll('.data-item')].map(el => el.textContent);
  navigator.clipboard.writeText(items.join('\n')).then(() => {
    const label = document.getElementById('btn-copy-label');
    const btn = document.getElementById('btn-copy');
    label.textContent = 'Copied!';
    btn.classList.add('btn--copied');
    setTimeout(resetCopyButton, 2000);
  });
}

document.getElementById('btn-generate').addEventListener('click', generate);
document.getElementById('btn-copy').addEventListener('click', copyAll);
