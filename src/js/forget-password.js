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
    $.ajax({
        url: 'http://localhost:8080/api/v1/users/forgot-password',
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

function resetPassword() {
    const token = $('#token').val();
    const newPassword = $('#new-password').val();
    const button = $('#reset-password-form button');
    button.prop('disabled', true); // Disable the button

    $.ajax({
        url: 'http://localhost:8080/api/v1/users/reset-password',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ token: token, newPassword: newPassword }),
        success: function(response) {
            Swal.fire('Success', 'Password reset successful', 'success');
        },
        error: function(xhr) {
            if (xhr.status === 400) {
                Swal.fire('Error', 'Incorrect token', 'error');
            } else if (xhr.status === 500) {
                const errorResponse = xhr.responseJSON;
                if (errorResponse && errorResponse.errorDetails === "Required request parameter 'token' for method parameter type String is not present") {
                    Swal.fire('Error', 'Token is missing', 'error');
                } else {
                    Swal.fire('Error', 'Internal Server Error', 'error');
                }
            } else {
                Swal.fire('Error', 'Error resetting password', 'error');
            }
        },
        complete: function() {
            button.prop('disabled', false); // Re-enable the button
        }
    });
}
