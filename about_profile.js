document.addEventListener('DOMContentLoaded', function() {
    const impLinksContainer = document.querySelector('.imp-links');
    const followersSection = document.querySelector('.shortcut-links');
    const profile = document.querySelector('.user-profile');
    const post_input_container = document.querySelector('.post-input-container');
    const nav_profile_image = document.querySelector('.nav-user-icon');
    const followersContainer = document.querySelector('.followers');
    const user_profile = document.querySelector('.user-profile-post');
    const seeAllButton = document.querySelector('.see-all-btn');
    const userProfilesApiUrl = 'https://phibook-f17w.onrender.com/user/useraccounts/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
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
        post_input_container.innerHTML=`
            <a id="activityLink" onclick="showToast('activity')"  href="#"><textarea id="textInput" rows="3" placeholder="What's on your mind, ${data.last_name}?"></textarea></a>
            <div class="add-post-links">
                <a id="videoLink" onclick="showToast('video')" href="#"><img src="images/video.png" alt="Video Icon">Video</a>
                <a id="photoLink" onclick="showToast('photo')" href="#"><img src="images/photo.png" alt="Photo Icon">Photo</a>
                <a id="activityLink" onclick="showToast('activity')" href="#"><img src="images/feeling.png" alt="Activity Icon">Activity</a>
            </div>
        `

        user_profile.innerHTML=`
                <img src="${data.image || 'images/profile-pic.png'}" alt="">
                <div>
                    <p>${data.first_name} ${data.last_name}</p>
                </div>        
        `

        nav_profile_image.innerHTML=`
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
        `

        profile.innerHTML=`
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
                <div>
                    <p>${data.first_name} ${data.last_name}</p>
                     <a href="profile.html?id=${data.id}">See your profile</a>
            </div>
        `
        const profileHtml = `
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
            <h4>About</h4>
            <p>${data.about || 'No bio available.'}</p>
            <h4>Joined</h4>
            <p>${new Date(data.created_at).toLocaleDateString()}</p>
            <h4>Email</h4>
            <p>${data.email}</p>
        `;
        impLinksContainer.innerHTML = profileHtml;

        if (data.followers && data.followers.length > 0) {
            followersSection.style.display = 'block';
            const followerPromises = data.followers
                .slice(0, 5)
                .map(follower => {
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
                            <div class="follower-item">
                                <a href="profile.html?id=${followerData.id}">
                                    <img src="${followerData.image || 'images/profile-pic.png'}" alt="${followerData.username}">
                                    <div>
                                        <h4>${followerData.username}</h4>
                                        <small>${followerData.first_name} ${followerData.last_name}</small>
                                    </div>
                                </a>
                            </div>
                        `;
                    })
                    .catch(error => {
                        console.error(`Error fetching follower data for follower ID ${follower.follower}:`, error);
                        return '';
                    });
                });

            Promise.all(followerPromises).then(followerHtmlArray => {
                followersContainer.innerHTML = followerHtmlArray.join('');
                seeAllButton.style.display = 'inline'; 
                seeAllButton.href = `followers.html?id=${userId}`;
            });
        } else {
            followersContainer.innerHTML = '<p>No followers found.</p>';
            seeAllButton.style.display = 'none';
        }
    })
    .catch(error => console.error('Error fetching user profile:', error));
});
