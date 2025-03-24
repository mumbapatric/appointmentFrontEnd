$(document).ready(function() {
    if (typeof jwt_decode === 'undefined') {
        console.error('jwt_decode is not defined');
        return;
    }

    const token = localStorage.getItem('token');
    if (token) {
        const decoded = jwt_decode(token);
        const userId = decoded.userId;

        console.log('Decoded token:', decoded);

        // Fetch user data and populate values
        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/users/${userId}`,
            type: 'GET',
            success: function(user) {
                console.log('Fetched user data:', user);
                $('#email').val(user.data.email || ''); // Set value if exists, else empty
                $('#phone').val(user.data.phoneNumber || ''); // Set value if exists, else empty
            },
            error: function(xhr, status, error) {
                console.error('Error fetching user details:', status, error);
                alert('Failed to fetch user details');
            }
        });

        $('#profileForm').on('submit', function(e) {
            e.preventDefault();
            const updatedProfile = {
                email: $('#email').val(),
                phoneNumber: $('#phone').val()
                // Do not send userName as it's not editable
            };

            console.log('Updated profile data:', updatedProfile);

            $.ajax({
                url: `http://192.168.1.133:8080/api/v1/users/${userId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedProfile),
                success: function() {
                    alert('Profile updated successfully');
                },
                error: function(xhr, status, error) {
                    console.error('Error updating profile:', status, error);
                    console.error('Response:', xhr.responseText);
                    alert('Failed to update profile: ' + xhr.responseText);
                }
            });
        });
    } else {
        alert('User not logged in');
    }
});
