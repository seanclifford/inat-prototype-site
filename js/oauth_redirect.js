import { performTokenRequest, redirectToPreAuthLocation } from "./auth.js"

(async () => {
      
  const urlParams = new URLSearchParams(window.location.search);
  const auth_code = urlParams.get('code');

  await performTokenRequest(auth_code);

  let div = document.getElementById('result');
  div.textContent = "Completed requesting access token!";
  redirectToPreAuthLocation();
})();