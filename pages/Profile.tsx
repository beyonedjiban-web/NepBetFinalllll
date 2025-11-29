
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../services/store';
import { UserCircleIcon, CheckBadgeIcon, ShieldExclamationIcon, IdentificationIcon } from '@heroicons/react/24/solid';
import { KycDetails } from '../types';

const Profile: React.FC = () => {
  const { user, updateKyc } = useAppStore();
  const [formData, setFormData] = useState<KycDetails>({
    nationalIdType: 'Citizenship',
    nationalIdNumber: '',
    address: '',
    issuedDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // Load existing KYC if available
  useEffect(() => {
    if (user?.kyc) {
      setFormData(user.kyc);
    } else {
        setIsEditing(true); // Auto open edit if no kyc
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nationalIdNumber || !formData.address || !formData.issuedDate) {
        setMessage('Please fill all required fields.');
        return;
    }
    updateKyc(formData);
    setIsEditing(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const isVerified = !!user?.kyc?.nationalIdNumber;

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 md:pb-12">
      {/* Header Info */}
      <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="bg-emerald-900/50 p-4 rounded-full border-2 border-emerald-500/30">
             <UserCircleIcon className="w-20 h-20 text-emerald-400" />
        </div>
        <div className="flex-1 text-center md:text-left">
             <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
             <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                 User ID: <span className="font-mono bg-slate-900 px-2 py-0.5 rounded text-emerald-400">#{user.id}</span>
             </p>
             <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                 <span className="bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">{user.email}</span>
                 <span className="bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">{user.phone}</span>
                 {isVerified ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <CheckBadgeIcon className="w-4 h-4" /> Verified
                    </span>
                 ) : (
                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/50 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <ShieldExclamationIcon className="w-4 h-4" /> Not Verified
                    </span>
                 )}
             </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center min-w-[150px] border border-slate-700">
             <div className="text-xs text-slate-500 uppercase font-bold">Balance</div>
             <div className="text-2xl font-bold text-emerald-400">NPR {user.balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Menu (Placeholder) */}
          <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <h3 className="font-bold text-slate-300 mb-4">Account Settings</h3>
                  <ul className="space-y-2">
                      <li className="text-emerald-400 font-medium cursor-pointer bg-emerald-500/10 p-2 rounded-lg">Legal Information</li>
                      <li className="text-slate-500 p-2 cursor-not-allowed">Security (Coming Soon)</li>
                      <li className="text-slate-500 p-2 cursor-not-allowed">Preferences (Coming Soon)</li>
                  </ul>
              </div>
          </div>

          {/* KYC Form */}
          <div className="md:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                      <IdentificationIcon className="w-6 h-6 text-slate-400" />
                      Legal Information
                  </h2>
                  {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 underline"
                      >
                          Edit Details
                      </button>
                  )}
              </div>

              {message && (
                  <div className="mb-4 p-3 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm border border-emerald-500/30">
                      {message}
                  </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ID Type</label>
                          <select 
                            disabled={!isEditing}
                            value={formData.nationalIdType}
                            onChange={(e) => setFormData({...formData, nationalIdType: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                          >
                              <option value="Citizenship">Citizenship</option>
                              <option value="Passport">Passport</option>
                              <option value="Driving License">Driving License</option>
                              <option value="National ID">National ID Card</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">ID Number</label>
                          <input 
                            type="text"
                            disabled={!isEditing}
                            value={formData.nationalIdNumber}
                            onChange={(e) => setFormData({...formData, nationalIdNumber: e.target.value})}
                            placeholder="XX-XX-XX-XXXXX"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Permanent Address</label>
                      <input 
                        type="text"
                        disabled={!isEditing}
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="District, Municipality, Ward No."
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                      />
                  </div>

                  <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Issued Date</label>
                      <input 
                        type="date"
                        disabled={!isEditing}
                        value={formData.issuedDate}
                        onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
                      />
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                      <p className="text-xs text-slate-400 leading-relaxed">
                          <span className="text-orange-400 font-bold">Important:</span> Verify your details carefully. This information is required for withdrawals to ensure legal compliance. Incorrect details may lead to transaction delays.
                      </p>
                  </div>

                  {isEditing && (
                      <div className="flex gap-4 pt-2">
                          <button 
                            type="submit"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/50 transition-all"
                          >
                              Save Information
                          </button>
                          {isVerified && (
                             <button 
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-all"
                             >
                                Cancel
                             </button>
                          )}
                      </div>
                  )}
              </form>
          </div>
      </div>
    </div>
  );
};

export default Profile;
