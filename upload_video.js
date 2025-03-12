function showToast() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('toast').style.display = 'block';
}

function hideToast() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('toast').style.display = 'none';
}

// Event listener for the form submission (this assumes the form has the id 'postForm')
document.getElementById('postButton').addEventListener('click', async function (event) {
    event.preventDefault();

    // Get the video file input element
    const videoInput = document.getElementById('videoFile');
    if (!videoInput) {
        alert('Video file input not found.');
        return;
    }

    // Get user ID and token from local storage
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');

    // Get the video file and text input values
    const videoFile = videoInput.files[0];
    const text = document.getElementById('caption').value.trim() || ' ';

    // Check if video is provided
    let videoUrl = '';
    if (videoFile) {
        // Upload the video to Cloudinary
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('upload_preset', 'xzygjgsf'); // Replace with your actual preset

        try {
            const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/ds97wytcs/upload', {
                method: 'POST',
                body: formData
            });

            const cloudinaryData = await cloudinaryResponse.json();
            videoUrl = cloudinaryData.secure_url;
        } catch (error) {
            alert('Video upload failed. Please try again.');
            return;
        }
    }

    // Prepare post data
    const postData = {
        userId: userId,
        video: videoUrl,
        text: text,
    };

    // Send the post request to your backend
    try {
        const postResponse = await fetch('https://phibook-f17w.onrender.com/posts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}` // Use the token from local storage
            },
            body: JSON.stringify(postData)
        });

        if (postResponse.ok) {
            const responseData = await postResponse.json();
            alert('Post created successfully!');

            // Optionally, you can update the UI with the new post
            const videoContainer = document.getElementById('videoContainer');
            const videoElement = document.createElement('video');
            videoElement.src = responseData.video;
            videoElement.controls = true;
            videoContainer.appendChild(videoElement);

            // Clear the form fields
            videoInput.value = '';
            document.getElementById('caption').value = '';

            // Hide the toast after posting
            hideToast();
        } else {
            alert('Failed to create post. Please try again.');
        }
    } catch (error) {
        alert('Failed to create post. Please try again.');
    }
});
