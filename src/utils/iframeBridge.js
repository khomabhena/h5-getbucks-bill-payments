/**
 * Iframe Bridge
 * Handles postMessage communication between H5 app and parent window (Tapseed Hub)
 */

const APP_SOURCE = 'h5-getbucks-bill-payments';
const PARENT_SOURCE = 'tapseed-hub';

class IframeBridge {
  constructor() {
    this.parentOrigin = null;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestIdCounter = 0;
    this.isInitialized = false;
    
    // Initialize message listener
    this.init();
  }

  /**
   * Initialize the iframe bridge
   */
  init() {
    if (this.isInitialized) return;
    
    // Detect parent origin
    try {
      if (window.self !== window.top && document.referrer) {
        const url = new URL(document.referrer);
        this.parentOrigin = url.origin;
      }
    } catch (e) {
      console.warn('Could not determine parent origin:', e);
    }

    // Listen for messages from parent
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // Notify parent that iframe is ready
    this.sendToParent('IFRAME_READY', {});
    
    this.isInitialized = true;
    console.log('Iframe bridge initialized', { parentOrigin: this.parentOrigin });
  }

  /**
   * Handle incoming messages from parent
   */
  handleMessage(event) {
    // Validate origin (in production, check against whitelist)
    if (this.parentOrigin && event.origin !== this.parentOrigin) {
      console.warn('Message from unauthorized origin:', event.origin);
      return;
    }

    const { type, source, data, requestId } = event.data;

    // Only process messages from parent
    if (source !== PARENT_SOURCE && source !== 'tapseed-hub') {
      return;
    }

    console.log('Received message from parent:', { type, data });

    // Handle response to pending request
    if (requestId && this.pendingRequests.has(requestId)) {
      const { resolve, reject } = this.pendingRequests.get(requestId);
      this.pendingRequests.delete(requestId);
      
      if (type.endsWith('_RESPONSE') || type.endsWith('_RESULT')) {
        resolve(data);
      } else {
        reject(new Error(`Unexpected response type: ${type}`));
      }
      return;
    }

    // Handle registered message handlers
    if (this.messageHandlers.has(type)) {
      const handler = this.messageHandlers.get(type);
      handler(data, event);
    }
  }

  /**
   * Send message to parent window
   */
  sendToParent(type, data, expectResponse = false) {
    if (!this.parentOrigin && window.parent === window.self) {
      console.warn('Not in iframe, cannot send message to parent');
      return Promise.resolve(null);
    }

    const message = {
      type,
      source: APP_SOURCE,
      data,
      timestamp: Date.now()
    };

    // If expecting a response, add request ID
    if (expectResponse) {
      const requestId = `req_${++this.requestIdCounter}_${Date.now()}`;
      message.requestId = requestId;

      return new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error(`Request timeout: ${type}`));
          }
        }, 30000);

        // Send message
        try {
          window.parent.postMessage(message, this.parentOrigin || '*');
        } catch (e) {
          this.pendingRequests.delete(requestId);
          reject(e);
        }
      });
    } else {
      // Send message without expecting response
      try {
        window.parent.postMessage(message, this.parentOrigin || '*');
        return Promise.resolve(null);
      } catch (e) {
        console.error('Error sending message to parent:', e);
        return Promise.reject(e);
      }
    }
  }

  /**
   * Register a handler for a specific message type
   */
  on(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove a message handler
   */
  off(type) {
    this.messageHandlers.delete(type);
  }

  /**
   * Request authentication token from parent
   */
  async requestToken() {
    return this.sendToParent('REQUEST_TOKEN', {}, true);
  }

  /**
   * Request payment processing
   */
  async requestPayment(paymentData) {
    return this.sendToParent('REQUEST_PAYMENT', paymentData, true);
  }

  /**
   * Notify parent that payment is complete
   */
  notifyPaymentComplete(paymentData) {
    return this.sendToParent('PAYMENT_COMPLETE', paymentData);
  }

  /**
   * Request to close iframe
   */
  requestClose() {
    return this.sendToParent('CLOSE_IFRAME', {});
  }

  /**
   * Request navigation in parent window
   */
  requestNavigation(url) {
    return this.sendToParent('NAVIGATION_REQUEST', { url });
  }

  /**
   * Get user information (if available from parent)
   */
  async getUserInfo() {
    return this.sendToParent('REQUEST_USER_INFO', {}, true);
  }
}

// Export singleton instance
export const iframeBridge = new IframeBridge();
export default iframeBridge;

