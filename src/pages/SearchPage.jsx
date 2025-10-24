import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, FileText, MapPin, DollarSign, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { searchAPI } from '../lib/api';
import { toast } from 'react-hot-toast';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [discoveryFeed, setDiscoveryFeed] = useState(null);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    location: '',
    role: '',
    category: '',
    postType: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'relevance'
  });

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      const params = {
        query: searchQuery,
        type: searchType,
        page: 1,
        limit: 20,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      let response;
      if (searchType === 'users') {
        response = await searchAPI.searchUsers(params);
      } else if (searchType === 'posts') {
        response = await searchAPI.searchPosts(params);
      } else {
        response = await searchAPI.unifiedSearch(params);
      }

      setResults(response.data);
      console.log('🔍 Search results:', response.data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get search suggestions
  const getSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await searchAPI.getSuggestions({ query, type: searchType });
      setSuggestions(response.data.data.suggestions);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  // Get discovery feed
  const getDiscoveryFeed = async () => {
    setLoadingDiscovery(true);
    try {
      const response = await searchAPI.getDiscoveryFeed({ page: 1, limit: 20 });
      setDiscoveryFeed(response.data.data);
      console.log('🎯 Discovery feed:', response.data.data);
    } catch (error) {
      console.error('Discovery feed error:', error);
      toast.error('Failed to load discovery feed');
    } finally {
      setLoadingDiscovery(false);
    }
  };

  // Load discovery feed on component mount
  useEffect(() => {
    getDiscoveryFeed();
  }, []);

  // Handle input change with debounce for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      getSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Find users, posts, jobs, and services</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, people, jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion.text);
                        setSuggestions([]);
                        handleSearch();
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                    >
                      <span className="text-sm">{suggestion.icon === 'user' ? '👤' : suggestion.icon === 'post' ? '📝' : '🔍'}</span>
                      <span>{suggestion.text}</span>
                      <span className="text-xs text-gray-500">{suggestion.subtitle}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Type Tabs */}
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All', icon: '🔍' },
                { value: 'users', label: 'Users', icon: '👤' },
                { value: 'posts', label: 'Posts', icon: '📝' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSearchType(type.value)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    searchType === type.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({...filters, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Roles</option>
                    <option value="employee">Employee</option>
                    <option value="employer">Employer</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    <option value="job">Jobs</option>
                    <option value="service">Services</option>
                    <option value="product">Products</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discovery Feed (show when no search results) */}
        {!results && discoveryFeed && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  Discover
                </h2>
                <p className="text-gray-600">Personalized recommendations for you</p>
              </div>
              <button
                onClick={getDiscoveryFeed}
                disabled={loadingDiscovery}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loadingDiscovery ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-4">
              {discoveryFeed.feed?.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {item.reason}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.type === 'user' ? '👤 User' : '📝 Post'}
                    </span>
                  </div>
                  
                  {item.type === 'user' ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        👤
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.data.username}</h4>
                        <p className="text-sm text-gray-600">{item.data.role}</p>
                        {item.data.profile?.location && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {item.data.profile.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{item.data.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.data.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.data.postType === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.data.postType}
                          </span>
                          <span className="text-xs text-gray-500">{item.data.category}</span>
                        </div>
                        {item.data.price && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {item.data.price}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
              <p className="text-gray-600">
                Found {results.totalResults || 0} results for "{results.query}"
              </p>
            </div>

            {/* Results Grid */}
            <div className="space-y-6">
              {/* Users Results */}
              {results.results?.users && results.results.users.data.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Users ({results.results.users.count})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.results.users.data.map((user) => (
                      <div key={user.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.username}</h4>
                            <p className="text-sm text-gray-600">{user.role}</p>
                          </div>
                        </div>
                        {user.profile && (
                          <div className="space-y-2">
                            {user.profile.bio && (
                              <p className="text-sm text-gray-600 line-clamp-2">{user.profile.bio}</p>
                            )}
                            {user.profile.location && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {user.profile.location}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {results.results?.posts && results.results.posts.data.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Posts ({results.results.posts.count})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.results.posts.data.map((post) => (
                      <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 line-clamp-2">{post.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded ${
                              post.postType === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {post.postType}
                            </span>
                            <span className="text-xs text-gray-500">{post.category}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{post.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {post.location && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {post.location}
                              </p>
                            )}
                            {post.price && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {post.price}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Results for specific search type */}
              {(searchType === 'users' && results.users) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.users.map((user) => (
                      <div key={user.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{user.username}</h4>
                            <p className="text-sm text-gray-600">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(searchType === 'posts' && results.posts) && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.posts.map((post) => (
                      <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{post.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.totalResults === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No results found for "{results.query}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try different keywords or adjust your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
