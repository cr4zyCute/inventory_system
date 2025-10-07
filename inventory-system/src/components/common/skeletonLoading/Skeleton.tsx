import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
  className?: string;
  borderRadius?: string | number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  count?: number;
  inline?: boolean;
  style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height,
  variant = 'text',
  animation = 'wave',
  className = '',
  borderRadius,
  size,
  count = 1,
  inline = false,
  style = {}
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'skeleton-circular';
      case 'rectangular':
        return 'skeleton-rectangular';
      case 'rounded':
        return 'skeleton-rounded';
      case 'text':
      default:
        return 'skeleton-text';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'wave':
        return 'skeleton-wave';
      case 'shimmer':
        return 'skeleton-shimmer';
      case 'none':
        return 'skeleton-none';
      case 'pulse':
      default:
        return 'skeleton-pulse';
    }
  };

  const getSizeClass = () => {
    if (!size) return '';
    return `skeleton-${size}`;
  };

  const getSkeletonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      display: inline ? 'inline-block' : 'block',
      ...style
    };

    // Only set height if not using size classes
    if (!size && height) {
      baseStyle.height = typeof height === 'number' ? `${height}px` : height;
    }

    if (borderRadius) {
      baseStyle.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
    }

    return baseStyle;
  };

  const renderSkeleton = (index: number = 0) => (
    <div
      key={index}
      className={`skeleton ${getVariantClass()} ${getAnimationClass()} ${getSizeClass()} ${className}`}
      style={getSkeletonStyle()}
    />
  );

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className={inline ? 'skeleton-inline-container' : 'skeleton-container'}>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

export default Skeleton;
