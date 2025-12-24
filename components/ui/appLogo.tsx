import Image from "next/image";
import cn from "clsx";

export function AppLogo({
  logoClassName,
  width,
  height,
  size,
}: {
  logoClassName?: string;
  width?: number;
  height?: number;
  size?: number;
}) {
  return (
    <Image
      src="/logo.png"
      alt="AI SalesFlow"
      width={width ?? 150}
      height={height ?? 50}
      className={cn("h-10 w-auto object-contain", logoClassName)}
      priority
    />
  );
}

export function AppName({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "font-bold text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",
        className
      )}
    >
      AI SalesFlow
    </div>
  );
}
