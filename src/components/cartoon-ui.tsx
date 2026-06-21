import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "light";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-[3px] border-navy font-display text-base font-bold transition-transform duration-150 px-7 py-3.5 active:translate-y-0.5";

const variants: Record<Variant, string> = {
  primary:
    "bg-sun text-navy-deep shadow-[0_8px_0_rgba(11,27,46,0.22)] hover:-translate-y-0.5 active:shadow-[0_3px_0_rgba(11,27,46,0.22)]",
  ghost: "bg-transparent text-navy hover:bg-navy hover:text-cream",
  light:
    "bg-cream text-navy-deep border-navy-deep shadow-[0_6px_0_rgba(11,27,46,0.45)] hover:-translate-y-0.5",
};

type CartoonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export const CartoonLink = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}: CartoonLinkProps) => (
  <Link {...rest} className={`${base} ${variants[variant]} ${className}`}>
    {children}
  </Link>
);

type CartoonAnchorProps = ComponentProps<"a"> & { variant?: Variant };
export const CartoonAnchor = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}: CartoonAnchorProps) => (
  <a {...rest} className={`${base} ${variants[variant]} ${className}`}>
    {children}
  </a>
);

type CartoonButtonProps = ComponentProps<"button"> & { variant?: Variant };
export const CartoonButton = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}: CartoonButtonProps) => (
  <button {...rest} className={`${base} ${variants[variant]} ${className}`}>
    {children}
  </button>
);

export const Eyebrow = ({
  tone = "mint",
  children,
}: {
  tone?: "mint" | "sun" | "coral" | "cream";
  children: ReactNode;
}) => {
  const colors = {
    mint: "text-mint-deep",
    sun: "text-sun-deep",
    coral: "text-coral-deep",
    cream: "text-mint",
  } as const;
  return (
    <span className={`eyebrow ${colors[tone]}`}>
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <path d="M8 1l1.6 4.7L14 7l-4.4 1.3L8 13l-1.6-4.7L2 7l4.4-1.3L8 1z" fill="currentColor" />
      </svg>
      {children}
    </span>
  );
};

export const SectionHead = ({
  eyebrow,
  eyebrowTone,
  title,
  desc,
}: {
  eyebrow: string;
  eyebrowTone?: "mint" | "sun" | "coral" | "cream";
  title: ReactNode;
  desc?: ReactNode;
}) => (
  <div className="mx-auto mb-12 max-w-[620px] text-center">
    <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
    <h2 className="mt-3 font-display text-[clamp(28px,3.6vw,40px)] font-extrabold">{title}</h2>
    {desc ? <p className="mt-3 text-[16.5px] opacity-85">{desc}</p> : null}
  </div>
);
