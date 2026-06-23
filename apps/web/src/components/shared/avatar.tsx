import Image from "next/image";

type AvatarProps = { name: string; image?: string; size?: "sm" | "md" | "lg" };

export function Avatar({ name, image, size = "md" }: AvatarProps) {
  const dimensions = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" }[size];
  if (image) return <Image src={image} alt={name} width={64} height={64} unoptimized className={`${dimensions} rounded-full border border-slate-700 object-cover`} />;
  return <span className={`${dimensions} inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-300 to-cyan-500 font-bold text-slate-950`}>{name.slice(0, 1).toUpperCase()}</span>;
}
