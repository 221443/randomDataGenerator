const CHARSET = '0123456789';
const MAX_COUNT = 100000;
const MIN_LENGTH = 1;
const MAX_LENGTH = 24;
const YIELD_EVERY = 2000;

const elements = {
  prefix: document.getElementById('prefix'),
  length: document.getElementById('length'),
  count: document.getElementById('count'),
  suffix: document.getElementById('suffix'),
  generateButton: document.getElementById('btn-generate'),
  generateLabel: document.getElementById('btn-generate-label'),
  copyButton: document.getElementById('btn-copy'),
  copyLabel: document.getElementById('btn-copy-label'),
  results: document.getElementById('results'),
  resultsCount: document.getElementById('results-count'),
  probability: document.getElementById('probability'),
  status: document.getElementById('status'),
  data: document.getElementById('data')
};

const state = {
  isGenerating: false,
  output: ''
};

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function getConfig() {
  const count = clampNumber(elements.count.value, 1, MAX_COUNT, 20);
  const length = clampNumber(elements.length.value, MIN_LENGTH, MAX_LENGTH, 8);

  elements.count.value = String(count);
  elements.length.value = String(length);

  return {
    prefix: elements.prefix.value,
    suffix: elements.suffix.value,
    count,
    length
  };
}

function getTotalCombinations(length) {
  return CHARSET.length ** length;
}

function generateItem(prefix, suffix, length) {
  let middle = '';
  for (let index = 0; index < length; index += 1) {
    middle += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return prefix + middle + suffix;
}

function duplicateProbability(combinations, draws) {
  if (draws <= 1) {
    return {
      probability: 0,
      logNoDuplicateProbability: 0,
      isEffectivelyCertain: false
    };
  }
  if (!Number.isFinite(combinations) || combinations <= 0) {
    return {
      probability: 0,
      logNoDuplicateProbability: 0,
      isEffectivelyCertain: false
    };
  }
  if (draws > combinations) {
    return {
      probability: 100,
      logNoDuplicateProbability: Number.NEGATIVE_INFINITY,
      isEffectivelyCertain: true
    };
  }

  let logNoDuplicateProbability = 0;
  for (let index = 0; index < draws; index += 1) {
    logNoDuplicateProbability += Math.log1p(-index / combinations);
  }

  const probability = -Math.expm1(logNoDuplicateProbability) * 100;
  return {
    probability,
    logNoDuplicateProbability,
    isEffectivelyCertain: logNoDuplicateProbability < Math.log(Number.EPSILON)
  };
}

function formatProbability(probabilityData) {
  if (probabilityData.probability === 0) {
    return '0%';
  }

  if (probabilityData.isEffectivelyCertain) {
    return '> 99.99999999999997%';
  }

  const preciseProbability = probabilityData.probability.toPrecision(15);
  if (preciseProbability.includes('e')) {
    return preciseProbability + '%';
  }

  return preciseProbability.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1') + '%';
}

function waitForFrame() {
  return new Promise(resolve => {
    window.requestAnimationFrame(() => resolve());
  });
}

function setGeneratingState(isGenerating) {
  state.isGenerating = isGenerating;
  elements.generateButton.disabled = isGenerating;
  elements.copyButton.disabled = isGenerating || !state.output;
  elements.generateLabel.textContent = isGenerating ? 'Generating...' : 'Generate';
}

function resetCopyButton() {
  elements.copyLabel.textContent = 'Copy All';
  elements.copyButton.classList.remove('btn--copied');
}

function setStatus(message) {
  elements.status.textContent = message;
}

async function generate() {
  if (state.isGenerating) {
    return;
  }

  const config = getConfig();
  const items = new Array(config.count);

  state.output = '';
  elements.results.hidden = false;
  elements.data.textContent = '';
  elements.resultsCount.textContent = config.count.toLocaleString() + ' items';
  elements.probability.textContent = 'Duplicate probability: calculating...';
  resetCopyButton();
  setGeneratingState(true);

  for (let start = 0; start < config.count; start += YIELD_EVERY) {
    const end = Math.min(start + YIELD_EVERY, config.count);

    for (let index = start; index < end; index += 1) {
      items[index] = generateItem(config.prefix, config.suffix, config.length);
    }

    setStatus('Generating ' + end.toLocaleString() + ' of ' + config.count.toLocaleString() + '...');

    if (end < config.count) {
      await waitForFrame();
    }
  }

  state.output = items.join('\n');
  elements.data.textContent = state.output;

  const combinations = getTotalCombinations(config.length);
  const probabilityData = duplicateProbability(combinations, config.count);
  elements.probability.textContent = 'Duplicate probability: ' + formatProbability(probabilityData);
  setStatus('Generated ' + config.count.toLocaleString() + ' items with a ' + config.length + '-digit middle part.');

  setGeneratingState(false);
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

async function copyAll() {
  if (!state.output) {
    return;
  }

  try {
    await navigator.clipboard.writeText(state.output);
  } catch (error) {
    fallbackCopy(state.output);
  }

  elements.copyLabel.textContent = 'Copied!';
  elements.copyButton.classList.add('btn--copied');
  setTimeout(resetCopyButton, 2000);
}

elements.generateButton.addEventListener('click', generate);
elements.copyButton.addEventListener('click', copyAll);
elements.copyButton.disabled = true;
setStatus('Choose your settings and click Generate.');
