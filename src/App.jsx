
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

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

const ROLES_AUTORISES = [
  'directeur',
  'secretaire',
  'responsable_pedagogique'
]

async function chargerSessionAdministrative(user) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, active')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  if (!profile?.active) {
    throw new Error('Ce compte administratif est désactivé.')
  }

  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || !ROLES_AUTORISES.includes(roleData?.role)) {
    throw new Error('Aucun rôle administratif valide n’est attribué à ce compte.')
  }

  return {
    user,
    profile,
    role: roleData.role
  }
}

function Navbar({ onAdminClick }) {
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
          <small>Institut Technologique de l'Artibonite</small>
        </span>
      </a>

      <nav
        id="navigation-principale"
        className={open ? 'nav-links active' : 'nav-links'}
      >
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}

        <a
          href="#espace-administratif"
          onClick={(e) => {
            e.preventDefault()
            setOpen(false)
            onAdminClick()
          }}
        >
          Espace administratif
        </a>

        <a
          className="nav-cta"
          href="#admission"
          onClick={() => setOpen(false)}
        >
          Nous rejoindre <ArrowRight size={16} />
        </a>
      </nav>

      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
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
        <span className="eyebrow">
          INSTITUT TECHNOLOGIQUE DE L'ARTIBONITE
        </span>

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

        <h2>
          Construisez vos compétences <span>en informatique.</span>
        </h2>

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
              <div className="program-icon">
                <Icon size={27} />
              </div>

              <h3>{program.title}</h3>
              <p>{program.description}</p>

              <a href="#parcours">
                En savoir plus <ArrowRight size={15} />
              </a>
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
      <div className="equivalence-icon">
        <Award size={35} />
      </div>

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
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    commune: '',
    niveau_etudes: '',
    motivation: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('preinscriptions')
        .insert([{
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
          commune: form.commune.trim() || null,
          niveau_etudes: form.niveau_etudes,
          motivation: form.motivation.trim() || null
        }])

      if (error) throw error

      setSuccess(true)
      setMessage(
        'Votre demande a bien été enregistrée. L’administration d’INTELA vous contactera.'
      )

      setForm({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        commune: '',
        niveau_etudes: '',
        motivation: ''
      })
    } catch (error) {
      console.error('Erreur préinscription :', error)
      setMessage(
        `Erreur Supabase : ${error.message || 'Erreur inconnue'}`
      )
    } finally {
      setLoading(false)
    }
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
                <label htmlFor="prenom">Prénom *</label>
                <input
                  id="prenom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nom">Nom *</label>
                <input
                  id="nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Votre nom"
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
                  required
                  maxLength={255}
                  placeholder="exemple@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">Téléphone *</label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={form.telephone}
                  onChange={handleChange}
                  required
                  maxLength={30}
                  placeholder="Votre numéro"
                />
              </div>

              <div className="form-group">
                <label htmlFor="commune">Commune</label>
                <input
                  id="commune"
                  name="commune"
                  value={form.commune}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="Ex. : Saint-Marc"
                />
              </div>

              <div className="form-group">
                <label htmlFor="niveau_etudes">Dernier niveau d'études *</label>
                <select
                  id="niveau_etudes"
                  name="niveau_etudes"
                  value={form.niveau_etudes}
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
              <label htmlFor="motivation">
                Pourquoi souhaitez-vous intégrer INTELA ?
              </label>
              <textarea
                id="motivation"
                name="motivation"
                rows="4"
                value={form.motivation}
                onChange={handleChange}
                placeholder="Présentez brièvement votre motivation..."
              />
            </div>

            {message && (
              <div
                role="status"
                style={{
                  padding: 14,
                  marginTop: 15,
                  borderRadius: 6,
                  background: success ? '#e8f7ed' : '#fff0f0',
                  color: success ? '#176b35' : '#a52a2a',
                  fontSize: 13,
                  lineHeight: 1.6
                }}
              >
                {message}
              </div>
            )}

            <button
              className="btn btn-primary form-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Enregistrement en cours...'
                : 'Soumettre ma préinscription'}
              {!loading && <ArrowRight size={18} />}
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

function Footer({ onAdminClick }) {
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
          <button
            type="button"
            onClick={onAdminClick}
            style={{
              display: 'block',
              padding: 0,
              marginTop: 8,
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Espace administratif
          </button>
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
  const [adminOpen, setAdminOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    let actif = true

    async function verifierSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (!data.session) return

        const sessionChargee = await chargerSessionAdministrative(
          data.session.user
        )

        if (actif) {
          setSession(sessionChargee)
          setAdminOpen(true)
        }
      } catch (error) {
        console.error('Vérification de session :', error)
        await supabase.auth.signOut()
      } finally {
        if (actif) setSessionLoading(false)
      }
    }

    verifierSession()

    return () => {
      actif = false
    }
  }, [])

  async function handleLogin(loginData) {
    try {
      const sessionValidee = await chargerSessionAdministrative(
        loginData.user
      )
      setSession(sessionValidee)
      setAdminOpen(true)
    } catch (error) {
      await supabase.auth.signOut()
      throw error
    }
  }

  function handleLogout() {
    setSession(null)
    setAdminOpen(false)
  }

  if (sessionLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F5F0EB',
          color: '#172A46',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        Chargement...
      </div>
    )
  }

  if (session) {
    return (
      <AdminDashboard
        session={session}
        onLogout={handleLogout}
      />
    )
  }

  if (adminOpen) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        onBack={() => setAdminOpen(false)}
      />
    )
  }

  return (
    <>
      <Navbar onAdminClick={() => setAdminOpen(true)} />

      <main>
        <Hero />
        <About />
        <Programs />
        <AcademicPath />
        <Equivalence />
        <Admissions />
      </main>

      <Footer onAdminClick={() => setAdminOpen(true)} />
    </>
  )
}
