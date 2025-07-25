import React from 'react';
import { Star, Clock, TrendingUp, Users } from 'lucide-react';
import { Contact, Reminder } from '../utils/types';

interface HomeProps {
  contacts: Contact[];
  reminders: Reminder[];
  onContactClick: (contact: Contact) => void;
  onReminderComplete: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ contacts, reminders, onContactClick, onReminderComplete }) => {
  const starredContacts = contacts.filter(c => c.starred);
  const todayReminders = reminders.filter(r => !r.completed);
  const recentActivity = contacts
    .filter(c => c.lastContact)
    .sort((a, b) => (b.lastContact?.getTime() || 0) - (a.lastContact?.getTime() || 0))
    .slice(0, 5);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
          {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Voici ce qui se passe avec vos connexions aujourd'hui
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-600/20 dark:to-sage-700/20 border border-sage-200 dark:border-sage-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-sage-600 dark:text-sage-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{contacts.length}</p>
              <p className="text-sage-700 dark:text-sage-300 text-sm">Personnes dans votre réseau</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-600/20 dark:to-amber-700/20 border border-amber-200 dark:border-amber-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{starredContacts.length}</p>
              <p className="text-amber-700 dark:text-amber-300 text-sm">Connexions favorites</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-600/20 dark:to-blue-700/20 border border-blue-200 dark:border-blue-600/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{todayReminders.length}</p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">Rappels en attente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rappels d'aujourd'hui */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-sage-600 dark:text-sage-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Rappels d'aujourd'hui</h3>
          </div>
          
          <div className="space-y-4">
            {todayReminders.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Tout est à jour ! Aucun rappel pour aujourd'hui.
              </p>
            ) : (
              todayReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <button
                    onClick={() => onReminderComplete(reminder.id)}
                    className="mt-1 w-5 h-5 border-2 border-sage-600 dark:border-sage-400 rounded-full hover:bg-sage-600 dark:hover:bg-sage-400 transition-colors flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-sage-600 dark:bg-sage-400 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                  </button>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">{reminder.contactName}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{reminder.message}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">{formatDate(reminder.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contacts favoris */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personnes favorites</h3>
          </div>
          
          <div className="space-y-3">
            {starredContacts.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Marquez vos contacts importants comme favoris pour les voir ici.
              </p>
            ) : (
              starredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => onContactClick(contact)}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white font-semibold">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">{contact.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{contact.relationship}</p>
                  </div>
                  <div className="text-gray-500 dark:text-gray-500 text-sm">
                    {contact.lastContact ? formatDate(contact.lastContact) : 'Aucun contact'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-5 h-5 text-sage-600 dark:text-sage-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Activité récente</h3>
        </div>
        
        <div className="space-y-3">
          {recentActivity.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onContactClick(contact)}
              className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-sage-600 to-sage-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium">{contact.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Dernier contact</p>
                </div>
              </div>
              <div className="text-gray-500 dark:text-gray-500 text-sm">
                {contact.lastContact ? formatDate(contact.lastContact) : 'Jamais'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;