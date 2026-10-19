import { Skeleton } from "@/components/admin/ui";

/** Affichée instantanément pendant qu'une page se prépare. */
export default function ChargementAdmin() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 rounded-[2rem]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[108px] rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}