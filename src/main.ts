import "./style.css";
import { User, id, init } from "@instantdb/core";

const db = init({
  appId: "5b640925-7328-451d-b79e-a7d4c8b48adb",
});

const appEl = document.querySelector<HTMLDivElement>("#app")!;

function renderLoading() {
  appEl.innerHTML = `<div>Loading...</div>`;
}

function renderAuthError(message: string) {
  appEl.innerHTML = `<div>Uh oh! ${message}</div>`;
}

function renderLoggedInPage(user: User) {
  appEl.innerHTML = `
    <div>
      <h1>Welcome, ${user.email}!</h1>
      <button id='sign-out-button'>Sign out</button>
    </div>
  `;
  const signOutBtn =
    document.querySelector<HTMLButtonElement>("#sign-out-button")!;
  signOutBtn.addEventListener("click", () => {
    db.auth.signOut();
  });
}

function renderSignInPage() {
  const googAuthURI = db.auth.createAuthorizationURL({
    clientName: "google-web",
    redirectURL: window.location.href,
  });
  appEl.innerHTML = `
    <div>
      <form id='email-input-form'>
        <h3>Welcome to log in with Google!</h3>
        <p>
          You have two options:
        </p>
        <p> 
          1. You can click <a href="${googAuthURI}">here</a> to sign in with Google.
        </p>  
        <p> 
         Or, you can use the Google One-Tap button:
        </p>
        <div id="goog-button"></div> 
    </div>
  `;
  const googBtn = document.getElementById("goog-button")!;
  const nonce = id();
  window.google.accounts.id.initialize({
    client_id:
      "873926401300-t33oit5b8j5n0gl1nkk9fee6lvuiaia0.apps.googleusercontent.com",
    callback: (response) => {
      db.auth.signInWithIdToken({
        idToken: response.credential,
        clientName: "google-web",
        nonce: nonce,
      });
    },
    nonce: nonce,
  });
  window.google.accounts.id.renderButton(
    googBtn,
    {
      theme: "outline",
      size: "large",
      type: "standard",
      width: 300,
    },
  );
}


renderLoading();
db.subscribeAuth((auth) => {
  if (auth.error) {
    renderAuthError(auth.error.message);
  } else if (auth.user) {
    renderLoggedInPage(auth.user);
  } else {
    renderSignInPage();
  }
});
