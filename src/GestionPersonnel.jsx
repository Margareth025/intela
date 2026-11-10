
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  UserPlus,
  Pencil,
  X,
  Check,
  UserCheck,
  UserX,
  Mail,
} from 'lucide-react'
import './GestionPersonnel.css'

const ROLES = [
  { value: 'directeur', label: 'Directrice' },
   { value: 'directeur_academique', label: 'Directeur académique' },
  { value: 'secretaire', label: 'Secrétaire' },
  { value: 'responsable_pedagogique', label: 'Responsable pédagogique' }
]

const roleLabel = role =>
  ROLES.find(item => item.value === role)?.label || 'Non attribué'

export default function GestionPersonnel({ session, onBack }) {
  const [personnel, setPersonnel] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    role: 'secretaire'
  })

  async function appelerFonction(body) {
    const { data, error } = await supabase.functions.invoke(
      'gestion-personnel',
      { body }
    )

    if (error) {
      throw new Error(error.message || 'Erreur de communication avec le serveur.')
    }

    if (data?.error) {
      throw new Error(data.error)
    }

    return data
  }

  async function chargerPersonnel() {
    setLoading(true)
    setError('')

    try {
      const data = await appelerFonction({ action: 'list' })
      setPersonnel(data.personnel || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let actif = true

    async function charger() {
      try {
        const { data, error } = await supabase.functions.invoke(
          'gestion-personnel',
          { body: { action: 'list' } }
        )

        if (error) throw error
        if (data?.error) throw new Error(data.error)

        if (actif) setPersonnel(data.personnel || [])
      } catch (err) {
        if (actif) setError(err.message)
      } finally {
        if (actif) setLoading(false)
      }
    }

    charger()

    return () => {
      actif = false
    }
  }, [])

  function ouvrirEdition(membre) {
    setEditing(membre)
    setForm({
      full_name: membre.full_name || '',
      phone: membre.phone || '',
      role: membre.role || 'secretaire',
      email: ''
    })
    setMessage('')
    setError('')
  }

  function fermerFormulaires() {
    setEditing(null)
    setShowInvite(false)
    setForm({
      full_name: '',
      phone: '',
      email: '',
      role: 'secretaire'
    })
  }

  async function enregistrerProfil(e) {
    e.preventDefault()
    if (!editing) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await appelerFonction({
        action: 'update_profile',
        user_id: editing.id,
        full_name: form.full_name,
        phone: form.phone
      })

      await appelerFonction({
        action: 'set_role',
        user_id: editing.id,
        role: form.role
      })

      setMessage('Les informations du membre ont été mises à jour.')
      fermerFormulaires()
      await chargerPersonnel()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function inviterMembre(e) {
    e.preventDefault()

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const data = await appelerFonction({
        action: 'invite',
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        role: form.role
      })

      setMessage(data.message || 'Invitation envoyée.')
      fermerFormulaires()
      await chargerPersonnel()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function changerActivation(membre) {
    const nouveauStatut = !membre.active

    const confirmation = window.confirm(
      nouveauStatut
        ? `Réactiver le compte de ${membre.full_name} ?`
        : `Désactiver le compte de ${membre.full_name} ?`
    )

    if (!confirmation) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await appelerFonction({
        action: 'set_active',
        user_id: membre.id,
        active: nouveauStatut
      })

      setMessage('Le statut du compte a été modifié.')
      await chargerPersonnel()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const personnelFiltres = personnel.filter(membre => {
    const terme = search.toLowerCase().trim()

    return (
      !terme ||
      (membre.full_name || '').toLowerCase().includes(terme) ||
      (membre.phone || '').toLowerCase().includes(terme) ||
      roleLabel(membre.role).toLowerCase().includes(terme)
    )
  })

  const actifs = personnel.filter(m => m.active).length

  if (session?.role !== 'directeur') {
    return (
      <div className="personnel-container">
        <p>Accès réservé à la direction générale.</p>
        <button className="personnel-secondary-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    )
  }

  return (
    <div className="personnel-container">
      <button className="personnel-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Retour au tableau de bord
      </button>

      <div className="personnel-heading">
        <div>
          <span className="personnel-eyebrow">ADMINISTRATION INTELA</span>
          <h2>Gestion du personnel</h2>
          <p>Gérez les membres de votre équipe et leurs accès.</p>
        </div>

        <button
          className="personnel-primary-btn"
          onClick={() => {
            fermerFormulaires()
            setShowInvite(true)
            setError('')
            setMessage('')
          }}
        >
          <UserPlus size={17} /> Inviter un membre
        </button>
      </div>

      {error && <div className="personnel-alert error">{error}</div>}
      {message && <div className="personnel-alert success">{message}</div>}

      {(showInvite || editing) && (
        <div className="personnel-form-card">
          <div className="personnel-form-heading">
            <h3>{editing ? 'Modifier le membre' : 'Inviter un membre du personnel'}</h3>
            <button
              className="personnel-icon-btn"
              onClick={fermerFormulaires}
              type="button"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={editing ? enregistrerProfil : inviterMembre}>
            <div className="personnel-form-grid">
              <label>
                Nom complet
                <input
                  required
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Nom et prénom"
                />
              </label>

              {!editing && (
                <label>
                  Adresse e-mail
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="exemple@email.com"
                  />
                </label>
              )}

              <label>
                Téléphone
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Numéro de téléphone"
                />
              </label>

              <label>
                Rôle administratif
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="personnel-form-actions">
              <button
                type="button"
                className="personnel-secondary-btn"
                onClick={fermerFormulaires}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="personnel-primary-btn"
                disabled={saving}
              >
                <Check size={16} />
                {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Envoyer l’invitation'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="personnel-stats">
        <div className="personnel-stat-card">
          <Users size={22} />
          <strong>{personnel.length}</strong>
          <span>Membres enregistrés</span>
        </div>

        <div className="personnel-stat-card">
          <UserCheck size={22} />
          <strong>{actifs}</strong>
          <span>Comptes actifs</span>
        </div>

        <div className="personnel-stat-card">
          <UserX size={22} />
          <strong>{personnel.length - actifs}</strong>
          <span>Comptes désactivés</span>
        </div>
      </div>

      <div className="personnel-toolbar">
        <div className="personnel-search">
          <Search size={17} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un membre..."
          />
        </div>

        <button
          className="personnel-secondary-btn"
          onClick={chargerPersonnel}
          disabled={loading || saving}
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      <div className="personnel-table-card">
        {loading ? (
          <p className="personnel-empty">Chargement du personnel...</p>
        ) : personnelFiltres.length === 0 ? (
          <p className="personnel-empty">Aucun membre du personnel trouvé.</p>
        ) : (
          <div className="personnel-table-scroll">
            <table className="personnel-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {personnelFiltres.map(membre => (
                  <tr key={membre.id}>
                    <td>
                      <strong>{membre.full_name}</strong>
                      <small>
                        Ajouté le{' '}
                        {new Date(membre.created_at).toLocaleDateString('fr-FR')}
                      </small>
                    </td>
                    <td>{membre.phone || 'Non renseigné'}</td>
                    <td>{roleLabel(membre.role)}</td>
                    <td>
                      <span className={`personnel-status ${membre.active ? 'active' : 'inactive'}`}>
                        {membre.active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <div className="personnel-actions">
                        <button
                          className="personnel-action-btn"
                          title="Modifier"
                          onClick={() => ouvrirEdition(membre)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="personnel-action-btn"
                          title={membre.active ? 'Désactiver' : 'Réactiver'}
                          onClick={() => changerActivation(membre)}
                          disabled={saving || membre.id === session.user.id}
                        >
                          {membre.active ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="personnel-footnote">
        <Mail size={14} /> Les invitations sont envoyées par e-mail.
        Les membres doivent utiliser le lien reçu pour activer leur accès.
      </p>
    </div>
  )
}
