import Image from "next/image";

export default function Brand({ inverse = false, navigation = false }: { inverse?: boolean; navigation?: boolean }) {
  return <Image src={navigation ? "/brand/logo-navigation.svg" : inverse ? "/brand/logo-inverse.svg" : "/brand/logo.svg"} alt="CONVOCA" width={navigation ? 514 : 168} height={navigation ? 104 : 48} className="brand-logo" priority />;
}
