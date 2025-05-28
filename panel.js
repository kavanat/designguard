// Get DOM elements
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const violationsList = document.getElementById('violations-list');
const violationCount = document.getElementById('violation-count');

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
  
  const element = document.createElement('div');
  element.className = 'element';
  element.textContent = violation.element.outerHTML;
  
  item.appendChild(type);
  item.appendChild(message);
  item.appendChild(element);
  
  return item;
}

// Function to update the violations list
function updateViolationsList(violations) {
  violationsList.innerHTML = '';
  violationCount.textContent = violations.length;
  
  if (violations.length === 0) {
    const noViolations = document.createElement('div');
    noViolations.className = 'no-violations';
    noViolations.textContent = '✅ No UX violations found!';
    violationsList.appendChild(noViolations);
    return;
  }
  
  violations.forEach(violation => {
    const item = createViolationItem(violation);
    violationsList.appendChild(item);
  });
}

// Function to run the linter
function runLinter() {
  chrome.devtools.inspectedWindow.eval(
    `(${function() {
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
      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      // Utility function to parse RGB color
      function parseRGB(color) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
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
          const textColor = style.color;
          const bgColor = style.backgroundColor;
          
          const textRGB = parseRGB(textColor);
          const bgRGB = parseRGB(bgColor);
          
          if (textRGB && bgRGB) {
            const textLuminance = getLuminance(...textRGB);
            const bgLuminance = getLuminance(...bgRGB);
            
            const contrastRatio = (Math.max(textLuminance, bgLuminance) + 0.05) / 
                                 (Math.min(textLuminance, bgLuminance) + 0.05);
            
            if (contrastRatio < CONFIG.MIN_CONTRAST_RATIO) {
              violations.push({
                type: 'color-contrast',
                element: element,
                message: `Low color contrast (ratio: ${contrastRatio.toFixed(2)})`,
                severity: 'error'
              });
            }
          }
        });
      }

      // Add styles for highlighting
      function addStyles() {
        if (!document.getElementById('ux-linter-styles')) {
          const style = document.createElement('style');
          style.id = 'ux-linter-styles';
          style.textContent = `
            .ux-linter-highlight {
              position: relative;
              outline: 2px solid #f44336 !important;
              outline-offset: 2px !important;
            }
            
            .ux-linter-highlight.warning {
              outline-color: #ff9800 !important;
            }
            
            .ux-linter-highlight.error {
              outline-color: #f44336 !important;
            }
            
            .ux-linter-tooltip {
              position: absolute;
              top: -30px;
              left: 50%;
              transform: translateX(-50%);
              background: #333;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              white-space: nowrap;
              z-index: 10000;
            }
          `;
          document.head.appendChild(style);
        }
      }

      // Add visual indicators to the page
      function highlightViolations() {
        // Remove existing highlights
        document.querySelectorAll('.ux-linter-highlight').forEach(el => {
          el.classList.remove('ux-linter-highlight', 'warning', 'error');
          const tooltip = el.querySelector('.ux-linter-tooltip');
          if (tooltip) tooltip.remove();
        });
        
        // Add new highlights
        violations.forEach(violation => {
          const element = violation.element;
          element.classList.add('ux-linter-highlight');
          element.classList.add(violation.severity);
          
          // Add tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'ux-linter-tooltip';
          tooltip.textContent = violation.message;
          element.appendChild(tooltip);
        });
      }

      // Run all checks
      violations = [];
      addStyles();
      checkButtonSize();
      checkCTACount();
      checkColorContrast();
      highlightViolations();

      return violations;
    }})()`,
    (result, isException) => {
      if (isException) {
        console.error('Error running linter:', isException);
        return;
      }
      updateViolationsList(result);
    }
  );
}

// Function to clear highlights
function clearHighlights() {
  chrome.devtools.inspectedWindow.eval(
    `(${function() {
      document.querySelectorAll('.ux-linter-highlight').forEach(el => {
        el.classList.remove('ux-linter-highlight', 'warning', 'error');
        const tooltip = el.querySelector('.ux-linter-tooltip');
        if (tooltip) tooltip.remove();
      });
    }})()`
  );
  updateViolationsList([]);
}

// Add event listeners
runBtn.addEventListener('click', runLinter);
clearBtn.addEventListener('click', clearHighlights);

// Run initial check
runLinter(); 