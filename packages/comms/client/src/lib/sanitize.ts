// VERY conservative sanitizer for demo purposes.
// In production, use a vetted HTML sanitizer (DOMPurify with allowedlist) and sanitize server-side where possible.
export function sanitizeHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  // remove script/style/iframe
  tmp.querySelectorAll("script,style,iframe,object,embed").forEach(n=>n.remove());
  // strip on* handlers
  tmp.querySelectorAll("*").forEach((el:any)=>{
    [...el.attributes].forEach((a:any)=>{
      if (a.name.startsWith("on")) el.removeAttribute(a.name);
      if (a.name.startsWith("srcdoc")) el.removeAttribute(a.name);
    });
  });
  return tmp.innerHTML;
}
