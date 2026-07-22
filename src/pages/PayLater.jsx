import React from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
export default function PayLater() {
  const applicationUrl = "https://forms.gle/nN3H2U91PtZm3q2u7";
  // Placeholder banner image - replace with your actual KFTV image URL
  const heroImageUrl = "/new2.png";

  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    { q: 'Do I need to pay tuition before starting?', a: 'Eligible students admitted under the Study Now, Pay Later Program may begin their studies without upfront tuition fees.' },
    { q: 'Can anyone apply?', a: 'Yes, anyone interested may apply. Admission is subject to eligibility criteria and Rwandan citizenship.' },
    { q: 'When will I begin paying?', a: 'Repayment begins after securing employment, according to agreed program terms.' },
    { q: 'Is practical training included?', a: 'Yes! Every program emphasizes hands-on practical training using professional equipment.' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans lg:p-3  lg:p-1">
         <div className='hidden lg:flex'>
          <section 
          className="relative bg-slate-400 bg-cover bg-center text-white min-h-[500px] flex items-center"
          style={{ backgroundImage: `url('${heroImageUrl}')` }}
        >
          {/* Dark Overlay for readability */}
          <div className="hidden lg:flex absolute inset-0 bg-gradient-to-l from-gray-950/90 toblack-950/90 backdrop-blur-[0px]"></div>

          {/* Hero Content Container */}
          <div className="relative hidden lg:flex z-10 w-full p-6 sm:p-10 lg:p-5 flex gap-8 items-center">


            {/* Hero right Content */}
            <div className='lg:w-2/5'></div>
            <div className="lg:w-4/5 lg:col-span-5  space-y-4">
             
              <h1 className="text-3xl  lg:flex sm:text-5xl font-extrabold tracking-tight leading-tight">
                Your Talent Can't Wait. Neither Should Your Education.
              </h1>
              <p className="text-xl lg:flex sm:text-2xl font-medium text-indigo-200 leading-snug">
               At Kigali Film and Television School (KFTV),
                we believe that financial challenges should never prevent talented individuals 
                from building a successful future .flexible financing allows eligible students
                 to begin their education immediately and pay their tuition after securing employment.
              </p>
              <p className="text-sm text-center sm:text-base text-slate-300 max-w-2xl leading-relaxed pt-2">
                Your future starts today—not when you can afford it.
              </p>
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-1/3 ml-30 inline-flex items-center justify-center gap-2 bg-white hover:bg-grey text-[#ff0000] font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 text-center"
                >
                  <span>Complete Application Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
            </div>

          

          </div>
        </section>
        </div>
        <div className='hidden lg:flex'>
          
        </div>
        
         <div className=' lg:hidden '>
           <img src="/new2.png" alt=" study now apply later" srcset="" />
        </div>
      <div className="max-w-7xl mx-auto mt-10 bg-white  shadow-xl overflow-hidden border border-slate-200">
      
        {/* ================= LOWER SECTION CONTENT ================= */}
        
        <div className="p-6  sm:p-10 lg:p-12 space-y-12 bg-slate-50">
          
            <div className="lg:hidden lg:w-4/5 lg:col-span-5  space-y-4">
             
              <h1 className="text-3xl  lg:flex sm:text-5xl font-extrabold tracking-tight leading-tight">
                Your Talent Can't Wait. Neither Should Your Education.
              </h1>
              <p className="text-xl lg:flex sm:text-2xl font-medium text-slate-700 leading-snug">
               At Kigali Film and Television School (KFTV),
                we believe that financial challenges should never prevent talented individuals 
                from building a successful future .flexible financing allows eligible students
                 to begin their education immediately and pay their tuition after securing employment.
              </p>
              <p className="text-sm text-center sm:text-base text-slate-500 max-w-2xl leading-relaxed pt-2">
                Your future starts today—not when you can afford it.
              </p>
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-1/2 ml-30 inline-flex items-center justify-center gap-2 bg-white hover:bg-grey text-[#ff0000] font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 text-center"
                >
                  <span>Complete Application Now</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
            </div>
          {/* Overview Section 
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Begin Your Career at Kigali Film and Television School Today — Pay Your Tuition After You Secure a Job.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed">
              <p>
                For many talented young people, the biggest obstacle to pursuing their dream career is not passion or ability—it's the cost of education. At Kigali Film and Television School (KFTV), we believe that financial challenges should never prevent talented individuals from building a successful future.
              </p>
              <p>
                That is why we have introduced the <strong>Study Now, Pay Later Program</strong>—a flexible financing initiative that allows eligible students to begin their education immediately and pay their tuition after securing employment. Whether you are a recent secondary school graduate, university graduate, working professional, or career changer, this program is designed for you.
              </p>
            </div>
            <p className="text-indigo-700 font-bold text-base pt-2">
              Your future starts today—not when you can afford it.
            </p>
          </section>*/}

          {/* 3 Column Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Why Choose
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Why Choose the Program?</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-4 uppercase tracking-wider">Learn Today. Pay After Employment.</p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Start studies immediately</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Industry-focused practical training</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Build professional portfolio</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Graduate career-ready</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold">✓</span> Pay tuition post-employment</li>
                </ul>
              </div>
            </div> */}

            {/* Card 2: Why KFTV 
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Why Study at KFTV?</h3>
                <p className="text-xs font-semibold text-indigo-600 mb-4 uppercase tracking-wider">Bridge Education & Industry</p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold">•</span> Project-based learning</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold">•</span> Experienced industry instructors</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold">•</span> Modern studios & equipment</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold">•</span> Mentorship & networking</li>
                  <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold">•</span> Entrepreneurship support</li>
                </ul>
              </div>
            </div>*/}

            {/* Card 3: Who Can Apply */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 hidden h-10 rounded-xl bg-indigo-50 text-[#ff0000] font-bold flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Who Can Apply?</h3>
                <p className="text-xs font-semibold text-[#ff0000] mb-4 uppercase tracking-wider">Open Eligibility</p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-900 mb-4">
                  <li>• Secondary & University graduates</li>
                  <li>• Young professionals & Career changers</li>
                  <li>• Aspiring entrepreneurs</li>
                  <li>• Financially constrained talent</li>
                </ul>
                <div className="p-3 shadow shadow-[#ff0000] rounded-xl text-xs text-slate-900  font-medium">
                  <strong>Note:</strong> Only Rwandan nationals can access this program. International students refer to standard forms.
                </div>
              </div>
            </div>

          </div>

          {/* How to Apply Section */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">How to Apply</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: 'Step 1', title: 'Complete Form', desc: 'Fill out the online application form.' },
                { step: 'Step 2', title: 'Select Program', desc: 'Choose the program you wish to study.' },
                { step: 'Step 3', title: 'Submit Documents', desc: 'Attach required supporting documents.' },
                { step: 'Step 4', title: 'Admissions Review', desc: 'Shortlisted candidates will be contacted.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-indigo-600 uppercase">{item.step}</span>
                  <h4 className="font-bold text-slate-900 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Frequently Asked Questions */}
<section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
      <div className="divide-y divide-slate-100">
        {faqs.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-3 py-4 text-left"
              >
                <span className="font-semibold text-slate-900 text-sm">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <p className="text-xs text-slate-600 pb-4">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>

          {/* Footer Callout Banner */}
          <section className="bg-black  text-white p-6 sm:p-8 rounded-2xl text-center space-y-3">
            <h3 className="text-xl font-bold">Invest in Your Future Today</h3>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-3xl mx-auto">
              Whether your ambition is to become a filmmaker, software developer, actor, photographer, animator, music producer, digital marketer, or creative entrepreneur, KFTV is ready to help you build the future you deserve.
            </p>
            <p className="text-xs font-mono text-indigo-300 pt-2 tracking-widest uppercase">
              Study Today • Build Your Skills • Launch Your Career • Pay Later
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}