import Image from "next/image";

export default function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Image src={inverse ? "/brand/logo-inverse.svg" : "/brand/logo.svg"} alt="CONVOCA" width={168} height={48} className="brand-logo" priority />;
}
