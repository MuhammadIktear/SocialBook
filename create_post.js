document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('posts-container');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const postsApiUrl = 'http://127.0.0.1:8000/posts/allpost/';
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const userId = localStorage.getItem('user_id'); // Retrieve user ID from local storage

    let userProfiles = {};
    let currentUser = '';

    // Fetch user profiles
    fetch(userProfilesApiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Create a map of user profiles with user ID as the key
        data.forEach(profile => {
            userProfiles[profile.id] = {
                username: profile.username,
                image: profile.image || 'images/profile-pic.png' // Default image if none provided
            };
            if (profile.id == userId) {
                currentUser = profile.username;
            }
        });

        // Fetch posts
        return fetch(postsApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (Array.isArray(data)) {
            data.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post-container');

                const postHtml = `
                    <div class="post-row">
                        <div class="user-profile">
                            <img src="${userProfiles[post.created_by]?.image || 'images/profile-pic.png'}" alt="Profile Image">
                            <div>
                                <p>${userProfiles[post.created_by]?.username || 'Unknown User'}</p>
                                <span>${new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        ${post.created_by == parseInt(userId) ? `
                        <div onclick="toggleMenu(event, this)">
                            <a href="javascript:void(0);"><i class="fa-solid fa-ellipsis"></i></a>     
                            <div class="edit-menu" style="display: none;">
                                <div class="edit-menu-inner">
                                    <div class="edit-link">
                                        <a href="#">Edit</a>
                                        <a href="#">Delete</a>
                                    </div>
                                </div>
                            </div>                                         
                        </div>
                        ` : ''}
                    </div> 
                    <p class="post-text">${post.text}</p>
                    ${post.image ? `<img src="${post.image}" class="post-img" alt="Post Image">` : ''}
                    ${post.video ? `<video controls class="post-video"><source src="${post.video}" type="video/mp4">Your browser does not support the video tag.</video>` : ''}
                    <div class="post-row">
                        <div class="activity-icons">
                            <!-- Like button that toggles based on user's like status -->
                            <div id="like-button-${post.id}" class="like-button" data-post-id="${post.id}" onclick="toggleLike(${post.id})">
                                <div id="liked-${post.id}" class="like-status" style="display: none;">
                                    <img src="images/like-blue.png" /> <span id="like-count-${post.id}">${post.likes.length}</span>
                                </div>
                                <div id="not-liked-${post.id}" class="like-status">
                                    <img src="images/like.png" /> <span id="like-count-${post.id}">${post.likes.length}</span>
                                </div>
                            </div>

                            <div onclick="toggleComments(event, this)"><img src="images/comments.png">${post.comments.length}</div>
                            <div><img src="images/share.png">0</div>
                        </div>
                    </div> 
                    <div class="all-comments" style="display: none;">
                        ${post.comments.map(comment => `
                            <div class="comments" id="comment-${comment.id}">
                                <img src="${userProfiles[comment.user]?.image || 'images/profile-pic.png'}" alt="Profile Image">
                                <div class="single-comment">
                                    <div class="ellipsis-icon">
                                        <div>
                                            <p>${userProfiles[comment.user]?.username || 'Unknown User'}</p>
                                            <small>${comment.comment}</small>
                                        </div>
                                        ${comment.user == userId ? `<div onclick="toggleMenu(event, this)">
                                            <a href="javascript:void(0);"><i class="fa-solid fa-ellipsis"></i></a>     
                                            <div class="edit-menu" style="display: none;">
                                                <div class="edit-menu-inner">
                                                    <div class="edit-link">
                                                        <a href="#" onclick="editComment(${comment.id})">Edit</a>
                                                        <a href="#" onclick="deleteComment(${comment.id})">Delete</a>
                                                    </div>
                                                </div>
                                            </div>                                         
                                        </div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        <div class="send-comments">
                            <textarea id="comment-text-${post.id}" rows="2" placeholder="Comment as ${currentUser}"></textarea>               
                            <div class="add-post-links">
                                <a onclick="sendComment(${post.id})" href="#"><img src="images/send message.png">Send</a>
                            </div>
                        </div>  
                    </div>
                `;

                postElement.innerHTML = postHtml;
                postsContainer.appendChild(postElement);
                const userHasLiked = post.likes.some(like => like.user == userId);
                const likedDiv = document.getElementById(`liked-${post.id}`);
                const notLikedDiv = document.getElementById(`not-liked-${post.id}`);

                if (userHasLiked) {
                    likedDiv.style.display = 'block';
                    notLikedDiv.style.display = 'none';
                } else {
                    likedDiv.style.display = 'none';
                    notLikedDiv.style.display = 'block';
                }
            });
        } else {
            console.error('Unexpected response format:', data);
        }
    })
    .catch(error => console.error('Error fetching posts:', error));
});

function toggleMenu(event, element) {
    event.stopPropagation();
    const menu = element.querySelector('.edit-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function toggleComments(event, element) {
    event.stopPropagation();
    const commentsSection = element.closest('.post-container').querySelector('.all-comments');
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}
