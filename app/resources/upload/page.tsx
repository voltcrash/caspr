import { redirect } from 'next/navigation'
import { getUser } from '@/lib/actions/auth'
import ResourceUploadForm from '@/components/resources/ResourceUploadForm'

export default async function UploadResourcePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Resource</h1>
          <p className="mt-2 text-gray-600">
            Share your academic materials with the community
          </p>
        </div>

        <ResourceUploadForm userId={user.id} />
      </div>
    </div>
  )
}
