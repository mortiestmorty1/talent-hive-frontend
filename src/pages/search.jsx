import { SEARCH_GIGS_ROUTE, SEARCH_JOBS_ROUTE } from "../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SearchGridItem from "../components/search/SearchGridItem";
import { MagnifyingGlass } from "react-loader-spinner";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const search = () => {
  const router = useRouter();
  const { category, q, type } = router.query;
  const [cookies] = useCookies();
  const [gigs, setGigs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState(type || "gigs");
  
  // Filter states
  const [filters, setFilters] = useState({
    category: category || 'all',
    complexity: 'all',
    minBudget: '',
    maxBudget: '',
    timeline: 'all',
    deliveryTime: 'all',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    setSearchType(type || "gigs");
  }, [type]);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        if (searchType === "jobs") {
          const searchParams = { searchTerm: q };
          
          // Add job-specific filters
          if (filters.category !== 'all') searchParams.category = filters.category;
          if (filters.complexity !== 'all') searchParams.complexity = filters.complexity;
          if (filters.minBudget) searchParams.minBudget = filters.minBudget;
          if (filters.maxBudget) searchParams.maxBudget = filters.maxBudget;
          if (filters.timeline !== 'all') searchParams.timeline = filters.timeline;
          
          const { data } = await axios.get(SEARCH_JOBS_ROUTE, {
            headers: { Authorization: `Bearer ${cookies.jwt}` },
            params: searchParams
          });
          setJobs(data.jobs || []);
          setGigs([]);
        } else {
          const searchParams = { searchTerm: q };
          
          // Add gig-specific filters
          if (filters.category !== 'all') searchParams.category = filters.category;
          if (filters.deliveryTime !== 'all') searchParams.deliveryTime = filters.deliveryTime;
          if (filters.minPrice) searchParams.minPrice = filters.minPrice;
          if (filters.maxPrice) searchParams.maxPrice = filters.maxPrice;
          
          const { data } = await axios.get(SEARCH_GIGS_ROUTE, {
            params: searchParams
          });
          setGigs(data.gigs || []);
          setJobs([]);
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error(`Failed to search ${searchType}`);
        setLoading(false);
      }
    };

    if (category || q) getData();
  }, [category, q, searchType, cookies.jwt, filters]);

  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    params.set('type', newType);
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      complexity: 'all',
      minBudget: '',
      maxBudget: '',
      timeline: 'all',
      deliveryTime: 'all',
      minPrice: '',
      maxPrice: ''
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center text-5xl min-h-[76vh]">
        <MagnifyingGlass
          visible={true}
          height="80"
          width="80"
          ariaLabel="MagnifyingGlass-loading"
          wrapperStyle={{}}
          wrapperClass="MagnifyingGlass-wrapper"
          glassColor="#c0efff"
          color="#e15b64"
        />
      </div>
    );

  const currentResults = searchType === "jobs" ? jobs : gigs;
  const resultCount = currentResults.length;

  return (
    <div className="mx-6 md:mx-24 mb-24">
      {/* Header */}
      <div className="mb-8">
        {q && (
          <h3 className="text-3xl md:text-4xl mb-4">
            Results for <b>{q}</b>
          </h3>
        )}
        {category && (
          <h3 className="text-3xl md:text-4xl mb-4">
            Results for <b>{category}</b>
          </h3>
        )}
      </div>

      {/* Search Type Toggle */}
      <div className="mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => handleSearchTypeChange("gigs")}
            className={`py-3 px-6 rounded-lg font-medium transition-colors ${
              searchType === "gigs"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Search Gigs
          </button>
          <button
            onClick={() => handleSearchTypeChange("jobs")}
            className={`py-3 px-6 rounded-lg font-medium transition-colors ${
              searchType === "jobs"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Search Jobs
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="mb-6 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
              <option value="programming">Programming</option>
              <option value="data">Data</option>
              <option value="business">Business</option>
            </select>
          </div>

          {/* Job-specific filters */}
          {searchType === "jobs" ? (
            <>
              {/* Complexity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
                <select
                  value={filters.complexity}
                  onChange={(e) => handleFilterChange('complexity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget ($)</label>
                <input
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget ($)</label>
                <input
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Timeline Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                <select
                  value={filters.timeline}
                  onChange={(e) => handleFilterChange('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Any Timeline</option>
                  <option value="less-than-1-week">Less than 1 week</option>
                  <option value="1-4-weeks">1-4 weeks</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="more-than-3-months">More than 3 months</option>
                </select>
              </div>
            </>
          ) : (
            <>
              {/* Gig-specific filters */}
              {/* Delivery Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                <select
                  value={filters.deliveryTime}
                  onChange={(e) => handleFilterChange('deliveryTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Any Time</option>
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">1 week</option>
                  <option value="14">2 weeks</option>
                  <option value="30">1 month</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price ($)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price ($)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Empty div for grid alignment */}
              <div></div>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="my-4">
          <span className="text-[#74767e] font-medium">
            {resultCount} {searchType === "jobs" ? "jobs" : "services"} available
          </span>
        </div>
        
        {searchType === "jobs" ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer"
                        onClick={() => router.push(`/jobs/${job.id}`)}>
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{job.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>💰 ${job.budget}</span>
                      <span>⏰ {job.timeline}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        job.complexity === 'LOW' ? 'bg-green-100 text-green-800' :
                        job.complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.complexity}
                      </span>
                    </div>
                  </div>
                </div>
                
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <SearchGridItem gig={gig} key={gig.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default search;
