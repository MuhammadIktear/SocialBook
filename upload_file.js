function showToast(type) {
    // Show the modal
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('toast').style.display = 'block';

    // Show/Hide inputs based on content type
    if (type === 'video') {
        document.getElementById('videoFile').style.display = 'block';
        document.getElementById('videoPreview').style.display = 'none';
        document.getElementById('imageInput').style.display = 'none';
        document.getElementById('imagePreview').style.display = 'none';
    } else if (type === 'photo') {
        document.getElementById('videoFile').style.display = 'none';
        document.getElementById('videoPreview').style.display = 'none';
        document.getElementById('imageInput').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
    } else {
        document.getElementById('videoFile').style.display = 'none';
        document.getElementById('videoPreview').style.display = 'none';
        document.getElementById('imageInput').style.display = 'none';
        document.getElementById('imagePreview').style.display = 'none';
    }
}

function hideToast() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('toast').style.display = 'none';
}

function previewVideo(event) {
    const videoFile = event.target.files[0];
    const videoPreview = document.getElementById('videoPreview');

    if (videoFile) {
        const videoUrl = URL.createObjectURL(videoFile);
        videoPreview.src = videoUrl;
        videoPreview.style.display = 'block';
    } else {
        videoPreview.src = '';
        videoPreview.style.display = 'none';
    }
}

function previewImage(event) {
    const imageFile = event.target.files[0];
    const imagePreview = document.getElementById('imagePreview');

    if (imageFile) {
        const imageUrl = URL.createObjectURL(imageFile);
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
}

async function postContent(event) {
    // Prevent default form submission
    event.preventDefault();

    // Get the type of content being posted
    const videoInput = document.getElementById('videoFile');
    const imageInput = document.getElementById('imageInput');
    const caption = document.getElementById('caption').value.trim();

    // Get user ID and token from local storage
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');

    let contentUrl = '';
    let contentType = '';

    if (videoInput.files[0]) {
        // Handle video
        const videoFile = videoInput.files[0];
        contentType = 'video';
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('upload_preset', 'xzygjgsf'); // Replace with your actual preset

        try {
            const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/ds97wytcs/upload', {
                method: 'POST',
                body: formData
            });
            const cloudinaryData = await cloudinaryResponse.json();
            contentUrl = cloudinaryData.secure_url;
        } catch (error) {
            alert('Video upload failed. Please try again.');
            return;
        }
    } else if (imageInput.files[0]) {
        // Handle image
        const imageFile = imageInput.files[0];
        contentType = 'image';
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'xzygjgsf'); // Replace with your actual preset

        try {
            const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/ds97wytcs/upload', {
                method: 'POST',
                body: formData
            });
            const cloudinaryData = await cloudinaryResponse.json();
            contentUrl = cloudinaryData.secure_url;
        } catch (error) {
            alert('Image upload failed. Please try again.');
            return;
        }
    }

    // Prepare post data
    const postData = {
        created_by: userId,
        [contentType]: contentUrl,
        text: caption,
    };

    // Send the post request to your backend
    const postResponse = await fetch('https://phibook-f17w.onrender.com/posts/allpost/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify(postData)
    });

    if (postResponse.ok) {
        const responseData = await postResponse.json();
        alert('Post created successfully!');
        window.location.reload();
        // Optionally, you can update the UI with the new post
        const contentContainer = document.getElementById('contentContainer');
        if (contentType === 'video') {
            const videoElement = document.createElement('video');
            videoElement.src = responseData.video;
            videoElement.controls = true;
            contentContainer.appendChild(videoElement);
        } else {
            const imageElement = document.createElement('img');
            imageElement.src = responseData.image;
            contentContainer.appendChild(imageElement);
        }

        // Clear the form fields
        videoInput.value = '';
        imageInput.value = '';
        document.getElementById('caption').value = '';

        // Hide the toast after posting
        hideToast();
    } else {
        alert('Failed to create post. Text/caption is required. Please try again.');
    }
}
