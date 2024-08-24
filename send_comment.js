async function sendComment(postId) {
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');  // Ensure you retrieve the token if it's required
    let userProfiles = {};
    let username = "";

    if (!userId) {
        alert('User ID is not available');
        return;
    }

    try {
        // Fetch user profiles
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
        // Store user profiles in a map
        data.forEach(profile => {
            if (profile.id === parseInt(userId)) {
                username = profile.username;
                userProfiles[username] = profile.image;
            }
        });

        const commentText = document.getElementById(`comment-text-${postId}`).value;
        if (!commentText) {
            alert('Comment cannot be empty');
            return;
        }

        // Post comment
        const commentResponse = await fetch(`http://127.0.0.1:8000/posts/posts/comments/${postId}/`, {
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

    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Error posting comment');
    }
}
