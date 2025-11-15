var selector = document.querySelector(".selector_box");
selector.addEventListener('click', () => {
    if (selector.classList.contains("selector_open")){
        selector.classList.remove("selector_open")
    }else{
        selector.classList.add("selector_open")
    }
})

document.querySelectorAll(".date_input").forEach((element) => {
    element.addEventListener('click', () => {
        document.querySelector(".date").classList.remove("error_shown")
    })
})

var sex = "m"

document.querySelectorAll(".selector_option").forEach((option) => {
    option.addEventListener('click', () => {
        sex = option.id;
        document.querySelector(".selected_text").innerHTML = option.innerHTML;
    })
})

var upload = document.querySelector(".upload");

var imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = ".jpeg,.png,.gif";

document.querySelectorAll(".input_holder").forEach((element) => {

    var input = element.querySelector(".input");
    input.addEventListener('click', () => {
        element.classList.remove("error_shown");
    })

});

upload.addEventListener('click', () => {
    imageInput.click();
    upload.classList.remove("error_shown")
});

imageInput.addEventListener('change', (event) => {

    upload.classList.remove("upload_loaded");
    upload.classList.add("upload_loading");

    upload.removeAttribute("selected")

    var file = imageInput.files[0];
    
    // Check file size (imgbb limit is 32MB)
    if (file.size > 32 * 1024 * 1024) {
        console.error('File too large. Maximum size is 32MB');
        upload.classList.remove("upload_loading");
        upload.classList.add("error_shown");
        return;
    }
    
    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        console.error('Invalid file type. Only images are allowed');
        upload.classList.remove("upload_loading");
        upload.classList.add("error_shown");
        return;
    }
    
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    var data = new FormData();
    data.append("image", file);

    // Upload to imgbb API
    fetch('https://api.imgbb.com/1/upload?key=76240bd58d7f0712715686e0609cbb51', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
        body: data
    })
    .then(result => {
        console.log('HTTP status:', result.status);
        
        if (!result.ok) {
            throw new Error(`HTTP error! status: ${result.status}`);
        }
        
        return result.json();
    })
    .then(response => {
        console.log('imgbb response:', response);
        
        if (response.success) {
            var url = response.data.url;
            upload.classList.remove("error_shown")
            upload.setAttribute("selected", url);
            upload.classList.add("upload_loaded");
            upload.classList.remove("upload_loading");
            upload.querySelector(".upload_uploaded").src = url;
            console.log('Upload successful! URL:', url);
        } else {
            console.error('imgbb upload failed:', response.error);
            upload.classList.remove("upload_loading");
            upload.classList.add("error_shown");
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        upload.classList.remove("upload_loading");
        upload.classList.add("error_shown");
        
        // Show user-friendly error message
        alert('Błąd podczas przesyłania zdjęcia. Spróbuj ponownie lub wybierz inne zdjęcie.');
    })

})

document.querySelector(".go").addEventListener('click', () => {

    var empty = [];

    var params = new URLSearchParams();

    params.set("sex", sex)
    if (!upload.hasAttribute("selected")){
        empty.push(upload);
        upload.classList.add("error_shown")
    }else{
        params.set("image", upload.getAttribute("selected"))
    }

    var birthday = "";
    var dateEmpty = false;
    document.querySelectorAll(".date_input").forEach((element) => {
        birthday = birthday + "." + element.value
        if (isEmpty(element.value)){
            dateEmpty = true;
        }
    })

    birthday = birthday.substring(1);

    if (dateEmpty){
        var dateElement = document.querySelector(".date");
        dateElement.classList.add("error_shown");
        empty.push(dateElement);
    }else{
        params.set("birthday", birthday)
    }

    document.querySelectorAll(".input_holder").forEach((element) => {

        var input = element.querySelector(".input");

        if (isEmpty(input.value)){
            empty.push(element);
            element.classList.add("error_shown");
        }else{
            params.set(input.id, input.value)
        }

    })

    if (empty.length != 0){
        empty[0].scrollIntoView();
    }else{

        forwardToId(params);
    }

});

function isEmpty(value){

    let pattern = /^\s*$/
    return pattern.test(value);

}

function forwardToId(params){

    location.href = "id.html?" + params

}