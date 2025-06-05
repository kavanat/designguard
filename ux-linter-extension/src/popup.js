document.addEventListener('DOMContentLoaded', () => {
  const violationsList = document.getElementById('violations-list');
  const violationCount = document.getElementById('violation-count');
  const refreshBtn = document.getElementById('refresh-btn');
  const clearBtn = document.getElementById('clear-btn');

  // Function to create a violation item element
  function createViolationItem(violation) {
    const item = document.createElement('div');
    item.className = `violation-item ${violation.severity}`;
    
    const type = document.createElement('div');
    type.className = 'type';
    type.textContent = violation.type.replace(/-/g, ' ').toUpperCase();
    
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = violation.message;
    
    item.appendChild(type);
    item.appendChild(message);
    
    return item;
  }

  // Function to update the violations list
  function updateViolationsList(violations) {
    violationsList.innerHTML = '';
    violationCount.textContent = violations.length;
    
    violations.forEach(violation => {
      const item = createViolationItem(violation);
      violationsList.appendChild(item);
    });
  }

  // Function to refresh violations
  function refreshViolations() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'refresh' });
    });
  }

  // Function to clear highlights
  function clearHighlights() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'clear' });
    });
  }

  // Function to check for button size violations
  function checkButtonSizeViolations() {
    const buttons = document.querySelectorAll('button, [role="button"], .btn');
    const violations = [];
    buttons.forEach(button => {
      if (button.offsetWidth < 44 || button.offsetHeight < 44) {
        violations.push({
          type: 'buttonSize',
          message: 'Button too small - Expected size: 44x44px',
          severity: 'error'
        });
      }
    });
    return violations;
  }

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'violations') {
      updateViolationsList(message.data);
    }
  });

  // Add event listeners
  refreshBtn.addEventListener('click', refreshViolations);
  clearBtn.addEventListener('click', clearHighlights);

  // Initial refresh
  refreshViolations();

  // Check for button size violations
  const buttonViolations = checkButtonSizeViolations();
  if (buttonViolations.length > 0) {
    console.log('Button size violations:', buttonViolations);
  }
}); 