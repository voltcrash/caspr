import { redirect } from 'next/navigation'
import { getUser, getProfile, logout } from '@/lib/actions/auth'
import ProfileView from '@/components/profile/ProfileView'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileView profile={profile} onLogout={logout} />
    </div>
  )
}
