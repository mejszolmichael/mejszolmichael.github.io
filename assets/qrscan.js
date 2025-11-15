let video, canvas, context;
let scanning = false;
let stream = null;

// Initialize the scanner when page loads
document.addEventListener('DOMContentLoaded', function() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    
    const manualEntryBtn = document.getElementById('manualEntryBtn');
    const submitCodeBtn = document.getElementById('submitCode');
    const cancelManualBtn = document.getElementById('cancelManual');
    const manualCodeInput = document.getElementById('manualCodeInput');
    manualEntryBtn.addEventListener('click', showManualEntry);
    submitCodeBtn.addEventListener('click', submitManualCode);
    cancelManualBtn.addEventListener('click', hideManualEntry);
    
    // Allow Enter key to submit manual code
    manualCodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitManualCode();
        }
    });
    
    // Start scanning automatically
    startScanning();
});

async function startScanning() {
    try {
        console.log('Starting camera access...');
        
        // Request camera access
        let constraints = { 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        };
        
        // Try with back camera first
        try {
            constraints.video.facingMode = 'environment';
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
            console.log('Back camera not available, trying any camera...');
            // Fallback to any camera
            delete constraints.video.facingMode;
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        }
        
        console.log('Camera stream obtained:', stream);
        
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.onloadedmetadata = function() {
            console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
            video.style.display = 'block';
            video.style.visibility = 'visible';
            video.play();
        };
        
        video.oncanplay = function() {
            console.log('Video can play, starting scan...');
            // Hide loading indicator
            const loadingElement = document.getElementById('cameraLoading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            scanning = true;
            scanQR();
        };
        
        video.onerror = function(error) {
            console.error('Video error:', error);
            const loadingElement = document.getElementById('cameraLoading');
            if (loadingElement) {
                loadingElement.innerHTML = '<p>Błąd ładowania kamery</p>';
            }
        };
        
        // Hide other elements
        document.getElementById('scannedData').style.display = 'none';
        document.getElementById('notFoundMessage').style.display = 'none';
        document.getElementById('manualInputContainer').style.display = 'none';
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        // Show manual entry as fallback
        showManualEntry();
        alert('Nie można uzyskać dostępu do kamery. Użyj opcji "Wpisz kod".');
    }
}

function stopScanning() {
    scanning = false;
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    video.pause();
    video.srcObject = null;
}

function scanQR() {
    if (!scanning) return;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
            console.log('QR Code detected:', code.data);
            handleScannedData(code.data);
            return; // Stop scanning after successful detection
        }
    }
    
    if (scanning) {
        requestAnimationFrame(scanQR);
    }
}

function handleScannedData(data) {
    try {
        // Try to parse as URL with parameters
        const url = new URL(data);
        const params = new URLSearchParams(url.search);
        
        // Check if it contains the expected parameters
        if (params.has('id') && params.has('name') && params.has('surname')) {
            displayUserData(params);
        } else {
            // If it's not a URL with our expected format, show raw data
            displayRawData(data);
        }
    } catch (error) {
        // If it's not a valid URL, show raw data
        displayRawData(data);
    }
    
    stopScanning();
}

function displayUserData(params) {
    const dataContent = document.getElementById('dataContent');
    
    // Sample data from the provided URL
    const sampleData = {
        id: params.get('id') || '68c6892ea1b64',
        sex: params.get('sex') || 'k',
        image: params.get('image') || '',
        birthday: params.get('birthday') || '11.11.2000',
        name: params.get('name') || 'Mateusz',
        surname: params.get('surname') || 'Jarosz',
        nationality: params.get('nationality') || 'Polskie',
        familyName: params.get('familyName') || 'Jarosz',
        fathersFamilyName: params.get('fathersFamilyName') || 'Jarosz',
        mothersFamilyName: params.get('mothersFamilyName') || 'Duda',
        birthPlace: params.get('birthPlace') || 'Warszawa',
        countryOfBirth: params.get('countryOfBirth') || 'Polska',
        adress1: params.get('adress1') || 'Wejherowska+2',
        adress2: params.get('adress2') || '03-538',
        city: params.get('city') || 'Warszawa'
    };
    
    // Format sex display
    const sexDisplay = sampleData.sex === 'k' ? 'Kobieta' : 'Mężczyzna';
    
    // Format address
    const address = `${decodeURIComponent(sampleData.adress1)}<br>${sampleData.adress2} ${sampleData.city}`;
    
    dataContent.innerHTML = `
        <div class="user_data_card">
            <div class="data_section">
                <h4>Dane osobowe</h4>
                <div class="data_row">
                    <span class="data_label">Imię:</span>
                    <span class="data_value">${sampleData.name}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Nazwisko:</span>
                    <span class="data_value">${sampleData.surname}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Płeć:</span>
                    <span class="data_value">${sexDisplay}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Data urodzenia:</span>
                    <span class="data_value">${sampleData.birthday}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Obywatelstwo:</span>
                    <span class="data_value">${sampleData.nationality}</span>
                </div>
            </div>
            
            <div class="data_section">
                <h4>Dane dodatkowe</h4>
                <div class="data_row">
                    <span class="data_label">Nazwisko rodowe:</span>
                    <span class="data_value">${sampleData.familyName}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Nazwisko ojca:</span>
                    <span class="data_value">${sampleData.fathersFamilyName}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Nazwisko matki:</span>
                    <span class="data_value">${sampleData.mothersFamilyName}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Miejsce urodzenia:</span>
                    <span class="data_value">${sampleData.birthPlace}</span>
                </div>
                <div class="data_row">
                    <span class="data_label">Kraj urodzenia:</span>
                    <span class="data_value">${sampleData.countryOfBirth}</span>
                </div>
            </div>
            
            <div class="data_section">
                <h4>Adres</h4>
                <div class="data_row">
                    <span class="data_label">Adres:</span>
                    <span class="data_value">${address}</span>
                </div>
            </div>
            
            <div class="data_section">
                <h4>Informacje techniczne</h4>
                <div class="data_row">
                    <span class="data_label">ID:</span>
                    <span class="data_value">${sampleData.id}</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('scannedData').style.display = 'block';
}

function displayRawData(data) {
    const dataContent = document.getElementById('dataContent');
    dataContent.innerHTML = `
        <div class="raw_data_card">
            <h4>Zeskanowane dane:</h4>
            <div class="raw_data_content">
                <pre>${data}</pre>
            </div>
        </div>
    `;
    
    document.getElementById('scannedData').style.display = 'block';
}

// Handle page visibility change to stop scanning when page is hidden
document.addEventListener('visibilitychange', function() {
    if (document.hidden && scanning) {
        stopScanning();
    }
});

// Clean up when page is unloaded
window.addEventListener('beforeunload', function() {
    stopScanning();
});

// Manual entry functions
function showManualEntry() {
    // Stop scanning if active
    if (scanning) {
        stopScanning();
    }
    
    // Hide other elements
    document.getElementById('scannedData').style.display = 'none';
    document.getElementById('notFoundMessage').style.display = 'none';
    
    // Show manual input as slide-up panel
    const panel = document.getElementById('manualInputContainer');
    panel.style.display = 'block';
    // next frame to allow transition
    requestAnimationFrame(() => panel.classList.add('open'));
    document.getElementById('manualCodeInput').focus();
}

function hideManualEntry() {
    const panel = document.getElementById('manualInputContainer');
    panel.classList.remove('open');
    // wait for transition to finish before hiding
    setTimeout(() => { panel.style.display = 'none'; }, 350);
    document.getElementById('manualCodeInput').value = '';
}

function submitManualCode() {
    const code = document.getElementById('manualCodeInput').value.trim();
    
    if (!code) {
        alert('Proszę wprowadzić kod');
        return;
    }
    
    // Simulacja błędu połączenia z serwerem
    hideManualEntry();
    setTimeout(() => {
        alert('Błąd połączenia z serwerem. Spróbuj ponownie później.');
    }, 250);
}

function showNotFoundMessage() {
    // Hide other elements
    document.getElementById('scannedData').style.display = 'none';
    document.getElementById('manualInputContainer').style.display = 'none';
    
    // Show not found message
    document.getElementById('notFoundMessage').style.display = 'block';
}