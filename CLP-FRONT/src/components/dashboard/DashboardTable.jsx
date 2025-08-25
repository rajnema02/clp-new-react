import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Key,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import apiService from "../../Services/api.service";

const DashboardTable = () => {
  // State management
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    full_name: "",
    mobile: "",
    email: "",
    course: "",
    district: "",
    transaction_id: "",
    created_at: "",
    transaction_at: ""
  });

  const filterOptions = [
    { label: "Form Pending", value: { formStatus: false }, icon: User, color: "bg-blue-100 text-blue-800" },
    { label: "Form Filled", value: { formStatus: true, is_profileVerified: false }, icon: FileText, color: "bg-yellow-100 text-yellow-800" },
    { label: "Profile Verified", value: { formStatus: true, is_profileVerified: true }, icon: CheckCircle, color: "bg-green-100 text-green-800" },
    { label: "Rejected Form", value: { is_profileRejected: true, is_spam: false }, icon: XCircle, color: "bg-red-100 text-red-800" },
    { label: "Spam Form", value: { is_spam: true }, icon: AlertTriangle, color: "bg-orange-100 text-orange-800" }
  ];

  // Initialize component
  useEffect(() => {
    fetchUserList();
  }, [currentPage, selectedFilter]);

  // API calls with explicit query string building
  const fetchUserList = async () => {
    setLoading(true);
    try {
      // Build query parameters exactly like Angular
      const queryData = {
        page: currentPage,
        limit: itemsPerPage,
        is_inactive: false,
        role: "user"
      };

      // Add selected filter conditions (matching Angular formQueries)
      if (selectedFilter) {
        Object.keys(selectedFilter).forEach(key => {
          queryData[key] = selectedFilter[key];
        });
      }

      // Add individual field filters (matching Angular logic)
      if (filters.full_name) {
        queryData["full_name"] = filters.full_name;
      }
      if (filters.email) {
        queryData["email"] = filters.email;
      }
      if (filters.course) {
        queryData["course_code"] = filters.course; // Angular uses course_code
      }
      if (filters.mobile) {
        queryData["mobile"] = filters.mobile;
      }
      if (filters.district) {
        queryData["district"] = filters.district;
      }
      if (filters.transaction_id) {
        queryData["transaction_id"] = filters.transaction_id;
      }
      if (filters.created_at) {
        queryData["created_at"] = filters.created_at + "T00:00:00.000Z";
      }
      if (filters.transaction_at) {
        queryData["transaction_at"] = filters.transaction_at + "T00:00:00.000Z";
      }

      console.log('API Query Data:', queryData);

      // Use the params option of axios to properly send query parameters
      const response = await apiService.get("user", { params: queryData });
      
      // Ensure userList is always an array (matching Angular response structure)
      let users = [];
      let totalCount = 0;
      
      console.log('Full API Response:', response);
      
      if (response && response.data) {
        // Handle the Angular response structure
        if (response.data.data && Array.isArray(response.data.data)) {
          users = response.data.data;
          totalCount = response.data.meta?.total || users.length;
        } else if (Array.isArray(response.data)) {
          users = response.data;
          totalCount = response.data.length;
        } else if (response.data.userList && Array.isArray(response.data.userList)) {
          users = response.data.userList;
          totalCount = response.data.listCount || users.length;
        }
      }

      setUserList(users);
      setTotalItems(totalCount);
      
      console.log('Processed Response:', { users: users.length, total: totalCount });

    } catch (error) {
      console.error("Error fetching user list:", error);
      setUserList([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Action handlers (matching Angular methods exactly)
  const handleVerifyProfile = async (id) => {
    if (window.confirm("Are you sure !!! You want to verify this form")) {
      try {
        const queryData = { is_profileVerified: true };
        await apiService.put(`user/${id}`, queryData);
        fetchUserList();
      } catch (error) {
        console.error("Error verifying profile:", error);
      }
    }
  };

  const handleRejectProfile = async (id) => {
    if (window.confirm("Are you sure !!! You want to reject this form")) {
      try {
        const queryData = { formStatus: false };
        await apiService.put("user/updateReject", id, queryData);
        fetchUserList();
      } catch (error) {
        console.error("Error rejecting profile:", error);
      }
    }
  };

  const handleSpamProfile = async (id) => {
    if (window.confirm("Are you sure !!! You want to reject and mark SPAM this form")) {
      try {
        const queryData = {
          formStatus: false,
          is_profileRejected: true,
          is_spam: true
        };
        await apiService.put("user/updateReject", id, queryData);
        fetchUserList();
      } catch (error) {
        console.error("Error marking as spam:", error);
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchUserList();
  };

  const clearFilters = () => {
    setFilters({
      full_name: "",
      mobile: "",
      email: "",
      course: "",
      district: "",
      transaction_id: "",
      created_at: "",
      transaction_at: ""
    });
    setSelectedFilter(null);
    setCurrentPage(1);
    fetchUserList();
  };

  const exportToCsv = async () => {
    try {
      // Get all data for export (matching Angular limit of 10000)
      const queryData = {
        page: 1,
        limit: 10000,
        is_inactive: false,
        role: "user"
      };

      // Add selected filter conditions
      if (selectedFilter) {
        Object.keys(selectedFilter).forEach(key => {
          queryData[key] = selectedFilter[key];
        });
      }

      // Add individual field filters (matching Angular logic)
      if (filters.full_name) {
        queryData["full_name"] = filters.full_name;
      }
      if (filters.email) {
        queryData["email"] = filters.email;
      }
      if (filters.course) {
        queryData["course_code"] = filters.course;
      }
      if (filters.mobile) {
        queryData["mobile"] = filters.mobile;
      }
      if (filters.district) {
        queryData["district"] = filters.district;
      }
      if (filters.transaction_id) {
        queryData["transaction_id"] = filters.transaction_id;
      }
      if (filters.created_at) {
        queryData["created_at"] = filters.created_at + "T00:00:00.000Z";
      }
      if (filters.transaction_at) {
        queryData["transaction_at"] = filters.transaction_at + "T00:00:00.000Z";
      }

      // Use the params option of axios to properly send query parameters
      const response = await apiService.get("user", { params: queryData });
      
      let allUsers = [];
      if (response && response.data) {
        // Handle the Angular response structure
        if (response.data.data && Array.isArray(response.data.data)) {
          allUsers = response.data.data;
        } else if (Array.isArray(response.data)) {
          allUsers = response.data;
        } else if (response.data.userList && Array.isArray(response.data.userList)) {
          allUsers = response.data.userList;
        }
      }
      
      // Create CSV data (matching Angular export format exactly)
      const dataToExport = allUsers.map(user => ({
        "Applicant Name": user.full_name || "",
        "Mobile": user.mobile || "",
        "Email": user.email || "",
        "District": user.district || "",
        "Reg. Date": user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : "",
        "Amount": user.amount || "",
        "Transaction ID": user.transaction_id || "",
        "Amount-2": user.amount_2 || "",
        "Transaction ID-2": user.transaction_id_2 || ""
      }));

      // Convert to CSV (matching Angular CSV service)
      if (dataToExport.length === 0) {
        console.log("No data to export");
        return;
      }

      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      // Download CSV (matching Angular filename "result.csv")
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'result.csv'); // Angular uses "result.csv"
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_spam) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" /> Spam Form
      </span>;
    }
    
    if (!user.formStatus && !user.is_profileVerified) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <User className="w-3 h-3 mr-1" /> Form Pending
      </span>;
    }
    
    if (user.formStatus && !user.is_profileVerified) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FileText className="w-3 h-3 mr-1" /> Form Filled
      </span>;
    }
    
    if (user.formStatus && user.is_profileVerified) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" /> Verified
      </span>;
    }
    
    return null;
  };

  // Helper function to compare filter objects
  const isFilterSelected = (filterValue) => {
    if (!selectedFilter || !filterValue) return false;
    return JSON.stringify(selectedFilter) === JSON.stringify(filterValue);
  };

  // Get image URL helper
  const getImageUrl = (filename) => {
    if (!filename) return '/images/placeholders/photo.png';
    return `/file/download/${filename}`;
  };

  // Admin Dashboard View Only
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Students List</h1>
              <div className="flex items-center space-x-2 text-white text-sm">
                <span>Total: {totalItems} students</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-1 overflow-x-auto py-4">
              <button
                onClick={() => {
                  setSelectedFilter(null);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  !selectedFilter ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All Students
              </button>
              {filterOptions.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => {
                    setSelectedFilter(filter.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    isFilterSelected(filter.value) ? filter.color : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <filter.icon className="w-4 h-4 inline mr-2" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={exportToCsv}
                className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </button>
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
              </div>
            </div>

            {/* Search Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              <input
                type="text"
                placeholder="Search name..."
                value={filters.full_name}
                onChange={(e) => handleFilterChange('full_name', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Mobile..."
                value={filters.mobile}
                onChange={(e) => handleFilterChange('mobile', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email..."
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Course..."
                value={filters.course}
                onChange={(e) => handleFilterChange('course', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="District..."
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Transaction ID..."
                value={filters.transaction_id}
                onChange={(e) => handleFilterChange('transaction_id', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Registration Date</label>
                <input
                  type="date"
                  value={filters.created_at}
                  onChange={(e) => handleFilterChange('created_at', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Date</label>
                <input
                  type="date"
                  value={filters.transaction_at}
                  onChange={(e) => handleFilterChange('transaction_at', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[280px]">
                    Applicant Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reg. Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      Loading...
                    </td>
                  </tr>
                ) : userList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  userList.map((user, index) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {((currentPage - 1) * itemsPerPage) + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            <div className="mt-1">{getStatusBadge(user)}</div>
                          </div>
                          
                          <div className="flex space-x-4">
                            <div className="text-center">
                              <a href={getImageUrl(user.profile_photo)} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={getImageUrl(user.profile_photo)}
                                  alt="Profile"
                                  className="w-12 h-12 object-cover border rounded-lg"
                                />
                              </a>
                              <div className="text-xs text-gray-500 mt-1">Photo</div>
                            </div>
                            <div className="text-center">
                              <a href={getImageUrl(user.identity_file)} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={getImageUrl(user.identity_file)}
                                  alt="Identity"
                                  className="w-12 h-12 object-cover border rounded-lg"
                                />
                              </a>
                              <div className="text-xs text-gray-500 mt-1">Identity</div>
                            </div>
                            <div className="text-center">
                              <a href={getImageUrl(user.payment_file)} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={getImageUrl(user.payment_file)}
                                  alt="Receipt"
                                  className="w-12 h-12 object-cover border rounded-lg"
                                />
                              </a>
                              {user.payment_file_2 && (
                                <a href={getImageUrl(user.payment_file_2)} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={getImageUrl(user.payment_file_2)}
                                    alt="Receipt 2"
                                    className="w-12 h-12 object-cover border rounded-lg mt-1"
                                  />
                                </a>
                              )}
                              <div className="text-xs text-gray-500 mt-1">Receipt</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.mobile}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.course_code || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.district || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.transaction_id || '--'}
                        {user.transaction_id_2 && (
                          <><br />{user.transaction_id_2}</>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.transaction_at ? 
                          new Date(user.transaction_at).toLocaleDateString('en-GB') : '--'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === user._id ? null : user._id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openDropdown === user._id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                            {!user.formStatus ? (
                              <div className="px-4 py-2 text-sm text-gray-500">
                                Profile Incomplete
                              </div>
                            ) : (
                              <>
                                {!user.is_profileVerified && (
                                  <>
                                    <button
                                      onClick={() => handleVerifyProfile(user._id)}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 transition-colors"
                                    >
                                      <CheckCircle className="w-4 h-4 inline mr-2" />
                                      Profile Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectProfile(user._id)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                    >
                                      <XCircle className="w-4 h-4 inline mr-2" />
                                      Profile Reject
                                    </button>
                                    <button
                                      onClick={() => handleSpamProfile(user._id)}
                                      className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50 transition-colors"
                                    >
                                      <AlertTriangle className="w-4 h-4 inline mr-2" />
                                      Profile Spam
                                    </button>
                                  </>
                                )}
                                {user.is_profileVerified && (
                                  <div className="px-4 py-2 text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4 inline mr-2" />
                                    Profile Approved
                                  </div>
                                )}
                              </>
                            )}
                            
                            <a
                              href={`/receipt/${user._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-4 h-4 inline mr-2" />
                              View Receipt
                            </a>
                            <a
                              href={`/student-profile-form/${user._id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <User className="w-4 h-4 inline mr-2" />
                              View Profile
                            </a>
                            <a
                              href={`/setting/update-password/${user._id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Key className="w-4 h-4 inline mr-2" />
                              Update Password
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > itemsPerPage && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                      currentPage === 1 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => {
                      const page = i + 1;
                      const totalPages = Math.ceil(totalItems / itemsPerPage);
                      
                      // Show first page, last page, current page, and pages around current page
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 3 || 
                        page === currentPage + 3
                      ) {
                        return (
                          <span key={page} className="px-2 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => {
                      const totalPages = Math.ceil(totalItems / itemsPerPage);
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
                      currentPage >= Math.ceil(totalItems / itemsPerPage)
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTable;