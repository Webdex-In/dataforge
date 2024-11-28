// File: components/ProcessedDataCard.js

import React, { useState, useEffect } from 'react';

export default function ProcessedDataCard({ item, onAddToList, onSelect, isSelected }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');

  useEffect(() => {
    const savedLists = JSON.parse(localStorage.getItem('prospectLists') || '[]');
    setLists(savedLists);
  }, []);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const isBulkData = item.dataType === 'bulk';
  const data = isBulkData ? item : item.data;

  const linkedInData = isBulkData ? data.linkedInData : getNestedValue(data, 'socialEnrichment');
  const emailData = isBulkData ? data.emailData : getNestedValue(data, 'email');
  const phoneData = isBulkData ? data.phoneData : getNestedValue(data, 'mobile');
  const companyEmailsData = getNestedValue(data, 'domainSearch');

  const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 
                     linkedInData?.full_name || 
                     `${emailData?.first_name || ''} ${emailData?.last_name || ''}`.trim() ||
                     'Unnamed Profile';

  const displayCompany = data.company || emailData?.domain || linkedInData?.company?.name || 'Unavailable';

  const getEnrichmentType = () => {
    const types = [];
    if (emailData) types.push('Individual Email');
    if (phoneData) types.push('Phone');
    if (linkedInData) types.push('LinkedIn');
    if (companyEmailsData) types.push('Company Emails');
    return types.join(', ') || 'No enrichment';
  };

  const handleAddToList = () => {
    if (selectedList) {
      onAddToList(selectedList, item);
      setSelectedList('');
    }
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.first_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.last_name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.email_status || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.domain || 'N/A'}</td>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phone.raw_format || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phone.international_format || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{phone.national_format || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {phone.country_name ? `${phone.country_name} (${phone.country_code})` : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderCompanyEmails = () => {
    if (!companyEmailsData || !companyEmailsData.email_list) return null;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companyEmailsData.email_list.map((email, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {email.first_name || email.last_name ? `${email.first_name || ''} ${email.last_name || ''}`.trim() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.email_type || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.verification?.status || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-gray-600">Total emails found: {companyEmailsData.email_list.length}</p>
      </div>
    );
  };

  const renderLinkedInTable = (linkedin) => {
    if (!linkedin) return null;

    const companyInfo = linkedin.company || {};

    return (
      <div className="space-y-6">
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
                <td className="px-6 py-4 text-sm text-gray-500">{linkedin.full_name || 'N/A'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Current Position</td>
                <td className="px-6 py-4 text-sm text-gray-500">{linkedin.job_title || 'N/A'}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">LinkedIn Profile</td>
                <td className="px-6 py-4 text-sm text-gray-500">
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
        {companyInfo && Object.keys(companyInfo).length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Company Information</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Company Name</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{companyInfo.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Industry</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{companyInfo.industry || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Company Size</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{companyInfo.size || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Location</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {companyInfo.location ? 
                      `${companyInfo.location.city || ''} ${companyInfo.location.state || ''} ${companyInfo.location.country || ''}`.trim() : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Website</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {companyInfo.website ? (
                      <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {companyInfo.website}
                      </a>
                    ) : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Profile Summary */}
        {linkedin.summary && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professional Summary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-line">{linkedin.summary}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Experience */}
        {(linkedin.experience || linkedin.experiences) && (linkedin.experience || linkedin.experiences).length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professional Experience</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(linkedin.experience || linkedin.experiences).map((exp, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                      <div className="font-semibold">
                        {typeof exp.company === 'object' ? 
                          exp.company.name : 
                          (exp.company_name || exp.company || 'N/A')}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {exp.dates || (exp.start_date && 
                          `${exp.start_date}${exp.end_date ? ` - ${exp.end_date}` : ' - Present'}`)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 w-2/3">
                      <div className="font-medium">{exp.title || exp.position || 'N/A'}</div>
                      {exp.location && 
                        <div className="text-gray-400 text-xs mt-1">
                          {typeof exp.location === 'object' ? 
                            `${exp.location.city || ''} ${exp.location.country || ''}`.trim() : 
                            exp.location}
                        </div>
                      }
                      {exp.description && (
                        <div className="mt-2 text-sm whitespace-pre-line">
                          {exp.description}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Education */}
        {linkedin.education && linkedin.education.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {linkedin.education.map((edu, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">
                      <div className="font-semibold">
                        {typeof edu.school === 'object' ? edu.school.name : edu.school || 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {edu.start_date && `${edu.start_date}${edu.end_date ? ` - ${edu.end_date}` : ' - Present'}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 w-2/3">
                      <div className="font-medium">{edu.degree || 'N/A'}</div>
                      {edu.field_of_study && (
                        <div className="text-gray-500">
                          Field of Study: {edu.field_of_study}
                        </div>
                      )}
                      {edu.grade && <div className="text-gray-400 text-sm">Grade: {edu.grade}</div>}
                      {edu.activities && (
                        <div className="mt-2 text-sm text-gray-500">
                          Activities: {edu.activities}
                        </div>
                      )}
                      {edu.description && (
                        <div className="mt-2 text-sm whitespace-pre-line">
                          {edu.description}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Skills */}
        {linkedin.skills && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {linkedin.skills.split(',').map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
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
          <div className="bg-white shadow-lg rounded-lg mb-6 overflow-hidden border border-purple-light">
            <div className="px-6 py-4 flex justify-between items-center bg-purple-light">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(item)}
                  className="mr-4 h-5 w-5 text-blue-600"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">{displayName}</h3>
                  <p className="text-md text-white">{displayCompany}</p>
                  <p className="text-sm text-white">{getEnrichmentType()}</p>
                </div>
              </div>
              <button onClick={toggleExpand} className="text-2xl text-white focus:outline-none">
                {isExpanded ? '▲' : '▼'}
              </button>
            </div>
            {isExpanded && (
              <div className="p-6 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">Processed on: {new Date(item.timestamp).toLocaleString()}</p>

                {emailData && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3 text-purple-dark">Email Information</h4>
                    {renderEmailTable(emailData)}
                  </div>
                )}

                {phoneData && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3 text-purple-dark">Phone Information</h4>
                    {renderPhoneTable(phoneData)}
                  </div>
                )}

                {companyEmailsData && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3 text-purple-dark">Company Emails</h4>
                    {renderCompanyEmails()}
                  </div>
                )}

                {linkedInData && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-3 text-purple-dark">LinkedIn Information</h4>
                    {renderLinkedInTable(linkedInData)}
                  </div>
                )}

                <div className="mt-4">
                  <select
                    value={selectedList}
                    onChange={(e) => setSelectedList(e.target.value)}
                    className="mr-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-dark"
                  >
                    <option value="">Select a list</option>
                    {lists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToList}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400"
                    disabled={!selectedList}
                  >
                    Add to List
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }