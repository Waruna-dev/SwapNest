import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api'; 

const Profile = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState('personal'); 
  
  // Success & Error Message States
  const [isSaved, setIsSaved] = useState(false);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState(''); 

  const [userId, setUserId] = useState(null); 

  // --- NEW: AVATAR STATES & REFS ---
  const [profileImageFile, setProfileImageFile] = useState(null);
  // Default image to show before they upload one
  const [previewImage, setPreviewImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'); 
  const fileInputRef = useRef(null);

  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- FETCHING USER DATA ---
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('swapnest_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await API.get('/users/me');
        const user = response.data;
        
        setUserId(user._id); 
        
        setFormData(prev => ({
          ...prev,
          fullName: user.username || '',
          email: user.email || '',
          bio: user.bio || '', 
        }));

        // NEW: If the user already has a profile pic in the DB, show it!
        if (user.profilePic) {
          setPreviewImage(user.profilePic);
        }

      } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem('swapnest_token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    interests: ['Tech & Gadgets', 'Software Dev', 'Baroque Pop / Dreamcore Vibe']
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // --- NEW: HANDLE IMAGE SELECTION ---
  const handleImageClick = () => {
    fileInputRef.current.click(); // Simulates a click on the hidden file input
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file); // Save the actual file to send to backend later
      setPreviewImage(URL.createObjectURL(file)); // Create a temporary URL to show instant preview
    }
  };

  // --- SAVE PROFILE INFO (NOW WITH IMAGE UPLOAD) ---
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    try {
      // Because we are sending a file, we MUST use FormData instead of standard JSON
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.fullName);
      formDataToSend.append('bio', formData.bio);
      
      // If they selected a new image, attach it!
      // Note: 'profileImage' MUST match the string in your backend upload.single('profileImage')
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile);
      }

      await API.put('/users/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError(''); 
    if (passwordData.newPassword !== passwordData.confirmPassword) return setPasswordError("New passwords do not match.");

    try {
      await API.put('/users/password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setIsPasswordSaved(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsPasswordSaved(false), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete && userId) {
      try {
        await API.delete(`/users/${userId}`);
        localStorage.removeItem('swapnest_token');
        navigate('/register');
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete account.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Tell the backend to actively kill the session in MongoDB
      await API.post('/users/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // The 'finally' block ensures we ALWAYS wipe the local token, 
      // even if the user's internet drops and the backend call fails.
      localStorage.removeItem('swapnest_token');
      
      // Send them back to the login screen
      navigate('/login');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      
      {/* --- LOGGED-IN NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10 py-3">
        <div className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary font-headline">
            SwapNest
          </Link>
          
          <div className="hidden md:flex items-center gap-8 font-headline font-bold text-sm tracking-tight">
            <Link to="/dashboard" className="text-primary/80 hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/marketplace" className="text-primary/80 hover:text-primary transition-colors">Marketplace</Link>
            <Link to="/messages" className="text-primary/80 hover:text-primary transition-colors">Messages</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="hidden md:flex bg-secondary text-on-secondary px-5 py-2 rounded-full font-headline font-bold text-xs hover:scale-105 active:scale-95 transition-transform shadow-md items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span> List Item
            </button>
            
            {/* Nav Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden cursor-pointer shadow-md ring-2 ring-secondary/20 transition-all"
              >
                {/* Dynamically update Nav Avatar too! */}
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              </div>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-outline-variant/20 py-2 animate-fade-in z-50">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm font-headline font-bold text-primary bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[20px]">manage_accounts</span> Account Settings
                  </Link>
                  <div className="h-px bg-outline-variant/20 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-headline font-bold text-error hover:text-error hover:bg-error-container/30 transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px]">logout</span> Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <button className="text-primary p-1 flex items-center" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
              
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-white border border-outline-variant/20 rounded-2xl shadow-xl py-4 px-4 flex flex-col gap-4 z-50 animate-fade-in">
                  <Link to="/dashboard" className="text-primary font-headline font-bold text-lg">Dashboard</Link>
                  <Link to="/marketplace" className="text-primary font-headline font-bold text-lg">Marketplace</Link>
                  <Link to="/messages" className="text-primary font-headline font-bold text-lg">Messages</Link>
                  <button className="w-full bg-secondary text-on-secondary px-4 py-3 rounded-xl font-headline font-bold text-sm mt-2 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span> List Item
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight">Account Settings</h1>
          <p className="text-on-surface-variant font-medium mt-2">Manage your personal details, security, and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* --- LEFT COLUMN: AVATAR & SIDEBAR TABS --- */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 text-center flex flex-col items-center">
              
              {/* --- INTERACTIVE AVATAR UPLOAD --- */}
              <div className="relative mb-6 group">
                <img src={previewImage} alt="Avatar" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white transition-opacity group-hover:opacity-90" />
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                  accept="image/*"
                />

                <button 
                  type="button"
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-surface-container-lowest border border-outline-variant/20 rounded-full flex items-center justify-center text-primary shadow-md hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>

              <h2 className="text-xl font-headline font-bold text-primary">{formData.fullName || 'Curator'}</h2>
              <p className="text-xs font-bold text-on-surface-variant/70 mt-1">{formData.email}</p>
              
              <div className="w-full h-px bg-outline-variant/20 my-6"></div>
              
              <div className="w-full space-y-2">
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`w-full flex items-center gap-3 text-sm font-headline font-bold px-4 py-3 rounded-xl transition-colors ${activeTab === 'personal' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">person</span> Personal Info
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 text-sm font-headline font-bold px-4 py-3 rounded-xl transition-colors ${activeTab === 'security' ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">lock</span> Security
                </button>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: DYNAMIC CONTENT --- */}
          <div className="lg:col-span-2">
            
            {/* TAB 1: PERSONAL INFO */}
            {activeTab === 'personal' && (
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 animate-fade-in">
                {isSaved && (
                  <div className="mb-8 bg-primary-fixed text-on-primary-fixed px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span> Profile updated successfully.
                  </div>
                )}

                <form onSubmit={handleSavePersonalInfo} className="space-y-8">
                  {/* Basic Info */}
                  <div>
                    <h3 className="font-headline font-bold text-xl text-primary mb-6 border-b border-outline-variant/20 pb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" required disabled />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none resize-none" placeholder="Tell the community a bit about yourself..."></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 flex justify-end gap-4">
                    <button type="button" className="px-8 py-3.5 rounded-full font-headline font-bold text-primary hover:bg-surface-container-high transition-colors">Cancel</button>
                    <button type="submit" className="bg-secondary text-on-secondary px-10 py-3.5 rounded-full font-headline font-bold hover:bg-[#822800] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Change Password Block */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
                  
                  {isPasswordSaved && (
                    <div className="mb-8 bg-primary-fixed text-on-primary-fixed px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined">lock_open</span> Password updated successfully.
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-8 bg-error-container/20 border border-error/20 text-error px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined">error</span> {passwordError}
                    </div>
                  )}

                  <h3 className="font-headline font-bold text-xl text-primary mb-6 border-b border-outline-variant/20 pb-4">Change Password</h3>
                  <form onSubmit={handleSavePassword} className="space-y-6">
                    <div className="space-y-2 max-w-md">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Current Password</label>
                      <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" required />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">New Password</label>
                      <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" required />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Confirm New Password</label>
                      <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" required />
                    </div>
                    
                    <div className="pt-4 flex justify-start">
                      <button type="submit" className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-headline font-bold hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-md">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-error-container/20 p-8 md:p-10 rounded-[2.5rem] border border-error/20">
                  <h3 className="font-headline font-bold text-xl text-error mb-2">Danger Zone</h3>
                  <p className="text-on-surface-variant font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    type="button" 
                    onClick={handleDeleteAccount}
                    className="bg-error text-on-error px-8 py-3.5 rounded-full font-headline font-bold hover:bg-error/80 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-error/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span> Delete Account
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;