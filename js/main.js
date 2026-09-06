const WHATSAPP_NUMBER = '5548999001340'; // substitua pelo seu número com DDI + DDD

const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 24);
});

mobileToggle?.addEventListener('click', () => {
  const active = navLinks.classList.toggle('active');
  document.body.classList.toggle('menu-open', active);
  mobileToggle.setAttribute('aria-expanded', String(active));
  mobileToggle.querySelector('i').className = active ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    document.body.classList.remove('menu-open');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    const icon = mobileToggle?.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-bars';
  });
});

document.querySelectorAll('.js-whatsapp').forEach(link => {
  const message = link.dataset.message || 'Olá André! Quero saber mais sobre gestão de tráfego pago.';
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
});

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();
