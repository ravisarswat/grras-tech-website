// Critical CSS for above-the-fold content
export const criticalCSS = `
  /* Above-the-fold critical styles */
  .hero-section {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    min-height: 60vh;
  }
  
  .header-nav {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 50;
  }
  
  .logo {
    width: 120px;
    height: auto;
  }
  
  .nav-link {
    color: #374151;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .nav-link:hover {
    color: #dc2626;
  }
  
  .btn-primary {
    background: #dc2626;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s;
  }
  
  .btn-primary:hover {
    background: #b91c1c;
  }
  
  .hero-title {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.1;
    color: white;
    margin-bottom: 1rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255,255,255,0.9);
    margin-bottom: 2rem;
  }
  
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }
    .hero-subtitle {
      font-size: 1rem;
    }
  }
  
  /* Loading states */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Font display optimization */
  @font-face {
    font-family: 'Inter';
    font-display: swap;
  }
`;

// Function to inject critical CSS inline
export const injectCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};

export default { criticalCSS, injectCriticalCSS };