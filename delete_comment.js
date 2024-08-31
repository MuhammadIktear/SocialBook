async function deleteComment(commentId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Authentication token is missing');
        return;
    }

    try {
        // Delete the comment
        const deleteResponse = await fetch(`https://phibook-f17w.onrender.com/posts/allcomment/?comment_id=${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteResponse.ok) {
            throw new Error('Failed to delete comment');
        }

        // Remove the comment from the DOM
        const commentElement = document.getElementById(`comment-${commentId}`);
        if (commentElement) {
            commentElement.remove();
        }

        // Optionally, show a success message
        alert('Comment deleted successfully!');

    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment');
    }
}
