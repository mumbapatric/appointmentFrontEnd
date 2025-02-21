$(document).ready(function() {
    const links = $('.sidebar a');
    const sections = $('.section');
    const buttons = $('button[data-target]');

    // Sidebar navigation
    links.on('click', function(e) {
        e.preventDefault();
        const target = $(this).data('target');
        toggleSection(target);
        activateLink($(this));
    });

    // Button actions
    buttons.on('click', function() {
        const target = $(this).data('target');
        toggleSection(target);
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

    // Fetch specializations from the doctors' data
    function fetchSpecializations() {
        $.ajax({
            url: 'http://localhost:8080/api/v1/doctors',
            type: 'GET',
            success: function(response) {
                console.log("Response when fetching doctors:", response); // Debugging the response

                if (Array.isArray(response.data)) {
                    const specializationSelect = $('#specialization');
                    const specializations = new Set();
                    response.data.forEach(doctor => {
                        specializations.add(doctor.specialization);
                    });
                    specializationSelect.empty();
                    specializationSelect.append('<option value="">Select Specialization</option>');
                    specializations.forEach(specialization => {
                        specializationSelect.append(`<option value="${specialization}">${specialization}</option>`);
                    });
                } else {
                    console.error('Response data is not an array');
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch specializations', error);
            }
        });
    }

    // Fetch doctors based on specialization
    $('#specialization').on('change', function() {
        const specialization = $(this).val();
        if (specialization) {
            console.log(`Fetching doctors with specialization: ${specialization}`); // Debugging the specialization
            $.ajax({
                url: `http://localhost:8080/api/v1/doctors/specialization?query=${specialization}`,
                type: 'GET',
                success: function(response) {
                    console.log("Response when fetching doctors by specialization:", response); // Debugging the response

                    if (Array.isArray(response)) {
                        const doctorSelect = $('#doctor');
                        doctorSelect.empty();
                        doctorSelect.append('<option value="">Select Doctor</option>');
                        response.forEach(doctor => {
                            doctorSelect.append(`<option value="${doctor.id}" data-doctor-id="${doctor.id}">${doctor.name}</option>`);
                        });
                    } else {
                        console.error('Response is not an array');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Failed to fetch doctors', error);
                }
            });
        } else {
            $('#doctor').empty().append('<option value="">Select Doctor</option>');
        }
    });

    // Decode JWT token to get user ID
    function getUserIdFromToken() {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login
        if (token) {
            const decodedToken = jwt_decode(token);
            return decodedToken.userId; // Assuming the token contains userId
        } else {
            console.error('Token is not available in localStorage');
            return null;
        }
    }

    // Fetch patient details using the logged-in user ID
    function fetchPatientDetails(userId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://localhost:8080/api/v1/patients/user/${userId}`,
                type: 'GET',
                success: function(patient) {
                    resolve(patient); // Resolve the patient object
                },
                error: function(xhr, status, error) {
                    reject('Failed to fetch patient details');
                }
            });
        });
    }

    // Submit appointment to the database
    $('#appointmentForm').on('submit', function(e) {
        e.preventDefault();
        const userId = getUserIdFromToken();

        if (userId) {
            fetchPatientDetails(userId).then(function(patient) {
                const doctorId = $('#doctor').val(); // Get the selected doctor ID

                // Ensure that we are passing the Doctor object
                const appointmentData = {
                    specialization: $('#specialization').val(),
                    doctor: { id: doctorId }, // Pass Doctor object with ID
                    fee: $('#fee').val(),
                    date: $('#date').val(),
                    time: $('#time').val(),
                    status: 'PENDING',
                    patient: patient // Patient object
                };

                $.ajax({
                    url: 'http://localhost:8080/api/v1/appointments',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(appointmentData),
                    success: function(response) {
                        alert('Appointment booked successfully');
                        $('#appointmentForm')[0].reset();
                    },
                    error: function(xhr, status, error) {
                        console.error('Failed to book appointment', xhr.responseText);
                        alert('Failed to book appointment: ' + xhr.responseText);
                    }
                });
            }).catch(function(error) {
                console.error(error);
                alert('Failed to fetch patient details');
            });
        } else {
            alert('Failed to get user ID from token');
        }
    });

    // Initial fetch of specializations
    fetchSpecializations();
});
