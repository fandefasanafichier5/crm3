import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Contact } from '../utils/types';
import ContactCard from './ContactCard';

interface ContactsProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onToggleStar: (id: string) => void;
  onAddContact: () => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onContactClick, onToggleStar, onAddContact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'starred' | 'needs-attention'>('all');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'starred' && contact.starred) ||
                         (selectedFilter === 'needs-attention' && contact.sentiment === 'needs-attention');
    
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { id: 'all' as const, label: 'Toutes les personnes', count: contacts.length },
    { id: 'starred' as const, label: 'Favoris', count: contacts.filter(c => c.starred).length },
    { id: 'needs-attention' as const, label: 'Nécessite attention', count: contacts.filter(c => c.sentiment === 'needs-attention').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Vos Personnes</h2>
          <p className="text-gray-600 dark:text-gray-400">Gérez votre réseau personnel</p>
        </div>
        <button
          onClick={onAddContact}
          className="flex items-center space-x-2 bg-sage-600 hover:bg-sage-700 text-white px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sage-600/25"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une personne</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des personnes ou des tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          >
            {filterOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onClick={() => onContactClick(contact)}
            onToggleStar={onToggleStar}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-500 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune personne trouvée</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Essayez d\'ajuster vos termes de recherche' : 'Commencez à ajouter des personnes à votre réseau'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Contacts;