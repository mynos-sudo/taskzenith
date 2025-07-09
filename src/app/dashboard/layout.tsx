import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const userProfile: Profile = {
    id: user.id,
    name: profile?.name ?? 'No Name',
    email: user.email!,
    avatar: profile?.avatar ?? `https://i.pravatar.cc/150?u=${user.email!}`,
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header user={userProfile} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
