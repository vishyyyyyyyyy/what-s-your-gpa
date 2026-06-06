import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfIbP6u9A_8PUqhCxqJ2ZhpwgxbDRgISU",
  authDomain: "what-s-your-gpa.firebaseapp.com",
  projectId: "what-s-your-gpa",
  storageBucket: "what-s-your-gpa.firebasestorage.app",
  messagingSenderId: "378032939709",
  appId: "1:378032939709:web:096a51ee09f6d7f6fc8dd4",
  measurementId: "G-0CBXB1JJ4E"
};

const decorationThemes = {
    red: {
        "top-left": "assets/red/bigbutton.svg",
        "top-right-swirl": "assets/red/greenswirl.svg",
        "right-star": "assets/red/star.svg",
        "mid-left-star": "assets/red/button.svg",
        "bottom-left": "assets/red/apple.svg",
        "bottom-right-swirl": "assets/red/biggreenswirl.svg",
        "bottom-right-small-swirl": "assets/red/whiteswirl.svg",
    },
    pink: {
        "top-left": "assets/pink/bigbutton.svg",
        "top-right-swirl": "assets/pink/browlswirl.svg",
        "right-star": "assets/pink/star.svg",
        "mid-left-star": "assets/pink/button.svg",
        "bottom-left": "assets/pink/ladybug.svg",
        "bottom-right-swirl": "assets/pink/bigbrownswirl.svg",
        "bottom-right-small-swirl": "assets/pink/whiteswirl.svg",
    },
};

const applyThemeAssets = (isPinkTheme) => {
    const themeName = isPinkTheme ? "pink" : "red";
    const sourceMap = decorationThemes[themeName];

    document.querySelectorAll("[data-theme-src]").forEach((element) => {
        const themeKey = element.getAttribute("data-theme-src");

        if (themeKey && sourceMap[themeKey]) {
            element.src = sourceMap[themeKey];
        }
    });
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase initialized", app);

document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.querySelector(".toggle-switch input");
    const isPinkTheme = document.body.classList.contains("pink-theme");

    if (toggleSwitch) {
        toggleSwitch.checked = isPinkTheme;

        toggleSwitch.addEventListener("change", () => {
            if (toggleSwitch.checked) {
                document.body.classList.add("pink-theme");
            } else {
                document.body.classList.remove("pink-theme");
            }

            applyThemeAssets(toggleSwitch.checked);
        });
    }

    applyThemeAssets(isPinkTheme);

    const authForm = document.querySelector("[data-auth-form]");

    // Redirect logic: if logged in, send to dashboard; if not logged in and on dashboard, send to login.
    const page = window.location.pathname.split('/').pop().toLowerCase();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // If user is on public pages, send to dashboard
            if (!page || page === "" || page.endsWith("index.html") || page.endsWith("login.html") || page.endsWith("signin.html") || page.endsWith("signup.html")) {
                window.location.href = "dashboard.html";
            }
        } else {
            // If not authenticated and on dashboard, redirect to login
            if (page.endsWith("dashboard.html")) {
                window.location.href = "login.html";
            }
        }
    });

    if (!authForm) {
        return;
    }

    const statusMessage = authForm.querySelector("[data-auth-status]");
    const submitButton = authForm.querySelector("button[type='submit']");
    const authMode = authForm.getAttribute("data-auth-form");

    const showStatus = (message, isError = false) => {
        if (!statusMessage) {
            return;
        }

        statusMessage.textContent = message;
        statusMessage.dataset.state = isError ? "error" : "success";
    };

    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(authForm);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "").trim();
        const displayName = String(formData.get("name") || "").trim();

        if (!email || !password) {
            showStatus("Enter both email and password.", true);
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            if (authMode === "signup") {
                const credential = await createUserWithEmailAndPassword(auth, email, password);

                if (displayName) {
                    await updateProfile(credential.user, { displayName });
                }

                showStatus("Account created. Redirecting...");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                showStatus("Signed in. Redirecting...");
            }

            // send to dashboard after success
            window.location.href = "dashboard.html";
        } catch (error) {
            showStatus(error.message, true);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
});
