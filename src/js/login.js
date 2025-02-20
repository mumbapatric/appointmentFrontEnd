$(document).ready(function () {
  $("#auth-form").submit(function (event) {
    event.preventDefault();
    const form = $(this);
    const username = form.find('input[name="username"]').val();
    const password = form.find('input[name="password"]').val();

    $.ajax({
      url: "http://localhost:8080/api/v1/auth/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password }),
      success: function (data, textStatus, jqXHR) {
        console.log("Response:", jqXHR);
        console.log("Response URL:", jqXHR.url);
        console.log("Status Code:", jqXHR.status);

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        const decodedToken = jwt_decode(data.token);
        const userId = decodedToken.userId;
        localStorage.setItem("userId", userId);

        alert("Login successful");

        if (data.role === "ROLE_DOCTOR") {
          window.location.href =
            "/src/components/dashboard/doctor-dashboard.html";
        } else if (data.role === "ROLE_PATIENT") {
          window.location.href =
            "/src/components/dashboard/patients-dashboard.html";
        } else {
          redirect("http://localhost:8080/login.html");
        }
      },
      Error: function (jqXHR, textStatus, errorThrown) {
        console.error("Error logging in:", errorThrown);
        let errorMessage = "unauthorized access";
        if (jqXHR.status === 401) {
          errorMessage = "Invalid username or password";
        }
        alert("Login failed");
      },
    });
  });
});
