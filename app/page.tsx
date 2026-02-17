import Link from "next/link";
import { getUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/resources");
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px] animate-float" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-orange-600/8 rounded-full blur-[100px] animate-float delay-300" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-amber-500/6 rounded-full blur-[100px] animate-float delay-600" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/60 backdrop-blur-xl border-b border-gray-800/50 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-extrabold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CASPR</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-glow" />
            <span className="text-xs font-semibold text-orange-400 tracking-wide uppercase">Neural Breach &mdash; Yugastr 2026</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Campus Academic
            <span className="block bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              Resource Sharing
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Upload, discover, and share academic materials across your campus.
            Notes, question papers, solutions, and more &mdash; all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative px-8 py-3.5 text-base font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              <span className="relative z-10">Create Free Account</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 text-base font-semibold text-orange-400 bg-orange-500/10 rounded-xl hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Floating UI Mockup */}
        <div className="animate-fade-in-up delay-500 mt-20 max-w-3xl mx-auto">
          <div className="relative rounded-2xl border border-gray-800 bg-gray-950/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 text-center">
                <span className="text-xs text-gray-500 font-mono">caspr.app/resources</span>
              </div>
            </div>
            {/* Mock Content */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: "Data Structures Notes", type: "Notes", color: "orange" },
                { title: "OS Mid-Term Paper", type: "Question Paper", color: "blue" },
                { title: "DBMS Solutions", type: "Solutions", color: "green" },
                { title: "ML Project Report", type: "Project Report", color: "purple" },
                { title: "Algorithms Guide", type: "Study Material", color: "pink" },
                { title: "CN Lab Manual", type: "Notes", color: "orange" },
              ].map((item, i) => (
                <div key={i} className={`animate-scale-in delay-${(i + 4) * 100} rounded-xl bg-gray-900 border border-gray-800 p-4 hover:border-orange-500/40 transition-all`}>
                  <div className={`w-8 h-8 rounded-lg mb-2 ${
                    item.color === 'orange' ? 'bg-orange-500/20' :
                    item.color === 'blue' ? 'bg-blue-500/20' :
                    item.color === 'green' ? 'bg-green-500/20' :
                    item.color === 'purple' ? 'bg-purple-500/20' : 'bg-pink-500/20'
                  } flex items-center justify-center`}>
                    <svg className={`w-4 h-4 ${
                      item.color === 'orange' ? 'text-orange-400' :
                      item.color === 'blue' ? 'text-blue-400' :
                      item.color === 'green' ? 'text-green-400' :
                      item.color === 'purple' ? 'text-purple-400' : 'text-pink-400'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative z-10 border-y border-gray-800/50 bg-gray-950/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "5", label: "Core Features" },
            { value: "5+", label: "File Types" },
            { value: "100%", label: "Privacy Control" },
            { value: "1-5", label: "Star Ratings" },
          ].map((stat, i) => (
            <div key={i} className={`animate-fade-in-up delay-${(i + 2) * 100}`}>
              <p className="text-3xl sm:text-4xl font-extrabold text-orange-500">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 5 CORE FEATURES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="animate-fade-in text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Everything You Need</p>
          <h2 className="animate-fade-in-up text-3xl sm:text-4xl font-extrabold text-white">
            5 Powerful Core Features
          </h2>
          <p className="animate-fade-in-up delay-100 mt-4 text-gray-400 max-w-2xl mx-auto">
            Built for hackathon excellence &mdash; every mandatory feature, fully implemented and functional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="animate-fade-in-up delay-100 group relative bg-gray-950 rounded-2xl border border-gray-800 p-7 hover:border-orange-500/40 transition-all hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">User Authentication & Profiles</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Secure email/password registration with full user profiles &mdash; name, college, branch, semester, year, optional bio and profile picture.
              </p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Registration & Login</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Persistent Sessions</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Editable Profiles</li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="animate-fade-in-up delay-200 group relative bg-gray-950 rounded-2xl border border-gray-800 p-7 hover:border-orange-500/40 transition-all hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Resource Upload & Management</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Upload PDFs, DOCX, PPT, images and more. Add titles, subjects, semesters, resource types, tags, and descriptions.
              </p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Multi-format Upload</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Tags & Keywords</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Edit & Delete</li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="animate-fade-in-up delay-300 group relative bg-gray-950 rounded-2xl border border-gray-800 p-7 hover:border-orange-500/40 transition-all hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Access Control & Privacy</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Mark resources as Public or Private. Private resources are only accessible to students from the same college/institution.
              </p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Same-College Gating</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Uploader Chooses Privacy</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Visual Indicators</li>
              </ul>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="animate-fade-in-up delay-400 group relative bg-gray-950 rounded-2xl border border-gray-800 p-7 hover:border-orange-500/40 transition-all hover:-translate-y-1 md:col-span-1 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Search & Filter System</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Powerful search across titles, subjects, and descriptions. Filter by subject, semester, type, branch, year, and privacy level.
              </p>
              <ul className="mt-4 space-y-1.5">
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Full-text Search</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Combined Filters</li>
                <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Sort by Latest / Rated / Popular</li>
              </ul>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="animate-fade-in-up delay-500 group relative bg-gray-950 rounded-2xl border border-gray-800 p-7 hover:border-orange-500/40 transition-all hover:-translate-y-1 md:col-span-1 lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col lg:flex-row lg:items-start lg:gap-8">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Rating & Review System</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Rate resources 1&ndash;5 stars and write detailed text reviews. One review per user (editable). Average rating displayed on all resource cards.
                </p>
              </div>
              <div className="mt-5 lg:mt-0 flex-shrink-0">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className={`w-6 h-6 ${star <= 4 ? 'text-orange-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-bold text-white">4.0</span>
                  <span className="text-xs text-gray-500 ml-1">(24 reviews)</span>
                </div>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />One Review Per User</li>
                  <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Editable Reviews</li>
                  <li className="flex items-center gap-2 text-xs text-gray-500"><span className="w-1 h-1 rounded-full bg-orange-500" />Rating Summary on Cards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-10 bg-gray-950/50 border-y border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Simple & Intuitive</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="animate-fade-in-up delay-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-orange-500/20">
                <span className="text-2xl font-extrabold text-white">1</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Register & Set Up Profile</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Create an account with your college details &mdash; name, institution, branch, semester, and year.
              </p>
            </div>

            {/* Step 2 */}
            <div className="animate-fade-in-up delay-300 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-orange-500/20">
                <span className="text-2xl font-extrabold text-white">2</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Upload & Share Resources</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Upload notes, papers, or any academic material. Add details, tags, and choose public or private access.
              </p>
            </div>

            {/* Step 3 */}
            <div className="animate-fade-in-up delay-500 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-orange-500/20">
                <span className="text-2xl font-extrabold text-white">3</span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">Discover, Download & Review</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Search and filter resources. Download what you need and leave ratings to help the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SUPPORTED FILE TYPES ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Multi-Format Support</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Upload Any Academic File</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {[
            { ext: "PDF", color: "from-red-500/20 to-red-600/10", text: "text-red-400" },
            { ext: "DOCX", color: "from-blue-500/20 to-blue-600/10", text: "text-blue-400" },
            { ext: "PPT", color: "from-orange-500/20 to-orange-600/10", text: "text-orange-400" },
            { ext: "XLS", color: "from-green-500/20 to-green-600/10", text: "text-green-400" },
            { ext: "IMG", color: "from-purple-500/20 to-purple-600/10", text: "text-purple-400" },
            { ext: "TXT", color: "from-gray-500/20 to-gray-600/10", text: "text-gray-400" },
          ].map((ft, i) => (
            <div key={i} className={`animate-scale-in delay-${(i + 1) * 100} rounded-xl bg-gradient-to-br ${ft.color} border border-gray-800 p-5 text-center hover:scale-105 transition-transform`}>
              <p className={`text-lg font-extrabold ${ft.text}`}>{ft.ext}</p>
              <p className="text-[10px] text-gray-500 mt-1 uppercase">Supported</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ACCESS CONTROL EXPLAINER ===== */}
      <section className="relative z-10 bg-gray-950/50 border-y border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3">Privacy First</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Your Resources, Your Rules</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Public */}
            <div className="animate-slide-in-left delay-200 rounded-2xl bg-gray-900 border border-gray-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Public Access</h3>
                    <p className="text-xs text-green-400 font-semibold">Open to All Colleges</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Resources marked Public are accessible to every registered user from any college or institution. Share knowledge across campuses.
                </p>
              </div>
            </div>

            {/* Private */}
            <div className="animate-slide-in-right delay-200 rounded-2xl bg-gray-900 border border-gray-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Private Access</h3>
                    <p className="text-xs text-orange-400 font-semibold">Same College Only</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Private resources are restricted to users who registered with the same college. The system automatically verifies college match before granting access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="animate-fade-in-up relative rounded-3xl bg-gradient-to-br from-orange-500/10 via-gray-900 to-gray-950 border border-orange-500/20 p-12 sm:p-16 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-500/10 rounded-full blur-[80px] animate-pulse-glow" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to Share Knowledge?
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 text-base">
              Join CASPR and start sharing academic resources with your campus community today. It&apos;s free, fast, and built for students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 text-base font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 text-base font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Already have an account? Sign In &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-gray-800/50 bg-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="text-sm font-bold text-white">CASPR</span>
              <span className="text-xs text-gray-600 ml-2">Campus Academic Resource Sharing Platform</span>
            </div>
            <p className="text-xs text-gray-600">
              Built for Neural Breach &mdash; Yugastr 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
