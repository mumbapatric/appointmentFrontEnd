$(document).ready(function() {
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        var target = $(this).data('target');
        $('.section').removeClass('active');
        $('#' + target).addClass('active');
        $('nav ul li').removeClass('active');
        $(this).parent().addClass('active');
    });

    $('.create-doctor-btn').click(function(e) {
        e.preventDefault();
        $('.section').removeClass('active');
        $('#create-doctor-form').addClass('active');
    });

    $('#createDoctorForm').submit(function(e) {
        e.preventDefault();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();

        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Password Mismatch',
                text: 'Password and Confirm Password do not match.',
                icon: 'error'
            });
            return;
        }

        const doctorData = {
            name: $('#doctorName').val(),
            specialization: $('#specialization').val(),
            email: $('#email').val(),
            phoneNumber: $('#phone').val(),
            username: $('#username').val(),
            password: password,
            location: $('#location').val(),
            hospitalId: parseInt($('#hospitalId').val(), 10)
        };

        // API call to create doctor
        Swal.fire({
            title: 'Creating Doctor...',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: 'http://192.168.1.133:8080/api/v1/doctors',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(doctorData),
            success: function(response) {
                Swal.fire({
                    title: 'Doctor Created Successfully!',
                    icon: 'success'
                });
                $('#createDoctorForm')[0].reset();
                $('.section').removeClass('active');
                $('#manage-doctors').addClass('active');
            },
            error: function(xhr) {
                Swal.fire({
                    title: 'Error Creating Doctor',
                    text: xhr.responseJSON?.message || 'An error occurred while creating the doctor.',
                    icon: 'error'
                });
            }
        });
    });

    $('#reportForm').submit(function(e) {
        e.preventDefault();
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();
        
    });

    $('#logFilterForm').submit(function(e) {
        e.preventDefault();
        var logStartDate = $('#logStartDate').val();
        var logEndDate = $('#logEndDate').val();
       
    });

    $(document).ready(function() {
        $('#settings-link').click(function(e) {
            e.preventDefault();
            $('#settings-dropdown').toggleClass('show');
        });
    
        // Add event listeners for Edit Profile and Change Password links
        $('#settings-dropdown a').click(function(e) {
            e.preventDefault();
            var targetUrl = $(this).attr('href');
            window.location.href = targetUrl;
        });
    });

    $('#logout-btn').on( 'click',function() {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            showCancelButton: true,
            confirmButtonText: `Logout`,
            cancelButtonText: `Cancel`,
            icon: 'warning'
        }).then((result) => {
            if(result.isConfirmed) {
                localStorage.removeItem('token');
                window.location.href = '/src/pages/auth/login.html';
            }
        });
    });

    // Fetch total patients
    $.ajax({
        url: 'http://192.168.1.133:8080/api/v1/admin/dashboard/total-users',
        method: 'GET',
        success: function(response) {
            console.log('Total Patients Response:', response); // Debugging log
            $('#totalPatients').text(response.totalPatients || 0);
        },
        error: function(xhr) {
            console.error('Error fetching total patients:', xhr); // Debugging log
            $('#totalPatients').text('Error');
        }
    });

    // Fetch total doctors
    $.ajax({
        url: 'http://192.168.1.133:8080/api/v1/admin/dashboard/total-doctors',
        method: 'GET',
        success: function(response) {
            console.log('Total Doctors Response:', response); // Debugging log
            $('#totalDoctors').text(response.totalDoctors || 0);
        },
        error: function(xhr) {
            console.error('Error fetching total doctors:', xhr); // Debugging log
            $('#totalDoctors').text('Error');
        }
    });
});
