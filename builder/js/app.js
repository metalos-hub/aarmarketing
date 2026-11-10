// ═══ FIXED PARAMS (ValueTrack Tags) ═══
const FIXED_PARAMS = [
  ['utm_source',       'google'],
  ['utm_medium',       'cpc'],
  ['utm_id',           '{campaignid}'],
  ['utm_term',         '{keyword}'],
  ['utm_content',      '{creative}'],
  ['campaign_id',      '{campaignid}'],
  ['adgroup_id',       '{adgroupid}'],
  ['ad_id',            '{creative}'],
  ['keyword',          '{keyword}'],
  ['matchtype',        '{matchtype}'],
  ['network',          '{network}'],
  ['device',           '{device}'],
  ['devicemodel',      '{devicemodel}'],
  ['placement',        '{placement}'],
  ['targetid',         '{targetid}'],
  ['loc_physical_ms',  '{loc_physical_ms}'],
  ['loc_interest_ms',  '{loc_interest_ms}'],
];

// ═══ CAMPAIGN NAME HANDLER ═══
function handleCampaignInput(el) {
  const pos = el.selectionStart;
  const before = el.value;
  const after = before.replace(/ /g, '-');
  if (before !== after) {
    el.value = after;
    el.setSelectionRange(pos, pos);
  }
  buildUrl();
}

// ═══ BUILD URL ═══
function buildUrl() {
  const baseUrl  = document.getElementById('websiteUrl').value.trim();
  const campaign = document.getElementById('campaignName').value.trim();
  const output   = document.getElementById('generatedUrl');

  if (!baseUrl) {
    output.value = '';
    document.getElementById('urlLength').textContent = '0';
    return;
  }

  const params = new URLSearchParams();
  params.append('utm_source',    'google');
  params.append('utm_medium',    'cpc');
  params.append('utm_campaign',  campaign || 'minha-campanha');
  FIXED_PARAMS.slice(2).forEach(([k, v]) => params.append(k, v));

  // Keep ValueTrack tags un-encoded (curly braces)
  const rawParams = [...params.entries()]
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
    .replace(/%7B/gi, '{')
    .replace(/%7D/gi, '}');

  // Handle existing query string in baseUrl
  const separator = baseUrl.includes('?') ? '&' : '?';
  output.value = baseUrl + separator + rawParams;

  document.getElementById('urlLength').textContent = output.value.length;
}

// ═══ COPY FULL URL ═══
function copyUrl() {
  const url = document.getElementById('generatedUrl').value;
  if (!url) { showToast('⚠️ Preencha a URL do site primeiro.'); return; }
  navigator.clipboard.writeText(url)
    .then(() => showToast('✅ URL completa copiada!'))
    .catch(() => {
      document.getElementById('generatedUrl').select();
      document.execCommand('copy');
      showToast('✅ URL copiada!');
    });
}

// ═══ COPY ONLY PARAMS ═══
function copyShort() {
  const url = document.getElementById('generatedUrl').value;
  if (!url) { showToast('⚠️ Preencha a URL do site primeiro.'); return; }
  const idx = url.indexOf('?');
  const params = idx !== -1 ? url.substring(idx + 1) : '';
  if (!params) { showToast('⚠️ Nenhum parâmetro para copiar.'); return; }
  navigator.clipboard.writeText('?' + params)
    .then(() => showToast('✅ Parâmetros copiados!'))
    .catch(() => showToast('❌ Falha ao copiar.'));
}

// ═══ OPEN URL ═══
function openUrl() {
  const url = document.getElementById('generatedUrl').value;
  if (!url) { showToast('⚠️ Preencha a URL do site primeiro.'); return; }
  window.open(url, '_blank', 'noopener');
}

// ═══ RESET FORM ═══
function resetForm() {
  document.getElementById('websiteUrl').value  = '';
  document.getElementById('campaignName').value = 'search-cascavel-locacao-aluguel-comercial';
  document.getElementById('generatedUrl').value = '';
  document.getElementById('urlLength').textContent = '0';
  showToast('🗑️ Formulário limpo!');
}

// ═══ COLLAPSIBLE SECTIONS ═══
function toggleSection(btn) {
  const content = btn.nextElementSibling;
  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !isExpanded);
  btn.classList.toggle('collapsed');
  content.classList.toggle('collapsed');
}

// ═══ TOAST NOTIFICATION ═══
let toastTimer;
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ═══ INIT ═══
document.addEventListener('DOMContentLoaded', () => {
  buildUrl();
});

