function sanitizePath(raw){
  if(!raw) return '';
  const parts = raw.match(/[MmLlCcQqTtAaZz]|[0-9+\-\.eE,\s]+/g);
  if(!parts) return '';
  return parts.join('');
}

// Patch Element.setAttribute to sanitize 'd' values
(function(){
  try{
    const orig = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value){
      if(name === 'd'){
        try{ value = sanitizePath(String(value)); }catch(e){}
      }
      return orig.call(this, name, value);
    };
  }catch(e){console.error('sanitize patch setAttribute failed', e)}
})();

// Patch Path2D constructor to sanitize string input
(function(){
  try{
    const Orig = window.Path2D;
    if(typeof Orig === 'function'){
      const Pat = function(d){
        if(typeof d === 'string') d = sanitizePath(d);
        return new Orig(d);
      };
      Pat.prototype = Orig.prototype;
      window.Path2D = Pat;
    }
  }catch(e){console.error('sanitize patch Path2D failed', e)}
})();

export { sanitizePath };