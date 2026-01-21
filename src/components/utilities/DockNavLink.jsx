"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DockNavLink = ({
  href,
  children,
  className = "",
  exact = false,
  ...props
}) => {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={isActive ? `dock-active` : ``} {...props}>
      {children}
    </Link>
  );
};

export default DockNavLink;
