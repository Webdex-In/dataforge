// File: components/BulkUpload.js

import { useState } from 'react';

export default function BulkUpload({ setResult, setIsLoading }) {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    firstName: '',
    lastName: '',
    profileUrl: ''
  });
  const [step, setStep] = useState('upload');

  const commonFieldMappings = {
    firstName: ['first name', 'firstname', 'given name'],
    lastName: ['last name', 'lastname', 'surname', 'family name'],
    profileUrl: ['profile url', 'linkedin url', 'linkedin profile', 'profile link']
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      if (lines.length > 0) {
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(header => header.trim());
        setHeaders(headers);
        autoMapFields(headers);
      }
    };
    reader.readAsText(selectedFile);
    setStep('mapping');
  };

  const autoMapFields = (headers) => {
    const newFieldMapping = { ...fieldMapping };
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      Object.entries(commonFieldMappings).forEach(([field, possibleNames]) => {
        if (possibleNames.some(name => lowerHeader.includes(name))) {
          newFieldMapping[field] = header;
        }
      });
    });
    setFieldMapping(newFieldMapping);
  };

  const handleMappingChange = (field, value) => {
    setFieldMapping(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setStep('processing');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          firstName: values[headers.indexOf(fieldMapping.firstName)],
          lastName: values[headers.indexOf(fieldMapping.lastName)],
          profileUrl: values[headers.indexOf(fieldMapping.profileUrl)]
        };
      });

      try {
        await setResult(data);
        setStep('complete');
      } catch (error) {
        console.error('Bulk processing error:', error);
        setStep('error');
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="mt-4">
      {step === 'upload' && (
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
            className="mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-light file:text-white hover:file:bg-purple-dark"
          />
          <p className="text-sm text-gray-600 mt-2">Upload a CSV file with First Name, Last Name, and LinkedIn URL.</p>
        </div>
      )}

      {step === 'mapping' && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Confirm Field Mapping</h3>
          <p className="text-sm text-gray-600 mb-4">We've automatically mapped some fields. Please confirm or adjust as needed.</p>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(fieldMapping).map(([field, value]) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <select
                  id={field}
                  value={value}
                  onChange={(e) => handleMappingChange(field, e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-dark focus:border-purple-dark sm:text-sm rounded-md"
                >
                  <option value="">Select a field</option>
                  {headers.map((header, index) => (
                    <option key={index} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep('upload')}
            className="mt-4 mr-2 bg-gray-500 text-white p-2 rounded"
          >
            Back
          </button>
          <button
            onClick={handleUpload}
            className="mt-4 bg-purple-light text-white p-2 rounded hover:bg-purple-dark"
            disabled={Object.values(fieldMapping).some(value => !value)}
          >
            Start Processing
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="mt-4">
          <p className="text-sm text-red-600 font-semibold">An error occurred during bulk processing.</p>
          <button
            onClick={() => setStep('upload')}
            className="mt-2 bg-purple-light text-white p-2 rounded hover:bg-purple-dark"
          >
            Try Again
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div className="mt-4">
          <p className="text-sm text-green-600 font-semibold">Bulk processing complete!</p>
          <button
            onClick={() => setStep('upload')}
            className="mt-2 bg-purple-light text-white p-2 rounded hover:bg-purple-dark"
          >
            Process Another File
          </button>
        </div>
      )}
    </div>
  );
}