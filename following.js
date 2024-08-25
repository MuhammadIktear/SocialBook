document.addEventListener('DOMContentLoaded', function() {
    const friendListGrid = document.querySelector('.friend-list-grid');
    const searchInput = document.querySelector('.friend-list-search input');
    const searchButton = document.querySelector('.friend-list-search button');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const followApiUrl = 'http://127.0.0.1:8000/user/follow/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    function fetchFollowingList() {
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
        .then(user => {
            const following = user.following;
            const followingHtml = following.map(user => `
                <div class="friend-list-item">
                    <img src="${user.image || 'images/default-profile.png'}" alt="${user.following_username}">
                    <div class="friend-info">
                        <h3>${user.following_username}</h3>
                    </div>
                    <button class="follow-button" data-user-id="${user.following}" data-action="unfollow">Unfollow</button>
                </div>
            `).join('');
            friendListGrid.innerHTML = followingHtml;

            document.querySelectorAll('.follow-button').forEach(button => {
                button.addEventListener('click', function() {
                    const userIdToFollow = this.getAttribute('data-user-id');
                    const action = this.getAttribute('data-action');
                    toggleFollow(action, userIdToFollow, this);
                });
            });
        })
        .catch(error => console.error('Error fetching following list:', error));
    }

    function toggleFollow(action, userIdToFollow, button) {
        const followData = {
            main_user: userId,
            following: userIdToFollow,
            following_username: button.closest('.friend-list-item').querySelector('h3').textContent
        };

        let method = 'POST';
        let url = followApiUrl;

        if (action === 'unfollow') {
            method = 'DELETE';
            // Construct URL with query parameters for DELETE request
            url = `${followApiUrl}?main_user=${userId}&following=${userIdToFollow}`;
        }

        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            },
            body: method === 'POST' ? JSON.stringify(followData) : undefined
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            button.textContent = action === 'follow' ? 'Unfollow' : 'Follow';
            button.setAttribute('data-action', action === 'follow' ? 'unfollow' : 'follow');
        })
        .catch(error => console.error(`Error while trying to ${action}:`, error));
    }

    function searchFollowing() {
        const query = searchInput.value.toLowerCase();
        const items = friendListGrid.querySelectorAll('.friend-list-item');
        items.forEach(item => {
            const username = item.querySelector('.friend-info h3').textContent.toLowerCase();
            item.style.display = username.includes(query) ? 'block' : 'none';
        });
    }

    searchButton.addEventListener('click', searchFollowing);
    searchInput.addEventListener('keyup', searchFollowing);

    fetchFollowingList();
});
