import React from 'react';
import { Briefcase, Home, Wrench, ShoppingBag, Heart, Users } from 'lucide-react';

const CONNECTION_TYPES = [
  {
    value: 'employment',
    label: 'Employment',
    icon: Briefcase,
    description: 'Job opportunity or application',
    color: 'blue'
  },
  {
    value: 'rental',
    label: 'Rental',
    icon: Home,
    description: 'Property rental inquiry',
    color: 'green'
  },
  {
    value: 'service',
    label: 'Service',
    icon: Wrench,
    description: 'Hire service provider',
    color: 'purple'
  },
  {
    value: 'marketplace',
    label: 'Marketplace',
    icon: ShoppingBag,
    description: 'Buy or sell products',
    color: 'orange'
  },
  {
    value: 'matchmaking',
    label: 'Matchmaking',
    icon: Heart,
    description: 'Marriage proposal',
    color: 'pink'
  },
  {
    value: 'general',
    label: 'General',
    icon: Users,
    description: 'General networking',
    color: 'gray'
  }
];

const ConnectionTypeSelector = ({ value, onChange, compact = false }) => {
  if (compact) {
    return (
      <select
        value={value || 'general'}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {CONNECTION_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-3">
      {CONNECTION_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;

        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`${isSelected ? 'text-blue-600' : 'text-gray-600'} flex-shrink-0`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {type.label}
                </h4>
                <p className="text-xs text-gray-600">{type.description}</p>
              </div>
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConnectionTypeSelector;
