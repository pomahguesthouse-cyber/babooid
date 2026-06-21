import type { ReactNode } from "react";
import { Eyebrow } from "./cartoon-ui";

type Props = {
  eyebrow?: string;
  eyebrowTone?: "mint" | "sun" | "coral" | "cream";
  title: ReactNode;
  desc?: ReactNode;
  children?: ReactNode;
};

export const PageHero = ({ eyebrow, eyebrowTone = "mint", title, desc, children }: Props) => {
  return (
    <section className="relative overflow-hidden bg-cream-deep">
      <div className="absolute -left-20 -top-16 h-[220px] w-[220px] rounded-full bg-mint opacity-30" />
      <div className="absolute -right-16 -bottom-16 h-[200px] w-[200px] rounded-full bg-sun opacity-35" />
      <div className="absolute right-[20%] top-6 h-[120px] w-[120px] rounded-full bg-coral opacity-25" />
      <div className="relative mx-auto max-w-[1180px] px-7 py-20 text-center">
        {eyebrow ? <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-3 font-display text-[clamp(34px,5vw,52px)] font-extrabold text-navy">{title}</h1>
        {desc ? <p className="mx-auto mt-4 max-w-2xl text-[17px] opacity-85">{desc}</p> : null}
        {children ? <div className="mt-7 flex flex-wrap justify-center gap-3.5">{children}</div> : null}
      </div>
    </section>
  );
};
