// Application SAV Ici-store - Version corrigée avec navigation simplifiée

// Variables globales
let photos = [];
let signatureData = null;

// Données de l'entreprise
const entrepriseData = {
    nom: "SAC Sécurité",
    specialite: "Automatismes de Portail",
    adresse: "21 route de lyon, 84000 Avignon",
    telephone: "04 90 XX XX XX",
    email: "contact@sarl-sac.fr",
    site: "null",
    siret: "XXX XXX XXX 00001"
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application SAV démarrée');
    
    // Initialiser les onglets avec gestion robuste
    initializeTabs();
    
    // Initialiser la signature
    setTimeout(() => {
        initializeSignatureCanvas();
    }, 500);
    
    // Initialiser le formulaire
    initializeForm();
    
    // Définir la date/heure actuelle
    const now = new Date();
    const dateInput = document.getElementById('date-intervention');
    if (dateInput) {
        dateInput.value = now.toISOString().slice(0, 16);
    }
    
    // Afficher le premier onglet
    showTab('general');
    
    // Mettre à jour les stats
    updateStats();
    
    console.log('✅ Application initialisée');
});

// Système de navigation par onglets simplifié
function initializeTabs() {
    console.log('🔧 Initialisation des onglets');
    
    // Récupérer tous les boutons d'onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log(`Found ${tabButtons.length} tab buttons`);
    
    // Supprimer tous les anciens event listeners
    tabButtons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    
    // Récupérer les nouveaux boutons après clonage
    const newTabButtons = document.querySelectorAll('.tab-btn');
    
    // Ajouter les nouveaux event listeners
    newTabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.getAttribute('data-tab');
            console.log(`🔄 Changement vers onglet: ${tabName}`);
            
            if (tabName) {
                showTab(tabName);
            }
        });
    });
    
    console.log('✅ Onglets initialisés');
}

function showTab(tabName) {
    console.log(`📋 Affichage onglet: ${tabName}`);
    
    try {
        // 1. Masquer tous les contenus d'onglets
        const allTabContents = document.querySelectorAll('.tab-content');
        allTabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // 2. Désactiver tous les boutons
        const allTabButtons = document.querySelectorAll('.tab-btn');
        allTabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 3. Activer l'onglet cible
        const targetContent = document.getElementById(tabName);
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
            console.log(`✅ Contenu affiché pour: ${tabName}`);
        } else {
            console.error(`❌ Contenu non trouvé pour: ${tabName}`);
        }
        
        if (targetButton) {
            targetButton.classList.add('active');
            console.log(`✅ Bouton activé pour: ${tabName}`);
        } else {
            console.error(`❌ Bouton non trouvé pour: ${tabName}`);
        }
        
        // 4. Actions spéciales selon l'onglet
        if (tabName === 'signature') {
            setTimeout(() => {
                initializeSignatureCanvas();
            }, 100);
        }
        
        if (tabName === 'rapport') {
            updateStats();
        }
        
        console.log(`✅ Onglet ${tabName} activé avec succès`);
        
    } catch (error) {
        console.error(`❌ Erreur lors du changement d'onglet:`, error);
    }
}

// Gestion des photos
function addPhotos() {
    console.log('📸 Ajout de photos');
    
    const fileInput = document.getElementById('photo-input');
    const typeSelect = document.getElementById('type-photo');
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showMessage('Veuillez sélectionner au moins une photo.', 'warning');
        return;
    }
    
    const photoType = typeSelect ? typeSelect.value : 'Photo générale';
    const files = Array.from(fileInput.files);
    
    console.log(`Traitement de ${files.length} fichiers`);
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const photo = {
                    id: Date.now() + index,
                    data: e.target.result,
                    type: photoType,
                    timestamp: new Date(),
                    filename: file.name
                };
                
                photos.push(photo);
                displayPhoto(photo);
                updateStats();
                
                console.log(`✅ Photo ajoutée: ${file.name}`);
            };
            reader.readAsDataURL(file);
        } else {
            showMessage(`Le fichier "${file.name}" n'est pas une image.`, 'warning');
        }
    });
    
    // Réinitialiser les champs
    fileInput.value = '';
    if (typeSelect) typeSelect.value = '';
    
    showMessage(`${files.length} photo(s) en cours d'ajout...`, 'info');
}

function displayPhoto(photo) {
    const container = document.getElementById('photos-container');
    if (!container) {
        console.error('Container photos non trouvé');
        return;
    }
    
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.innerHTML = `
        <img src="${photo.data}" alt="${photo.type}" style="width: 100%; height: 150px; object-fit: cover;">
        <div class="photo-info">
            <div class="photo-type">${photo.type}</div>
            <div class="photo-timestamp">${formatDate(photo.timestamp)}</div>
        </div>
        <button type="button" class="photo-remove" onclick="removePhoto('${photo.id}')">&times;</button>
    `;
    
    container.appendChild(photoElement);
}

function removePhoto(photoId) {
    console.log(`🗑️ Suppression photo: ${photoId}`);
    
    // Supprimer de l'array
    photos = photos.filter(photo => photo.id != photoId);
    
    // Supprimer du DOM
    const photoElements = document.querySelectorAll('.photo-item');
    photoElements.forEach(element => {
        const removeBtn = element.querySelector('.photo-remove');
        if (removeBtn && removeBtn.getAttribute('onclick').includes(photoId)) {
            element.remove();
        }
    });
    
    updateStats();
    showMessage('Photo supprimée.', 'info');
}

// Gestion de la signature
function initializeSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) {
        console.log('⚠️ Canvas signature non trouvé');
        return;
    }
    
    console.log('🎨 Initialisation du canvas signature');
    
    const ctx = canvas.getContext('2d');
    
    // Configuration du canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    let isDrawing = false;
    
    // Fonction pour obtenir la position de la souris
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    
    // Fonction pour obtenir la position tactile
    function getTouchPos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.touches[0].clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.touches[0].clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    
    // Nettoyer les anciens event listeners
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    const refreshedCanvas = document.getElementById('signature-canvas');
    const refreshedCtx = refreshedCanvas.getContext('2d');
    
    // Reconfigurer le contexte
    refreshedCtx.strokeStyle = '#000000';
    refreshedCtx.lineWidth = 2;
    refreshedCtx.lineCap = 'round';
    refreshedCtx.lineJoin = 'round';
    
    // Événements souris
    refreshedCanvas.addEventListener('mousedown', function(e) {
        isDrawing = true;
        const pos = getMousePos(refreshedCanvas, e);
        refreshedCtx.beginPath();
        refreshedCtx.moveTo(pos.x, pos.y);
    });
    
    refreshedCanvas.addEventListener('mousemove', function(e) {
        if (!isDrawing) return;
        const pos = getMousePos(refreshedCanvas, e);
        refreshedCtx.lineTo(pos.x, pos.y);
        refreshedCtx.stroke();
    });
    
    refreshedCanvas.addEventListener('mouseup', function() {
        isDrawing = false;
    });
    
    refreshedCanvas.addEventListener('mouseout', function() {
        isDrawing = false;
    });
    
    // Événements tactiles
    refreshedCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getTouchPos(refreshedCanvas, e);
        refreshedCtx.beginPath();
        refreshedCtx.moveTo(pos.x, pos.y);
    });
    
    refreshedCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getTouchPos(refreshedCanvas, e);
        refreshedCtx.lineTo(pos.x, pos.y);
        refreshedCtx.stroke();
    });
    
    refreshedCanvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        isDrawing = false;
    });
    
    console.log('✅ Canvas signature configuré');
}

function clearSignature() {
    console.log('🧹 Effacement signature');
    
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
        
        const savedDiv = document.getElementById('signature-saved');
        if (savedDiv) {
            savedDiv.classList.remove('show');
        }
        
        updateStats();
        showMessage('Signature effacée.', 'info');
    }
}

function saveSignature() {
    console.log('💾 Sauvegarde signature');
    
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) {
        showMessage('Erreur: canvas de signature non trouvé.', 'error');
        return;
    }
    
    // Vérifier si le canvas contient une signature
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasSignature = imageData.data.some((pixel, index) => {
        return index % 4 === 3 && pixel !== 0;
    });
    
    if (!hasSignature) {
        showMessage('Veuillez dessiner une signature avant de l\'enregistrer.', 'warning');
        return;
    }
    
    signatureData = canvas.toDataURL('image/png');
    
    const savedDiv = document.getElementById('signature-saved');
    if (savedDiv) {
        savedDiv.innerHTML = `
            <div class="status status--success">
                ✓ Signature enregistrée le ${formatDate(new Date())}
            </div>
        `;
        savedDiv.classList.add('show');
    }
    
    updateStats();
    showMessage('Signature enregistrée avec succès!', 'success');
}

// Validation du formulaire
function initializeForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    if (!field) return false;
    
    const value = field.value.trim();
    const isValid = value !== '';
    
    field.classList.toggle('error', !isValid);
    field.classList.toggle('success', isValid);
    
    return isValid;
}

function validateAllFields() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            const label = field.closest('.form-group').querySelector('.form-label');
            if (label) {
                missingFields.push(label.textContent.replace(' *', ''));
            }
        }
    });
    
    if (!isValid) {
        showMessage(`Champs obligatoires manquants: ${missingFields.join(', ')}`, 'error');
    }
    
    return isValid;
}

// Mise à jour des statistiques
function updateStats() {
    const photosCount = document.getElementById('photos-count');
    const signatureStatus = document.getElementById('signature-status');
    
    if (photosCount) {
        photosCount.textContent = photos.length;
        photosCount.className = photos.length > 0 ? 'stat-value' : 'stat-value';
    }
    
    if (signatureStatus) {
        signatureStatus.textContent = signatureData ? 'Signée' : 'Non signée';
        signatureStatus.className = signatureData ? 'stat-value' : 'stat-value';
    }
}

// Génération du PDF professionnel
function generatePDF() {
    console.log('📄 Génération PDF');
    
    if (!validateAllFields()) {
        return;
    }
    
    if (photos.length === 0) {
        if (!confirm('Aucune photo n\'a été ajoutée. Voulez-vous continuer sans photos ?')) {
            return;
        }
    }
    
    if (!signatureData) {
        if (!confirm('Aucune signature n\'a été enregistrée. Voulez-vous continuer sans signature ?')) {
            return;
        }
    }
    
    try {
        showMessage('Génération du PDF en cours...', 'info');
        
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('Bibliothèque jsPDF non chargée');
        }
        
        const doc = new jsPDF('p', 'mm', 'a4');
        createPDFContent(doc);
        
        const numeroIntervention = getFieldValue('numero-intervention') || '001';
        const filename = `SAV_PORTAIL_${formatDateForFilename(new Date())}_${numeroIntervention}.pdf`;
        
        doc.save(filename);
        showMessage('Rapport PDF généré avec succès!', 'success');
        
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        showMessage(`Erreur lors de la génération du PDF: ${error.message}`, 'error');
    }
}

function createPDFContent(doc) {
    // Page de garde
    createCoverPage(doc);
    
    // Nouvelle page pour le contenu
    doc.addPage();
    let currentY = 30;
    
    // En-tête
    addPageHeader(doc, 20);
    
    // Sections
    currentY = addInformationsGenerales(doc, currentY);
    currentY = addEquipementSection(doc, currentY + 10);
    
    // Nouvelle page pour intervention
    doc.addPage();
    addPageHeader(doc, 20);
    currentY = addInterventionSection(doc, 30);
    
    // Photos et signature si nécessaires
    if (photos.length > 0 || signatureData) {
        doc.addPage();
        addPageHeader(doc, 20);
        currentY = 30;
        
        if (photos.length > 0) {
            currentY = addPhotosSection(doc, currentY);
        }
        
        addSignatureSection(doc, currentY + 20);
    }
    
    // Pieds de page
    addPageFooters(doc);
}

function createCoverPage(doc) {
    // Logo/Titre
    doc.setFontSize(32);
    doc.setTextColor(33, 128, 141);
    doc.setFont('helvetica', 'bold');
    doc.text('Ici-store', 105, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(98, 108, 113);
    doc.setFont('helvetica', 'normal');
    doc.text('Automatismes de Portail', 105, 62, { align: 'center' });
    
    // Titre du rapport
    doc.setFontSize(24);
    doc.setTextColor(19, 52, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT D\'INTERVENTION SAV', 105, 90, { align: 'center' });
    
    // Ligne décorative
    doc.setDrawColor(33, 128, 141);
    doc.setLineWidth(2);
    doc.line(40, 100, 170, 100);
    
    // Informations principales
    doc.setFontSize(14);
    doc.setTextColor(19, 52, 59);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Numéro: ${getFieldValue('numero-intervention')}`, 105, 120, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date(getFieldValue('date-intervention')))}`, 105, 135, { align: 'center' });
    doc.text(`Technicien: ${getFieldValue('technicien')}`, 105, 150, { align: 'center' });
    doc.text(`Client: ${getFieldValue('client-nom')}`, 105, 165, { align: 'center' });
    
    // Coordonnées
    doc.setFontSize(10);
    doc.setTextColor(98, 108, 113);
    doc.text(entrepriseData.adresse, 105, 250, { align: 'center' });
    doc.text(`${entrepriseData.telephone} - ${entrepriseData.email}`, 105, 260, { align: 'center' });
}

function addPageHeader(doc, y) {
    doc.setFontSize(12);
    doc.setTextColor(33, 128, 141);
    doc.setFont('helvetica', 'bold');
    doc.text('Ici-store', 20, y);
    
    doc.setFontSize(8);
    doc.setTextColor(98, 108, 113);
    doc.setFont('helvetica', 'normal');
    doc.text(`${entrepriseData.telephone} - ${entrepriseData.email}`, 190, y, { align: 'right' });
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
}

function addInformationsGenerales(doc, startY) {
    let currentY = addSectionTitle(doc, 'INFORMATIONS GÉNÉRALES', startY);
    
    const tableData = [
        ['Client', getFieldValue('client-nom')],
        ['Adresse', getFieldValue('client-adresse')],
        ['Contact', getFieldValue('client-contact')],
        ['Date intervention', formatDate(new Date(getFieldValue('date-intervention')))],
        ['Technicien', getFieldValue('technicien')],
        ['N° intervention', getFieldValue('numero-intervention')]
    ];
    
    doc.autoTable({
        startY: currentY,
        head: [['Information', 'Valeur']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [33, 128, 141],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { fontSize: 10, cellPadding: 3 }
    });
    
    return doc.lastAutoTable.finalY + 15;
}

function addEquipementSection(doc, startY) {
    let currentY = addSectionTitle(doc, 'ÉQUIPEMENT CONCERNÉ', startY);
    
    const tableData = [
        ['Type de portail', getFieldValue('type-portail')],
        ['Matériau', getFieldValue('materiau')],
        ['Marque motorisation', getFieldValue('marque-motorisation')],
        ['Modèle', getFieldValue('modele')],
        ['Année installation', getFieldValue('annee')]
    ];
    
    doc.autoTable({
        startY: currentY,
        head: [['Caractéristique', 'Valeur']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: [33, 128, 141],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { fontSize: 10, cellPadding: 3 }
    });
    
    return doc.lastAutoTable.finalY + 15;
}

function addInterventionSection(doc, startY) {
    let currentY = addSectionTitle(doc, 'INTERVENTION RÉALISÉE', startY);
    
    const interventionData = [
        ['Type d\'intervention', getFieldValue('type-intervention')],
        ['Problème', getFieldValue('probleme')],
        ['Actions effectuées', getFieldValue('actions')],
        ['Pièces remplacées', getFieldValue('pieces-remplacees')],
        ['Temps passé (min)', getFieldValue('temps-passe')],
        ['Recommandations', getFieldValue('recommandations')]
    ].filter(row => row[1]); // Filtrer les valeurs vides
    
    doc.autoTable({
        startY: currentY,
        head: [['Élément', 'Description']],
        body: interventionData,
        theme: 'striped',
        headStyles: {
            fillColor: [33, 128, 141],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 120 }
        }
    });
    
    return doc.lastAutoTable.finalY + 15;
}

function addPhotosSection(doc, startY) {
    let currentY = addSectionTitle(doc, 'DOCUMENTATION PHOTOGRAPHIQUE', startY);
    
    if (photos.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Aucune photo ajoutée.', 20, currentY);
        return currentY + 20;
    }
    
    photos.forEach((photo, index) => {
        if (currentY > 200) {
            doc.addPage();
            addPageHeader(doc, 20);
            currentY = 30;
        }
        
        try {
            doc.addImage(photo.data, 'JPEG', 20, currentY, 80, 60);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`Photo ${index + 1} - ${photo.type}`, 110, currentY + 10);
            doc.setFont('helvetica', 'normal');
            doc.text(`${formatDate(photo.timestamp)}`, 110, currentY + 20);
            
            currentY += 70;
        } catch (error) {
            console.warn('Erreur ajout photo:', error);
        }
    });
    
    return currentY;
}

function addSignatureSection(doc, startY) {
    let currentY = addSectionTitle(doc, 'VALIDATION ET SIGNATURE', startY);
    
    doc.setDrawColor(33, 128, 141);
    doc.setLineWidth(1);
    doc.rect(20, currentY, 170, 40);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Signature du client:', 25, currentY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Le client certifie avoir reçu l\'intervention.', 25, currentY + 20);
    
    if (signatureData) {
        try {
            doc.addImage(signatureData, 'PNG', 130, currentY + 5, 50, 25);
        } catch (error) {
            console.warn('Erreur ajout signature:', error);
        }
    }
    
    doc.text(`Date: ${formatDate(new Date())}`, 25, currentY + 35);
    
    return currentY + 50;
}

function addSectionTitle(doc, title, y) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 128, 141);
    doc.text(title, 20, y);
    
    doc.setDrawColor(33, 128, 141);
    doc.setLineWidth(0.8);
    doc.line(20, y + 3, 190, y + 3);
    
    return y + 15;
}

function addPageFooters(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setFontSize(8);
        doc.setTextColor(98, 108, 113);
        doc.setFont('helvetica', 'normal');
        
        doc.text(`Page ${i}/${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`${entrepriseData.nom} - SIRET: ${entrepriseData.siret}`, 20, 292);
        doc.text('Document confidentiel', 190, 292, { align: 'right' });
    }
}

// Aperçu PDF
function previewPDF() {
    if (!validateAllFields()) return;
    
    try {
        showMessage('Génération de l\'aperçu...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        createPDFContent(doc);
        
        const pdfDataUri = doc.output('datauristring');
        const previewContainer = document.getElementById('pdf-preview-container');
        previewContainer.innerHTML = `
            <embed src="${pdfDataUri}" type="application/pdf" width="100%" height="500px">
        `;
        
        document.getElementById('pdf-preview-modal').classList.remove('hidden');
        showMessage('Aperçu généré!', 'success');
    } catch (error) {
        console.error('Erreur aperçu:', error);
        showMessage('Erreur lors de l\'aperçu.', 'error');
    }
}

function closePDFPreview() {
    document.getElementById('pdf-preview-modal').classList.add('hidden');
}

function downloadFromPreview() {
    closePDFPreview();
    generatePDF();
}

// Utilitaires
function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : '';
}

function formatDate(date) {
    if (!date || isNaN(new Date(date).getTime())) return '';
    
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForFilename(date) {
    return new Date(date).toISOString().slice(0, 10).replace(/-/g, '');
}

function showMessage(message, type = 'info') {
    // Supprimer anciens messages
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message--${type}`;
    messageDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(messageDiv, mainContent.firstChild);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}