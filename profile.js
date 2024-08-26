document.addEventListener('DOMContentLoaded', function() {
    const impLinksContainer = document.querySelector('.imp-links');
    const profile = document.querySelector('.user-profile');
    const nav_profile_image = document.querySelector('.nav-user-icon');
    const user_profile = document.querySelector('.user-profile-post');
    const userProfilesApiUrl = 'http://127.0.0.1:8000/user/useraccounts/';
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    Promise.all([
        fetch('http://127.0.0.1:8000/posts/allpost/').then(response => response.json()),
        fetch(`http://127.0.0.1:8000/user/useraccounts/${userId}`).then(response => response.json())
    ])
    .then(([postsData, userData]) => {
        // Filter posts created by the logged-in user
        const userPosts = postsData.filter(post => post.created_by === parseInt(userId));
        const postCount = userPosts.length;

        // Update the profile section with user data and post count
        document.querySelector('.profile').innerHTML = `
            <div class="profile-image">
                <img src="${userData.image || 'default-profile-image.jpg'}" alt="Profile Image">
            </div>
            <div>
                <div class="profile-user-settings">
                    <h1 class="profile-user-name">${userData.username}</h1>
                   <button onclick="showProfileEditToast()" class="btn profile-edit-btn">Edit Profile</button>
                    <button class="btn profile-settings-btn" aria-label="profile settings">
                        <i class="fas fa-cog" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="profile-stats">
                    <ul>
                        <li><span class="profile-stat-count">${postCount}</span> posts</li>
                        <li><a href="followers.html"><span class="profile-stat-count">${userData.followers.length}</span> followers</a></li>
                        <li><a href="following.html"><span class="profile-stat-count">${userData.following.length}</span> following</a></li>
                    </ul>
                </div>
                <p>${userData.bio || userData.first_name + ' ' + userData.last_name}</p>
            </div>`;
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data.');
    });


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
        user_profile.innerHTML=`       
        <h3 class="all_post">All Posts</h3>
        `
        nav_profile_image.innerHTML=`
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
        `

        profile.innerHTML=`
            <img src="${data.image || 'images/profile-pic.png'}" alt="">
                <div>
                    <p>${data.first_name} ${data.last_name}</p>
                     <a href="profile.html">See your profile</a>
            </div>
        `
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
});
