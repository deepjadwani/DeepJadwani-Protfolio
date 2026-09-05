(() => {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) {
    return;
  }

  const status = document.getElementById('formStatus');
  const submitBtn = form.querySelector("button[type='submit']");
  const config = window.__SITE_CONFIG__ || {};

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!config.contactFormEndpoint) {
      status.textContent = 'Contact form is not configured right now. Please email me directly.';
      status.classList.add('error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.textContent = '';
    status.classList.remove('error');

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    try {
      const response = await fetch(config.contactFormEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      status.textContent = 'Message sent successfully!';
      form.reset();
    } catch (error) {
      console.error('Contact form submission failed:', error);
      status.textContent = 'Something went wrong. Please try again.';
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
})();
