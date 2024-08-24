document.addEventListener('DOMContentLoaded', function() {
    const friendListGrid = document.querySelector('.friend-list-grid');
    const searchButton = document.querySelector('.friend-list-search button');
    const searchInput = document.querySelector('.friend-list-search input');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    // Fetch user profile to get the list of followers
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
        let followersHtml = '';

        const followerPromises = data.followers.map(follower => {
            return fetch(`${userProfilesApiUrl}${follower.follower}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(followerData => {
                return `
                    <div class="friend-item">
                        <div class="friend-name">
                            <img src="${followerData.image || 'images/member-placeholder.png'}" alt="${followerData.username}">
                            <div class="friend-info">
                                <h3>${followerData.username}</h3>
                                <small>${followerData.first_name} ${followerData.last_name}</small>
                            </div>
                        </div>
                        <div>
                            <button>Remove</button>
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                console.error(`Error fetching follower data for follower ID ${follower.follower}:`, error);
                return '';
            });
        });

        // Display followers
        Promise.all(followerPromises).then(followerHtmlArray => {
            friendListGrid.innerHTML = followerHtmlArray.join('');
        });
    })
    .catch(error => console.error('Error fetching user profile:', error));

    // Handle search functionality
    searchButton.addEventListener('click', function() {
        const searchText = searchInput.value.toLowerCase();
        const friendItems = document.querySelectorAll('.friend-item');
        
        friendItems.forEach(item => {
            const username = item.querySelector('.friend-info h3').textContent.toLowerCase();
            const name = item.querySelector('.friend-info small').textContent.toLowerCase();
            if (username.includes(searchText) || name.includes(searchText)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Handle input change for live search
    searchInput.addEventListener('input', function() {
        searchButton.click(); // Trigger the search button click
    });
});
