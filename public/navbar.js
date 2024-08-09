document.addEventListener('DOMContentLoaded', function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'navbar.html', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = xhr.responseText;
            var navbarContent = tempDiv.querySelector('#navbar-content').innerHTML;
            document.getElementById('navbar-container').innerHTML = navbarContent;
            checkSession();
            addLoginModalEventListeners();
        }
    };
    xhr.send();

    globalUserRole = '';

function checkSession() {
    var xhrSession = new XMLHttpRequest();
    xhrSession.open('GET', '/check-session', true);
    xhrSession.onreadystatechange = function () {
        if (xhrSession.readyState === 4) {
            if (xhrSession.status === 200) {
                var sessionData = JSON.parse(xhrSession.responseText);
                if (sessionData.loggedIn) {
                    globalUserRole = sessionData.userRole; // Store user role globally
                    document.getElementById('loginLink').classList.add('d-none');
                    var userDropdown = document.getElementById('userDropdown');
                    var userDropdownLink = document.getElementById('userDropdownLink');
                    userDropdownLink.textContent = sessionData.username;
                    userDropdown.classList.remove('d-none');

                    // Set visibility based on user role
                    setVisibilityByRole(globalUserRole);

                    userDropdownLink.onclick = function(event) {
                        event.preventDefault();
                        var dropdownMenu = document.querySelector('.dropdown-menu');
                        if (dropdownMenu.style.display === 'block') {
                            dropdownMenu.style.display = 'none';
                        } else {
                            dropdownMenu.style.display = 'block';
                        }
                    }

                    document.addEventListener('click', function(event) {
                        var isClickInside = userDropdown.contains(event.target);
                        if (!isClickInside) {
                            document.querySelector('.dropdown-menu').style.display = 'none';
                        }
                    });
                } else {
                    setVisibilityByRole(null);
                }
            } else {
                console.error('Error checking session:', xhrSession.statusText);
                setVisibilityByRole(null);
            }
        }
    };
    xhrSession.send();
}



function setVisibilityByRole(userRole) {
    // If the user is not logged in, assume they have the "nonUser" role
    if (!userRole) {
        userRole = 'nonUser';
    }

    let roleMatched = false;

    document.querySelectorAll('[data-role]').forEach(function(element) {
        const roles = element.getAttribute('data-role').split(' ');
        if (roles.includes(userRole)) {
            element.style.display = 'block';
            roleMatched = true;
        } else {
            element.style.display = 'none';
        }
    });

    // Show admin actions only if the user is an Admin
    if (userRole === 'Admin') {
        document.getElementById('adminActions').style.display = 'block';
    } else {
        document.getElementById('adminActions').style.display = 'none';
    }

    // If no roles matched, show the non-user content
    if (!roleMatched) {
        document.querySelectorAll('[data-role="nonUser"]').forEach(function(element) {
            element.style.display = 'block';
        });
    } else {
        document.querySelectorAll('[data-role="nonUser"]').forEach(function(element) {
            element.style.display = 'none';
        });
    }
}



    

    function addLoginModalEventListeners() {
        var modal = document.getElementById('loginModal');
        var btn = document.getElementById('loginLink');
        var span = document.getElementsByClassName('close')[0];

        if (btn) {
            btn.onclick = function() {
                modal.style.display = 'block';
            }
        }

        if (span) {
            span.onclick = function() {
                modal.style.display = 'none';
            }
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        var loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.onsubmit = function(event) {
                event.preventDefault();
                var username = document.getElementById('username').value;
                var password = document.getElementById('password').value;

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/login', true);
                xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            modal.style.display = 'none';
                            checkSession();
                        } else {
                            alert('Invalid username or password');
                        }
                    }
                };
                xhr.send(JSON.stringify({ username: username, password: password }));
            };
        }
    }
});
