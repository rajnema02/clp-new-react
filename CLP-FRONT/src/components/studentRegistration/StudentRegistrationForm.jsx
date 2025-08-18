import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Mail, Phone, MapPin, Upload, Eye, Check } from 'lucide-react';
import apiService from '../../Services/api.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

import fileService  from '../../Services/file-service'

const StudentRegistrationForm = () => {
  const navigate = useNavigate();
  const { User: authUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [disclaimer, setDisclaimer] = useState(false);
  const [viewFormStatus, setViewFormStatus] = useState(true);
  const [regForm, setRegForm] = useState(false);
  const [specialProgram, setSpecialProgram] = useState(false);
  const [otherProgram, setOtherProgram] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [moduleList, setModuleList] = useState([]);
  const [showModule, setShowModule] = useState(false);
  const [courseFees, setCourseFees] = useState(0);
  const [moduleFees, setModuleFees] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProfileRejected, setIsProfileRejected] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    mobile: '',
    dob: '',
    father_name: '',
    mother_name: '',
    category: '',
    gender: '',
    home_address: '',
    city: '',
    country: 'India',
    postal_code: '',
    profile_photo: '',
    identity_file: '',
    whatsapp: '',
    
    // Course Information
    course_type: '',
    course_code: '',
    course_name: '',
    module_name: '',
    mode: 'Online',
    employeeType: '',
    
    // Organization Details
    department: '',
    companyType: '',
    company: '',
    designation: '',
    office: '',
    block: '',
    district: '',
    pin_code: '',
    state: 'Madhya Pradesh',
    
    // Education Details
    passing_year_10: '',
    marks_10: '',
    marksheet_10: '',
    passing_year_12: '',
    marks_12: '',
    marksheet_12: '',
    passing_year_graduation: '',
    marks_graduation: '',
    marksheet_graduation: '',
    
    // Payment Details
    amount: '',
    transaction_id: '',
    transaction_at: new Date().toISOString().split('T')[0],
    payment_file: '',
    amount_2: '',
    transaction_id_2: '',
    payment_file_2: '',
    paymentStatus: 'pending',
    formStatus: 'false'
  });

  const [uploadStatus, setUploadStatus] = useState({
    profile_photo: false,
    identity_file: false,
    marksheet_10: false,
    marksheet_12: false,
    marksheet_graduation: false,
    payment_file: false,
    payment_file_2: false
  });

  const districts = [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
    'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara',
    'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior',
    'Harda', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone',
    'Mandla', 'Mandsaur', 'Morena', 'Narmadapuram', 'Narsinghpur', 'Neemuch',
    'Niwari', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar',
    'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri',
    'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'
  ];

  const categories = ['General', 'OBC', 'SC', 'ST', 'Minority'];
  const genders = ['Male', 'Female', 'Other'];

  // Fetch initial data
   useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        // Fetch user details
        const userResponse = await apiService.get(`user/${userId}`);
        const userDetails = userResponse.data;
        
        if (userDetails.formStatus === 'true') {
          toast.info('You already submitted this form!', {
            position: 'top-center',
            autoClose: 3000
          });
          navigate('/dashboard');
          return;
        }

        setIsProfileRejected(userDetails.is_profileRejected || false);
        
        // Pre-fill form with user data
        const prefilledData = {
          full_name: userDetails.full_name || '',
          email: userDetails.email || '',
          mobile: userDetails.mobile || '',
          dob: userDetails.dob || '',
          father_name: userDetails.father_name || '',
          mother_name: userDetails.mother_name || '',
          category: userDetails.category || '',
          gender: userDetails.gender || '',
          home_address: userDetails.home_address || '',
          city: userDetails.city || '',
          country: userDetails.country || 'India',
          postal_code: userDetails.postal_code || '',
          profile_photo: userDetails.profile_photo || '',
          identity_file: userDetails.identity_file || '',
          whatsapp: userDetails.whatsapp || '',
          department: userDetails.department || '',
          employeeType: userDetails.employeeType || '',
          companyType: userDetails.companyType || '',
          company: userDetails.company || '',
          designation: userDetails.designation || '',
          office: userDetails.office || '',
          block: userDetails.block || '',
          district: userDetails.district || '',
          pin_code: userDetails.pin_code || '',
          state: userDetails.state || 'Madhya Pradesh',
          course_code: userDetails.course_code || '',
          course_type: userDetails.course_type || '',
          module_name: userDetails.module_name || '',
          mode: userDetails.mode || 'Online',
          amount: userDetails.amount || '',
          transaction_id: userDetails.transaction_id || '',
          payment_file: userDetails.payment_file || '',
          amount_2: userDetails.amount_2 || '',
          transaction_id_2: userDetails.transaction_id_2 || '',
          payment_file_2: userDetails.payment_file_2 || '',
          passing_year_10: userDetails.passing_year_10 || '',
          marks_10: userDetails.marks_10 || '',
          marksheet_10: userDetails.marksheet_10 || '',
          passing_year_12: userDetails.passing_year_12 || '',
          marks_12: userDetails.marks_12 || '',
          marksheet_12: userDetails.marksheet_12 || '',
          passing_year_graduation: userDetails.passing_year_graduation || '',
          marks_graduation: userDetails.marks_graduation || '',
          marksheet_graduation: userDetails.marksheet_graduation || ''
        };
        
        setFormData(prefilledData);
        
        // Set uploaded status for files that exist
        const newUploadStatus = {...uploadStatus};
        if (userDetails.profile_photo) newUploadStatus.profile_photo = true;
        if (userDetails.identity_file) newUploadStatus.identity_file = true;
        if (userDetails.marksheet_10) newUploadStatus.marksheet_10 = true;
        if (userDetails.marksheet_12) newUploadStatus.marksheet_12 = true;
        if (userDetails.marksheet_graduation) newUploadStatus.marksheet_graduation = true;
        if (userDetails.payment_file) newUploadStatus.payment_file = true;
        if (userDetails.payment_file_2) newUploadStatus.payment_file_2 = true;
        setUploadStatus(newUploadStatus);
        
        // If course type exists, fetch courses
        if (userDetails.course_type) {
          getCourseList(userDetails.course_type);
        }

        // Fetch departments
        const deptResponse = await apiService.get('department');
        setDepartments(deptResponse.data.data);

      } catch (error) {
        console.error('Error fetching initial data:', error);
        let errorMessage = 'Failed to load initial data. Please refresh the page.';
        
        if (error.response) {
          if (error.response.status === 401) {
            // Unauthorized - likely token expired
            localStorage.removeItem('userId');
            navigate('/login');
            return;
          }
          errorMessage = error.response.data.message || errorMessage;
        }
        
        toast.error(errorMessage, {
          position: 'top-center',
          autoClose: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const getCourseForm = (programType) => {
    switch (programType) {
      case 'Special':
        setFormTitle('Cyber Security Training Program');
        setRegForm(true);
        setSpecialProgram(true);
        setOtherProgram(false);
        setCourseFees(15000);
        break;
      case 'Other':
        setFormTitle('Certification / Diploma/ E-Learning Programs');
        setRegForm(true);
        setSpecialProgram(false);
        setOtherProgram(true);
        break;
      default:
        break;
    }
  };

  const getCourseList = async (courseType) => {
    try {
      console.log('Fetching courses for type:', courseType);
      const response = await apiService.get('course', {
        params: { course_type: courseType }
      });
      console.log('Course list response:', response);
      if (response?.data?.data) {
        setCourseList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching course list:', error);
      setError('Failed to load courses. Please try again.');
    }
  };

  const getBatch = async (courseCode) => {
    const courseName = courseCode.split('-')[0];
    try {
      // Fetch course details
      const courseResponse = await apiService.get('course', {
        params: { course_name: courseName }
      });
      
      if (courseResponse?.data?.data?.length > 0) {
        setCourseFees(courseResponse.data.data[0].fees || 0);
        setModuleFees(0);
      }
      
      // Fetch modules if they exist
      const moduleResponse = await apiService.get('coursemodule', {
        params: { course_name: courseName }
      });
      
      if (moduleResponse?.data?.data?.length > 0) {
        setModuleList(moduleResponse.data.data);
        setShowModule(true);
      } else {
        setShowModule(false);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const getModuleData = async (moduleId) => {
    try {
      const response = await apiService.get(`coursemodule/${moduleId}`);
      if (response?.data) {
        setModuleFees(response.data.module_fee || 0);
        setFormData(prev => ({
          ...prev,
          module_name: response.data.module_name || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const viewForm = () => {
    setViewFormStatus(false);
  };

  const backToForm = () => {
    setViewFormStatus(true);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!disclaimer) {
    toast.error('Please accept the disclaimer before submitting', {
      position: 'top-center',
      autoClose: 3000
    });
    return;
  }
  
  try {
    setIsLoading(true);
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      navigate('/login');
      return;
    }

    // Prepare final form data
    const submissionData = {
      ...formData,
      formStatus: 'true',
      paymentStatus: 'pending',
      transaction_at: new Date().toISOString(),
      amount: courseFees + moduleFees
    };
    
    // Submit the form
    const response = await apiService.put(`user/${userId}`, submissionData);
    
    if (response.data) {
      toast.success('Your form has been submitted successfully!',
        alert('Form Submitted succefully') ,{
        position: 'top-center',
        autoClose: 3000
      });
      navigate('/student-dashboard', { replace: true });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    let errorMessage = 'Failed to submit form. Please try again.';
    
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('userId');
        navigate('/login');
        return;
      }
      errorMessage = error.response.data.message || errorMessage;
    }
    
    toast.error(errorMessage, {
      position: 'top-center',
      autoClose: 5000
    });
  } finally {
    setIsLoading(false);
  }
};

const handleFileUpload = async (e, fieldName) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    toast.error('Invalid file type. Please upload JPEG, PNG, GIF, or PDF.', {
      position: 'top-center',
      autoClose: 5000
    });
    return;
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error('File size too large. Maximum 5MB allowed.', {
      position: 'top-center',
      autoClose: 5000
    });
    return;
  }

  try {
    setIsLoading(true);
    
    // Upload the file using the fileService
    const filePath = await fileService.uploadFile(file);
    
    // Update form data with the file path
    setFormData(prev => ({
      ...prev,
      [fieldName]: filePath
    }));

    // Update upload status
    setUploadStatus(prev => ({
      ...prev,
      [fieldName]: true
    }));

    toast.success('File uploaded successfully!', {
      position: 'top-center',
      autoClose: 3000
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error(error.response?.data?.message || 'Failed to upload file. Please try again.', {
      position: 'top-center',
      autoClose: 5000
    });
  } finally {
    setIsLoading(false);
    e.target.value = ''; // Reset the file input
  }
};

  const printForm = () => {
    window.print();
  };

  // Loading state - show this while fetching initial data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state - show this if there's an error
  if (error && !User) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Error Loading Form</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!viewFormStatus) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <img src="/api/placeholder/200/100" alt="CEDMAP Logo" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">REGISTRATION FORM</h1>
            <h2 className="text-xl text-blue-600 mt-2">{formTitle}</h2>
          </div>

          <div className="space-y-6">
            {/* User Information Display */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex">
                  <span className="font-medium w-32">Name:</span>
                  <span>{formData.full_name}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Father's Name:</span>
                  <span>{formData.father_name}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Email:</span>
                  <span>{formData.email}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Phone:</span>
                  <span>{formData.mobile}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Date of Birth:</span>
                  <span>{formData.dob}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Gender:</span>
                  <span>{formData.gender}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Category:</span>
                  <span>{formData.category}</span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Correspondence Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex md:col-span-2">
                  <span className="font-medium w-32">Address:</span>
                  <span>{formData.home_address}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">State:</span>
                  <span>{formData.state}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">City:</span>
                  <span>{formData.city}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Pin Code:</span>
                  <span>{formData.postal_code}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Country:</span>
                  <span>{formData.country}</span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Course Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex">
                  <span className="font-medium w-32">Course Type:</span>
                  <span>{formData.course_type}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Course:</span>
                  <span className="text-lg text-blue-600 font-medium">{formData.course_code}</span>
                </div>
                {formData.module_name && (
                  <div className="flex">
                    <span className="font-medium w-32">Module:</span>
                    <span>{formData.module_name}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="font-medium w-32">Mode:</span>
                  <span>{formData.mode}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-32">Total Fees:</span>
                  <span className="text-lg font-bold">₹{courseFees + moduleFees}</span>
                </div>
              </div>
            </div>

            {/* Department Information */}
            {(formData.department || formData.employeeType) && (
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Department/Organization Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.department && (
                    <div className="flex">
                      <span className="font-medium w-32">Department:</span>
                      <span>{formData.department}</span>
                    </div>
                  )}
                  {formData.employeeType && (
                    <div className="flex">
                      <span className="font-medium w-32">Employee Type:</span>
                      <span>{formData.employeeType}</span>
                    </div>
                  )}
                  {formData.company && (
                    <div className="flex">
                      <span className="font-medium w-32">Company:</span>
                      <span>{formData.company}</span>
                    </div>
                  )}
                  {formData.designation && (
                    <div className="flex">
                      <span className="font-medium w-32">Designation:</span>
                      <span>{formData.designation}</span>
                    </div>
                  )}
                  {formData.office && (
                    <div className="flex">
                      <span className="font-medium w-32">Office:</span>
                      <span>{formData.office}</span>
                    </div>
                  )}
                  {formData.block && (
                    <div className="flex">
                      <span className="font-medium w-32">Block:</span>
                      <span>{formData.block}</span>
                    </div>
                  )}
                  {formData.district && (
                    <div className="flex">
                      <span className="font-medium w-32">District:</span>
                      <span>{formData.district}</span>
                    </div>
                  )}
                  {formData.pin_code && (
                    <div className="flex">
                      <span className="font-medium w-32">Pin Code:</span>
                      <span>{formData.pin_code}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education Details */}
            {(formData.passing_year_10 || formData.passing_year_12 || formData.passing_year_graduation) && (
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Education Details</h3>
                {formData.passing_year_10 && (
                  <div className="mb-4">
                    <h4 className="font-medium border-b pb-1 mb-2">10th Class</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">Passing Year: </span>
                        <span>{formData.passing_year_10}</span>
                      </div>
                      <div>
                        <span className="font-medium">Marks: </span>
                        <span>{formData.marks_10}</span>
                      </div>
                    </div>
                  </div>
                )}
                {formData.passing_year_12 && (
                  <div className="mb-4">
                    <h4 className="font-medium border-b pb-1 mb-2">12th Class</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">Passing Year: </span>
                        <span>{formData.passing_year_12}</span>
                      </div>
                      <div>
                        <span className="font-medium">Marks: </span>
                        <span>{formData.marks_12}</span>
                      </div>
                    </div>
                  </div>
                )}
                {formData.passing_year_graduation && (
                  <div>
                    <h4 className="font-medium border-b pb-1 mb-2">Graduation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium">Passing Year: </span>
                        <span>{formData.passing_year_graduation}</span>
                      </div>
                      <div>
                        <span className="font-medium">Marks: </span>
                        <span>{formData.marks_graduation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Details */}
            {formData.amount && (
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex">
                    <span className="font-medium w-32">Amount Paid:</span>
                    <span>₹{formData.amount}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">Transaction ID:</span>
                    <span>{formData.transaction_id}</span>
                  </div>
                  {formData.amount_2 && (
                    <>
                      <div className="flex">
                        <span className="font-medium w-32">Second Amount:</span>
                        <span>₹{formData.amount_2}</span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-32">Second Transaction ID:</span>
                        <span>{formData.transaction_id_2}</span>
                      </div>
                    </>
                  )}
                  <div className="flex">
                    <span className="font-medium w-32">Payment Date:</span>
                    <span>{formData.transaction_at}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Declaration */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <p className="text-sm text-gray-700 mb-4">
                I declare that the above information given by me in the application form is correct and I will follow all the following rules. 
                If any information given by me is found to be false or the rules are not followed, then my application will be canceled and 
                all the responsibility of any kind of loss will be mine.
              </p>
              <p className="text-sm text-gray-700">
                मैं घोषणा करता/करती हूं कि मेरे द्वारा आवेदन पत्र में दी गई उपरोक्त जानकारी सही है तथा मैं निम्नलिखित सभी नियम का पालन करूँगा/करुँगी।
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-8 print:hidden">
            <button 
              onClick={backToForm}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button 
              onClick={printForm}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 h-20"></div>
      
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-lg">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Step 1: Profile Information */}
            {currentStep === 1 && (
              <div className="p-8">
                <div className="bg-gray-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Profile</h3>
                  </div>
                  
                  <p className="text-red-600 font-medium mb-6">All fields are necessary</p>
                  
                  <h4 className="text-lg font-semibold mb-4">User Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Name"
                        required
                      />
                      <small className="text-gray-500">Name</small>
                    </div>
                    
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email Id"
                        required
                      />
                      <small className="text-gray-500">Email</small>
                    </div>
                    
                    <div>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Phone"
                        required
                      />
                      <small className="text-gray-500">Phone</small>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        name="father_name"
                        value={formData.father_name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Father Name"
                        required
                      />
                      <small className="text-gray-500">Father's Name</small>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        name="mother_name"
                        value={formData.mother_name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mother Name"
                        required
                      />
                      <small className="text-gray-500">Mother's Name</small>
                    </div>
                    
                    <div>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Date of Birth"
                        required
                      />
                      <small className="text-gray-500">Date of Birth</small>
                    </div>
                    
                    <div>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="" disabled>Select Gender</option>
                        {genders.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                      <small className="text-gray-500">Gender</small>
                    </div>
                    
                    <div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <small className="text-gray-500">Category</small>
                    </div>
                  </div>

                  <hr className="my-6" />
                  
                  <h4 className="text-lg font-semibold mb-2">Correspondence Address</h4>
                  <p className="text-red-600 mb-4">आवेदक अपना पता एवं पिन कोड सही लिखे । इसी पते पर अध्ययन सामग्री एवं अन्य दस्तावेज भेजे जाएंगे ।</p>
                  
                  <div className="space-y-6">
                    <div>
                      <input
                        type="text"
                        name="home_address"
                        value={formData.home_address}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Home Address"
                        required
                      />
                      <small className="text-gray-500">Address</small>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                        </select>
                        <small className="text-gray-500">State</small>
                      </div>
                      
                      <div>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="City"
                          required
                        />
                        <small className="text-gray-500">City</small>
                      </div>
                      
                      <div>
                        <input
                          type="number"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Postal code"
                          min="100000"
                          max="999999"
                          required
                        />
                        <small className="text-gray-500">Pin Code</small>
                      </div>
                    </div>
                  </div>

                  <hr className="my-6" />
                  
                  <h4 className="text-lg font-semibold mb-4">About me</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
  <label className="block text-gray-700 mb-2">Profile Photo</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.profile_photo ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'profile_photo')}
        accept="image/*"
      />
    </label>
    {uploadStatus.profile_photo && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>
                    
                    <div className="mb-4">
  <label className="block text-gray-700 mb-2">Identity Proof (Aadhar/Passport/Driving License)</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.identity_file ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'identity_file')}
        accept="image/*,application/pdf"
      />
    </label>
    {uploadStatus.identity_file && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Registration Form */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="bg-gray-100 rounded-lg p-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold uppercase mb-4">REGISTRATION FORM</h1>
                    <h2 className="text-xl text-blue-600">{formTitle}</h2>
                  </div>

                  {!regForm ? (
                    <div className="flex justify-center">
                      <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="text-center">
                          <input
                            type="radio"
                            id="special"
                            name="program"
                            value="Special"
                            onChange={(e) => getCourseForm(e.target.value)}
                            className="mr-3"
                          />
                          <label htmlFor="special" className="text-lg font-medium">
                            Cyber Security Training Program
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-600 font-medium mb-6">All fields are necessary</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {specialProgram && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Course Type</label>
                            <select
                              name="course_type"
                              value={formData.course_type}
                              onChange={(e) => {
                                handleInputChange(e);
                                getCourseList(e.target.value);
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="" disabled>Select Course Type</option>
                              <option value="Cyber Security Training Program">Cyber Security Training Program</option>
                              <option value="Training program for Govt Organisation">Training program for Govt Organisation</option>
    <option value="Internship Program">Internship Program</option>
    <option value="Regular Course">Regular Course </option>
    <option value="E-Learning Course">E-Learning Course</option>
                            </select>
                          </div>
                        )}
                        
                        {otherProgram && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Course Type</label>
                            <select
                              name="course_type"
                              value={formData.course_type}
                              onChange={(e) => {
                                handleInputChange(e);
                                getCourseList(e.target.value);
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="" disabled>Select Course Type</option>
                              <option value="Internship Program">Internship Program</option>
                              <option value="Regular Course">Regular Course</option>
                              <option value="E-Learning Course">E-Learning Course</option>
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">Course Name</label>
                          <select
                            name="course_code"
                            value={formData.course_code}
                            onChange={(e) => {
                              handleInputChange(e);
                              getBatch(e.target.value);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="" disabled>Select Course name</option>
                            {courseList.map((course) => (
                              <option key={course.course_code} value={`${course.course_name}-${course.course_code}`}>
                                {course.course_name}-{course.course_code}
                              </option>
                            ))}
                          </select>
                          {formData.course_code && (
                            <small className="text-green-600">{formData.course_code}</small>
                          )}
                        </div>
                      </div>

                      {showModule && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium mb-2">Module Name</label>
                          <select
                            name="module_name"
                            value={formData.module_name}
                            onChange={(e) => {
                              handleInputChange(e);
                              getModuleData(e.target.value);
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="" disabled>Select Module</option>
                            {moduleList.map((module) => (
                              <option key={module.id} value={module.id}>
                                {module.module_name} (₹{module.module_fee})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-medium mb-2">Course Mode</label>
                          <select
                            name="mode"
                            value={formData.mode}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="Online">Online</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </div>

                        {otherProgram && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Are You ?</label>
                            <select
                              name="employeeType"
                              value={formData.employeeType}
                              onChange={handleInputChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="Student">Student</option>
                              <option value="Professional">Professional</option>
                            </select>
                            <small className="text-gray-500">Select Profession</small>
                          </div>
                        )}
                      </div>

                      {/* Education Details for E-Learning Students */}
                      {formData.course_type === 'E-Learning Course' && formData.employeeType === 'Student' && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">Education Details</h3>
                          
                          <div className="space-y-8">
                            {/* 10th Class */}
                            <div className="mb-4">
  <label className="block text-gray-700 mb-2">10th Marksheet</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.marksheet_10 ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'marksheet_10')}
        accept="image/*,application/pdf"
      />
    </label>
    {uploadStatus.marksheet_10 && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>

                            {/* 12th Class */}
                            <div className="mb-4">
  <label className="block text-gray-700 mb-2">12th Marksheet</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.marksheet_12 ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'marksheet_12')}
        accept="image/*,application/pdf"
      />
    </label>
    {uploadStatus.marksheet_12 && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>

                            {/* Graduation */}
                            <div className="mb-4">
  <label className="block text-gray-700 mb-2">Graduation Marksheet</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.marksheet_graduation ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'marksheet_graduation')}
        accept="image/*,application/pdf"
      />
    </label>
    {uploadStatus.marksheet_graduation && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>
                          </div>
                        </div>
                      )}

                      {/* Professional Details */}
                      {formData.employeeType === 'Professional' && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">Organisation/Dept. Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Department"
                                required
                              />
                              <small className="text-gray-500">Department</small>
                            </div>
                            <div>
                              <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Designation"
                                required
                              />
                              <small className="text-gray-500">Designation</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Special Program Organization Details */}
                      {formData.course_type !== 'E-Learning Course' && specialProgram && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">Organisation/Dept. Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <select
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="" disabled>--Select Department--</option>
                                {departments.map((dept) => (
                                  <option key={dept.id} value={dept.name}>
                                    {dept.name}
                                  </option>
                                ))}
                              </select>
                              <small className="text-gray-500">Department</small>
                            </div>
                            <div>
                              <select
                                name="employeeType"
                                value={formData.employeeType}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="" disabled>Employee Type</option>
                                <option value="Outsource Employee">Outsource Employee</option>
                                <option value="Government Officers">Government Officers</option>
                              </select>
                              <small className="text-gray-500">Employee Type</small>
                            </div>
                            
                            {formData.employeeType === 'Outsource Employee' && (
                              <>
                                <div>
                                  <select
                                    name="companyType"
                                    value={formData.companyType}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  >
                                    <option value="" disabled>Company Type</option>
                                    <option value="Government Organisation">Government Organisation</option>
                                    <option value="Others">Others</option>
                                  </select>
                                  <small className="text-gray-500">Company Type</small>
                                </div>
                                <div>
                                  <select
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  >
                                    <option value="" disabled>Company</option>
                                    <option value="CEDMAP">CEDMAP</option>
                                    <option value="Others">Others</option>
                                  </select>
                                  <small className="text-gray-500">Company</small>
                                </div>
                              </>
                            )}
                            
                            <div>
                              <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Designation"
                                required
                              />
                              <small className="text-gray-500">Designation</small>
                            </div>
                            <div>
                              <input
                                type="text"
                                name="office"
                                value={formData.office}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Office"
                                required
                              />
                              <small className="text-gray-500">Office</small>
                            </div>
                            <div>
                              <input
                                type="text"
                                name="block"
                                value={formData.block}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Block"
                                required
                              />
                              <small className="text-gray-500">Block</small>
                            </div>
                            <div>
                              <select
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                              </select>
                              <small className="text-gray-500">State</small>
                            </div>
                            <div>
                              <select
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="" disabled>District</option>
                                {districts.map((district) => (
                                  <option key={district} value={district}>
                                    {district}
                                  </option>
                                ))}
                              </select>
                              <small className="text-gray-500">District</small>
                            </div>
                            <div>
                              <input
                                type="number"
                                name="pin_code"
                                value={formData.pin_code}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="PIN Code"
                                min="100000"
                                max="999999"
                                required
                              />
                              <small className="text-gray-500">Pin Code</small>
                            </div>
                          </div>
                        </div>
                      )}

                      <hr className="my-6" />

                      <h3 className="text-lg font-semibold mb-4">Participant Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Participant Name"
                            required
                          />
                          <small className="text-gray-500">Name</small>
                        </div>
                        <div>
                          <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Designation"
                            required
                          />
                          <small className="text-gray-500">Designation</small>
                        </div>
                        <div>
                          <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mobile No"
                            required
                          />
                          <small className="text-gray-500">Mobile</small>
                        </div>
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Email Id"
                            required
                          />
                          <small className="text-gray-500">Email</small>
                        </div>
                      </div>

                      {/* Declaration */}
                      <div className="mt-6">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            id="disclaimer"
                            checked={disclaimer}
                            onChange={(e) => setDisclaimer(e.target.checked)}
                            className="mt-1 mr-3"
                            required
                          />
                          <div className="text-sm text-gray-700">
                            <p className="mb-4">
                              I declare that the above information given by me in the application form is correct and I 
                              will follow all the following rules. If any information given by me is found to be false 
                              or the rules are not followed, then my application will be canceled and all the 
                              responsibility of any kind of loss will be mine.<br />
                              I give permission to share/use the information submitted by me with CEDMAP affiliates.
                            </p>
                            <p>
                              मैं घोषणा करता/करती हूं कि मेरे द्वारा आवेदन पत्र में दी गई उपरोक्त जानकारी सही है तथा मैं 
                              निम्नलिखित सभी नियम का पालन करूँगा/करुँगी| यदि मेरे द्वारा दी कोई भी जानकारी असत्य पायी जाती 
                              हें या नियमो का पालन नहीं होता है, तो मेरा आवेदन निरस्त कर दिया जाये एवं किसी भी प्रकार 
                              की हानि का समस्त उत्तरदायित्व मेरा होगा।<br />
                              मेरे द्वारा प्रस्तुत जानकारी को मैं CEDMAP की सहयोगी संस्था को शेयर/उपयोग करने की अनुमति 
                              देता/देती हूँ ।
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                  <div className="flex space-x-4">
                    {formData.employeeType === 'Government Officers' ? (
                      <>
                        <button
                          type="button"
                          onClick={viewForm}
                          className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </button>
                        <button
                          type="submit"
                          disabled={!disclaimer}
                          className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          Submit
                          <Check className="w-4 h-4 ml-2" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!disclaimer}
                        className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && formData.employeeType !== 'Government Officers' && (
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-2xl font-bold mb-6">Payment Page</h1>
                  <h2 className="text-xl text-center mb-6">Please make your Payment to following Details:</h2>
                  
                  {/* Bank Details */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <ul className="space-y-2">
                          <li className="font-semibold">Bank Account Detail</li>
                          <li className="font-semibold">Bank Name</li>
                          <li className="font-semibold">Account</li>
                          <li className="font-semibold">IFSC Code</li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-2">
                          <li className="font-semibold">CEDMAP</li>
                          <li className="font-semibold">Central Bank of India</li>
                          <li className="font-bold">3226335156</li>
                          <li className="font-bold">CBIN0283312</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600 font-medium">
                      सूचना: यदि किसी कारणवश यूपीआई (UPI) से एक बार में पूर्ण प्रशिक्षण शुल्क रुपए ₹{courseFees + moduleFees} का भुगतान 
                      नहीं कर पाते हैं तो 2 बार में भुगतान किया जा सकता है तथा दोनों भुगतान की जानकारी को अपलोड 
                      कर सकते हैं पूर्ण भुगतान प्राप्त होने पर ही पंजीयन सत्यापित किया जा सकेगा।
                    </p>
                  </div>

                  {/* Payment Form */}
                  <div className="bg-white border rounded-lg p-6">
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Amount to Pay</label>
                      <input
                        type="text"
                        value={`₹${courseFees + moduleFees}`}
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <input
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Amount Paid"
                          min="0"
                          max={courseFees + moduleFees}
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="transaction_id"
                          value={formData.transaction_id}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter Transaction Id"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="date"
                          name="transaction_at"
                          value={formData.transaction_at}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
  <label className="block text-gray-700 mb-2">Payment Receipt</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.payment_file ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'payment_file')}
        accept="image/*,application/pdf"
      />
    </label>
    {uploadStatus.payment_file && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>

                    {/* Second Payment (Optional) */}
                    <div className="mb-4">
  <label className="block text-gray-700 mb-2">Second Payment Receipt (if applicable)</label>
  <div className="flex items-center">
    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
      <Upload className="w-4 h-4 mr-2" />
      {uploadStatus.payment_file_2 ? 'Change' : 'Upload'}
      <input 
        type="file" 
        className="hidden" 
        onChange={(e) => handleFileUpload(e, 'payment_file_2')}
        accept="image/*,application/pdf"
      />
    </label>
    {uploadStatus.payment_file_2 && (
      <span className="ml-2 text-green-600 flex items-center">
        <Check className="w-4 h-4 mr-1" />
        Uploaded
      </span>
    )}
  </div>
</div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Upload screenshot of payment confirmation (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'payment_file_2')}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-xs text-gray-500">Upload Image(JPEG,PNG,JPG only) upto 300KB</span>
                      {uploadStatus.payment_file_2 && (
                        <p className="text-xs text-green-600 mt-1">Image uploaded Successfully</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={viewForm}
                      className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Submit
                      <Check className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;