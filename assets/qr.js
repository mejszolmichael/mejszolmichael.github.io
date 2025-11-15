var error = document.querySelector(".error");

// Only show error for actions that don't have onclick navigation
document.querySelectorAll(".action").forEach((element) => {
    element.addEventListener('click', (e) => {
        // Check if this element has onclick navigation
        if (!element.getAttribute('onclick')) {
            error.classList.add("error_open");
        }
    });
});

document.querySelectorAll(".close").forEach((element) => {
    element.addEventListener('click', () => {
        error.classList.remove("error_open");
    })
})