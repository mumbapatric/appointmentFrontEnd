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

    // generate report

    $('#reportForm').submit(function(e) {
        e.preventDefault();
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();

        if (!startDate || !endDate) {
            Swal.fire({
                title: 'Error',
                text: 'Please select both start and end dates.',
                icon: 'error'
            });
            return;
        }

        Swal.fire({
            title: 'Generating Report...',
            didOpen: () => {
                Swal.showLoading();
            }
        });
        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/appointments/report?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&format=pdf`,
            method: 'GET',
            xhrFields: {
                responseType: 'blob'
            },
            success: function(blob) {
                if (blob.size === 0) {
                    Swal.fire({
                        title: 'No Appointments',
                        text: 'No appointments on the selected dates.',
                        icon: 'info'
                    });
                    return;
                }

                Swal.close();
                const fileUrl = window.URL.createObjectURL(blob);
                const previewTab = window.open();
                previewTab.document.write(`<iframe src="${fileUrl}" width="100%" height="100%" style="border:none;"></iframe>`);

                Swal.fire({
                    title: 'Previewing Report',
                    text: 'Do you want to download this report?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Download',
                    cancelButtonText: 'No, Just Preview'
                }).then(result => {
                    if (result.isConfirmed) {
                        const a = document.createElement('a');
                        a.href = fileUrl;
                        a.download = 'appointments-report.pdf';
                        a.click();
                    }
                    setTimeout(() => window.URL.revokeObjectURL(fileUrl), 30000);
                });
            },
            error: function(xhr) {
                Swal.fire({
                    title: 'Error Generating Report',
                    text: xhr.responseJSON?.message || 'An error occurred while generating the report.',
                    icon: 'error'
                });
            }
        });
    });

    $('#settings-link').click(function(e) {
        e.preventDefault();
        $('#settings-dropdown').toggleClass('show');
    });

    $('#settings-dropdown a').click(function(e) {
        e.preventDefault();
        var targetUrl = $(this).attr('href');
        window.location.href = targetUrl;
    });

    $('#logout-btn').on('click', function() {
        Swal.fire({
            title: 'Are you sure you want to logout?',
            showCancelButton: true,
            confirmButtonText: `Logout`,
            cancelButtonText: `Cancel`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token');
                window.location.href = '/src/pages/auth/login.html';
            }
        });
    });

    // Fetch total patients
    $.ajax({
        url: 'http://192.168.1.133:8080/api/v1/admin/dashboard/total-patients',
        method: 'GET',
        success: function(response) {
            console.log('Total Patients Response:', response); // Debugging log
            $('#totalPatients').text(response.totalPatients || 0).show(); // Force update
        },
        error: function(xhr) {
            console.error('Error fetching total patients:', xhr); // Debugging log
            $('#totalPatients').text('Error').show(); // Force update
        }
    });

    // Fetch total doctors
    $.ajax({
        url: 'http://192.168.1.133:8080/api/v1/admin/dashboard/total-doctors',
        method: 'GET',
        success: function(response) {
            console.log('Total Doctors Response:', response); // Debugging log
            $('#totalDoctors').text(response.totalDoctors || 0).show(); // Force update
        },
        error: function(xhr) {
            console.error('Error fetching total doctors:', xhr); // Debugging log
            $('#totalDoctors').text('Error').show(); // Force update
        }
    });

    $('.delete-doctor-btn').click(function(e) {
        e.preventDefault();
        $('#delete-doctor-section').toggle(); // Show or hide the delete doctor section
    });

    $('#confirmDeleteDoctorBtn').click(function(e) {
        e.preventDefault();
        const doctorEmail = $('#deleteDoctorEmail').val();

        if (!doctorEmail) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a valid email address.',
                icon: 'error'
            });
            return;
        }

        console.log('Attempting to delete doctor with email:', doctorEmail); 

        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete the doctor with email: ${doctorEmail}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // API call to delete doctor
                $.ajax({
                    url: `http://192.168.1.133:8080/api/v1/doctors?email=${encodeURIComponent(doctorEmail)}`,
                    method: 'DELETE',
                    success: function(response) {
                        console.log('Delete response:', response); // Debugging log
                        Swal.fire({
                            title: 'Doctor Deleted Successfully!',
                            icon: 'success'
                        });
                        $('#deleteDoctorEmail').val(''); // Clear the input field
                        $('#delete-doctor-section').hide(); // Hide the delete section
                    },
                    error: function(xhr) {
                        console.error('Error deleting doctor:', xhr); // Debugging log
                        Swal.fire({
                            title: 'Error Deleting Doctor',
                            text: xhr.responseJSON?.message || 'An error occurred while deleting the doctor.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    });

    // Handle announcement form submission
    $('#announcementForm').submit(function(e) {
        e.preventDefault();
        const announcementText = $('#announcement').val();

        if (!announcementText.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Announcement text cannot be empty.',
                icon: 'error'
            });
            return;
        }

        Swal.fire({
            title: 'Posting Announcement...',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: 'http://192.168.1.133:8080/api/v1/admin/announcement',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ message: announcementText }),
            success: function(response) {
                Swal.fire({
                    title: 'Announcement Posted Successfully!',
                    icon: 'success'
                });
                $('#announcementForm')[0].reset();
            },
            error: function(xhr) {
                Swal.fire({
                    title: 'Error Posting Announcement',
                    text: xhr.responseJSON?.message || 'An error occurred while posting the announcement.',
                    icon: 'error'
                });
            }
        });
    });
});
