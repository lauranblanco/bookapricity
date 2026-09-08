// The BookApricity mark at nav/UI scale (<=28px): a calendar leaf with the
// Umbricity parasol scallop, the sun always behind it, one reserved cell in
// resol. Below 28px the full mark collapses to this 3-cell geometry — see
// design_handoff_bookapricity/brand/mark-24.svg (never scale mark-color.svg
// itself under 28px).
export function BrandMark({
  variant = "color",
  size = 24,
  className,
}: {
  variant?: "color" | "negative";
  size?: number;
  className?: string;
}) {
  const leafFill = variant === "color" ? "#35486B" : "#FBF3E4";
  const interiorFill = variant === "color" ? "#FBF3E4" : "#35486B";

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="30" r="20" fill="#E8A33D" />
      <path
        d="M20 38 H100 V96 Q88 106 76 96 Q64 106 52 96 Q40 106 28 96 Q24 100 20 96 Z"
        fill={leafFill}
      />
      <g fill={interiorFill}>
        <rect x="28" y="46" width="64" height="7" />
        <rect x="28" y="62" width="20" height="14" />
        <rect x="72" y="62" width="20" height="14" />
      </g>
      <rect x="50" y="62" width="20" height="14" fill="#E2683F" />
    </svg>
  );
}
