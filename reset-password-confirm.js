document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("reset-confirm-form");
    const alertContainer = document.getElementById("alert-container");
    const alertMessage = document.getElementById("alert-message");
    const submitButton = form.querySelector("button[type='submit']");

    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
    const token = urlParams.get('token');

    if (!uid || !token) {
        showAlert("Invalid link.");
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const newPassword = form.elements["new_password"].value;
        const confirmPassword = form.elements["confirm_password"].value;

        if (newPassword !== confirmPassword) {
            showAlert("New password and confirm password do not match.");
            return;
        }

        if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPassword)) {
            showAlert("Password must contain at least one letter, one number, and one special character, and be at least 8 characters long.");
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        fetch(`http://127.0.0.1:8000/user/reset-password-confirm/?uid=${uid}&token=${token}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_password: newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail) {
                showAlert(data.detail);
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);
            } else {
                showAlert(data.error || "An error occurred.");
                submitButton.disabled = false;
                submitButton.textContent = "Reset Password";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert("An error occurred. Please try again.");
            submitButton.disabled = false;
            submitButton.textContent = "Reset Password";
        });
    });

    function showAlert(message) {
        alertMessage.textContent = message;
        alertContainer.style.display = "block";
    }
});
