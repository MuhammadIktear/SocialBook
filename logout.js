function handleLogout() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No token found. User might not be logged in.');
      window.location.href = 'login.html'; 
      return;
    }
  
    fetch('http://127.0.0.1:8000/user/logout/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
    })
    .then(response => {
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.href = 'login.html';
      } else {
        console.error('Logout failed:', response.statusText);
        return response.text().then(text => {
          console.error('Error details:', text);
        });
      }
    })
    .catch(error => {
      console.error('Error during logout:', error);
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('input[value="Logout"]');
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
  });
  