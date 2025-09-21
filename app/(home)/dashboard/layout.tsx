import { getUser } from "@/lib/db/queries";
import { DashboardLayoutClient } from "@/components/DashboardLayout";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  // Decide which nav items are visible
  const allowedNavItems = [
    { href: "/dashboard", icon: "Users", label: "Account" },
    ...(user?.role === "owner"
      ? [
          {
            href: "/dashboard/manage-videos",
            icon: "UserLock",
            label: "Manage Videos",
          },
        ]
      : []),
    ...(user?.role === "creator"
      ? [{ href: "/dashboard/my-videos", icon: "Video", label: "My Videos" }]
      : []),
    { href: "/dashboard/general", icon: "Settings", label: "General" },
    { href: "/dashboard/activity", icon: "Activity", label: "Activity" },
    { href: "/dashboard/security", icon: "Shield", label: "Security" },
  ];

  return (
    <DashboardLayoutClient navItems={allowedNavItems}>
      {children}
    </DashboardLayoutClient>
  );
}
