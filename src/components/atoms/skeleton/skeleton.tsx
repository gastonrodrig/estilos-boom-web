type SkeletonProps = {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100px",
  height = "20px",
  borderRadius = "9999px",
  className = "",
}: SkeletonProps) => {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-gray-200
        animate-pulse
        ${className}
      `}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}
