import { useId } from "react";
export interface NowCardProps {
  title: string;
  description?: string;
  activities?: string[];
  label?: string;
}
export function NowCard({
  title,
  description,
  activities = [],
  label = "NOW / 当前在做",
}: NowCardProps) {
  const id = useId();
  return (
    <section className="rc-panel rc-now-card" aria-labelledby={id}>
      <span className="rc-eyebrow">{label}</span>
      <h2 id={id}>{title}</h2>
      {description && <p>{description}</p>}
      {activities.length > 0 && (
        <ul>
          {activities.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
