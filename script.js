// Interactive Tab Switching for Feature Showcase
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.showcase-tab');
  const panels = {
    plan: document.getElementById('panel-plan'),
    subfunctions: document.getElementById('panel-subfunctions'),
    inputs: document.getElementById('panel-inputs'),
    copypaste: document.getElementById('panel-copypaste'),
  };

  function switchTab(tabKey) {
    tabs.forEach((t) => {
      const match = t.getAttribute('data-tab') === tabKey;
      t.classList.toggle('active', match);
      t.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    Object.entries(panels).forEach(([key, panel]) => {
      if (panel) {
        panel.classList.toggle('active', key === tabKey);
      }
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabKey = tab.getAttribute('data-tab');
      if (tabKey) switchTab(tabKey);
    });

    // Keyboard accessibility for tabs
    tab.addEventListener('keydown', (e) => {
      const tabList = Array.from(tabs);
      const index = tabList.indexOf(tab);
      let nextIndex = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabList.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabList.length) % tabList.length;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabList[nextIndex].focus();
        tabList[nextIndex].click();
      }
    });
  });

  // Smooth scroll offset adjustments for sticky header
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
});
