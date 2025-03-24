$(document).ready(function() {
    if (typeof jwt_decode === 'undefined') {
        console.error('jwt_decode is not defined');
        return;
    }

    $('#changePasswordForm').on('submit', function(e) {
        e.preventDefault();
        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        if (newPassword !== confirmPassword) {
            alert('New password and confirm password do not match');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('User not logged in');
            return;
        }

        const userId = jwt_decode(token).userId;
        const passwordData = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/users/${userId}/change-password`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(passwordData),
            success: function() {
                alert('Password changed successfully');
                $('#changePasswordForm')[0].reset();
            },
            error: function(xhr) {
                alert('Failed to change password: ' + xhr.responseText);
            }
        });
    });
});
