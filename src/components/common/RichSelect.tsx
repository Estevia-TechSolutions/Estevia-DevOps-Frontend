import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface RichSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
  disabled?: boolean;
  isRawId?: boolean;
  tag?: string;
}

export interface RichSelectProps {
  options: RichSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  panelMinWidth?: number;
}

export const RichSelect: React.FC<RichSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  size = 'md',
  align = 'left',
  className = '',
  style = {},
  panelMinWidth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(opt => 
    opt.value === value || 
    (typeof opt.value === 'string' && typeof value === 'string' && opt.value.toLowerCase() === value.toLowerCase())
  );

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.bottom + 6;
      const left = align === 'right' ? rect.right : rect.left;
      setCoords({ top, left, width: rect.width });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = (e: Event) => {
      if (panelRef.current && e.target && panelRef.current.contains(e.target as Node)) {
        return; // Allow scrolling inside the panel without closing!
      }
      setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
        return;
      }
      if (panelRef.current && panelRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sizePaddingMap = {
    sm: '6px 30px 6px 12px',
    md: '10px 36px 10px 14px',
    lg: '12px 40px 12px 16px',
  };

  const sizeFontSizeMap = {
    sm: '0.82rem',
    md: '0.9rem',
    lg: '0.96rem',
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative', width: style.width || '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`eva-rich-select-trigger ${className}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: sizePaddingMap[size],
          fontSize: sizeFontSizeMap[size],
          fontWeight: 500,
          color: 'var(--text-primary)',
          background: 'var(--input-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxSizing: 'border-box',
          ...style
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption?.icon && <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>{selectedOption.icon}</span>}
          {(() => {
            const isRawId = selectedOption?.isRawId || (selectedOption?.label ? /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(selectedOption.label.trim()) : false);
            const displayLabel = selectedOption ? selectedOption.label : placeholder;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <span style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontFamily: isRawId ? 'monospace' : 'inherit',
                  color: isRawId ? '#f59e0b' : 'inherit'
                }}>
                  {displayLabel}
                </span>
                {(isRawId || selectedOption?.tag) && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#f59e0b',
                    flexShrink: 0,
                    letterSpacing: '0.03em'
                  }}>
                    {selectedOption?.tag || 'ID ONLY'}
                  </span>
                )}
              </div>
            );
          })()}
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'var(--badge-bg)',
                border: '1px solid var(--badge-border)',
                color: 'var(--accent-purple)',
                flexShrink: 0
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={size === 'sm' ? 14 : 16}
          style={{
            flexShrink: 0,
            color: 'var(--text-secondary)',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      {isOpen && coords && createPortal(
        <div
          ref={panelRef}
          id="eva-rich-select-portal-panel"
          className="eva-rich-select-panel"
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: align === 'right' ? 'auto' : `${coords.left}px`,
            right: align === 'right' ? `${window.innerWidth - coords.left}px` : 'auto',
            minWidth: panelMinWidth ? `${panelMinWidth}px` : `${Math.max(coords.width, 200)}px`,
            maxWidth: '90vw',
            maxHeight: '320px',
            overflowY: 'auto',
            zIndex: 9999,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            padding: '6px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'richDropdownSlide 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            boxSizing: 'border-box'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`eva-rich-select-item ${isSelected ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)',
                  background: isSelected ? 'var(--badge-bg)' : 'transparent',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  opacity: option.disabled ? 0.5 : 1,
                  transition: 'background 0.15s ease',
                  marginBottom: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  {option.icon && <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>{option.icon}</span>}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(() => {
                      const isRawId = option.isRawId || /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(option.label.trim());
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ 
                            whiteSpace: 'nowrap',
                            fontFamily: isRawId ? 'monospace' : 'inherit',
                            color: isRawId ? '#f59e0b' : 'inherit'
                          }}>
                            {option.label}
                          </span>
                          {(isRawId || option.tag) && (
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              color: '#f59e0b',
                              flexShrink: 0
                            }}>
                              {option.tag || 'ID ONLY'}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {option.description && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {option.badge && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'var(--badge-bg)',
                        border: '1px solid var(--badge-border)',
                        color: 'var(--accent-purple)'
                      }}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && <Check size={14} style={{ color: 'var(--accent-purple)' }} />}
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};
