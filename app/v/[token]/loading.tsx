import { ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#eceee9] px-4">
      <span className="grid size-16 animate-pulse place-items-center rounded-2xl bg-[#11512f] text-white">
        <ShieldCheck className="size-8" />
      </span>
      <p className="mt-6 text-base font-semibold text-[#101a14]">
        Vérification en cours…
      </p>
      <p className="mt-1 text-sm text-[#7a857e]">
        Merci de patienter quelques secondes
      </p>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-black/10">
        <div className="loader-bar h-full w-1/3 rounded-full bg-[#1f8359]" />
      </div>
    </div>
  );
}