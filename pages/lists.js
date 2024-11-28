import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function MyLists() {
  const [lists, setLists] = useState([]);
  const [expandedLists, setExpandedLists] = useState({});
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);

  useEffect(() => {
    // Load lists from localStorage
    const savedLists = JSON.parse(localStorage.getItem('prospectLists') || '[]');
    setLists(savedLists);
  }, []);

  const saveListsToStorage = (updatedLists) => {
    localStorage.setItem('prospectLists', JSON.stringify(updatedLists));
    setLists(updatedLists);
  };

  const createNewList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList = { id: Date.now().toString(), name: newListName.trim(), prospects: [] };
      const updatedLists = [...lists, newList];
      saveListsToStorage(updatedLists);
      setNewListName('');
    }
  };

  const deleteList = (listId) => {
    const updatedLists = lists.filter(list => list.id !== listId);
    saveListsToStorage(updatedLists);
  };

  const updateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      const updatedLists = lists.map(list => 
        list.id === editingListId ? { ...list, name: newListName.trim() } : list
      );
      saveListsToStorage(updatedLists);
      setEditingListId(null);
      setNewListName('');
    }
  };

  const toggleListExpansion = (listId) => {
    setExpandedLists(prev => ({ ...prev, [listId]: !prev[listId] }));
  };

  const removeProspectFromList = (listId, prospectIndex) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        const updatedProspects = list.prospects.filter((_, index) => index !== prospectIndex);
        return { ...list, prospects: updatedProspects };
      }
      return list;
    });
    saveListsToStorage(updatedLists);
  };

  const handleEditList = (list) => {
    setEditingListId(list.id);
    setNewListName(list.name);
  };

  const getProspectData = (prospect) => {
    const data = prospect.data || prospect;
    const linkedInData = data.linkedInData || data.socialEnrichment || {};
    const emailData = data.emailData || data.email || {};
    const phoneData = data.phoneData || data.mobile || {};

    return {
      name: linkedInData.full_name || `${emailData.first_name || ''} ${emailData.last_name || ''}`.trim() || 'N/A',
      company: linkedInData.company?.name || emailData.domain || 'N/A',
      email: emailData.email || 'N/A',
      emailStatus: emailData.email_status || 'N/A',
      phoneNumber: phoneData.international_format || phoneData.phone_number || 'N/A'
    };
  };

  const downloadCSV = (list) => {
    const headers = ['Name', 'Company', 'Email', 'Email Status', 'Phone Number'];
    const csvData = list.prospects.map(prospect => {
      const { name, company, email, emailStatus, phoneNumber } = getProspectData(prospect);
      return [name, company, email, emailStatus, phoneNumber];
    });

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${list.name}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold mb-6 text-purple-dark">My Lists</h2>

        <form onSubmit={editingListId ? updateList : createNewList} className="mb-8">
          <div className="flex items-center">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={editingListId ? "Edit list name" : "Enter new list name"}
              className="flex-grow mr-2 p-2 border border-purple-light rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
            <button
              type="submit"
              className="bg-purple-dark text-white px-4 py-2 rounded-md hover:bg-purple-900 transition duration-300"
            >
              {editingListId ? 'Update List' : 'Create List'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {lists.map(list => (
            <div key={list.id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-purple-light p-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">{list.name}</h3>
                <div>
                  <button
                    onClick={() => handleEditList(list)}
                    className="text-white mr-2 hover:text-purple-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteList(list.id)}
                    className="text-white mr-2 hover:text-purple-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => downloadCSV(list)}
                    className="text-white mr-2 hover:text-purple-200"
                  >
                    Download CSV
                  </button>
                  <button
                    onClick={() => toggleListExpansion(list.id)}
                    className="text-white hover:text-purple-200"
                  >
                    {expandedLists[list.id] ? '▲' : '▼'}
                  </button>
                </div>
              </div>
              {expandedLists[list.id] && (
                <div className="p-4 overflow-x-auto">
                  {list.prospects.length === 0 ? (
                    <p className="text-gray-500">No prospects in this list.</p>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {list.prospects.map((prospect, index) => {
                          const { name, company, email, emailStatus, phoneNumber } = getProspectData(prospect);
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">{name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{company}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{emailStatus}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{phoneNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => removeProspectFromList(list.id, index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}