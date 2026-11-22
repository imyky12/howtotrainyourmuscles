// ---------------------------------------------------------------- deep links and analytics
// Deep links from the exercise pages: /?ex=bbFlat opens that exercise, /?muscle=chest opens that day's plan.
const DEEP=(()=>{const q=new URLSearchParams(location.search),ex=q.get('ex'),m=q.get('muscle');
  if(ex&&EXS[ex])return {ex,group:EXS[ex].group};if(m&&GROUPS[m])return {group:m};return null;})();
if(DEEP&&!LV_DEEP)$('#go').addEventListener('click',()=>setTimeout(()=>{skipIntro();chooseGroup(DEEP.group);if(DEEP.ex)goExercise(DEEP.ex);},0)); // after the story starts
// One call sends an event to whichever analytics the server switched on (PostHog, Google Analytics); a no-op when neither is.
function track(name,props){try{if(window.posthog&&posthog.capture)posthog.capture(name,props);if(window.gtag)gtag('event',name,props||{});}catch(e){}}
