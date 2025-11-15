const authContainer = document.querySelector(".auth-container");
const authForm = document.querySelector(".auth-form");
const fullNameGroup = document.querySelector(".full-name-group");
const confirmPasswordGroup = document.querySelector(".confirm-password-group");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const submitBtn = document.querySelector(".submit-btn");
const authMsg = document.querySelector(".auth-msg");
const body = document.querySelector("body");
const otpContainer = document.querySelector(".otp-container");
const overlay = document.querySelector(".overlay");

document.querySelector(".pass-view-icon").addEventListener("click", () => {
  password.type = "text";
  setTimeout(() => {
    password.type = "password";
  }, 1000);
});

document
  .querySelector(".confirm-pass-view-icon")
  .addEventListener("click", () => {
    confirmPassword.type = "text";
    setTimeout(() => {
      confirmPassword.type = "password";
    }, 1000);
  });

document
  .querySelector(".open-signIn-auth-btn")
  .addEventListener("click", () => {
    switchToSignInMode();
    showAuthContainer();
    overlay.style.display = "block";
  });

document
  .querySelector(".open-signUp-auth-btn")
  .addEventListener("click", () => {
    switchToSignUpMode();
    showAuthContainer();
    overlay.style.display = "block";
  });

// hiding auth container
function hideAuthContainer() {
  setTimeout(() => {
    authContainer.style.display = "none";
  }, 500);
  body.classList.remove("modal-open");
  overlay.style.display = "none";
  authContainer.classList.remove("show-auth-container");
}
// showoing auth container
function showAuthContainer() {
  body.classList.add("modal-open");
  authContainer.classList.add("show-auth-container");
  authContainer.style.display = "block";
}

function showOtpContainer() {
  otpContainer.classList.add("show-auth-container");
  console.log("adding modal");
  otpContainer.style.display = "flex";
  body.classList.add("modal-open");
  overlay.style.display = "block";
}
function hideOtpContainer() {
  otpContainer.classList.remove("show-auth-container");
  body.classList.remove("modal-open");
  overlay.style.display = "none";

  setTimeout(() => {
    otpContainer.style.display = "none";
  }, 500);
}

document
  .querySelector(".auth-container .cancel-btn")
  .addEventListener("click", () => {
    hideAuthContainer();
  });

document
  .querySelector(".auth-container .tab-list")
  .addEventListener("click", (e) => {
    if (e.target.classList == "signUp-ops") {
      switchToSignUpMode();
    } else if (e.target.classList == "signIn-ops") {
      switchToSignInMode();
    }
    console.log("toggling");
  });

function switchToSignUpMode() {
  document.querySelector(".signUp-ops").classList.add("tab-list-active-ops");
  document.querySelector(".signIn-ops").classList.remove("tab-list-active-ops");

  document.querySelector(".body-header h3").innerText = "Sign Up";
  authForm.action = "/api/auth/signup";
  fullNameGroup.style.display = "block";
  confirmPasswordGroup.style.display = "block";
  fullNameGroup.querySelector("input").required = true;
  confirmPasswordGroup.querySelector("input").required = true;
  submitBtn.innerText = "Sign Up";
}

function switchToSignInMode() {
  document.querySelector(".signUp-ops").classList.remove("tab-list-active-ops");
  document.querySelector(".signIn-ops").classList.add("tab-list-active-ops");

  document.querySelector(".body-header h3").innerText = "Sign In";
  authForm.action = "/api/auth/login";
  fullNameGroup.style.display = "none";
  confirmPasswordGroup.style.display = "none";
  fullNameGroup.querySelector("input").required = false;
  confirmPasswordGroup.querySelector("input").required = false;
  submitBtn.innerText = "Sign In";
}

function validatePassword() {
  const pwd = password.value;
  const confirmPwd = confirmPassword.value;

  // Password strength check
  const strongPwd = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  // At least one uppercase, one lowercase, one digit, one special character, and 8+ chars

  if (!strongPwd.test(pwd)) {
    authMsg.textContent =
      "Password must contain uppercase, lowercase, number, special character and be at least 8 characters long.";
    authMsg.style.color = "red";
    // submitBtn.disabled = true;
    return false;
  }

  // Confirm password match check
  if (pwd !== confirmPwd) {
    authMsg.textContent = "Passwords do not match.";
    authMsg.style.color = "red";
    // submitBtn.disabled = true;
    return false;
  }
  return true;
}
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitBtn.innerText == "Sign Up" && !validatePassword()) return;
  console.log(e.target.action);
  const formData = new FormData(e.target);
  const allFormValues = Object.fromEntries(formData.entries()); // converting entries to plain object
  const options = {
    method: "POST", // Specify the HTTP method as POST
    headers: {
      "Content-Type": "application/json", // Inform the server that you are sending JSON data
    },
    body: JSON.stringify(allFormValues), // Convert the JavaScript object to a JSON string
  };
  try {
    const res = await fetch(e.target.action, options);

    //  Parse JSON safely
    const data = await res.json().catch(() => ({}));
    authMsg.style.color = "green";
    authMsg.innerText = data?.message;

    if (!res.ok) {
      authMsg.style.color = "red";
      console.log(`HTTP error! status: ${data.message}`);
      return;
    } else if (e.target.action.split("/").at(-1) == "signup") {
      hideAuthContainer();
      showOtpContainer();
    }
    // successful res data

    console.log(data.message, res.redirected);
    if (res.redirected) {
      window.location.href = res.url;
    }
  } catch (err) {
    console.log("⚡ Fatal error:", err);
  }
});

// document
//   .querySelector(".auth-container .googleAuth-form")
//   .addEventListener("submit", (e) => {
//     e.currentTarget.querySelector("button").innerHTML =
//       "Continuing with Google...";
//     // e.preventDefault();
//   });

//************* OTP container *************

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".code-input");

  // Focus the first input field on page load
  if (inputs.length > 0) {
    inputs[0].focus();
  }

  inputs.forEach((input, index) => {
    // Event to handle moving to the next input
    input.addEventListener("input", () => {
      // Ensure only one digit is entered
      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }
      // Move to the next input if a digit is entered
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Event to handle backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value.length === 0 && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Event to handle pasting a code
    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData(
        "text"
      );
      const digits = pasteData.replace(/\D/g, ""); // Remove non-digit characters

      if (digits) {
        for (let i = 0; i < digits.length; i++) {
          if (index + i < inputs.length) {
            inputs[index + i].value = digits[i];
          }
        }
        // Focus the next empty input after pasting
        const nextEmptyInput = Array.from(inputs).find(
          (inp) => inp.value === ""
        );
        if (nextEmptyInput) {
          nextEmptyInput.focus();
        } else {
          inputs[inputs.length - 1].focus();
        }
      }
    });
  });

  document.querySelector(".otp-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formValuesArr = Object.fromEntries(formData.entries());
    let otp = Object.values(formValuesArr).join("");

    // sending otp
    const options = {
      method: "POST", // Specify the HTTP method as POST
      headers: {
        "Content-Type": "application/json", // Inform the server that you are sending JSON data
      },
      body: JSON.stringify({ otp }), // Convert the JavaScript object to a JSON string
    };

    verifyOtp(options);
    async function verifyOtp(options) {
      try {
        const res = await fetch(
          "http://localhost:3000/api/auth/verify",
          options
        );

        // Parse JSON safely
        const data = await res.json().catch(() => ({}));
        document.querySelector(".otp-message").innerText = data?.message;
        if (!res.ok) {
          // Show server message if available
          console.error("❌ Error:", data.message || `HTTP ${res.status}`);
          return;
        } else {
          hideOtpContainer();
          if (res.redirected) {
            window.location.href = res.url;
          }
        }
        // Success
        console.log("✅ Success:", data.message);
      } catch (err) {
        console.error("⚡ Fatal error:", err);
      }
    }
  });
});
