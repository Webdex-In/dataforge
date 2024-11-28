import { useState } from 'react';
import { FaUser, FaBuilding, FaLinkedin } from 'react-icons/fa';

export default function EnrichmentForm({ setResult, setIsLoading, setError }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    linkedinUrl: '',
  });
  const [searchOptions, setSearchOptions] = useState({
    findIndividualEmail: true,
    getCompanyEmails: false,
    enrichLinkedIn: false,
    findPhoneNumber: false,
  });
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError(''); // Clear any previous global errors

    if (!formData.firstName || !formData.lastName) {
      setLocalError('First name and last name are required');
      return;
    }

    if (!formData.company && (searchOptions.findIndividualEmail || searchOptions.getCompanyEmails)) {
      setLocalError('Company name is required for email search');
      return;
    }

    if (!formData.linkedinUrl && (searchOptions.enrichLinkedIn || searchOptions.findPhoneNumber)) {
      setLocalError('LinkedIn URL is required for LinkedIn enrichment and phone number search');
      return;
    }

    setIsLoading(true);
    try {
      await setResult(formData, searchOptions);
    } catch (error) {
      console.error('Enrichment error:', error);
      setError('An error occurred during enrichment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (e) => {
    setSearchOptions({ ...searchOptions, [e.target.name]: e.target.checked });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-purple-light p-6 rounded-lg text-white text-center mb-6">
        <h2 className="text-2xl font-bold">Contact Enrichment</h2>
        <p className="mt-2">Enhance your contact information with our powerful enrichment features</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="John"
            />
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Doe"
            />
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Domain</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaBuilding className="text-gray-400" />
          </div>
          <input
            type="text"
            name="company"
            id="company"
            value={formData.company}
            onChange={handleChange}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="AcmeInc.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">LinkedIn URL (Required for Phone Enrichment)</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLinkedin className="text-gray-400" />
          </div>
          <input
            type="text"
            name="linkedinUrl"
            id="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="https://www.linkedin.com/in/username"
          />
        </div>
      </div>
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Enrichment Options</p>
        <div className="space-y-2">
          {Object.entries(searchOptions).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                name={key}
                checked={value}
                onChange={handleOptionChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={key} className="ml-2 block text-sm text-gray-900">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      </div>
      {localError && (
        <div className="text-red-500 text-sm mt-2">
          {localError}
        </div>
      )}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-light hover:bg-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Enrich Data
        </button>
      </div>
    </form>
  );
}