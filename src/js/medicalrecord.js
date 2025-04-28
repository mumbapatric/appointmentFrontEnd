$(document).ready(function () {
    fetchAllRecords();

    // Pre-fill the doctor ID field if the logged-in user is a doctor
    prefillDoctorId();

    function prefillDoctorId() {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwt_decode(token);
            const userId = decodedToken.userId;
            if (userId) {
                fetchDoctorId(userId).then(function (doctorId) {
                    if (doctorId) {
                        $("#doctor-id").val(doctorId).prop("readonly", true);
                    } else {
                        console.error("Doctor ID could not be fetched");
                    }
                }).catch(function (error) {
                    console.error(error);
                });
            } else {
                console.error("User ID could not be extracted from token");
            }
        } else {
            console.error("Token is not available in localStorage");
        }
    }

    function fetchDoctorId(userId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://192.168.1.133:8080/api/v1/doctors/user/${userId}`,
                type: "GET",
                success: function (doctor) {
                    resolve(doctor.id);
                },
                error: function (xhr, status, error) {
                    reject("Failed to fetch doctor ID");
                }
            });
        });
    }

    // Function to fetch all records
    function fetchAllRecords() {
        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/medicalRecords`, // Changed to template literal
            type: "GET",
            success: function (data) {
                populateRecordsTable(data);
            },
            error: function (xhr) {
                console.error("Error fetching records:", xhr.responseText);
                showMessage("Failed to fetch records. Please try again.", "error");
            }
        });
    }

    // Function to populate the medical records table
    function populateRecordsTable(records) {
        const tableBody = $("#records-table tbody");
        tableBody.empty(); // Clear existing rows

        records.forEach((record) => {
            const row = `
                <tr>
                    <td>${record.id}</td>
                    <td>${record.patient.id}</td>
                    <td>${record.doctor.id}</td>
                    <td>${record.recordDate}</td>
                    <td>${record.notes}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    // Handle Add Medical Record button click
    $("#add-record").on("click", function () {
        const payload = getFormData();
        console.log("Payload for adding record:", payload);

        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/medicalRecords`, // Changed to template literal
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function () {
                showMessage("Medical record added successfully!", "success");
                fetchAllRecords();
            },
            error: function (xhr) {
                console.error("Error adding record:", xhr.responseText);
                showMessage(getErrorMessage(xhr), "error");
            }
        });
    });

    // Handle Update Medical Record button click
    $("#update-record").on("click", function () {
        const recordId = prompt("Enter the ID of the record to update:");
        if (!recordId) return;

        const payload = getFormData();
        console.log("Payload for updating record:", payload);

        $.ajax({
            url: `http://192.168.1.133:8080/api/v1/medicalRecords/${recordId}`, // Changed to template literal
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function () {
                showMessage("Medical record updated successfully!", "success");
                fetchAllRecords();
            },
            error: function (xhr) {
                console.error("Error updating record:", xhr.responseText);
                showMessage(getErrorMessage(xhr), "error");
            }
        });
    });

    // Function to get form data
    function getFormData() {
        return {
            doctor: { id: parseInt($("#doctor-id").val()) },
            patient: { id: parseInt($("#patient-id").val()) },
            recordDate: $("#record-date").val(),
            notes: $("#notes").val()
        };
    }

    // Function to show messages
    function showMessage(message, type) {
        const container = $("#message-container");
        container.removeClass("success error").addClass(type).text(message).slideDown();
        setTimeout(() => container.slideUp(), 3000);
    }

    // Function to extract error messages from AJAX response
    function getErrorMessage(xhr) {
        if (xhr.responseJSON && xhr.responseJSON.message) {
            return xhr.responseJSON.message;
        }
        return "An unknown error occurred.";
    }
});