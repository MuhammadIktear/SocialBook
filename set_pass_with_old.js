document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("user_id"); // Assuming user ID is stored in local storage

    if (!userId) {
        alert("User not logged in.");
        window.location.href = "login.html";
        return;
    }

    const form = document.getElementById("login-form");
    const alertContainer = document.getElementById("alert-container");
    const alertMessage = document.getElementById("alert-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const oldPassword = form.elements[0].value;
        const newPassword = form.elements[1].value;
        const confirmPassword = form.elements[2].value;

        if (!validatePassword(newPassword)) {
            showAlert("Password must contain at least 1 letter, 1 number, and 1 special character.");
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert("New password and confirm password do not match.");
            return;
        }

        fetch(`http://127.0.0.1:8000/user/change-password/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: userId,
                old_password: oldPassword,
                new_password: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.detail) {
                alert(data.detail);
                window.location.href = "login.html";
            } else {
                showAlert(data.error || "An error occurred.");
            }
        })
        .catch(error => {
            showAlert("An error occurred. Please try again.");
        });
    });

    function validatePassword(password) {
        const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
        return regex.test(password);
    }

    function showAlert(message) {
        alertMessage.textContent = message;
        alertContainer.style.display = "block";
    }
});
