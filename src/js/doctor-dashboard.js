// Fetch patient data from the server
function fetchPatients() {
    $.ajax({
        url: 'http://localhost:8080/api/v1/patients',
        type: 'GET',
        success: function(patients) {
            console.log('fetched patients', patients); // log the patients to the console
            displayPatients(patients);
            $('#total-patients').text(patients.length);
        },
        error: function(xhr, status, error) {
            console.error('failed to fetch patients', error);
        }
    });
}

// Display total patients in the dashboard
function displayPatients(patients) {
    const patientContainer = $('.patients-list');
    patientContainer.empty(); // clear the patient container
}

// Fetch the doctor using the userId and return a promise
function fetchDoctorId(userId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://localhost:8080/api/v1/doctors/user/${userId}`,
            type: 'GET',
            success: function(doctor) {
                resolve(doctor.id); // Resolve the doctor ID
            },
            error: function(xhr, status, error) {
                reject('failed to fetch doctor');
            }
        });
    });
}

// Fetch pending appointments for the doctor
function fetchPendingAppointments(doctorId) {
    $.ajax({
        url: `http://localhost:8080/api/v1/appointments/doctor/${doctorId}`,
        type: 'GET',
        success: function(appointments) {
            console.log('All appointments:', appointments);
            const pendingAppointments = appointments.filter(appointment => appointment.status === 'PENDING');
            displayPendingAppointments(pendingAppointments);
            $('#todays-appointments').text(pendingAppointments.length);
        },
        error: function(xhr, status, error) {
            console.error('failed to fetch appointments', error);
        }
    });
}

$(document).ready(function() {
    // Ensure jwt_decode is defined
    if (typeof jwt_decode === 'undefined') {
        console.error('jwt_decode is not defined');
        return;
    }

    const token = localStorage.getItem('token'); // extract the token from localStorage
    if (token) {
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.userId;
        localStorage.setItem('userId', userId);
        if (userId) {
            fetchDoctorId(userId).then(function(doctorId) {
                if (doctorId) {
                    fetchPatients();
                    fetchPendingAppointments(doctorId);
                    $('#appointments-link').click(function() {
                        fetchPendingAppointments(doctorId);
                    });
                    $('.btn-primary').click(function() {
                        fetchPendingAppointments(doctorId);
                        showAppointments();
                    });
                } else {
                    console.error('Doctor ID could not be fetched');
                }
            }).catch(function(error) {
                console.error(error); // Handle any errors that occurred while fetching doctor ID
            });
        } else {
            console.error('User ID could not be extracted from token');
        }
    } else {
        console.error('Token is not available in localStorage');
    }

    // Settings navigation
    $('#settings-link').click(function() {
        $('#settings-dropdown').toggleClass('show');
        $('#logout-btn').toggleClass('shift-down');
    });

    $(window).click(function(event) {
        if (!event.target.matches('#settings-link')) {
            $('#settings-dropdown').removeClass('show');
            $('#logout-btn').removeClass('shift-down');
        }
    });
});

// Display pending appointments in the dashboard
function displayAppointments(appointments) {
    const appointmentsContainer = $('.appointments-list');
    appointmentsContainer.empty(); // clear the appointments container
    appointments.forEach(appointment => {
        const appointmentsItem = $('<div>').addClass('appointments-item').html(`
            <h4>${appointment.patient.name}</h4>
            <p>Date: ${appointment.date}</p>
            <p>Time: ${appointment.time}</p>
        `);
        appointmentsContainer.append(appointmentsItem);
    });
}

// Display pending appointments in the modal
function displayPendingAppointments(appointments) {
    const upcomingAppointmentsContainer = $('#upcoming-appointments-table');
    upcomingAppointmentsContainer.empty();
    if (appointments.length === 0) {
        const emptyRow = $('<tr>').html(`<td colspan="6">No pending appointments</td>`);
        upcomingAppointmentsContainer.append(emptyRow);
    } else {
        appointments.forEach(appointment => {
            const appointmentRow = $('<tr>').html(`
                <td>${appointment.patient.name}</td>
                <td>${appointment.patient.gender}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td>${appointment.status}</td>
                <td>
                    <button class="btn btn-secondary" onclick="editAppointment(${appointment.id})">Edit</button>
                    <button class="btn btn-success" onclick="confirmAppointment(${appointment.id})">Confirm</button>
                    <button class="btn btn-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                </td>
            `);
            upcomingAppointmentsContainer.append(appointmentRow);
        });
    }
}

function showAppointments() {
    $('#appointmentsModal').show();
}

function closeModal() {
    $('#appointmentsModal').hide();
    window.location.href = '/src/components/dashboard/doctor-dashboard.html'; // Redirect to the dashboard
}

function editAppointment(id) {
    alert('Edit appointment with ID: ' + id);
}

function confirmAppointment(id) {
    const newDate = prompt('Enter new appointment date (YYYY-MM-DD):');
    const newTime = prompt('Enter new appointment time (HH:MM):');
    if (newDate && newTime) {
        $.ajax({
            url: `http://localhost:8080/api/v1/appointments/${id}/confirm`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ date: newDate, time: newTime, status: 'CONFIRMED' }),
            success: function(response) {
                alert('Appointment confirmed and date/time updated successfully');
                fetchPendingAppointments(localStorage.getItem('doctorId')); // Refresh the appointments list
            },
            error: function(xhr, status, error) {
                console.error('Failed to update appointment', xhr.responseText);
                alert('Failed to update appointment: ' + xhr.responseText);
            }
        });
    } else {
        alert('Appointment failed to be updated');
    }
}

function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        $.ajax({
            url: `http://localhost:8080/api/v1/appointments/${id}/cancel`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status: 'CANCELLED' }),
            success: function(response) {
                alert('Appointment cancelled successfully');
                fetchPendingAppointments(localStorage.getItem('doctorId')); // Refresh the appointments list
            },
            error: function(xhr, status, error) {
                console.error('Failed to cancel appointment', xhr.responseText);
                alert('Failed to cancel appointment: ' + xhr.responseText);
            }
        });
    }
}

$(window).click(function(event) {
    if (event.target === $('#appointmentsModal')[0]) {
        $('#appointmentsModal').hide();
    }
});

$(document).ready(function() {
    const token = localStorage.getItem('token');
    if (token) {
        const user = jwt_decode(token);
        const userName = user.name ? (user.role === 'ROLE_DOCTOR' ? 'Dr. ' + user.name : user.name) : 'User';
        $('.user-info').text('Welcome ' + userName);
    } else {
        window.location.href = '/src/pages/auth/login.html';
    }
});

$('#logout-btn').on('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/src/pages/auth/login.html'; // Redirect to the login page
    alert('You have successfully logged out');
});