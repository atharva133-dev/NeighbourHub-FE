import { forwardRef } from 'react';

// Theme colors from Landing page
const themeColors = {
  parchment: '#F6F5EF',
  parchmentLight: '#FCFBF6',
  sage: '#6E8F73',
  sageSoft: '#E4EBE1',
  sageDeep: '#4E6B54',
  clay: '#C97B5A',
  claySoft: '#F3DFD1',
  clayDeep: '#A85C3F',
  brick: '#A8442F',
  brickSoft: '#EAD6CE',
  ink: '#20261F',
  inkSecondary: 'rgba(32, 38, 31, 0.7)',
  inkTertiary: 'rgba(32, 38, 31, 0.5)',
  border: 'rgba(32, 38, 31, 0.12)',
};

/**
 * ThemedIcon - A wrapper component for lucide-react icons with theme colors
 * 
 * @param {React.ComponentType} Icon - The lucide-react icon component
 * @param {string} color - Theme color key or custom color (default: 'clay')
 * @param {string} size - Icon size (default: '24')
 * @param {boolean} hover - Enable hover effect (default: false)
 * @param {string} hoverColor - Theme color key for hover state
 */
export const ThemedIcon = forwardRef(({ 
  Icon, 
  color = 'clay', 
  size = 24, 
  hover = false, 
  hoverColor = 'primary',
  className = '',
  ...props 
}, ref) => {
  const getColor = (colorKey) => {
    if (themeColors[colorKey]) {
      return themeColors[colorKey];
    }
    return colorKey; // Return as-is if it's a custom color
  };

  const iconColor = getColor(color);
  const hoverColorValue = hover ? getColor(hoverColor) : undefined;

  return (
    <Icon
      ref={ref}
      size={size}
      style={{ 
        color: iconColor,
        transition: hover ? 'color 0.2s ease' : undefined
      }}
      className={hover ? 'hover:cursor-pointer' : className}
      {...(hover && {
        onMouseEnter: (e) => e.currentTarget.style.color = hoverColorValue,
        onMouseLeave: (e) => e.currentTarget.style.color = iconColor
      })}
      {...props}
    />
  );
});

ThemedIcon.displayName = 'ThemedIcon';

// Pre-configured themed icons for common use
export const ThemedHome = (props) => <ThemedIcon Icon={require('lucide-react').Home} {...props} />;
export const ThemedCalendar = (props) => <ThemedIcon Icon={require('lucide-react').Calendar} {...props} />;
export const ThemedSearch = (props) => <ThemedIcon Icon={require('lucide-react').Search} {...props} />;
export const ThemedAlert = (props) => <ThemedIcon Icon={require('lucide-react').AlertTriangle} color="primary" {...props} />;
export const ThemedUsers = (props) => <ThemedIcon Icon={require('lucide-react').Users} color="sage" {...props} />;
export const ThemedSettings = (props) => <ThemedIcon Icon={require('lucide-react').Settings} {...props} />;
export const ThemedUser = (props) => <ThemedIcon Icon={require('lucide-react').User} {...props} />;
export const ThemedShield = (props) => <ThemedIcon Icon={require('lucide-react').Shield} color="primary" {...props} />;
export const ThemedPin = (props) => <ThemedIcon Icon={require('lucide-react').Pin} color="primary" {...props} />;
export const ThemedFileText = (props) => <ThemedIcon Icon={require('lucide-react').FileText} color="sage" {...props} />;
export const ThemedBookOpen = (props) => <ThemedIcon Icon={require('lucide-react').BookOpen} color="sage" {...props} />;
export const ThemedDumbbell = (props) => <ThemedIcon Icon={require('lucide-react').Dumbbell} color="sage" {...props} />;
export const ThemedArrowLeftRight = (props) => <ThemedIcon Icon={require('lucide-react').ArrowLeftRight} {...props} />;
export const ThemedLogOut = (props) => <ThemedIcon Icon={require('lucide-react').LogOut} color="primary" {...props} />;
export const ThemedMenu = (props) => <ThemedIcon Icon={require('lucide-react').Menu} {...props} />;
export const ThemedX = (props) => <ThemedIcon Icon={require('lucide-react').X} {...props} />;
export const ThemedChevronDown = (props) => <ThemedIcon Icon={require('lucide-react').ChevronDown} {...props} />;
export const ThemedCheck = (props) => <ThemedIcon Icon={require('lucide-react').Check} color="sage" {...props} />;
export const ThemedPlus = (props) => <ThemedIcon Icon={require('lucide-react').Plus} color="primary" {...props} />;
export const ThemedMinus = (props) => <ThemedIcon Icon={require('lucide-react').Minus} {...props} />;
export const ThemedTrash = (props) => <ThemedIcon Icon={require('lucide-react').Trash} {...props} />;
export const ThemedEdit = (props) => <ThemedIcon Icon={require('lucide-react').Edit} {...props} />;
export const ThemedBell = (props) => <ThemedIcon Icon={require('lucide-react').Bell} {...props} />;
export const ThemedStar = (props) => <ThemedIcon Icon={require('lucide-react').Star} color="primary" {...props} />;
export const ThemedHeart = (props) => <ThemedIcon Icon={require('lucide-react').Heart} color="primary" {...props} />;
export const ThemedShare = (props) => <ThemedIcon Icon={require('lucide-react').Share} {...props} />;
export const ThemedCopy = (props) => <ThemedIcon Icon={require('lucide-react').Copy} {...props} />;
export const ThemedDownload = (props) => <ThemedIcon Icon={require('lucide-react').Download} {...props} />;
export const ThemedUpload = (props) => <ThemedIcon Icon={require('lucide-react').Upload} {...props} />;
export const ThemedImage = (props) => <ThemedIcon Icon={require('lucide-react').Image} {...props} />;
export const ThemedVideo = (props) => <ThemedIcon Icon={require('lucide-react').Video} {...props} />;
export const ThemedMapPin = (props) => <ThemedIcon Icon={require('lucide-react').MapPin} color="primary" {...props} />;
export const ThemedClock = (props) => <ThemedIcon Icon={require('lucide-react').Clock} {...props} />;
export const ThemedCalendarDays = (props) => <ThemedIcon Icon={require('lucide-react').CalendarDays} {...props} />;
export const ThemedBuilding2 = (props) => <ThemedIcon Icon={require('lucide-react').Building2} color="sage" {...props} />;
export const ThemedGraduationCap = (props) => <ThemedIcon Icon={require('lucide-react').GraduationCap} color="sage" {...props} />;
export const ThemedGlobe = (props) => <ThemedIcon Icon={require('lucide-react').Globe} color="sage" {...props} />;
export const ThemedLoader2 = (props) => <ThemedIcon Icon={require('lucide-react').Loader2} color="primary" {...props} />;
export const ThemedArrowUp = (props) => <ThemedIcon Icon={require('lucide-react').ArrowUp} {...props} />;
export const ThemedArrowDown = (props) => <ThemedIcon Icon={require('lucide-react').ArrowDown} {...props} />;
export const ThemedArrowLeft = (props) => <ThemedIcon Icon={require('lucide-react').ArrowLeft} {...props} />;
export const ThemedArrowRight = (props) => <ThemedIcon Icon={require('lucide-react').ArrowRight} {...props} />;

// Export theme colors for use in other components
export { themeColors };
