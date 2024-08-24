async function deleteComment(commentId) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    try {
        const response = await fetch(`http://127.0.0.1:8000/posts/posts/comments/${commentId}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                user: userId,
                comment: commentId
            })
        });

        if (response.ok) {
            document.querySelector(`#comment-${commentId}`).remove();
        } else {
            const errorData = await response.json();
            console.error('Error deleting comment:', errorData);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}
