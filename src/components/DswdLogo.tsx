import Image from 'next/image';

export default function DswdLogo({ className = 'h-12 w-12' }: { className?: string }) {
  return <Image src="/dswd-logo.svg" alt="DSWD logo" width={100} height={100} priority className={`shrink-0 object-contain ${className}`} />;
}
