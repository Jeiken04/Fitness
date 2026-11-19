/* DailyForm Phase 2.4 — progressive UI enhancements only. No persistence changes. */
(() => {
  'use strict';
  const panel = document.getElementById('tab-meal-planner');
  if (!panel) return;
  const heading = panel.querySelector('.tab-heading');
  const section = panel.querySelector('#ingredientPlanner');
  const sections = [
    ['Pantry', section?.querySelector('.phase-panel')],
    ['Recipes', Array.from(section?.querySelectorAll('.phase-panel') || []).find(el => el.querySelector('h3')?.textContent.includes('Recipe library'))],
    ['Weekly plan', Array.from(section?.querySelectorAll('.phase-panel') || []).find(el => el.querySelector('h3')?.textContent.includes('Build your meal plan'))],
    ['Grocery list', Array.from(section?.querySelectorAll('.phase-panel') || []).find(el => el.querySelector('h3')?.textContent.includes('Automatic grocery list'))]
  ].filter(([,node]) => !!node);
  if (heading && sections.length) {
    const nav = document.createElement('nav');
    nav.className = 'p24-jumpbar';
    nav.setAttribute('aria-label','Meal planner quick navigation');
    sections.forEach(([name,node],index) => {
      node.id ||= 'p24-section-' + index;
      node.classList.add('p24-section-anchor');
      const link = document.createElement('a');
      link.href = '#' + node.id;
      link.textContent = name;
      link.addEventListener('click',event => {
        event.preventDefault();
        node.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      });
      nav.appendChild(link);
    });
    heading.insertAdjacentElement('afterend',nav);
    const tip=document.createElement('div');
    tip.className='p24-tip';
    tip.innerHTML='<strong>Plan smarter:</strong> Add what you have, explore recipes, build your week, then check your grocery list. Nutrition values are estimates; review ingredients for allergens.';
    nav.insertAdjacentElement('afterend',tip);
  }
  const topButton=document.createElement('button');
  topButton.type='button';
  topButton.className='p24-backtop';
  topButton.textContent='↑ Back to top';
  topButton.setAttribute('aria-label','Back to top of page');
  topButton.hidden=true;
  document.body.appendChild(topButton);
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  const refresh=()=>{topButton.hidden=window.scrollY<480;};
  window.addEventListener('scroll',refresh,{passive:true});
  refresh();
})();
