async function editComment(commentId) {
    const userProfilesApiUrl = 'https://phibook-f17w.onrender.com/user/useraccounts/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!userId) {
        alert('User ID is not available');
        return;
    }

    try {
        // Fetch user profile data
        const userProfilesResponse = await fetch(userProfilesApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userProfilesResponse.ok) {
            throw new Error(`HTTP error! Status: ${userProfilesResponse.status}`);
        }

        const userProfiles = await userProfilesResponse.json();

        // Fetch the current comment data
        const commentResponse = await fetch(`https://phibook-f17w.onrender.com/posts/allcomment/?comment_id=${commentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!commentResponse.ok) {
            throw new Error(`HTTP error! Status: ${commentResponse.status}`);
        }

        const commentData = await commentResponse.json();
        const comment = commentData[0]; // Assuming the comment data is an array

        // Get the comment element
        const commentDiv = document.getElementById(`comment-${commentId}`);
        if (!commentDiv) {
            alert('Comment element not found');
            return;
        }

        // Replace comment text with a textarea for editing
        const commentText = commentDiv.querySelector('small').innerText;
        commentDiv.querySelector('small').outerHTML = `
            <textarea id="edit-comment-text-${commentId}" rows="3">${commentText}</textarea>
            <button onclick="saveComment(${commentId})">Save</button>
        `;

    } catch (error) {
        console.error('Error editing comment:', error);
        alert('Error editing comment');
    }
}

async function saveComment(commentId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Authentication token is missing');
        return;
    }

    try {
        // Get the updated comment text
        const updatedCommentText = document.getElementById(`edit-comment-text-${commentId}`).value;
        if (!updatedCommentText.trim()) {
            alert('Comment cannot be empty');
            return;
        }

        // Update the comment
        const updateResponse = await fetch(`https://phibook-f17w.onrender.com/posts/allcomment/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: commentId,
                comment: updatedCommentText
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update comment');
        }

        const updatedComment = await updateResponse.json();

        // Update the comment in the DOM
        const commentDiv = document.getElementById(`comment-${commentId}`);
        if (commentDiv) {
            commentDiv.querySelector('textarea').outerHTML = `
                <small>${updatedComment.comment}</small>
            `;
            commentDiv.querySelector('button').remove(); // Remove the Save button
        }

    } catch (error) {
        console.error('Error saving comment:', error);
        alert('Error saving comment');
    }
}
