document.addEventListener('DOMContentLoaded', function() {
    const postsContainer = document.getElementById('posts-container');
    const userProfilesApiUrl = 'https://phibook-f17w.onrender.com/user/useraccounts/';
    const postsApiUrl = 'https://phibook-f17w.onrender.com/posts/allpost/';
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const userId = localStorage.getItem('user_id'); // Retrieve user ID from local storage

    let userProfiles = {};
    let currentUser = '';
    let followingIds = [];

    // Fetch the logged-in user's profile
    fetch(`${userProfilesApiUrl}${userId}/`, {
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
    .then(userProfile => {
        currentUser = userProfile.username;
        followingIds = userProfile.following.map(f => f.following); // Get the list of users the current user is following

        // Fetch all user profiles
        return fetch(userProfilesApiUrl, {
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
        // Create a map of user profiles with user ID as the key
        data.forEach(profile => {
            userProfiles[profile.id] = {
                username: profile.username,
                image: profile.image || 'images/profile-pic.png' // Default image if none provided
            };
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

                const postCreatorId = post.created_by;
                const isFollowing = followingIds.includes(postCreatorId);
                const showSuggestion = !isFollowing && postCreatorId !== parseInt(userId);
                const postKey = `post-${userId}-${post.id}`;

                if (isFollowing) {
                    localStorage.removeItem(postKey);
                } else {
                    const isHidden = localStorage.getItem(postKey) === 'true';
                    if (isHidden) return;
                }


                const postHtml = `
                    ${showSuggestion ? `
                    <div class="suggested_post" data-post-id="${post.id}">
                        <p>Suggested for you</p>
                        <i class="fa-solid fa-x close-btn"></i> 
                    </div>` : ''}
                    <div class="post-row" id="post-${post.id}">
                        <div class="user-profile">
                            <a href="profile.html?id=${post.created_by}">
                                <img src="${userProfiles[post.created_by]?.image || 'images/profile-pic.png'}" alt="Profile Image">
                            </a>
                            <div>
                                <a href="profile.html?id=${post.created_by}">
                                    <p>${userProfiles[post.created_by]?.username || 'Unknown User'}${showSuggestion ? `<b class="b_suggest"><button class="button_suggest" >View profile</button></b>` : ''}</p>
                                </a>
                                <span>${new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        ${post.created_by == parseInt(userId) ? `
                        <div onclick="toggleMenu(event, this)">
                            <a href="javascript:void(0);"><i class="fa-solid fa-ellipsis"></i></a>
                            <div class="edit-menu" style="display: none;">
                                <div class="edit-menu-inner">
                                    <div class="edit-link">
                                        <a href="javascript:void(0);" onclick="showEditToast(${post.id}, '${post.text}', '${post.image || ''}', '${post.video || ''}')">Edit</a>
                                        <a href="javascript:void(0);" onclick="showDeleteConfirm(${post.id})">Delete</a>
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
                            <div id="like-button-${post.id}" class="like-button" data-post-id="${post.id}" onclick="toggleLike(${post.id})">
                                <div id="liked-${post.id}" class="like-status" style="display: none;">
                                    <img src="images/like-blue.png" /> <span id="like-count-${post.id}">${post.likes.length}</span>
                                </div>
                                <div id="not-liked-${post.id}" class="like-status">
                                    <img src="images/like.png" /> <span id="like-count-${post.id}">${post.likes.length}</span>
                                </div>
                            </div>

                            <div onclick="toggleComments(event, this)"><img src="images/comments.png">${post.comments.length}</div>
                        </div>
                    </div> 
                    <div class="all-comments" style="display: none;">
                        <div id="comments-container-${post.id}">
                            ${post.comments.map(comment => `
                                <div class="comments" id="comment-${comment.id}">
                                    <a href="profile.html?id=${comment.user}">
                                        <img src="${userProfiles[comment.user]?.image || 'images/profile-pic.png'}" alt="Profile Image">
                                    </a>
                                    <div class="single-comment">
                                        <div class="ellipsis-icon">
                                            <div>
                                                <a href="profile.html?id=${comment.user}">
                                                    <p>${userProfiles[comment.user]?.username || 'Unknown User'}</p>
                                                </a>
                                                <small>${comment.comment}</small>
                                            </div>
                                            ${comment.user == userId ? `
                                            <div onclick="toggleCommentMenu(event, this)">
                                                <a href="javascript:void(0);"><i class="fa-solid fa-ellipsis"></i></a>     
                                                <div class="edit-comment-menu" style="display: none;">
                                                    <div class="edit-menu-inner">
                                                        <div class="edit-link">
                                                            <a onclick="editComment(${comment.id})">Edit</a>
                                                            <a onclick="deleteComment(${comment.id})">Delete</a>
                                                        </div>
                                                    </div>
                                                </div>                                         
                                            </div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="send-comments">
                            <textarea id="comment-text-${post.id}" rows="2" placeholder="Comment as ${currentUser}"></textarea>               
                            <div class="add-post-links">
                                <a class="send_btn" onclick="sendComment(${post.id})"><img src="images/send message.png">Send</a>
                            </div>
                        </div>  
                    </div>
                `;

                postElement.innerHTML = postHtml;
                postsContainer.appendChild(postElement);

                // Handle the like status
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

            // Attach event listeners to close buttons
            document.querySelectorAll('.close-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const postId = this.parentElement.getAttribute('data-post-id');
                    const postKey = `post-${userId}-${postId}`;
                    localStorage.setItem(postKey, 'true'); // Mark the post as hidden for this specific user
                    const postElement = this.closest('.post-container'); // Get the post element
                    if (postElement) {
                        postElement.remove(); // Remove the post element from the DOM
                    }
                });
            });
        } else {
            console.error('Unexpected response format:', data);
        }
    })
    .catch(error => console.error('Error fetching data:', error));
});


function followUser(userId) {
    // Add the logic to follow the user via API
    console.log(`Follow user with ID: ${userId}`);
}

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
