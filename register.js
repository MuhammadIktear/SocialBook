document.addEventListener('DOMContentLoaded', async () => {
    const alertContainer = document.getElementById('alert-container');
    const alertMessage = document.getElementById('alert-message');
    const closeAlert = document.getElementById('close-alert');

    if (!alertContainer) {
        console.error("Alert container element not found.");
        return;
    }

    const showAlert = (message) => {
        alertMessage.textContent = message;
        alertContainer.style.display = 'flex'; 
    };

    const hideAlert = () => {
        alertContainer.style.display = 'none'; 
    };
    closeAlert.addEventListener('click', hideAlert);

    const getValue = (id) => document.getElementById(id)?.value.trim();

    async function handleRegistration(event) {
        event.preventDefault();
        
        const registrationForm = event.target;
        const submitButton = registrationForm.querySelector("button[type='submit']");
        
        submitButton.disabled = true;
        submitButton.textContent = "Processing...";

        const username = getValue("username");
        const first_name = getValue("first-name");
        const last_name = getValue("last-name");
        const email = getValue("email");
        const password = getValue("password");
        const confirm_password = getValue("confirm-password");

        if (password !== confirm_password) {
            showAlert("Password and confirm password do not match");
            submitButton.disabled = false;
            submitButton.textContent = "Register";
            return;
        }

        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
            showAlert("Password must contain at least one letter, one number, and one special character, and be at least 8 characters long.");
            submitButton.disabled = false;
            submitButton.textContent = "Register";
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/user/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, first_name, last_name, email, password, confirm_password }),
            });

            if (!response.ok) {
                showAlert("An error occurred during registration. Please ensure email ID and unique username. Please try again.");
                submitButton.disabled = false;
                submitButton.textContent = "Register";
                return;
            }

            const data = await response.json();
            console.log(data);
            showAlert("Check your email for confirmation.");
        } catch (error) {
            console.error("Registration error:", error);
            showAlert("An error occurred during registration. Please try again.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Register";
        }
    }

    async function handleLogin(event) {
        event.preventDefault();

        const username = getValue("login-username");
        const password = getValue("login-password");

        if (!username || !password) {
            showAlert("Username and password are required.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/user/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                showAlert(`Login failed: ${errorData.detail || response.statusText}`);
                return;
            }

            const data = await response.json();
            console.log(data);

            if (data.token && data.user_id) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_id", data.user_id);
                window.location.href = "index.html";
            } else {
                showAlert("Invalid login credentials.");
            }
        } catch (error) {
            console.error("Login error:", error);
            showAlert("An error occurred during login. Please try again.");
        }
    }

    const registrationForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");

    if (registrationForm) {
        registrationForm.addEventListener("submit", handleRegistration);
    } else {
        console.error("Registration form not found.");
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    } else {
        console.error("Login form not found.");
    }
});
