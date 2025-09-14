// Application SAV SAC Sécurité - Version Avancée avec Mémoire Complète - CORRIGÉE

// ================================
// VARIABLES GLOBALES ET DONNÉES
// ================================

// Données de l'entreprise
const entrepriseData = {
    nom: "SAC Sécurité",
    specialite: "Automatismes de Portail",
    adresse: "123 Avenue des Automatismes, 84200 Carpentras",
    telephone: "04 90 XX XX XX",
    email: "contact@xxxxxxxx.fr",
    site: "www.sac.fr",
    siret: "XXX XXX XXX 00001"
};

// Données pour l'auto-complétion
const dataAutocomplete = {
    marques_motorisation: ["Somfy", "Dooya", "FAAC", "BFT", "NICE", "CAME", "CARDIN", "FADINI", "ROGER", "V2", "DITEC"],
    types_portail: ["Portail battant", "Portail coulissant", "Portail basculant", "Barrière levante"],
    materiaux: ["Aluminium", "PVC", "Fer", "Bois", "Acier"],
    types_intervention: ["Dépannage urgence", "Maintenance préventive", "Installation", "Réglage/Paramétrage", "Remplacement pièce", "Mise aux normes"],
    pannes_courantes: ["Portail ne s'ouvre plus", "Portail ne se ferme plus", "Télécommande ne fonctionne plus", "Moteur fait du bruit", "Portail s'ouvre partiellement", "Cellules photoélectriques défectueuses", "Fin de course déréglée", "Batterie de secours HS"],
    pieces_courantes: ["Télécommande", "Cellules photoélectriques", "Moteur", "Armoire de commande", "Fusible", "Batterie de secours", "Antenne récepteur", "Fin de course", "Courroie", "Pignon/Crémaillère"],
    solutions_types: ["Remplacement fusible grillé", "Réglage fin de course", "Programmation nouvelle télécommande", "Nettoyage cellules photoélectriques", "Réglage force moteur", "Remplacement batterie secours", "Lubrification mécanisme", "Resserrage fixations"]
};

// Variables d'état de l'application
let currentIntervention = null;
let interventionsDB = [];
let photos = [];
let signatureData = null;
let autoSaveTimer = null;
let autoSaveInterval = 30000; // 30 secondes
let autoSaveEnabled = true;
let lastSaveTime = null;
let historique = {
    techniciens: new Set(),
    clients: new Set(),
    modeles: new Set()
};

// Paramètres utilisateur
let userPreferences = {
    autoSaveEnabled: true,
    autoSaveInterval: 30,
    notificationsEnabled: true,
    defaultTechnicien: ""
};

// Variables de navigation
let currentTab = 'dashboard';
let currentSubTab = 'general';

// ================================
// INITIALISATION DE L'APPLICATION
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application SAV Avancée démarrée');
    
    // Charger les données simulées
    loadSimulatedData();
    
    // Initialiser l'interface
    initializeTabs();
    initializeSubTabs();
    initializeAutoComplete();
    initializeAutoSave();
    
    // Afficher le tableau de bord par défaut
    showTab('dashboard');
    
    // Mettre à jour les statistiques
    updateDashboardStats();
    
    // Initialiser les event listeners
    initializeEventListeners();
    
    console.log('✅ Application initialisée avec succès');
    showNotification('Application chargée avec succès', 'success');
});

// ================================
// GESTION DES DONNÉES SIMULÉES
// ================================

function loadSimulatedData() {
    // Simuler quelques interventions existantes
    const sampleInterventions = [
        {
            id: "int_" + Date.now() + "_1",
            statut: "termine",
            dateCreation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            dateModification: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            intervention: {
                numero: "SAV202509040830",
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                technicien: "Jean-Philippe"
            },
            client: {
                nom: "Résidence Les Oliviers",
                adresse: "15 Rue des Oliviers, 84000 Avignon",
                contact: "M. Martin",
                telephone: "04 90 12 34 56"
            },
            equipement: {
                type: "Portail coulissant",
                materiau: "Aluminium",
                marque: "Somfy",
                modele: "Dexxo Pro 800",
                annee: "2020"
            },
            intervention_details: {
                type: "Dépannage urgence",
                probleme: "Portail ne s'ouvre plus",
                actions: "Remplacement fusible grillé + test fonctionnement",
                pieces: "Fusible 5A",
                duree: "45"
            }
        },
        {
            id: "int_" + Date.now() + "_2",
            statut: "brouillon",
            dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            dateModification: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            intervention: {
                numero: "SAV202509090900",
                date: new Date().toISOString().slice(0, 16),
                technicien: "Marie Dubois"
            },
            client: {
                nom: "Villa Bellevue",
                adresse: "25 Avenue de la Gare, 84200 Carpentras",
                contact: "Mme Dupont"
            },
            equipement: {
                type: "Portail battant",
                marque: "FAAC"
            },
            intervention_details: {
                type: "Maintenance préventive"
            }
        }
    ];
    
    interventionsDB = [...sampleInterventions];
    
    // Alimenter l'historique pour l'auto-complétion
    interventionsDB.forEach(intervention => {
        if (intervention.intervention?.technicien) {
            historique.techniciens.add(intervention.intervention.technicien);
        }
        if (intervention.client?.nom) {
            historique.clients.add(intervention.client.nom);
        }
        if (intervention.equipement?.modele) {
            historique.modeles.add(intervention.equipement.modele);
        }
    });
    
    console.log(`📊 Chargement simulé de ${interventionsDB.length} interventions`);
}

// ================================
// SYSTÈME DE NAVIGATION - CORRIGÉ
// ================================

function initializeTabs() {
    console.log('🔧 Initialisation des onglets');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log(`Found ${tabButtons.length} tab buttons`);
    
    tabButtons.forEach(button => {
        // Supprimer tous les anciens listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Réattacher les event listeners aux nouveaux boutons
    const newTabButtons = document.querySelectorAll('.tab-btn');
    newTabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.getAttribute('data-tab');
            console.log(`🔄 Clic sur onglet: ${tabName}`);
            
            if (tabName && tabName !== currentTab) {
                showTab(tabName);
            }
        });
    });
    
    console.log('✅ Onglets initialisés avec succès');
}

function showTab(tabName) {
    console.log(`📋 Affichage onglet: ${tabName}`);
    
    try {
        // 1. Masquer tous les contenus d'onglets
        const allTabContents = document.querySelectorAll('.tab-content');
        allTabContents.forEach(content => {
            content.classList.remove('active');
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
            console.log(`✅ Contenu affiché pour: ${tabName}`);
        } else {
            console.error(`❌ Contenu non trouvé pour: ${tabName}`);
            return;
        }
        
        if (targetButton) {
            targetButton.classList.add('active');
            console.log(`✅ Bouton activé pour: ${tabName}`);
        } else {
            console.error(`❌ Bouton non trouvé pour: ${tabName}`);
        }
        
        // 4. Mettre à jour l'état actuel
        currentTab = tabName;
        
        // 5. Actions spéciales selon l'onglet
        switch (tabName) {
            case 'dashboard':
                updateDashboardStats();
                updateRecentInterventions();
                break;
                
            case 'nouvelle-intervention':
                if (!currentIntervention) {
                    createNewIntervention();
                }
                // Afficher le premier sous-onglet
                setTimeout(() => {
                    showSubTab('general');
                }, 100);
                break;
                
            case 'historique':
                updateHistoriqueTable();
                break;
                
            case 'parametres':
                loadParametres();
                break;
        }
        
        console.log(`✅ Onglet ${tabName} activé avec succès`);
        
    } catch (error) {
        console.error(`❌ Erreur lors du changement d'onglet:`, error);
    }
}

function initializeSubTabs() {
    console.log('🔧 Initialisation des sous-onglets');
    
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    console.log(`Found ${subTabButtons.length} sub-tab buttons`);
    
    subTabButtons.forEach(button => {
        // Supprimer tous les anciens listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Réattacher les event listeners aux nouveaux boutons
    const newSubTabButtons = document.querySelectorAll('.sub-tab-btn');
    newSubTabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const subTabName = this.getAttribute('data-subtab');
            console.log(`🔄 Clic sur sous-onglet: ${subTabName}`);
            
            if (subTabName && subTabName !== currentSubTab) {
                showSubTab(subTabName);
            }
        });
    });
    
    console.log('✅ Sous-onglets initialisés avec succès');
}

function showSubTab(subTabName) {
    console.log(`📋 Affichage sous-onglet: ${subTabName}`);
    
    try {
        // 1. Masquer tous les sous-contenus
        const allSubTabContents = document.querySelectorAll('.sub-tab-content');
        allSubTabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 2. Désactiver tous les sous-boutons
        const allSubTabButtons = document.querySelectorAll('.sub-tab-btn');
        allSubTabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 3. Activer le sous-onglet cible
        const targetContent = document.getElementById(subTabName);
        const targetButton = document.querySelector(`[data-subtab="${subTabName}"]`);
        
        if (targetContent) {
            targetContent.classList.add('active');
            console.log(`✅ Sous-contenu affiché pour: ${subTabName}`);
        } else {
            console.error(`❌ Sous-contenu non trouvé pour: ${subTabName}`);
            return;
        }
        
        if (targetButton) {
            targetButton.classList.add('active');
            console.log(`✅ Sous-bouton activé pour: ${subTabName}`);
        } else {
            console.error(`❌ Sous-bouton non trouvé pour: ${subTabName}`);
        }
        
        // 4. Mettre à jour l'état actuel
        currentSubTab = subTabName;
        
        // 5. Actions spéciales selon le sous-onglet
        switch (subTabName) {
            case 'signature':
                setTimeout(() => {
                    initializeSignatureCanvas();
                }, 200);
                break;
                
            case 'rapport':
                updateRapportStats();
                break;
        }
        
        console.log(`✅ Sous-onglet ${subTabName} activé avec succès`);
        
    } catch (error) {
        console.error(`❌ Erreur lors du changement de sous-onglet:`, error);
    }
}

// ================================
// GESTION DES INTERVENTIONS
// ================================

function createNewIntervention() {
    currentIntervention = {
        id: "int_" + Date.now(),
        statut: "brouillon",
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        intervention: {
            numero: generateInterventionNumber(),
            date: new Date().toISOString().slice(0, 16),
            technicien: userPreferences.defaultTechnicien || ""
        },
        client: {},
        equipement: {},
        intervention_details: {},
        photos: [],
        signature: null,
        resultats: {}
    };
    
    photos = [];
    signatureData = null;
    
    // Pré-remplir le formulaire
    populateForm(currentIntervention);
    
    console.log('📝 Nouvelle intervention créée:', currentIntervention.id);
    showNotification('Nouvelle intervention initialisée', 'info');
}

function generateInterventionNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    return `SAV${year}${month}${day}${hour}${minute}`;
}

function populateForm(intervention) {
    // Remplir les champs du formulaire
    setFieldValue('numero-intervention', intervention.intervention?.numero || '');
    setFieldValue('date-intervention', intervention.intervention?.date || '');
    setFieldValue('technicien', intervention.intervention?.technicien || '');
    setFieldValue('client-nom', intervention.client?.nom || '');
    setFieldValue('client-adresse', intervention.client?.adresse || '');
    setFieldValue('client-contact', intervention.client?.telephone || '');
    
    setFieldValue('type-portail', intervention.equipement?.type || '');
    setFieldValue('materiau', intervention.equipement?.materiau || '');
    setFieldValue('marque-motorisation', intervention.equipement?.marque || '');
    setFieldValue('modele', intervention.equipement?.modele || '');
    setFieldValue('annee', intervention.equipement?.annee || '');
    
    setFieldValue('type-intervention', intervention.intervention_details?.type || '');
    setFieldValue('probleme', intervention.intervention_details?.probleme || '');
    setFieldValue('actions', intervention.intervention_details?.actions || '');
    setFieldValue('pieces-remplacees', intervention.intervention_details?.pieces || '');
    setFieldValue('temps-passe', intervention.intervention_details?.duree || '');
    setFieldValue('recommandations', intervention.intervention_details?.recommandations || '');
    
    // Charger les photos
    if (intervention.photos && intervention.photos.length > 0) {
        photos = [...intervention.photos];
        displayAllPhotos();
    }
    
    // Charger la signature
    if (intervention.signature?.dataUrl) {
        signatureData = intervention.signature.dataUrl;
        showSignatureSaved();
    }

    // Charger le questionnaire TVA
    if (intervention.questionnaireTVA) {
        setTimeout(() => {
            setQuestionnaireData(intervention.questionnaireTVA);
        }, 500);
    }
}

// Fonctions globales pour les boutons
window.nouvelleIntervention = function() {
    console.log('🆕 Demande nouvelle intervention');
    
    if (currentIntervention && currentIntervention.statut === 'brouillon') {
        if (confirm('Une intervention est en cours. Voulez-vous vraiment en créer une nouvelle ? (Les modifications non sauvegardées seront perdues)')) {
            createNewIntervention();
            showTab('nouvelle-intervention');
        }
    } else {
        createNewIntervention();
        showTab('nouvelle-intervention');
    }
};

window.reprendreBrouillon = function() {
    console.log('📝 Reprendre brouillon');
    
    const brouillons = interventionsDB.filter(i => i.statut === 'brouillon');
    if (brouillons.length > 0) {
        // Prendre le brouillon le plus récent
        const dernierBrouillon = brouillons.sort((a, b) => 
            new Date(b.dateModification) - new Date(a.dateModification)
        )[0];
        
        currentIntervention = dernierBrouillon;
        populateForm(currentIntervention);
        showTab('nouvelle-intervention');
        showNotification(`Brouillon repris: ${dernierBrouillon.intervention.numero}`, 'info');
    } else {
        showNotification('Aucun brouillon disponible', 'warning');
    }
};

// ================================
// AUTO-SAUVEGARDE
// ================================

function initializeAutoSave() {
    if (autoSaveEnabled) {
        startAutoSave();
    }
    
    // Ajouter des listeners sur tous les champs du formulaire
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('input', onFieldChange);
        field.addEventListener('change', onFieldChange);
    });
}

function onFieldChange() {
    if (currentIntervention && autoSaveEnabled) {
        // Marquer comme en cours de sauvegarde
        updateSaveIndicator('saving');
        
        // Programmer une sauvegarde dans 2 secondes
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            sauvegarderAutomatiquement();
        }, 2000);
    }
}

function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    autoSaveTimer = setInterval(() => {
        if (currentIntervention) {
            sauvegarderAutomatiquement();
        }
    }, autoSaveInterval);
}

function sauvegarderAutomatiquement() {
    if (!currentIntervention) return;
    
    try {
        // Collecter les données du formulaire
        collectFormData();
        
        // Mettre à jour la date de modification
        currentIntervention.dateModification = new Date().toISOString();
        
        // Sauvegarder dans la base
        const existingIndex = interventionsDB.findIndex(i => i.id === currentIntervention.id);
        if (existingIndex >= 0) {
            interventionsDB[existingIndex] = { ...currentIntervention };
        } else {
            interventionsDB.push({ ...currentIntervention });
        }
        
        lastSaveTime = new Date();
        updateSaveIndicator('saved');
        
        console.log('💾 Sauvegarde automatique réussie');
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde automatique:', error);
        updateSaveIndicator('error');
        showNotification('Erreur lors de la sauvegarde automatique', 'error');
    }
}

function updateSaveIndicator(status) {
    const indicator = document.getElementById('save-indicator');
    const dot = document.querySelector('.save-dot');
    
    if (!indicator || !dot) return;
    
    switch (status) {
        case 'saving':
            dot.className = 'save-dot saving';
            indicator.innerHTML = '<span class="save-dot saving"></span>Sauvegarde en cours...';
            break;
        case 'saved':
            dot.className = 'save-dot';
            const timeStr = lastSaveTime ? formatTime(lastSaveTime) : '';
            indicator.innerHTML = `<span class="save-dot"></span>Sauvegardé ${timeStr}`;
            break;
        case 'error':
            dot.className = 'save-dot error';
            indicator.innerHTML = '<span class="save-dot error"></span>Erreur de sauvegarde';
            break;
    }
}

function collectFormData() {
    if (!currentIntervention) return;
    
    // Intervention
    currentIntervention.intervention = {
        numero: getFieldValue('numero-intervention'),
        date: getFieldValue('date-intervention'),
        technicien: getFieldValue('technicien')
    };
    
    // Client
    currentIntervention.client = {
        nom: getFieldValue('client-nom'),
        adresse: getFieldValue('client-adresse'),
        contact: getFieldValue('client-contact'),
        telephone: getFieldValue('client-contact')
    };
    
    // Équipement
    currentIntervention.equipement = {
        type: getFieldValue('type-portail'),
        materiau: getFieldValue('materiau'),
        marque: getFieldValue('marque-motorisation'),
        modele: getFieldValue('modele'),
        annee: getFieldValue('annee')
    };
    
    // Détails intervention
    currentIntervention.intervention_details = {
        type: getFieldValue('type-intervention'),
        probleme: getFieldValue('probleme'),
        actions: getFieldValue('actions'),
        pieces: getFieldValue('pieces-remplacees'),
        duree: getFieldValue('temps-passe'),
        recommandations: getFieldValue('recommandations')
    };
    
    // Photos et signature
    currentIntervention.photos = photos.map(photo => ({
        id: photo.id,
        dataUrl: photo.data,
        caption: photo.type,
        timestamp: photo.timestamp,
        category: photo.type
    }));
    
    if (signatureData) {
        currentIntervention.signature = {
            dataUrl: signatureData,
            nomSignataire: currentIntervention.client.nom || "Client",
            dateSignature: new Date().toISOString()
        };
    }
    
    // Mettre à jour l'historique pour l'auto-complétion
    updateHistoriqueFromForm();
}

window.sauvegarderBrouillon = function() {
    if (!currentIntervention) {
        showNotification('Aucune intervention en cours', 'warning');
        return;
    }
    
    collectFormData();
    currentIntervention.statut = 'brouillon';
    currentIntervention.dateModification = new Date().toISOString();
    
    const existingIndex = interventionsDB.findIndex(i => i.id === currentIntervention.id);
    if (existingIndex >= 0) {
        interventionsDB[existingIndex] = { ...currentIntervention };
    } else {
        interventionsDB.push({ ...currentIntervention });
    }
    
    updateDashboardStats();
    showNotification('Brouillon sauvegardé avec succès', 'success');
};

window.terminerIntervention = function() {
    if (!currentIntervention) {
        showNotification('Aucune intervention en cours', 'warning');
        return;
    }
    
    if (!validateAllFields()) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    collectFormData();
    currentIntervention.statut = 'termine';
    currentIntervention.dateModification = new Date().toISOString();
    
    const existingIndex = interventionsDB.findIndex(i => i.id === currentIntervention.id);
    if (existingIndex >= 0) {
        interventionsDB[existingIndex] = { ...currentIntervention };
    } else {
        interventionsDB.push({ ...currentIntervention });
    }
    
    updateDashboardStats();
    showNotification('Intervention terminée avec succès', 'success');
    
    // Proposer la génération du PDF
    if (confirm('Intervention terminée. Voulez-vous générer le rapport PDF maintenant ?')) {
        showSubTab('rapport');
        setTimeout(generatePDF, 500);
    }
};

window.reinitialiserFormulaire = function() {
    showConfirmationModal(
        'Réinitialiser le formulaire',
        'Êtes-vous sûr de vouloir réinitialiser le formulaire ? Toutes les modifications non sauvegardées seront perdues.',
        () => {
            createNewIntervention();
            showNotification('Formulaire réinitialisé', 'info');
        }
    );
};

// ================================
// AUTO-COMPLÉTION
// ================================

function initializeAutoComplete() {
    setupDatalist('techniciens-datalist', Array.from(historique.techniciens));
    setupDatalist('clients-datalist', Array.from(historique.clients));
    setupDatalist('modeles-datalist', Array.from(historique.modeles));
    setupDatalist('pannes-datalist', dataAutocomplete.pannes_courantes);
    setupDatalist('pieces-datalist', dataAutocomplete.pieces_courantes);
}

function setupDatalist(datalistId, items) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    
    datalist.innerHTML = '';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
}

function updateHistoriqueFromForm() {
    const technicien = getFieldValue('technicien');
    const client = getFieldValue('client-nom');
    const modele = getFieldValue('modele');
    
    if (technicien) {
        historique.techniciens.add(technicien);
        setupDatalist('techniciens-datalist', Array.from(historique.techniciens));
    }
    if (client) {
        historique.clients.add(client);
        setupDatalist('clients-datalist', Array.from(historique.clients));
    }
    if (modele) {
        historique.modeles.add(modele);
        setupDatalist('modeles-datalist', Array.from(historique.modeles));
    }
}

// ================================
// TABLEAU DE BORD
// ================================

function updateDashboardStats() {
    const totalInterventions = interventionsDB.length;
    const brouillons = interventionsDB.filter(i => i.statut === 'brouillon').length;
    
    // Statistiques de la semaine
    const uneSeemaine = 7 * 24 * 60 * 60 * 1000;
    const maintenant = new Date();
    const interventionsSemaine = interventionsDB.filter(i => {
        const dateIntervention = new Date(i.dateCreation);
        return (maintenant - dateIntervention) <= uneSeemaine;
    }).length;
    
    // Statistiques du mois
    const unMois = 30 * 24 * 60 * 60 * 1000;
    const interventionsMois = interventionsDB.filter(i => {
        const dateIntervention = new Date(i.dateCreation);
        return (maintenant - dateIntervention) <= unMois;
    }).length;
    
    // Urgences
    const urgences = interventionsDB.filter(i => 
        i.intervention_details?.type === 'Dépannage urgence'
    ).length;
    
    // Mettre à jour l'interface
    setElementText('total-interventions', totalInterventions);
    setElementText('brouillons-count', brouillons);
    setElementText('stat-semaine', interventionsSemaine);
    setElementText('stat-mois', interventionsMois);
    setElementText('stat-urgence', urgences);
    
    // Activer/désactiver le bouton reprendre brouillon
    const reprendreBtn = document.getElementById('reprendre-btn');
    if (reprendreBtn) {
        reprendreBtn.disabled = brouillons === 0;
    }
}

function updateRecentInterventions() {
    const recentList = document.getElementById('recent-list');
    if (!recentList) return;
    
    const recent = interventionsDB
        .sort((a, b) => new Date(b.dateModification) - new Date(a.dateModification))
        .slice(0, 5);
    
    if (recent.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <p>Aucune intervention récente</p>
                <button class="btn btn--outline" onclick="nouvelleIntervention()">
                    Créer la première intervention
                </button>
            </div>`;
        return;
    }
    
    recentList.innerHTML = recent.map(intervention => `
        <div class="recent-item">
            <div class="recent-info">
                <h4>${intervention.client?.nom || 'Client non défini'}</h4>
                <p>${formatDate(new Date(intervention.dateModification))} - 
                   ${intervention.intervention_details?.type || 'Type non défini'}
                   <span class="status-badge ${intervention.statut}">${intervention.statut}</span>
                </p>
            </div>
            <div class="recent-actions">
                <button class="btn btn--outline" onclick="chargerIntervention('${intervention.id}')">
                    Modifier
                </button>
                ${intervention.statut === 'termine' ? 
                    `<button class="btn btn--primary" onclick="genererPDFIntervention('${intervention.id}')">PDF</button>` : 
                    ''
                }
            </div>
        </div>
    `).join('');
}

window.chargerIntervention = function(id) {
    const intervention = interventionsDB.find(i => i.id === id);
    if (!intervention) {
        showNotification('Intervention non trouvée', 'error');
        return;
    }
    
    currentIntervention = { ...intervention };
    photos = [...(intervention.photos || [])];
    signatureData = intervention.signature?.dataUrl || null;
    
    populateForm(currentIntervention);
    showTab('nouvelle-intervention');
    showNotification(`Intervention ${intervention.intervention.numero} chargée`, 'info');
};

// ================================
// HISTORIQUE
// ================================

function updateHistoriqueTable() {
    const tableContainer = document.getElementById('interventions-table');
    if (!tableContainer) return;
    
    let filteredInterventions = [...interventionsDB];
    
    // Appliquer les filtres
    const searchTerm = getFieldValue('search-interventions').toLowerCase();
    const statutFilter = getFieldValue('filter-statut');
    const typeFilter = getFieldValue('filter-type');
    
    if (searchTerm) {
        filteredInterventions = filteredInterventions.filter(i => 
            (i.client?.nom || '').toLowerCase().includes(searchTerm) ||
            (i.intervention?.numero || '').toLowerCase().includes(searchTerm) ||
            (i.intervention?.technicien || '').toLowerCase().includes(searchTerm)
        );
    }
    
    if (statutFilter) {
        filteredInterventions = filteredInterventions.filter(i => i.statut === statutFilter);
    }
    
    if (typeFilter) {
        filteredInterventions = filteredInterventions.filter(i => 
            i.intervention_details?.type === typeFilter
        );
    }
    
    if (filteredInterventions.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-state">
                <h3>Aucune intervention trouvée</h3>
                <p>Modifiez vos critères de recherche ou créez une nouvelle intervention</p>
                <button class="btn btn--primary" onclick="nouvelleIntervention()">Créer une intervention</button>
            </div>`;
        return;
    }
    
    // Trier par date de modification (plus récent en premier)
    filteredInterventions.sort((a, b) => 
        new Date(b.dateModification) - new Date(a.dateModification)
    );
    
    tableContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>N° Intervention</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Technicien</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredInterventions.map(intervention => `
                    <tr>
                        <td>${intervention.intervention?.numero || 'N/A'}</td>
                        <td>${intervention.client?.nom || 'N/A'}</td>
                        <td>${formatDate(new Date(intervention.dateModification))}</td>
                        <td>${intervention.intervention_details?.type || 'N/A'}</td>
                        <td>${intervention.intervention?.technicien || 'N/A'}</td>
                        <td><span class="status-badge ${intervention.statut}">${intervention.statut}</span></td>
                        <td>
                            <div class="table-actions">
                                <button class="btn btn--outline" onclick="chargerIntervention('${intervention.id}')">
                                    Modifier
                                </button>
                                ${intervention.statut === 'termine' ? 
                                    `<button class="btn btn--primary" onclick="genererPDFIntervention('${intervention.id}')">PDF</button>` : 
                                    ''
                                }
                                <button class="btn btn--secondary" onclick="dupliquerIntervention('${intervention.id}')">
                                    Dupliquer
                                </button>
                                <button class="btn btn--outline" onclick="supprimerIntervention('${intervention.id}')">
                                    Supprimer
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}

window.dupliquerIntervention = function(id) {
    const intervention = interventionsDB.find(i => i.id === id);
    if (!intervention) return;
    
    const nouvelle = {
        ...intervention,
        id: "int_" + Date.now(),
        statut: 'brouillon',
        dateCreation: new Date().toISOString(),
        dateModification: new Date().toISOString(),
        intervention: {
            ...intervention.intervention,
            numero: generateInterventionNumber(),
            date: new Date().toISOString().slice(0, 16)
        },
        signature: null
    };
    
    currentIntervention = nouvelle;
    photos = [...(intervention.photos || [])];
    signatureData = null;
    
    populateForm(currentIntervention);
    showTab('nouvelle-intervention');
    showNotification('Intervention dupliquée', 'info');
};

window.supprimerIntervention = function(id) {
    showConfirmationModal(
        'Confirmer la suppression',
        'Êtes-vous sûr de vouloir supprimer cette intervention ? Cette action est irréversible.',
        () => {
            interventionsDB = interventionsDB.filter(i => i.id !== id);
            updateHistoriqueTable();
            updateDashboardStats();
            showNotification('Intervention supprimée', 'info');
        }
    );
};

window.exporterHistorique = function() {
    if (interventionsDB.length === 0) {
        showNotification('Aucune intervention à exporter', 'warning');
        return;
    }
    
    // Filtrer selon les critères actuels
    let filteredInterventions = [...interventionsDB];
    
    const searchTerm = getFieldValue('search-interventions').toLowerCase();
    const statutFilter = getFieldValue('filter-statut');
    const typeFilter = getFieldValue('filter-type');
    
    if (searchTerm) {
        filteredInterventions = filteredInterventions.filter(i => 
            (i.client?.nom || '').toLowerCase().includes(searchTerm) ||
            (i.intervention?.numero || '').toLowerCase().includes(searchTerm)
        );
    }
    if (statutFilter) filteredInterventions = filteredInterventions.filter(i => i.statut === statutFilter);
    if (typeFilter) filteredInterventions = filteredInterventions.filter(i => i.intervention_details?.type === typeFilter);
    
    const dataStr = JSON.stringify(filteredInterventions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `historique-interventions-${formatDateForFilename(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${filteredInterventions.length} interventions exportées`, 'success');
};

// ================================
// GESTION DES PHOTOS
// ================================

window.addPhotos = function() {
    const fileInput = document.getElementById('photo-input');
    const typeSelect = document.getElementById('type-photo');
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showNotification('Veuillez sélectionner au moins une photo.', 'warning');
        return;
    }
    
    const photoType = typeSelect ? typeSelect.value : 'Photo générale';
    const files = Array.from(fileInput.files);
    
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
                updateRapportStats();
                
                // Déclencher une sauvegarde
                if (autoSaveEnabled && currentIntervention) {
                    sauvegarderAutomatiquement();
                }
            };
            reader.readAsDataURL(file);
        } else {
            showNotification(`Le fichier "${file.name}" n'est pas une image.`, 'warning');
        }
    });
    
    fileInput.value = '';
    if (typeSelect) typeSelect.value = 'État initial';
    
    showNotification(`${files.length} photo(s) en cours d'ajout...`, 'info');
};

function displayPhoto(photo) {
    const container = document.getElementById('photos-container');
    if (!container) return;
    
    const photoElement = document.createElement('div');
    photoElement.className = 'photo-item';
    photoElement.innerHTML = `
        <img src="${photo.data}" alt="${photo.type}" onclick="viewPhoto('${photo.id}')">
        <div class="photo-info">
            <div class="photo-type">${photo.type}</div>
            <div class="photo-timestamp">${formatDate(photo.timestamp)}</div>
        </div>
        <button type="button" class="photo-remove" onclick="removePhoto('${photo.id}')">&times;</button>
    `;
    
    container.appendChild(photoElement);
}

function displayAllPhotos() {
    const container = document.getElementById('photos-container');
    if (!container) return;
    
    container.innerHTML = '';
    photos.forEach(photo => displayPhoto(photo));
}

window.removePhoto = function(photoId) {
    photos = photos.filter(photo => photo.id != photoId);
    
    const photoElements = document.querySelectorAll('.photo-item');
    photoElements.forEach(element => {
        const removeBtn = element.querySelector('.photo-remove');
        if (removeBtn && removeBtn.getAttribute('onclick').includes(photoId)) {
            element.remove();
        }
    });
    
    updateRapportStats();
    if (autoSaveEnabled && currentIntervention) {
        sauvegarderAutomatiquement();
    }
};

window.viewPhoto = function(photoId) {
    const photo = photos.find(p => p.id == photoId);
    if (!photo) return;
    
    // Créer une modal simple pour afficher la photo
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${photo.type}</h3>
                <button type="button" class="btn-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${photo.data}" style="width: 100%; max-height: 70vh; object-fit: contain;">
                <p style="text-align: center; margin-top: 10px; color: var(--color-text-secondary);">
                    ${formatDate(photo.timestamp)}
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// ================================
// GESTION DE LA SIGNATURE
// ================================

function initializeSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) {
        console.log('⚠️ Canvas signature non trouvé');
        return;
    }
    
    console.log('🎨 Initialisation du canvas signature');
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    let isDrawing = false;
    
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    
    function getTouchPos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.touches[0].clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.touches[0].clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    
    // Nettoyer les anciens event listeners en clonant le canvas
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
    
    refreshedCanvas.addEventListener('mouseup', () => isDrawing = false);
    refreshedCanvas.addEventListener('mouseout', () => isDrawing = false);
    
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
    
    // Restaurer la signature existante si elle existe
    if (signatureData) {
        const img = new Image();
        img.onload = function() {
            refreshedCtx.drawImage(img, 0, 0);
        };
        img.src = signatureData;
    }
    
    console.log('✅ Canvas signature configuré');
}

window.clearSignature = function() {
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
        
        const savedDiv = document.getElementById('signature-saved');
        if (savedDiv) {
            savedDiv.classList.remove('show');
        }
        
        updateRapportStats();
        if (autoSaveEnabled && currentIntervention) {
            sauvegarderAutomatiquement();
        }
    }
};

window.saveSignature = function() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasSignature = imageData.data.some((pixel, index) => {
        return index % 4 === 3 && pixel !== 0;
    });
    
    if (!hasSignature) {
        showNotification('Veuillez dessiner une signature avant de l\'enregistrer.', 'warning');
        return;
    }
    
    signatureData = canvas.toDataURL('image/png');
    showSignatureSaved();
    updateRapportStats();
    
    if (autoSaveEnabled && currentIntervention) {
        sauvegarderAutomatiquement();
    }
};

function showSignatureSaved() {
    const savedDiv = document.getElementById('signature-saved');
    if (savedDiv) {
        savedDiv.innerHTML = `
            <div class="status status--success">
                ✓ Signature enregistrée le ${formatDate(new Date())}
            </div>
        `;
        savedDiv.classList.add('show');
    }
}

// ================================
// GÉNÉRATION PDF
// ================================

function updateRapportStats() {
    setElementText('photos-count', photos.length);
    setElementText('signature-status', signatureData ? 'Signée' : 'Non signée');
}

window.generatePDF = function() {
    if (!currentIntervention) {
        showNotification('Aucune intervention en cours', 'warning');
        return;
    }
    
    if (!validateAllFields()) {
        showNotification('Veuillez remplir tous les champs obligatoires avant de générer le PDF', 'error');
        return;
    }
    
    // Collecter les données avant génération
    collectFormData();
    
    try {
        showNotification('Génération du PDF en cours...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        createPDFContent(doc);
        
        const filename = `SAV_PORTAIL_${formatDateForFilename(new Date())}_${currentIntervention.intervention.numero}.pdf`;
        doc.save(filename);
        
        showNotification('Rapport PDF généré avec succès!', 'success');
        
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        showNotification(`Erreur lors de la génération du PDF: ${error.message}`, 'error');
    }
};

window.genererPDFIntervention = function(id) {
    const intervention = interventionsDB.find(i => i.id === id);
    if (!intervention) return;
    
    // Sauvegarder l'intervention courante
    const currentBackup = currentIntervention;
    const photosBackup = [...photos];
    const signatureBackup = signatureData;
    
    // Charger temporairement l'intervention
    currentIntervention = intervention;
    photos = intervention.photos || [];
    signatureData = intervention.signature?.dataUrl || null;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        createPDFContent(doc);
        
        const filename = `SAV_PORTAIL_${formatDateForFilename(new Date())}_${intervention.intervention.numero}.pdf`;
        doc.save(filename);
        
        showNotification('Rapport PDF généré avec succès!', 'success');
        
    } catch (error) {
        console.error('Erreur génération PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    } finally {
        // Restaurer l'intervention courante
        currentIntervention = currentBackup;
        photos = photosBackup;
        signatureData = signatureBackup;
    }
};

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
    doc.text('SAC Sécurité', 105, 50, { align: 'center' });
    
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
    
    doc.text(`Numéro: ${currentIntervention.intervention?.numero || 'N/A'}`, 105, 120, { align: 'center' });
    doc.text(`Date: ${formatDate(new Date(currentIntervention.intervention?.date || Date.now()))}`, 105, 135, { align: 'center' });
    doc.text(`Technicien: ${currentIntervention.intervention?.technicien || 'N/A'}`, 105, 150, { align: 'center' });
    doc.text(`Client: ${currentIntervention.client?.nom || 'N/A'}`, 105, 165, { align: 'center' });
    
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
    doc.text('SAC Sécurité', 20, y);
    
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
        ['Client', currentIntervention.client?.nom || 'N/A'],
        ['Adresse', currentIntervention.client?.adresse || 'N/A'],
        ['Contact', currentIntervention.client?.contact || 'N/A'],
        ['Date intervention', formatDate(new Date(currentIntervention.intervention?.date || Date.now()))],
        ['Technicien', currentIntervention.intervention?.technicien || 'N/A'],
        ['N° intervention', currentIntervention.intervention?.numero || 'N/A']
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
        ['Type de portail', currentIntervention.equipement?.type || 'N/A'],
        ['Matériau', currentIntervention.equipement?.materiau || 'N/A'],
        ['Marque motorisation', currentIntervention.equipement?.marque || 'N/A'],
        ['Modèle', currentIntervention.equipement?.modele || 'N/A'],
        ['Année installation', currentIntervention.equipement?.annee || 'N/A']
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
        ['Type d\'intervention', currentIntervention.intervention_details?.type || 'N/A'],
        ['Problème', currentIntervention.intervention_details?.probleme || 'N/A'],
        ['Actions effectuées', currentIntervention.intervention_details?.actions || 'N/A'],
        ['Pièces remplacées', currentIntervention.intervention_details?.pieces || 'N/A'],
        ['Temps passé (min)', currentIntervention.intervention_details?.duree || 'N/A'],
        ['Recommandations', currentIntervention.intervention_details?.recommandations || 'N/A']
    ];
    
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
window.previewPDF = function() {
    if (!currentIntervention || !validateAllFields()) return;
    
    try {
        collectFormData();
        showNotification('Génération de l\'aperçu...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        createPDFContent(doc);
        
        const pdfDataUri = doc.output('datauristring');
        const previewContainer = document.getElementById('pdf-preview-container');
        previewContainer.innerHTML = `
            <embed src="${pdfDataUri}" type="application/pdf" width="100%" height="500px">
        `;
        
        document.getElementById('pdf-preview-modal').classList.remove('hidden');
        showNotification('Aperçu généré!', 'success');
    } catch (error) {
        console.error('Erreur aperçu:', error);
        showNotification('Erreur lors de l\'aperçu.', 'error');
    }
};

window.closePDFPreview = function() {
    document.getElementById('pdf-preview-modal').classList.add('hidden');
};

window.downloadFromPreview = function() {
    closePDFPreview();
    generatePDF();
};

// ================================
// PARAMÈTRES
// ================================

function loadParametres() {
    // Charger les paramètres de l'entreprise
    setFieldValue('param-nom', entrepriseData.nom);
    setFieldValue('param-specialite', entrepriseData.specialite);
    setFieldValue('param-adresse', entrepriseData.adresse);
    setFieldValue('param-telephone', entrepriseData.telephone);
    setFieldValue('param-email', entrepriseData.email);
    setFieldValue('param-siret', entrepriseData.siret);
    
    // Charger les préférences utilisateur
    const autoSaveCheckbox = document.getElementById('auto-save-enabled');
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    
    if (autoSaveCheckbox) autoSaveCheckbox.checked = userPreferences.autoSaveEnabled;
    if (notificationsCheckbox) notificationsCheckbox.checked = userPreferences.notificationsEnabled;
    
    setFieldValue('auto-save-interval', userPreferences.autoSaveInterval);
    setFieldValue('default-technicien', userPreferences.defaultTechnicien);
    
    // Mettre à jour les statistiques des données
    updateDataStats();
}

window.sauvegarderParametres = function() {
    // Sauvegarder les paramètres de l'entreprise
    entrepriseData.nom = getFieldValue('param-nom');
    entrepriseData.specialite = getFieldValue('param-specialite');
    entrepriseData.adresse = getFieldValue('param-adresse');
    entrepriseData.telephone = getFieldValue('param-telephone');
    entrepriseData.email = getFieldValue('param-email');
    entrepriseData.siret = getFieldValue('param-siret');
    
    // Sauvegarder les préférences utilisateur
    const nouveauInterval = parseInt(getFieldValue('auto-save-interval'));
    if (nouveauInterval !== userPreferences.autoSaveInterval) {
        userPreferences.autoSaveInterval = nouveauInterval;
        autoSaveInterval = nouveauInterval * 1000;
        if (autoSaveEnabled) {
            startAutoSave();
        }
    }
    
    const autoSaveCheckbox = document.getElementById('auto-save-enabled');
    const notificationsCheckbox = document.getElementById('notifications-enabled');
    
    if (autoSaveCheckbox) userPreferences.autoSaveEnabled = autoSaveCheckbox.checked;
    if (notificationsCheckbox) userPreferences.notificationsEnabled = notificationsCheckbox.checked;
    
    userPreferences.defaultTechnicien = getFieldValue('default-technicien');
    
    // Mettre à jour l'auto-save
    if (userPreferences.autoSaveEnabled !== autoSaveEnabled) {
        autoSaveEnabled = userPreferences.autoSaveEnabled;
        if (autoSaveEnabled) {
            startAutoSave();
        } else {
            clearInterval(autoSaveTimer);
        }
    }
    
    showNotification('Paramètres sauvegardés avec succès', 'success');
};

window.reinitialiserParametres = function() {
    showConfirmationModal(
        'Réinitialiser les paramètres',
        'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?',
        () => {
            // Réinitialiser aux valeurs par défaut
            userPreferences = {
                autoSaveEnabled: true,
                autoSaveInterval: 30,
                notificationsEnabled: true,
                defaultTechnicien: ""
            };
            loadParametres();
            showNotification('Paramètres réinitialisés', 'info');
        }
    );
};

function updateDataStats() {
    setElementText('data-interventions', interventionsDB.length);
    
    // Calculer la taille approximative des données
    const dataSize = JSON.stringify(interventionsDB).length;
    const sizeKB = Math.round(dataSize / 1024);
    setElementText('data-size', `${sizeKB} KB`);
}

window.exporterToutesLesDonnees = function() {
    const exportData = {
        interventions: interventionsDB,
        entreprise: entrepriseData,
        preferences: userPreferences,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `sav-export-${formatDateForFilename(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Données exportées avec succès', 'success');
};

window.importerDonnees = function() {
    const fileInput = document.getElementById('import-file');
    fileInput.click();
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.interventions) {
                    interventionsDB = [...importData.interventions];
                }
                if (importData.entreprise) {
                    Object.assign(entrepriseData, importData.entreprise);
                }
                if (importData.preferences) {
                    Object.assign(userPreferences, importData.preferences);
                }
                
                updateDashboardStats();
                updateDataStats();
                loadParametres();
                
                showNotification('Données importées avec succès', 'success');
            } catch (error) {
                showNotification('Erreur lors de l\'importation des données', 'error');
            }
        };
        reader.readAsText(file);
    };
};

window.viderCache = function() {
    showConfirmationModal(
        'Vider le cache',
        'Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.',
        () => {
            interventionsDB = [];
            currentIntervention = null;
            photos = [];
            signatureData = null;
            historique = {
                techniciens: new Set(),
                clients: new Set(),
                modeles: new Set()
            };
            
            updateDashboardStats();
            updateDataStats();
            initializeAutoComplete();
            
            showNotification('Cache vidé avec succès', 'info');
        }
    );
};

// ================================
// EVENT LISTENERS
// ================================

function initializeEventListeners() {
    // Filtres de recherche dans l'historique
    const searchInput = document.getElementById('search-interventions');
    const filterStatut = document.getElementById('filter-statut');
    const filterType = document.getElementById('filter-type');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(updateHistoriqueTable, 300));
    }
    if (filterStatut) {
        filterStatut.addEventListener('change', updateHistoriqueTable);
    }
    if (filterType) {
        filterType.addEventListener('change', updateHistoriqueTable);
    }
}

// ================================
// MODALS ET NOTIFICATIONS
// ================================

function showConfirmationModal(title, message, onConfirm) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmBtn = document.getElementById('confirm-ok');
    confirmBtn.onclick = () => {
        closeConfirmModal();
        onConfirm();
    };
    
    document.getElementById('confirmation-modal').classList.remove('hidden');
}

window.closeConfirmModal = function() {
    document.getElementById('confirmation-modal').classList.add('hidden');
};

function showNotification(message, type = 'info', duration = 5000) {
    if (!userPreferences.notificationsEnabled) return;
    
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.onclick = () => notification.remove();
    
    container.appendChild(notification);
    
    // Supprimer automatiquement après la durée spécifiée
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// ================================
// FORMULAIRES ET VALIDATION
// ================================

function validateAllFields() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    const missingFields = [];
    
    requiredFields.forEach(field => {
        const value = field.value.trim();
        if (!value) {
            isValid = false;
            field.classList.add('error');
            
            const label = field.closest('.form-group')?.querySelector('.form-label');
            if (label) {
                missingFields.push(label.textContent.replace(' *', ''));
            }
        } else {
            field.classList.remove('error');
            field.classList.add('success');
        }
    });
    
    if (!isValid && missingFields.length > 0) {
        showNotification(`Champs obligatoires manquants: ${missingFields.join(', ')}`, 'error');
    }
    
    return isValid;
}

// ================================
// UTILITAIRES
// ================================

function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value.trim() : '';
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
    }
}

function setElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
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

function formatTime(date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateForFilename(date) {
    return new Date(date).toISOString().slice(0, 10).replace(/-/g, '');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('✅ Application SAV Avancée chargée - Navigation corrigée et fonctionnelle');

// ================================
// GESTION DU QUESTIONNAIRE TVA
// ================================
function initializeQuestionnaireListeners() {
    console.log('🔧 Initialisation des listeners du questionnaire TVA');

    // Gérer les cases à cocher pour le type de logement (une seule sélection)
    const typeLogementCheckboxes = document.querySelectorAll('input[name="type-logement"]');
    typeLogementCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                typeLogementCheckboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });

    // Gérer les cases à cocher pour le statut client (une seule sélection)
    const statutClientCheckboxes = document.querySelectorAll('input[name="statut-client"]');
    statutClientCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                statutClientCheckboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });

                // Afficher/masquer le champ de précision pour "Autre"
                const autrePrecision = document.getElementById('autre-precision');
                if (this.value === 'autre' && this.checked) {
                    autrePrecision.style.display = 'block';
                } else {
                    autrePrecision.style.display = 'none';
                    const detailField = document.getElementById('statut-autre-detail');
                    if (detailField) detailField.value = '';
                }
            }
        });
    });

    // Ajouter les listeners pour la sauvegarde automatique
    const questionnaireFields = document.querySelectorAll('input[name="type-logement"], input[name="statut-client"], #statut-autre-detail');
    questionnaireFields.forEach(field => {
        field.addEventListener('change', onFieldChange);
        if (field.type === 'text') {
            field.addEventListener('input', onFieldChange);
        }
    });

    console.log('✅ Listeners du questionnaire TVA initialisés');
}

function getQuestionnaireData() {
    const typeLogement = document.querySelector('input[name="type-logement"]:checked')?.value || '';
    const statutClient = document.querySelector('input[name="statut-client"]:checked')?.value || '';
    const statutAutreDetail = document.getElementById('statut-autre-detail')?.value || '';

    return {
        typeLogement,
        statutClient,
        statutAutreDetail: statutClient === 'autre' ? statutAutreDetail : ''
    };
}

function setQuestionnaireData(data) {
    if (!data) return;

    // Remplir type de logement
    if (data.typeLogement) {
        const typeCheckbox = document.querySelector(`input[name="type-logement"][value="${data.typeLogement}"]`);
        if (typeCheckbox) typeCheckbox.checked = true;
    }

    // Remplir statut client
    if (data.statutClient) {
        const statutCheckbox = document.querySelector(`input[name="statut-client"][value="${data.statutClient}"]`);
        if (statutCheckbox) {
            statutCheckbox.checked = true;

            // Si c'est "autre", afficher le champ de précision
            if (data.statutClient === 'autre') {
                const autrePrecision = document.getElementById('autre-precision');
                if (autrePrecision) {
                    autrePrecision.style.display = 'block';
                    if (data.statutAutreDetail) {
                        const detailField = document.getElementById('statut-autre-detail');
                        if (detailField) detailField.value = data.statutAutreDetail;
                    }
                }
            }
        }
    }
}

function validateQuestionnaire() {
    const typeLogement = document.querySelector('input[name="type-logement"]:checked');
    const statutClient = document.querySelector('input[name="statut-client"]:checked');

    if (!typeLogement) {
        showNotification('Veuillez sélectionner le type de logement pour l\'attestation TVA', 'warning');
        return false;
    }

    if (!statutClient) {
        showNotification('Veuillez sélectionner le statut du client pour l\'attestation TVA', 'warning');
        return false;
    }

    if (statutClient.value === 'autre') {
        const autreDetail = document.getElementById('statut-autre-detail');
        if (!autreDetail || !autreDetail.value.trim()) {
            showNotification('Veuillez préciser le statut "Autre" pour l\'attestation TVA', 'warning');
            return false;
        }
    }

    return true;
}

function validateAllFields() {
    // D'abord valider le questionnaire TVA
    if (!validateQuestionnaire()) {
        return false;
    }

    // Ensuite valider les autres champs obligatoires
    const requiredFields = [
        { id: 'numero-intervention', name: 'Numéro d\'intervention' },
        { id: 'date-intervention', name: 'Date d\'intervention' },
        { id: 'technicien', name: 'Technicien' },
        { id: 'client-nom', name: 'Nom du client' },
        { id: 'client-adresse', name: 'Adresse du client' },
        { id: 'type-portail', name: 'Type de portail' },
        { id: 'marque-motorisation', name: 'Marque de motorisation' },
        { id: 'type-intervention', name: 'Type d\'intervention' },
        { id: 'probleme', name: 'Problème constaté' },
        { id: 'actions', name: 'Actions réalisées' }
    ];

    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element || !element.value.trim()) {
            showNotification(`Le champ "${field.name}" est obligatoire`, 'error');
            return false;
        }
    }

    // Vérifier qu'il y a au moins une photo
    if (photos.length === 0) {
        showNotification('Veuillez ajouter au moins une photo', 'warning');
        return false;
    }

    // Vérifier la signature
    if (!signatureData) {
        showNotification('La signature du client est obligatoire', 'warning');
        return false;
    }

    return true;
}

// ================================
// GÉNÉRATION PDF AVEC TVA
// ================================
function generatePDF() {
    if (!currentIntervention) {
        showNotification('Aucune intervention en cours', 'warning');
        return;
    }

    // Collecter toutes les données y compris TVA
    collectFormData();

    showNotification('Génération du PDF en cours...', 'info');

    try {
        // Créer le contenu HTML du rapport avec TVA
        const pdfContent = generatePDFContent();

        // Simuler la génération PDF (dans une vraie application, utiliser jsPDF ou similaire)
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Ouvrir dans une nouvelle fenêtre pour impression
        const printWindow = window.open(url, '_blank');
        printWindow.onload = function() {
            printWindow.print();
        };

        showNotification('PDF généré avec succès (ouvert pour impression)', 'success');

    } catch (error) {
        console.error('Erreur génération PDF:', error);
        showNotification('Erreur lors de la génération du PDF', 'error');
    }
}

function generatePDFContent() {
    const intervention = currentIntervention;
    const questionnaireTVA = getQuestionnaireData();

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Rapport d'intervention - ${intervention.intervention?.numero}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px solid #218085; padding-bottom: 10px; margin-bottom: 20px; }
            .company-name { color: #218085; font-size: 24px; font-weight: bold; }
            .section { margin-bottom: 20px; }
            .section h3 { background: #f0f8ff; padding: 8px; border-left: 4px solid #218085; margin-bottom: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; display: inline-block; width: 150px; }
            .tva-section { border: 2px solid #A84B2F; background: #fff8f0; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .tva-title { color: #A84B2F; font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 10px; }
            .tva-text { font-style: italic; margin: 10px 0; padding: 10px; background: #f0f8ff; border-left: 4px solid #218085; }
            .signature-section { margin-top: 30px; border: 1px solid #ccc; padding: 15px; }
            @media print { body { margin: 0; } }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">SAC Sécurité</div>
            <div>Automatismes de Portail</div>
            <div>123 Avenue des Automatismes, 84200 Carpentras</div>
            <div>Tél: 04 90 XX XX XX</div>
        </div>

        <h2 style="text-align: center; color: #218085;">RAPPORT D'INTERVENTION</h2>

        <div class="section">
            <h3>Informations Générales</h3>
            <div class="info-grid">
                <div>
                    <div class="info-item"><span class="label">N° Intervention:</span> ${intervention.intervention?.numero || 'N/A'}</div>
                    <div class="info-item"><span class="label">Date:</span> ${formatDate(new Date(intervention.intervention?.date || new Date()))}</div>
                    <div class="info-item"><span class="label">Technicien:</span> ${intervention.intervention?.technicien || 'N/A'}</div>
                </div>
                <div>
                    <div class="info-item"><span class="label">Client:</span> ${intervention.client?.nom || 'N/A'}</div>
                    <div class="info-item"><span class="label">Adresse:</span> ${intervention.client?.adresse || 'N/A'}</div>
                    <div class="info-item"><span class="label">Contact:</span> ${intervention.client?.telephone || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Équipement</h3>
            <div class="info-grid">
                <div>
                    <div class="info-item"><span class="label">Type:</span> ${intervention.equipement?.type || 'N/A'}</div>
                    <div class="info-item"><span class="label">Matériau:</span> ${intervention.equipement?.materiau || 'N/A'}</div>
                    <div class="info-item"><span class="label">Marque:</span> ${intervention.equipement?.marque || 'N/A'}</div>
                </div>
                <div>
                    <div class="info-item"><span class="label">Modèle:</span> ${intervention.equipement?.modele || 'N/A'}</div>
                    <div class="info-item"><span class="label">Année:</span> ${intervention.equipement?.annee || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Intervention</h3>
            <div class="info-item"><span class="label">Type:</span> ${intervention.intervention_details?.type || 'N/A'}</div>
            <div class="info-item"><span class="label">Problème:</span> ${intervention.intervention_details?.probleme || 'N/A'}</div>
            <div class="info-item"><span class="label">Actions:</span> ${intervention.intervention_details?.actions || 'N/A'}</div>
            <div class="info-item"><span class="label">Pièces:</span> ${intervention.intervention_details?.pieces || 'N/A'}</div>
            <div class="info-item"><span class="label">Durée:</span> ${intervention.intervention_details?.duree || 'N/A'} minutes</div>
            <div class="info-item"><span class="label">Recommandations:</span> ${intervention.intervention_details?.recommandations || 'N/A'}</div>
        </div>

        <!-- SECTION TVA AJOUTÉE -->
        <div class="tva-section">
            <div class="tva-title">📋 ATTESTATION DE TVA 10%</div>
            <p style="text-align: center; font-weight: bold;">Je soussigné</p>

            <div class="tva-text">
                demeurant à l'adresse "<strong>${intervention.client?.adresse || 'LIEU INTERVENTION'}</strong>" 
                atteste que les travaux réalisés portent sur un immeuble depuis plus de 2 ans à la 
                date de commencement des travaux et affecté exclusivement à l'habitation à l'issue 
                de ces travaux.
            </div>

            <div style="margin-top: 15px;">
                <div class="info-item"><span class="label">Type de logement:</span> 
                    ${questionnaireTVA.typeLogement ? questionnaireTVA.typeLogement.charAt(0).toUpperCase() + questionnaireTVA.typeLogement.slice(1) : 'Non spécifié'}
                </div>
                <div class="info-item"><span class="label">Statut du client:</span> 
                    ${questionnaireTVA.statutClient ? questionnaireTVA.statutClient.charAt(0).toUpperCase() + questionnaireTVA.statutClient.slice(1) : 'Non spécifié'}
                    ${questionnaireTVA.statutClient === 'autre' && questionnaireTVA.statutAutreDetail ? ' (' + questionnaireTVA.statutAutreDetail + ')' : ''}
                </div>
            </div>
        </div>

        <div class="signature-section">
            <h3>Signatures</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px;">
                <div>
                    <div style="text-align: center; margin-bottom: 50px;">
                        <strong>Signature du Technicien</strong>
                    </div>
                    <div style="border-top: 1px solid #ccc; text-align: center; padding-top: 5px;">
                        ${intervention.intervention?.technicien || 'N/A'}
                    </div>
                </div>
                <div>
                    <div style="text-align: center; margin-bottom: 50px;">
                        <strong>Signature du Client</strong><br>
                        <small>(Certifie avoir reçu l'intervention et confirme l'attestation TVA)</small>
                    </div>
                    <div style="border-top: 1px solid #ccc; text-align: center; padding-top: 5px;">
                        ${intervention.client?.nom || 'N/A'}
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            Rapport généré le ${formatDate(new Date())} à ${formatTime(new Date())}
        </div>
    </body>
    </html>
    `;
}

// ================================
// FONCTIONS UTILITAIRES MANQUANTES
// ================================
function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    return field ? field.value : '';
}

function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.value = value || '';
    }
}

function setElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

function showNotification(message, type = 'info') {
    console.log(`📢 Notification ${type}: ${message}`);

    // Créer le conteneur de notifications s'il n'existe pas
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const content = document.createElement('div');
    content.className = 'notification-content';

    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const icon = document.createElement('span');
    icon.className = 'notification-icon';
    icon.textContent = iconMap[type] || 'ℹ️';

    const messageEl = document.createElement('span');
    messageEl.className = 'notification-message';
    messageEl.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => notification.remove();

    content.appendChild(icon);
    content.appendChild(messageEl);
    content.appendChild(closeBtn);
    notification.appendChild(content);

    container.appendChild(notification);

    // Auto-remove après 5 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function showConfirmationModal(title, message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

function initializeSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#218085';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            ctx.beginPath();
        }
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Support tactile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
}

function clearSignature() {
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
        hideSignatureSaved();
    }
}

function saveSignature() {
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
        signatureData = canvas.toDataURL();
        showSignatureSaved();
        showNotification('Signature sauvegardée', 'success');
    }
}

function showSignatureSaved() {
    const saved = document.getElementById('signature-saved');
    if (saved) {
        saved.classList.add('show');
        saved.style.display = 'block';
    }
}

function hideSignatureSaved() {
    const saved = document.getElementById('signature-saved');
    if (saved) {
        saved.classList.remove('show');
        saved.style.display = 'none';
    }
}

function initializeEventListeners() {
    console.log('🔧 Initialisation des event listeners');

    // Listeners pour les photos (placeholder)
    const photoInputs = document.querySelectorAll('input[type="file"]');
    photoInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            // Gestion des photos à implémenter
            console.log('Photo sélectionnée:', e.target.files);
        });
    });

    console.log('✅ Event listeners initialisés');
}

function displayAllPhotos() {
    // Fonction placeholder pour l'affichage des photos
    console.log('📸 Affichage des photos:', photos.length);
}

function updateRapportStats() {
    // Mise à jour des statistiques du rapport
    const photoCount = document.getElementById('photo-count');
    const signatureStatus = document.getElementById('signature-status');

    if (photoCount) {
        photoCount.textContent = photos.length;
    }

    if (signatureStatus) {
        signatureStatus.textContent = signatureData ? 'Signée' : 'Non signée';
    }
}

function loadParametres() {
    // Charger les paramètres
    console.log('⚙️ Chargement des paramètres');
}

