import React from 'react';

const DirectPDFDownload = ({ courseSlug, courseName }) => {
  const handleDirectDownload = (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    
    // Validate required fields
    if (!name || !email || !phone) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Create a direct form submission to download PDF
    const downloadForm = document.createElement('form');
    downloadForm.method = 'POST';
    downloadForm.action = `${process.env.REACT_APP_BACKEND_URL}/api/courses/${courseSlug}/syllabus`;
    downloadForm.target = '_blank'; // Open in new tab
    
    // Add form fields
    const nameInput = document.createElement('input');
    nameInput.type = 'hidden';
    nameInput.name = 'name';
    nameInput.value = name;
    
    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = email;
    
    const phoneInput = document.createElement('input');
    phoneInput.type = 'hidden';
    phoneInput.name = 'phone';
    phoneInput.value = phone.replace(/\D/g, ''); // Remove non-digits
    
    downloadForm.appendChild(nameInput);
    downloadForm.appendChild(emailInput);
    downloadForm.appendChild(phoneInput);
    
    // Submit form
    document.body.appendChild(downloadForm);
    downloadForm.submit();
    document.body.removeChild(downloadForm);
    
    // Show success message
    alert(`Syllabus for ${courseName || 'the course'} will be downloaded shortly! Check your Downloads folder.`);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Download Course Syllabus</h3>
      <p className="text-gray-600 mb-4 text-sm">
        Get the detailed course syllabus delivered instantly
      </p>
      
      <form onSubmit={handleDirectDownload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            required
            pattern="[0-9]{10}"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="10-digit phone number"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="consent"
            required
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="consent" className="ml-2 block text-sm text-gray-700">
            I agree to be contacted by GRRAS about courses
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Syllabus (PDF)
        </button>
      </form>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        * Required fields. Your information is secure and used only for course counseling.
      </p>
    </div>
  );
};

export default DirectPDFDownload;