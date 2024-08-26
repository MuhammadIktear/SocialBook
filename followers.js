document.addEventListener('DOMContentLoaded', function() {
    const friendListGrid = document.querySelector('.friend-list-grid');
    const searchButton = document.querySelector('.friend-list-search button');
    const searchInput = document.querySelector('.friend-list-search input');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const followingsApiUrl = 'http://127.0.0.1:8000/user/followings/';
    const followersApiUrl = 'http://127.0.0.1:8000/user/followers/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

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
        const followerIds = currentUser.followers.map(follow => follow.follower);

        let followersList = users.filter(user => 
            user.id !== currentUser.id && followerIds.includes(user.id)
        );

        function renderFollowers(filteredFollowers) {
            if (filteredFollowers.length > 0) {
                const followersHtml = filteredFollowers.map(user => {
                    return `
                        <div class="friend-item" data-user-id="${user.id}">
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
                            <div class="friend-actions">
                                <button class="remove-button" onclick="removeFollower(${user.id})">Remove</button>
                            </div>
                        </div>
                    `;
                }).join('');
                friendListGrid.innerHTML = followersHtml;
            } else {
                friendListGrid.innerHTML = '<p>No followers available.</p>';
            }
        }

        renderFollowers(followersList);

        function searchFollowers() {
            const searchText = searchInput.value.toLowerCase();
            const filteredFollowers = followersList.filter(user => {
                const username = user.username.toLowerCase();
                const name = (user.first_name + ' ' + user.last_name).toLowerCase();
                return username.includes(searchText) || name.includes(searchText);
            });
            renderFollowers(filteredFollowers);
        }

        searchButton.addEventListener('click', searchFollowers);
        searchInput.addEventListener('input', searchFollowers);
    })
    .catch(error => console.error('Error fetching followers:', error));

    window.removeFollower = async function(followerUserId) {
        try {
            const removeResponse = await fetch(`${followersApiUrl}?main_user=${userId}&follower=${followerUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!removeResponse.ok) {
                throw new Error('Failed to remove follower');
            }
            const unfollowerResponse = await fetch(`${followingsApiUrl}?main_user=${followerUserId}&following=${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!unfollowerResponse.ok) {
                throw new Error('Failed to remove from followers');
            }            

            const button = document.querySelector(`.friend-item[data-user-id="${followerUserId}"] .remove-button`);
            button.innerText = 'Removed';
            button.disabled = true;
            button.style.background = '#dddddd';
            button.style.cursor = 'not-allowed';

        } catch (error) {
            console.error('Error removing follower:', error);
        }
    };
});
