
import { useState } from 'react'
import {
  Menu, X, ArrowRight, GraduationCap, Laptop,
  Network, Code2, Wrench, Award, CheckCircle2, 
  Mail, Phone, MapPin, ChevronRight
} from 'lucide-react'

const programs = [
  {
    icon: Network,
    title: 'Réseaux informatiques',
    description: 'Installation, configuration, administration et sécurisation des réseaux.'
  },
  {
    icon: Code2,
    title: 'Programmation',
    description: 'Algorithmique, développement web, bases de données et applications.'
  },
  {
    icon: Wrench,
    title: 'Maintenance informatique',
    description: 'Diagnostic, réparation et entretien des équipements informatiques.'
  },
  {
    icon: Laptop,
    title: 'Systèmes informatiques',
    description: 'Installation et administration des systèmes Windows et Linux.'
  }
]

const semesters = [
  {
    number: '01',
    title: 'Première année – Fondamentaux',
    description: 'Acquisition des bases théoriques et pratiques de l’informatique.'
  },
  {
    number: '02',
    title: 'Deuxième année – Spécialisation',
    description: 'Approfondissement des compétences et réalisation de projets techniques.'
  }
]

function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    ['Accueil', '#accueil'],
    ['Notre institut', '#institut'],
    ['Formations', '#formations'],
    ['Parcours académique', '#parcours'],
    ['Admissions', '#admission'],
    ['Contact', '#contact']
  ]

  return (
    <header className="navbar">
      <a href="#accueil" className="brand">
        <span className="brand-symbol">I</span>
        <span>
          <strong>INTELA</strong>
          <small>Centre de Formation Profesionnel</small>
        </span>
      </a>

      <nav id="navigation-principale"className={open ? 'nav-links active' : 'nav-links'}>
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a className="nav-cta" href="#admission" onClick={() => setOpen(false)}>
          Nous rejoindre <ArrowRight size={16} />
        </a>
      </nav>

      <button className="menu-toggle"onClick={() => setOpen(!open)}aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}aria-expanded={open}
          aria-controls="navigation-principale"
>
  {open ? <X /> : <Menu />}
</button>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="accueil">
      <div className="hero-content">
        <span className="eyebrow">INSTITUT TECHNOLOGIQUE DE L'ARTIBONITE</span>
        <h1>
          Le savoir-faire technologique au service de <span>votre avenir.</span>
        </h1>
        <p>
          Développez vos compétences, maîtrisez les technologies et
          préparez votre avenir professionnel avec INTELA.
        </p>
        <div className="hero-actions">
          <a href="#formations" className="button-primary">
            Découvrir nos formations <ArrowRight size={18} />
          </a>
          <a href="#institut" className="button-outline">
            Découvrir INTELA
          </a>
        </div>
        <div className="hero-note">
          <CheckCircle2 size={18} />
          <span>Une formation structurée sur deux années</span>
        </div>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000"
          alt="Étudiant travaillant sur un projet technologique"
        />
        <div className="hero-card">
          <GraduationCap size={27} />
          <div>
            <strong>2 années</strong>
            <small>de formation professionnelle</small>
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section about" id="institut">
      <div className="section-heading">
        <span className="eyebrow">QUI SOMMES-NOUS ?</span>
        <h2>Former les talents de <span>demain.</span></h2>
      </div>

      <div className="about-grid">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000"
            alt="Étudiants travaillant ensemble"
          />
        </div>

        <div className="about-content">
          <h3>Bienvenue à INTELA</h3>
          <p>
            L'Institut Technologique de l'Artibonite est un établissement
            dédié à la formation technique et professionnelle dans le
            domaine des technologies de l'information.
          </p>
          <p>
            Notre ambition est de rendre une formation technologique
            de qualité accessible aux jeunes et aux professionnels
            de l'Artibonite, tout en développant leur capacité à
            entreprendre et à innover.
          </p>

          <div className="values">
            <div><CheckCircle2 /> Formation pratique</div>
            <div><CheckCircle2 /> Innovation technologique</div>
            <div><CheckCircle2 /> Accompagnement professionnel</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Programs() {
  return (
    <section className="section programs" id="formations">
      <div className="section-heading centered">
        <span className="eyebrow">NOTRE OFFRE DE FORMATION</span>
        <h2>Construisez vos compétences <span>en informatique.</span></h2>
        <p>
          Un programme multidisciplinaire pour maîtriser les principaux
          domaines de l'informatique.
        </p>
      </div>

      <div className="program-grid">
        {programs.map((program) => {
          const Icon = program.icon
          return (
            <article className="program-card" key={program.title}>
              <div className="program-icon"><Icon size={27} /></div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <a href="#parcours">En savoir plus <ArrowRight size={15} /></a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function AcademicPath() {
  return (
    <section className="section academic" id="parcours">
      <div className="academic-intro">
        <span className="eyebrow">VOTRE PARCOURS ACADÉMIQUE</span>
        <h2>Deux années pour construire votre avenir.</h2>
        <p>
          Une formation organisée en quatre semestres,
          combinant apprentissage théorique, pratique et projets.
        </p>
        <div className="academic-stats">
          <div><strong>02</strong><span>Années</span></div>
          <div><strong>04</strong><span>Semestres</span></div>
          <div><strong>01</strong><span>Diplôme INTELA</span></div>
        </div>
      </div>

      <div className="semester-list">
        {semesters.map((semester) => (
          <div className="semester" key={semester.number}>
            <span>{semester.number}</span>
            <div>
              <h3>{semester.title}</h3>
              <p>{semester.description}</p>
            </div>
            <ChevronRight />
          </div>
        ))}
        <div className="semester-note">
          Le cursus comprend quatre semestres répartis sur deux années.
          Le détail des matières et des unités d'enseignement sera
          communiqué dans le programme pédagogique officiel.
        </div>
      </div>
    </section>
  )
}

function Equivalence() {
  return (
    <section className="section equivalence">
      <div className="equivalence-icon"><Award size={35} /></div>
      <div>
        <span className="eyebrow">OUVERTURE ACADÉMIQUE</span>
        <h2>Et après votre diplôme INTELA ?</h2>
        <p>
          À la fin des deux années de formation, les étudiants qui
          satisfont aux exigences du programme reçoivent un diplôme
          délivré par INTELA.
        </p>
        <p>
          INTELA ambitionne de développer des partenariats avec des
          universités de Port-au-Prince afin de favoriser la reconnaissance
          des acquis et les possibilités de poursuite d'études supérieures.
        </p>
        <div className="equivalence-info">
          <strong>Comprendre l'équivalence universitaire</strong>
          <p>
            Une université peut examiner les cours suivis, les contenus
            pédagogiques, les résultats et les crédits d'un étudiant
            pour déterminer si certains acquis peuvent être reconnus
            dans son propre programme.
          </p>
          <small>
            La reconnaissance n'est pas automatique. Elle dépend des
            décisions et des critères de chaque université.
          </small>
        </div>
      </div>
    </section>
  )
}


function Admissions() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    message: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const subject = encodeURIComponent('Demande de préinscription - INTELA')
    const body = encodeURIComponent(`
DEMANDE DE PRÉINSCRIPTION - INTELA

Nom complet : ${form.name}
E-mail : ${form.email}
Téléphone : ${form.phone}
Niveau d'études : ${form.education}

Motivation :
${form.message}
    `)

    window.location.href =
      `mailto:intela.info00@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section className="admissions section" id="admission">
      <div className="container">
        <div className="admission-heading">
          <span className="eyebrow">Admissions INTELA</span>
          <h2>Construisez votre avenir dans la technologie.</h2>
          <p>
            Faites le premier pas vers une formation professionnelle
            en informatique au sein de l'Institut Technologique de l'Artibonite.
          </p>
        </div>

        <div className="admission-steps">
          <div className="admission-step">
            <span>01</span>
            <div>
              <h3>Préinscription</h3>
              <p>Remplissez le formulaire avec vos informations.</p>
            </div>
          </div>

          <div className="admission-step">
            <span>02</span>
            <div>
              <h3>Étude de la demande</h3>
              <p>Notre administration prendra connaissance de votre demande.</p>
            </div>
          </div>

          <div className="admission-step">
            <span>03</span>
            <div>
              <h3>Prise de contact</h3>
              <p>Vous serez contacté pour connaître les prochaines modalités.</p>
            </div>
          </div>
        </div>

        <div className="admission-layout">
          <div className="admission-information">
            <span className="eyebrow">Rejoignez-nous</span>
            <h3>Votre parcours commence par une candidature.</h3>
            <p>
              INTELA vous accompagne dans le développement de compétences
              techniques et professionnelles adaptées aux réalités du monde
              numérique.
            </p>

            <div className="admission-info-item">
              <span className="info-number">01</span>
              <div>
                <strong>Une formation spécialisée</strong>
                <p>Un parcours axé sur les métiers de l'informatique.</p>
              </div>
            </div>

            <div className="admission-info-item">
              <span className="info-number">02</span>
              <div>
                <strong>Un parcours professionnel</strong>
                <p>Des compétences pour évoluer dans le secteur technologique.</p>
              </div>
            </div>

            <div className="admission-notice">
              <strong>À savoir</strong>
              <p>
                L'envoi de ce formulaire constitue une demande de
                préinscription et ne garantit pas une admission définitive.
                Les conditions et pièces à fournir seront communiquées
                par l'administration.
              </p>
            </div>
          </div>

          <form className="admission-form" onSubmit={handleSubmit}>
            <div className="form-card-heading">
              <span>FORMULAIRE DE CANDIDATURE</span>
              <h3>Vos informations</h3>
              <p>Les champs marqués d'un astérisque sont obligatoires.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex. : Marie Jean"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Adresse e-mail *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="exemple@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Dernier niveau d'études *</label>
                <select
                  id="education"
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choisir un niveau</option>
                  <option value="Secondaire en cours">Secondaire en cours</option>
                  <option value="Baccalauréat">Baccalauréat</option>
                  <option value="Études universitaires">Études universitaires</option>
                  <option value="Formation professionnelle">Formation professionnelle</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Pourquoi souhaitez-vous intégrer INTELA ?</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                placeholder="Présentez brièvement votre motivation..."
              />
            </div>

            <button className="btn btn-primary form-submit" type="submit">
              Soumettre ma préinscription <ArrowRight size={18} />
            </button>

            <p className="form-note">
              Vos informations seront transmises à l'administration d'INTELA.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact">
      <div className="footer-grid">
        <div>
          <a href="#accueil" className="brand footer-brand">
            <span className="brand-symbol">I</span>
            <span>
              <strong>INTELA</strong>
              <small>INSTITUT TECHNOLOGIQUE</small>
            </span>
          </a>
          <p>
            Former aujourd'hui les talents technologiques
            de demain.
          </p>
        </div>

        <div>
          <h3>Navigation</h3>
          <a href="#institut">Notre institut</a>
          <a href="#formations">Formations</a>
          <a href="#parcours">Parcours académique</a>
          <a href="#admission">Admissions</a>
        </div>

        <div>
          <h3>Nous contacter</h3>
          <p><MapPin size={16} /> Saint-Marc, Artibonite, Haïti</p>
          <p><Phone size={16} /> 3401-3628</p>
          <p><Mail size={16} /> intela.info00@gmail.com</p>
        </div>
      </div>

      <div className="copyright">
        © {new Date().getFullYear()} INTELA – Institut Technologique de
        l'Artibonite. Tous droits réservés.
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programs />
        <AcademicPath />
        <Equivalence />
        <Admissions />
      </main>
      <Footer />
    </>
  )
}
