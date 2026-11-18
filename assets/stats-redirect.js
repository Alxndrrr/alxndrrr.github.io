/* The next-year route is prebuilt, so the year changes without waiting for a January rebuild. */
(() => {
 const years=(document.currentScript?.dataset.statsYears||'').split(',');
 const current=new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'Europe/Amsterdam'}).format(new Date());
 if(years.includes(current)){
  location.replace(`/het-beste-van/${current}/`);
 } else {
  // An unmaintained static site cannot invent future lists; avoid a broken redirect.
  document.addEventListener('DOMContentLoaded',()=>{
   document.querySelector('h1').textContent=`Stats ${current}`;
   const note=document.createElement('p');note.textContent=`De lijst voor ${current} is nog niet gepubliceerd.`;
   document.querySelector('main').prepend(note);
  });
 }
})();
