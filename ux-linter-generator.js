class UXLinterGenerator {
  constructor() {
    this.rules = {};
  }

  addRule(name, rule) {
    this.rules[name] = rule;
  }

  generateScript() {
    if (Object.keys(this.rules).length === 0) {
      return 'No rules selected';
    }

    const script = [
      'javascript:(function(){',
      'var r=' + JSON.stringify(this.rules) + ';',
      'var s=document.createElement("style");',
      's.textContent=".ux-linter-violation{outline:2px solid red}";',
      'document.head.appendChild(s);',
      'function c(e){return e.offsetWidth<44||e.offsetHeight<44}',
      'function t(e){return!e.style.color}',
      'function a(e){return!e.alt}',
      'var f={buttonSize:c,textContrast:t,altText:a};',
      'for(var n in r){var e=document.querySelectorAll(r[n].selector);for(var i=0;i<e.length;i++){if(f[n]&&f[n](e[i])){e[i].classList.add("ux-linter-violation")}}}',
      '})();'
    ].join('');

    return script;
  }
}

// Make sure the class is available globally
window.UXLinterGenerator = UXLinterGenerator; 