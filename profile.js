document.addEventListener('DOMContentLoaded', function() {
    const impLinksContainer = document.querySelector('.imp-links');
    const profile = document.querySelector('.user-profile');
    const nav_profile_image = document.querySelector('.nav-user-icon');
    const user_profile = document.querySelector('.user-profile-post');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const followingsApiUrl = 'http://127.0.0.1:8000/user/followings/';
    const followersApiUrl = 'http://127.0.0.1:8000/user/followers/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const fetchId = new URLSearchParams(window.location.search).get("id");

    Promise.all([
        fetch('http://127.0.0.1:8000/posts/allpost/').then(response => response.json()),
        fetch(`${userProfilesApiUrl}${fetchId}`).then(response => response.json())
    ])
    .then(([postsData, userData]) => {
        const userPosts = postsData.filter(post => post.created_by === parseInt(fetchId));
        const postCount = userPosts.length;
        const showActions = fetchId === userId;
        const isFollowing = userData.followers.some(follower => follower.follower === parseInt(userId));

        document.querySelector('.profile').innerHTML = `
            <div class="profile-image">
                <img src="${userData.image || 'default-profile-image.jpg'}" alt="Profile Image">
            </div>
            <div>
                <div class="profile-user-settings">
                    <h1 class="profile-user-name">${userData.username}</h1>
                    ${showActions ? `
                        <button onclick="showProfileEditToast()" class="btn profile-edit-btn">Edit Profile</button>
                    ` : ''}
                    ${!showActions ? `
                        <button class="follow-button_ follow" onclick="follow(${userData.id})" style="${isFollowing ? 'display: none;' : 'display: inline-block;'}">Follow</button>
                        <button class="follow-button_ unfollow" onclick="unfollow(${userData.id})" style="${isFollowing ? 'display: inline-block;' : 'display: none;'}">Unfollow</button>
                    ` : ''}
                </div>
                <div class="profile-stats">
                    <ul>
                        <li><span class="profile-stat-count">${postCount}</span> posts</li>
                        <li><a href="followers.html?id=${userData.id}"><span class="profile-stat-count">${userData.followers.length}</span> followers</a></li>
                        <li><a href="following.html?id=${userData.id}"><span class="profile-stat-count">${userData.following.length}</span> following</a></li>
                    </ul>
                </div>
                <p>${userData.bio || userData.first_name + ' ' + userData.last_name}</p>
            </div>`;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data.');
    });

    fetch(`${userProfilesApiUrl}${fetchId}/`, {
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
        user_profile.innerHTML = `
            <h3 class="all_post">All Posts</h3>
        `;
        impLinksContainer.innerHTML = `
            <h4>About</h4>
            <p>${data.about || 'No bio available.'}</p>
            <h4>Joined</h4>
            <p>${new Date(data.created_at).toLocaleDateString()}</p>
            <h4>Email</h4>
            <p>${data.email}</p>
        `;
    })
    .catch(error => console.error('Error fetching user profile:', error));

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
    .then(data => {
        nav_profile_image.innerHTML = `
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
        `;
        profile.innerHTML = `
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
            <div>
                <p>${data.first_name} ${data.last_name}</p>
                <a href="profile.html?id=${data.id}">See your profile</a>
            </div>
        `;
    })
    .catch(error => console.error('Error fetching user profile:', error)); 

    window.follow = async function(followingUserId) {
        try {
            const followResponse = await fetch(followingsApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    main_user: userId,
                    following: followingUserId
                })
            });

            if (!followResponse.ok) {
                throw new Error('Failed to follow user');
            }

            const followerResponse = await fetch(followersApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    main_user: followingUserId,
                    follower: userId
                })
            });

            if (!followerResponse.ok) {
                throw new Error('Failed to add follower');
            }

            const followButton = document.querySelector(`.profile .follow`);
            const unfollowButton = document.querySelector(`.profile .unfollow`);
            if (followButton && unfollowButton) {
                followButton.style.display = 'none';
                unfollowButton.style.display = 'inline-block';
            }

        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    window.unfollow = async function(followingUserId) {
        try {
            const unfollowResponse = await fetch(`${followingsApiUrl}?main_user=${userId}&following=${followingUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!unfollowResponse.ok) {
                throw new Error('Failed to unfollow user');
            }

            const unfollowerResponse = await fetch(`${followersApiUrl}?main_user=${followingUserId}&follower=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!unfollowerResponse.ok) {
                throw new Error('Failed to remove follower');
            }

            const followButton = document.querySelector(`.profile .follow`);
            const unfollowButton = document.querySelector(`.profile .unfollow`);
            if (followButton && unfollowButton) {
                followButton.style.display = 'inline-block';
                unfollowButton.style.display = 'none';
            }

        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };
});
