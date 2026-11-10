
import GestionPersonnel from './GestionPersonnel'
import Notes from './Notes'
import GestionAcademique from './GestionAcademique'
import Etudiants from './Etudiants'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import {
  LogOut,
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  Search,
  ArrowLeft,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  X,
  CheckCircle,
  Clock,
  UserCheck
} from 'lucide-react'

const STATUTS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'acceptee', label: 'Acceptée' },
  { value: 'refusee', label: 'Refusée' },
  { value: 'convertie', label: 'Convertie en étudiant' }
]

const roles = {
  directeur: {
    title: 'Direction générale',
    description: 'Administration générale et supervision de l’institut.',
    icon: ShieldCheck,
    modules: [
      {
        title: 'Préinscriptions',
        description: 'Superviser les demandes de préinscription.',
        icon: GraduationCap
      },
      {
        title: 'Gestion du personnel',
        description: 'Gérer les accès et les comptes du personnel.',
        icon: Users
      },
      {
        title: 'Gestion des étudiants',
        description: 'Consulter et administrer les dossiers étudiants.',
        icon: GraduationCap
      },
      {
        title: 'Gestion académique',
        description: 'Superviser les formations, matières et notes.',
        icon: BookOpen
      },
      {
        title: 'Paramètres',
        description: 'Consulter les paramètres administratifs.',
        icon: Settings
      }
    ]
  },

  directeur_academique: {
    title: 'Direction académique',
    description: 'Développement de l’offre de formation, supervision académique et qualité de l’enseignement.',
    icon: GraduationCap,
    modules: [
      {
        title: 'Gestion académique',
        description: 'Définir et superviser les formations, programmes et filières.',
        icon: BookOpen
      },
      {
        title: 'Notes',
        description: 'Consulter les résultats et suivre la qualité académique, sans modifier les notes.',
        icon: FileText
      },
      {
        title: 'Qualité de l’enseignement',
        description: 'Suivre les indicateurs et évaluer la qualité des formations.',
        icon: CheckCircle
      },
      {
        title: 'Partenariats académiques',
        description: 'Développer et suivre les partenariats institutionnels.',
        icon: Users
      },
      {
        title: 'Développement institutionnel',
        description: 'Participer à la stratégie de développement d’INTELA.',
        icon: ShieldCheck
      }
    ]
  },

  secretaire: {
    title: 'Espace secrétariat',
    description: 'Accueil, dossiers et suivi administratif des étudiants.',
    icon: Users,
    modules: [
      {
        title: 'Préinscriptions',
        description: 'Consulter et traiter les demandes.',
        icon: GraduationCap
      },
      {
        title: 'Étudiants',
        description: 'Consulter et gérer les dossiers étudiants.',
        icon: Users
      },
      {
        title: 'Inscriptions',
        description: 'Suivre les inscriptions administratives.',
        icon: BookOpen
      }
    ]
  },

  responsable_pedagogique: {
    title: 'Espace pédagogique',
    description: 'Organisation des formations et suivi pédagogique.',
    icon: BookOpen,
    modules: [
      {
        title: 'Formations',
        description: 'Organiser les programmes de formation.',
        icon: GraduationCap
      },
      {
        title: 'Matières et semestres',
        description: 'Consulter les contenus pédagogiques.',
        icon: BookOpen
      },
      {
        title: 'Notes',
        description: 'Gérer le suivi et les résultats.',
        icon: Settings
      }
    ]
  }
}
const colors = {
  navy: '#172A46',
  pink: '#D8A7B1',
  rose: '#C08081',
  beige: '#F5F0EB',
  white: '#FFFFFF',
  gray: '#647083'
}

function formatDate(date) {
  if (!date) return 'Non renseignée'

  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function statusLabel(status) {
  return STATUTS.find(item => item.value === status)?.label || status
}

function Preinscriptions() {
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tous')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function chargerDemandes() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('preinscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur de chargement :', error)
      setError(error.message)
      setDemandes([])
    } else {
      setDemandes(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
  let actif = true

  async function charger() {
    const { data, error } = await supabase
      .from('preinscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!actif) return

    if (error) {
      console.error('Erreur de chargement :', error)
      setError(error.message)
      setDemandes([])
    } else {
      setDemandes(data || [])
    }

    setLoading(false)
  }

  charger()

  return () => {
    actif = false
  }
}, [])

  const demandesFiltrees = useMemo(() => {
    const terme = search.toLowerCase().trim()

    return demandes.filter(demande => {
      const correspondStatut =
        filter === 'tous' || demande.statut === filter

      const nomComplet =
        `${demande.prenom || ''} ${demande.nom || ''}`.toLowerCase()

      const correspondRecherche =
        !terme ||
        nomComplet.includes(terme) ||
        (demande.email || '').toLowerCase().includes(terme) ||
        (demande.telephone || '').toLowerCase().includes(terme) ||
        (demande.commune || '').toLowerCase().includes(terme)

      return correspondStatut && correspondRecherche
    })
  }, [demandes, search, filter])

  const statistiques = {
    total: demandes.length,
    attente: demandes.filter(d => d.statut === 'en_attente').length,
    acceptees: demandes.filter(d => d.statut === 'acceptee').length,
    refusees: demandes.filter(d => d.statut === 'refusee').length,
    converties: demandes.filter(d => d.statut === 'convertie').length
  }

  async function modifierStatut(id, nouveauStatut) {
    setUpdating(true)
    setMessage('')
    setError('')

    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      setError('Session expirée. Veuillez vous reconnecter.')
      setUpdating(false)
      return
    }

    const { data, error } = await supabase
      .from('preinscriptions')
      .update({
        statut: nouveauStatut,
        traite_par: authData.user.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur de modification :', error)
      setError(error.message)
    } else {
      setDemandes(previous =>
        previous.map(d => d.id === id ? data : d)
      )
      setSelected(data)
      setMessage('Le statut de la demande a été mis à jour.')
    }

    setUpdating(false)
  }

  const boutonStyle = {
    border: 'none',
    borderRadius: 7,
    padding: '10px 14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600
  }

  return (
    <div>
      <button
        onClick={() => setSelected(null)}
        style={{
          ...boutonStyle,
          background: colors.pink,
          color: colors.navy,
          marginBottom: 20
        }}
      >
        <ArrowLeft size={15} style={{ verticalAlign: 'middle' }} />
        {' '}Retour au tableau de bord
      </button>

      {selected ? (
        <div style={{
          background: colors.white,
          border: '1px solid #e9e3df',
          borderRadius: 12,
          padding: 25
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>
                Dossier de préinscription
              </h2>
              <p style={{ color: colors.gray, fontSize: 13 }}>
                Demande reçue le {formatDate(selected.created_at)}
              </p>
            </div>

            <button
              onClick={() => setSelected(null)}
              style={{
                ...boutonStyle,
                background: colors.beige,
                color: colors.navy
              }}
            >
              <X size={17} />
            </button>
          </div>

          <h3 style={{ color: colors.rose, marginTop: 25 }}>
            {selected.prenom} {selected.nom}
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginTop: 20
          }}>
            {[
              { icon: Mail, label: 'E-mail', value: selected.email },
              { icon: Phone, label: 'Téléphone', value: selected.telephone },
              { icon: MapPin, label: 'Commune', value: selected.commune },
              { icon: Calendar, label: 'Date de naissance', value: formatDate(selected.date_naissance) },
              { icon: MapPin, label: 'Adresse', value: selected.adresse },
              { icon: GraduationCap, label: 'Niveau d’études', value: selected.niveau_etudes }
            ].map((item, index) => {
              const Icon = item.icon

              return (
                <div key={index} style={{
                  background: colors.beige,
                  padding: 15,
                  borderRadius: 8
                }}>
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    color: colors.gray,
                    fontSize: 12
                  }}>
                    <Icon size={15} /> {item.label}
                  </div>
                  <div style={{
                    marginTop: 8,
                    fontWeight: 600,
                    overflowWrap: 'anywhere'
                  }}>
                    {item.value || 'Non renseigné'}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 22 }}>
            <h4><FileText size={17} style={{ verticalAlign: 'middle' }} /> Motivation</h4>
            <p style={{
              background: colors.beige,
              borderRadius: 8,
              padding: 16,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}>
              {selected.motivation || 'Aucune motivation renseignée.'}
            </p>
          </div>

          <div style={{ marginTop: 22 }}>
            <h4>Formation souhaitée</h4>
            <p>{selected.formation_souhaitee || 'Non renseignée'}</p>
          </div>

          <div style={{ marginTop: 25 }}>
            <h4>Traitement administratif</h4>
            <p style={{ color: colors.gray, fontSize: 13 }}>
              Statut actuel : <strong>{statusLabel(selected.statut)}</strong>
            </p>

            <select
              value={selected.statut}
              disabled={updating}
              onChange={e => modifierStatut(selected.id, e.target.value)}
              style={{
                padding: 12,
                borderRadius: 7,
                border: '1px solid #ddd',
                width: '100%',
                maxWidth: 350,
                background: colors.white,
                color: colors.navy
              }}
            >
              {STATUTS.map(statut => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
                </option>
              ))}
            </select>

            {updating && <p>Modification en cours...</p>}
          </div>

          {message && (
            <p style={{ color: '#26734d' }}>{message}</p>
          )}

          {error && (
            <p style={{ color: '#b42318' }}>Erreur : {error}</p>
          )}
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 15
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 25 }}>
                Gestion des préinscriptions
              </h2>
              <p style={{ color: colors.gray, fontSize: 13 }}>
                Consultez et traitez les demandes des candidats.
              </p>
            </div>

            <button
              onClick={chargerDemandes}
              disabled={loading}
              style={{
                ...boutonStyle,
                background: colors.navy,
                color: colors.white
              }}
            >
              <RefreshCw size={15} /> Actualiser
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            margin: '25px 0'
          }}>
            {[
              { label: 'Total', value: statistiques.total, icon: Users },
              { label: 'En attente', value: statistiques.attente, icon: Clock },
              { label: 'Acceptées', value: statistiques.acceptees, icon: CheckCircle },
              { label: 'Refusées', value: statistiques.refusees, icon: X },
              { label: 'Converties', value: statistiques.converties, icon: UserCheck }
            ].map((item, index) => {
              const Icon = item.icon

              return (
                <div key={index} style={{
                  background: colors.white,
                  border: '1px solid #e9e3df',
                  padding: 17,
                  borderRadius: 9
                }}>
                  <Icon size={20} color={colors.rose} />
                  <div style={{
                    fontSize: 25,
                    fontWeight: 700,
                    marginTop: 8
                  }}>
                    {item.value}
                  </div>
                  <div style={{ color: colors.gray, fontSize: 12 }}>
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20
          }}>
            <div style={{
              flex: '1 1 230px',
              position: 'relative'
            }}>
              <Search
                size={17}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 13,
                  color: colors.gray
                }}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un candidat..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 12px 12px 38px',
                  border: '1px solid #ddd',
                  borderRadius: 7
                }}
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                padding: 12,
                border: '1px solid #ddd',
                borderRadius: 7,
                background: colors.white
              }}
            >
              <option value="tous">Tous les statuts</option>
              {STATUTS.map(statut => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ color: '#b42318' }}>
              Erreur : {error}
            </p>
          )}

          {loading ? (
            <p>Chargement des demandes...</p>
          ) : demandesFiltrees.length === 0 ? (
            <div style={{
              background: colors.white,
              padding: 35,
              borderRadius: 9,
              textAlign: 'center',
              color: colors.gray
            }}>
              Aucune préinscription trouvée.
            </div>
          ) : (
            <div style={{
              background: colors.white,
              border: '1px solid #e9e3df',
              borderRadius: 10,
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: 650,
                textAlign: 'left'
              }}>
                <thead style={{ background: colors.beige }}>
                  <tr>
                    {['Candidat', 'Téléphone', 'Commune', 'Date', 'Statut', 'Action'].map(label => (
                      <th key={label} style={{
                        padding: 14,
                        fontSize: 12,
                        color: colors.gray
                      }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {demandesFiltrees.map(demande => (
                    <tr key={demande.id} style={{
                      borderTop: '1px solid #eee'
                    }}>
                      <td style={{ padding: 14 }}>
                        <strong>
                          {demande.prenom} {demande.nom}
                        </strong>
                        <div style={{
                          fontSize: 11,
                          color: colors.gray
                        }}>
                          {demande.email}
                        </div>
                      </td>

                      <td style={{ padding: 14, fontSize: 13 }}>
                        {demande.telephone}
                      </td>

                      <td style={{ padding: 14, fontSize: 13 }}>
                        {demande.commune || '—'}
                      </td>

                      <td style={{ padding: 14, fontSize: 12 }}>
                        {formatDate(demande.created_at)}
                      </td>

                      <td style={{ padding: 14 }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 9px',
                          borderRadius: 20,
                          background: colors.beige,
                          fontSize: 11,
                          color: colors.navy
                        }}>
                          {statusLabel(demande.statut)}
                        </span>
                      </td>

                      <td style={{ padding: 14 }}>
                        <button
                          onClick={() => {
                            setSelected(demande)
                            setMessage('')
                            setError('')
                          }}
                          style={{
                            ...boutonStyle,
                            background: colors.navy,
                            color: colors.white,
                            padding: '8px 11px'
                          }}
                        >
                          <Eye size={15} />
                          {' '}Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminDashboard({ session, onLogout }) {
  const [activeModule, setActiveModule] = useState(null)

  const config = roles[session.role]

  if (!config) {
    return <p>Rôle administratif non reconnu.</p>
  }

  const MainIcon = config.icon

  async function handleLogout() {
    await supabase.auth.signOut()
    onLogout()
  }

  // Le reste de ton code reste inchangé.

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.beige,
      color: colors.navy,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <header style={{
        background: colors.navy,
        color: colors.white,
        padding: '22px 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div>
          <strong style={{ fontSize: 23, letterSpacing: 2 }}>INTELA</strong>
          <div style={{ fontSize: 10, letterSpacing: 1, marginTop: 4 }}>
            ESPACE ADMINISTRATIF
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            color: colors.white,
            border: '1px solid #ffffff66',
            borderRadius: 7,
            padding: '11px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 9
          }}
        >
          <LogOut size={17} /> Déconnexion
        </button>
      </header>

      <main style={{
        maxWidth: 1150,
        margin: 'auto',
        padding: '45px 5%'
      }}>
        <div style={{
          color: colors.gray,
          fontSize: 12,
          marginBottom: 12
        }}>
          TABLEAU DE BORD / {config.title.toUpperCase()}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 17,
          marginBottom: 35
        }}>
          <div style={{
            background: colors.pink,
            color: colors.navy,
            padding: 15,
            borderRadius: 10
          }}>
            <MainIcon size={28} />
          </div>

          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 30,
              margin: 0
            }}>
              Bonjour, {session.profile.full_name}
            </h1>
            <p style={{ color: colors.gray, marginTop: 7 }}>
              {config.description}
            </p>
          </div>
        </div>
        
        {activeModule === 'Préinscriptions' ? (
          <Preinscriptions />
        ) : activeModule === 'Étudiants' ? (
          <Etudiants
            session={session}
            onBack={() => setActiveModule(null)}
          />
        ) : activeModule === 'Gestion académique' ? (
          <GestionAcademique
            session={session}
            onBack={() => setActiveModule(null)}
          />
          ) : activeModule === 'Notes' ? (
          <Notes session={session} onBack={() => setActiveModule(null)}
          />
          ) : activeModule === 'Gestion du personnel' ? (
  <GestionPersonnel
    session={session}
    onBack={() => setActiveModule(null)}
  />

        ) : (
          <>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 23
            }}>
              Vos espaces de travail
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 20,
              marginTop: 22
            }}>
              {config.modules.map(module => {
                const Icon = module.icon

                const modulesActifs = [
                  'Préinscriptions',
                  'Étudiants',
                  'Gestion des étudiants',
                  'Gestion académique',
                  'Formations',
                  'Matières et semestres', 'Notes', 'Gestion du personnel', 'Paramètres'
                ]

                const moduleActif = modulesActifs.includes(module.title)

                return (
                  <button
                    key={module.title}
                    onClick={() => {
                      if (module.title === 'Préinscriptions') {
                        setActiveModule('Préinscriptions')
                      } else if (
                        module.title === 'Étudiants' ||
                        module.title === 'Gestion des étudiants'
                      ) {
                        setActiveModule('Étudiants')
                      } else if (
                        [
                          'Gestion académique',
                          'Formations',
                          'Matières et semestres'
                        ].includes(module.title)
                      ) {
                        setActiveModule('Gestion académique')
                      }
                       else if (module.title === 'Notes') { setActiveModule('Notes')
                       }
                    else if (module.title === 'Gestion du personnel') { setActiveModule('Gestion du personnel')
                     } else if (module.title === 'Paramètres') {
                    setActiveModule('Paramètres')
                     }
                    }}
                    style={{
                      background: colors.white,
                      padding: 25,
                      borderRadius: 10,
                      border: '1px solid #e9e3df',
                      textAlign: 'left',
                      color: colors.navy,
                      cursor: moduleActif ? 'pointer' : 'default'
                    }}
                  >
                    <Icon size={25} color={colors.rose} />

                    <h3 style={{
                      margin: '17px 0 8px',
                      fontSize: 17
                    }}>
                      {module.title}
                    </h3>

                    <p style={{
                      color: colors.gray,
                      fontSize: 13,
                      lineHeight: 1.7,
                      margin: 0
                    }}>
                      {module.description}
                    </p>

                    <span style={{
                      display: 'inline-block',
                      marginTop: 18,
                      color: moduleActif ? colors.rose : colors.gray,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {moduleActif
                        ? 'Ouvrir le module →'
                        : 'Module à développer'}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
              </main>
    </div>
  )
}
