import React from 'react';
import { 
  Briefcase, User, ShoppingCart, Store, Users, Star, Shield,
  Wrench, UserCheck, Home, Key, Heart
} from 'lucide-react';

const ROLES = [
  {
    value: 'employee',
    label: 'Employee',
    icon: User,
    description: 'Looking for job opportunities',
    color: 'blue'
  },
  {
    value: 'employer',
    label: 'Employer',
    icon: Briefcase,
    description: 'Hiring employees for my company',
    color: 'indigo'
  },
  {
    value: 'buyer',
    label: 'Buyer',
    icon: ShoppingCart,
    description: 'Buying products and services',
    color: 'green'
  },
  {
    value: 'seller',
    label: 'Seller',
    icon: Store,
    description: 'Selling products and services',
    color: 'orange'
  },
  {
    value: 'service_provider',
    label: 'Service Provider',
    icon: Wrench,
    description: 'Offering professional services',
    color: 'purple'
  },
  {
    value: 'customer',
    label: 'Customer',
    icon: UserCheck,
    description: 'Hiring service providers',
    color: 'cyan'
  },
  {
    value: 'renter',
    label: 'Renter',
    icon: Home,
    description: 'Renting out properties',
    color: 'emerald'
  },
  {
    value: 'tenant',
    label: 'Tenant',
    icon: Key,
    description: 'Looking for rental properties',
    color: 'teal'
  },
  {
    value: 'husband',
    label: 'Looking for Wife',
    icon: Heart,
    description: 'Seeking marriage partner',
    color: 'rose'
  },
  {
    value: 'wife',
    label: 'Looking for Husband',
    icon: Heart,
    description: 'Seeking marriage partner',
    color: 'pink'
  },
  {
    value: 'connector',
    label: 'Connector',
    icon: Users,
    description: 'Facilitating connections',
    color: 'violet'
  }
];

const colorClasses = {
  blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
  indigo: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
  green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
  orange: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50',
  purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50',
  cyan: 'border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50',
  emerald: 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50',
  teal: 'border-teal-200 hover:border-teal-400 hover:bg-teal-50',
  rose: 'border-rose-200 hover:border-rose-400 hover:bg-rose-50',
  pink: 'border-pink-200 hover:border-pink-400 hover:bg-pink-50',
  violet: 'border-violet-200 hover:border-violet-400 hover:bg-violet-50'
};

const selectedColorClasses = {
  blue: 'border-blue-500 bg-blue-50 ring-2 ring-blue-500',
  indigo: 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500',
  green: 'border-green-500 bg-green-50 ring-2 ring-green-500',
  orange: 'border-orange-500 bg-orange-50 ring-2 ring-orange-500',
  purple: 'border-purple-500 bg-purple-50 ring-2 ring-purple-500',
  cyan: 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500',
  emerald: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500',
  teal: 'border-teal-500 bg-teal-50 ring-2 ring-teal-500',
  rose: 'border-rose-500 bg-rose-50 ring-2 ring-rose-500',
  pink: 'border-pink-500 bg-pink-50 ring-2 ring-pink-500',
  violet: 'border-violet-500 bg-violet-50 ring-2 ring-violet-500'
};

const iconColorClasses = {
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  cyan: 'text-cyan-600',
  emerald: 'text-emerald-600',
  teal: 'text-teal-600',
  rose: 'text-rose-600',
  pink: 'text-pink-600',
  violet: 'text-violet-600'
};

const RoleSelector = ({ value, onChange, error }) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        I am a... *
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = value === role.value;
          
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                isSelected
                  ? selectedColorClasses[role.color]
                  : `${colorClasses[role.color]} border-gray-200`
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`${iconColorClasses[role.color]} flex-shrink-0`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {role.label}
                  </h3>
                  <p className="text-xs text-gray-600 leading-tight">
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full ${iconColorClasses[role.color]} flex items-center justify-center`}>
                      ✓
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default RoleSelector;
