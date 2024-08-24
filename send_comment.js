async function sendComment(postId) {
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    let username = "";
    let userImage = "";

    if (!userId) {
        alert('User ID is not available');
        return;
    }

    try {
        // Fetch user profile data
        const response = await fetch(userProfilesApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        data.forEach(profile => {
            if (profile.id === parseInt(userId)) {
                username = profile.username;
                userImage = profile.image;
            }
        });

        const commentText = document.getElementById(`comment-text-${postId}`).value;
        if (!commentText) {
            alert('Comment cannot be empty');
            return;
        }

        // Post comment
        const commentResponse = await fetch(`http://127.0.0.1:8000/posts/allcomment/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: userId,
                comment: commentText,
                commentpost: postId
            })
        });

        if (!commentResponse.ok) {
            throw new Error('Failed to post comment');
        }

        const newComment = await commentResponse.json();

        // Clear the input field
        document.getElementById(`comment-text-${postId}`).value = '';

        // Add the new comment to the DOM
        const commentSection = document.getElementById(`comments-container-${postId}`);
        const commentElement = document.createElement('div');
        commentElement.className = 'comments';
        commentElement.id = `comment-${newComment.id}`;
        commentElement.innerHTML = `
            <img src="${userImage || 'images/profile-pic.png'}" alt="Profile Image">
            <div class="single-comment">
                <div class="ellipsis-icon">
                    <div>
                        <p>${username}</p>
                        <small>${newComment.comment}</small>
                    </div>
                    <div onclick="toggleMenu(event, this)">
                        <a href="javascript:void(0);"><i class="fa-solid fa-ellipsis"></i></a>
                        <div class="edit-menu" style="display: none;">
                            <div class="edit-menu-inner">
                                <div class="edit-link">
                                    <a href="#" onclick="editComment(${newComment.id})">Edit</a>
                                    <a href="#" onclick="deleteComment(${newComment.id})">Delete</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        commentSection.prepend(commentElement);

    } catch (error) {
        console.error('Error posting comment:', error);
    }
}
