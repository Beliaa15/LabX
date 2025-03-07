// components/ui/tabs.js
import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext({
  activeTab: '',
  setActiveTab: () => {},
});

const Tabs = ({ value, onValueChange, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(value);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className = '', children }) => {
  return (
    <div className={`flex space-x-2 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '' }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
        ${activeTab === value 
          ? 'bg-white border-b-2 border-primary text-primary' 
          : 'text-gray-500 hover:text-gray-700'
        } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };