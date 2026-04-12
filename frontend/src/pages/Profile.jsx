import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import API from '../services/api'; 

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); 
  const [userId, setUserId] = useState(null); 

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- PASSWORD VISIBILITY STATES ---
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- AVATAR STATES ---
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); 
  const fileInputRef = useRef(null);

  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- VALIDATORS ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email);

  const pw = passwordData.newPassword;
  const isLengthValid = pw.length >= 8;
  const hasNumber = /\d/.test(pw);
  const hasUppercase = /[A-Z]/.test(pw);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
  const isPasswordStrong = isLengthValid && hasNumber && hasUppercase && hasSpecial;

  const userInitial = formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U';

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
        
        setFormData({
          fullName: user.username || '',
          email: user.email || '',
          bio: user.bio || '', 
        });

        if (user.profilePic) {
          setPreviewImage(user.profilePic);
        }
      } catch (error) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem('swapnest_token');
        navigate('/login');
      } finally {
        setIsLoading(false);
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // --- HANDLE IMAGE SELECTION ---
  const handleImageClick = () => fileInputRef.current.click(); 

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file); 
      setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  // --- SAVE PROFILE INFO ---
  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    
    if (!isEmailValid) {
      return toast.error("Please enter a valid email address.");
    }

    const toastId = toast.loading('Saving profile changes...');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.fullName);
      formDataToSend.append('email', formData.email); 
      formDataToSend.append('bio', formData.bio);
      
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile);
      }

      await API.put('/users/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Profile updated successfully!', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile", { id: toastId });
    }
  };

  // --- SAVE PASSWORD ---
  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    if (!isPasswordStrong) {
      return toast.error("Please ensure your new password meets all security requirements.");
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    const toastId = toast.loading('Updating password...');
    try {
      await API.put('/users/password', {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password securely updated!', { id: toastId });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Reset visibility toggles after successful save
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password.', { id: toastId });
    }
  };

  // --- CUSTOM DELETE ACCOUNT LOGIC ---
  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
  };

  const executeDeleteAccount = async () => {
    setShowDeleteModal(false);
    if (!userId) return;
    
    const toastId = toast.loading('Deleting account...');
    try {
      await API.delete(`/users/${userId}`);
      toast.success('Account deleted permanently.', { id: toastId });
      localStorage.removeItem('swapnest_token');
      
      setTimeout(() => navigate('/register'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account.", { id: toastId });
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/users/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('swapnest_token');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center selection:bg-secondary-fixed selection:text-on-secondary-fixed">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <span className="material-symbols-outlined text-primary absolute animate-pulse text-2xl">sync</span>
        </div>
        <h2 className="text-xl font-headline font-bold text-primary mt-6 animate-pulse">Loading your Nest...</h2>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <Toaster position="top-right" />

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center transform transition-all animate-fade-in">
            <div className="w-16 h-16 bg-error-container/30 rounded-full flex items-center justify-center mx-auto mb-4 text-error">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-on-surface-variant mb-6 text-sm font-medium">
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteAccount} 
                className="flex-1 py-2.5 bg-error hover:bg-error/90 text-white font-bold rounded-xl transition-colors shadow-lg shadow-error/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10 py-3">
        <div className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary font-headline">SwapNest</Link>
          
          <div className="hidden md:flex items-center gap-8 font-headline font-bold text-sm tracking-tight">
            <Link to="/dashboard" className="text-primary/80 hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/item/gallery" className="text-primary/80 hover:text-primary transition-colors">Marketplace</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/item/new" className="hidden md:flex bg-secondary text-on-secondary px-5 py-2 rounded-full font-headline font-bold text-xs hover:scale-105 active:scale-95 transition-transform shadow-md items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span> List Item
            </Link>
            
            <div className="relative" ref={profileMenuRef}>
              <div 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden cursor-pointer shadow-md ring-2 ring-secondary/20 transition-all bg-primary flex items-center justify-center text-white font-bold font-headline"
              >
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitial}</span>
                )}
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

            <div className="md:hidden relative" ref={mobileMenuRef}>
              <button className="text-primary p-1 flex items-center" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
              
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-white border border-outline-variant/20 rounded-2xl shadow-xl py-4 px-4 flex flex-col gap-4 z-50 animate-fade-in">
                  <Link to="/dashboard" className="text-primary font-headline font-bold text-lg">Dashboard</Link>
                  <Link to="/marketplace" className="text-primary font-headline font-bold text-lg">Marketplace</Link>
                  <Link to="/messages" className="text-primary font-headline font-bold text-lg">Messages</Link>
                  <Link to="/item/new" className="w-full bg-secondary text-on-secondary px-4 py-3 rounded-xl font-headline font-bold text-sm mt-2 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span> List Item
                  </Link>
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
          
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-outline-variant/10 text-center flex flex-col items-center">
              
              <div className="relative mb-6 group">
                <div className="w-32 h-32 rounded-full shadow-lg border-4 border-white transition-opacity group-hover:opacity-90 overflow-hidden bg-primary flex items-center justify-center text-white font-headline text-5xl font-black">
                  {previewImage ? (
                    <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                
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

              <h2 className="text-xl font-headline font-bold text-primary">{formData.fullName || 'User'}</h2>
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

          <div className="lg:col-span-2">
            
            {activeTab === 'personal' && (
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 animate-fade-in">
                <form onSubmit={handleSavePersonalInfo} className="space-y-8">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-primary mb-6 border-b border-outline-variant/20 pb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Full Name</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" required />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end mb-1.5 px-1">
                          <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant">Email Address</label>
                          {formData.email.length > 0 && !isEmailValid && (
                            <span className="text-[10px] text-error font-bold tracking-wide">Invalid format</span>
                          )}
                        </div>
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          className={`w-full bg-surface-container-high border rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 transition-all font-medium outline-none ${
                            formData.email.length > 0 && !isEmailValid 
                              ? 'border-error/50 focus:ring-error/20 bg-error-container/10' 
                              : 'border-transparent focus:ring-primary/20'
                          }`}
                          required 
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full bg-surface-container-high border-none rounded-2xl px-5 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none resize-none" placeholder="Tell the community a bit about yourself..."></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/dashboard')} className="px-8 py-3.5 rounded-full font-headline font-bold text-primary hover:bg-surface-container-high transition-colors">Cancel</button>
                    <button type="submit" disabled={!isEmailValid} className="bg-secondary text-on-secondary px-10 py-3.5 rounded-full font-headline font-bold hover:bg-[#822800] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:hover:scale-100">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
                  <h3 className="font-headline font-bold text-xl text-primary mb-6 border-b border-outline-variant/20 pb-4">Change Password</h3>
                  <form onSubmit={handleSavePassword} className="space-y-6">
                    
                    {/* --- CURRENT PASSWORD WITH EYE ICON --- */}
                    <div className="space-y-2 max-w-md">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Current Password</label>
                      <div className="relative">
                        <input 
                          type={showCurrentPassword ? "text" : "password"} 
                          name="currentPassword" 
                          value={passwordData.currentPassword} 
                          onChange={handlePasswordChange} 
                          className="w-full bg-surface-container-high border-none rounded-2xl pl-5 pr-12 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showCurrentPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    {/* --- NEW PASSWORD WITH EYE ICON --- */}
                    <div className="space-y-2 max-w-md">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          name="newPassword" 
                          value={passwordData.newPassword} 
                          onChange={handlePasswordChange} 
                          className="w-full bg-surface-container-high border-none rounded-2xl pl-5 pr-12 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showNewPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                      
                      {passwordData.newPassword.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 px-2">
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isLengthValid ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[14px]">{isLengthValid ? 'check_circle' : 'radio_button_unchecked'}</span> 8+ Chars
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasUppercase ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[14px]">{hasUppercase ? 'check_circle' : 'radio_button_unchecked'}</span> 1 Uppercase
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasNumber ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[14px]">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span> 1 Number
                          </div>
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasSpecial ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                            <span className="material-symbols-outlined text-[14px]">{hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span> 1 Special
                          </div>
                        </div>
                      )}
                    </div>

                    {/* --- CONFIRM PASSWORD WITH EYE ICON --- */}
                    <div className="space-y-2 max-w-md">
                      <label className="text-[11px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Confirm New Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          name="confirmPassword" 
                          value={passwordData.confirmPassword} 
                          onChange={handlePasswordChange} 
                          className="w-full bg-surface-container-high border-none rounded-2xl pl-5 pr-12 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none" 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showConfirmPassword ? 'visibility' : 'visibility_off'}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-start">
                      <button type="submit" disabled={!isPasswordStrong} className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-headline font-bold hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:bg-primary">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-error-container/20 p-8 md:p-10 rounded-[2.5rem] border border-error/20">
                  <h3 className="font-headline font-bold text-xl text-error mb-2">Danger Zone</h3>
                  <p className="text-on-surface-variant font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    type="button" 
                    onClick={handleDeleteAccountClick}
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
