/* Android-only PWA enhancements. No changes to workout records or storage. */
(() => {
  'use strict';
  const isAndroid = /Android/i.test(navigator.userAgent || '');
  if (!isAndroid) return; // Preserve the existing iPhone and desktop behavior.
  const card = document.getElementById('androidInstallCard');
  const status = document.getElementById('androidInstallStatus');
  const button = document.getElementById('androidInstallButton');
  if (card) card.hidden = false;
  const say = message => { if (status) status.textContent = message; };
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  let installPrompt = null;
  if (standalone()) say('DailyForm is running as an installed app.');
  else say('In Chrome, open the browser menu and select Install app or Add to Home screen.');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (button && !standalone()) button.hidden = false;
    say('DailyForm is ready to install on this Android device.');
  });
  button?.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    button.hidden = true;
    try { await prompt.prompt(); const result = await prompt.userChoice;
      say(result.outcome === 'accepted' ? 'Installation accepted. Follow any device prompts.' : 'Installation dismissed. You can install from Chrome’s menu.');
    } catch { say('Use Chrome’s menu to install DailyForm.'); }
  });
  window.addEventListener('appinstalled', () => {installPrompt=null;if(button)button.hidden=true;say('DailyForm installed successfully.');});
})();
