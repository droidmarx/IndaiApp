/**
 * Sistema de notificação de atualização para o PWA IndaiaFibra
 * 
 * Este script gerencia a detecção de novas versões da aplicação e
 * exibe uma notificação para o usuário, permitindo que ele atualize
 * a página para obter a versão mais recente.
 */

// Versão atual da aplicação - deve ser atualizada a cada deploy
const APP_VERSION = '1.0.2';

// Configuração do sistema de notificação
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // Verificar atualizações a cada 1 hora
let updateNotificationShown = false;

// Inicializa o sistema de notificação quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  initUpdateNotificationSystem();
});

/**
 * Inicializa o sistema de notificação de atualização
 */
function initUpdateNotificationSystem() {
  // Adiciona o CSS para o componente de notificação
  addUpdateNotificationStyles();
  
  // Cria o elemento de notificação e o adiciona ao DOM
  createUpdateNotificationElement();
  
  // Exibe a versão imediatamente
  showUpdateNotification();
  
  console.log('[Update System] Sistema de versão inicializado');
}

/**
 * Adiciona o CSS para o componente de notificação
 */
function addUpdateNotificationStyles() {
  // Verifica se o CSS já foi adicionado
  if (document.getElementById('update-notification-styles')) return;
  
  // Carrega o CSS do arquivo externo
  const link = document.createElement('link');
  link.id = 'update-notification-styles';
  link.rel = 'stylesheet';
  link.href = '/update-notification.css';
  document.head.appendChild(link);
}

/**
 * Cria o elemento de notificação e o adiciona ao DOM
 */
function createUpdateNotificationElement() {
  // Verifica se o elemento já existe
  if (document.getElementById('update-notification')) return;
  
  // Cria o container da notificação
  const container = document.createElement('div');
  container.className = 'update-notification-container';
  container.id = 'update-notification-container';
  
  // Cria o elemento de notificação
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div class="update-notification-content">
      <div class="update-notification-title">Versão</div>
      <div class="update-notification-version">${APP_VERSION}</div>
    </div>
  `;
  
  // Adiciona a notificação ao container
  container.appendChild(notification);
  
  // Adiciona o container ao placeholder ou ao body como fallback
  const placeholder = document.getElementById("update-notification-placeholder");
  if (placeholder) {
    placeholder.appendChild(container);
  } else {
    document.body.appendChild(container);
  }
}

/**
 * Exibe a notificação de versão
 */
function showUpdateNotification() {
  const notification = document.getElementById('update-notification');
  if (notification) {
    notification.classList.add('show');
    console.log('[Update System] Versão exibida:', APP_VERSION);
  }
}

