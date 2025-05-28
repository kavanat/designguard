class UXLinterGenerator {
  constructor() {
    this.rules = {};
    this.config = {
      styles: {
        warning: {
          outline: '2px solid #ffc107',
          backgroundColor: 'rgba(255, 193, 7, 0.1)'
        },
        error: {
          outline: '2px solid #dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)'
        }
      }
    };
  }

  addRule(name, rule) {
    this.rules[name] = rule;
  }

  addPredefinedRule(ruleType) {
    const rules = {
      // Layout & Spacing Rules
      buttonSize: {
        selector: 'button, [role="button"], .btn, input[type="button"], input[type="submit"]',
        check: 'element.getBoundingClientRect().width < 44 || element.getBoundingClientRect().height < 44',
        message: 'Button is too small (minimum 44x44px for touch targets)',
        severity: 'error'
      },
      inconsistentMargins: {
        selector: 'div, section, article, p',
        check: `(function() {
          const elements = Array.from(document.querySelectorAll('div, section, article, p'));
          const margins = new Set();
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            margins.add(style.marginTop + style.marginBottom);
          });
          return margins.size > 3;
        })()`,
        message: 'Inconsistent margins detected between elements',
        severity: 'warning'
      },
      inconsistentPadding: {
        selector: 'button, input, .btn',
        check: `(function() {
          const elements = Array.from(document.querySelectorAll('button, input, .btn'));
          const paddings = new Set();
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            paddings.add(style.paddingTop + style.paddingBottom);
          });
          return paddings.size > 2;
        })()`,
        message: 'Inconsistent padding detected in similar elements',
        severity: 'warning'
      },
      sectionSpacing: {
        selector: 'section, .section, [role="region"]',
        check: `(function() {
          const sections = Array.from(document.querySelectorAll('section, .section, [role="region"]'));
          const spacings = new Set();
          for (let i = 0; i < sections.length - 1; i++) {
            const rect1 = sections[i].getBoundingClientRect();
            const rect2 = sections[i + 1].getBoundingClientRect();
            spacings.add(Math.round(rect2.top - rect1.bottom));
          }
          return spacings.size > 2;
        })()`,
        message: 'Inconsistent spacing between sections',
        severity: 'warning'
      },
      textOverflow: {
        selector: 'p, h1, h2, h3, h4, h5, h6, span, div',
        check: 'element.scrollWidth > element.clientWidth',
        message: 'Text is overflowing its container',
        severity: 'warning'
      },
      elementAlignment: {
        selector: 'div, section, article',
        check: `(function() {
          const elements = Array.from(document.querySelectorAll('div, section, article'));
          const alignments = new Set();
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            alignments.add(style.textAlign);
          });
          return alignments.size > 2;
        })()`,
        message: 'Inconsistent element alignment detected',
        severity: 'warning'
      },

      // Typography & Text Rules
      textContrast: {
        selector: 'p, h1, h2, h3, h4, h5, h6, span, a, button, input, label',
        check: `(function() {
          const style = window.getComputedStyle(element);
          const textColor = style.color;
          const bgColor = style.backgroundColor;
          const textRGB = parseRGB(textColor);
          const bgRGB = parseRGB(bgColor);
          if (textRGB && bgRGB) {
            const textLuminance = calculateLuminance(textRGB);
            const bgLuminance = calculateLuminance(bgRGB);
            const contrastRatio = (Math.max(textLuminance, bgLuminance) + 0.05) / 
                                (Math.min(textLuminance, bgLuminance) + 0.05);
            return contrastRatio < 4.5;
          }
          return false;
        })()`,
        message: 'Low color contrast (minimum ratio: 4.5)',
        severity: 'error'
      },
      textSize: {
        selector: 'p, span, a, button, input, label',
        check: 'parseInt(window.getComputedStyle(element).fontSize) < 12',
        message: 'Text is too small (minimum 12px)',
        severity: 'warning'
      },
      lineHeight: {
        selector: 'p, div, span',
        check: `(function() {
          const style = window.getComputedStyle(element);
          const lineHeight = parseFloat(style.lineHeight);
          const fontSize = parseFloat(style.fontSize);
          const ratio = lineHeight / fontSize;
          return ratio < 1.5 || ratio > 1.6;
        })()`,
        message: 'Line height should be between 1.5 and 1.6 times the font size',
        severity: 'warning'
      },
      lineLength: {
        selector: 'p, div',
        check: 'element.textContent.length > 80',
        message: 'Line is too long (maximum 80 characters)',
        severity: 'warning'
      },
      fontHierarchy: {
        selector: 'h1, h2, h3, h4, h5, h6',
        check: `(function() {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const levels = headings.map(h => parseInt(h.tagName[1]));
          for (let i = 0; i < levels.length - 1; i++) {
            if (levels[i + 1] - levels[i] > 1) return true;
          }
          return false;
        })()`,
        message: 'Heading levels should not be skipped',
        severity: 'warning'
      },
      linkStyle: {
        selector: 'a',
        check: `(function() {
          const style = window.getComputedStyle(element);
          return !style.textDecoration.includes('underline') && 
                 style.color === window.getComputedStyle(document.body).color;
        })()`,
        message: 'Links should have clear visual indicators (underline or distinct color)',
        severity: 'warning'
      },

      // Visual Design Rules
      imageQuality: {
        selector: 'img',
        check: `(function() {
          const naturalWidth = element.naturalWidth;
          const displayWidth = element.width;
          return naturalWidth < displayWidth;
        })()`,
        message: 'Image is being displayed larger than its natural size',
        severity: 'warning'
      },
      uiClutter: {
        selector: 'body',
        check: `(function() {
          const elements = document.querySelectorAll('div, section, article, p, button, input');
          return elements.length > 50;
        })()`,
        message: 'Too many elements on the page (potential UI clutter)',
        severity: 'warning'
      },
      buttonStyle: {
        selector: 'button, [role="button"], .btn',
        check: `(function() {
          const style = window.getComputedStyle(element);
          return !style.backgroundColor || !style.border || !style.borderRadius;
        })()`,
        message: 'Button lacks proper styling (background, border, or border-radius)',
        severity: 'warning'
      },
      animation: {
        selector: '*',
        check: `(function() {
          const style = window.getComputedStyle(element);
          return style.animationDuration && parseFloat(style.animationDuration) > 0.5;
        })()`,
        message: 'Animation duration exceeds 500ms',
        severity: 'warning'
      },
      colorUsage: {
        selector: 'body',
        check: `(function() {
          const elements = document.querySelectorAll('*');
          const colors = new Set();
          elements.forEach(el => {
            const style = window.getComputedStyle(el);
            colors.add(style.color);
            colors.add(style.backgroundColor);
          });
          return colors.size > 10;
        })()`,
        message: 'Too many different colors used (potential visual overload)',
        severity: 'warning'
      },
      colorBlindness: {
        selector: 'button, a, span, div',
        check: `(function() {
          const style = window.getComputedStyle(element);
          const color = style.color;
          const bgColor = style.backgroundColor;
          return (color.includes('red') && bgColor.includes('green')) ||
                 (color.includes('green') && bgColor.includes('red'));
        })()`,
        message: 'Color combination may be difficult for color-blind users',
        severity: 'warning'
      },

      // Interaction & Function Rules
      navigation: {
        selector: 'nav, [role="navigation"]',
        check: `(function() {
          const nav = element;
          const links = nav.querySelectorAll('a');
          return links.length < 2;
        })()`,
        message: 'Navigation should have at least 2 links',
        severity: 'warning'
      },
      formValidation: {
        selector: 'form',
        check: `(function() {
          const inputs = element.querySelectorAll('input, select, textarea');
          return Array.from(inputs).some(input => !input.hasAttribute('required') && !input.hasAttribute('aria-required'));
        })()`,
        message: 'Form inputs should have proper validation attributes',
        severity: 'warning'
      },
      focusState: {
        selector: 'a, button, input, select, textarea',
        check: `(function() {
          const style = window.getComputedStyle(element);
          return !style.outline && !style.borderColor;
        })()`,
        message: 'Interactive element lacks visible focus state',
        severity: 'error'
      },
      keyboardNav: {
        selector: 'a, button, input, select, textarea',
        check: '!element.hasAttribute("tabindex") && element.getAttribute("tabindex") !== "0"',
        message: 'Element should be keyboard focusable',
        severity: 'error'
      },
      modalUsage: {
        selector: '.modal, [role="dialog"]',
        check: `(function() {
          const modals = document.querySelectorAll('.modal, [role="dialog"]');
          return modals.length > 3;
        })()`,
        message: 'Too many modal dialogs on the page',
        severity: 'warning'
      },
      ctaClarity: {
        selector: 'button, a',
        check: `(function() {
          const text = element.textContent.trim().toLowerCase();
          return text === 'click here' || text === 'read more' || text === 'learn more';
        })()`,
        message: 'Generic call-to-action text detected',
        severity: 'warning'
      },

      // Accessibility Rules
      altText: {
        selector: 'img',
        check: '!element.hasAttribute("alt")',
        message: 'Image missing alt text',
        severity: 'error'
      },
      formLabels: {
        selector: 'input, select, textarea',
        check: `(function() {
          const id = element.id;
          return !id || !document.querySelector('label[for="' + id + '"]');
        })()`,
        message: 'Form control missing associated label',
        severity: 'error'
      },
      ariaRoles: {
        selector: '[role]',
        check: `(function() {
          const role = element.getAttribute('role');
          const validRoles = ['button', 'checkbox', 'dialog', 'gridcell', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'progressbar', 'radio', 'scrollbar', 'searchbox', 'slider', 'spinbutton', 'status', 'tab', 'tabpanel', 'textbox', 'timer', 'tooltip', 'treeitem'];
          return !validRoles.includes(role);
        })()`,
        message: 'Invalid ARIA role used',
        severity: 'error'
      },
      skipNav: {
        selector: 'body',
        check: `(function() {
          const skipLinks = document.querySelectorAll('a[href^="#"]');
          return skipLinks.length === 0;
        })()`,
        message: 'Missing skip navigation link',
        severity: 'warning'
      },
      hoverStates: {
        selector: 'a, button, [role="button"]',
        check: `(function() {
          const style = window.getComputedStyle(element);
          return !style.getPropertyValue(':hover');
        })()`,
        message: 'Interactive element missing hover state',
        severity: 'warning'
      },
      textResize: {
        selector: 'body',
        check: `(function() {
          const style = window.getComputedStyle(element);
          return style.fontSize.includes('px') && !style.fontSize.includes('rem');
        })()`,
        message: 'Text should use relative units (rem) for better resizing',
        severity: 'warning'
      }
    };

    if (rules[ruleType]) {
      this.addRule(ruleType, rules[ruleType]);
    }
  }

  generateScript() {
    if (Object.keys(this.rules).length === 0) {
      return 'No rules selected';
    }

    const script = 'javascript:(function(){' +
      'try {' +
      'if(window.uxLinterActive)return;' +
      'window.uxLinterActive=true;' +
      'const r=' + JSON.stringify(this.rules) + ';' +
      'const v=[];' +
      'const s=document.createElement("style");' +
      's.textContent=".ux-linter-violation{position:relative!important;transition:all 0.3s ease!important}.ux-linter-violation.error{outline:3px solid #ff4444!important;outline-offset:2px!important;background-color:rgba(255,68,68,0.1)!important}.ux-linter-violation.warning{outline:3px solid #ffbb33!important;outline-offset:2px!important;background-color:rgba(255,187,51,0.1)!important}.ux-linter-violation:hover{outline-width:4px!important;box-shadow:0 0 8px rgba(0,0,0,0.2)!important}.ux-linter-tooltip{position:absolute!important;background:#333!important;color:white!important;padding:8px 12px!important;border-radius:4px!important;font-size:14px!important;z-index:10000!important;pointer-events:none!important;opacity:0!important;transition:opacity 0.2s!important;max-width:300px!important;box-shadow:0 2px 8px rgba(0,0,0,0.2)!important}.ux-linter-violation:hover .ux-linter-tooltip{opacity:1!important}.ux-linter-panel{position:fixed!important;top:20px!important;right:20px!important;background:#fff!important;border-radius:8px!important;box-shadow:0 4px 12px rgba(0,0,0,0.15)!important;padding:16px!important;width:350px!important;z-index:10000!important;font-family:Arial,sans-serif!important;max-height:80vh!important;overflow-y:auto!important}.ux-linter-panel h3{margin:0 0 12px!important;color:#333!important;font-size:16px!important;display:flex!important;justify-content:space-between!important;align-items:center!important}.ux-linter-panel .close-btn{background:none!important;border:none!important;color:#666!important;cursor:pointer!important;font-size:20px!important;padding:0!important;line-height:1!important}.ux-linter-panel .close-btn:hover{color:#333!important}.ux-linter-panel .error-count{color:#ff4444!important;font-weight:bold!important}.ux-linter-panel .warning-count{color:#ffbb33!important;font-weight:bold!important}.ux-linter-panel .violation-list{margin:0!important;padding:0!important;list-style:none!important}.ux-linter-panel .violation-item{padding:12px!important;border-bottom:1px solid #eee!important;font-size:13px!important;cursor:pointer!important}.ux-linter-panel .violation-item:hover{background:#f5f5f5!important}.ux-linter-panel .violation-item.error{color:#ff4444!important;border-left:4px solid #ff4444!important}.ux-linter-panel .violation-item.warning{color:#ffbb33!important;border-left:4px solid #ffbb33!important}.ux-linter-panel .violation-details{margin-top:4px!important;font-size:12px!important;color:#666!important}.ux-linter-panel .violation-element{font-family:monospace!important;background:#f5f5f5!important;padding:2px 4px!important;border-radius:2px!important}.ux-linter-panel .summary{background:#f8f9fa!important;padding:12px!important;border-radius:4px!important;margin-bottom:12px!important;font-size:13px!important}.ux-linter-panel .summary strong{display:block!important;margin-bottom:4px!important}.ux-linter-violation.highlight{animation:highlight 1.5s ease-in-out!important;z-index:10001!important}@keyframes highlight{0%{box-shadow:0 0 0 0 rgba(255,68,68,0.8),0 0 0 0 rgba(255,68,68,0.4)}50%{box-shadow:0 0 0 20px rgba(255,68,68,0),0 0 0 10px rgba(255,68,68,0)}100%{box-shadow:0 0 0 0 rgba(255,68,68,0),0 0 0 0 rgba(255,68,68,0)}}.ux-linter-export-btn{background:#4CAF50!important;color:white!important;border:none!important;padding:8px 12px!important;border-radius:4px!important;cursor:pointer!important;font-size:13px!important;margin:8px 4px!important}.ux-linter-export-btn:hover{background:#45a049!important}.ux-linter-export-options{display:flex!important;justify-content:center!important;margin-top:12px!important;padding-top:12px!important;border-top:1px solid #eee!important}";' +
      'document.head.appendChild(s);' +
      'function c(e){const r=e.getBoundingClientRect();return r.width<44||r.height<44}' +
      'function t(e){const s=window.getComputedStyle(e);return!s.color||!s.backgroundColor}' +
      'function a(e){return!e.hasAttribute("alt")}' +
      'const f={buttonSize:c,textContrast:t,altText:a};' +
      'document.querySelectorAll(".ux-linter-violation").forEach(e=>{e.classList.remove("ux-linter-violation","error","warning","highlight");const t=e.querySelector(".ux-linter-tooltip");t&&t.remove()});' +
      'Object.entries(r).forEach(([n,rule])=>{document.querySelectorAll(rule.selector).forEach(e=>{try{const c=f[n];if(c&&c(e)){v.push({e,n,m:rule.message,s:rule.severity})}}catch(e){console.error("Error checking rule:",n,e)}})});' +
      'v.forEach((v,i)=>{v.e.classList.add("ux-linter-violation",v.s);v.e.setAttribute("data-violation-id",i);const t=document.createElement("div");t.className="ux-linter-tooltip";t.textContent=v.m;const r=v.e.getBoundingClientRect();t.style.top=r.bottom+5+"px";t.style.left=r.left+"px";v.e.appendChild(t)});' +
      'const e=v.filter(v=>v.s==="error").length;' +
      'const w=v.filter(v=>v.s==="warning").length;' +
      'console.log("UX Linter found "+e+" errors and "+w+" warnings");' +
      'const p=document.createElement("div");' +
      'p.className="ux-linter-panel";' +
      'p.innerHTML="<h3>UX Linter Results <button class=\\"close-btn\\">&times;</button></h3>" +' +
      '"<div class=\\"summary\\">" +' +
      '"<strong>Summary</strong>" +' +
      '"<div>Errors: <span class=\\"error-count\\">"+e+"</span></div>" +' +
      '"<div>Warnings: <span class=\\"warning-count\\">"+w+"</span></div>" +' +
      '"</div>" +' +
      '"<ul class=\\"violation-list\\">" +' +
      'v.map((v,i)=>"<li class=\\"violation-item "+v.s+"\\" data-violation-id=\\"+i+\\">" +' +
      '"<div>"+v.m+"</div>" +' +
      '"<div class=\\"violation-details\\">" +' +
      '"Rule: <span class=\\"violation-element\\">"+v.n+"</span>" +' +
      '"</div>" +' +
      '"</li>").join("") +' +
      '"</ul>" +' +
      '"<div class=\\"ux-linter-export-options\\">" +' +
      '"<button class=\\"ux-linter-export-btn\\" data-format=\\"json\\">Export JSON</button>" +' +
      '"<button class=\\"ux-linter-export-btn\\" data-format=\\"csv\\">Export CSV</button>" +' +
      '"<button class=\\"ux-linter-export-btn\\" data-format=\\"html\\">Export HTML</button>" +' +
      '"</div>";' +
      'document.body.appendChild(p);' +
      'p.querySelector(".close-btn").addEventListener("click",function(){p.remove();window.uxLinterActive=false;});' +
      'p.querySelectorAll(".violation-item").forEach(item=>{item.addEventListener("click",function(){const id=this.getAttribute("data-violation-id");const elements=document.querySelectorAll(".ux-linter-violation");elements.forEach(el=>el.classList.remove("highlight"));const element=elements[id];if(element){element.scrollIntoView({behavior:"smooth",block:"center"});element.classList.add("highlight");setTimeout(()=>element.classList.remove("highlight"),1500)}})});' +
      'p.querySelectorAll(".ux-linter-export-btn").forEach(btn=>{btn.addEventListener("click",function(){const format=this.getAttribute("data-format");const data=v.map(v=>({rule:v.n,message:v.m,severity:v.s,element:v.e.tagName,text:v.e.textContent.trim().substring(0,50)}));let content,filename,type;switch(format){case"json":content=JSON.stringify(data,null,2);filename="ux-linter-report.json";type="application/json";break;case"csv":content="Rule,Message,Severity,Element,Text\\n"+data.map(d=>`"${d.rule}","${d.message}","${d.severity}","${d.element}","${d.text}"`).join("\\n");filename="ux-linter-report.csv";type="text/csv";break;case"html":content="<html><head><title>UX Linter Report</title><style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;text-align:left;border:1px solid #ddd}th{background:#f5f5f5}.error{color:#ff4444}.warning{color:#ffbb33}</style></head><body><h1>UX Linter Report</h1><p>Generated on "+new Date().toLocaleString()+"</p><table><tr><th>Rule</th><th>Message</th><th>Severity</th><th>Element</th><th>Text</th></tr>"+data.map(d=>`<tr><td>${d.rule}</td><td>${d.message}</td><td class=\\"${d.severity}\\">${d.severity}</td><td>${d.element}</td><td>${d.text}</td></tr>`).join("")+"</table></body></html>";filename="ux-linter-report.html";type="text/html";break}const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)})});' +
      'setTimeout(()=>{p.style.opacity="0";setTimeout(()=>{p.remove();window.uxLinterActive=false;},300)},30000)' +
      '} catch(e) {' +
      'console.error("UX Linter error:",e);' +
      'window.uxLinterActive=false;' +
      '}' +
    '})();';

    return script;
  }
}

// Make sure the class is available globally
window.UXLinterGenerator = UXLinterGenerator;

// Example usage:
const generator = new UXLinterGenerator();

// Add rules
generator.addRule('buttonSize', {
  selector: 'button, [role="button"], .btn, input[type="button"], input[type="submit"]',
  check: 'element.getBoundingClientRect().width < 100 || element.getBoundingClientRect().height < 40',
  message: 'Button is too small',
  severity: 'warning'
});

generator.addRule('colorContrast', {
  selector: 'p, h1, h2, h3, h4, h5, h6, span, a, button, input, label',
  check: `(function() {
    const style = window.getComputedStyle(element);
    const textColor = style.color;
    const bgColor = style.backgroundColor;
    const textRGB = parseRGB(textColor);
    const bgRGB = parseRGB(bgColor);
    if (textRGB && bgRGB) {
      const textLuminance = calculateLuminance(textRGB);
      const bgLuminance = calculateLuminance(bgRGB);
      const contrastRatio = (Math.max(textLuminance, bgLuminance) + 0.05) / 
                           (Math.min(textLuminance, bgLuminance) + 0.05);
      return contrastRatio < 4.5;
    }
    return false;
  })()`,
  message: 'Low color contrast',
  severity: 'error'
});

// Generate the script
const script = generator.generateScript();
console.log(script); 