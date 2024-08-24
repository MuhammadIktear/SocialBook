document.addEventListener('DOMContentLoaded', function() {
    const suggestionsContainer = document.querySelector('.suggestions-list');
    const seeAllButton = document.querySelector('.see-all-suggestions');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
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
                return `
            <div class="online-list">
            <div class="suggested">
                <div class="online">
                    <img src="${user.image || 'images/member-1.png'}" alt="${user.username}">
                </div>
                <div>
                    <p>${user.first_name} ${user.last_name}</p>
                    <small>Suggested for you</small>
                </div>
            </div>
            <div>
                <a href="#">Follow</a>            
            </div>
            </div>
                `;
            }).join('');

            suggestionsContainer.innerHTML = suggestionsHtml;
        } else {
            suggestionsContainer.innerHTML = '<p>No suggestions available.</p>';
            seeAllButton.style.display = 'none';
        }
    })
    .catch(error => console.error('Error fetching suggestions:', error));
});
