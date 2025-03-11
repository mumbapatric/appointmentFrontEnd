$(document).ready(function(){
    $('#auth-form').submit(function(event){
        event.preventDefault();
        const form = $(this);
        const username = form.find('input[name="username"]').val();
        const password = form.find('input[name="password"]').val();

        // Show full-page loader
        $('#full-page-loader').show();

        $.ajax({
            url: 'http://localhost:8080/api/v1/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
            success: function(data, textStatus, jqXHR) {
                console.log('Response:', jqXHR);
                console.log('Response URL:', jqXHR.url);
                console.log('Status Code:', jqXHR.status);

                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);

                const decodedToken = jwt_decode(data.token);
                const userId = decodedToken.userId;
                localStorage.setItem('userId', userId);

                alert('Login successful');

                if (data.role === 'ROLE_DOCTOR') {
                    window.location.href = '/src/components/dashboard/doctor-dashboard.html';
                } else if (data.role === 'ROLE_PATIENT') {
                    window.location.href = '/src/components/dashboard/patient-dashboard.html';
                }
                else if (data.role === 'ROLE_ADMIN') {
                    window.location.href = '/src/components/dashboard/admin-dashboard.html';
                }
                 else {
                    window.location.href = '/src/pages/auth/login.html';
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error logging in:', errorThrown);
                let errorMessage = 'Unauthorized access';
                if (jqXHR.status === 401) {
                    errorMessage = 'Invalid username or password';
                }
                alert(errorMessage);
            },
            complete: function() {
                // Hide full-page loader after user clicks "OK" on alert
                $(document).one('click', function() {
                    $('#full-page-loader').hide();
                });
            }
        });
    });
});