import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400"
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-700 dark:text-zinc-200">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
