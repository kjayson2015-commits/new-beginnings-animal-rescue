/* Shared UI pieces for the public site and the admin. */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

function Icon({ name, size = 20, className = "", strokeWidth = 2 }) {
  const lib = (window.lucide && window.lucide.icons) || {};
  const node = lib[name] || lib.Circle || [];
  const kids = Array.isArray(node) && node[0] === "svg" ? node[2] : node;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {(kids || []).map((child, i) => {
        const [tag, attrs] = child;
        const clean = {};
        Object.keys(attrs || {}).forEach(k => { if (k !== "key") clean[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = attrs[k]; });
        return React.createElement(tag, { ...clean, key: i });
      })}
    </svg>
  );
}

const SOCIAL_ICON = { instagram: "Instagram", facebook: "Facebook", tiktok: "Music2", youtube: "Youtube", x: "Twitter", twitter: "Twitter", threads: "AtSign", linkedin: "Linkedin" };
const socialIcon = (label) => SOCIAL_ICON[String(label || "").toLowerCase()] || "Link";
const PAY_ICON = { venmo: "Smartphone", paypal: "Wallet", zelle: "Landmark", "cash app": "DollarSign", cashapp: "DollarSign" };
const payIcon = (label) => PAY_ICON[String(label || "").toLowerCase()] || "CreditCard";

const TINTS = ["#F6E3CF", "#E8F0E9", "#E6ECF3", "#FBEBD2", "#EDE8F4", "#F5E6EA"];
function DogArt({ dog, variant = 0, className = "" }) {
  const seed = String(dog.slug || dog.name || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = TINTS[(seed + variant) % TINTS.length];
  const tilt = [0, -8, 7][variant % 3];
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label={`Illustration of ${dog.name}`} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill={bg} />
      <circle cx="330" cy="60" r="70" fill="#ffffff" opacity="0.35" />
      <circle cx="60" cy="260" r="90" fill="#ffffff" opacity="0.25" />
      <g transform={`rotate(${tilt} 200 170)`}>
        <ellipse cx="200" cy="285" rx="110" ry="60" fill={dog.coat || "#C98B52"} />
        <ellipse cx="128" cy="140" rx="34" ry="62" fill={dog.ear || "#7A4E2D"} transform="rotate(18 128 140)" />
        <ellipse cx="272" cy="140" rx="34" ry="62" fill={dog.ear || "#7A4E2D"} transform="rotate(-18 272 140)" />
        <circle cx="200" cy="155" r="82" fill={dog.coat || "#C98B52"} />
        <ellipse cx="200" cy="190" rx="44" ry="34" fill="#ffffff" opacity="0.55" />
        <circle cx="172" cy="145" r="9" fill="#2B2927" /><circle cx="228" cy="145" r="9" fill="#2B2927" />
        <circle cx="175" cy="142" r="3" fill="#ffffff" /><circle cx="231" cy="142" r="3" fill="#ffffff" />
        <ellipse cx="200" cy="178" rx="13" ry="9" fill="#2B2927" />
        <path d="M188 196 Q200 206 212 196" stroke="#2B2927" strokeWidth="3" fill="none" strokeLinecap="round" />
        {variant === 1 && <ellipse cx="200" cy="210" rx="9" ry="12" fill="#E07A5F" />}
      </g>
    </svg>
  );
}

/* Real photo if the dog has one, illustration otherwise. */
function DogPhoto({ dog, index = 0, className = "" }) {
  const photos = (dog.photos || []).filter(Boolean);
  const [broken, setBroken] = useState(false);
  const src = photos.length ? photos[index % photos.length] : null;
  useEffect(() => setBroken(false), [src]);
  if (src && !broken) return <img src={src} alt={`Photo of ${dog.name}`} className={`object-cover ${className}`} onError={() => setBroken(true)} loading="lazy" />;
  return <DogArt dog={dog} variant={index} className={className} />;
}

function Logo({ settings, size = 40, className = "" }) {
  const [broken, setBroken] = useState(false);
  if (settings.logoUrl && !broken) return <img src={settings.logoUrl} alt="" width={size} height={size} onError={() => setBroken(true)} className={`rounded-full object-cover border-2 border-white shadow-sm shrink-0 ${className}`} style={{ width: size, height: size }} />;
  return <span className={`rounded-full bg-terra text-white flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}><Icon name="PawPrint" size={size / 2} /></span>;
}

const STATUS_STYLE = { Available: "bg-sage text-white", Pending: "bg-sand text-ink", Adopted: "bg-[#A39C94] text-white" };
const STATUS_LABEL = { Available: "Available", Pending: "Application Pending", Adopted: "Adopted" };
function StatusPill({ status, className = "" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border border-white/50 ${STATUS_STYLE[status] || STATUS_STYLE.Available} ${className}`}>{STATUS_LABEL[status] || status}</span>;
}
function Tag({ children }) {
  return <span className="rounded-full bg-white/70 border border-white/70 px-3 py-1 text-xs font-semibold text-muted">{children}</span>;
}

function Button({ children, onClick, variant = "primary", className = "", type = "button", disabled, title }) {
  const styles = {
    primary: "bg-terra hover:bg-terraDark text-white shadow-[0_8px_24px_rgba(224,122,95,0.30)]",
    glass: "glass hover:bg-white/80 text-ink",
    sage: "bg-sage hover:bg-[#6FA088] text-white",
    dark: "bg-ink hover:bg-black text-white",
    danger: "bg-[#B8432C] hover:bg-[#9C3824] text-white",
    ghost: "text-ink hover:bg-white/60",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

async function copyText(text, toast) {
  try { await navigator.clipboard.writeText(text); toast && toast(`Copied: ${text}`); }
  catch (e) { toast && toast(`Copy this: ${text}`); }
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] glass-strong rounded-full px-5 py-3 font-semibold text-sm flex items-center gap-2 fade-in max-w-[92vw]" role="status">
      <Icon name="CircleCheck" size={18} className="text-sage shrink-0" /><span className="truncate">{msg}</span>
    </div>
  );
}
function useToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(""), 2800); return () => clearTimeout(t); }, [msg]);
  return [msg, setMsg];
}

function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-terra opacity-20 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-sage opacity-25 blur-[130px]" />
      <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-sand opacity-25 blur-[130px]" />
    </div>
  );
}

const inputCls = "w-full rounded-xl bg-white/75 border border-[#E9E2D9] px-4 py-3 text-ink placeholder:text-muted/60";
function Field({ label, children, hint, full, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""} ${className}`}>
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Spinner({ label = "Loading…" }) {
  return <div className="flex items-center justify-center gap-3 py-16 text-muted font-semibold"><span className="w-5 h-5 border-2 border-terra border-t-transparent rounded-full animate-spin" />{label}</div>;
}
