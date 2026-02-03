import React from 'react';

/**
 * Enhanced Card Component
 * @param {string} title - Ang heading ng card
 * @param {React.ReactNode} action - Karaniwang link o button sa kanang bahagi
 * @param {string} subtitle - Optional na text sa ilalim ng title
 * @param {boolean} hoverable - Kung magkakaroon ng lift effect pag hino-hover
 * @param {string} variant - 'default' o 'glass'
 */
export default function Card({ 
  title, 
  action, 
  subtitle, 
  children, 
  className = '', 
  hoverable = true,
  variant = 'default' 
}) {
  
  const baseStyles = "relative overflow-hidden rounded-2xl transition-all duration-300";
  
  const variants = {
    default: "bg-white border border-[#253745]/10 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]",
    glass: "bg-white/70 backdrop-blur-md border border-white/40 shadow-sm",
    outlined: "bg-transparent border-2 border-dashed border-[#9BA8AB]/30 shadow-none"
  };

  const hoverStyles = hoverable 
    ? "hover:shadow-xl hover:shadow-[#11212D]/5 hover:-translate-y-1" 
    : "";

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      
      {/* Header Section */}
      {(title || action || subtitle) && (
        <div className="flex items-start justify-between gap-4 p-5 pb-0 md:p-6 md:pb-0">
          <div className="space-y-1">
            {title && (
              <h2 className="text-base font-bold tracking-tight text-[#11212D] md:text-lg">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs font-medium text-[#4A5C6A]">
                {subtitle}
              </p>
            )}
          </div>
          
          {action && (
            <div className="shrink-0 transition-transform active:scale-95">
              {action}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={`p-5 md:p-6 ${title || action ? 'pt-4 md:pt-5' : ''}`}>
        {children}
      </div>

      {/* Decorative Accent (Optional - subtle line sa bottom) */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#4A5C6A]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}