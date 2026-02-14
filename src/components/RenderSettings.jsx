import React, { useState } from 'react';
import { Settings, CheckCircle, Save, PlusCircle, Building2, User, Edit3, Upload, Trash2, Ghost, AlertTriangle, Key, Activity, Loader2, Sparkles, Sun, Moon, Monitor, Palette } from 'lucide-react';
import { checkApiKey } from '../utils/gemini';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';

const RenderSettings = ({
    closeSettings,
    config, setConfig,
    candidateName, setCandidateName,
    vibeCheck, setVibeCheck,
    profiles, setProfiles,
    profileName, setProfileName,
    userApiKey, setUserApiKey,
    aiModel, setAiModel,
    theme, setTheme
}) => {
    const isLight = theme === 'light';
    const [error, setError] = useState(null);
    const [checkingKey, setCheckingKey] = useState(false);
    const [checkStatus, setCheckStatus] = useState(null); // { success, model, error }

    const saveProfile = () => {
        if (!profileName.trim()) return;

        const normalizedName = profileName.trim().toLowerCase();
        const existingIndex = profiles.findIndex(p => p.name.toLowerCase() === normalizedName);

        const newProfile = {
            id: existingIndex >= 0 ? profiles[existingIndex].id : Date.now(),
            name: profileName.trim(),
            institutionName: config.institutionName,
            logoUrl: config.logoUrl,
            candidateName: candidateName,
            vibeCheck: vibeCheck
        };

        let updated;
        if (existingIndex >= 0) {
            updated = [...profiles];
            updated[existingIndex] = newProfile;
        } else {
            updated = [...profiles, newProfile];
        }

        try {
            localStorage.setItem('quizify_profiles', JSON.stringify(updated));
            setProfiles(updated);
            setError(null);
            alert("Profile saved successfully!");
        } catch (e) {
            console.error("Storage limit exceeded", e);
            if (e.name === 'QuotaExceededError') {
                setError("Storage full! Your logo might be too big. Try using a smaller image or delete old profiles.");
            } else {
                setError("Failed to save profile.");
            }
        }
    };

    const loadProfile = (profile) => {
        setConfig(prev => ({
            ...prev,
            institutionName: profile.institutionName,
            logoUrl: profile.logoUrl
        }));
        setCandidateName(profile.candidateName);
        setVibeCheck(profile.vibeCheck);
        setProfileName(profile.name);
    };

    const deleteProfile = (id) => {
        const updated = profiles.filter(p => p.id !== id);
        try {
            localStorage.setItem('quizify_profiles', JSON.stringify(updated));
            setProfiles(updated);
            if (profiles.find(p => p.id === id)?.name === profileName) {
                setProfileName('');
            }
        } catch (e) {
            console.error("Error deleting profile", e);
        }
    };

    const clearProfileSelection = () => {
        setProfileName('');
        setConfig(prev => ({ ...prev, institutionName: '', logoUrl: '' }));
        setCandidateName('');
        setVibeCheck(false);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image too large. Please choose an image under 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/png');
                    setConfig(prev => ({ ...prev, logoUrl: dataUrl }));
                    setError(null);
                };
                img.onerror = () => {
                    setError("Failed to load image. Please try another one.");
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };
    const handleApiKeyChange = (e) => {
        const val = e.target.value.trim();
        setUserApiKey(val);
        localStorage.setItem('quizify_api_key', val);
        setCheckStatus(null);
    };

    const verifyKey = async () => {
        if (!userApiKey) {
            setCheckStatus({ success: false, error: "Please enter an API Key first." });
            return;
        }
        setCheckingKey(true);
        setCheckStatus(null);
        try {
            const result = await checkApiKey(userApiKey);
            setCheckStatus(result);
            if (result.success) {
                setAiModel(result.modelId);
                localStorage.setItem('quizify_ai_model', result.modelId);
            }
        } catch (e) {
            setCheckStatus({ success: false, error: "Verification failed." });
        } finally {
            setCheckingKey(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10 pb-20 px-4 md:px-0">
            <div className={`flex items-center justify-between border-b pb-6 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <div>
                    <h2 className={`text-4xl font-black ${isLight ? 'text-slate-900' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60'}`}>Settings</h2>
                    <p className={`mt-2 font-light ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Manage your institutional branding, student profiles, and personal preferences.</p>
                </div>
                <Button variant="secondary" onClick={closeSettings} className={`!rounded-xl px-6 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : ''}`}>
                    <CheckCircle size={18} className="text-emerald-500" /> Done
                </Button>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-4 rounded-xl flex items-center gap-3 text-sm font-medium"><AlertTriangle size={18} /> {error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <Card title="Institute Profiles" icon={Save} theme={theme}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className={`text-[10px] uppercase tracking-widest font-bold ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Profile Name</p>
                                <button onClick={clearProfileSelection} className="text-[10px] text-fuchsia-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors"><PlusCircle size={10} /> New</button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. Oxford University"
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className={`flex-1 border rounded-xl px-4 py-2.5 text-sm transition-all placeholder:text-opacity-20 focus:outline-none focus:ring-1 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-indigo-500/20' : 'bg-black/30 border-white/10 text-white placeholder:text-white/20 focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/20'}`}
                                />
                                <button onClick={saveProfile} disabled={!profileName} className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-colors shadow-lg shadow-fuchsia-900/20">
                                    <Save size={16} />
                                </button>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className={`text-[10px] uppercase tracking-widest font-bold ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Your Institutes</p>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white/5 text-white/40 border-white/5'}`}>{profiles.length}</span>
                                </div>

                                {profiles.length > 0 ? (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                        {profiles.map(p => (
                                            <div key={p.id} className={`border p-3 rounded-xl flex items-center justify-between group transition-all duration-200 cursor-pointer ${profileName === p.name ? (isLight ? 'border-indigo-500 bg-indigo-50' : 'border-fuchsia-500/50 bg-fuchsia-500/10') : (isLight ? 'bg-slate-50 border-slate-100 hover:border-slate-200' : 'bg-white/5 hover:bg-white/[0.07] border-white/5 hover:border-white/10')}`} onClick={() => loadProfile(p)}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                                        {p.logoUrl ? <img src={p.logoUrl} className="w-full h-full object-contain" /> : <Building2 size={14} className="text-slate-400" />}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <div className={`font-bold text-sm truncate mb-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.name}</div>
                                                        <div className={`text-[10px] truncate flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                                                            {p.institutionName || "Untitled"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); deleteProfile(p.id); }} className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-red-50 text-slate-300 hover:text-red-500' : 'hover:bg-red-500/20 hover:text-red-300 text-white/40'}`} title="Delete Profile"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-8 border border-dashed rounded-xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
                                        <Ghost size={24} className={`${isLight ? 'text-slate-300' : 'text-white/20'} mx-auto mb-2`} />
                                        <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-white/30'}`}>No institutes saved.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <Card title="Institution Branding" icon={Building2} theme={theme}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Input theme={theme} label="Institution Name" placeholder="e.g. Oxford University" value={config.institutionName} onChange={(e) => setConfig({ ...config, institutionName: e.target.value })} />
                                    <p className={`text-[10px] leading-relaxed ${isLight ? 'text-slate-400' : 'text-white/30'}`}>This name will appear on the top of every generated exam paper and OMR sheet.</p>
                                </div>
                                <div>
                                    <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${isLight ? 'text-slate-400' : 'text-white/60'}`}>Logo Preview</label>
                                    <div className={`relative group w-full h-32 border border-dashed rounded-xl overflow-hidden flex items-center justify-center transition-colors ${isLight ? 'bg-slate-50 border-slate-200 hover:border-indigo-300' : 'bg-black/20 border-white/10 hover:border-white/30'}`}>
                                        {config.logoUrl ? (
                                            <>
                                                <img src={config.logoUrl} className="max-h-24 max-w-[80%] object-contain" alt="Logo Preview" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-xs font-bold text-white flex items-center gap-2"><Edit3 size={12} /> Change Logo</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={`flex flex-col items-center gap-2 transition-colors ${isLight ? 'text-slate-300 group-hover:text-indigo-500' : 'text-white/20 group-hover:text-white/50'}`}>
                                                <Upload size={24} />
                                                <span className="text-xs font-bold uppercase tracking-wide">Upload Image</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="App Aesthetics" icon={Palette} theme={theme}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: 'light', name: 'Light', icon: Sun },
                                { id: 'dark', name: 'Dark', icon: Moon },
                                { id: 'system', name: 'System', icon: Monitor }
                            ].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${theme === t.id
                                        ? (isLight ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-fuchsia-600 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/20')
                                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}
                                >
                                    <t.icon size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </Card>



                    <Card title="Personal Preferences" icon={User} theme={theme}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <Input theme={theme} label="Candidate Name (Default)" placeholder="Your Name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
                                <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>This name will be pre-filled on OMR sheets and exam papers.</p>
                            </div>

                            <div className={`${isLight ? 'bg-slate-50' : 'bg-white/5'} rounded-xl p-5 border ${isLight ? 'border-slate-200' : 'border-white/10'} flex items-center justify-between`}>
                                <div className="pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Vibe Check Mode</span>
                                        {vibeCheck && <span className="text-[9px] bg-fuchsia-500 text-white px-1.5 py-0.5 rounded font-bold uppercase transition-all animate-pulse">Active</span>}
                                    </div>
                                    <p className={`text-[10px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                                        AI grading will include "Gen Z" slang and roast/hype your performance.
                                        <span className="block mt-1 text-fuchsia-500/60 italic">"Bro really thought mitochondria was the answer 💀"</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setVibeCheck(!vibeCheck)}
                                    className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 shrink-0 ${vibeCheck ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 shadow-lg' : isLight ? 'bg-slate-200 border border-slate-300' : 'bg-black/40 border border-white/10'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-md ${vibeCheck ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card title="AI Configuration" icon={Sparkles} theme={theme}>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isLight ? 'text-slate-400' : 'text-white/60'}`}>Gemini API Key</label>
                                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-bold hover:underline transition-colors ${isLight ? 'text-indigo-600' : 'text-fuchsia-400'}`}>Get Free Key</a>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="password"
                                            placeholder="Paste your Gemini API Key..."
                                            value={userApiKey}
                                            onChange={handleApiKeyChange}
                                            className={`w-full border rounded-xl px-12 py-3 text-sm transition-all focus:outline-none focus:ring-1 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300 focus:border-indigo-500/50 focus:ring-indigo-500/20' : 'bg-black/30 border-white/10 text-white placeholder:text-white/10 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20'}`}
                                        />
                                        <Key size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-300' : 'text-white/20'}`} />
                                    </div>
                                    <button
                                        onClick={verifyKey}
                                        disabled={checkingKey}
                                        className={`px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${checkStatus?.success ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' : isLight ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-white/5 hover:bg-white/10 text-white/60 border border-white/5'}`}
                                    >
                                        {checkingKey ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
                                        {checkStatus?.success ? 'Connected' : 'Verify Key'}
                                    </button>
                                </div>
                            </div>

                            {checkStatus && (
                                <div className={`p-4 rounded-xl border transition-all animate-fade-in ${checkStatus.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${checkStatus.success ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {checkStatus.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h5 className={`text-xs font-bold uppercase tracking-wider ${checkStatus.success ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {checkStatus.success ? 'Neural Link Established' : 'System Disconnect'}
                                                </h5>
                                                {checkStatus.success && <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded italic animate-pulse ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-white/5 text-white/20'}`}>Online</span>}
                                            </div>
                                            <p className={`text-[10px] font-medium leading-relaxed ${checkStatus.success ? (isLight ? 'text-slate-500' : 'text-emerald-400/60') : (isLight ? 'text-red-600/80' : 'text-red-400/60')}`}>
                                                {checkStatus.success
                                                    ? `Successfully connected to ${checkStatus.displayName}. Your synthesis architecture is ready.`
                                                    : checkStatus.error || "The provided API key is invalid or lacks necessary permissions."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!checkStatus && !userApiKey && (
                                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.02] border-white/5'}`}>
                                    <p className={`text-[10px] leading-relaxed italic ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                                        "By providing your own API key, you bypass local buffer limits and gain direct access to advanced neural synthesis models."
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RenderSettings;
