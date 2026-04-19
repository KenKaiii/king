interface ImageGridSkeletonProps {
  count: number;
}

export default function ImageGridSkeleton({ count }: ImageGridSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-${index}`} className="skeleton-loader relative size-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                className="animate-pulse text-[var(--base-color-brand--umber)]/60"
              >
                <path
                  d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
                  fill="currentColor"
                />
              </svg>
              <span className="animate-pulse text-xs text-[var(--base-color-brand--umber)]">
                Generating...
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
