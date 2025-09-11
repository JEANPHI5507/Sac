// Application data
const appData = {
  marques_motorisation: [
    "Somfy", "Dooya", "FAAC", "BFT", "NICE", "CAME", "CARDIN", "FADINI", "ROGER", "V2", "DITEC"
  ],
  types_portail: [
    "Portail battant",
    "Portail coulissant", 
    "Portail basculant",
    "Barrière levante"
  ],
  materiaux: [
    "Aluminium",
    "PVC", 
    "Fer",
    "Bois",
    "Acier"
  ],
  types_intervention: [
    "Dépannage urgence",
    "Maintenance préventive",
    "Installation",
    "Réglage/Paramétrage",
    "Remplacement pièce",
    "Mise aux normes"
  ]
};

// Application state
let currentSection = 1;
const totalSections = 6;
let signaturePad = null;
let isDrawing = false;
let visitedSections = new Set([1]);

// Photo management
const photos = {
  equipment: [],
  before: [],
  during: [],
  after: []
};

let currentPhotoSection = null;
let cameraStream = null;
let currentCamera = 'environment';
let availableCameras = [];

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Starting initialization');
  initializeApp();
});

function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // Generate intervention number
    generateInterventionNumber();
    
    // Set current date and time
    setCurrentDateTime();
    
    // Populate select options
    populateSelectOptions();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Setup signature pad
    setupSignaturePad();
    
    // Setup photo system
    setupPhotoSystem();
    
    // Set signature date
    updateSignatureDate();
    
    // Initialize view
    showSection(currentSection);
    updateProgressBar();
    updateNavigationButtons();
    updatePhotoCounters();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error during initialization:', error);
  }
}

function generateInterventionNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const interventionNumber = `SAV-${year}${month}${day}-${hours}${minutes}`;
  const field = document.getElementById('numero-intervention');
  if (field) {
    field.value = interventionNumber;
    console.log('Intervention number generated:', interventionNumber);
  }
}

function setCurrentDateTime() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = now.toTimeString().slice(0, 5);
  
  const dateField = document.getElementById('date-intervention');
  const timeField = document.getElementById('heure-intervention');
  const startTimeField = document.getElementById('heure-debut');
  
  if (dateField) dateField.value = today;
  if (timeField) timeField.value = currentTime;
  if (startTimeField) startTimeField.value = currentTime;
  
  console.log('Date and time set');
}

function populateSelectOptions() {
  console.log('Populating select options...');
  
  try {
    // Types de portail
    const typePortailSelect = document.getElementById('type-portail');
    if (typePortailSelect) {
      appData.types_portail.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typePortailSelect.appendChild(option);
      });
    }

    // Matériaux
    const materiauSelect = document.getElementById('materiau');
    if (materiauSelect) {
      appData.materiaux.forEach(materiau => {
        const option = document.createElement('option');
        option.value = materiau;
        option.textContent = materiau;
        materiauSelect.appendChild(option);
      });
    }

    // Marques de motorisation
    const marqueSelect = document.getElementById('marque-motorisation');
    if (marqueSelect) {
      appData.marques_motorisation.forEach(marque => {
        const option = document.createElement('option');
        option.value = marque;
        option.textContent = marque;
        marqueSelect.appendChild(option);
      });
    }

    // Types d'intervention
    const typeInterventionSelect = document.getElementById('type-intervention');
    if (typeInterventionSelect) {
      appData.types_intervention.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeInterventionSelect.appendChild(option);
      });
    }
    
    console.log('Select options populated successfully');
  } catch (error) {
    console.error('Error populating select options:', error);
  }
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  try {
    // Navigation buttons
    setupNavigationButtons();
    
    // Progress bar navigation
    setupProgressBarNavigation();
    
    // Modal buttons
    setupModalButtons();
    
    // Auto-fill helpers
    setupAutoFillHelpers();
    
    // Signature pad
    setupSignatureEvents();
    
    console.log('Event listeners setup complete');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
  }
}

function setupNavigationButtons() {
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const generateBtn = document.getElementById('generate-report');
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Next button clicked, current section:', currentSection);
      nextSection();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Previous button clicked, current section:', currentSection);
      prevSection();
    });
  }
  
  if (generateBtn) {
    generateBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Generate report button clicked');
      generateReport();
    });
  }
}

function setupProgressBarNavigation() {
  const progressSteps = document.querySelectorAll('.progress-step');
  console.log('Found progress steps:', progressSteps.length);
  
  progressSteps.forEach((step, index) => {
    const targetSection = index + 1;
    
    // Remove any existing listeners
    step.replaceWith(step.cloneNode(true));
    const newStep = document.querySelectorAll('.progress-step')[index];
    
    newStep.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Progress step clicked, navigating to section:', targetSection);
      
      // Direct navigation - allow jumping to any section
      currentSection = targetSection;
      visitedSections.add(targetSection);
      showSection(currentSection);
      updateProgressBar();
      updateNavigationButtons();
    });
    
    // Make it clearly clickable
    newStep.style.cursor = 'pointer';
    newStep.style.userSelect = 'none';
  });
}

function setupModalButtons() {
  const printBtn = document.getElementById('print-report');
  const emailBtn = document.getElementById('email-report');
  const newBtn = document.getElementById('new-intervention');
  
  if (printBtn) printBtn.addEventListener('click', printReport);
  if (emailBtn) emailBtn.addEventListener('click', emailReport);
  if (newBtn) newBtn.addEventListener('click', newIntervention);
}

function setupSignatureEvents() {
  const clearSigBtn = document.getElementById('clear-signature');
  if (clearSigBtn) {
    clearSigBtn.addEventListener('click', function(e) {
      e.preventDefault();
      clearSignature();
    });
  }
}

function setupPhotoSystem() {
  console.log('Setting up photo system...');
  
  try {
    // Setup photo buttons with event delegation
    document.body.addEventListener('click', function(e) {
      // Check if clicked element is a photo button or child of photo button
      const photoBtn = e.target.closest('.photo-btn');
      if (photoBtn) {
        e.preventDefault();
        e.stopPropagation();
        const section = photoBtn.getAttribute('data-section');
        console.log('Photo button clicked for section:', section);
        openCamera(section);
      }
    });

    // Camera modal controls
    setupCameraControls();
    
    // File input fallback
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', handleFileInput);
    }

    // Detect available cameras
    detectCameras();
    
    console.log('Photo system setup complete');
  } catch (error) {
    console.error('Error setting up photo system:', error);
  }
}

function setupCameraControls() {
  const closeCameraBtn = document.getElementById('close-camera');
  const switchCameraBtn = document.getElementById('switch-camera');
  const captureBtn = document.getElementById('capture-photo');
  const retakeBtn = document.getElementById('retake-photo');
  const saveBtn = document.getElementById('save-photo');
  const cancelBtn = document.getElementById('cancel-photo');

  if (closeCameraBtn) {
    closeCameraBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeCameraModal();
    });
  }
  
  if (switchCameraBtn) {
    switchCameraBtn.addEventListener('click', function(e) {
      e.preventDefault();
      switchCamera();
    });
  }
  
  if (captureBtn) {
    captureBtn.addEventListener('click', function(e) {
      e.preventDefault();
      capturePhoto();
    });
  }
  
  if (retakeBtn) {
    retakeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      retakePhoto();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      savePhoto();
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', function(e) {
      e.preventDefault();
      closeCameraModal();
    });
  }
}

async function detectCameras() {
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      availableCameras = devices.filter(device => device.kind === 'videoinput');
      
      const switchBtn = document.getElementById('switch-camera');
      if (switchBtn) {
        switchBtn.style.display = availableCameras.length > 1 ? 'block' : 'none';
      }
    }
  } catch (error) {
    console.log('Could not enumerate devices:', error);
  }
}

function nextSection() {
  console.log('Moving to next section from:', currentSection);
  
  if (currentSection < totalSections) {
    currentSection++;
    visitedSections.add(currentSection);
    showSection(currentSection);
    updateProgressBar();
    updateNavigationButtons();
  }
}

function prevSection() {
  console.log('Moving to previous section from:', currentSection);
  
  if (currentSection > 1) {
    currentSection--;
    showSection(currentSection);
    updateProgressBar();
    updateNavigationButtons();
  }
}

function showSection(sectionNumber) {
  console.log('Showing section:', sectionNumber);
  
  try {
    // Hide all sections first
    const allSections = document.querySelectorAll('.form-section');
    allSections.forEach((section, index) => {
      section.classList.remove('active');
      section.style.display = 'none';
      console.log('Hiding section:', index + 1);
    });
    
    // Show the target section
    const targetSection = document.querySelector(`[data-section="${sectionNumber}"]`);
    if (targetSection) {
      targetSection.classList.add('active');
      targetSection.style.display = 'block';
      console.log('Section', sectionNumber, 'is now visible and active');
      
      // Scroll to top of the section
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('Target section not found:', sectionNumber);
    }
  } catch (error) {
    console.error('Error showing section:', error);
  }
}

function updateProgressBar() {
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove('active', 'completed');
    
    if (visitedSections.has(stepNumber) && stepNumber < currentSection) {
      step.classList.add('completed');
    } else if (stepNumber === currentSection) {
      step.classList.add('active');
    }
  });
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const generateBtn = document.getElementById('generate-report');

  if (prevBtn) {
    prevBtn.style.display = currentSection > 1 ? 'block' : 'none';
  }
  
  if (currentSection < totalSections) {
    if (nextBtn) nextBtn.style.display = 'block';
    if (generateBtn) generateBtn.style.display = 'none';
  } else {
    if (nextBtn) nextBtn.style.display = 'none';
    if (generateBtn) generateBtn.style.display = 'block';
  }
}

// Photo functionality
async function openCamera(section) {
  console.log('Opening camera for section:', section);
  currentPhotoSection = section;
  const modal = document.getElementById('camera-modal');
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log('Camera not available, using file input');
    showFileInput();
    return;
  }

  try {
    if (modal) {
      modal.classList.remove('hidden');
      await startCamera();
    }
  } catch (error) {
    console.error('Camera error:', error);
    if (modal) modal.classList.add('hidden');
    showFileInput();
  }
}

async function startCamera() {
  const video = document.getElementById('camera-video');
  const switchBtn = document.getElementById('switch-camera');
  
  try {
    // Stop existing stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: currentCamera,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };

    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (video) {
      video.srcObject = cameraStream;
    }
    
    if (switchBtn) {
      switchBtn.style.display = availableCameras.length > 1 ? 'block' : 'none';
    }
    
  } catch (error) {
    console.error('Error starting camera:', error);
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (video) video.srcObject = cameraStream;
      if (switchBtn) switchBtn.style.display = 'none';
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
}

async function switchCamera() {
  currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
  await startCamera();
}

function capturePhoto() {
  console.log('Capturing photo...');
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const preview = document.getElementById('photo-preview');
  const previewImg = document.getElementById('preview-image');
  const captureBtn = document.getElementById('capture-photo');
  const retakeBtn = document.getElementById('retake-photo');
  const captionDiv = document.querySelector('.photo-caption');
  
  if (!video || !canvas || !preview || !previewImg) {
    console.error('Camera elements not found');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to video dimensions
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  
  // Draw video frame to canvas
  ctx.drawImage(video, 0, 0);
  
  // Convert to compressed JPEG
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  
  // Show preview
  previewImg.src = dataUrl;
  video.style.display = 'none';
  preview.classList.remove('hidden');
  
  if (captureBtn) captureBtn.style.display = 'none';
  if (retakeBtn) retakeBtn.classList.remove('hidden');
  if (captionDiv) captionDiv.classList.remove('hidden');
  
  const saveBtn = document.getElementById('save-photo');
  if (saveBtn) saveBtn.classList.remove('hidden');
  
  console.log('Photo captured successfully');
}

function retakePhoto() {
  console.log('Retaking photo...');
  const video = document.getElementById('camera-video');
  const preview = document.getElementById('photo-preview');
  const captureBtn = document.getElementById('capture-photo');
  const retakeBtn = document.getElementById('retake-photo');
  const captionDiv = document.querySelector('.photo-caption');
  
  if (video) video.style.display = 'block';
  if (preview) preview.classList.add('hidden');
  if (captureBtn) captureBtn.style.display = 'block';
  if (retakeBtn) retakeBtn.classList.add('hidden');
  if (captionDiv) captionDiv.classList.add('hidden');
  
  const saveBtn = document.getElementById('save-photo');
  if (saveBtn) saveBtn.classList.add('hidden');
  
  const captionInput = document.getElementById('photo-caption-input');
  if (captionInput) captionInput.value = '';
}

function savePhoto() {
  console.log('Saving photo...');
  const previewImg = document.getElementById('preview-image');
  const captionInput = document.getElementById('photo-caption-input');
  
  if (!previewImg || !previewImg.src || !currentPhotoSection) {
    console.error('Cannot save photo - missing data');
    return;
  }
  
  const caption = captionInput ? captionInput.value.trim() : '';
  
  const photo = {
    id: Date.now(),
    dataUrl: previewImg.src,
    caption: caption || getSectionDefaultCaption(currentPhotoSection),
    timestamp: new Date().toISOString(),
    section: currentPhotoSection
  };
  
  photos[currentPhotoSection].push(photo);
  
  updatePhotoGallery(currentPhotoSection);
  updatePhotoCounters();
  
  closeCameraModal();
  
  showSuccess('Photo ajoutée avec succès !');
  console.log('Photo saved successfully for section:', currentPhotoSection);
}

function getSectionDefaultCaption(section) {
  const captions = {
    equipment: 'Photo de l\'équipement',
    before: 'État avant intervention',
    during: 'Intervention en cours',
    after: 'État après intervention'
  };
  return captions[section] || 'Photo de l\'intervention';
}

function handleFileInput(e) {
  const file = e.target.files[0];
  if (!file || !currentPhotoSection) return;
  
  console.log('Processing file input for section:', currentPhotoSection);
  
  const reader = new FileReader();
  reader.onload = function(event) {
    compressImage(event.target.result, (compressedDataUrl) => {
      const photo = {
        id: Date.now(),
        dataUrl: compressedDataUrl,
        caption: getSectionDefaultCaption(currentPhotoSection),
        timestamp: new Date().toISOString(),
        section: currentPhotoSection
      };
      
      photos[currentPhotoSection].push(photo);
      updatePhotoGallery(currentPhotoSection);
      updatePhotoCounters();
      showSuccess('Photo ajoutée avec succès !');
    });
  };
  reader.readAsDataURL(file);
  
  e.target.value = '';
}

function compressImage(dataUrl, callback) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let { width, height } = this;
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(this, 0, 0, width, height);
    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    callback(compressedDataUrl);
  };
  img.src = dataUrl;
}

function showFileInput() {
  if (!currentPhotoSection) return;
  
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment';
    fileInput.click();
  }
}

function updatePhotoGallery(section) {
  const gallery = document.getElementById(`${section}-gallery`);
  if (!gallery) return;
  
  gallery.innerHTML = '';
  
  if (photos[section].length === 0) {
    gallery.innerHTML = '<div class="photos-empty">Aucune photo ajoutée</div>';
    return;
  }
  
  photos[section].forEach(photo => {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'photo-item';
    photoDiv.innerHTML = `
      <img src="${photo.dataUrl}" alt="${photo.caption}" loading="lazy">
      <div class="photo-actions">
        <button type="button" class="photo-action-btn view" onclick="viewPhoto(${photo.id})" title="Voir en grand">👁</button>
        <button type="button" class="photo-action-btn delete" onclick="deletePhoto('${section}', ${photo.id})" title="Supprimer">🗑</button>
      </div>
      <div class="photo-caption">${photo.caption}</div>
      <div class="photo-timestamp">${formatTimestamp(photo.timestamp)}</div>
    `;
    gallery.appendChild(photoDiv);
  });
}

function updatePhotoCounters() {
  Object.keys(photos).forEach(section => {
    const count = photos[section].length;
    const gallery = document.getElementById(`${section}-gallery`);
    if (gallery && gallery.parentElement) {
      const h4 = gallery.parentElement.querySelector('h4');
      if (h4) {
        const existingCounter = h4.querySelector('.photo-counter');
        if (existingCounter) existingCounter.remove();
        
        if (count > 0) {
          const counter = document.createElement('span');
          counter.className = 'photo-counter';
          counter.textContent = count;
          h4.appendChild(counter);
        }
      }
    }
  });
}

// Global functions for photo actions
window.viewPhoto = function(photoId) {
  let photo = null;
  for (const section of Object.keys(photos)) {
    photo = photos[section].find(p => p.id === photoId);
    if (photo) break;
  }
  
  if (!photo) return;
  
  const modal = document.createElement('div');
  modal.className = 'modal photo-viewer-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="photo-viewer">
        <img src="${photo.dataUrl}" alt="${photo.caption}">
        <div class="photo-viewer-controls">
          <div class="photo-viewer-info">
            <div>${photo.caption}</div>
            <div>${formatTimestamp(photo.timestamp)}</div>
          </div>
          <button type="button" class="btn btn--primary" onclick="this.closest('.modal').remove()">Fermer</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
};

window.deletePhoto = function(section, photoId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;
  
  const index = photos[section].findIndex(p => p.id === photoId);
  if (index !== -1) {
    photos[section].splice(index, 1);
    updatePhotoGallery(section);
    updatePhotoCounters();
    showSuccess('Photo supprimée');
  }
};

function closeCameraModal() {
  const modal = document.getElementById('camera-modal');
  
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  
  // Reset modal state
  const video = document.getElementById('camera-video');
  const preview = document.getElementById('photo-preview');
  const captureBtn = document.getElementById('capture-photo');
  const retakeBtn = document.getElementById('retake-photo');
  const saveBtn = document.getElementById('save-photo');
  const captionDiv = document.querySelector('.photo-caption');
  const captionInput = document.getElementById('photo-caption-input');
  
  if (video) video.style.display = 'block';
  if (preview) preview.classList.add('hidden');
  if (captureBtn) captureBtn.style.display = 'block';
  if (retakeBtn) retakeBtn.classList.add('hidden');
  if (saveBtn) saveBtn.classList.add('hidden');
  if (captionDiv) captionDiv.classList.add('hidden');
  if (captionInput) captionInput.value = '';
  
  if (modal) modal.classList.add('hidden');
  currentPhotoSection = null;
  
  console.log('Camera modal closed');
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Auto-fill helpers
function setupAutoFillHelpers() {
  const nomClientField = document.getElementById('nom-client');
  const contactNomField = document.getElementById('contact-nom');
  
  if (nomClientField && contactNomField) {
    nomClientField.addEventListener('input', function() {
      if (!contactNomField.value) {
        contactNomField.value = this.value;
      }
    });
  }

  const heureDebutField = document.getElementById('heure-debut');
  const heureFinField = document.getElementById('heure-fin');
  
  if (heureDebutField && heureFinField) {
    heureDebutField.addEventListener('change', function() {
      if (!heureFinField.value) {
        const startTime = new Date(`2000-01-01T${this.value}`);
        startTime.setHours(startTime.getHours() + 2);
        heureFinField.value = startTime.toTimeString().slice(0, 5);
      }
    });
  }

  const dateInterventionField = document.getElementById('date-intervention');
  const prochaineMaintenanceField = document.getElementById('prochaine-maintenance');
  
  if (dateInterventionField && prochaineMaintenanceField) {
    dateInterventionField.addEventListener('change', function() {
      const interventionDate = new Date(this.value);
      interventionDate.setMonth(interventionDate.getMonth() + 6);
      prochaineMaintenanceField.value = interventionDate.toISOString().split('T')[0];
    });
  }
}

// Signature pad
function setupSignaturePad() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  canvas.width = 400;
  canvas.height = 200;
  
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  canvas.addEventListener('touchstart', handleTouch);
  canvas.addEventListener('touchmove', handleTouch);
  canvas.addEventListener('touchend', stopDrawing);

  function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
    updateSignatureDate();
  }

  function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  }

  function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  signaturePad = { canvas, ctx };
}

function clearSignature() {
  if (signaturePad) {
    const ctx = signaturePad.ctx;
    ctx.clearRect(0, 0, signaturePad.canvas.width, signaturePad.canvas.height);
    updateSignatureDate();
  }
}

function updateSignatureDate() {
  const dateSignatureField = document.getElementById('date-signature');
  if (dateSignatureField) {
    const now = new Date();
    const isoString = now.toISOString().slice(0, 16);
    dateSignatureField.value = isoString;
  }
}

function generateReport() {
  console.log('Generating report...');
  
  const btn = document.getElementById('generate-report');
  if (btn) {
    btn.classList.add('loading');
    btn.disabled = true;
  }
  
  setTimeout(() => {
    if (btn) {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
    
    const totalPhotos = Object.values(photos).reduce((sum, sectionPhotos) => sum + sectionPhotos.length, 0);
    const photoCountSpan = document.getElementById('photo-count');
    if (photoCountSpan) {
      photoCountSpan.textContent = totalPhotos;
    }
    
    const modal = document.getElementById('report-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
    
    console.log('Report generated with', totalPhotos, 'photos');
  }, 1000);
}

function printReport() {
  window.print();
  closeModal();
}

function emailReport() {
  const clientEmailField = document.getElementById('email-client');
  const clientNameField = document.getElementById('nom-client');
  const interventionNumberField = document.getElementById('numero-intervention');
  
  const clientEmail = clientEmailField ? clientEmailField.value : '';
  const clientName = clientNameField ? clientNameField.value : '';
  const interventionNumber = interventionNumberField ? interventionNumberField.value : '';
  
  if (clientEmail) {
    const totalPhotos = Object.values(photos).reduce((sum, sectionPhotos) => sum + sectionPhotos.length, 0);
    const subject = `Rapport d'intervention SAV - ${interventionNumber}`;
    const body = `Bonjour ${clientName},\n\nVeuillez trouver ci-joint le rapport de notre intervention SAV avec ${totalPhotos} photo(s) documentaire(s).\n\nCordialement,\nÉquipe SAV Ici-store`;
    
    const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  } else {
    showError('Aucun email client renseigné.');
  }
  
  closeModal();
}

function newIntervention() {
  if (confirm('Êtes-vous sûr de vouloir créer une nouvelle intervention ? Toutes les données actuelles seront perdues.')) {
    location.reload();
  }
}

function closeModal() {
  const modal = document.getElementById('report-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function showError(message) {
  alert(message);
}

function showSuccess(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-success);
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Event listeners for modal closing
document.addEventListener('click', function(e) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (e.target === modal) {
      if (modal.id === 'camera-modal') {
        closeCameraModal();
      } else if (modal.id === 'report-modal') {
        closeModal();
      } else if (modal.classList.contains('photo-viewer-modal')) {
        modal.remove();
      }
    }
  });
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const cameraModal = document.getElementById('camera-modal');
    const reportModal = document.getElementById('report-modal');
    
    if (cameraModal && !cameraModal.classList.contains('hidden')) {
      closeCameraModal();
    } else if (reportModal && !reportModal.classList.contains('hidden')) {
      closeModal();
    }
    
    document.querySelectorAll('.photo-viewer-modal').forEach(modal => {
      modal.remove();
    });
  }
});