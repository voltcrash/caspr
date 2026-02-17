import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import { getResource } from '@/lib/actions/resources'
import ResourceEditForm from '@/components/resources/ResourceEditForm'

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: resource, error } = await getResource(id)

  if (error || !resource) {
    redirect('/resources')
  }

  // Check if user is the owner
  if (resource.user_id !== user.id) {
    redirect(`/resources/${id}`)
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/resources/${id}`}
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Resource
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Resource</h1>
          <p className="mt-2 text-gray-400">
            Update the information for your resource
          </p>
        </div>

        <ResourceEditForm resource={resource} />
      </div>
    </div>
  )
}
