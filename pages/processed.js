import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProcessedDataCard from '../components/ProcessedDataCard';
import { getIndividualProcessedData } from '../utils/individualApiService';
import { getBulkProcessedData } from '../utils/bulkApiService';

export default function ProcessedData() {
  const [processedData, setProcessedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const individualData = await getIndividualProcessedData();
      const bulkData = await getBulkProcessedData();



      const combinedData = [
        ...individualData.map(item => ({ ...item, dataType: 'individual' })),
        ...bulkData.flatMap(bulkItem => 
          Array.isArray(bulkItem.data) ? bulkItem.data.map(item => ({
            ...item,
            timestamp: bulkItem.timestamp,
            dataType: 'bulk'
          })) : [{
            ...bulkItem.data,
            timestamp: bulkItem.timestamp,
            dataType: 'bulk'
          }]
        )
      ].filter(item => item && Object.keys(item).length > 0)
       .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setProcessedData(combinedData);

      const savedLists = JSON.parse(localStorage.getItem('prospectLists') || '[]');
      setLists(savedLists);
    };

    fetchData();
  }, []);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const filteredData = processedData.filter(item => {
    const searchString = searchTerm.toLowerCase();
    const isBulkData = item.dataType === 'bulk';

    let name, company, email;

    if (isBulkData) {
      name = getNestedValue(item, 'linkedInData.full_name') || 
             `${item.firstName || ''} ${item.lastName || ''}`.trim() || '';
      company = getNestedValue(item, 'linkedInData.company.name') || '';
      email = getNestedValue(item, 'emailData.email') || '';
    } else {
      name = getNestedValue(item, 'data.socialEnrichment.full_name') ||
             `${getNestedValue(item, 'data.email.first_name') || ''} ${getNestedValue(item, 'data.email.last_name') || ''}`.trim() || '';
      company = getNestedValue(item, 'data.socialEnrichment.company.name') ||
                getNestedValue(item, 'data.email.domain') || '';
      email = getNestedValue(item, 'data.email.email') || '';
    }

    const matchesSearch = name.toLowerCase().includes(searchString) || 
                          company.toLowerCase().includes(searchString) || 
                          email.toLowerCase().includes(searchString);

    const itemDate = new Date(item.timestamp);
    const matchesDateRange = (!startDate || itemDate >= new Date(startDate)) && 
                             (!endDate || itemDate <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSelect = (item) => {
    setSelectedItems(prevSelected => {
      const isAlreadySelected = prevSelected.some(selectedItem => 
        selectedItem.timestamp === item.timestamp && 
        getNestedValue(selectedItem, 'data.email.email') === getNestedValue(item, 'data.email.email')
      );

      if (isAlreadySelected) {
        return prevSelected.filter(selectedItem => 
          !(selectedItem.timestamp === item.timestamp && 
            getNestedValue(selectedItem, 'data.email.email') === getNestedValue(item, 'data.email.email'))
        );
      } else {
        // If the item is from bulk data, add all items with the same timestamp
        if (item.dataType === 'bulk') {
          const bulkItems = processedData.filter(dataItem => 
            dataItem.dataType === 'bulk' && dataItem.timestamp === item.timestamp
          );
          return [...prevSelected, ...bulkItems];
        } else {
          return [...prevSelected, item];
        }
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems);
    }
  };

  const handleAddToList = (listId, item) => {
    const updatedLists = lists.map(list => {
      if (list.id === listId) {
        const itemsToAdd = item.dataType === 'bulk' 
          ? processedData.filter(dataItem => dataItem.dataType === 'bulk' && dataItem.timestamp === item.timestamp)
          : [item];

        const newProspects = itemsToAdd.filter(newItem => 
          !list.prospects.some(prospect => 
            prospect.timestamp === newItem.timestamp && 
            getNestedValue(prospect, 'data.email.email') === getNestedValue(newItem, 'data.email.email')
          )
        );

        return { ...list, prospects: [...list.prospects, ...newProspects] };
      }
      return list;
    });
    setLists(updatedLists);
    localStorage.setItem('prospectLists', JSON.stringify(updatedLists));
  };

  const handleAddSelectedToList = () => {
    if (selectedList === 'new') {
      handleCreateNewList();
    } else if (selectedList) {
      const updatedLists = lists.map(list => {
        if (list.id === selectedList) {
          const newProspects = selectedItems.filter(item => 
            !list.prospects.some(prospect => 
              prospect.timestamp === item.timestamp && 
              getNestedValue(prospect, 'data.email.email') === getNestedValue(item, 'data.email.email')
            )
          );
          return { ...list, prospects: [...list.prospects, ...newProspects] };
        }
        return list;
      });
      setLists(updatedLists);
      localStorage.setItem('prospectLists', JSON.stringify(updatedLists));
      setSelectedItems([]);
      setSelectedList('');
    }
  };

  const handleCreateNewList = () => {
    if (newListName.trim()) {
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        prospects: selectedItems
      };
      const updatedLists = [...lists, newList];
      setLists(updatedLists);
      localStorage.setItem('prospectLists', JSON.stringify(updatedLists));
      setNewListName('');
      setSelectedItems([]);
      setIsCreatingNewList(false);
      setSelectedList('');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-purple-dark">Processed Data</h2>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by name, company, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-purple-light rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark text-lg"
          />
          <div className="flex space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-4 py-2 border border-purple-light rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-4 py-2 border border-purple-light rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <label htmlFor="itemsPerPage" className="mr-2 text-purple-dark">Items per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-purple-light rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark"
            >
              {[10, 20, 50, 100].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div>
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
          </div>
        </div>

        {/* Bulk actions */}
        <div className="mb-6 p-4 bg-purple-light rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-white">Bulk Actions</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="bg-purple-dark text-white px-4 py-2 rounded hover:bg-purple-900"
            >
              {selectedItems.length === currentItems.length ? 'Deselect All' : 'Select All'}
            </button>
            <select
              value={selectedList}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsCreatingNewList(true);
                  setSelectedList('');
                } else {
                  setIsCreatingNewList(false);
                  setSelectedList(e.target.value);
                }
              }}
              className="px-4 py-2 border border-purple-dark rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark"
            >
              <option value="">Select a list</option>
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
              <option value="new">Create new list</option>
            </select>
            {isCreatingNewList && (
              <input
                type="text"
                placeholder="New list name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="px-4 py-2 border border-purple-dark rounded-md focus:outline-none focus:ring-2 focus:ring-purple-dark"
              />
            )}
            <button
              onClick={() => {
                if (isCreatingNewList) {
                  handleCreateNewList();
                } else {
                  handleAddSelectedToList();
                }
              }}
              disabled={(!selectedList && !isCreatingNewList) || selectedItems.length === 0 || (isCreatingNewList && !newListName.trim())}
              className="bg-purple-dark text-white px-4 py-2 rounded hover:bg-purple-900 disabled:bg-gray-400"
            >
              {isCreatingNewList ? 'Create New List' : 'Add to List'}
            </button>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No processed data available.</p>
        ) : (
          currentItems.map((item, index) => (
            <ProcessedDataCard
              key={`${item.timestamp}-${getNestedValue(item, 'data.email.email') || index}`}
              item={item}
              onAddToList={handleAddToList}
              onSelect={handleSelect}
              isSelected={selectedItems.some(selectedItem => 
                selectedItem.timestamp === item.timestamp && 
                getNestedValue(selectedItem, 'data.email.email') === getNestedValue(item, 'data.email.email')
              )}
            />
          ))
        )}

        <div className="mt-6 flex justify-center">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === i + 1 ? 'bg-purple-dark text-white' : 'bg-purple-light text-purple-dark'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}