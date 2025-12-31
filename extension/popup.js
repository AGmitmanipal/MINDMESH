// Cortex Extension Popup Script

// Open dashboard button
document.getElementById('openDashboard').addEventListener('click', () => {
  const extId = chrome.runtime.id;
  chrome.tabs.create({ url: `http://localhost:8080/dashboard?extId=${extId}` });
});

// Open privacy settings button
document.getElementById('openSettings').addEventListener('click', () => {
  const extId = chrome.runtime.id;
  chrome.tabs.create({ url: `http://localhost:8080/privacy?extId=${extId}` });
});

// Load statistics from IndexedDB and sync settings
async function loadData() {
  try {
    // Get stats from extension via messaging for better sync
    chrome.runtime.sendMessage({ type: "GET_STATS", payload: {} }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to get stats:', chrome.runtime.lastError);
        return;
      }
      if (response && response.success && response.data) {
        document.getElementById('pageCount').textContent = response.data.pageCount || 0;
        const sizeMB = ((response.data.storageSize || 0) / (1024 * 1024)).toFixed(1);
        document.getElementById('storageSize').textContent = sizeMB + ' MB';
      }
    });

    // Get capture settings
    chrome.runtime.sendMessage({ type: "GET_CAPTURE_SETTINGS", payload: {} }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to get settings:', chrome.runtime.lastError);
        return;
      }
      if (response && response.success && response.data) {
        const toggle = document.getElementById('captureToggle');
        if (toggle) {
          toggle.checked = response.data.enabled;
        }
      }
    });
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// Handle capture toggle
const toggleElement = document.getElementById('captureToggle');
if (toggleElement) {
  toggleElement.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.runtime.sendMessage({
      type: "UPDATE_CAPTURE_SETTINGS",
      payload: { enabled }
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to update settings:', chrome.runtime.lastError);
        // Revert toggle on error
        e.target.checked = !enabled;
      }
    });
  });
}

// Load data on popup open
loadData();
