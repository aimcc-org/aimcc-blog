export function ProfileIcon({
  kind,
}: {
  kind: "badge" | "location" | "github" | "mail" | "arrow";
}) {
  const paths = {
    badge: (
      <>
        <path d="m12 2 3 2 3.5.5.5 3.5 2 4-2 3-.5 3.5-3.5.5-3 2-4-2-3.5-.5-.5-3.5-2-3 2-4 .5-3.5L8 4Z" />
        <path d="m10 8 5 4-5 4Z" fill="currentColor" stroke="none" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    github: (
      <path
        fill="currentColor"
        stroke="none"
        d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.76 2.1 3.28 1.2.1-.72.39-1.2.71-1.48-2.5-.28-5.12-1.25-5.12-5.57 0-1.23.44-2.24 1.15-3.02-.11-.29-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.22 2.69.11 2.98.72.78 1.15 1.79 1.15 3.02 0 4.33-2.63 5.29-5.14 5.57.4.35.76 1.03.76 2.08v2.8c0 .3.21.65.78.54A11.2 11.2 0 0 0 12 .8Z"
      />
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="m3 5 9 8 9-8M3 19l6-6m12 6-6-6" />
      </>
    ),
    arrow: (
      <>
        <path d="M6 18 18 6M7 6h11v11" />
      </>
    ),
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}
