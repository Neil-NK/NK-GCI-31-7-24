// navbar.js
(function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'navbar.html', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Create a temporary div to hold the HTML content
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = xhr.responseText;

            // Get the navbar content
            var navbarContent = tempDiv.querySelector('#navbar-content').innerHTML;

            // Inject it into the navbar-container
            document.getElementById('navbar-container').innerHTML = navbarContent;
        }
    };
    xhr.send();
})();
