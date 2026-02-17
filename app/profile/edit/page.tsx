import { redirect } from 'next/navigation'
import { getUser, getProfile } from '@/lib/actions/auth'
import ProfileEditForm from '@/components/profile/ProfileEditForm'

export default async function ProfileEditPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>
        <ProfileEditForm profile={profile} />
      </div>
    </div>
  )
}
