$(document).ready(function() {
    $('#forget-password-form button').off('click').on('click', function() {
        sendResetLink();
    });

    $('#reset-password-form button').off('click').on('click', function() {
        resetPassword();
    });
});

let isSendingResetLink = false;

function sendResetLink() {
    if (isSendingResetLink) return; // Prevent multiple submissions
    isSendingResetLink = true;

    const email = $('#email').val();
    const button = $('#forget-password-form button');
    button.prop('disabled', true); // Disable the button

    Swal.fire({
        title: 'Sending...',
        text: 'Please wait while we send the reset link.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading(); // Show SweetAlert loader

            $.ajax({
                url: 'http://192.168.1.133:8080/api/v1/users/forgot-password',
                type: 'POST',
                data: { email: email },
                success: function(response) {
                    Swal.fire('Success', 'Password reset link sent to your email', 'success');
                    $('#forget-password-form').hide();
                    $('#reset-password-form').show().removeAttr('inert');
                },
                error: function(xhr) {
                    if (xhr.status === 404) {
                        Swal.fire('Error', 'No user with that email', 'error');
                    } else if (xhr.status === 500) {
                        const errorResponse = xhr.responseJSON;
                        if (errorResponse && errorResponse.errorDetails === 'User not found') {
                            Swal.fire('Error', 'Email not found', 'error');
                        } else {
                            Swal.fire('Error', 'Internal Server Error', 'error');
                        }
                    } else {
                        Swal.fire('Error', 'Error sending reset link', 'error');
                    }
                },
                complete: function() {
                    button.prop('disabled', false); // Re-enable the button
                    isSendingResetLink = false;
                }
            });
        }
    });
}

function resetPassword() {
    const token = $('#token').val().trim();
    const newPassword = $('#new-password').val().trim();
    const button = $('#reset-password-form button');

    // Validate inputs
    if (!token || !newPassword) {
        Swal.fire('Error', 'Token and new password are required', 'warning');
        return;
    }

    // Disable the button to prevent multiple submissions
    button.prop('disabled', true);

    // Log the payload payload data for debugging
    console.log("Payload:", { token: token, newPassword: newPassword });

    // Perform AJAX request to reset password
    $.ajax({
        url: 'http://192.168.1.133:8080/api/v1/users/reset-password',
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded', // Confirm Content-Type
        data: $.param({ token: token, newPassword: newPassword }), // Properly format data
        success: function(response) {
            // Success response from server
            Swal.fire('Success', 'Password reset successful', 'success');
        },
        error: function(xhr) {
            // Error handling based on response codes
            if (xhr.status === 400) {
                Swal.fire('Error', 'Incorrect token or invalid request', 'error');
            } else if (xhr.status === 500) {
                const errorResponse = xhr.responseJSON;
                if (errorResponse && errorResponse.errorDetails?.includes('token')) {
                    Swal.fire('Error', 'Token is missing or expired', 'error');
                } else {
                    Swal.fire('Error', 'Internal Server Error', 'error');
                }
            } else {
                Swal.fire('Error', 'Unknown error resetting password', 'error');
            }
        },
        complete: function() {
            // Re-enable the button after the request completes
            button.prop('disabled', false);
        }
    });
}

