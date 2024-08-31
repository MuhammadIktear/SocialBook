const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/ds97wytcs/upload';
const uploadPreset = 'xzygjgsf';

let currentPostId = null;
let currentImage = null;
let currentVideo = null;
let existingImage = '';
let existingVideo = '';

// Show the edit toast with current post content
function showEditToast(postId, currentText, currentImageUrl, currentVideoUrl) {
    document.getElementById('edit-toast').style.display = 'block';
    document.getElementById('edit-caption').value = currentText;
    existingImage = currentImageUrl;
    existingVideo = currentVideoUrl;

    const imagePreview = document.getElementById('edit-image-preview');
    const videoPreview = document.getElementById('edit-video-preview');

    if (currentImageUrl) {
        imagePreview.src = currentImageUrl;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
    }

    if (currentVideoUrl) {
        videoPreview.src = currentVideoUrl;
        videoPreview.style.display = 'block';
    } else {
        videoPreview.style.display = 'none';
    }

    currentPostId = postId;
}

// Hide the edit toast
function hideEditToast() {
    document.getElementById('edit-toast').style.display = 'none';
}

// Preview selected image for editing
function previewEditImage(event) {
    const imageFile = event.target.files[0];
    const imagePreview = document.getElementById('edit-image-preview');

    if (imageFile) {
        const imageUrl = URL.createObjectURL(imageFile);
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
        currentImage = imageFile;
    } else {
        imagePreview.src = existingImage;
        imagePreview.style.display = existingImage ? 'block' : 'none';
        currentImage = null;
    }
}

// Preview selected video for editing
function previewEditVideo(event) {
    const videoFile = event.target.files[0];
    const videoPreview = document.getElementById('edit-video-preview');

    if (videoFile) {
        const videoUrl = URL.createObjectURL(videoFile);
        videoPreview.src = videoUrl;
        videoPreview.style.display = 'block';
        currentVideo = videoFile;
    } else {
        videoPreview.src = existingVideo;
        videoPreview.style.display = existingVideo ? 'block' : 'none';
        currentVideo = null;
    }
}

// Upload file to Cloudinary and get URL
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            return data.secure_url;
        } else {
            console.error('Error uploading file:', response.statusText);
            alert('Failed to upload file. Please try again.');
            return null;
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file');
        return null;
    }
}

// Update the post via API
async function updatePost() {
    const caption = document.getElementById('edit-caption').value.trim();
    if (!caption) {
        alert('Caption cannot be empty');
        return;
    }

    const token = localStorage.getItem('token');
    const updatedImage = currentImage ? await uploadToCloudinary(currentImage) : existingImage;
    const updatedVideo = currentVideo ? await uploadToCloudinary(currentVideo) : existingVideo;

    if (!updatedImage && currentImage) {
        return;
    }
    if (!updatedVideo && currentVideo) {
        return;
    }

    const postData = {
        text: caption,
        image: updatedImage,
        video: updatedVideo
    };

    try {
        const response = await fetch(`https://phibook-f17w.onrender.com/posts/allpost/${currentPostId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            const updatedPost = await response.json();
            const postElement = document.getElementById(`post-${currentPostId}`);
            if (postElement) {
                const postTextElement = postElement.querySelector('.post-text');
                if (postTextElement) {
                    postTextElement.innerText = updatedPost.text;
                } else {
                    console.error(`Post text element not found for post ${currentPostId}`);
                }

                // Handle image update
                const imgElement = postElement.querySelector('.post-img');
                if (updatedPost.image) {
                    if (imgElement) {
                        imgElement.src = updatedPost.image;
                    } else {
                        const newImgElement = document.createElement('img');
                        newImgElement.src = updatedPost.image;
                        newImgElement.className = 'post-img';
                        postElement.appendChild(newImgElement);
                    }
                } else if (imgElement) {
                    imgElement.remove();
                }

                // Handle video update
                const videoElement = postElement.querySelector('.post-video');
                if (updatedPost.video) {
                    if (videoElement) {
                        const sourceElement = videoElement.querySelector('source');
                        if (sourceElement) {
                            sourceElement.src = updatedPost.video;
                            videoElement.load();
                        }
                    } else {
                        const newVideoElement = document.createElement('video');
                        newVideoElement.className = 'post-video';
                        newVideoElement.controls = true;
                        const sourceElement = document.createElement('source');
                        sourceElement.src = updatedPost.video;
                        sourceElement.type = 'video/mp4';
                        newVideoElement.appendChild(sourceElement);
                        postElement.appendChild(newVideoElement);
                    }
                } else if (videoElement) {
                    videoElement.remove();
                }

                hideEditToast();
                alert('Post updated successfully!');
                window.location.reload();
            } else {
                console.error(`Post element with ID post-${currentPostId} not found`);
            }
        } else {
            alert('Failed to update post. Please try again.');
        }
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Error updating post');
    }
}

// Show the delete confirmation
function showDeleteConfirm(postId) {
    document.getElementById('confirm-delete').style.display = 'block';
    currentPostId = postId;
}

// Hide the delete confirmation
function hideDeleteConfirm() {
    document.getElementById('confirm-delete').style.display = 'none';
}

// Confirm and delete the post
async function confirmDelete() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`https://phibook-f17w.onrender.com/posts/allpost/${currentPostId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        if (response.ok) {
            document.getElementById(`post-${currentPostId}`).remove();
            hideDeleteConfirm();
            alert('Post deleted successfully!');
            window.location.reload();
        } else {
            alert('Failed to delete post. Text/caption is required. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
    }
}
