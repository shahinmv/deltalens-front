import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "", style }) => (
  <div
    className={`animate-skeleton bg-muted rounded ${className}`}
    style={{ height: "1.5em", ...style }}
  />
);

export default Skeleton;
