
    // Fetch all patients data from the backend
    async function fetchPatients() {
        try {
            let response = await fetch('http://localhost:8080/api/v1/patients');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            let patients = await response.json();
            console.log('Fetched patients:', patients); // Log the response
            displayPatients(patients);
            document.getElementById('total-patients').innerText = patients.length;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    // Display patients data on the dashboard
    function displayPatients(patients) {
        const patientsContainer = document.querySelector('.patients-list');
        patientsContainer.innerHTML = ''; // Clear any existing content
        patients.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.classList.add('patient-item');
            patientItem.innerHTML = `
                <h4>${patient.name}</h4>
                <p>Age: ${patient.age}</p>
                <p>Condition: ${patient.condition}</p>
            `;
            patientsContainer.appendChild(patientItem);
        });
    }

    // Fetch the doctorId using the userId
    async function fetchDoctorId(userId) {
        try {
            let response = await fetch(`http://localhost:8080/api/v1/doctors/user/${userId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            let doctor = await response.json();
            return doctor.id;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    // Fetch all appointments data from the backend using the doctorId
    async function fetchAppointments(doctorId) {
        try {
            let response = await fetch(`http://localhost:8080/api/v1/appointments/doctor/${doctorId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            let appointments = await response.json();
            console.log('Fetched appointments:', appointments); // Log the response
            displayAppointments(appointments);

            // Update the summary card for today's appointments
            const todaysAppointments = appointments.filter(appointment => new Date(appointment.date).toDateString() === new Date().toDateString());
            document.getElementById('todays-appointments').innerText = todaysAppointments.length;

            // Update the summary card for upcoming appointments
            const upcomingAppointments = appointments.filter(appointment => new Date(appointment.date) > new Date());
            document.getElementById('upcoming-appointments').innerText = upcomingAppointments.length;
            displayUpcomingAppointments(upcomingAppointments);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    // Fetch pending appointments for the doctor
    async function fetchPendingAppointments(doctorId) {
        try {
            let response = await fetch(`http://localhost:8080/api/v1/appointments/doctor/${doctorId}?status=PENDING`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            let appointments = await response.json();
            console.log('Fetched pending appointments:', appointments); // Log the response
            displayPendingAppointments(appointments);
            showAppointments();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after login
        if (token) {
            const decodedToken = jwt_decode(token);
            const userId = decodedToken.userId;
            localStorage.setItem('userId', userId);
            if (userId) {
                const doctorId = await fetchDoctorId(userId);
                if (doctorId) {
                    fetchPatients();
                    fetchAppointments(doctorId);
                    document.getElementById('appointments-link').addEventListener('click', () => fetchPendingAppointments(doctorId));
                } else {
                    console.error('Doctor ID could not be fetched');
                }
            } else {
                console.error('User ID could not be extracted from token');
            }
        } else {
            console.error('Token is not available in localStorage');
        }
    });

    // Display appointments data on the dashboard
    function displayAppointments(appointments) {
        const appointmentsContainer = document.querySelector('.appointments-list');
        appointmentsContainer.innerHTML = ''; // Clear any existing content
        appointments.forEach(appointment => {
            const appointmentItem = document.createElement('div');
            appointmentItem.classList.add('appointment-item');
            appointmentItem.innerHTML = `
                <h4>${appointment.patientId}</h4>
                <p>${appointment.date} ${appointment.time} - ${appointment.type}</p>
            `;
            appointmentsContainer.appendChild(appointmentItem);
        });
    }

    // Display pending appointments in the modal
    function displayPendingAppointments(appointments) {
        const upcomingAppointmentsTable = document.getElementById('upcoming-appointments-table');
        upcomingAppointmentsTable.innerHTML = ''; // Clear any existing content
        if (appointments.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="5">No pending appointments</td>';
            upcomingAppointmentsTable.appendChild(emptyRow);
        } else {
            appointments.forEach(appointment => {
                const appointmentRow = document.createElement('tr');
                appointmentRow.innerHTML = `
                    <td>${appointment.patient.name}</td>
                    <td>${appointment.appointmentDateTime.split('T')[0]}</td>
                    <td>${appointment.appointmentDateTime.split('T')[1]}</td>
                    <td>${appointment.status}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="editAppointment(${appointment.id})">Edit</button>
                        <button class="btn btn-success" onclick="confirmAppointment(${appointment.id})">Confirm</button>
                        <button class="btn btn-danger" onclick="cancelAppointment(${appointment.id})">Cancel</button>
                    </td>
                `;
                upcomingAppointmentsTable.appendChild(appointmentRow);
            });
        }
    }

    function showAppointments() {
        document.getElementById('appointmentsModal').style.display = 'block';
    }

    function closeModal() {
        document.getElementById('appointmentsModal').style.display = 'none';
    }

    function editAppointment(id) {
        alert('Edit appointment ' + id);
    }

    function confirmAppointment(id) {
        alert('Confirm appointment ' + id);
    }

    function cancelAppointment(id) {
        alert('Cancel appointment ' + id);
    }

    window.onclick = function(event) {
        if (event.target == document.getElementById('appointmentsModal')) {
            closeModal();
        }
    };
