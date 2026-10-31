import { forwardRef } from 'react';
import {
  Home, Calendar, Search, AlertTriangle, Users, Settings, User, Shield, Pin,
  FileText, BookOpen, Dumbbell, ArrowLeftRight, LogOut, Menu, X, ChevronDown,
  Check, Plus, Minus, Trash, Edit, Bell, Star, Heart, Share, Copy, Download,
  Upload, Image, Video, MapPin, Clock, CalendarDays, Building2, GraduationCap,
  Globe, Loader2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';

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
export const ThemedHome = (props) => <ThemedIcon Icon={Home} {...props} />;
export const ThemedCalendar = (props) => <ThemedIcon Icon={Calendar} {...props} />;
export const ThemedSearch = (props) => <ThemedIcon Icon={Search} {...props} />;
export const ThemedAlert = (props) => <ThemedIcon Icon={AlertTriangle} color="primary" {...props} />;
export const ThemedUsers = (props) => <ThemedIcon Icon={Users} color="sage" {...props} />;
export const ThemedSettings = (props) => <ThemedIcon Icon={Settings} {...props} />;
export const ThemedUser = (props) => <ThemedIcon Icon={User} {...props} />;
export const ThemedShield = (props) => <ThemedIcon Icon={Shield} color="primary" {...props} />;
export const ThemedPin = (props) => <ThemedIcon Icon={Pin} color="primary" {...props} />;
export const ThemedFileText = (props) => <ThemedIcon Icon={FileText} color="sage" {...props} />;
export const ThemedBookOpen = (props) => <ThemedIcon Icon={BookOpen} color="sage" {...props} />;
export const ThemedDumbbell = (props) => <ThemedIcon Icon={Dumbbell} color="sage" {...props} />;
export const ThemedArrowLeftRight = (props) => <ThemedIcon Icon={ArrowLeftRight} {...props} />;
export const ThemedLogOut = (props) => <ThemedIcon Icon={LogOut} color="primary" {...props} />;
export const ThemedMenu = (props) => <ThemedIcon Icon={Menu} {...props} />;
export const ThemedX = (props) => <ThemedIcon Icon={X} {...props} />;
export const ThemedChevronDown = (props) => <ThemedIcon Icon={ChevronDown} {...props} />;
export const ThemedCheck = (props) => <ThemedIcon Icon={Check} color="sage" {...props} />;
export const ThemedPlus = (props) => <ThemedIcon Icon={Plus} color="primary" {...props} />;
export const ThemedMinus = (props) => <ThemedIcon Icon={Minus} color="sage" {...props} />;
export const ThemedTrash = (props) => <ThemedIcon Icon={Trash} {...props} />;
export const ThemedEdit = (props) => <ThemedIcon Icon={Edit} {...props} />;
export const ThemedBell = (props) => <ThemedIcon Icon={Bell} {...props} />;
export const ThemedStar = (props) => <ThemedIcon Icon={Star} color="primary" {...props} />;
export const ThemedHeart = (props) => <ThemedIcon Icon={Heart} color="primary" {...props} />;
export const ThemedShare = (props) => <ThemedIcon Icon={Share} {...props} />;
export const ThemedCopy = (props) => <ThemedIcon Icon={Copy} {...props} />;
export const ThemedDownload = (props) => <ThemedIcon Icon={Download} {...props} />;
export const ThemedUpload = (props) => <ThemedIcon Icon={Upload} {...props} />;
export const ThemedImage = (props) => <ThemedIcon Icon={Image} {...props} />;
export const ThemedVideo = (props) => <ThemedIcon Icon={Video} {...props} />;
export const ThemedMapPin = (props) => <ThemedIcon Icon={MapPin} color="primary" {...props} />;
export const ThemedClock = (props) => <ThemedIcon Icon={Clock} {...props} />;
export const ThemedCalendarDays = (props) => <ThemedIcon Icon={CalendarDays} {...props} />;
export const ThemedBuilding2 = (props) => <ThemedIcon Icon={Building2} color="sage" {...props} />;
export const ThemedGraduationCap = (props) => <ThemedIcon Icon={GraduationCap} color="sage" {...props} />;
export const ThemedGlobe = (props) => <ThemedIcon Icon={Globe} color="sage" {...props} />;
export const ThemedLoader2 = (props) => <ThemedIcon Icon={Loader2} color="primary" {...props} />;
export const ThemedArrowUp = (props) => <ThemedIcon Icon={ArrowUp} {...props} />;
export const ThemedArrowDown = (props) => <ThemedIcon Icon={ArrowDown} {...props} />;
export const ThemedArrowLeft = (props) => <ThemedIcon Icon={ArrowLeft} {...props} />;
export const ThemedArrowRight = (props) => <ThemedIcon Icon={ArrowRight} {...props} />;

export { themeColors };
