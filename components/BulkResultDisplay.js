// File: components/BulkResultDisplay.js

import React, { useState } from 'react';

export default function BulkResultDisplay({ results }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!results || results.length === 0) {
    return <p>No results to display.</p>;
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderEmailTable = (email) => {
    if (!email) return null;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.first_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.last_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.email_status || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email.domain || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderPhoneTable = (phone) => {
    if (!phone) return null;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Format</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">International Format</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National Format</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{phone.raw_format || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{phone.international_format || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{phone.national_format || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {phone.country_name ? `${phone.country_name} (${phone.country_code})` : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderLinkedInTable = (linkedin) => {
    if (!linkedin) return null;
    return (
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Basic Information</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Full Name</td>
                <td className="px-6 py-4 text-sm text-gray-900">{linkedin.full_name || 'N/A'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Current Position</td>
                <td className="px-6 py-4 text-sm text-gray-900">{linkedin.job_title || 'N/A'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">LinkedIn Profile</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {linkedin.linkedin ? (
                    <a href={linkedin.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Profile
                    </a>
                  ) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Company Information */}
        {linkedin.company && Object.keys(linkedin.company).length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Information</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Company Name</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{linkedin.company.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Industry</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{linkedin.company.industry || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Size</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{linkedin.company.size || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Website</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {linkedin.company.website ? (
                      <a href={linkedin.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {linkedin.company.website}
                      </a>
                    ) : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Bulk Processing Results</h2>
      {results.map((result, index) => (
        <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div 
            className="px-6 py-4 cursor-pointer flex justify-between items-center bg-purple-light"
            onClick={() => toggleExpand(index)}
          >
            <div>
              <h3 className="text-xl font-semibold text-white">{result.firstName} {result.lastName}</h3>
              <p className="text-md text-white">{result.linkedInData?.company?.name || result.emailData?.domain || 'Company not found'}</p>
            </div>
            <span className="text-2xl text-white">{expandedIndex === index ? '▲' : '▼'}</span>
          </div>
          {expandedIndex === index && (
            <div className="p-6 space-y-6">
              {result.emailData && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 text-purple-dark">Email Information</h4>
                  {renderEmailTable(result.emailData)}
                </div>
              )}

              {result.phoneData && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 text-purple-dark">Phone Information</h4>
                  {renderPhoneTable(result.phoneData)}
                </div>
              )}

              {result.linkedInData && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 text-purple-dark">LinkedIn Information</h4>
                  {renderLinkedInTable(result.linkedInData)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}