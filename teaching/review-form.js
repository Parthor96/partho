// Leave-a-review form: builds a mailto: link (no server). Subject names the course.
(() => {
  const form = document.getElementById('review-form');
  if (!form) return;
  const TO = 'pkpaul@uci.edu';
  const msg = document.getElementById('rf-msg');
  const copyBtn = document.getElementById('rf-copy');
  const count = document.getElementById('rf-count');
  const review = form.elements.review;
  review.addEventListener('input', () => { count.textContent = review.value.length; });
  form.addEventListener('input', () => { if (msg.classList.contains('err')) { msg.textContent = ''; msg.className = 'rf-msg'; } });

  function compose() {
    const f = form.elements;
    const subject = `Tutoring review · ${f.subject.value}`;
    const lines = [
      f.review.value.trim().replace(/\s*\n+\s*/g, ' '),
      '',
      `Name to show: ${f.name.value.trim() || 'Anonymous'}`,
      `Course or subject: ${f.subject.value}`,
      f.school.value.trim() ? `School: ${f.school.value.trim()}` : null,
      `OK to post on the website: ${f.consent.checked ? 'Yes' : 'No'}`
    ].filter(l => l !== null);
    return { subject, body: lines.join('\n') };
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    msg.className = 'rf-msg';
    if (!form.elements.subject.value) { msg.textContent = 'Choose the course or subject first.'; msg.classList.add('err'); form.elements.subject.focus(); return; }
    if (review.value.trim().length < 20) { msg.textContent = 'Write at least a sentence or two.'; msg.classList.add('err'); review.focus(); return; }
    const { subject, body } = compose();
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Your email app should open with the review filled in. Thank you.';
    msg.classList.add('ok');
    copyBtn.hidden = false;
  });

  copyBtn.addEventListener('click', async () => {
    const { subject, body } = compose();
    const text = `To: ${TO}\nSubject: ${subject}\n\n${body}`;
    try { await navigator.clipboard.writeText(text); msg.textContent = `Copied. Paste it into an email to ${TO}.`; }
    catch { msg.textContent = `Copy failed. Please email ${TO} directly.`; }
  });
})();
