$(document).ready(function() {
    $('nav ul li a').click(function(e) {
        e.preventDefault();
        var target = $(this).data('target');
        $('.section').removeClass('active');
        $('#' + target).addClass('active');
        $('nav ul li').removeClass('active');
        $(this).parent().addClass('active');
              });
        });
    

    $('#reportForm').submit(function(e) {
        e.preventDefault();
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();
        
    });

    $('#logFilterForm').submit(function(e) {
        e.preventDefault();
        var logStartDate = $('#logStartDate').val();
        var logEndDate = $('#logEndDate').val();
       
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
