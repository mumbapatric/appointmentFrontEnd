$(document).ready(function() {
    const links = $('.sidebar a');
    const sections = $('.section');
    const buttons = $('button[data-target]');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('User not logged in');
        return;
    }
    
    const userId = jwt_decode(token).userId;

    // Sidebar navigation
    links.on('click', function(e) {
        e.preventDefault();
        const target = $(this).data('target');
        toggleSection(target);
        activateLink($(this));
        if (target === 'appointment-history') {
            fetchAndDisplayAppointments();
        }
    });

    // Button actions
    buttons.on('click', function() {
        const target = $(this).data('target');
        toggleSection(target);
        if (target === 'appointment-history') {
            fetchAndDisplayAppointments();
        }
    });

    function toggleSection(targetId) {
        sections.removeClass('active');
        sections.each(function() {
            if ($(this).attr('id') === targetId) {
                $(this).addClass('active');
            }
        });
    }

    function activateLink(activeLink) {
        links.parent().removeClass('active');
        activeLink.parent().addClass('active');
    }

    function fetchSpecializations() {
        $.ajax({
            url: 'http://192.168.1.133:8080/api/v1/doctors',
            type: 'GET',
            success: function(response) {
                if (Array.isArray(response.data)) {
                    const specializationSelect = $('#specialization');
                    specializationSelect.empty().append('<option value="">Select Specialization</option>');
                    new Set(response.data.map(doc => doc.specialization)).forEach(spec => {
                        specializationSelect.append(`<option value="${spec}">${spec}</option>`);
                    });
                } else {
                    console.error('Response data is not an array');
                }
            },
            error: function() {
                console.error('Failed to fetch specializations');
            }
        });
    }

    $('#specialization').on('change', function() {
        const specialization = $(this).val();
        if (!specialization) {
            $('#doctor').empty().append('<option value="">Select Doctor</option>');
            return;
        }
        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/doctors/specialization?query=${specialization}`,
            type: 'GET',
            success: function(response) {
                const doctorSelect = $('#doctor');
                doctorSelect.empty().append('<option value="">Select Doctor</option>');
                if (Array.isArray(response)) {
                    response.forEach(doc => {
                        doctorSelect.append(`<option value="${doc.id}" data-doctor-id="${doc.id}">${doc.name}</option>`);
                    });
                } else {
                    console.error('Response is not an array');
                }
            },
            error: function() {
                console.error('Failed to fetch doctors');
            }
        });
    });

    function fetchPatientDetails(userId) {
        return $.ajax({
            url: `http://192.168.1.133:8080/api/v1/patients/user/${userId}`,
            type: 'GET'
        });
    }

    $('#appointmentForm').on('submit', function(e) {
        e.preventDefault();
        fetchPatientDetails(userId).then(function(patient) {
            const appointmentData = {
                specialization: $('#specialization').val(),
                doctor: { id: $('#doctor').val() },
                fees: $('#fee').val(),
                date: $('#date').val(),
                time: $('#time').val(),
                status: 'PENDING',
                patient: patient
            };
            $.ajax({
                url: 'http://192.168.1.133:8080/api/v1/appointments',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(appointmentData),
                success: function() {
                    alert('Appointment booked successfully');
                    $('#appointmentForm')[0].reset();
                },
                error: function(xhr) {
                    alert('Failed to book appointment: ' + xhr.responseText);
                }
            });
        }).catch(() => alert('Failed to fetch patient details'));
    });

    function fetchAndDisplayAppointments() {
        fetchPatientDetails(userId).then(function(patient) {
            $.ajax({
                url: `http://192.168.1.133:8080/api/v1/appointments/patient/${patient.id}`,
                method: 'GET',
                success: function(data) {
                    const appointmentTableBody = $('#appointmentTableBody');
                    appointmentTableBody.empty();
                    if (!data.length) {
                        appointmentTableBody.append('<tr><td colspan="8">No appointments found</td></tr>');
                        return;
                    }
                    data.forEach((appointment, index) => {
                        appointmentTableBody.append(`
                            <tr>
                                <td>${index + 1}</td>
                                <td>${appointment.doctor.name}</td>
                                <td>${appointment.doctor.specialization}</td>
                                <td>${appointment.fees}</td>
                                <td>${appointment.date}</td>
                                <td>${appointment.time}</td>
                                <td>${appointment.status}</td>
                                <td>
                                    <button class="action-btn cancel-btn" data-appointment-id="${appointment.id}">Cancel</button>
                                </td>
                            </tr>
                        `);
                    });
                    $('.cancel-btn').on('click', function() {
                        const appointmentId = $(this).data('appointment-id');
                        cancelAppointment(appointmentId);
                    });
                },
                error: function() {
                    $('#appointmentTableBody').append('<tr><td colspan="8">Failed to fetch appointments</td></tr>');
                }
            });
        });
    }

    function cancelAppointment(appointmentId) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            $.ajax({
                url: `http://192.168.1.133:8080/api/v1/appointments/${appointmentId}`,
                type: 'DELETE',
                success: function() {
                    alert('Appointment cancelled successfully');
                    fetchAndDisplayAppointments(); // Refresh the appointments list
                },
                error: function(xhr) {
                    alert('Failed to cancel appointment: ' + xhr.responseText);
                }
            });
        }
    }

   
    fetchSpecializations();
});

$(document).ready(function(){
    const token = localStorage.getItem('token');
    if(token){
        const user = jwt_decode(token);
        const userName = user.name ? (user.roles)==='ROLE_PATIENT' ? user.name :user.name : 'User';
        $('.user-info').text('Welcome ' + userName);
    }

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
}
);   


