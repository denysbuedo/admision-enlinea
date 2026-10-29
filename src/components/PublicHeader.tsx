"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Brand from "./Brand";

/** Shared public navigation; internal dashboards retain their role-specific controls. */
export default function PublicHeader() {
  const pathname = usePathname();
  const isPublic = ["/", "/login", "/register", "/programs"].includes(pathname) || pathname.startsWith("/programs/");
  return isPublic ? <PublicNavigation key={pathname} pathname={pathname} /> : null;
}

function PublicNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const close = () => setOpen(false);
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);

  return (
    <header ref={header} className={`ru-header${open ? " is-open" : ""}`} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="ru-header__inner">
        <Link href="/" className="ru-header__brand" aria-label="CONVOCA · Inicio" onClick={() => setOpen(false)}><Brand inverse /></Link>
        <button ref={toggle} type="button" className="ru-header__toggle" aria-controls="public-navigation" aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"} onClick={() => setOpen(!open)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="public-navigation" className="ru-header__nav" aria-label="Navegación principal" onClick={() => setOpen(false)}>
          <Link className="ru-header__link" href="/programs" aria-current={pathname.startsWith("/programs") ? "page" : undefined}>Programas</Link>
          <Link className="ru-header__link" href="/#como-funciona">Cómo funciona</Link>
          <Link className="ru-header__link" href="/login" aria-current={pathname === "/login" ? "page" : undefined}>Iniciar sesión</Link>
          <Link className="ru-header__cta" href="/register" aria-current={pathname === "/register" ? "page" : undefined}>Crear cuenta</Link>
        </nav>
      </div>
    </header>
  );
}
