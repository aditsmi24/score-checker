const GOOGLE_CLIENT_ID = "14550354194-4b1dvsj59hutci3qqfb2vb988e963t90.apps.googleusercontent.com";
const ALLOWED_EMAIL = "25f3004760@ds.study.iitm.ac.in";

const loginScreen = document.querySelector("#login-screen");
const scoreApp = document.querySelector("#score-app");
const loginError = document.querySelector("#login-error");

function showScores() {
  loginScreen.hidden = true;
  scoreApp.hidden = false;
}

function decodeGoogleCredential(credential) {
  const payload = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(atob(payload).split("").map((character) =>
    `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`
  ).join("")));
}

function handleGoogleSignIn(response) {
  try {
    const profile = decodeGoogleCredential(response.credential);
    const allowed = profile.email === ALLOWED_EMAIL && profile.email_verified;

    if (!allowed) {
      loginError.textContent = `Please sign in with ${ALLOWED_EMAIL}.`;
      google.accounts.id.disableAutoSelect();
      return;
    }

    sessionStorage.setItem("score-checker-signed-in", "true");
    showScores();
  } catch {
    loginError.textContent = "Google sign-in could not be completed. Please try again.";
  }
}

function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true
  });
  google.accounts.id.renderButton(document.querySelector("#google-signin-button"), {
    theme: "outline",
    size: "large",
    shape: "rectangular",
    text: "signin_with",
    width: 280
  });
}

window.addEventListener("load", () => {
  if (sessionStorage.getItem("score-checker-signed-in") === "true") {
    showScores();
  }

  const waitForGoogle = window.setInterval(() => {
    if (window.google?.accounts?.id) {
      window.clearInterval(waitForGoogle);
      initializeGoogleSignIn();
    }
  }, 50);
});

document.querySelector("#logout-button").addEventListener("click", () => {
  sessionStorage.removeItem("score-checker-signed-in");
  google.accounts.id.disableAutoSelect();
  scoreApp.hidden = true;
  loginScreen.hidden = false;
  loginError.textContent = "";
});
