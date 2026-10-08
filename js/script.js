'use strict';

const CONFIG = Object.freeze({
  whatsappNumber: '5548999001340',
  // Inserir a URL pública da automação depois de configurada. Nunca inserir credenciais aqui.
  // A automação deve responder HTTP 2xx com JSON { "ok": true } após registrar a solicitação.
  webhookUrl: '',
  gtmId: ''
});

window.dataLayer = window.dataLayer || [];

function trackEvent(eventName, parameters = {}) {
  window.dataLayer.push({ event: eventName, ...parameters });
}

function loadGTM() {
  if (!CONFIG.gtmId || !/^GTM-[A-Z0-9]+$/i.test(CONFIG.gtmId)) return;
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CONFIG.gtmId)}`;
  document.head.appendChild(script);
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'];
  const current = {};

  keys.forEach((key) => {
    const value = params.get(key);
    if (value) current[key] = value;
  });

  try {
    if (Object.keys(current).length) {
      sessionStorage.setItem('ar_attribution', JSON.stringify(current));
    }
    return JSON.parse(sessionStorage.getItem('ar_attribution') || '{}');
  } catch {
    return current;
  }
}

const attribution = captureAttribution();
loadGTM();
trackEvent('page_view', { page_path: window.location.pathname, ...attribution });

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mainNav?.classList.toggle('is-open', open);
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Abrir menu');
  });
});

document.querySelectorAll('[data-cta]').forEach((button) => {
  button.addEventListener('click', () => trackEvent(`cta_${button.dataset.cta}_click`));
});

document.querySelectorAll('.faq-list details').forEach((item, index) => {
  item.addEventListener('toggle', () => {
    if (item.open) trackEvent('faq_open', { faq_index: index + 1 });
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll('[data-track-view]').forEach((section) => {
  if (!('IntersectionObserver' in window)) return;
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      trackEvent(section.dataset.trackView);
      observer.unobserve(section);
    });
  }, { threshold: 0.35 });
  sectionObserver.observe(section);
});

if (/^\d{10,15}$/.test(CONFIG.whatsappNumber)) {
  const message = 'Olá André! Vi seu site e gostaria de conversar sobre gestão de tráfego para minha empresa.';
  document.querySelectorAll('[data-whatsapp]').forEach((button) => {
    button.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    button.hidden = false;
    button.addEventListener('click', () => trackEvent('whatsapp_click', { placement: button.dataset.placement }));
  });
}

const form = document.querySelector('#lead-form');

if (form) {
  const steps = [...form.querySelectorAll('.form-step')];
  const stepLabel = form.querySelector('#step-label');
  const stepTitle = form.querySelector('#step-title');
  const progressBar = form.querySelector('#progress-bar');
  const previousButton = form.querySelector('#prev-step');
  const nextButton = form.querySelector('#next-step');
  const submitButton = form.querySelector('#submit-form');
  const errorMessage = form.querySelector('#form-error');
  const success = form.querySelector('#form-success');
  const formHead = form.querySelector('.form-head');
  const formActions = form.querySelector('.form-actions');
  const deliveryNote = form.querySelector('#delivery-note');
  const formHelp = form.querySelector('#form-help');
  const handoff = form.querySelector('#form-handoff');
  const handoffLink = form.querySelector('#form-whatsapp-link');
  const submitLabel = CONFIG.webhookUrl ? 'Solicitar análise ' : 'Preparar mensagem ';
  submitButton.firstChild.textContent = submitLabel;
  deliveryNote.textContent = CONFIG.webhookUrl
    ? 'Envie suas respostas para que André entre em contato sobre sua operação.'
    : 'Ao terminar, você poderá levar suas respostas para uma conversa no WhatsApp.';
  let currentStep = 0;
  let started = false;
  let submissionId = '';

  const stepTitles = [
    'Onde sua empresa anuncia?',
    'Qual é o objetivo principal?',
    'Qual é o investimento atual?',
    'Onde encontro sua empresa?',
    'Quem está falando?',
    'Como posso entrar em contato?'
  ];

  function clearError() {
    errorMessage.textContent = '';
    steps[currentStep]?.querySelectorAll('.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  }

  function showStep(index, direction = 'next') {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === currentStep));
    stepLabel.textContent = `Etapa ${currentStep + 1} de ${steps.length}`;
    stepTitle.textContent = stepTitles[currentStep];
    progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    previousButton.disabled = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    clearError();

    const focusTarget = steps[currentStep].querySelector('input:checked, input');
    if (direction === 'previous' && focusTarget) focusTarget.focus({ preventScroll: true });

    if (currentStep > 0) trackEvent(`form_step_${currentStep + 1}`);
  }

  function validateStep(stepIndex = currentStep) {
    const activeStep = steps[stepIndex];
    const requiredFields = [...activeStep.querySelectorAll('[required]')];
    const radioGroups = new Set(requiredFields.filter((field) => field.type === 'radio').map((field) => field.name));

    for (const groupName of radioGroups) {
      if (!activeStep.querySelector(`input[name="${groupName}"]:checked`)) {
        if (stepIndex !== currentStep) showStep(stepIndex);
        errorMessage.textContent = 'Escolha uma opção para continuar.';
        activeStep.querySelector(`input[name="${groupName}"]`)?.focus();
        return false;
      }
    }

    for (const field of requiredFields.filter((item) => item.type !== 'radio')) {
      const validPhone = field.type !== 'tel' || /^\d{10,11}$/.test(field.value.replace(/\D/g, ''));
      if (!field.value.trim() || !field.checkValidity() || !validPhone) {
        if (stepIndex !== currentStep) showStep(stepIndex);
        field.classList.add('is-invalid');
        errorMessage.textContent = field.type === 'email' ? 'Informe um e-mail válido.' : field.type === 'tel' ? 'Informe um WhatsApp válido com DDD.' : 'Preencha este campo para continuar.';
        field.focus();
        return false;
      }
    }

    return true;
  }

  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    trackEvent('form_start');
    trackEvent('form_step_1');
  }, { once: true });

  steps.slice(0, 3).forEach((step, stepIndex) => {
    step.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        clearError();
        window.setTimeout(() => {
          if (currentStep === stepIndex && validateStep()) showStep(currentStep + 1);
        }, reducedMotion ? 0 : 260);
      });
    });
  });

  nextButton.addEventListener('click', () => {
    if (validateStep()) showStep(currentStep + 1);
  });

  previousButton.addEventListener('click', () => showStep(currentStep - 1, 'previous'));

  form.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => {
      submissionId = '';
      field.classList.remove('is-invalid');
      errorMessage.textContent = '';
    });
  });

  const phoneField = form.querySelector('input[name="phone"]');
  phoneField?.addEventListener('input', () => {
    const digits = phoneField.value.replace(/\D/g, '').slice(0, 11);
    const parts = [];
    if (digits.length) parts.push(`(${digits.slice(0, 2)}`);
    if (digits.length >= 3) parts[0] += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
    if (digits.length > (digits.length > 10 ? 7 : 6)) parts.push(digits.slice(digits.length > 10 ? 7 : 6));
    phoneField.value = parts.join('-');
  });

  handoffLink.addEventListener('click', () => trackEvent('whatsapp_click', { placement: 'form' }));

  form.querySelector('#edit-answers').addEventListener('click', () => {
    handoff.hidden = true;
    formHead.hidden = false;
    formActions.hidden = false;
    deliveryNote.hidden = false;
    showStep(currentStep, 'previous');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    if (currentStep < steps.length - 1) {
      if (validateStep()) showStep(currentStep + 1);
      return;
    }
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
      if (!validateStep(stepIndex)) return;
    }

    const formData = new FormData(form);
    submissionId ||= crypto.randomUUID();
    const payload = {
      submissionId,
      submittedAt: new Date().toISOString(),
      name: formData.get('name').trim(),
      company: formData.get('company').trim(),
      phone: formData.get('phone').trim(),
      email: formData.get('email').trim(),
      website: formData.get('website').trim(),
      platforms: formData.get('platforms'),
      objective: formData.get('objective'),
      monthlyMediaInvestment: formData.get('monthlyMediaInvestment'),
      pageUrl: window.location.href,
      ...attribution
    };

    if (!CONFIG.webhookUrl) {
      const message = [
        'Olá André! Gostaria de conversar sobre gestão de tráfego.',
        '',
        `Nome: ${payload.name}`,
        `Empresa: ${payload.company}`,
        `Site/Instagram: ${payload.website}`,
        `Plataformas: ${payload.platforms}`,
        `Objetivo: ${payload.objective}`,
        `Investimento mensal em mídia: ${payload.monthlyMediaInvestment}`,
        `WhatsApp: ${payload.phone}`,
        `E-mail: ${payload.email}`
      ].join('\n');
      handoffLink.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      steps.forEach((step) => step.classList.remove('is-active'));
      formHead.hidden = true;
      formActions.hidden = true;
      deliveryNote.hidden = true;
      clearError();
      formHelp.hidden = true;
      handoff.hidden = false;
      handoff.focus();
      trackEvent('form_whatsapp_ready');
      return;
    }

    submitButton.disabled = true;
    submitButton.firstChild.textContent = 'Enviando ';
    clearError();
    formHelp.hidden = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const receipt = await response.json();
      if (receipt.ok !== true) throw new Error('Recebimento não confirmado');

      trackEvent('form_submit', { platforms: payload.platforms, objective: payload.objective });
      steps.forEach((step) => step.classList.remove('is-active'));
      formHead.hidden = true;
      formActions.hidden = true;
      deliveryNote.hidden = true;
      errorMessage.hidden = true;
      success.hidden = false;
      success.focus();
      form.reset();
    } catch (error) {
      errorMessage.textContent = 'Não foi possível confirmar o recebimento. Tente novamente ou fale com André pelo WhatsApp.';
      formHelp.hidden = false;
      trackEvent('form_error');
    } finally {
      window.clearTimeout(timeout);
      submitButton.disabled = false;
      submitButton.firstChild.textContent = submitLabel;
    }
  });

  showStep(0);
}
