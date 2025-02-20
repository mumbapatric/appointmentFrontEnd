document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('auth-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.target;

            const username = form.username.value;
            const password = form.password.value;

            try {
                const response = await fetch('http://localhost:8080/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                console.log('Response:', response);
                console.log('Request URL:', response.url);
                console.log('Status Code:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log('Response Data:', data);

                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);

                    const decodedToken = jwt_decode(data.token);
                    const userId = decodedToken.userId;
                    localStorage.setItem('userId', userId);

                    alert('Login successful');

                    if (data.role === 'ROLE_DOCTOR') {
                        window.location.href = 'http://localhost:8080/doctor-dashboard.html';
                    } else if (data.role === 'ROLE_PATIENT') {
                        window.location.href = 'http://localhost:8080/patient-dashboard.html';
                    } else {
                        window.location.href = 'http://localhost:8080/default-dashboard.html';
                    }
                } else {
                    let errorMessage = 'Unauthorized access';
                    if (response.status === 401) errorMessage = 'Invalid credentials';
                    alert(`Login failed: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('An error occurred while logging in.');
            }
        });
    });
