$(document).ready(function() {
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        var target = $(this).data('target');
        $('.section').removeClass('active');
        $('#' + target).addClass('active');
        $('nav ul li').removeClass('active');
        $(this).parent().addClass('active');

        // Hide delete and search doctor sections when switching sections
        $('#delete-doctor-section').hide();
        $('#search-doctor-section').hide();
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
                            text: xhr.responseJSON?.message || 'no doctor found with the given email.',
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

    $('.search-doctor-btn').click(function(e) {
        e.preventDefault();
        $('#search-doctor-section').toggle(); // Show or hide the search doctor section
    });

    $('#searchDoctorBtn').click(function(e) {
        e.preventDefault();
        const doctorName = $('#searchDoctorName').val().trim();

        if (!doctorName) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter a doctor name to search.',
                icon: 'error'
            });
            return;
        }

        Swal.fire({
            title: 'Searching Doctor...',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // API call to search doctor by name
        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/doctors/doctorName?name=${encodeURIComponent(doctorName)}`,
            method: 'GET',
            success: function(response) {
                Swal.close();
                const doctorTableBody = $('#doctorTableBody');
                doctorTableBody.empty(); // Clear existing rows

                if (response.length === 0) {
                    Swal.fire({
                        title: 'No Results',
                        text: 'No doctors found with the given name.',
                        icon: 'info'
                    });
                    return;
                }

                response.forEach((doctor, index) => {
                    const row = `<tr>
                        <td>${index + 1}</td>
                        <td>${doctor.name}</td>
                        <td>${doctor.specialization}</td>
                        <td><button class='view-details-btn' data-id='${doctor.id}'>View Details</button></td>
                    </tr>`;
                    doctorTableBody.append(row);
                });

                // Hide the search section after displaying results
                $('#search-doctor-section').hide();
            },
            error: function(xhr) {
                Swal.fire({
                    title: 'Error Searching Doctor',
                    text: xhr.responseJSON?.message || 'An error occurred while searching for the doctor.',
                    icon: 'error'
                });
            }
        });
    });

    $('nav ul li a[data-target="manage-appointments"]').click(function(e) {
        e.preventDefault();

        // Ensure the appointments section is visible
        $('.section').removeClass('active');
        $('#manage-appointments').addClass('active').show(); // Force visibility

        // Show loading alert while fetching appointments
        Swal.fire({
            title: 'Fetching Appointments...',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // API call to fetch all appointments
        $.ajax({
            url: 'http://192.168.1.133:8080/api/v1/appointments',
            method: 'GET',
            success: function(response) {
                console.log('API Response:', response); // Debugging log
                Swal.close(); // Close the loading alert

                const appointmentTableBody = $('#appointmentTableBody');
                console.log('Appointment Table Body:', appointmentTableBody); // Debugging log
                console.log('Is Table Body Visible:', appointmentTableBody.is(':visible')); // Debugging log
                appointmentTableBody.empty(); // Clear existing rows

                if (response.length === 0) {
                    console.log('No appointments found in the response.'); // Debugging log
                    Swal.fire({
                        title: 'No Appointments Found',
                        text: 'There are no appointments to display.',
                        icon: 'info'
                    });
                    return;
                }

                response.forEach((appointment, index) => {
                    console.log('Processing Appointment:', appointment); // Debugging log

                    const patientName = appointment.patient?.name || 'N/A';
                    const doctorName = appointment.doctor?.name || 'N/A';
                    const date = appointment.date || 'N/A';
                    const time = appointment.time || 'N/A';
                    const status = appointment.status || 'N/A';
                    const fees = appointment.fees || 'N/A';

                    const row = `<tr>
                        <td>${index + 1}</td>
                        <td>${patientName}</td>
                        <td>${doctorName}</td>
                        <td>${date}</td>
                        <td>${time}</td>
                        <td>${status}</td>
                        <td>${fees}</td>
                        <td><button class='view-details-btn' data-id='${appointment.id}'>View Details</button></td>
                    </tr>`;
                    console.log('Appending Row:', row); // Debugging log
                    appointmentTableBody.append(row);
                });

                // Force table rendering
                appointmentTableBody.closest('table').show();
                console.log('Final Table Content:', appointmentTableBody.html()); // Debugging log
            },
            error: function(xhr) {
                console.error('Error fetching appointments:', xhr); // Debugging log
                Swal.close(); // Close the loading alert
                Swal.fire({
                    title: 'Error',
                    text: (xhr.responseJSON && xhr.responseJSON.message) || 'An error occurred while fetching appointments.',
                    icon: 'error'
                });
            }
        });
    });
});
