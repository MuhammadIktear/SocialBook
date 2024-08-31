document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-request-form");
    const alertContainer = document.getElementById("alert-container");
    const alertMessage = document.getElementById("alert-message");
    const closeAlert = document.getElementById("close-alert");

    closeAlert.addEventListener("click", () => {
        alertContainer.style.display = "none";
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = form.elements["email"].value.trim();

        if (!validateEmail(email)) {
            showAlert("Please enter a valid email address.", "error");
            return;
        }
        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        fetch('https://phibook-f17w.onrender.com/user/reset-password-request/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail) {
                showAlert(data.detail, "success");
                form.reset();
            } else {
                showAlert(data.error || "An error occurred.", "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert("An error occurred. Please try again.", "error");
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = "Send Reset Link";
        });
    });

    function showAlert(message, type) {
        alertMessage.textContent = message;
        alertContainer.className = `alert ${type}`;
        alertContainer.style.display = "block";
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
