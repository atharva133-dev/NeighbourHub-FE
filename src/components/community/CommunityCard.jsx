import { ArrowRight, Hash, Building2, GraduationCap, Globe, LogOut } from 'lucide-react';

const TYPE_META = {
  society:        { label: 'Society', Icon: Building2,     typeClass: 'type-society' },
  college_school: { label: 'College', Icon: GraduationCap, typeClass: 'type-college' },
  other:          { label: 'Other',   Icon: Globe,         typeClass: 'type-other' },
};

export default function CommunityCard({ community, onEnter, onLeave }) {
  const initials = community.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const meta = TYPE_META[community.type] || TYPE_META.other;
  const MetaIcon = meta.Icon;
  
  const isAdmin = community.isAdmin;
  const typeClass = meta.typeClass;
  
  const bgStyles = {
    'type-society': 'radial-gradient(circle, rgba(110,143,115,0.28), transparent 70%)',
    'type-college': 'radial-gradient(circle, rgba(201,123,90,0.28), transparent 70%)',
    'type-other': 'radial-gradient(circle, rgba(168,68,47,0.24), transparent 70%)',
  };
  
  const adminGlow = 'radial-gradient(circle, rgba(201,123,90,0.32), transparent 70%)';
  
  const avatarStyles = {
    'type-society': { background: 'linear-gradient(135deg, #6e8f73, #55735a)', color: '#f3f8f2' },
    'type-college': { background: 'linear-gradient(135deg, #c97b5a, #ad6247)', color: '#fdf6f1' },
    'type-other': { background: 'linear-gradient(135deg, #a8442f, #8c3626)', color: '#fbeeea' },
  };
  
  const pillStyles = {
    'type-society': { color: '#6e8f73', borderColor: 'rgba(110,143,115,0.3)', background: 'rgba(110,143,115,0.08)' },
    'type-college': { color: '#c97b5a', borderColor: 'rgba(201,123,90,0.3)', background: 'rgba(201,123,90,0.08)' },
    'type-other': { color: '#a8442f', borderColor: 'rgba(168,68,47,0.3)', background: 'rgba(168,68,47,0.08)' },
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-[22px] border border-[#161c14]/9 bg-[#fdfcf7] shadow-[0_2px_10px_rgba(22,28,20,0.05)] transition-all duration-400 hover:-translate-y-[6px] hover:border-[#161c14]/17 hover:shadow-[0_26px_50px_rgba(22,28,20,0.14)]"
    >
      <div 
        className="relative flex h-[150px] items-start justify-between overflow-hidden p-[18px_20px]"
        style={{ background: 'linear-gradient(150deg, #efede3, #fdfcf7)' }}
      >
        <div 
          className="absolute inset-0 opacity-[0.55]"
          style={{ backgroundImage: 'radial-gradient(rgba(22,28,20,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <div 
          className="absolute -right-[60px] -top-[70px] h-[220px] w-[220px] rounded-full blur-[30px]"
          style={{ background: isAdmin ? adminGlow : bgStyles[typeClass] }}
        />
        
        <span 
          className={`relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
            isAdmin 
              ? 'border border-[#c97b5a]/35 bg-[#c97b5a]/15 text-[#c97b5a]' 
              : 'border border-[#161c14]/9 bg-[#161c14]/[0.045] text-[#656f5f]'
          }`}
        >
          {isAdmin ? '🛡 Admin' : 'Member'}
        </span>
        
        <div 
          className="absolute -bottom-[18px] right-[14px] z-0 font-bold tracking-[-0.04em] text-[#161c14]/[0.045] select-none"
          style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '84px' }}
        >
          {initials}
        </div>
        
        <div 
          className="relative z-10 mt-[38px] flex h-[60px] w-[60px] items-center justify-center rounded-[16px] border border-white/40 text-[20px] font-bold shadow-[0_10px_22px_rgba(22,28,20,0.2)]"
          style={{ fontFamily: '"Space Grotesk", sans-serif', ...avatarStyles[typeClass] }}
        >
          {community.avatar ? <img src={community.avatar} alt="" className="h-full w-full object-cover rounded-[15px]" /> : initials}
        </div>
      </div>

      <div className="p-[20px_22px_22px]">
        <div className="flex items-center justify-between gap-2.5">
          <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-bold text-[#20261f]" style={{ fontFamily: '"Inter", sans-serif' }}>
            {community.name || 'Unnamed Community'}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#6e8f73]/30 bg-[#6e8f73]/14 px-2.5 py-1 text-[11px] font-bold text-[#6e8f73]">
             <span className="relative flex h-[5px] w-[5px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6e8f73] opacity-75"></span>
                <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-[#6e8f73]" style={{ boxShadow: '0 0 6px #6e8f73' }}></span>
              </span>
              LIVE
          </div>
        </div>
        
        {community.description && (
          <p className="mt-2 line-clamp-2 text-[13px] text-[#656f5f]">{community.description}</p>
        )}

        <div className="mt-3.5 flex flex-wrap gap-2">
          <span 
            className="flex items-center gap-1.5 rounded-full border px-[11px] py-1.5 text-[12px] font-semibold"
            style={pillStyles[typeClass]}
          >
            <MetaIcon className="h-3 w-3" />
            {meta.label}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#161c14]/9 bg-[#161c14]/[0.045] px-[11px] py-1.5 text-[12px] font-medium text-[#656f5f]">
            👤 {community.memberCount}
          </span>
          {community.code && (
            <span className="flex items-center gap-1.5 rounded-full border border-[#161c14]/9 bg-[#161c14]/[0.045] px-[11px] py-1.5 text-[12px] font-mono text-[#656f5f]">
              # {community.code}
            </span>
          )}
        </div>

        {community.admin && (
          <div className="mt-3.5 text-[13px] text-[#656f5f]">
            By <b className="font-semibold text-[#20261f]">{community.admin.name}</b>
          </div>
        )}

        <div className="mt-5 flex gap-2.5">
          <button 
            onClick={() => onLeave && onLeave(community)}
            className="flex flex-1 items-center justify-center gap-[7px] rounded-[11px] border border-[#a8442f]/25 bg-[#a8442f]/8 py-[11px] text-[13.5px] font-semibold text-[#a8442f] transition-all hover:-translate-y-[1px] hover:bg-[#a8442f]/14"
          >
            <LogOut className="h-4 w-4" />
            Leave
          </button>
          <button 
            onClick={() => onEnter(community)}
            className="flex flex-[1.6] items-center justify-center gap-[7px] rounded-[11px] py-[11px] text-[13.5px] font-bold text-[#fdf6f1] transition-all hover:-translate-y-[2px]"
            style={{ background: 'linear-gradient(135deg, #c97b5a, #ad6247)', boxShadow: '0 8px 18px rgba(201,123,90,0.3)' }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 26px rgba(201,123,90,0.42)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 8px 18px rgba(201,123,90,0.3)'}
          >
            Enter <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
