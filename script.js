const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  navigation?.classList.toggle('is-open', !open);
  document.body.classList.toggle('menu-open', !open);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  });
});

document.querySelectorAll('details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelectorAll('.track-whatsapp').forEach((link) => {
  link.addEventListener('click', () => {
    const position = link.closest('header') ? 'header' : link.closest('.hero') ? 'hero' : link.closest('.final-cta') ? 'final_cta' : 'content';
    
    // Google Ads / Analytics via GTM
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_click',
      link_position: position
    });

    // Meta Ads (Facebook Pixel)
    if (typeof fbq === 'function') {
      fbq('trackCustom', 'WhatsAppClick', { position: position });
      // Evento alternativo padrão do Meta, caso queira otimizar para 'Contato'
      // fbq('track', 'Contact', { content_name: 'WhatsApp', position: position });
    }
  });
});
