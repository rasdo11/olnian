/* quiz.js — self-contained quiz state machine, no framework dependency */

(function () {
  'use strict';

  const QUESTIONS = [
    {
      id: 'q1',
      text: 'How old are you?',
      options: [
        { value: 'under37', label: 'Under 37' },
        { value: '37to50', label: '37–50' },
        { value: 'over50', label: '50+' },
      ],
    },
    {
      id: 'q2',
      text: 'What's your main goal right now?',
      options: [
        { value: 'strength', label: 'Strength & muscle' },
        { value: 'brain',    label: 'Focus & memory' },
        { value: 'sleep',    label: 'Sleep & recovery' },
        { value: 'all',      label: 'All of the above' },
      ],
    },
    {
      id: 'q3',
      text: 'Do you have any kidney disease or conditions that affect protein metabolism?',
      options: [
        { value: 'no',  label: 'No' },
        { value: 'yes', label: 'Yes' },
      ],
    },
    {
      id: 'q4',
      text: 'Are you currently taking any prescription medications?',
      options: [
        { value: 'no',  label: 'No' },
        { value: 'yes', label: 'Yes, I'll check with my doctor' },
      ],
    },
  ];

  const VERDICTS = {
    yes: {
      headline: 'You're a great fit.',
      body: 'Based on your answers, creatine monohydrate is well-studied for your profile. Most women in your range notice a difference within 2–4 weeks.',
      cta: 'Reserve Batch 01',
      product: '/products/creatine',
      color: 'var(--tangerine)',
    },
    physician: {
      headline: 'Check with your doctor first.',
      body: 'Given your health history, we'd recommend a quick conversation with your physician before starting creatine. The research is strong — we just want your context first.',
      cta: 'Read the research',
      product: '#proof',
      color: 'var(--gold)',
    },
    no: {
      headline: 'Not quite the right time.',
      body: 'Creatine is most studied in women 37 and up. You might want to revisit in a few years — or explore our magnesium formula for sleep and recovery.',
      cta: 'See magnesium instead',
      product: '/products/magnesium',
      color: 'var(--mint)',
    },
  };

  /* ── State ── */
  let step = 0;
  const answers = {};

  /* ── DOM ── */
  const overlay    = document.getElementById('quiz-overlay');
  const panel      = document.getElementById('quiz-panel');
  const closeBtn   = document.getElementById('quiz-close');
  const contentEl  = document.getElementById('quiz-content');
  const progressBar= document.getElementById('quiz-progress-bar');

  /* ── Open / close ── */
  function openQuiz() {
    step = 0;
    Object.keys(answers).forEach(k => delete answers[k]);
    overlay && overlay.removeAttribute('aria-hidden');
    panel && panel.removeAttribute('aria-hidden');
    overlay && overlay.classList.add('is-visible');
    panel && panel.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    render();
  }

  function closeQuiz() {
    overlay && overlay.setAttribute('aria-hidden', 'true');
    panel && panel.setAttribute('aria-hidden', 'true');
    overlay && overlay.classList.remove('is-visible');
    panel && panel.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (overlay) overlay.addEventListener('click', closeQuiz);
  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel && panel.classList.contains('is-open')) closeQuiz();
  });

  /* ── Routing ── */
  function getVerdict() {
    if (answers.q1 === 'under37') return 'no';
    if (answers.q3 === 'yes') return 'physician';
    return 'yes';
  }

  function advance(value) {
    const q = QUESTIONS[step];
    answers[q.id] = value;
    step++;
    if (step >= QUESTIONS.length) {
      showResult();
    } else {
      render();
    }
  }

  /* ── Render question ── */
  function render() {
    const q = QUESTIONS[step];
    const pct = Math.round((step / QUESTIONS.length) * 100);
    if (progressBar) progressBar.style.width = pct + '%';

    if (!contentEl) return;
    contentEl.innerHTML = `
      <p class="quiz-step-label">${step + 1} of ${QUESTIONS.length}</p>
      <h2 class="quiz-question display-md">${q.text}</h2>
      <div class="quiz-options">
        ${q.options.map(opt => `
          <button class="quiz-option" data-value="${opt.value}" type="button">
            ${opt.label}
          </button>
        `).join('')}
      </div>
    `;

    contentEl.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => advance(btn.dataset.value));
    });
  }

  /* ── Result screen ── */
  function showResult() {
    const verdict = getVerdict();
    const v = VERDICTS[verdict];

    if (progressBar) progressBar.style.width = '100%';

    if (!contentEl) return;
    contentEl.innerHTML = `
      <div class="quiz-result" style="--result-color: ${v.color};">
        <p class="quiz-result__label">Your result</p>
        <h2 class="quiz-result__headline display-md">${v.headline}</h2>
        <p class="quiz-result__body">${v.body}</p>
        <a href="${v.product}" class="btn btn--lg quiz-result__cta" style="background: ${v.color}; color: var(--espresso);">
          ${v.cta} →
        </a>
        <button class="quiz-result__retake" type="button" id="quiz-retake">Retake quiz</button>
      </div>
    `;

    document.getElementById('quiz-retake')?.addEventListener('click', () => {
      step = 0;
      Object.keys(answers).forEach(k => delete answers[k]);
      render();
    });

    /* MailerLite event */
    try {
      if (typeof ml === 'function') ml('track', 'quiz_completed', { verdict });
    } catch {}

    /* Expose verdict for product page */
    window.OLNIAN = window.OLNIAN || {};
    window.OLNIAN.quizVerdict = verdict;
    const verdictInput = document.getElementById('quiz-verdict-input');
    if (verdictInput) verdictInput.value = verdict;
  }

  /* ── Expose ── */
  window.OLNIAN = window.OLNIAN || {};
  window.OLNIAN.openQuiz = openQuiz;
  window.OLNIAN.closeQuiz = closeQuiz;
})();
