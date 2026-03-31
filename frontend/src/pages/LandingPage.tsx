import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className='w-full'>
      <section className='py-14'>
        <div className='grid items-center gap-10 md:grid-cols-2'>
          <div>
            <h1 className='text-4xl font-bold leading-tight md:text-5xl'>
              Register for events in minutes.
            </h1>
            <p className='mt-4 text-lg text-slate-600'>
              Manage attendees, keep details organized, and make event discovery effortless.
            </p>

            <div className='mt-7 flex flex-wrap gap-3'>
              <Link
                to='/register'
                className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700'
              >
                Get Started
              </Link>
              <a
                href='#how-it-works'
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-white'
              >
                How it works
              </a>
            </div>

            <dl className='mt-10 grid grid-cols-3 gap-4'>
              <div className='rounded-xl border border-slate-200 p-4'>
                <dt className='text-sm font-medium text-slate-600'>Events</dt>
                <dd className='mt-1 text-2xl font-bold'>50+</dd>
              </div>
              <div className='rounded-xl border border-slate-200 p-4'>
                <dt className='text-sm font-medium text-slate-600'>Attendees</dt>
                <dd className='mt-1 text-2xl font-bold'>1K+</dd>
              </div>
              <div className='rounded-xl border border-slate-200 p-4'>
                <dt className='text-sm font-medium text-slate-600'>Setup</dt>
                <dd className='mt-1 text-2xl font-bold'>Fast</dd>
              </div>
            </dl>
          </div>

          <div className='relative'>
            <div className='absolute -inset-6 -z-10 rounded-[2rem] bg-violet-50 blur-2xl' />
            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm font-semibold text-slate-600'>Today&apos;s Quick View</div>
                  <div className='mt-1 text-2xl font-bold'>Upcoming Events</div>
                </div>
                <div className='rounded-xl bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-600'>
                  Live
                </div>
              </div>

              <div className='mt-5 space-y-3'>
                {[
                  { name: 'Tech Meetup', time: '7:00 PM', seats: '24 seats left' },
                  { name: 'Community Workshop', time: '5:30 PM', seats: '12 seats left' },
                  { name: 'Startup Pitch Night', time: '8:15 PM', seats: '9 seats left' }
                ].map((e) => (
                  <div
                    key={e.name}
                    className='flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4'
                  >
                    <div>
                      <div className='font-semibold'>{e.name}</div>
                      <div className='mt-1 text-sm text-slate-600'>Starts at {e.time}</div>
                    </div>
                    <div className='text-sm font-semibold text-slate-900'>{e.seats}</div>
                  </div>
                ))}
              </div>

              <div className='mt-6 flex items-center justify-between rounded-xl bg-white px-4 py-3'>
                <div className='text-sm font-medium text-slate-600'>
                  Want to attend an event?
                </div>
                <Link
                  to='/register'
                  className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700'
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='how-it-works' className='py-10'>
        <h2 className='text-3xl font-bold'>How it works</h2>
        <p className='mt-2 text-slate-600'>
          A simple flow for organizers and attendees.
        </p>

        <div className='mt-8 grid gap-5 md:grid-cols-3'>
          {[
            {
              title: 'Sign up',
              desc: 'Create your account and set your profile preferences.'
            },
            {
              title: 'Pick an event',
              desc: 'Browse upcoming events and view seat availability.'
            },
            {
              title: 'Confirm your place',
              desc: 'Register and get instant confirmation details.'
            }
          ].map((step, idx) => (
            <div
              key={step.title}
              className='rounded-2xl border border-slate-200 bg-slate-50 p-6'
            >
              <div className='text-sm font-semibold text-violet-600'>Step {idx + 1}</div>
              <div className='mt-2 text-xl font-bold'>{step.title}</div>
              <p className='mt-2 text-slate-600'>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='py-10'>
        <h2 className='text-3xl font-bold'>Featured events</h2>
        <p className='mt-2 text-slate-600'>A few examples of what you can register for.</p>

        <div className='mt-8 grid gap-5 md:grid-cols-2'>
          {[
            {
              title: 'Campus Career Fair',
              meta: 'Networking + hiring',
              tag: 'Popular'
            },
            { title: 'Design Systems Day', meta: 'Hands-on sessions', tag: 'New' },
            { title: 'AI for Everyone', meta: 'Beginner-friendly', tag: 'Trending' },
            { title: 'Community Cleanup', meta: 'Join your neighborhood', tag: 'Volunteer' }
          ].map((event) => (
            <div key={event.title} className='rounded-2xl border border-slate-200 bg-slate-50 p-6'>
              <div className='flex items-center justify-between gap-3'>
                <div className='text-sm font-semibold text-violet-600'>{event.tag}</div>
                <div className='rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600'>
                  Open
                </div>
              </div>
              <div className='mt-3 text-xl font-bold'>{event.title}</div>
              <p className='mt-2 text-slate-600'>{event.meta}</p>
              <div className='mt-5'>
                <Link
                  to='/register'
                  className='inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white'
                >
                  Register interest
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='py-10'>
        <div className='rounded-3xl border border-slate-200 bg-gradient-to-b from-indigo-50 to-white p-8 md:p-10'>
          <h2 className='text-3xl font-bold'>Ready to register?</h2>
          <p className='mt-2 text-slate-600'>
            Create an account and start registering for events today.
          </p>
          <div className='mt-7 flex flex-wrap gap-3'>
            <Link
              to='/register'
              className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700'
            >
              Create Account
            </Link>
            <Link
              to='/login'
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-white'
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage

