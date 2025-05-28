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
      'p.querySelectorAll(".ux-linter-export-btn").forEach(btn=>{btn.addEventListener("click",function(){const format=this.getAttribute("data-format");const data=v.map(v=>({rule:v.n,message:v.m,severity:v.s,element:v.e.tagName,selector:v.e.getAttribute("class")||v.e.id}));let content,filename,mimeType;switch(format){case"json":content=JSON.stringify(data,null,2);filename="ux-linter-report.json";mimeType="application/json";break;case"csv":content="Rule,Message,Severity,Element,Selector\\n"+data.map(d=>`${d.rule},${d.message},${d.severity},${d.element},${d.selector}`).join("\\n");filename="ux-linter-report.csv";mimeType="text/csv";break;case"html":content="<html><head><title>UX Linter Report</title><style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}th{background-color:#f5f5f5}.error{color:#ff4444}.warning{color:#ffbb33}</style></head><body><h1>UX Linter Report</h1><p>Generated on "+new Date().toLocaleString()+"</p><table><tr><th>Rule</th><th>Message</th><th>Severity</th><th>Element</th><th>Selector</th></tr>"+data.map(d=>`<tr class=${d.severity}><td>${d.rule}</td><td>${d.message}</td><td>${d.severity}</td><td>${d.element}</td><td>${d.selector}</td></tr>`).join("")+"</table></body></html>";filename="ux-linter-report.html";mimeType="text/html";break}const blob=new Blob([content],{type:mimeType});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)})});' +
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