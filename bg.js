// Background worker: cross-origin fetches the content script cannot make (CORS).
chrome.runtime.onMessage.addListener((msg,sender,send)=>{
  if(msg&&msg.type==="fds"){
    fetch("https://www.firstdown.studio/rankings/flex",{cache:"no-store"})
      .then(r=>r.text()).then(html=>send({ok:true,html}))
      .catch(e=>send({ok:false,err:String(e)}));
    return true; // async response
  }
  // v10.3: ESPN scoreboard (Vegas spread + total per game) for DEF matchup math. ESPN public API only.
  if(msg&&msg.type==="get"&&typeof msg.url==="string"&&msg.url.startsWith("https://site.api.espn.com/")){
    fetch(msg.url,{cache:"no-store"}).then(r=>r.json()).then(json=>send({ok:true,json}))
      .catch(e=>send({ok:false,err:String(e)}));
    return true;
  }
});
