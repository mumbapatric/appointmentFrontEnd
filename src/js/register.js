$(document).ready(function () {
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();
        
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const registrationData = {
            name: $('#fullname').val(),
            username: $('#username').val(),
            email: $('#email').val(),
            dob: $('#dob').val(), // Ensure date of birth is correctly included
            password: password, 
            phoneNumber: $('#phone').val(),
            address: $('#address').val(),
            gender: $('#gender').val()
        };

        $.ajax({
            url: 'http://localhost:8080/api/v1/patients/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(registrationData),
            success: function (response) {
                alert('Registration successful');
                window.location.href = '/src/pages/auth/login.html';
            },
            error: function (xhr, status, error) {
                console.error('Failed to register', xhr.responseText);
                alert('Failed to register: ' + xhr.responseText);
            }
        });
    });

    $('#togglePassword').click(function () {
        const passwordField = $('#password');
        const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
        passwordField.attr('type', type);
        $(this).find('i').toggleClass('fa-eye fa-eye-slash');
    });

    $('#toggleConfirmPassword').click(function () {
        const confirmPasswordField = $('#confirmPassword');
        const type = confirmPasswordField.attr('type') === 'password' ? 'text' : 'password';
        confirmPasswordField.attr('type', type);
        $(this).find('i').toggleClass('fa-eye fa-eye-slash');
    });
});
