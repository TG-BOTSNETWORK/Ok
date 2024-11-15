// Utility function to generate a unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Save file information in localStorage
function saveToLocalStorage(fileId, fileName, password, fileContent) {
    const existingFiles = JSON.parse(localStorage.getItem('fileStore')) || [];
    existingFiles.push({ fileId, fileName, password, fileContent });
    localStorage.setItem('fileStore', JSON.stringify(existingFiles));
}

// Handle form submission
document.getElementById('uploadForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('file');
    const passwordInput = document.getElementById('password');
    const resultDiv = document.getElementById('result');

    if (!fileInput.files.length) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Please select a file.</div>`;
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        const fileId = generateId();
        const fileContent = reader.result;
        const password = passwordInput.value || null;

        // Save file information
        saveToLocalStorage(fileId, file.name, password, fileContent);

        // Display success message with link
        const link = `${window.location.origin}/file/${fileId}`;
        resultDiv.innerHTML = `<div class="alert alert-success">
            File uploaded successfully! Access it <a href="${link}" target="_blank">here</a>.
        </div>`;
    };

    reader.readAsDataURL(file);
});

// Handle file access based on ID and password
const urlParams = new URLSearchParams(window.location.search);
const fileId = urlParams.get('fileId');

if (fileId) {
    const files = JSON.parse(localStorage.getItem('fileStore')) || [];
    const file = files.find((f) => f.fileId === fileId);

    const appDiv = document.querySelector('.container');

    if (file) {
        appDiv.innerHTML = `
            <div class="card shadow p-4">
                <form id="accessForm">
                    <h2>Access File: ${file.fileName}</h2>
                    <div class="mb-3">
                        <label for="passwordInput" class="form-label">Enter Password:</label>
                        <input type="password" id="passwordInput" class="form-control">
                    </div>
                    <button type="submit" class="btn btn-primary">Download</button>
                </form>
                <div id="error" class="mt-3"></div>
            </div>
        `;

        document.getElementById('accessForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('passwordInput').value;

            if (file.password && file.password !== passwordInput) {
                document.getElementById('error').innerHTML = `
                    <div class="alert alert-danger">Incorrect password. Try again.</div>
                `;
                return;
            }

            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = file.fileContent;
            downloadLink.download = file.fileName;
            downloadLink.click();
        });
    } else {
        appDiv.innerHTML = `<div class="alert alert-danger">File not found.</div>`;
    }
}
