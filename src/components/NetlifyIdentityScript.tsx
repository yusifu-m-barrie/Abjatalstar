/** Runs before React so invite links open the password modal immediately. */
export default function NetlifyIdentityScript() {
  const script = `
(function () {
  var hash = window.location.hash || "";
  var isInvite =
    hash.indexOf("invite_token=") !== -1 ||
    hash.indexOf("confirmation_token=") !== -1 ||
    hash.indexOf("recovery_token=") !== -1;
  var onInviteRoute = window.location.pathname === "/invite";
  if (!isInvite && !onInviteRoute) return;
  if (document.getElementById("netlify-identity-loader")) return;

  window.netlifyIdentitySettings = {
    APIUrl: window.location.origin + "/.netlify/identity",
  };

  window.netlifyIdentityOnLoad = function () {
    if (!window.netlifyIdentity) return;

    window.netlifyIdentity.on("login", function () {
      window.location.replace("/admin");
    });

    window.netlifyIdentity.on("init", function (user) {
      if (user) return;
      if (isInvite) {
        window.netlifyIdentity.open("signup");
      } else if (onInviteRoute) {
        window.netlifyIdentity.open("login");
      }
    });

    if (isInvite) {
      setTimeout(function () {
        if (window.netlifyIdentity && !window.netlifyIdentity.currentUser()) {
          window.netlifyIdentity.open("signup");
        }
      }, 300);
    }
  };

  var s = document.createElement("script");
  s.id = "netlify-identity-loader";
  s.src = "https://identity.netlify.com/v1/netlify-identity-widget.js";
  s.onload = function () {
    if (typeof window.netlifyIdentityOnLoad === "function") {
      window.netlifyIdentityOnLoad();
    }
  };
  document.head.appendChild(s);
})();
`;

  return (
    <script
      id="netlify-identity-bootstrap"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
