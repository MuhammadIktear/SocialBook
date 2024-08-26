document.addEventListener('DOMContentLoaded', function() {
    const suggestionsContainer = document.querySelector('.suggestions-list');
    const seeAllButton = document.querySelector('.see-all-suggestions');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const followingsApiUrl = 'http://127.0.0.1:8000/user/followings/';
    const followersApiUrl = 'http://127.0.0.1:8000/user/followers/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

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

        let suggestions = users.filter(user => 
            user.id !== currentUser.id && !followingIds.includes(user.id)
        );

        suggestions = suggestions.slice(0, 5);

        if (suggestions.length > 0) {
            seeAllButton.style.display = 'block';

            const suggestionsHtml = suggestions.map(user => {
                const isFollowing = followingIds.includes(user.id);
                return `
                    <div class="online-list">
                        <div class="suggested" data-user-id="${user.id}">
                        <a href="profile.html?id=${user.id}">
                            <div class="online">
                                <img src="${user.image || 'images/member-1.png'}" alt="${user.username}">
                            </div>                        
                        </a>
                            <div class="suggestions suggestions_another">
                                <a href="profile.html?id=${user.id}">
                                <p>${user.first_name} ${user.last_name}</p>                                
                                <small class="small_suggest">Suggested for you</small>
                                </a>
                            </div>
                        </div>
                        <div>
                            <button class="follow-button" onclick="${isFollowing ? `unfollow(${user.id})` : `follow(${user.id})`}">
                                ${isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            suggestionsContainer.innerHTML = suggestionsHtml;
        }
    })
    .catch(error => {
        console.error('Error fetching user profiles:', error);
    });

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

            const newFollowing = await followResponse.json();

            document.querySelector(`.suggested[data-user-id="${followingUserId}"]`)
                .nextElementSibling.innerHTML = `
                    <button class="follow-button" onclick="unfollow(${followingUserId})">Unfollow</button>
                `;

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

            document.querySelector(`.suggested[data-user-id="${followingUserId}"]`)
                .nextElementSibling.innerHTML = `
                    <button class="follow-button" onclick="follow(${followingUserId})">Follow</button>
                `;

        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };
});
