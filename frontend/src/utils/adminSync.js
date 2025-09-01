/**
 * Admin Panel Sync Utilities
 * यह file admin panel changes को website के साथ properly sync करने के लिए है
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Force sync admin changes with website
 * Admin panel में changes करने के बाद इसे call करें
 */
export const forceAdminSync = async (adminToken) => {
  try {
    const response = await fetch(`${API_BASE}/api/admin/force-sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Admin sync successful:', data);
      
      // Force browser cache refresh
      if (typeof window !== 'undefined') {
        // Clear localStorage cache
        Object.keys(localStorage).forEach(key => {
          if (key.includes('content') || key.includes('courses')) {
            localStorage.removeItem(key);
          }
        });
        
        // Add timestamp to force re-fetch
        window.adminSyncTimestamp = Date.now();
      }
      
      return { success: true, data };
    } else {
      console.error('❌ Admin sync failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Admin sync error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enhanced content save with auto-sync
 * Admin panel में content save करते time इसे use करें
 */
export const saveContentWithSync = async (content, adminToken, isDraft = false) => {
  try {
    const response = await fetch(`${API_BASE}/api/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        isDraft
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Content saved successfully:', data);
      
      // Wait a moment then force sync
      setTimeout(async () => {
        const syncResult = await forceAdminSync(adminToken);
        if (syncResult.success) {
          console.log('✅ Auto-sync completed after content save');
        }
      }, 1000);
      
      return { success: true, data };
    } else {
      console.error('❌ Content save failed:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Content save error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Wait for sync completion
 * Admin panel में changes करने के बाद थोड़ा wait करने के लिए
 */
export const waitForSync = (delay = 2000) => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};

/**
 * Check if content is properly synced
 * Verify करने के लिए कि changes website पर reflect हो गए हैं
 */
export const verifySyncStatus = async (expectedCoursesCount = null) => {
  try {
    const response = await fetch(`${API_BASE}/api/courses`);
    if (response.ok) {
      const data = await response.json();
      const coursesCount = data.courses?.length || 0;
      
      console.log(`📊 Current courses count: ${coursesCount}`);
      
      if (expectedCoursesCount && coursesCount !== expectedCoursesCount) {
        console.warn(`⚠️ Course count mismatch: expected ${expectedCoursesCount}, got ${coursesCount}`);
        return { synced: false, coursesCount, expected: expectedCoursesCount };
      }
      
      return { synced: true, coursesCount };
    }
  } catch (error) {
    console.error('❌ Sync verification error:', error);
    return { synced: false, error: error.message };
  }
};

/**
 * Auto-refresh page content after admin changes
 * Admin panel के changes के बाद automatically page refresh करने के लिए
 */
export const refreshPageContent = () => {
  if (typeof window !== 'undefined') {
    // Force hard refresh to ensure latest content
    window.location.reload(true);
  }
};

/**
 * Show sync status notification
 * User को बताने के लिए कि sync हो रहा है
 */
export const showSyncNotification = (message, type = 'info') => {
  if (typeof window !== 'undefined' && window.showNotification) {
    window.showNotification(message, type);
  } else {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
};

// Export all utilities
export default {
  forceAdminSync,
  saveContentWithSync,
  waitForSync,
  verifySyncStatus,
  refreshPageContent,
  showSyncNotification
};