"use client";

/* eslint-disable @next/next/no-img-element -- supplied challenge assets keep their intrinsic sizes */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "@/lib/site-data";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // A route change closes the menu (adjusting state during render instead of in an effect).
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = () => { if (wide.matches) setOpen(false); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const closeWhenFocusLeaves = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !headerRef.current?.contains(next)) setOpen(false);
  };

  return (
    <header className="site-header" ref={headerRef} onBlur={closeWhenFocusLeaves}>
      <div className="site-header__bar">
        <Link className="logo" href="/" aria-current={pathname === "/" ? "page" : undefined}>
          <img src="/assets/shared/desktop/logo-dark.png" width={202} height={27} alt="Designo home" />
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(value => !value)}
        >
          <span className="sr-only">Menu</span>
          <img src={open ? "/assets/shared/mobile/icon-close.svg" : "/assets/shared/mobile/icon-hamburger.svg"} width={24} height={20} alt="" />
        </button>
        <nav id="primary-nav" className={`site-nav${open ? " on-dark" : ""}`} aria-label="Primary" data-open={open}>
          <ul>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {open && <div className="menu-overlay" data-testid="menu-overlay" aria-hidden="true" onClick={() => setOpen(false)} />}
    </header>
  );
}
