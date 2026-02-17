'use client'

import { useState } from 'react'
import { incrementDownloadCount } from '@/lib/actions/resources'

interface DownloadButtonProps {
  fileUrl: string
  resourceId: string
  fileName: string
}

export default function DownloadButton({ fileUrl, resourceId, fileName }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await incrementDownloadCount(resourceId)
      window.open(`${fileUrl}?download=`, '_blank')
    } catch {
      window.open(fileUrl, '_blank')
    }
    setTimeout(() => setDownloading(false), 2000)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all disabled:opacity-70 shadow-lg shadow-orange-500/20"
    >
      {downloading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Downloading...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download {fileName.split('.').pop()?.toUpperCase()}
        </>
      )}
    </button>
  )
}
