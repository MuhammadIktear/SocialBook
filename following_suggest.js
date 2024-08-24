document.addEventListener('DOMContentLoaded', function() {
    const friendListGrid = document.querySelector('.friend-list-grid');
    const searchButton = document.querySelector('.friend-list-search button');
    const searchInput = document.querySelector('.friend-list-search input');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    // Fetch all user profiles
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
        // Get the current user's details
        const currentUser = users.find(user => user.id == userId);
        const followingIds = currentUser.following.map(follow => follow.following);
        
        // Filter suggestions: exclude current user and already followed users
        let suggestions = users.filter(user => 
            user.id !== currentUser.id && !followingIds.includes(user.id)
        );

        // Function to render suggestions
        function renderSuggestions(filteredSuggestions) {
            if (filteredSuggestions.length > 0) {
                const suggestionsHtml = filteredSuggestions.map(user => {
                    return `
                        <div class="friend-item">
                            <div class="friend-name">
                                <img src="${user.image || 'images/member-placeholder.png'}" alt="${user.username}">
                                <div class="friend-info">
                                    <h3>${user.username}</h3>
                                    <small>${user.first_name} ${user.last_name}</small>
                                </div>
                            </div>
                            <div>
                                <button>Follow</button>
                            </div>
                        </div>
                    `;
                }).join('');
                friendListGrid.innerHTML = suggestionsHtml;
            } else {
                friendListGrid.innerHTML = '<p>No suggestions available.</p>';
            }
        }

        // Initial render of suggestions
        renderSuggestions(suggestions);

        // Handle search functionality
        function searchSuggestions() {
            const searchText = searchInput.value.toLowerCase();
            const filteredSuggestions = suggestions.filter(user => {
                const username = user.username.toLowerCase();
                const name = (user.first_name + ' ' + user.last_name).toLowerCase();
                return username.includes(searchText) || name.includes(searchText);
            });
            renderSuggestions(filteredSuggestions);
        }

        // Attach search functionality to button click and input change
        searchButton.addEventListener('click', searchSuggestions);
        searchInput.addEventListener('input', searchSuggestions);
    })
    .catch(error => console.error('Error fetching suggestions:', error));
});
