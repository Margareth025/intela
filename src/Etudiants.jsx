
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import {
  ArrowLeft, Search, RefreshCw, Plus, Eye, Pencil,
 Save, GraduationCap, User, Phone, Mail,
  Calendar, MapPin, BookOpen, Trash2
} from 'lucide-react'

const colors = {
  navy: '#172A46',
  pink: '#D8A7B1',
  rose: '#C08081',
  beige: '#F5F0EB',
  white: '#FFFFFF',
  gray: '#647083'
}

const STATUTS_ETUDIANT = [
  { value: 'actif', label: 'Actif' },
  { value: 'suspendu', label: 'Suspendu' },
  { value: 'diplome', label: 'Diplômé' },
  { value: 'abandon', label: 'Abandon' }
]

const STATUTS_INSCRIPTION = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'validee', label: 'Validée' },
  { value: 'refusee', label: 'Refusée' },
  { value: 'terminee', label: 'Terminée' }
]

const buttonStyle = {
  border: 'none',
  borderRadius: 7,
  padding: '10px 14px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: 12,
  border: '1px solid #ddd',
  borderRadius: 7,
  background: colors.white,
  color: colors.navy,
  fontFamily: 'inherit'
}

function formatDate(date) {
  if (!date) return 'Non renseignée'

  return new Date(`${date}T00:00:00`).toLocaleDateString('fr-FR')
}

function genererMatricule() {
  const annee = new Date().getFullYear()
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `INT-${annee}-${code}`
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 15 }}>
      <span style={{
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 7
      }}>
        {label}
      </span>
      {children}
    </label>
  )
}

export default function Etudiants({ session, onBack }) {
  const [etudiants, setEtudiants] = useState([])
  const [formations, setFormations] = useState([])
  const [inscriptions, setInscriptions] = useState([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('tous')

  const [selected, setSelected] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [enrollmentOpen, setEnrollmentOpen] = useState(false)
  const [editing, setEditing] = useState(false)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    sexe: '',
    date_naissance: '',
    telephone: '',
    email: '',
    adresse: '',
    personne_contact: '',
    telephone_contact: '',
    statut: 'actif'
  })

  const [enrollment, setEnrollment] = useState({
    formation_id: '',
    annee_academique: '',
    statut: 'en_cours'
  })

  const isDirector = session.role === 'directeur'

  async function chargerDonnees() {
    setLoading(true)
    setError('')

    const [
      studentsResult,
      formationsResult,
      inscriptionsResult
    ] = await Promise.all([
      supabase
        .from('etudiants')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('formations')
        .select('id, nom, code')
        .eq('active', true)
        .order('nom'),

      supabase
        .from('inscriptions')
        .select('*')
        .order('date_inscription', { ascending: false })
    ])

    if (studentsResult.error) {
      setError(studentsResult.error.message)
      setEtudiants([])
    } else {
      setEtudiants(studentsResult.data || [])
    }

    if (formationsResult.error) {
      setError(previous =>
        previous || formationsResult.error.message
      )
      setFormations([])
    } else {
      setFormations(formationsResult.data || [])
    }

    if (inscriptionsResult.error) {
      setError(previous =>
        previous || inscriptionsResult.error.message
      )
      setInscriptions([])
    } else {
      setInscriptions(inscriptionsResult.data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    let actif = true

    async function charger() {
      const [
        studentsResult,
        formationsResult,
        inscriptionsResult
      ] = await Promise.all([
        supabase
          .from('etudiants')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase
          .from('formations')
          .select('id, nom, code')
          .eq('active', true)
          .order('nom'),

        supabase
          .from('inscriptions')
          .select('*')
          .order('date_inscription', { ascending: false })
      ])

      if (!actif) return

      if (studentsResult.error) {
        setError(studentsResult.error.message)
      } else {
        setEtudiants(studentsResult.data || [])
      }

      if (formationsResult.error) {
        setError(previous => previous || formationsResult.error.message)
      } else {
        setFormations(formationsResult.data || [])
      }

      if (inscriptionsResult.error) {
        setError(previous => previous || inscriptionsResult.error.message)
      } else {
        setInscriptions(inscriptionsResult.data || [])
      }

      setLoading(false)
    }

    charger()

    return () => {
      actif = false
    }
  }, [])

  const etudiantsFiltres = useMemo(() => {
    const terme = search.toLowerCase().trim()

    return etudiants.filter(etudiant => {
      const correspondStatut =
        filter === 'tous' || etudiant.statut === filter

      const nomComplet =
        `${etudiant.prenom} ${etudiant.nom}`.toLowerCase()

      const correspondRecherche =
        !terme ||
        nomComplet.includes(terme) ||
        (etudiant.matricule || '').toLowerCase().includes(terme) ||
        (etudiant.telephone || '').toLowerCase().includes(terme) ||
        (etudiant.email || '').toLowerCase().includes(terme)

      return correspondStatut && correspondRecherche
    })
  }, [etudiants, search, filter])

  const statistiques = {
    total: etudiants.length,
    actifs: etudiants.filter(e => e.statut === 'actif').length,
    suspendus: etudiants.filter(e => e.statut === 'suspendu').length,
    diplomes: etudiants.filter(e => e.statut === 'diplome').length
  }

  function ouvrirCreation() {
    setSelected(null)
    setEditing(false)
    setMessage('')
    setError('')

    setForm({
      matricule: genererMatricule(),
      nom: '',
      prenom: '',
      sexe: '',
      date_naissance: '',
      telephone: '',
      email: '',
      adresse: '',
      personne_contact: '',
      telephone_contact: '',
      statut: 'actif'
    })

    setFormOpen(true)
  }

  function ouvrirModification(etudiant) {
    setSelected(etudiant)
    setEditing(true)
    setMessage('')
    setError('')

    setForm({
      matricule: etudiant.matricule,
      nom: etudiant.nom || '',
      prenom: etudiant.prenom || '',
      sexe: etudiant.sexe || '',
      date_naissance: etudiant.date_naissance || '',
      telephone: etudiant.telephone || '',
      email: etudiant.email || '',
      adresse: etudiant.adresse || '',
      personne_contact: etudiant.personne_contact || '',
      telephone_contact: etudiant.telephone_contact || '',
      statut: etudiant.statut || 'actif'
    })

    setFormOpen(true)
  }

  async function enregistrerEtudiant(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const donnees = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      sexe: form.sexe || null,
      date_naissance: form.date_naissance || null,
      telephone: form.telephone.trim() || null,
      email: form.email.trim() || null,
      adresse: form.adresse.trim() || null,
      personne_contact: form.personne_contact.trim() || null,
      telephone_contact: form.telephone_contact.trim() || null,
      statut: form.statut
    }

    let result

    if (editing) {
      result = await supabase
        .from('etudiants')
        .update(donnees)
        .eq('id', selected.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('etudiants')
        .insert({
          ...donnees,
          matricule: form.matricule
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error(result.error)
      setError(
        result.error.code === '23505'
          ? 'Ce matricule existe déjà. Fermez le formulaire et réessayez.'
          : result.error.message
      )
      setSaving(false)
      return
    }

    setMessage(
      editing
        ? 'Le dossier étudiant a été modifié.'
        : 'Le dossier étudiant a été créé.'
    )

    setSaving(false)
    setFormOpen(false)
    setSelected(result.data)
    await chargerDonnees()
  }

  function ouvrirInscription(etudiant) {
    setSelected(etudiant)
    setEnrollment({
      formation_id: '',
      annee_academique: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      statut: 'en_cours'
    })
    setError('')
    setMessage('')
    setEnrollmentOpen(true)
  }

  async function enregistrerInscription(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const { error: insertError } = await supabase
      .from('inscriptions')
      .insert({
        etudiant_id: selected.id,
        formation_id: enrollment.formation_id,
        annee_academique: enrollment.annee_academique.trim(),
        statut: enrollment.statut
      })

    if (insertError) {
      console.error(insertError)
      setError(
        insertError.code === '23505'
          ? 'Cet étudiant est déjà inscrit à cette formation pour cette année académique.'
          : insertError.message
      )
      setSaving(false)
      return
    }

    setEnrollmentOpen(false)
    setMessage('Inscription académique enregistrée.')
    setSaving(false)
    await chargerDonnees()
  }

  async function modifierStatutInscription(id, statut) {
    setError('')
    setMessage('')

    const { error: updateError } = await supabase
      .from('inscriptions')
      .update({ statut })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setMessage('Statut de l’inscription mis à jour.')
    await chargerDonnees()
  }

  async function supprimerEtudiant(etudiant) {
    const confirmation = window.confirm(
      `Supprimer définitivement le dossier de ${etudiant.prenom} ${etudiant.nom} ?`
    )

    if (!confirmation) return

    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('etudiants')
      .delete()
      .eq('id', etudiant.id)

    if (deleteError) {
      setError(
        deleteError.message.includes('foreign key')
          ? 'Impossible de supprimer cet étudiant : des inscriptions lui sont associées.'
          : deleteError.message
      )
      return
    }

    setSelected(null)
    setMessage('Dossier étudiant supprimé.')
    await chargerDonnees()
  }

  const bouton = (label, action, background = colors.navy, disabled = false) => (
    <button
      type="button"
      onClick={action}
      disabled={disabled}
      style={{
        ...buttonStyle,
        background,
        color: background === colors.beige ? colors.navy : colors.white,
        opacity: disabled ? 0.6 : 1
      }}
    >
      {label}
    </button>
  )

  const inscriptionsEtudiant = selected
    ? inscriptions.filter(i => i.etudiant_id === selected.id)
    : []

  const formationNom = id =>
    formations.find(f => f.id === id)?.nom || 'Formation'

  return (
    <div>
      {bouton(
        <><ArrowLeft size={15} /> Retour au tableau de bord</>,
        onBack,
        colors.pink
      )}

      {error && (
        <div style={{
          background: '#fff0ef',
          color: '#b42318',
          padding: 13,
          borderRadius: 8,
          marginTop: 18
        }}>
          Erreur : {error}
        </div>
      )}

      {message && (
        <div style={{
          background: '#edf7f0',
          color: '#26734d',
          padding: 13,
          borderRadius: 8,
          marginTop: 18
        }}>
          {message}
        </div>
      )}

      {formOpen ? (
        <section style={{
          background: colors.white,
          border: '1px solid #e9e3df',
          borderRadius: 12,
          padding: 24,
          marginTop: 22
        }}>
          <h2>{editing ? 'Modifier le dossier étudiant' : 'Nouveau dossier étudiant'}</h2>

          <form onSubmit={enregistrerEtudiant}>
            {!editing && (
              <Field label="Matricule généré">
                <input
                  value={form.matricule}
                  readOnly
                  style={{ ...inputStyle, background: colors.beige }}
                />
              </Field>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 15
            }}>
              <Field label="Nom *">
                <input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Prénom *">
                <input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Sexe">
                <select value={form.sexe} onChange={e => setForm({ ...form, sexe: e.target.value })} style={inputStyle}>
                  <option value="">Non renseigné</option>
                  <option value="F">Féminin</option>
                  <option value="M">Masculin</option>
                  <option value="Autre">Autre</option>
                </select>
              </Field>

              <Field label="Date de naissance">
                <input type="date" value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Téléphone">
                <input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Adresse e-mail">
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Adresse">
                <input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Personne à contacter">
                <input value={form.personne_contact} onChange={e => setForm({ ...form, personne_contact: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Téléphone du contact">
                <input value={form.telephone_contact} onChange={e => setForm({ ...form, telephone_contact: e.target.value })} style={inputStyle} />
              </Field>

              <Field label="Statut">
                <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} style={inputStyle}>
                  {STATUTS_ETUDIANT.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" disabled={saving} style={{ ...buttonStyle, background: colors.navy, color: colors.white }}>
                <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>

              <button type="button" onClick={() => setFormOpen(false)} style={{ ...buttonStyle, background: colors.beige, color: colors.navy }}>
                Annuler
              </button>
            </div>
          </form>
        </section>
      ) : enrollmentOpen ? (
        <section style={{
          background: colors.white,
          border: '1px solid #e9e3df',
          borderRadius: 12,
          padding: 24,
          marginTop: 22
        }}>
          <h2>Inscrire un étudiant</h2>
          <p style={{ color: colors.gray }}>
            {selected?.prenom} {selected?.nom} — {selected?.matricule}
          </p>

          <form onSubmit={enregistrerInscription}>
            <Field label="Formation *">
              <select
                required
                value={enrollment.formation_id}
                onChange={e => setEnrollment({ ...enrollment, formation_id: e.target.value })}
                style={inputStyle}
              >
                <option value="">Choisir une formation</option>
                {formations.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nom}{f.code ? ` (${f.code})` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Année académique *">
              <input
                required
                value={enrollment.annee_academique}
                onChange={e => setEnrollment({ ...enrollment, annee_academique: e.target.value })}
                placeholder="Ex. 2026-2027"
                style={inputStyle}
              />
            </Field>

            <Field label="Statut de l'inscription">
              <select
                value={enrollment.statut}
                onChange={e => setEnrollment({ ...enrollment, statut: e.target.value })}
                style={inputStyle}
              >
                {STATUTS_INSCRIPTION.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="submit" disabled={saving || formations.length === 0} style={{ ...buttonStyle, background: colors.navy, color: colors.white }}>
                <Save size={16} /> {saving ? 'Enregistrement...' : 'Confirmer l’inscription'}
              </button>

              <button type="button" onClick={() => setEnrollmentOpen(false)} style={{ ...buttonStyle, background: colors.beige, color: colors.navy }}>
                Annuler
              </button>
            </div>

            {formations.length === 0 && (
              <p style={{ color: colors.rose }}>
                Aucune formation active n'est disponible. Activez une formation dans la gestion académique.
              </p>
            )}
          </form>
        </section>
      ) : selected ? (
        <section style={{
          background: colors.white,
          border: '1px solid #e9e3df',
          borderRadius: 12,
          padding: 24,
          marginTop: 22
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h2 style={{ marginBottom: 5 }}>
                {selected.prenom} {selected.nom}
              </h2>
              <p style={{ color: colors.gray, marginTop: 0 }}>
                Matricule : <strong>{selected.matricule}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {bouton(<><Pencil size={15} /> Modifier</>, () => ouvrirModification(selected))}
              {bouton(<><BookOpen size={15} /> Inscrire</>, () => ouvrirInscription(selected), colors.rose)}
              {isDirector && bouton(<><Trash2 size={15} /> Supprimer</>, () => supprimerEtudiant(selected), '#9b3434')}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 13,
            marginTop: 22
          }}>
            {[
              { icon: User, label: 'Sexe', value: selected.sexe || 'Non renseigné' },
              { icon: Calendar, label: 'Naissance', value: formatDate(selected.date_naissance) },
              { icon: Phone, label: 'Téléphone', value: selected.telephone || 'Non renseigné' },
              { icon: Mail, label: 'E-mail', value: selected.email || 'Non renseigné' },
              { icon: MapPin, label: 'Adresse', value: selected.adresse || 'Non renseignée' },
              { icon: User, label: 'Personne à contacter', value: selected.personne_contact || 'Non renseignée' },
              { icon: Phone, label: 'Téléphone du contact', value: selected.telephone_contact || 'Non renseigné' },
              { icon: GraduationCap, label: 'Statut', value: STATUTS_ETUDIANT.find(s => s.value === selected.statut)?.label || selected.statut }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} style={{ background: colors.beige, padding: 15, borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: colors.gray, fontSize: 12 }}>
                    <Icon size={15} /> {item.label}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 600, overflowWrap: 'anywhere' }}>
                    {item.value}
                  </div>
                </div>
              )
            })}
          </div>

          <h3 style={{ marginTop: 30 }}>Inscriptions académiques</h3>

          {inscriptionsEtudiant.length === 0 ? (
            <p style={{ color: colors.gray }}>Aucune inscription académique enregistrée.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead style={{ background: colors.beige }}>
                  <tr>
                    {['Formation', 'Année académique', 'Date', 'Statut'].map(t => (
                      <th key={t} style={{ textAlign: 'left', padding: 12 }}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inscriptionsEtudiant.map(i => (
                    <tr key={i.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 12 }}>{formationNom(i.formation_id)}</td>
                      <td style={{ padding: 12 }}>{i.annee_academique}</td>
                      <td style={{ padding: 12 }}>{formatDate(i.date_inscription)}</td>
                      <td style={{ padding: 12 }}>
                        <select
                          value={i.statut}
                          onChange={e => modifierStatutInscription(i.id, e.target.value)}
                          style={{ ...inputStyle, minWidth: 125 }}
                          disabled={session.role === 'responsable_pedagogique'}
                        >
                          {STATUTS_INSCRIPTION.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 15,
            marginTop: 22
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 25 }}>Gestion des étudiants</h2>
              <p style={{ color: colors.gray, fontSize: 13 }}>
                Consultez, recherchez et gérez les dossiers étudiants.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              {bouton(<><RefreshCw size={15} /> Actualiser</>, chargerDonnees, colors.rose, loading)}
              {bouton(<><Plus size={16} /> Nouvel étudiant</>, ouvrirCreation)}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
            margin: '24px 0'
          }}>
            {[
              ['Total étudiants', statistiques.total],
              ['Actifs', statistiques.actifs],
              ['Suspendus', statistiques.suspendus],
              ['Diplômés', statistiques.diplomes]
            ].map(([label, value]) => (
              <div key={label} style={{
                background: colors.white,
                border: '1px solid #e9e3df',
                padding: 17,
                borderRadius: 9
              }}>
                <div style={{ fontSize: 25, fontWeight: 700 }}>{value}</div>
                <div style={{ color: colors.gray, fontSize: 12 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20
          }}>
            <div style={{ flex: '1 1 230px', position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: 12, top: 13, color: colors.gray }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nom, matricule, téléphone..."
                style={{ ...inputStyle, paddingLeft: 38 }}
              />
            </div>

            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 160 }}>
              <option value="tous">Tous les statuts</option>
              {STATUTS_ETUDIANT.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <p>Chargement des étudiants...</p>
          ) : etudiantsFiltres.length === 0 ? (
            <div style={{
              background: colors.white,
              padding: 35,
              borderRadius: 9,
              textAlign: 'center',
              color: colors.gray
            }}>
              Aucun étudiant trouvé.
            </div>
          ) : (
            <div style={{
              background: colors.white,
              border: '1px solid #e9e3df',
              borderRadius: 10,
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, textAlign: 'left' }}>
                <thead style={{ background: colors.beige }}>
                  <tr>
                    {['Matricule', 'Étudiant', 'Téléphone', 'Statut', 'Inscriptions', 'Action'].map(label => (
                      <th key={label} style={{ padding: 14, fontSize: 12, color: colors.gray }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {etudiantsFiltres.map(etudiant => (
                    <tr key={etudiant.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 14, fontSize: 12, fontWeight: 700 }}>{etudiant.matricule}</td>
                      <td style={{ padding: 14 }}>
                        <strong>{etudiant.prenom} {etudiant.nom}</strong>
                        <div style={{ fontSize: 11, color: colors.gray }}>{etudiant.email || '—'}</div>
                      </td>
                      <td style={{ padding: 14, fontSize: 13 }}>{etudiant.telephone || '—'}</td>
                      <td style={{ padding: 14 }}>
                        {STATUTS_ETUDIANT.find(s => s.value === etudiant.statut)?.label || etudiant.statut}
                      </td>
                      <td style={{ padding: 14 }}>
                        {inscriptions.filter(i => i.etudiant_id === etudiant.id).length}
                      </td>
                      <td style={{ padding: 14 }}>
                        <button
                          onClick={() => {
                            setSelected(etudiant)
                            setMessage('')
                            setError('')
                          }}
                          style={{ ...buttonStyle, background: colors.navy, color: colors.white, padding: '8px 11px' }}
                        >
                          <Eye size={15} /> Voir
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
