// Edit an existing comment
async function editComment(commentId) {
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const commentDiv = document.getElementById(`comment-${commentId}`);
    const userId = localStorage.getItem('user_id');
    let userProfiles = {};
    let username = "";

    if (!userId) {
        alert('User ID is not available');
        return;
    }

    try {
        const response = await fetch(userProfilesApiUrl, {
            method: 'GET',
            headers: {
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
                userProfiles[username] = profile.image;
            }
        });

        const commentText = commentDiv.querySelector('small').innerText;
        commentDiv.querySelector('small').outerHTML = `
            <textarea id="edit-comment-text-${commentId}" rows="2">${commentText}</textarea>
            <a href="#" onclick="saveComment(${commentId})">Save</a>`;
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        alert('Error fetching user profiles');
    }
}

function saveComment(commentId) {
    const token = localStorage.getItem('token');
    const editedCommentText = document.getElementById(`edit-comment-text-${commentId}`).value;
    const username = localStorage.getItem('username');

    if (!editedCommentText) {
        alert('Comment cannot be empty');
        return;
    }

    fetch(`http://127.0.0.1:8000/posts/posts/comments/${commentId}/update/`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
            user: userId, 
            comment: editedCommentText,
            username: username 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error editing comment:', data.error);
            alert('Error editing comment');
        } else {
            document.getElementById(`edit-comment-text-${commentId}`).outerHTML = `<small>${data.comment}</small>`;
        }
    })
    .catch(error => {
        console.error('Error editing comment:', error);
        alert('Error editing comment');
    });
}
