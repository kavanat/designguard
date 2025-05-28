// UX Linter Configuration
const CONFIG = {
  MIN_BUTTON_WIDTH: 100,
  MIN_BUTTON_HEIGHT: 40,
  MAX_CTAS_PER_PAGE: 3,
  MIN_CONTRAST_RATIO: 4.5
};

// Store detected violations
let violations = [];

// Utility function to calculate relative luminance
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(...color1);
  const l2 = getRelativeLuminance(...color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

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
    const textColor = hexToRgb(style.color);
    const bgColor = hexToRgb(style.backgroundColor);
    
    if (textColor && bgColor) {
      const contrastRatio = getContrastRatio(textColor, bgColor);
      if (contrastRatio < CONFIG.MIN_CONTRAST_RATIO) {
        violations.push({
          type: 'color-contrast',
          element: element,
          message: `Low color contrast (${contrastRatio.toFixed(2)})`,
          severity: 'error'
        });
      }
    }
  });
}

// Highlight violations on the page
function highlightViolations() {
  violations.forEach(violation => {
    const element = violation.element;
    element.style.outline = '2px solid ' + (violation.severity === 'error' ? 'red' : 'orange');
    element.style.outlineOffset = '2px';
  });
}

// Main function to run all checks
function runUXChecks() {
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

// Initial check
runUXChecks(); 