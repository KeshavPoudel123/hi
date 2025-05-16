/**
 * JPG to PNG Converter
 * A simple tool to convert JPG images to PNG format
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewContainer = document.getElementById('previewContainer');
    const originalImage = document.getElementById('originalImage');
    const convertedImage = document.getElementById('convertedImage');
    const originalInfo = document.getElementById('originalInfo');
    const convertedInfo = document.getElementById('convertedInfo');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Variables
    let jpgFile = null;
    let pngBlob = null;

    // Event Listeners
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });

    convertBtn.addEventListener('click', convertToPNG);
    downloadBtn.addEventListener('click', downloadPNG);

    /**
     * Handle file selection
     */
    function handleFileSelect() {
        const file = fileInput.files[0];

        if (!file) return;

        // Check if file is a JPG
        if (!file.type.match('image/jpeg')) {
            showNotification('Please select a JPG image.', 'error');
            return;
        }

        jpgFile = file;

        // Read file and display preview
        const reader = new FileReader();

        reader.onload = function(e) {
            // Create image to get dimensions
            const img = new Image();

            img.onload = function() {
                // Show preview
                originalImage.src = e.target.result;
                previewContainer.classList.remove('hidden');

                // Display file info
                originalInfo.textContent = `${file.name} (${formatFileSize(file.size)}, ${img.width}×${img.height}px)`;

                // Enable convert button
                convertBtn.disabled = false;

                // Hide converted image and download button
                convertedImage.src = '';
                convertedInfo.textContent = '';
                downloadBtn.classList.add('hidden');

                showNotification('JPG image loaded successfully!', 'success');
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    /**
     * Convert JPG to PNG
     */
    function convertToPNG() {
        if (!jpgFile) {
            showNotification('Please select a JPG image first.', 'error');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');

        // Create a slight delay to allow UI to update
        setTimeout(() => {
            try {
                // Create image element
                const img = new Image();

                img.onload = function() {
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw image on canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Convert to PNG
                    canvas.toBlob((blob) => {
                        // Store PNG blob
                        pngBlob = blob;

                        // Create object URL
                        const url = URL.createObjectURL(blob);

                        // Update preview
                        convertedImage.src = url;
                        convertedInfo.textContent = `Converted PNG (${formatFileSize(blob.size)}, ${img.width}×${img.height}px)`;

                        // Show download button
                        downloadBtn.classList.remove('hidden');

                        // Hide loading indicator
                        loadingIndicator.classList.add('hidden');

                        showNotification('Image converted to PNG successfully!', 'success');
                    }, 'image/png');
                };

                // Load image from file
                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                };
                reader.readAsDataURL(jpgFile);

            } catch (error) {
                loadingIndicator.classList.add('hidden');
                showNotification('Error converting image: ' + error.message, 'error');
            }
        }, 100);
    }

    /**
     * Download PNG file
     */
    function downloadPNG() {
        if (!pngBlob) {
            showNotification('Please convert the image first.', 'error');
            return;
        }

        // Create filename (replace .jpg with .png)
        const filename = jpgFile.name.replace(/\.[^/.]+$/, '') + '.png';

        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pngBlob);
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('PNG file downloaded successfully!', 'success');
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} - Formatted file size
     */
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / 1048576).toFixed(1) + ' MB';
        }
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');

        // Set message and type
        notification.textContent = message;
        notification.className = 'notification ' + type;

        // Show notification
        notification.classList.remove('hidden');

        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }
});
