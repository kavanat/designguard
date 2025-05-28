// UX Linter Configuration
const CONFIG = {
  MIN_BUTTON_WIDTH: 100,
  MIN_BUTTON_HEIGHT: 40,
  MAX_CTAS_PER_PAGE: 3,
  MIN_CONTRAST_RATIO: 4.5
};

// Store detected violations
let violations = [];

// Check button size violations
function checkButtonSize() {
  const buttons = document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]');
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    if (rect.width < CONFIG.MIN_BUTTON_WIDTH || rect.height < CONFIG.MIN_BUTTON_HEIGHT) {
      violations.push({
        type: 'button-size',
        element: button,
        message: `Button is too small (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
        severity: 'warning'
      });
    }
  });
}

// Check CTA count violations
function checkCTACount() {
  const ctas = document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"], a.btn');
  if (ctas.length > CONFIG.MAX_CTAS_PER_PAGE) {
    violations.push({
      type: 'cta-count',
      element: document.body,
      message: `Too many CTAs (${ctas.length}) on the page`,
      severity: 'warning'
    });
  }
}

// Check color contrast violations
function checkColorContrast() {
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, input, label');
  textElements.forEach(element => {
    const style = window.getComputedStyle(element);
    const textColor = style.color;
    const bgColor = style.backgroundColor;
    
    // Simple contrast check (this is a simplified version)
    if (textColor === 'rgb(255, 255, 255)' && bgColor === 'rgb(255, 255, 255)') {
      violations.push({
        type: 'color-contrast',
        element: element,
        message: 'Low color contrast detected',
        severity: 'error'
      });
    }
  });
}

// Highlight violations on the page
function highlightViolations() {
  violations.forEach(violation => {
    const element = violation.element;
    element.classList.add('ux-linter-highlight');
    if (violation.severity === 'warning') {
      element.classList.add('warning');
    }
  });
}

// Clear all highlights
function clearHighlights() {
  document.querySelectorAll('.ux-linter-highlight').forEach(element => {
    element.classList.remove('ux-linter-highlight', 'warning');
  });
}

// Main function to run all checks
function runUXChecks() {
  clearHighlights();
  violations = [];
  checkButtonSize();
  checkCTACount();
  checkColorContrast();
  highlightViolations();
  
  // Send violations to popup
  chrome.runtime.sendMessage({
    type: 'violations',
    data: violations
  });
}

// Set up MutationObserver for real-time checking
const observer = new MutationObserver((mutations) => {
  runUXChecks();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refresh') {
    runUXChecks();
  } else if (message.type === 'clear') {
    clearHighlights();
  }
});

// Initial check
runUXChecks(); 