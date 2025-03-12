async function toggleLike(postId) {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');

    try {
        // Fetch post details to check if user has liked the post
        const postResponse = await fetch(`https://phibook-f17w.onrender.com/posts/allpost/${postId}/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        if (!postResponse.ok) {
            console.error('Error fetching post details');
            return;
        }

        const postData = await postResponse.json();
        const userHasLiked = postData.likes.some(like => like.user === parseInt(userId));

        // Prepare the like/unlike request
        const likeResponse = await fetch(`https://phibook-f17w.onrender.com/posts/${postId}/like/`, {
            method: userHasLiked ? 'DELETE' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ userId: userId })
        });

        if (likeResponse.ok) {
            const data = await likeResponse.json();
            const likedDiv = document.getElementById(`liked-${postId}`);
            const notLikedDiv = document.getElementById(`not-liked-${postId}`);
            const likeCountSpan = document.getElementById(`like-count-${postId}`);

            if (userHasLiked) {
                likedDiv.style.display = 'none';
                notLikedDiv.style.display = 'block';
            } else {
                likedDiv.style.display = 'block';
                notLikedDiv.style.display = 'none';
            }
            likeCountSpan.textContent = data.like_count;
        } else {
            const errorData = await likeResponse.json();
            console.error('Error liking/unliking post:', errorData);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}
