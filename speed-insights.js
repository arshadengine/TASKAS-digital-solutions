/**
 * Vercel Speed Insights Integration
 * Loads and initializes Vercel Speed Insights for performance tracking
 */
(function initSpeedInsights() {
  // Initialize the Speed Insights queue
  if (typeof window !== 'undefined' && !window.si) {
    window.si = function() {
      (window.siq = window.siq || []).push(arguments);
    };
  }

  // Create and inject the Speed Insights script
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Add SDK metadata
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '2.0.0';
  
  // Error handling
  script.onerror = function() {
    console.warn('[Vercel Speed Insights] Failed to load script. This is expected in development or when not deployed to Vercel.');
  };
  
  // Inject script into page
  if (document.head) {
    document.head.appendChild(script);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
