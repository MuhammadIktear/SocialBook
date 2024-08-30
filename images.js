document.addEventListener('DOMContentLoaded', function() {
    const imagesContainer = document.querySelector('.images');
    const sidebar_title = document.querySelector('.sidebar-title');
    
    const postsApiUrl = 'http://127.0.0.1:8000/posts/allpost/';
    const userId = localStorage.getItem('user_id');  
    const token = localStorage.getItem('token'); 

    fetch(postsApiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': `Token ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let imagesHtml = '';
        let count = 0;

        if (Array.isArray(data)) {
            sidebar_title.style.display = 'block';
            data.forEach(post => {
                if (count < 6 && post.created_by ===  parseInt(userId) && post.image) {
                    const imageUrl = post.image || 'images/default-image.png';
                    imagesHtml += `<img src="${imageUrl}" alt="Post Image">`;
                    count++;
                }
            });
        }

        if (imagesHtml) {
            imagesContainer.innerHTML = imagesHtml;
        } else {
            imagesContainer.innerHTML = '<p>No images to display.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        imagesContainer.innerHTML = '<p>Error fetching posts. Please try again later.</p>';
    });
});
