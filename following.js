document.addEventListener('DOMContentLoaded', function() {
    const friendListGrid = document.querySelector('.friend-list-grid');
    const searchButton = document.querySelector('.friend-list-search button');
    const searchInput = document.querySelector('.friend-list-search input');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const followingsApiUrl = 'http://127.0.0.1:8000/user/followings/';
    const followersApiUrl = 'http://127.0.0.1:8000/user/followers/';
    const token = localStorage.getItem('token');
    const user_id = localStorage.getItem('user_id');
    const userId = new URLSearchParams(window.location.search).get("id");
    
    if (!user_id || !token) {
        window.location.href = "login.html";
    }    
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
    .then(users => {
        const currentUser = users.find(user => user.id == userId);
        const followingIds = currentUser.following.map(follow => follow.following);
        const followerIds = users.flatMap(user => user.followers.map(f => f.follower));

        let followingSuggestions = users.filter(user => 
            user.id !== currentUser.id && followingIds.includes(user.id)
        );

        function renderSuggestions(filteredSuggestions, fetchId) {
            if (filteredSuggestions.length > 0) {
                const suggestionsHtml = filteredSuggestions.map(user => {
                    const isFollowing = followingIds.includes(user.id);
                    const showActions = userId===user_id;
        
                    return `
                        <div class="friend-item suggested" data-user-id="${user.id}">
                            <div class="friend-name">
                                <a href="profile.html?id=${user.id}">
                                    <img src="${user.image || 'images/member-placeholder.png'}" alt="${user.username}">
                                </a>
        
                                <div class="friend-info">
                                    <a href="profile.html?id=${user.id}">
                                        <h3>${user.username}</h3>
                                        <small>${user.first_name} ${user.last_name}</small>
                                    </a>
                                </div>
                            </div>
                            ${showActions ? `
                            <div class="friend-actions">
                                <button class="follow-button follow" onclick="follow(${user.id})" style="${isFollowing ? 'display: none;' : 'display: inline-block;'}">Follow</button>
                                <button class="follow-button unfollow" onclick="unfollow(${user.id})" style="${isFollowing ? 'display: inline-block;' : 'display: none;'}">Unfollow</button>
                            </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
                friendListGrid.innerHTML = suggestionsHtml;
            } else {
                friendListGrid.innerHTML = '<p>No suggestions available.</p>';
            }
        }
        renderSuggestions(followingSuggestions);

        function searchSuggestions() {
            const searchText = searchInput.value.toLowerCase();
            const filteredSuggestions = followingSuggestions.filter(user => {
                const username = user.username.toLowerCase();
                const name = (user.first_name + ' ' + user.last_name).toLowerCase();
                return username.includes(searchText) || name.includes(searchText);
            });
            renderSuggestions(filteredSuggestions);
        }

        searchButton.addEventListener('click', searchSuggestions);
        searchInput.addEventListener('input', searchSuggestions);
    })
    .catch(error => console.error('Error fetching suggestions:', error));

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

            document.querySelector(`.suggested[data-user-id="${followingUserId}"] .follow`).style.display = 'none';
            document.querySelector(`.suggested[data-user-id="${followingUserId}"] .unfollow`).style.display = 'inline-block';

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

            document.querySelector(`.suggested[data-user-id="${followingUserId}"] .follow`).style.display = 'inline-block';
            document.querySelector(`.suggested[data-user-id="${followingUserId}"] .unfollow`).style.display = 'none';

        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };
});
