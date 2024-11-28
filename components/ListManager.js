import { useState } from 'react';

export default function ListManager({ lists, onCreateList, onDeleteList, onUpdateList }) {
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);

  const handleCreateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateList(newListName.trim());
      setNewListName('');
    }
  };

  const handleEditList = (list) => {
    setEditingListId(list.id);
    setNewListName(list.name);
  };

  const handleUpdateList = (e) => {
    e.preventDefault();
    if (newListName.trim()) {
      onUpdateList(editingListId, { name: newListName.trim() });
      setEditingListId(null);
      setNewListName('');
    }
  };

  return (
    <div>
      <form onSubmit={editingListId ? handleUpdateList : handleCreateList} className="mb-4">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Enter list name"
          className="mr-2 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editingListId ? 'Update List' : 'Create New List'}
        </button>
      </form>

      <ul className="space-y-2">
        {lists.map(list => (
          <li key={list.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
            <span>{list.name} ({list.prospects.length} prospects)</span>
            <div>
              <button 
                onClick={() => handleEditList(list)}
                className="text-blue-500 mr-2"
              >
                Edit
              </button>
              <button 
                onClick={() => onDeleteList(list.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}