document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        fetchUserProfile(userId);
    }

    // Set up event listeners for actions
    document.getElementById('save-btn').addEventListener('click', saveProfile);
    document.getElementById('image-upload-btn').addEventListener('click', updateImage);
});

function showProfileEditToast() {
    document.getElementById('update_profile_toast').style.display = 'block';
}

function hideToast() {
    document.getElementById('update_profile_toast').style.display = 'none';
}

function fetchUserProfile(userId) {
    fetch(`https://phibook-f17w.onrender.com/user/useraccounts/${userId}/`)
        .then(response => response.json())
        .then(data => {
            // Fill form fields with existing data
            document.getElementById('profile-image').src = data.image;
            document.getElementById('first-name').value = data.first_name;
            document.getElementById('last-name').value = data.last_name;
            document.getElementById('bio').value = data.bio;
            document.getElementById('about').value = data.about;
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
}

function updateImage() {
    const fileInPATCH = document.getElementById('image-upload');
    const file = fileInPATCH.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'xzygjgsf');

        fetch('https://api.cloudinary.com/v1_1/ds97wytcs/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Image upload successful:', data);
            document.getElementById('profile-image').src = data.secure_url;
            // Optionally, save the updated image URL in the user's profile
            updateProfileImage(data.secure_url);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
    }
}

function updateProfileImage(imageUrl) {
    const userId = localStorage.getItem('user_id');
    fetch(`https://phibook-f17w.onrender.com/user/useraccounts/${userId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust token handling as needed
        },
        body: JSON.stringify({ image: imageUrl })
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            showAlert('Profile image updated successfully.');
        } else {
            showAlert('Failed to update profile image.');
        }
    })
    .catch(error => {
        console.error('Error updating profile image:', error);
        showAlert('An error occurred while updating the profile image.');
    });
}

function saveProfile() {
    const userId = localStorage.getItem('user_id');
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const bio = document.getElementById('bio').value;
    const about = document.getElementById('about').value;

    const updatedData = {
        first_name: firstName,
        last_name: lastName,
        bio: bio,
        about: about
    };

    fetch(`https://phibook-f17w.onrender.com/user/useraccounts/${userId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust token handling as needed
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            showAlert('Profile updated successfully.');
        } else {
            showAlert('Failed to update profile.');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showAlert('An error occurred while updating the profile.');
    });
}

function showAlert(message) {
    const alertContainer = document.getElementById('alert-container');
    const alertMessage = document.getElementById('alert-message');
    alertMessage.textContent = message;
    alertContainer.style.display = 'block';

    document.getElementById('close-alert').onclick = () => {
        alertContainer.style.display = 'none';
    };
}
