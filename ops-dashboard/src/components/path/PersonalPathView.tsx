import { ArrowRight, Star } from 'lucide-react'

const skills = {
  technical: [
    { name: 'Python', desc: 'ML, data analysis, automation, APIs' },
    { name: 'AI & Machine Learning', desc: 'NLP, computer vision, TensorFlow, OpenAI API' },
    { name: 'Data Science & Analytics', desc: 'Power BI, Tableau, predictive modeling' },
    { name: 'Cloud Computing', desc: 'AWS, Google Cloud, Microsoft Azure' },
    { name: 'Blockchain & Web3', desc: 'Smart contracts, Solidity, DeFi, dApps' },
  ],
  business: [
    { name: 'Financial Modelling', desc: 'DCF, LBO, valuation, projections' },
    { name: 'Investing Strategies', desc: 'Portfolio management, private equity, REITs' },
    { name: 'Sales & Negotiation', desc: 'Psychology of selling, closing deals' },
    { name: 'Digital Marketing', desc: 'TikTok/Facebook ads, SEO, email marketing' },
    { name: 'Project Management', desc: 'Agile, Scrum, Kanban, Jira' },
  ],
  personal: [
    { name: 'Productivity', desc: 'GTD, time-blocking, prioritisation' },
    { name: 'Languages', desc: 'Spanish, Chinese, or French proficiency' },
    { name: 'Communication', desc: 'Articulation, persuasion, leadership' },
  ],
  future: [
    { name: 'Quantum Computing', desc: 'Encryption, logistics, problem-solving' },
    { name: 'Green Technology & ESG', desc: 'Carbon accounting, clean energy, circular economy' },
    { name: 'Web 3.0', desc: "CBDCs, DeFi, tokenisation of real-world assets" },
    { name: 'Space Economy', desc: 'Satellite technology, space infrastructure' },
    { name: 'Creator Economy', desc: 'AI content creation, micro communities' },
  ],
}

const roadmap = [
  {
    phase: 'Bachelors Phase',
    color: 'border-blue-500/40 bg-blue-500/5',
    accent: 'text-blue-400',
    items: [
      'Get into CCL / CLIP / Economics Club',
      'Make €2k/month, save 60%',
      'Vienna exchange in final year',
      'Internship at UBS',
    ],
  },
  {
    phase: 'Finance Career',
    color: 'border-green-500/40 bg-green-500/5',
    accent: 'text-green-400',
    items: [
      'Private Banking (Portugal, USA, Switzerland)',
      '3 years maximum',
      'Be a killer on the job',
    ],
  },
  {
    phase: 'MBA Abroad',
    color: 'border-yellow-500/40 bg-yellow-500/5',
    accent: 'text-yellow-400',
    items: [
      'USA: Wharton, Harvard, Stanford, Columbia',
      'Europe: LBS, HEC Paris, IESE, SDA Bocconi',
      'Asia: NUS, HKU as alternatives',
    ],
  },
  {
    phase: 'High Finance',
    color: 'border-orange-500/40 bg-orange-500/5',
    accent: 'text-orange-400',
    items: [
      'Investment Banking',
      'Private Equity',
      'Consulting',
      'Oil & Gas major',
    ],
  },
  {
    phase: 'Maximus Investments',
    color: 'border-purple-500/40 bg-purple-500/5',
    accent: 'text-purple-400',
    items: [
      'Found holding company',
      'Investing + AI Automation focus',
      'Grow to 7 figures, build network',
      'Scale to $42B by 2042',
    ],
  },
]

const skillSections = [
  { title: 'Technical Skills', key: 'technical' as const, color: 'text-blue-400' },
  { title: 'Business Skills', key: 'business' as const, color: 'text-green-400' },
  { title: 'Personal Skills', key: 'personal' as const, color: 'text-purple-400' },
  { title: 'Future Trends', key: 'future' as const, color: 'text-yellow-400' },
]

export default function PersonalPathView() {
  return (
    <div className="space-y-10">
      {/* Ultimate Goal */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Star size={16} className="text-yellow-400" />
          <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Ultimate Goal</span>
        </div>
        <h2 className="text-3xl font-bold text-[#f0f0f0] mb-1">Billionaire — $42B</h2>
        <p className="text-[#6b7280]">Maximus Investments · Target year 2042</p>
      </div>

      {/* Long View Roadmap */}
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Long View Roadmap</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {roadmap.map((stage, i) => (
            <div key={i} className="flex items-start gap-3 flex-shrink-0">
              <div className={`border rounded-xl p-4 w-52 ${stage.color}`}>
                <p className={`text-xs font-semibold mb-3 ${stage.accent}`}>{stage.phase}</p>
                <ul className="space-y-1.5">
                  {stage.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-[#9ca3af]">
                      <span className="mt-0.5 flex-shrink-0 text-[#374151]">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {i < roadmap.length - 1 && (
                <ArrowRight size={14} className="text-[#374151] mt-6 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-base font-semibold text-[#f0f0f0] mb-4">Skills to Develop</h2>
        <div className="grid grid-cols-2 gap-4">
          {skillSections.map(section => (
            <div key={section.key} className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5">
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 ${section.color}`}>
                {section.title}
              </h3>
              <div className="space-y-3">
                {skills[section.key].map((skill, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[#d1d5db]">{skill.name}</span>
                    <span className="text-xs text-[#4b5563]">{skill.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
