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

// Display total paients patients in the dashboard
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
            showAppointments();
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

    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login
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
        const emptyRow = $('<tr>').html(`<td colspan="5">No pending appointments</td>`);
        upcomingAppointmentsContainer.append(emptyRow);
    } else {
        appointments.forEach(appointment => {
            const appointmentRow = $('<tr>').html(`
                <td>${appointment.patient.name}</td>
                <td>${appointment.patient.gender}</td>
                <td>${appointment.appointmentDateTime.split('T')[0]}</td>
                <td>${appointment.appointmentDateTime.split('T')[1]}</td>
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
    $('#appointments-modal').show();
}

function closeModal() {
    $('#appointments-modal').hide();
    window.location.href = '/src/components/dashboard/doctor-dashboard.html'; // Redirect to the dashboard
}

function editAppointment(id) {
    alert('Edit appointment with ID: ' + id);
}

function confirmAppointment(id) {
    const newDate = prompt('Enter new appointment date (YYYY-MM-DD):');
    const newTime = prompt('Enter new appointment time (HH:MM):');
    if (newDate && newTime) {
        const newDateTime = `${newDate}T${newTime}:00`;
        $.ajax({
            url: `http://localhost:8080/api/v1/appointments/${id}/confirm`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ appointmentDateTime: newDateTime, status: 'CONFIRMED' }),
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
        alert('Appointment date/time not updated');
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
    if (event.target === $('#appointments-modal')[0]) {
        $('#appointments-modal').hide();
    }
});