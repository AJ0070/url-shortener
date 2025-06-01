document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const shortenBtn = document.getElementById('shortenBtn');
  const resultCard = document.getElementById('resultCard');
  const shortUrl = document.getElementById('shortUrl');
  const copyBtn = document.getElementById('copyBtn');
  const urlList = document.getElementById('urlList');
  const notifications = document.getElementById('notifications');

  // Load existing URLs
  loadUrls();

  // Event listeners
  shortenBtn.addEventListener('click', shortenUrl);
  copyBtn.addEventListener('click', copyToClipboard);

  async function shortenUrl() {
    const url = urlInput.value.trim();

    if (!url) {
      showNotification('Please enter a URL', 'error');
      return;
    }

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (response.ok) {
        const shortUrlValue = `${window.location.origin}/${data.shortUrl}`;
        shortUrl.value = shortUrlValue;
        resultCard.classList.remove('hidden');
        urlInput.value = '';
        showNotification('URL shortened successfully!', 'success');
        loadUrls(); // Refresh the URL list
      } else {
        throw new Error(data.error || 'Failed to shorten URL');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  }

  async function loadUrls() {
    try {
      const response = await fetch('/api/urls');
      const urls = await response.json();

      urlList.innerHTML = urls
        .map(
          (url) => `
                <div class="url-item">
                    <div class="url-details">
                        <div class="short-url">${window.location.origin}/${
            url.shortUrl
          }</div>
                        <div class="original-url">${url.originalUrl}</div>
                    </div>
                    <div class="url-stats">
                        <span><i class="fas fa-clock"></i> ${new Date(
                          url.createdAt
                        ).toLocaleDateString()}</span>
                        <span><i class="fas fa-click"></i> ${
                          url.clicks
                        } clicks</span>
                    </div>
                </div>
            `
        )
        .join('');
    } catch (error) {
      showNotification('Failed to load URLs', 'error');
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shortUrl.value);
      showNotification('URL copied to clipboard!', 'success');
    } catch (error) {
      showNotification('Failed to copy URL', 'error');
    }
  }

  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notifications.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
});
