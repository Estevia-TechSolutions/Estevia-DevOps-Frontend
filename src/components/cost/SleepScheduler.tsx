import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, HelpCircle, Save, Percent, Sparkles, RefreshCw, Moon, Clock } from 'lucide-react';

interface DaySchedule {
  start: string;
  end: string;
  enabled: boolean;
}

interface SchedulerRules {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
  autoScaleAca: boolean;
  autoStopVm: boolean;
}

interface SleepSchedulerProps {
  API_BASE: string;
  organizationId: string;
  theme: 'dark' | 'light';
}

export const SleepScheduler: React.FC<SleepSchedulerProps> = ({ API_BASE, organizationId, theme }) => {
  const [rules, setRules] = useState<SchedulerRules | null>(null);
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingsEstimate, setSavingsEstimate] = useState(84.50);

  const isLight = theme === 'light';

  // Load scheduler rules from backend
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch(`${API_BASE}/scheduler/rules?organizationId=${organizationId}`);
        if (res.ok) {
          const data = await res.json();
          setRules(data.rules);
          setActive(data.active);
        }
      } catch (err) {
        console.error('Failed to fetch scheduler rules:', err);
      }
    };

    fetchRules();
  }, [organizationId, API_BASE]);

  // Dynamically calculate savings estimates when weekly hours are adjusted
  useEffect(() => {
    if (!rules) return;

    let activeHours = 0;
    const days: (keyof SchedulerRules)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    for (const d of days) {
      const dayRule = rules[d] as DaySchedule;
      if (dayRule && dayRule.enabled) {
        const startParts = dayRule.start.split(':').map(Number);
        const endParts = dayRule.end.split(':').map(Number);
        const duration = (endParts[0] + endParts[1] / 60) - (startParts[0] + startParts[1] / 60);
        if (duration > 0) {
          activeHours += duration;
        }
      }
    }

    const totalHoursInWeek = 24 * 7;
    const sleepHours = totalHoursInWeek - activeHours;
    
    // Scale savings dollar estimate: e.g. base cost $120/mo, saving proportional to sleep time %
    const hourlyRate = 0.65; // Simulated $0.65 per hour for 4 active dev ACAs and 1 VM
    const monthlySavings = sleepHours * hourlyRate * 4.3; // 4.3 weeks per month
    
    setSavingsEstimate(parseFloat(monthlySavings.toFixed(2)));
  }, [rules]);

  const handleDayToggle = (day: keyof SchedulerRules) => {
    if (!rules) return;
    const dayRule = rules[day] as DaySchedule;
    setRules({
      ...rules,
      [day]: {
        ...dayRule,
        enabled: !dayRule.enabled
      }
    });
  };

  const handleTimeChange = (day: keyof SchedulerRules, field: 'start' | 'end', val: string) => {
    if (!rules) return;
    const dayRule = rules[day] as DaySchedule;
    setRules({
      ...rules,
      [day]: {
        ...dayRule,
        [field]: val
      }
    });
  };

  const handleToggleRule = (field: 'autoScaleAca' | 'autoStopVm') => {
    if (!rules) return;
    setRules({
      ...rules,
      [field]: !rules[field]
    });
  };

  const saveRules = async () => {
    if (!rules) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/scheduler/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          rules,
          active
        })
      });

      if (res.ok) {
        setFeedback({ type: 'success', text: 'Schedules and budgets weekly policy saved successfully.' });
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

  const daysLabel: { key: keyof SchedulerRules; label: string }[] = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' }
  ];

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

      {/* Scheduler Grid Box */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: 'var(--accent-purple)' }} />
          Weekly Operational Hours Configuration
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {daysLabel.map((dayObj) => {
            const dayRule = rules[dayObj.key] as DaySchedule;
            return (
              <div 
                key={dayObj.key} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  background: dayRule.enabled ? 'rgba(255,255,255,0.01)' : 'transparent',
                  border: '1px solid var(--glass-border)',
                  flexWrap: 'wrap'
                }}
              >
                {/* Day selector & switch */}
                <div style={{ width: '130px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={dayRule.enabled}
                    onChange={() => handleDayToggle(dayObj.key)}
                    id={`check-${dayObj.key}`}
                    style={{ cursor: 'pointer' }}
                  />
                  <label 
                    htmlFor={`check-${dayObj.key}`} 
                    style={{ 
                      fontSize: '0.84rem', 
                      fontWeight: 600, 
                      color: dayRule.enabled ? 'var(--text-primary)' : 'var(--text-secondary)', 
                      cursor: 'pointer' 
                    }}
                  >
                    {dayObj.label}
                  </label>
                </div>

                {/* Range pickers (active only when day is enabled) */}
                {dayRule.enabled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active Hours Range:</span>
                    <input
                      type="time"
                      value={dayRule.start}
                      onChange={(e) => handleTimeChange(dayObj.key, 'start', e.target.value)}
                      style={{
                        fontSize: '0.8rem',
                        height: '30px',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'var(--text-primary)',
                        padding: '0 6px'
                      }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>to</span>
                    <input
                      type="time"
                      value={dayRule.end}
                      onChange={(e) => handleTimeChange(dayObj.key, 'end', e.target.value)}
                      style={{
                        fontSize: '0.8rem',
                        height: '30px',
                        borderRadius: '6px',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'var(--text-primary)',
                        padding: '0 6px'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '240px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <Moon size={12} style={{ color: 'var(--accent-blue)', opacity: 0.8 }} />
                    <span>Scale-to-zero active for entire 24h block (Sleep mode).</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
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

    </div>
  );
};
