// Fetch patient data from the server
function fetchPatients(){
    $.ajax({
        url: 'http://localhost:8080/api/v1/patients',
        type: 'GET',
        success: function(patients){
            console.log('fettched patients', patients); // log the patients to the console
        
        displayPatients(patients);
        $('#total-patients').text(patients.length);
        },  
        Error: function(xhr,status,error){
            console.error('failed to fetch patients', error)
        }
        
    })
}

//Display patients in the dashboard
function displayPlayPatients(patients){
    const patientContainer= $('.patients-list');
    patientContainer.empty(); // clear the patient container
    patients.forEach(patients=>{
        const patientItem = $('<div>').addClass('patient-item').html(`
            <h4>${patient.name}</h4>
            <p>Age: ${patient.age}</p>
            <p>Contact: ${patient.contact}</p>
        `);
        patientContainer.append(patientItem);
    });
}

//fetching the doctor using the userId
function fetchDoctorId(userId){
    return $.ajax ({
        url: `http://localhost:8080/api/v1/doctors/user/${userId}`,
        type: 'GET',
        success: function(doctor){
            return doctor.id;
        },
        error: function(xhr,status,error){
            console.error('failed to fetch doctor', error);
        }

    });
}

//fetching pending appointments for the doctor
function fetchPendingAppointments(doctorId){
    $.ajax({
        url: `http://localhost:8080/api/v1/appointments/doctor/${doctorId}?status=PENDING`,
       type: 'GET',
       success: function(appointments){
        console.log('fetched appointments:',appointments);
        displayPendingAppointments(appointments);
        showAppointments();
       },
       error: function(xhr,status,error){
        console.error('failed to fetch appointments', error);
       }
    });
}

$(document).ready(function() {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login
    if (token) {
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.userId;
        localStorage.setItem('userId', userId);
        if (userId) {
            fetchDoctorId(userId).then(function(doctorId) {
                if (doctorId) {
                    fetchPatients();
                    fetchAppointments(doctorId);
                    $('#appointments-link').click(function() {
                        fetchPendingAppointments(doctorId);
                    });
                } else {
                    console.error('Doctor ID could not be fetched');
                }
            });
        } else {
            console.error('User ID could not be extracted from token');
        }
    } else {
        console.error('Token is not available in localStorage');
    }
});

// display pending appointments in the dashboard
function displayAppointments(appointments){
    const appointmentsContainer = $('.appointments-list');
    appointmentsContainer.empty(); // clear the appointments container
    appointments.forEach(appointments=> {
        const appointmentsItem = $('<div>').addClass('appointments-item').html(`
            <h4>${appointment.patient.name}</h4>
            <p>Date: ${appointment.date}</p>
            <p>Time: ${appointment.time}</p>
        `);  
        appointmentsContainer.append(appointmentsItem); 
    });
}

//Display pending appointments in the model
function displayPendingAppointments(appointments){
    const upcomingAppointmentssContainer = $('#upcoming-appointments-table');
    upcomingAppointmentssContainer.empty();
    if(appointments.length === 0){
        const emptyRow = $('<tr>').html(`<td colspan="5">No pending appointments</td>`);
    }
    else{
        appointments.forEach(appointment => {
            const appointmentRow = $('<tr>').html(`
                <td>${appointment.patient.name}</td>
                <td>${appointment.patient.age}</td>
                <td>${appointment.appointmentDateTime.split('T')[0]}</td>
                <td>${appointment.appointmentDateTime.split('T')[1]}</td>
                <td>${appointment.status}</td>
 <td>
                    <button class="btn btn-secondary" onclick="editAppointment(${appointment.id})">Edit</button>
                    <button class="btn btn-success" onclick="confirmAppointment(${appointment.id})">Confirm</button>
                    <button class="btn btn-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                </td>           
                 `);
            upcomingAppointmentssContainer.append(appointmentRow);
        });
    }
}
function showAppointments(){
    $('#appointments-modal').show('show');
}

function closeModel(){
    $('#appointments-modal').hide();
}
function editAppointment(id){
    alert('Edit appointment with ID: ' + id);
}
function confirmAppointment(id){
    alert('Confirm appointment with ID: ' + id);
}
function cancelAppointment(id){
    alert('Cancel appointment with ID: ' + id);
}

$(window).click(function(event){
    if(event.target === $('#appointments-modal')[0]){
        $('#appointments-modal').hide();
    }
});