export interface AmbientCardProps {
  image: string;
  slogan: string;
}
/** Decorative artwork; slogan remains readable text. */
export function AmbientCard({ image, slogan }: AmbientCardProps) {
  return (
    <div className="rc-ambient-card">
      <span>{slogan}</span>
      <img src={image} alt="" loading="lazy" />
    </div>
  );
}
