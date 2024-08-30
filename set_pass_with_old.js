document.addEventListener("DOMContentLoaded", function () {
    const toast = document.getElementById('pass_change_toast');
    const alertContainer = document.getElementById('alert-container_for_pass_change');
    const alertMessage = document.getElementById('alert-message_for_pass_change');
    const savePasswordBtn = document.getElementById('save-password-btn');

    if (savePasswordBtn) {
        savePasswordBtn.addEventListener("click", function () {
            const oldPassword = document.getElementById("old-password").value;
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            if (newPassword !== confirmPassword) {
                showAlert("New password and confirm password do not match.");
                return;
            }

            if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPassword)) {
                showAlert("Password must contain at least one letter, one number, and one special character, and be at least 8 characters long.");
                return;
            }

            const userId = localStorage.getItem("user_id");
            if (!userId) {
                showAlert("User not logged in.");
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
                    showAlert(data.detail);
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 10000);
                } else {
                    showAlert(data.error || "An error occurred.");
                }
            })
            .catch(error => {
                showAlert("An error occurred. Please try again.");
            });
        });
    }

    function showAlert(message) {
        if (alertMessage && alertContainer) {
            alertMessage.textContent = message;
            alertContainer.style.display = "block";
        }
    }

    window.showChangePasswordToast = function() {
        if (toast) {
            toast.style.display = 'block';
        }
    };

    window.hideToastforChangePass = function() {
        if (toast) {
            toast.style.display = 'none';
        }
    };
});
