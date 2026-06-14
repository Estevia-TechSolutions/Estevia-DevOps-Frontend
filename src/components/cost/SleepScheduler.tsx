import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, Save, Sparkles, RefreshCw, Moon, Clock, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

interface Schedule {
  id: string;
  name: string;
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
  selectedApps: string[];
}

interface SchedulerRules {
  autoScaleAca: boolean;
  autoStopVm: boolean;
  schedules: Schedule[];
}

interface SleepSchedulerProps {
  API_BASE: string;
  organizationId: string;
  theme: 'dark' | 'light';
}

export const SleepScheduler: React.FC<SleepSchedulerProps> = ({ API_BASE, organizationId, theme }) => {
  const [rules, setRules] = useState<SchedulerRules | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [appsList, setAppsList] = useState<any[]>([]);
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingsEstimate, setSavingsEstimate] = useState(84.50);

  const [expandedSection, setExpandedSection] = useState<'apps' | 'hours' | null>(null);

  const isLight = theme === 'light';

  // Collapse accordions when schedule selection changes
  useEffect(() => {
    setExpandedSection(null);
  }, [selectedScheduleId]);

  // Normalize backend policy format to modern multi-schedule rules representation
  const normalizeRules = (dataRules: any): SchedulerRules => {
    const normalized: SchedulerRules = {
      autoScaleAca: dataRules.autoScaleAca !== undefined ? dataRules.autoScaleAca : true,
      autoStopVm: dataRules.autoStopVm !== undefined ? dataRules.autoStopVm : false,
      schedules: []
    };

    if (dataRules.schedules && Array.isArray(dataRules.schedules)) {
      normalized.schedules = dataRules.schedules.map((s: any) => ({
        id: s.id || Math.random().toString(36).substring(2, 11),
        name: s.name || 'Unnamed Schedule',
        mon: s.mon || { start: '08:00', end: '18:00', enabled: true },
        tue: s.tue || { start: '08:00', end: '18:00', enabled: true },
        wed: s.wed || { start: '08:00', end: '18:00', enabled: true },
        thu: s.thu || { start: '08:00', end: '18:00', enabled: true },
        fri: s.fri || { start: '08:00', end: '18:00', enabled: true },
        sat: s.sat || { start: '08:00', end: '18:00', enabled: false },
        sun: s.sun || { start: '08:00', end: '18:00', enabled: false },
        selectedApps: s.selectedApps || []
      }));
    } else {
      // Legacy single schedule format
      normalized.schedules = [{
        id: 'default',
        name: 'Default Sleep Policy',
        mon: dataRules.mon || { start: '08:00', end: '18:00', enabled: true },
        tue: dataRules.tue || { start: '08:00', end: '18:00', enabled: true },
        wed: dataRules.wed || { start: '08:00', end: '18:00', enabled: true },
        thu: dataRules.thu || { start: '08:00', end: '18:00', enabled: true },
        fri: dataRules.fri || { start: '08:00', end: '18:00', enabled: true },
        sat: dataRules.sat || { start: '08:00', end: '18:00', enabled: false },
        sun: dataRules.sun || { start: '08:00', end: '18:00', enabled: false },
        selectedApps: dataRules.selectedApps || []
      }];
    }

    return normalized;
  };

  // Load scheduler rules from backend
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const token = localStorage.getItem('devops_token');
        const res = await fetch(`${API_BASE}/scheduler/rules?organizationId=${organizationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const norm = normalizeRules(data.rules || {});
          setRules(norm);
          setActive(data.active);
          setAppsList(data.applications || []);
          if (norm.schedules.length > 0) {
            setSelectedScheduleId(norm.schedules[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch scheduler rules:', err);
      }
    };

    fetchRules();
  }, [organizationId, API_BASE]);

  // Dynamically calculate savings estimates when weekly hours or selected apps/VM are adjusted
  useEffect(() => {
    if (!rules) return;

    let totalSavings = 0;
    const days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    // For each application, find its total sleep hours in the week based on schedules union
    appsList.forEach(app => {
      // Find all schedules where this app is selected
      const appSchedules = rules.schedules.filter(s => s.selectedApps.includes(app.name));
      if (appSchedules.length === 0) return; // Not enrolled

      let activeHours = 0;
      for (const d of days) {
        let dayActive = false;
        let dayStartMins = 24 * 60;
        let dayEndMins = 0;

        appSchedules.forEach(s => {
          const dayRule = s[d];
          if (dayRule && dayRule.enabled) {
            dayActive = true;
            const startParts = dayRule.start.split(':').map(Number);
            const endParts = dayRule.end.split(':').map(Number);
            const startMins = startParts[0] * 60 + startParts[1];
            const endMins = endParts[0] * 60 + endParts[1];
            if (startMins < dayStartMins) dayStartMins = startMins;
            if (endMins > dayEndMins) dayEndMins = endMins;
          }
        });

        if (dayActive && dayEndMins > dayStartMins) {
          activeHours += (dayEndMins - dayStartMins) / 60;
        }
      }

      const totalHoursInWeek = 24 * 7;
      const sleepHours = Math.max(0, totalHoursInWeek - activeHours);
      
      const rate = app.app_type === 'backend' ? 0.15 : 0.05;
      totalSavings += sleepHours * rate * 4.3; // 4.3 weeks per month
    });

    // Add VM savings if enabled
    if (rules.autoStopVm) {
      let maxSleepHours = 0;
      rules.schedules.forEach(s => {
        let activeHours = 0;
        for (const d of days) {
          const dayRule = s[d];
          if (dayRule && dayRule.enabled) {
            const startParts = dayRule.start.split(':').map(Number);
            const endParts = dayRule.end.split(':').map(Number);
            const duration = (endParts[0] + endParts[1] / 60) - (startParts[0] + startParts[1] / 60);
            if (duration > 0) activeHours += duration;
          }
        }
        const sleepHours = 24 * 7 - activeHours;
        if (sleepHours > maxSleepHours) maxSleepHours = sleepHours;
      });
      totalSavings += maxSleepHours * 0.10 * 4.3;
    }

    setSavingsEstimate(parseFloat(totalSavings.toFixed(2)));
  }, [rules, appsList]);

  // Add schedule
  const handleAddSchedule = () => {
    if (!rules) return;
    const newId = Math.random().toString(36).substring(2, 11);
    const newSchedule: Schedule = {
      id: newId,
      name: `Custom Sleep Policy ${rules.schedules.length + 1}`,
      mon: { start: '08:00', end: '18:00', enabled: true },
      tue: { start: '08:00', end: '18:00', enabled: true },
      wed: { start: '08:00', end: '18:00', enabled: true },
      thu: { start: '08:00', end: '18:00', enabled: true },
      fri: { start: '08:00', end: '18:00', enabled: true },
      sat: { start: '08:00', end: '18:00', enabled: false },
      sun: { start: '08:00', end: '18:00', enabled: false },
      selectedApps: []
    };
    setRules({
      ...rules,
      schedules: [...rules.schedules, newSchedule]
    });
    setSelectedScheduleId(newId);
  };

  // Delete schedule
  const handleDeleteSchedule = (id: string) => {
    if (!rules || rules.schedules.length <= 1) return;
    const updatedSchedules = rules.schedules.filter(s => s.id !== id);
    setRules({
      ...rules,
      schedules: updatedSchedules
    });
    if (selectedScheduleId === id) {
      setSelectedScheduleId(updatedSchedules[0].id);
    }
  };

  // Rename schedule
  const handleRenameSchedule = (id: string, newName: string) => {
    if (!rules) return;
    setRules({
      ...rules,
      schedules: rules.schedules.map(s => s.id === id ? { ...s, name: newName } : s)
    });
  };

  // Toggle app enrollment
  const handleAppEnrollmentToggle = (scheduleId: string, appName: string) => {
    if (!rules) return;
    setRules({
      ...rules,
      schedules: rules.schedules.map(s => {
        if (s.id === scheduleId) {
          const isEnrolled = s.selectedApps.includes(appName);
          const selectedApps = isEnrolled
            ? s.selectedApps.filter(name => name !== appName)
            : [...s.selectedApps, appName];
          return { ...s, selectedApps };
        }
        return s;
      })
    });
  };

  // Toggle day active state
  const handleDayToggle = (scheduleId: string, day: keyof Schedule) => {
    if (!rules) return;
    setRules({
      ...rules,
      schedules: rules.schedules.map(s => {
        if (s.id === scheduleId) {
          const dayRule = s[day] as DaySchedule;
          return {
            ...s,
            [day]: {
              ...dayRule,
              enabled: !dayRule.enabled
            }
          };
        }
        return s;
      })
    });
  };

  // Change hours range
  const handleTimeChange = (scheduleId: string, day: keyof Schedule, field: 'start' | 'end', val: string) => {
    if (!rules) return;
    setRules({
      ...rules,
      schedules: rules.schedules.map(s => {
        if (s.id === scheduleId) {
          const dayRule = s[day] as DaySchedule;
          return {
            ...s,
            [day]: {
              ...dayRule,
              [field]: val
            }
          };
        }
        return s;
      })
    });
  };

  // Toggle AutoScale / AutoStop options
  const handleToggleRule = (field: 'autoScaleAca' | 'autoStopVm') => {
    if (!rules) return;
    setRules({
      ...rules,
      [field]: !rules[field]
    });
  };

  // Save rules to API
  const saveRules = async () => {
    if (!rules) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('devops_token');
      const res = await fetch(`${API_BASE}/scheduler/rules`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId,
          rules,
          active
        })
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'All operational hours sleep schedules updated successfully.' });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        const data = await res.json();
        setFeedback({ type: 'error', text: data.message || 'Failed to save scheduler settings.' });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Network request failure updating scheduler.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!rules) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '20px 0' }}>
        <RefreshCw size={18} className="spin-anim" />
        <span>Loading scheduler parameters...</span>
      </div>
    );
  }

  const daysLabel: { key: keyof Schedule; label: string }[] = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
  ];

  const activeSchedule = rules.schedules.find(s => s.id === selectedScheduleId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Feedback */}
      {feedback && (
        <div className="glass-panel" style={{ 
          padding: '12px 16px', 
          borderColor: feedback.type === 'success' ? 'var(--success)' : 'var(--error)', 
          backgroundColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          color: 'var(--text-primary)', 
          fontSize: '0.86rem',
          borderRadius: '8px'
        }}>
          {feedback.text}
        </div>
      )}

      {/* Row: Savings Estimator & Global Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Estimator Box */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '12px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--success), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            flexShrink: 0
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase' }}>Estimated Monthly Savings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              ${savingsEstimate}
              <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 600 }}>/ mo</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Based on off-work scaling to 0 replicas.</div>
          </div>
        </div>

        {/* Global Policy Config */}
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Scheduler Switch</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Globally enable or pause active weekly sleep policy.</span>
            </div>
            <button
              onClick={() => setActive(!active)}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: active ? 'var(--success)' : 'var(--error)',
                cursor: 'pointer'
              }}
            >
              {active ? 'Active Policy' : 'Paused Policy'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--divider)', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rules.autoScaleAca}
                onChange={() => handleToggleRule('autoScaleAca')}
                style={{ cursor: 'pointer' }}
              />
              Auto-Scale Dev ACA to 0
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rules.autoStopVm}
                onChange={() => handleToggleRule('autoStopVm')}
                style={{ cursor: 'pointer' }}
              />
              Auto-Stop Dev VM
            </label>
          </div>
        </div>

      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Left Sidebar: Schedules list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, minHeight: '400px' }}>
            <h4 style={{ margin: 0, fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Calendar size={15} style={{ color: 'var(--accent-purple)' }} />
              Active Policies
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: '1 1 0%', paddingRight: '4px', minHeight: 0 }}>
              {rules.schedules.map(s => {
                const isSelected = selectedScheduleId === s.id;
                const activeDaysCount = daysLabel.filter(d => (s[d.key] as DaySchedule).enabled).length;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedScheduleId(s.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid rgba(139,92,246,0.45)' : '1px solid var(--glass-border)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.02) 100%)' : 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', wordBreak: 'break-all', paddingRight: '22px' }}>
                      {s.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: s.selectedApps.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: s.selectedApps.length > 0 ? 600 : 400 }}>{s.selectedApps.length} apps</span>
                      <span>&bull;</span>
                      <span>{activeDaysCount} active days</span>
                    </div>
                    {rules.schedules.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(s.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          border: 'none',
                          background: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                        title="Delete sleep policy"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAddSchedule}
              className="btn-secondary"
              style={{
                width: '100%',
                height: '34px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 700,
                border: '1px dashed var(--glass-border)',
                background: 'rgba(255,255,255,0.02)'
              }}
            >
              <Plus size={13} />
              Add Policy Range
            </button>
          </div>
        </div>

        {/* Right Column: Schedule detail editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {activeSchedule ? (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              
              {/* Policy Name Edit */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sleep Policy Title</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend SWA Sleep Window"
                  value={activeSchedule.name}
                  onChange={(e) => handleRenameSchedule(activeSchedule.id, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Enrolled Applications Accordion */}
              <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div 
                  onClick={() => setExpandedSection(expandedSection === 'apps' ? null : 'apps')}
                  className="accordion-header"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
                      Policy Enrolled Applications
                    </h5>
                    {expandedSection !== 'apps' && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {activeSchedule.selectedApps.length > 0 
                          ? `Enrolled: ${activeSchedule.selectedApps.join(', ')} (${activeSchedule.selectedApps.length} apps)`
                          : 'No applications enrolled (Always active 24/7)'}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {expandedSection === 'apps' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {expandedSection === 'apps' && (
                  <div className="accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Select which applications are managed specifically by this operational hours policy.
                    </p>
                    {appsList.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No applications registered for this organization.</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {appsList.map((app) => {
                          const isChecked = activeSchedule.selectedApps.includes(app.name);
                          const isBackend = app.app_type === 'backend';
                          
                          return (
                            <div 
                              key={app.id || app.name}
                              onClick={() => handleAppEnrollmentToggle(activeSchedule.id, app.name)}
                              style={{
                                padding: '10px 14px',
                                borderRadius: '6px',
                                background: isChecked ? 'rgba(255,255,255,0.02)' : 'transparent',
                                border: isChecked 
                                  ? (isBackend ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)') 
                                  : '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{ cursor: 'pointer' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
                                <span style={{ 
                                  fontSize: '0.78rem', 
                                  fontWeight: 600, 
                                  color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {app.name}
                                </span>
                                <span style={{ 
                                  fontSize: '0.62rem', 
                                  alignSelf: 'flex-start',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  color: isBackend ? 'var(--success)' : 'var(--accent-blue)',
                                  background: isBackend ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
                                  padding: '0 4px',
                                  borderRadius: '2px'
                                }}>
                                  {isBackend ? 'ACA' : 'SWA'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Operational Hours Accordion */}
              <div style={{ borderTop: '1px solid var(--divider)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div 
                  onClick={() => setExpandedSection(expandedSection === 'hours' ? null : 'hours')}
                  className="accordion-header"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h5 style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Clock size={14} style={{ color: 'var(--accent-purple)' }} />
                      Operational Hours Ranges
                    </h5>
                    {expandedSection !== 'hours' && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {(() => {
                          const activeDays = daysLabel.filter(d => (activeSchedule[d.key] as DaySchedule).enabled);
                          if (activeDays.length === 0) return 'Sleep mode active 24/7 (Policy is fully scaled down)';
                          
                          const rangeSummaries = activeDays.map(d => {
                            const r = activeSchedule[d.key] as DaySchedule;
                            return `${d.label.substring(0, 3)}: ${r.start}-${r.end}`;
                          });
                          return rangeSummaries.join(' | ');
                        })()}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {expandedSection === 'hours' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {expandedSection === 'hours' && (
                  <div className="accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {daysLabel.map((dayObj) => {
                      const dayRule = activeSchedule[dayObj.key] as DaySchedule;
                      return (
                        <div 
                          key={dayObj.key} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px', 
                            padding: '10px 14px', 
                            borderRadius: '6px', 
                            background: dayRule.enabled ? 'rgba(255,255,255,0.01)' : 'transparent',
                            border: '1px solid var(--glass-border)',
                            flexWrap: 'wrap'
                          }}
                        >
                          {/* Checkbox day switcher */}
                          <div style={{ width: '120px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={dayRule.enabled}
                              onChange={() => handleDayToggle(activeSchedule.id, dayObj.key)}
                              id={`check-${activeSchedule.id}-${dayObj.key}`}
                              style={{ cursor: 'pointer' }}
                            />
                            <label 
                              htmlFor={`check-${activeSchedule.id}-${dayObj.key}`} 
                              style={{ 
                                fontSize: '0.8rem', 
                                fontWeight: 600, 
                                color: dayRule.enabled ? 'var(--text-primary)' : 'var(--text-secondary)', 
                                cursor: 'pointer' 
                              }}
                            >
                              {dayObj.label}
                            </label>
                          </div>

                          {/* Operational hour picker */}
                          {dayRule.enabled ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '220px' }}>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Active range:</span>
                              <input
                                type="time"
                                value={dayRule.start}
                                onChange={(e) => handleTimeChange(activeSchedule.id, dayObj.key, 'start', e.target.value)}
                                style={{
                                  fontSize: '0.76rem',
                                  height: '28px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(255,255,255,0.02)',
                                  color: 'var(--text-primary)',
                                  padding: '0 4px',
                                  outline: 'none'
                                }}
                              />
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>to</span>
                              <input
                                type="time"
                                value={dayRule.end}
                                onChange={(e) => handleTimeChange(activeSchedule.id, dayObj.key, 'end', e.target.value)}
                                style={{
                                  fontSize: '0.76rem',
                                  height: '28px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--glass-border)',
                                  background: 'rgba(255,255,255,0.02)',
                                  color: 'var(--text-primary)',
                                  padding: '0 4px',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '220px', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                              <Moon size={11} style={{ color: 'var(--accent-blue)', opacity: 0.8 }} />
                              <span>Scale-to-zero active for entire 24h block (Sleep mode).</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', minHeight: '300px', flex: 1 }}>
              No sleep policy selected. Click "+ Add Policy Range" on the sidebar to get started.
            </div>
          )}
        </div>

      </div>

      {/* Global Bottom Actions Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          Configure as many sleep policies as needed. Make sure to click save to sync rules to the active background scaling workers.
        </span>
        <button
          onClick={saveRules}
          disabled={isSaving}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 20px', fontSize: '0.82rem' }}
        >
          {isSaving ? <RefreshCw size={14} className="spin-anim" /> : <Save size={14} />}
          {isSaving ? 'Saving Scheduler Policies...' : 'Save Sleep Schedules'}
        </button>
      </div>

    </div>
  );
};
