document.addEventListener('DOMContentLoaded', () => {

  // 1. Criar e adicionar a Barra de Progresso de Leitura no topo da página
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress-bar';
  document.body.appendChild(progressBar);

  // Atualizar largura da barra durante a rolagem
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });

  // 2. Rolagem suave para o topo ao clicar no botão da seta
  const btnBackToTop = document.getElementById('btnBackToTop');
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 3. Efeito de revelação suave nas seções ao rolar a página (Intersection Observer)
  const observerOptions = {
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll(
    '.slide-drag-down, .slide-drag-left, .slide-drag-right, .slide-drag-up'
  );

  animatedElements.forEach(el => observer.observe(el));
});