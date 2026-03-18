import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile Settings
    displayName: 'Admin User',
    email: 'admin@workflowpro.com',
    role: 'admin',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    workflowUpdates: true,
    approvalRequests: true,
    systemAlerts: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // Appearance Settings
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info'
  });

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      setSettings({
        displayName: 'Admin User',
        email: 'admin@workflowpro.com',
        role: 'admin',
        emailNotifications: true,
        pushNotifications: true,
        workflowUpdates: true,
        approvalRequests: true,
        systemAlerts: false,
        twoFactorAuth: false,
        sessionTimeout: '30',
        passwordExpiry: '90',
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        maintenanceMode: false,
        debugMode: false,
        logLevel: 'info'
      });
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'system', name: 'System', icon: CogIcon }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-lilac-border/50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-lilac-border text-lilac-muted rounded-2xl hover:border-lilac-primary hover:text-lilac-primary hover:shadow-lg transition-all"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-lilac-primary/10 text-lilac-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-lilac-primary/20">
              <CogIcon className="w-3 h-3 mr-2" />
              Terminal Configuration
            </div>
            <h1 className="text-4xl font-black text-lilac-text tracking-tighter uppercase">
              System<span className="text-lilac-primary">Settings</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72">
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-lilac-border p-3">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    activeTab === tab.id
                      ? 'bg-lilac-text text-white shadow-lg shadow-lilac-text/20 translate-x-1'
                      : 'text-lilac-muted hover:bg-lilac-bg hover:text-lilac-text'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-lilac-primary' : 'text-lilac-muted'}`} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-lilac-border p-10 animate-in fade-in slide-in-from-right-4 duration-500">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-lilac-text uppercase tracking-tight mb-2">User Identity</h2>
                  <p className="text-[10px] font-bold text-lilac-muted uppercase tracking-widest italic opacity-70">Manage your public operational data</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Display Name</label>
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                      className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Operational Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Security Clearance</label>
                    <input
                      type="text"
                      value={settings.role}
                      disabled
                      className="w-full px-4 py-4 bg-lilac-bg border border-lilac-border rounded-2xl text-lilac-muted font-black uppercase tracking-widest cursor-not-allowed text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-lilac-text uppercase tracking-tight mb-2">Comms Center</h2>
                  <p className="text-[10px] font-bold text-lilac-muted uppercase tracking-widest italic opacity-70">Configure your alert synchronization</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Dispatch' },
                    { key: 'pushNotifications', label: 'Neural Push' },
                    { key: 'workflowUpdates', label: 'Logic Transitions' },
                    { key: 'approvalRequests', label: 'Auth Requests' },
                    { key: 'systemAlerts', label: 'Kernel Messages' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-lilac-bg/30 border border-lilac-border/50">
                      <label className="text-[10px] font-black text-lilac-text uppercase tracking-[0.2em]">{label}</label>
                      <button
                        onClick={() => setSettings({...settings, [key]: !settings[key]})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 ${
                          settings[key] ? 'bg-lilac-primary shadow-lg shadow-lilac-primary/30' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-500 ${
                            settings[key] ? 'translate-x-7' : 'translate-x-1'
                          } shadow-sm`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-lilac-text uppercase tracking-tight mb-2">Vault Protocols</h2>
                  <p className="text-[10px] font-bold text-lilac-muted uppercase tracking-widest italic opacity-70">Define your access encryption parameters</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-lilac-primary/5 border border-lilac-primary/10">
                    <label className="text-[10px] font-black text-lilac-text uppercase tracking-[0.2em]">Multi-Factor Auth</label>
                    <button
                      onClick={() => setSettings({...settings, twoFactorAuth: !settings.twoFactorAuth})}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 ${
                        settings.twoFactorAuth ? 'bg-lilac-primary shadow-lg shadow-lilac-primary/30' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-500 ${
                          settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                        } shadow-sm`}
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Session TTL (Min)</label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                        className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="120">2 Hours</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Pass Rotation (Days)</label>
                      <select
                        value={settings.passwordExpiry}
                        onChange={(e) => setSettings({...settings, passwordExpiry: e.target.value})}
                        className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                      >
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-lilac-text uppercase tracking-tight mb-2">Visual Core</h2>
                  <p className="text-[10px] font-bold text-lilac-muted uppercase tracking-widest italic opacity-70">Adjust the stylistic rendering engine</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Active Hue</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                      className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                    >
                      <option value="light">Lilac Lollipop (Light)</option>
                      <option value="dark">Deep Violet (Dark)</option>
                      <option value="auto">System Sync</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Language Map</label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                        className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                      >
                        <option value="en">English (OS)</option>
                        <option value="es">Spanish (ES)</option>
                        <option value="fr">French (FR)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Temporal Zone</label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                        className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                      >
                        <option value="UTC">Universal Temporal (UTC)</option>
                        <option value="EST">Eastern Sector (EST)</option>
                        <option value="PST">Pacific Sector (PST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-lilac-text uppercase tracking-tight mb-2">Kernel Access</h2>
                  <p className="text-[10px] font-bold text-lilac-muted uppercase tracking-widest italic opacity-70">Low-level environment configuration</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { key: 'maintenanceMode', label: 'Offline Isolation' },
                    { key: 'debugMode', label: 'Verbose Diagnostics' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-100">
                      <label className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">{label}</label>
                      <button
                        onClick={() => setSettings({...settings, [key]: !settings[key]})}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 ${
                          settings[key] ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-500 ${
                            settings[key] ? 'translate-x-7' : 'translate-x-1'
                          } shadow-sm`}
                        />
                      </button>
                    </div>
                  ))}
                  <div className="space-y-2 pt-4">
                    <label className="block text-[10px] font-black text-lilac-muted uppercase tracking-[0.2em] px-1">Telemetry Verbosity</label>
                    <select
                      value={settings.logLevel}
                      onChange={(e) => setSettings({...settings, logLevel: e.target.value})}
                      className="w-full px-4 py-4 bg-white border border-lilac-border rounded-2xl focus:ring-4 focus:ring-lilac-primary/10 focus:border-lilac-primary outline-none transition-all font-bold text-lilac-text"
                    >
                      <option value="error">Critical Failures (Error)</option>
                      <option value="warn">Performance Risks (Warn)</option>
                      <option value="info">Standard Operations (Info)</option>
                      <option value="debug">Total Transparency (Debug)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-lilac-border/50">
              <button
                onClick={handleReset}
                className="px-6 py-4 bg-white border border-lilac-border text-lilac-muted rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-lilac-bg transition-all"
              >
                Factory Reset
              </button>
              <button
                onClick={handleSave}
                className="px-10 py-4 bg-lilac-text text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-lilac-text/20 hover:-translate-y-1 transition-all"
              >
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
