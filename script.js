// IndaiaFibra App - Complete Implementation with Enhanced Features
// PWA SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification();
            }
          });
        });
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// PWA Install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  // Create install button if it doesn't exist
  if (!document.getElementById('install-button')) {
    const installButton = document.createElement('button');
    installButton.id = 'install-button';
    installButton.innerHTML = '📱 Instalar App';
    installButton.className = 'install-btn';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.remove();
      }
    });
    
    document.body.appendChild(installButton);
  }
}

function showUpdateNotification() {
  const updateNotification = document.createElement('div');
  updateNotification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 1001;
      max-width: 300px;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">Nova versão disponível!</div>
      <div style="font-size: 14px; margin-bottom: 12px;">Recarregue a página para obter as últimas atualizações.</div>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #10b981;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
      ">Recarregar</button>
    </div>
  `;
  document.body.appendChild(updateNotification);
  
  // Auto remove after 10 seconds
  setTimeout(() => {
    updateNotification.remove();
  }, 10000);
}

// All original functions preserved and enhanced

// Global variables
let map, marker;
let mapManutencao, markerManutencao;
let mapCTOs;

let materiais = JSON.parse(localStorage.getItem('materiais')) || [];
let historico = JSON.parse(localStorage.getItem('historico')) || [];
let contadorMensal = parseInt(localStorage.getItem('contadorMensal')) || 0;
let currentFilter = 'todos';

// Enhanced variables for new features
let isOnline = navigator.onLine;
let db;
let html5QrCode;
let isDarkMode = false;
let currentTheme = 'light';
let swipeStartX = 0;
let swipeStartY = 0;
let currentTab = 'instalacao';
let personalizedSettings = {};

// Current location data for Google Maps link
let currentLocation = {
  lat: null,
  lng: null,
  address: ''
};

// Telegram group link
const TELEGRAM_GROUP_LINK = 'https://t.me/+SEU_LINK_DO_GRUPO_AQUI';

// Maximum history records to prevent localStorage overflow
const MAX_HISTORY_RECORDS = 100;

// Constants for new features
const CACHE_NAME = 'indaiafibra-v1';
const DB_NAME = 'IndaiaFibraDB';
const DB_VERSION = 1;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  try {
    // Initialize core systems (enhanced)
    initializeNavigation();
    initializeDarkMode();
    initializeNotifications();
    initializeGestures();
    initializeHapticFeedback();
    
    // Initialize original systems with delay for proper loading
    setTimeout(() => {
      initializeMap();
      initializeMapManutencao();
      initializeMapCTOs();
    }, 500);
    
    initializeSignalInputs();
    initializeFormHandlers();
    initializeMateriais();
    initializeHistorico();
    initializeAddressSearch();
    
    // Initialize enhanced features
    initializeReports();
    initializeSettings();
    initializePhotoCapture();
    initializeQRScanner();
    
    // Update UI
    updateContador();
    updateOnlineStatus();
    renderAllSections();
    
    // Setup offline/online listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    console.log('IndaiaFibra App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('Erro ao inicializar o aplicativo', 'error');
  }
}

// SIGNAL INPUT MASK IMPLEMENTATION
function initializeSignalInputs() {
  const sinalCTO = document.getElementById('sinalCTO');
  const sinalCliente = document.getElementById('sinalCliente');
  
  if (sinalCTO) {
    sinalCTO.addEventListener("input", function(e) {
      applySignalMask(e.target);
    });

    sinalCTO.addEventListener("blur", function() {
      validateSignalDifference();
    });

    sinalCTO.addEventListener("keypress", function(e) {
      if (!isValidSignalKey(e)) {
        e.preventDefault();
      }
    });
  }

  if (sinalCliente) {
    sinalCliente.addEventListener("input", function(e) {
      applySignalMask(e.target);
    });

    sinalCliente.addEventListener("blur", function() {
      validateSignalDifference();
    });

    sinalCliente.addEventListener("keypress", function(e) {
      if (!isValidSignalKey(e)) {
        e.preventDefault();
      }
    });
  }
}

function applySignalMask(input) {
  let value = input.value.replace(/[^0-9,-]/g, '');
  
  // Ensure it starts with minus sign
  if (value && !value.startsWith('-')) {
    value = '-' + value;
  }
  
  // Remove extra minus signs
  value = value.replace(/(?!^)-/g, '');
  
  // Apply mask format -00,00
  if (value.length > 1) {
    let numbers = value.substring(1).replace(/[^0-9]/g, '');
    
    if (numbers.length > 0) {
      if (numbers.length === 1) {
        value = '-' + numbers;
      } else if (numbers.length === 2) {
        value = '-' + numbers;
      } else if (numbers.length === 3) {
        value = '-' + numbers.substring(0, 2) + ',' + numbers.substring(2);
      } else if (numbers.length >= 4) {
        value = '-' + numbers.substring(0, 2) + ',' + numbers.substring(2, 4);
      }
    }
  }
  
  input.value = value;
}

function isValidSignalKey(e) {
  const char = String.fromCharCode(e.which);
  const allowedChars = '0123456789,-';
  
  // Allow control keys
  if (e.which === 8 || e.which === 9 || e.which === 37 || e.which === 39 || e.which === 46) {
    return true;
  }
  
  return allowedChars.includes(char);
}

// SIGNAL VALIDATION FUNCTION
function validateSignalDifference() {
  const sinalCTO = document.getElementById('sinalCTO');
  const sinalCliente = document.getElementById('sinalCliente');
  
  if (!sinalCTO || !sinalCliente) return;
  
  const ctoValue = parseSignalValue(sinalCTO.value);
  const clienteValue = parseSignalValue(sinalCliente.value);
  
  // Reset styles first
  sinalCTO.classList.remove('error', 'signal-attenuated');
  sinalCliente.classList.remove('error', 'signal-attenuated');
  
  if (ctoValue !== null && clienteValue !== null) {
    const difference = Math.abs(ctoValue - clienteValue);
    
    if (difference > 2) {
      // Add error styling to both inputs
      sinalCTO.classList.add('error', 'signal-attenuated');
      sinalCliente.classList.add('error', 'signal-attenuated');
      
      // Show toast warning
      showToast('⚠️ Sinal atenuado - Diferença maior que 2 dBm', 'warning');
      
      // Haptic feedback
      vibrate(100);
    }
  }
}

function parseSignalValue(value) {
  if (!value || value === '-') return null;
  
  // Remove minus sign and comma, convert to number
  const cleanValue = value.replace('-', '').replace(',', '.');
  const numValue = parseFloat(cleanValue);
  
  if (isNaN(numValue)) return null;
  
  // Return as negative value (since signals are negative)
  return -numValue;
}

// ORIGINAL NAVIGATION SYSTEM (preserved)
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(targetTab) {
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Update active nav item
  navItems.forEach(nav => nav.classList.remove('active'));
  document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
  
  // Update active tab content
  tabContents.forEach(content => {
    content.classList.add('hidden');
    content.classList.remove('fade-in');
  });
  
  const targetContent = document.getElementById(targetTab);
  if (targetContent) {
    targetContent.classList.remove('hidden');
    setTimeout(() => {
      targetContent.classList.add('fade-in');
    }, 50);
  }
  
  currentTab = targetTab;
  
  // Trigger specific tab initialization if needed
  if (targetTab === 'relatorios') {
    updateReports();
  } else if (targetTab === 'mapa') {
    setTimeout(() => {
      if (mapCTOs) mapCTOs.invalidateSize();
    }, 100);
  }
}

// ENHANCED ADDRESS SEARCH FUNCTIONALITY
function initializeAddressSearch() {
  const enderecoInput = document.getElementById('endereco');
  const suggestionsContainer = document.getElementById('enderecoSuggestions');
  
  if (enderecoInput && suggestionsContainer) {
    enderecoInput.addEventListener('input', debounce(function(event) {
      const target = event.target || this;
      const query = target.value ? target.value.trim() : '';
      if (query.length > 2) {
        searchAddress(query, suggestionsContainer, (place) => {
          enderecoInput.value = place.display_name;
          suggestionsContainer.innerHTML = '';
          suggestionsContainer.classList.remove('show');
          
          // Update current location data
          currentLocation.lat = parseFloat(place.lat);
          currentLocation.lng = parseFloat(place.lon);
          currentLocation.address = place.display_name;
          
          // Update map for installation
          updateMapLocation(currentLocation.lat, currentLocation.lng, 'instalacao');
          
          showToast('📍 Localização encontrada e atualizada no mapa!', 'success');
          vibrate(50);
        });
      } else {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
      }
    }, 300));
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
      if (!enderecoInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.classList.remove('show');
      }
    });
  }
  
  // Initialize maintenance address search
  const enderecoManutencaoInput = document.getElementById('enderecoManutencao');
  const suggestionsManutencaoContainer = document.getElementById('enderecoManutencaoSuggestions');
  
  if (enderecoManutencaoInput && suggestionsManutencaoContainer) {
    enderecoManutencaoInput.addEventListener('input', debounce(function(event) {
      const target = event.target || this;
      const query = target.value ? target.value.trim() : '';
      if (query.length > 2) {
        searchAddress(query, suggestionsManutencaoContainer, (place) => {
          enderecoManutencaoInput.value = place.display_name;
          suggestionsManutencaoContainer.innerHTML = '';
          suggestionsManutencaoContainer.classList.remove('show');
          
          // Update current location data
          currentLocation.lat = parseFloat(place.lat);
          currentLocation.lng = parseFloat(place.lon);
          currentLocation.address = place.display_name;
          
          // Update map for maintenance
          updateMapLocation(currentLocation.lat, currentLocation.lng, 'manutencao');
          
          showToast('📍 Localização encontrada e atualizada no mapa!', 'success');
          vibrate(50);
        });
      } else {
        suggestionsManutencaoContainer.innerHTML = '';
        suggestionsManutencaoContainer.classList.remove('show');
      }
    }, 300));
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
      if (!enderecoManutencaoInput.contains(e.target) && !suggestionsManutencaoContainer.contains(e.target)) {
        suggestionsManutencaoContainer.classList.remove('show');
      }
    });
  }
}

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(event) {
    const context = this;
    const args = arguments;
    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Enhanced address search function with better UI
async function searchAddress(query, container, callback) {
  try {
    // Show loading state
    container.innerHTML = '<div class="suggestion-item loading">🔍 Buscando endereços...</div>';
    container.classList.add('show');
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    container.innerHTML = '';
    
    if (data.length === 0) {
      const div = document.createElement('div');
      div.className = 'suggestion-item no-results';
      div.innerHTML = `
        <div class="suggestion-content">
          <div class="suggestion-title">❌ Nenhum resultado encontrado</div>
          <div class="suggestion-subtitle">Tente um termo de busca diferente</div>
        </div>
      `;
      container.appendChild(div);
      container.classList.add('show');
      return;
    }
    
    data.forEach(place => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      
      // Extract street name and city for better display
      const addressParts = place.display_name.split(',');
      const streetName = addressParts[0].trim();
      const cityInfo = addressParts.slice(1, 3).join(',').trim();
      
      div.innerHTML = `
        <div class="suggestion-content">
          <div class="suggestion-title">📍 ${streetName}</div>
          <div class="suggestion-subtitle">${cityInfo}</div>
        </div>
      `;
      
      div.addEventListener('click', function() {
        callback(place);
        vibrate(30); // Haptic feedback
      });
      
      container.appendChild(div);
    });
    
    container.classList.add('show');
  } catch (error) {
    console.error('Error searching address:', error);
    container.innerHTML = `
      <div class="suggestion-item error">
        <div class="suggestion-content">
          <div class="suggestion-title">⚠️ Erro na busca</div>
          <div class="suggestion-subtitle">Verifique sua conexão e tente novamente</div>
        </div>
      </div>
    `;
    container.classList.add('show');
  }
}

// Function to update map location
function updateMapLocation(lat, lng, type) {
  if (type === 'instalacao' && map) {
    map.setView([lat, lng], 18);
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
  } else if (type === 'manutencao' && mapManutencao) {
    mapManutencao.setView([lat, lng], 18);
    if (markerManutencao) {
      markerManutencao.setLatLng([lat, lng]);
    } else {
      markerManutencao = L.marker([lat, lng]).addTo(mapManutencao);
    }
  }
}

// ORIGINAL MAP INITIALIZATION (preserved and enhanced)
function initializeMap() {
  const mapContainer = document.getElementById('mapInstalacao');
  const loadingOverlay = document.getElementById('mapInstalacaoLoading');
  
  if (!mapContainer) return;
  
  try {
    if (loadingOverlay) loadingOverlay.classList.add('show');
    
    // Clear any existing map
    if (map) {
      map.remove();
      map = null;
    }
    
    map = L.map(mapContainer, {
      center: [-23.5505, -46.6333],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Hide loading overlay after map loads
    map.whenReady(function() {
      if (loadingOverlay) {
        setTimeout(() => {
          loadingOverlay.classList.remove('show');
        }, 500);
      }
    });

    // ADD CLICK EVENT TO MAP FOR ADDRESS UPDATE
    map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Update current location data
      currentLocation.lat = lat;
      currentLocation.lng = lng;
      
      // Update or add marker
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      
      // Reverse geocoding to get address and update input
      reverseGeocodeAndUpdateInput(lat, lng, 'endereco');
      
      vibrate(30); // Haptic feedback
      showToast('📍 Localização atualizada no mapa!', 'success');
    });

    const usarLocalizacaoBtn = document.getElementById('usarLocalizacao');
    if (usarLocalizacaoBtn) {
      usarLocalizacaoBtn.addEventListener('click', function() {
        vibrate(50); // Haptic feedback
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Update current location data
            currentLocation.lat = lat;
            currentLocation.lng = lon;
            
            map.setView([lat, lon], 18);
            if (marker) {
              marker.setLatLng([lat, lon]);
            } else {
              marker = L.marker([lat, lon]).addTo(map);
            }
            
            // Reverse geocoding to get address
            reverseGeocode(lat, lon);
            
            showToast('Localização obtida com sucesso!', 'success');
          }, function(error) {
            console.error('Geolocation error:', error);
            showToast('Erro ao obter localização', 'error');
          });
        } else {
          showToast('Geolocalização não suportada', 'error');
        }
      });
    }
  } catch (error) {
    console.error('Error initializing map:', error);
    if (loadingOverlay) loadingOverlay.classList.remove('show');
    showToast('Erro ao carregar mapa', 'error');
  }
}

// Reverse geocoding to get address from coordinates and update input
async function reverseGeocodeAndUpdateInput(lat, lon, inputId) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.display_name) {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = data.display_name;
        currentLocation.address = data.display_name;
      }
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
  }
}

// Reverse geocoding to get address from coordinates
async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.display_name) {
      currentLocation.address = data.display_name;
      const enderecoInput = document.getElementById('endereco');
      if (enderecoInput) {
        enderecoInput.value = data.display_name;
      }
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
  }
}

function initializeMapManutencao() {
  const mapContainer = document.getElementById('mapManutencao');
  const loadingOverlay = document.getElementById('mapManutencaoLoading');
  
  if (!mapContainer) return;
  
  try {
    if (loadingOverlay) loadingOverlay.classList.add('show');
    
    // Clear any existing map
    if (mapManutencao) {
      mapManutencao.remove();
      mapManutencao = null;
    }
    
    mapManutencao = L.map(mapContainer, {
      center: [-23.5505, -46.6333],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapManutencao);
    
    mapManutencao.whenReady(function() {
      if (loadingOverlay) {
        setTimeout(() => {
          loadingOverlay.classList.remove('show');
        }, 500);
      }
    });

    // ADD CLICK EVENT TO MAP FOR ADDRESS UPDATE
    mapManutencao.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Update current location data
      currentLocation.lat = lat;
      currentLocation.lng = lng;
      
      // Update or add marker
      if (markerManutencao) {
        markerManutencao.setLatLng([lat, lng]);
      } else {
        markerManutencao = L.marker([lat, lng]).addTo(mapManutencao);
      }
      
      // Reverse geocoding to get address and update input
      reverseGeocodeAndUpdateInput(lat, lng, 'enderecoManutencao');
      
      vibrate(30); // Haptic feedback
      showToast('📍 Localização atualizada no mapa!', 'success');
    });

    const usarLocalizacaoManutencaoBtn = document.getElementById('usarLocalizacaoManutencao');
    if (usarLocalizacaoManutencaoBtn) {
      usarLocalizacaoManutencaoBtn.addEventListener('click', function() {
        vibrate(50); // Haptic feedback
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Update current location data
            currentLocation.lat = lat;
            currentLocation.lng = lon;
            
            mapManutencao.setView([lat, lon], 18);
            if (markerManutencao) {
              markerManutencao.setLatLng([lat, lon]);
            } else {
              markerManutencao = L.marker([lat, lon]).addTo(mapManutencao);
            }
            
            // Reverse geocoding to get address
            reverseGeocodeManutencao(lat, lon);
            
            showToast('Localização obtida com sucesso!', 'success');
          }, function(error) {
            console.error('Geolocation error:', error);
            showToast('Erro ao obter localização', 'error');
          });
        } else {
          showToast('Geolocalização não suportada', 'error');
        }
      });
    }
  } catch (error) {
    console.error('Error initializing maintenance map:', error);
    if (loadingOverlay) loadingOverlay.classList.remove('show');
    showToast('Erro ao carregar mapa de manutenção', 'error');
  }
}

async function reverseGeocodeManutencao(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.display_name) {
      currentLocation.address = data.display_name;
      const enderecoInput = document.getElementById('enderecoManutencao');
      if (enderecoInput) {
        enderecoInput.value = data.display_name;
      }
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
  }
}

function initializeMapCTOs() {
  const mapContainer = document.getElementById('mapaCTOs');
  if (!mapContainer) return;
  
  try {
    // Clear any existing map
    if (mapCTOs) {
      mapCTOs.remove();
      mapCTOs = null;
    }
    
    mapCTOs = L.map(mapContainer, {
      center: [-23.5505, -46.6333],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapCTOs);

    const openGoogleMapsBtn = document.getElementById('openGoogleMaps');
    if (openGoogleMapsBtn) {
      openGoogleMapsBtn.addEventListener('click', function() {
        vibrate(50); // Haptic feedback
        window.open('https://goo.gl/maps/PBT7J31XKdRRZgRv6?g_st=ac', '_blank');
      });
    }
  } catch (error) {
    console.error('Error initializing CTOs map:', error);
    showToast('Erro ao carregar mapa de CTOs', 'error');
  }
}

// ORIGINAL FORM SUBMISSION HANDLERS (enhanced with clipboard functionality)
function initializeFormHandlers() {
  const formInstalacao = document.getElementById('formInstalacao');
  const formManutencao = document.getElementById('formManutencao');

  if (formInstalacao) {
    formInstalacao.addEventListener('submit', function(e) {
      e.preventDefault();
      vibrate(100); // Haptic feedback
      enviarTelegram('instalacao');
    });
  }

  if (formManutencao) {
    formManutencao.addEventListener('submit', function(e) {
      e.preventDefault();
      vibrate(100); // Haptic feedback
      enviarTelegram('manutencao');
    });
  }
}

// Function to extract simplified address (street name, number, neighborhood)
function extractSimplifiedAddress(fullAddress) {
  if (!fullAddress) return '';
  
  // Split the address by commas
  const parts = fullAddress.split(',').map(part => part.trim());
  
  if (parts.length === 0) return fullAddress;
  
  // Extract relevant parts: usually the first 3 parts contain street name, number, and neighborhood
  // Format: "Street Name, Number, Neighborhood" or similar variations
  let simplifiedParts = [];
  
  // Take the first part (usually contains street name and number)
  if (parts[0]) {
    simplifiedParts.push(parts[0]);
  }
  
  // Look for neighborhood in the next few parts
  // Skip very generic terms and look for actual neighborhood names
  for (let i = 1; i < Math.min(parts.length, 4); i++) {
    const part = parts[i];
    // Skip very generic location terms
    if (!part.match(/(região|estado|país|brasil|brazil|cep|zip)/i) && 
        !part.match(/^\d{5}-?\d{3}$/) && // Skip ZIP codes
        part.length > 2) {
      simplifiedParts.push(part);
      break; // Take only the first relevant neighborhood/area
    }
  }
  
  return simplifiedParts.join(', ');
}

// ENHANCED TELEGRAM MESSAGE SENDING WITH CLIPBOARD FUNCTIONALITY
async function enviarTelegram(tipo) {
  let mensagem = '';
  let form, data;

  if (tipo === 'instalacao') {
    form = document.getElementById('formInstalacao');
    data = new FormData(form);
    const materiaisSelecionados = getMaterialsSelecionados('materiaisSelecionaveis');
    
    // Enhanced message format as requested
    mensagem = `📡 **Registro de Instalação - IndaiaFibra**\n\n`;
    mensagem += `🔧 **Tipo de Trabalho:** ${data.get('tipoTrabalho')}\n`;
    mensagem += `👨‍🔧 **Técnico:** ${data.get('tecnico')}\n`;
    mensagem += `🙍 **Cliente:** ${data.get('cliente')}\n`;
    mensagem += `🧰 **CTO:** ${data.get('cto')}\n`;
    mensagem += `🔌 **Porta:** ${data.get('porta')}\n`;
    mensagem += `📶 **Sinal CTO:** ${data.get('sinalCTO')} dBm\n`;
    mensagem += `📶 **Sinal Cliente:** ${data.get('sinalCliente')} dBm\n`;
    
    if (materiaisSelecionados.length > 0) {
      mensagem += `\n📦 **Materiais Utilizados:**\n`;
      materiaisSelecionados.forEach(m => {
        mensagem += `• ${m.nome}: ${m.quantidade}\n`;
      });
    }

    mensagem += `\n📍**Localização:**\n`;
    const simplifiedAddress = extractSimplifiedAddress(data.get('endereco'));
    mensagem += `${simplifiedAddress}`;
    
    // Add Google Maps link if location is available
    if (currentLocation.lat && currentLocation.lng) {
      mensagem += `, https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
    }

    // Update stock
    materiaisSelecionados.forEach(m => {
      const material = materiais.find(mat => mat.nome === m.nome);
      if (material) {
        material.quantidade -= m.quantidade;
      }
    });
    localStorage.setItem('materiais', JSON.stringify(materiais));
    renderMateriais();
    renderMateriaisSelecionaveis();
    renderMateriaisManutencao();

    // Add to history
    const registro = {
      id: Date.now(),
      tipo: 'instalacao',
      tipoTrabalho: data.get('tipoTrabalho'),
      tecnico: data.get('tecnico'),
      cliente: data.get('cliente'),
      cto: data.get('cto'),
      porta: data.get('porta'),
      sinalCTO: data.get('sinalCTO'),
      sinalCliente: data.get('sinalCliente'),
      endereco: data.get('endereco'),
      materiais: materiaisSelecionados,
      data: new Date().toLocaleDateString('pt-BR'),
      latitude: currentLocation.lat,
      longitude: currentLocation.lng
    };
    historico.unshift(registro);
    if (historico.length > MAX_HISTORY_RECORDS) {
      historico.pop();
    }
    localStorage.setItem('historico', JSON.stringify(historico));
    renderHistorico();
    updateContador();

  } else if (tipo === 'manutencao') {
    form = document.getElementById('formManutencao');
    data = new FormData(form);
    const materiaisSelecionados = getMaterialsSelecionados('materiaisManutencao');

    mensagem = `🔧 **Registro de Manutenção - IndaiaFibra**\n\n`;
    mensagem += `👨‍🔧 **Técnico:** ${data.get('tecnicoManutencao')}\n`;
    mensagem += `🙍 **Cliente:** ${data.get('clienteManutencao')}\n`;
    mensagem += `⚠️ **Descrição do Problema:** ${data.get('problemaDescricao')}\n`;
    mensagem += `✅ **Solução Aplicada:** ${data.get('solucaoAplicada')}\n`;

    if (materiaisSelecionados.length > 0) {
      mensagem += `\n📦 **Materiais Utilizados:**\n`;
      materiaisSelecionados.forEach(m => {
        mensagem += `• ${m.nome}: ${m.quantidade}\n`;
      });
    }

    mensagem += `\n📍**Localização:**\n`;
    const simplifiedAddress = extractSimplifiedAddress(data.get('enderecoManutencao'));
    mensagem += `${simplifiedAddress}`;
    
    // Add Google Maps link if location is available
    if (currentLocation.lat && currentLocation.lng) {
      mensagem += `, https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
    }

    // Update stock
    materiaisSelecionados.forEach(m => {
      const material = materiais.find(mat => mat.nome === m.nome);
      if (material) {
        material.quantidade -= m.quantidade;
      }
    });
    localStorage.setItem('materiais', JSON.stringify(materiais));
    renderMateriais();
    renderMateriaisSelecionaveis();
    renderMateriaisManutencao();

    // Add to history
    const registro = {
      id: Date.now(),
      tipo: 'manutencao',
      tecnico: data.get('tecnicoManutencao'),
      cliente: data.get('clienteManutencao'),
      problema: data.get('problemaDescricao'),
      solucao: data.get('solucaoAplicada'),
      endereco: data.get('enderecoManutencao'),
      materiais: materiaisSelecionados,
      data: new Date().toLocaleDateString('pt-BR'),
      latitude: currentLocation.lat,
      longitude: currentLocation.lng
    };
    historico.unshift(registro);
    if (historico.length > MAX_HISTORY_RECORDS) {
      historico.pop();
    }
    localStorage.setItem('historico', JSON.stringify(historico));
    renderHistorico();
  }

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(mensagem);
    showToast('✅ Mensagem copiada! Redirecionando para o Telegram...', 'success');
    
    // Reset form
    form.reset();
    
    // Reset location data
    currentLocation = { lat: null, lng: null, address: '' };
    
    // Redirect to Telegram after a short delay
    setTimeout(() => {
      window.open('https://t.me/c/1989058391/38071', '_blank');
    }, 1500);
    
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = mensagem;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('✅ Mensagem copiada! Redirecionando para o Telegram...', 'success');
      
      // Reset form
      form.reset();
      
      // Reset location data
      currentLocation = { lat: null, lng: null, address: '' };
      
      // Redirect to Telegram after a short delay
      setTimeout(() => {
        window.open('https://t.me/c/1989058391/38071', '_blank');
      }, 1500);
      
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      showToast('❌ Erro ao copiar mensagem', 'error');
    }
    document.body.removeChild(textArea);
  }
}

// ORIGINAL MATERIALS MANAGEMENT (preserved)
function initializeMateriais() {
  renderMateriais();
  renderMateriaisSelecionaveis();
  renderMateriaisManutencao();

  const adicionarMaterialBtn = document.getElementById('adicionarMaterial');
  if (adicionarMaterialBtn) {
    adicionarMaterialBtn.addEventListener('click', function() {
      vibrate(50); // Haptic feedback
      const nome = document.getElementById('nomeMaterial').value.trim();
      const quantidade = parseInt(document.getElementById('qtdMaterial').value);

      if (nome && quantidade > 0) {
        materiais.push({ id: Date.now(), nome: nome, quantidade: quantidade });
        localStorage.setItem('materiais', JSON.stringify(materiais));
        renderMateriais();
        renderMateriaisSelecionaveis();
        renderMateriaisManutencao();
        document.getElementById('nomeMaterial').value = '';
        document.getElementById('qtdMaterial').value = '';
        showToast('Material adicionado com sucesso!', 'success');
        
        // Update reports if on reports tab
        if (currentTab === 'relatorios') {
          updateReports();
        }
      } else {
        showToast('Por favor, preencha o nome e a quantidade do material.', 'error');
      }
    });
  }
}

function renderMateriais() {
  const container = document.getElementById('listaMateriais');
  if (!container) return;
  
  container.innerHTML = '';
  materiais.forEach(material => {
    const div = document.createElement('div');
    div.className = 'material-item';
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="material-display">
          <span class="font-semibold">${material.nome}</span>
          <span class="text-sm" style="color: var(--text-muted)"> - ${material.quantidade} em estoque</span>
        </div>
        <div class="material-edit hidden">
          <div class="edit-controls">
            <div class="edit-input-group">
              <label class="text-xs">Nome</label>
              <input type="text" class="edit-input" value="${material.nome}" placeholder="Nome do material">
            </div>
            <div class="edit-input-group">
              <label class="text-xs">Quantidade</label>
              <input type="number" class="edit-input" value="${material.quantidade}" min="0" placeholder="Quantidade">
            </div>
            <div class="edit-buttons">
              <button onclick="saveMaterial(${material.id})" class="btn btn-success">
                <i class="fas fa-save"></i> Salvar
              </button>
              <button onclick="cancelEditMaterial(${material.id})" class="btn btn-ghost">
                <i class="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="editMaterial(${material.id})" class="btn btn-warning edit-btn-material" style="padding: 8px 12px; min-height: auto;">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="removerMaterial(${material.id})" class="btn btn-danger" style="padding: 8px 12px; min-height: auto;">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function editMaterial(id) {
  vibrate(30); // Haptic feedback
  const materialItem = document.querySelector(`[onclick="editMaterial(${id})"]`).closest('.material-item');
  const displayDiv = materialItem.querySelector('.material-display');
  const editDiv = materialItem.querySelector('.material-edit');
  
  displayDiv.classList.add('hidden');
  editDiv.classList.remove('hidden');
  materialItem.classList.add('edit-mode');
}

function cancelEditMaterial(id) {
  vibrate(30); // Haptic feedback
  const materialItem = document.querySelector(`[onclick="cancelEditMaterial(${id})"]`).closest('.material-item');
  const displayDiv = materialItem.querySelector('.material-display');
  const editDiv = materialItem.querySelector('.material-edit');
  
  displayDiv.classList.remove('hidden');
  editDiv.classList.add('hidden');
  materialItem.classList.remove('edit-mode');
}

function saveMaterial(id) {
  vibrate(50); // Haptic feedback
  const materialItem = document.querySelector(`[onclick="saveMaterial(${id})"]`).closest('.material-item');
  const inputs = materialItem.querySelectorAll('.edit-input');
  const nome = inputs[0].value.trim();
  const quantidade = parseInt(inputs[1].value);
  
  if (nome && quantidade >= 0) {
    const materialIndex = materiais.findIndex(m => m.id === id);
    if (materialIndex !== -1) {
      materiais[materialIndex].nome = nome;
      materiais[materialIndex].quantidade = quantidade;
      localStorage.setItem('materiais', JSON.stringify(materiais));
      
      renderMateriais();
      renderMateriaisSelecionaveis();
      renderMateriaisManutencao();
      
      // Update reports if on reports tab
      if (currentTab === 'relatorios') {
        updateReports();
      }
      
      showToast('Material atualizado com sucesso!', 'success');
    }
  } else {
    showToast('Por favor, preencha todos os campos corretamente.', 'error');
  }
}

// OPTIMIZED Materials selection - COMPACT DESIGN WITHOUT VISIBLE CHECKBOXES (preserved)
function renderMateriaisSelecionaveis() {
  const container = document.getElementById('materiaisSelecionaveis');
  if (!container) return;
  
  container.innerHTML = '';
  
  materiais.forEach(material => {
    const div = document.createElement('div');
    div.className = 'material-item';
    div.innerHTML = `
      <input type="checkbox" name="material_${material.id}" value="${material.id}" class="material-checkbox">
      <div class="material-content">
        <div class="material-info">
          <div class="material-name">${material.nome}</div>
          <div class="material-stock">Disponível: ${material.quantidade}</div>
        </div>
        <div class="material-quantity-container">
          <span class="material-quantity-label">Qtd:</span>
          <input type="number" name="qtd_${material.id}" value="" min="0" max="${material.quantidade}" 
                 class="material-quantity-input" data-material-id="${material.id}">
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  // Add change events to quantity inputs for auto-selection
  container.querySelectorAll('.material-quantity-input').forEach(input => {
    input.addEventListener('input', function() {
      const materialId = this.getAttribute('data-material-id');
      const checkbox = document.querySelector(`input[name="material_${materialId}"]`);
      const quantity = parseInt(this.value) || 0;
      
      // Auto-select if quantity > 0, unselect if quantity = 0
      checkbox.checked = quantity > 0;
      
      // Update material item visual state
      const materialItem = this.closest('.material-item');
      if (quantity > 0) {
        materialItem.classList.add('selected');
      } else {
        materialItem.classList.remove('selected');
      }
    });
  });
}

function renderMateriaisManutencao() {
  const container = document.getElementById('materiaisManutencao');
  if (!container) return;
  
  container.innerHTML = '';
  
  materiais.forEach(material => {
    const div = document.createElement('div');
    div.className = 'material-item';
    div.innerHTML = `
      <input type="checkbox" name="material_manutencao_${material.id}" value="${material.id}" class="material-checkbox">
      <div class="material-content">
        <div class="material-info">
          <div class="material-name">${material.nome}</div>
          <div class="material-stock">Disponível: ${material.quantidade}</div>
        </div>
        <div class="material-quantity-container">
          <span class="material-quantity-label">Qtd:</span>
          <input type="number" name="qtd_manutencao_${material.id}" value="" min="0" max="${material.quantidade}" 
                 class="material-quantity-input" data-material-id="${material.id}">
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  // Add change events to quantity inputs for auto-selection
  container.querySelectorAll('.material-quantity-input').forEach(input => {
    input.addEventListener('input', function() {
      const materialId = this.getAttribute('data-material-id');
      const checkbox = document.querySelector(`input[name="material_manutencao_${materialId}"]`);
      const quantity = parseInt(this.value) || 0;
      
      // Auto-select if quantity > 0, unselect if quantity = 0
      checkbox.checked = quantity > 0;
      
      // Update material item visual state
      const materialItem = this.closest('.material-item');
      if (quantity > 0) {
        materialItem.classList.add('selected');
      } else {
        materialItem.classList.remove('selected');
      }
    });
  });
}

function removerMaterial(id) {
  if (confirm('Tem certeza que deseja remover este material?')) {
    vibrate(100); // Haptic feedback
    materiais = materiais.filter(m => m.id !== id);
    localStorage.setItem('materiais', JSON.stringify(materiais));
    renderMateriais();
    renderMateriaisSelecionaveis();
    renderMateriaisManutencao();
    
    // Update reports if on reports tab
    if (currentTab === 'relatorios') {
      updateReports();
    }
    
    showToast('Material removido com sucesso!', 'success');
  }
}

function getMaterialsSelecionados(containerId) {
  const selecionados = [];
  const prefix = containerId === 'materiaisManutencao' ? 'material_manutencao_' : 'material_';
  const qtdPrefix = containerId === 'materiaisManutencao' ? 'qtd_manutencao_' : 'qtd_';
  const checkboxes = document.querySelectorAll(`input[name^="${prefix}"]:checked`);
  
  checkboxes.forEach(checkbox => {
    const materialId = parseInt(checkbox.value);
    const qtdInput = document.querySelector(`input[name="${qtdPrefix}${materialId}"]`);
    const material = materiais.find(m => m.id === materialId);
    
    if (material && qtdInput) {
      const quantidade = parseInt(qtdInput.value) || 0;
      if (quantidade > 0) {
        selecionados.push({
          nome: material.nome,
          quantidade: quantidade
        });
      }
    }
  });
  
  return selecionados;
}

// ORIGINAL HISTORY MANAGEMENT (preserved)
function initializeHistorico() {
  renderHistorico();
  
  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      vibrate(30); // Haptic feedback
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      renderHistorico();
    });
  });
  
  const searchHistorico = document.getElementById('searchHistorico');
  if (searchHistorico) {
    searchHistorico.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      filterHistorico(searchTerm);
    });
  }
  
  const limparHistoricoBtn = document.getElementById('limparHistorico');
  if (limparHistoricoBtn) {
    limparHistoricoBtn.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        vibrate(100); // Haptic feedback
        historico = [];
        localStorage.setItem('historico', JSON.stringify(historico));
        renderHistorico();
        showToast('Histórico limpo com sucesso!', 'success');
      }
    });
  }
}

function renderHistorico() {
  const container = document.getElementById('historicoInstalacoes');
  if (!container) return;
  
  container.innerHTML = '';
  
  let filteredHistorico = historico;
  
  if (currentFilter !== 'todos') {
    filteredHistorico = historico.filter(item => item.tipo === currentFilter);
  }
  
  if (filteredHistorico.length === 0) {
    container.innerHTML = '<p class="text-center" style="color: var(--text-muted)">Nenhum registro encontrado.</p>';
    return;
  }
  
  filteredHistorico.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.setAttribute('data-type', item.tipo);
    div.setAttribute('data-id', item.id);
    
    const isInstalacao = item.tipo === 'instalacao';
    const icon = isInstalacao ? 'fas fa-tools' : 'fas fa-wrench';
    const typeLabel = isInstalacao ? (item.tipoTrabalho || 'Instalação') : 'Manutenção';
    
    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <i class="${icon}" style="color: var(--secondary-color)"></i>
            <span class="text-xs px-2 py-1 rounded" style="background: var(--glass-bg); color: var(--text-secondary)">${typeLabel}</span>
          </div>
          <h3 class="font-semibold">${item.cliente}</h3>
          <p class="text-sm" style="color: var(--text-secondary)">${item.data} - ${item.tecnico}</p>
          ${isInstalacao ? 
            `<p class="text-sm" style="color: var(--text-muted)">CTO: ${item.cto} - Porta: ${item.porta}</p>` :
            `<p class="text-sm" style="color: var(--text-muted)">Problema: ${item.problema.substring(0, 50)}...</p>`
          }
        </div>
        <div class="flex items-center gap-2">
          <button onclick="deleteHistoryItem(${item.id})" class="btn btn-danger" style="padding: 6px 8px; min-height: auto;">
            <i class="fas fa-trash"></i>
          </button>
          <i class="fas fa-chevron-down chevron-rotate transition-transform duration-300"></i>
        </div>
      </div>
      <div class="history-details">
        ${isInstalacao ? renderInstalacaoDetails(item) : renderManutencaoDetails(item)}
      </div>
    `;
    
    div.addEventListener('click', function(e) {
      // Don't toggle if clicking on delete button
      if (e.target.closest('.btn-danger')) return;
      
      vibrate(30); // Haptic feedback
      
      const details = div.querySelector('.history-details');
      const chevron = div.querySelector('.chevron-rotate');
      
      if (details.classList.contains('show')) {
        details.classList.remove('show');
        chevron.classList.remove('rotated');
        div.classList.remove('expanded');
      } else {
        details.classList.add('show');
        chevron.classList.add('rotated');
        div.classList.add('expanded');
      }
    });
    
    container.appendChild(div);
  });
}

function renderInstalacaoDetails(item) {
  const mapLink = item.latitude && item.longitude ? 
    `https://www.google.com/maps?q=${item.latitude},${item.longitude}` : '#';
  
  return `
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div><strong>Tipo:</strong> ${item.tipoTrabalho}</div>
      <div><strong>CTO:</strong> ${item.cto}</div>
      <div><strong>Porta:</strong> ${item.porta}</div>
      <div><strong>Sinal CTO:</strong> ${item.sinalCTO} dBm</div>
      <div><strong>Sinal Cliente:</strong> ${item.sinalCliente} dBm</div>
      <div class="col-span-2"><strong>Endereço:</strong> ${item.endereco}</div>
      ${item.materiais && item.materiais.length > 0 ? `
        <div class="col-span-2">
          <strong>Materiais:</strong>
          <ul class="mt-1">
            ${item.materiais.map(m => `<li>• ${m.nome} (${m.quantidade})</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    <div class="history-actions">
      ${item.latitude && item.longitude ? 
        `<a href="${mapLink}" target="_blank" class="btn btn-secondary">
          <i class="fas fa-map-marker-alt mr-1"></i> Ver no Mapa
        </a>` : ''
      }
    </div>
  `;
}

function renderManutencaoDetails(item) {
  const mapLink = item.latitude && item.longitude ? 
    `https://www.google.com/maps?q=${item.latitude},${item.longitude}` : '#';
  
  return `
    <div class="grid grid-cols-1 gap-4 text-sm">
      <div><strong>Problema:</strong> ${item.problema}</div>
      <div><strong>Solução:</strong> ${item.solucao}</div>
      <div><strong>Endereço:</strong> ${item.endereco}</div>
      ${item.materiais && item.materiais.length > 0 ? `
        <div>
          <strong>Materiais Utilizados:</strong>
          <ul class="mt-1">
            ${item.materiais.map(m => `<li>• ${m.nome} (${m.quantidade})</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
    <div class="history-actions">
      ${item.latitude && item.longitude ? 
        `<a href="${mapLink}" target="_blank" class="btn btn-secondary">
          <i class="fas fa-map-marker-alt mr-1"></i> Ver no Mapa
        </a>` : ''
      }
    </div>
  `;
}

function deleteHistoryItem(id) {
  if (confirm('Tem certeza que deseja excluir este registro?')) {
    vibrate(100); // Haptic feedback
    historico = historico.filter(item => item.id !== id);
    localStorage.setItem('historico', JSON.stringify(historico));
    renderHistorico();
    showToast('Registro excluído com sucesso!', 'success');
  }
}

function filterHistorico(searchTerm) {
  const items = document.querySelectorAll('.history-item');
  
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ORIGINAL UTILITY FUNCTIONS (preserved)
function updateContador() {
  const instalacoes = historico.filter(item => item.tipo === 'instalacao').length;
  const contadorElement = document.getElementById('contadorInstalacoes');
  if (contadorElement) {
    contadorElement.textContent = `${instalacoes} instalações este mês`;
  }
}

// ENHANCED TOAST FUNCTION WITH BETTER POSITIONING
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add to body
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// ENHANCED FEATURES IMPLEMENTATION

// Dark Mode Implementation
function initializeDarkMode() {
  // Detect system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    currentTheme = prefersDark ? 'dark' : 'light';
  }
  
  applyTheme(currentTheme);
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      currentTheme = e.matches ? 'dark' : 'light';
      applyTheme(currentTheme);
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  isDarkMode = theme === 'dark';
  
  // Update theme toggle button if exists
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
   themeToggle.innerHTML = isDarkMode ?
  '<i class="fas fa-sun" style="margin-right: 5px;"></i>Modo Claro' :
  '<i class="fas fa-moon" style="margin-right: 5px;"></i>Modo Escuro';
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
  applyTheme(currentTheme);
  
  // Haptic feedback
  vibrate(50);
  
  showToast(`Modo ${currentTheme === 'dark' ? 'escuro' : 'claro'} ativado`, 'success');
}

// Notifications Implementation
async function initializeNotifications() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notifications enabled');
    }
  }
}

function showNotification(title, body, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      ...options
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
}

// Haptic Feedback Implementation (FIXED)
function initializeHapticFeedback() {
  // Add haptic feedback to all buttons and interactive elements
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn') || 
        e.target.closest('.nav-item') || 
        e.target.closest('button') ||
        e.target.closest('.material-item') ||
        e.target.closest('.history-item')) {
      vibrate(30);
    }
  });
  
  // Add haptic feedback to form interactions
  document.addEventListener('focus', (e) => {
    if (e.target.matches('input, select, textarea')) {
      vibrate(20);
    }
  });
}

function vibrate(duration = 50) {
  // Check if haptic feedback is enabled
  const hapticEnabled = localStorage.getItem('hapticEnabled') !== 'false';
  
  if (hapticEnabled && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.log('Vibration not supported or failed:', error);
    }
  }
}

// Gestures Implementation
function initializeGestures() {
  let startX, startY, startTime;
  
  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startTime = Date.now();
  });
  
  document.addEventListener('touchend', (e) => {
    if (!startX || !startY) return;
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();
    
    const diffX = startX - endX;
    const diffY = startY - endY;
    const diffTime = endTime - startTime;
    
    // Only process quick swipes
    if (diffTime > 300) return;
    
    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left - next tab
        navigateToNextTab();
      } else {
        // Swipe right - previous tab
        navigateToPrevTab();
      }
      vibrate(30);
    }
    
    // Reset
    startX = startY = null;
  });
}

function navigateToNextTab() {
  const tabs = ['instalacao', 'manutencao', 'materiais', 'historico', 'mapa', 'relatorios', 'configuracoes'];
  const currentIndex = tabs.indexOf(currentTab);
  const nextIndex = (currentIndex + 1) % tabs.length;
  switchTab(tabs[nextIndex]);
}

function navigateToPrevTab() {
  const tabs = ['instalacao', 'manutencao', 'materiais', 'historico', 'mapa', 'relatorios', 'configuracoes'];
  const currentIndex = tabs.indexOf(currentTab);
  const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
  switchTab(tabs[prevIndex]);
}

// Photo Capture Implementation
function initializePhotoCapture() {
  // This will be implemented in the form sections
}

async function capturePhoto() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    // Create canvas for capture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Wait for video to load
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Capture frame
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        const compressedBlob = await compressImage(blob);
        
        // Stop camera
        stream.getTracks().forEach(track => track.stop());
        
        showToast('Foto capturada com sucesso!', 'success');
        vibrate(100);
      }, 'image/jpeg', 0.8);
    });
    
  } catch (error) {
    console.error('Error capturing photo:', error);
    showToast('Erro ao capturar foto', 'error');
  }
}

async function compressImage(blob, maxWidth = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(blob);
  });
}

// QR Code Scanner Implementation
function initializeQRScanner() {
  // Initialize QR scanner when needed
}

async function startQRScanner() {
  try {
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      console.log(`QR Code detected: ${decodedText}`);
      processQRCode(decodedText);
      html5QrCode.stop();
      vibrate(100);
    };
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode = new Html5Qrcode("qr-reader");
    await html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback
    );
    
  } catch (error) {
    console.error('Error starting QR scanner:', error);
    showToast('Erro ao iniciar scanner QR', 'error');
  }
}

function processQRCode(qrData) {
  try {
    // Try to parse as JSON
    const data = JSON.parse(qrData);
    
    // Auto-fill form fields based on QR data
    if (data.cliente) document.getElementById('cliente').value = data.cliente;
    if (data.cto) document.getElementById('cto').value = data.cto;
    if (data.porta) document.getElementById('porta').value = data.porta;
    
    showToast('Dados do QR Code preenchidos automaticamente!', 'success');
  } catch (error) {
    // If not JSON, treat as simple text
    showToast(`QR Code lido: ${qrData}`, 'info');
  }
}

// ENHANCED REPORTS IMPLEMENTATION WITH REAL MATERIAL DATA
function initializeReports() {
  // This will be called when reports tab is accessed
}

function updateReports() {
  renderInstallationChart();
  renderMaterialsChart();
  renderStatistics();
}

function renderInstallationChart() {
  const ctx = document.getElementById('installationChart');
  if (!ctx) return;
  
  // Get installations by week
  const weeklyData = getWeeklyInstallations();
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyData.labels,
      datasets: [{
        label: 'Instalações',
        data: weeklyData.data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'var(--text-primary)'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'var(--text-secondary)'
          }
        },
        x: {
          ticks: {
            color: 'var(--text-secondary)'
          }
        }
      }
    }
  });
}

function renderMaterialsChart() {
  const ctx = document.getElementById('materialsChart');
  if (!ctx) return;
  
  // Get real material data from stock
  const materialData = getRealMaterialData();
  
  if (materialData.labels.length === 0) {
    // Show message if no materials
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
    const parent = ctx.parentElement;
    if (parent) {
      parent.innerHTML = '<p class="text-center" style="color: var(--text-muted); padding: 2rem;">Adicione materiais ao estoque para ver os gráficos</p>';
    }
    return;
  }
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: materialData.labels,
      datasets: [{
        data: materialData.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: 'var(--text-primary)'
          }
        }
      }
    }
  });
}

function getWeeklyInstallations() {
  // Implementation for weekly installation data
  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
  const data = [12, 19, 8, 15]; // Sample data
  
  return { labels: weeks, data: data };
}

function getRealMaterialData() {
  // Get real material data from the materials array
  const labels = materiais.map(material => material.nome);
  const data = materiais.map(material => material.quantidade);
  
  return { labels: labels, data: data };
}

function renderStatistics() {
  const totalInstallations = historico.filter(item => item.tipo === 'instalacao').length;
  const totalMaintenance = historico.filter(item => item.tipo === 'manutencao').length;
  const totalMaterials = materiais.length;
  const monthlyInstallations = totalInstallations; // For now, same as total
  
  const totalInstallationsEl = document.getElementById('totalInstallations');
  const totalMaintenanceEl = document.getElementById('totalMaintenance');
  const totalMaterialsEl = document.getElementById('totalMaterials');
  const monthlyInstallationsEl = document.getElementById('monthlyInstallations');
  
  if (totalInstallationsEl) totalInstallationsEl.textContent = totalInstallations;
  if (totalMaintenanceEl) totalMaintenanceEl.textContent = totalMaintenance;
  if (totalMaterialsEl) totalMaterialsEl.textContent = totalMaterials;
  if (monthlyInstallationsEl) monthlyInstallationsEl.textContent = monthlyInstallations;
}

// Settings Implementation
function initializeSettings() {
  // Initialize settings controls
  const notificationsEnabled = document.getElementById('notificationsEnabled');
  const hapticEnabled = document.getElementById('hapticEnabled');
  const gesturesEnabled = document.getElementById('gesturesEnabled');
  
  if (notificationsEnabled) {
    notificationsEnabled.checked = localStorage.getItem('notificationsEnabled') === 'true';
    notificationsEnabled.addEventListener('change', function() {
      localStorage.setItem('notificationsEnabled', this.checked);
      showToast(`Notificações ${this.checked ? 'ativadas' : 'desativadas'}`, 'success');
      vibrate(50);
    });
  }
  
  if (hapticEnabled) {
    hapticEnabled.checked = localStorage.getItem('hapticEnabled') !== 'false';
    hapticEnabled.addEventListener('change', function() {
      localStorage.setItem('hapticEnabled', this.checked);
      showToast(`Feedback tátil ${this.checked ? 'ativado' : 'desativado'}`, 'success');
      if (this.checked) vibrate(50);
    });
  }
  
  if (gesturesEnabled) {
    gesturesEnabled.checked = localStorage.getItem('gesturesEnabled') !== 'false';
    gesturesEnabled.addEventListener('change', function() {
      localStorage.setItem('gesturesEnabled', this.checked);
      showToast(`Gestos ${this.checked ? 'ativados' : 'desativados'}`, 'success');
      vibrate(50);
    });
  }
}

// Online/Offline Status
function updateOnlineStatus() {
  isOnline = navigator.onLine;
  // Update UI based on online status
}

function handleOnline() {
  isOnline = true;
  showToast('Conexão restaurada', 'success');
}

function handleOffline() {
  isOnline = false;
  showToast('Modo offline ativado', 'warning');
}

// Render all sections
function renderAllSections() {
  renderMateriais();
  renderMateriaisSelecionaveis();
  renderMateriaisManutencao();
  renderHistorico();
  updateContador();
}