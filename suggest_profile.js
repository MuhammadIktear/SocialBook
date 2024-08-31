document.addEventListener('DOMContentLoaded', function() {
    const suggestionsContainer = document.querySelector('.suggestions-list');
    const seeAllButton = document.querySelector('.see-all-suggestions');
    const userProfilesApiUrl = 'https://phibook-f17w.onrender.com/user/useraccounts/';
    const followingsApiUrl = 'https://phibook-f17w.onrender.com/user/followings/';
    const followersApiUrl = 'https://phibook-f17w.onrender.com/user/followers/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    async function fetchUserProfiles() {
        try {
            const response = await fetch(userProfilesApiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('Error fetching user profiles:', error);
        }
    }

    function renderSuggestions(users) {
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
                            <button class="follow-button" data-user-id="${user.id}" data-following="${isFollowing}">
                                ${isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            suggestionsContainer.innerHTML = suggestionsHtml;
        }
    }

    function handleFollowUnfollowButtonClick(event) {
        if (event.target.classList.contains('follow-button')) {
            const button = event.target;
            const followingUserId = button.getAttribute('data-user-id');
            const isFollowing = button.getAttribute('data-following') === 'true';

            if (isFollowing) {
                unfollow(followingUserId, button);
            } else {
                follow(followingUserId, button);
            }
        }
    }

    async function follow(followingUserId, button) {
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

            // Update the button text and data-following attribute
            button.textContent = 'Unfollow';
            button.setAttribute('data-following', 'true');
        } catch (error) {
            console.error('Error following user:', error);
        }
    }

    async function unfollow(followingUserId, button) {
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

            // Update the button text and data-following attribute
            button.textContent = 'Follow';
            button.setAttribute('data-following', 'false');
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    }

    // Initialize
    (async function init() {
        const users = await fetchUserProfiles();
        if (users) {
            renderSuggestions(users);
        }
    })();

    // Attach event listener for follow/unfollow button clicks
    suggestionsContainer.addEventListener('click', handleFollowUnfollowButtonClick);
});
