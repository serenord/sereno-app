import { createClient } from '@/utils/supabase/server'
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Inicia sesión para ver tu perfil.</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <ProfileClient profile={profile} email={user.email || ''} />;
}
