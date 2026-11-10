
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Power
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './GestionAcademique.css'

const emptyFormation = {
  nom: '',
  code: '',
  description: '',
  duree_semestres: 4,
  active: true
}

const emptyMatiere = {
  nom: '',
  code: '',
  description: '',
  coefficient: 1
}

export default function GestionAcademique({ session, onBack }) {
  const [formations, setFormations] = useState([])
  const [semestres, setSemestres] = useState([])
  const [matieres, setMatieres] = useState([])

  const [formationSelectionnee, setFormationSelectionnee] = useState('')
  const [semestreSelectionne, setSemestreSelectionne] = useState('')

  const [onglet, setOnglet] = useState('formations')
  const [chargement, setChargement] = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')

  const [modalFormation, setModalFormation] = useState(false)
  const [modalMatiere, setModalMatiere] = useState(false)

  const [formationEnEdition, setFormationEnEdition] = useState(null)
  const [matiereEnEdition, setMatiereEnEdition] = useState(null)

  const [formFormation, setFormFormation] = useState(emptyFormation)
  const [formMatiere, setFormMatiere] = useState(emptyMatiere)

  const role = session?.role

  // Autorisations générales du module
  const autorise =
    role === 'directeur' ||
    role === 'directeur_academique' ||
    role === 'responsable_pedagogique'

  // Seuls ces rôles peuvent supprimer une matière
  const peutSupprimerMatiere =
    role === 'directeur' ||
    role === 'responsable_pedagogique'

  // Seuls ces rôles peuvent activer/désactiver une formation
  const peutChangerStatutFormation =
    role === 'directeur' ||
    role === 'responsable_pedagogique'

  // Formation actuellement sélectionnée
  const formationCourante = formations.find(
    formation => formation.id === formationSelectionnee
  ) || null

  // Semestres de la formation sélectionnée
  const semestresFormation = useMemo(
    () =>
      semestres
        .filter(
          semestre => semestre.formation_id === formationSelectionnee
        )
        .sort((a, b) => a.numero - b.numero),
    [semestres, formationSelectionnee]
  )

  // Semestre choisi ou premier semestre disponible
  const semestreCourant =
    semestresFormation.find(
      semestre => semestre.id === semestreSelectionne
    ) || semestresFormation[0] || null

  // Matières du semestre courant
  const matieresSemestre = useMemo(
    () =>
      matieres
        .filter(
          matiere => matiere.semestre_id === semestreCourant?.id
        )
        .sort((a, b) => a.nom.localeCompare(b.nom)),
    [matieres, semestreCourant?.id]
  )

  // Chargement des données
  async function chargerDonnees() {
    setChargement(true)
    setErreur('')

    const [
      resultatFormations,
      resultatSemestres,
      resultatMatieres
    ] = await Promise.all([
      supabase.from('formations').select('*').order('nom'),
      supabase.from('semestres').select('*').order('numero'),
      supabase.from('matieres').select('*').order('nom')
    ])

    if (resultatFormations.error) {
      setErreur(`Formations : ${resultatFormations.error.message}`)
      setChargement(false)
      return false
    }

    if (resultatSemestres.error) {
      setErreur(`Semestres : ${resultatSemestres.error.message}`)
      setChargement(false)
      return false
    }

    if (resultatMatieres.error) {
      setErreur(`Matières : ${resultatMatieres.error.message}`)
      setChargement(false)
      return false
    }

    const nouvellesFormations = resultatFormations.data || []
    const nouveauxSemestres = resultatSemestres.data || []
    const nouvellesMatieres = resultatMatieres.data || []

    setFormations(nouvellesFormations)
    setSemestres(nouveauxSemestres)
    setMatieres(nouvellesMatieres)

    setFormationSelectionnee(previous =>
      nouvellesFormations.some(
        formation => formation.id === previous
      )
        ? previous
        : ''
    )

    setSemestreSelectionne(previous =>
      nouveauxSemestres.some(
        semestre =>
          semestre.id === previous &&
          semestre.formation_id === formationSelectionnee
      )
        ? previous
        : ''
    )

    setChargement(false)
    return true
  }

  // Chargement initial
  useEffect(() => {
    let actif = true

    async function initialiser() {
      const [
        resultatFormations,
        resultatSemestres,
        resultatMatieres
      ] = await Promise.all([
        supabase.from('formations').select('*').order('nom'),
        supabase.from('semestres').select('*').order('numero'),
        supabase.from('matieres').select('*').order('nom')
      ])

      if (!actif) return

      if (
        resultatFormations.error ||
        resultatSemestres.error ||
        resultatMatieres.error
      ) {
        setErreur(
          resultatFormations.error?.message ||
          resultatSemestres.error?.message ||
          resultatMatieres.error?.message ||
          'Impossible de charger les données.'
        )

        setChargement(false)
        return
      }

      setFormations(resultatFormations.data || [])
      setSemestres(resultatSemestres.data || [])
      setMatieres(resultatMatieres.data || [])
      setChargement(false)
    }

    initialiser()

    return () => {
      actif = false
    }
  }, [])

  function afficherMessage(texte) {
    setMessage(texte)
    setTimeout(() => setMessage(''), 3500)
  }

  // Changer de formation
  function changerFormation(id) {
    setFormationSelectionnee(id)
    setSemestreSelectionne('')
  }

  // FORMATIONS
  function ouvrirNouvelleFormation() {
    setErreur('')
    setFormationEnEdition(null)
    setFormFormation({ ...emptyFormation })
    setModalFormation(true)
  }

  function ouvrirModificationFormation(formation) {
    setErreur('')
    setFormationEnEdition(formation)

    setFormFormation({
      nom: formation.nom || '',
      code: formation.code || '',
      description: formation.description || '',
      duree_semestres: formation.duree_semestres || 4,
      active: formation.active
    })

    setModalFormation(true)
  }

  async function enregistrerFormation(event) {
    event.preventDefault()
    setErreur('')

    if (!autorise) {
      setErreur('Tu ne disposes pas des permissions nécessaires.')
      return
    }

    if (!formFormation.nom.trim()) {
      setErreur('Le nom de la formation est obligatoire.')
      return
    }

    // Le directeur académique ne peut pas changer le statut
    if (
      !peutChangerStatutFormation &&
      formationEnEdition &&
      formFormation.active !== formationEnEdition.active
    ) {
      setErreur('Tu ne peux pas modifier le statut de cette formation.')
      return
    }

    const donnees = {
      nom: formFormation.nom.trim(),
      code: formFormation.code.trim() || null,
      description: formFormation.description.trim() || null,
      duree_semestres: Number(formFormation.duree_semestres),
      active: peutChangerStatutFormation
        ? formFormation.active
        : formationEnEdition
          ? formationEnEdition.active
          : true
    }

    setEnregistrement(true)

    const resultat = formationEnEdition
      ? await supabase
          .from('formations')
          .update(donnees)
          .eq('id', formationEnEdition.id)
      : await supabase
          .from('formations')
          .insert(donnees)

    setEnregistrement(false)

    if (resultat.error) {
      setErreur(resultat.error.message)
      return
    }

    const formationModifiee = Boolean(formationEnEdition)

    setModalFormation(false)
    await chargerDonnees()

    afficherMessage(
      formationModifiee
        ? 'Formation modifiée avec succès.'
        : 'Formation créée avec succès.'
    )
  }

  // Création des semestres manquants
  async function creerSemestres(formation) {
    if (!autorise) {
      setErreur('Accès non autorisé.')
      return
    }

    if (!formation) {
      setErreur('Aucune formation sélectionnée.')
      return
    }

    setErreur('')

    const existants = semestres.filter(
      semestre => semestre.formation_id === formation.id
    )

    const numerosExistants = existants.map(item => item.numero)
    const aCreer = []

    for (
      let numero = 1;
      numero <= formation.duree_semestres;
      numero++
    ) {
      if (!numerosExistants.includes(numero)) {
        aCreer.push({
          formation_id: formation.id,
          numero,
          nom: `Semestre ${numero}`
        })
      }
    }

    if (aCreer.length === 0) {
      afficherMessage('Les semestres de cette formation existent déjà.')
      return
    }

    setEnregistrement(true)

    const { error: insertError } = await supabase
      .from('semestres')
      .insert(aCreer)

    setEnregistrement(false)

    if (insertError) {
      setErreur(insertError.message)
      return
    }

    setFormationSelectionnee(formation.id)
    setSemestreSelectionne('')
    setOnglet('semestres')

    await chargerDonnees()

    afficherMessage(`${aCreer.length} semestre(s) créé(s).`)
  }

  // Activer ou désactiver une formation
  async function basculerFormation(formation) {
    if (!peutChangerStatutFormation) {
      setErreur('Tu ne peux pas modifier le statut d’une formation.')
      return
    }

    setErreur('')
    setEnregistrement(true)

    const { error: updateError } = await supabase
      .from('formations')
      .update({ active: !formation.active })
      .eq('id', formation.id)

    setEnregistrement(false)

    if (updateError) {
      setErreur(updateError.message)
      return
    }

    await chargerDonnees()

    afficherMessage(
      formation.active
        ? 'Formation désactivée.'
        : 'Formation activée.'
    )
  }

  // MATIÈRES
  function ouvrirNouvelleMatiere() {
    if (!autorise) return

    if (!semestreCourant) {
      setErreur('Sélectionne d’abord une formation et un semestre.')
      return
    }

    setErreur('')
    setMatiereEnEdition(null)
    setFormMatiere({ ...emptyMatiere })
    setModalMatiere(true)
  }

  function ouvrirModificationMatiere(matiere) {
    if (!autorise) return

    setErreur('')
    setMatiereEnEdition(matiere)

    setFormMatiere({
      nom: matiere.nom || '',
      code: matiere.code || '',
      description: matiere.description || '',
      coefficient: matiere.coefficient ?? 1
    })

    setModalMatiere(true)
  }

  async function enregistrerMatiere(event) {
    event.preventDefault()
    setErreur('')

    if (!autorise) {
      setErreur('Accès non autorisé.')
      return
    }

    if (!semestreCourant) {
      setErreur('Sélectionne d’abord un semestre.')
      return
    }

    if (!formMatiere.nom.trim()) {
      setErreur('Le nom de la matière est obligatoire.')
      return
    }

    const coefficient = Number(formMatiere.coefficient)

    if (!Number.isFinite(coefficient) || coefficient <= 0) {
      setErreur('Le coefficient doit être un nombre supérieur à zéro.')
      return
    }

    const donnees = {
      semestre_id: semestreCourant.id,
      nom: formMatiere.nom.trim(),
      code: formMatiere.code.trim() || null,
      description: formMatiere.description.trim() || null,
      coefficient
    }

    setEnregistrement(true)

    const resultat = matiereEnEdition
      ? await supabase
          .from('matieres')
          .update(donnees)
          .eq('id', matiereEnEdition.id)
      : await supabase
          .from('matieres')
          .insert(donnees)

    setEnregistrement(false)

    if (resultat.error) {
      setErreur(resultat.error.message)
      return
    }

    const modification = Boolean(matiereEnEdition)

    setModalMatiere(false)
    await chargerDonnees()

    afficherMessage(
      modification
        ? 'Matière modifiée avec succès.'
        : 'Matière ajoutée avec succès.'
    )
  }

  // Suppression d'une matière
  async function supprimerMatiere(matiere) {
    if (!peutSupprimerMatiere) {
      setErreur('Tu ne disposes pas du droit de supprimer une matière.')
      return
    }

    const confirmer = window.confirm(
      `Supprimer la matière « ${matiere.nom} » ?`
    )

    if (!confirmer) return

    setErreur('')
    setEnregistrement(true)

    const { error: deleteError } = await supabase
      .from('matieres')
      .delete()
      .eq('id', matiere.id)

    setEnregistrement(false)

    if (deleteError) {
      setErreur(deleteError.message)
      return
    }

    await chargerDonnees()
    afficherMessage('Matière supprimée.')
  }

  // Vérification des permissions
  if (!autorise) {
    return (
      <div className="ga-page">
        <div className="ga-denied">
          <BookOpen size={42} />
          <h2>Accès non autorisé</h2>
          <p>
            Tu ne disposes pas des permissions nécessaires pour ce module.
          </p>

          <button
            className="ga-btn ga-btn-secondary"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ga-page">
      <header className="ga-header">
        <div>
          <div className="ga-breadcrumb">
            INTELA / ESPACE ADMINISTRATIF / GESTION ACADÉMIQUE
          </div>

          <h1>Gestion académique</h1>
          <p>
            Organisation des formations, semestres et matières.
          </p>
        </div>

        <button
          className="ga-btn ga-btn-secondary"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Retour
        </button>
      </header>

      {erreur && (
        <div className="ga-alert ga-alert-error">
          {erreur}
          <button
            onClick={() => setErreur('')}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {message && (
        <div className="ga-alert ga-alert-success">
          {message}
        </div>
      )}

      {/* STATISTIQUES */}
      <section className="ga-stats">
        <div className="ga-stat-card">
          <div className="ga-stat-icon">
            <GraduationCap />
          </div>
          <div>
            <span>Formations</span>
            <strong>{formations.length}</strong>
          </div>
        </div>

        <div className="ga-stat-card">
          <div className="ga-stat-icon">
            <Layers />
          </div>
          <div>
            <span>Semestres</span>
            <strong>{semestres.length}</strong>
          </div>
        </div>

        <div className="ga-stat-card">
          <div className="ga-stat-icon">
            <BookOpen />
          </div>
          <div>
            <span>Matières</span>
            <strong>{matieres.length}</strong>
          </div>
        </div>
      </section>

      {/* ONGLETS */}
      <nav className="ga-tabs">
        <button
          className={onglet === 'formations' ? 'active' : ''}
          onClick={() => setOnglet('formations')}
        >
          <GraduationCap size={17} />
          Formations
        </button>

        <button
          className={onglet === 'semestres' ? 'active' : ''}
          onClick={() => setOnglet('semestres')}
        >
          <Layers size={17} />
          Semestres
        </button>

        <button
          className={onglet === 'matieres' ? 'active' : ''}
          onClick={() => setOnglet('matieres')}
        >
          <BookOpen size={17} />
          Matières
        </button>
      </nav>

      {chargement ? (
        <div className="ga-loading">
          <RefreshCw className="ga-spin" size={22} />
          Chargement des données...
        </div>
      ) : (
        <>
          {/* FORMATIONS */}
          {onglet === 'formations' && (
            <section className="ga-panel">
              <div className="ga-panel-heading">
                <div>
                  <h2>Les formations</h2>
                  <p>
                    Gère les programmes proposés par INTELA.
                  </p>
                </div>

                <button
                  className="ga-btn ga-btn-primary"
                  onClick={ouvrirNouvelleFormation}
                >
                  <Plus size={17} />
                  Nouvelle formation
                </button>
              </div>

              {formations.length === 0 ? (
                <div className="ga-empty">
                  <GraduationCap size={34} />
                  <p>Aucune formation enregistrée.</p>
                </div>
              ) : (
                <div className="ga-table-wrap">
                  <table className="ga-table">
                    <thead>
                      <tr>
                        <th>Formation</th>
                        <th>Code</th>
                        <th>Durée</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {formations.map(formation => (
                        <tr key={formation.id}>
                          <td>
                            <strong>{formation.nom}</strong>
                            <small>
                              {formation.description || 'Aucune description'}
                            </small>
                          </td>

                          <td>{formation.code || '—'}</td>

                          <td>
                            {formation.duree_semestres} semestres
                          </td>

                          <td>
                            <span
                              className={`ga-status ${
                                formation.active
                                  ? 'is-active'
                                  : 'is-inactive'
                              }`}
                            >
                              {formation.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td>
                            <div className="ga-actions">
                              <button
                                className="ga-icon-btn"
                                title="Modifier"
                                disabled={enregistrement}
                                onClick={() =>
                                  ouvrirModificationFormation(formation)
                                }
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                className="ga-icon-btn"
                                title="Créer les semestres manquants"
                                disabled={enregistrement}
                                onClick={() => creerSemestres(formation)}
                              >
                                <Layers size={16} />
                              </button>

                              {peutChangerStatutFormation && (
                                <button
                                  className="ga-icon-btn"
                                  title={
                                    formation.active
                                      ? 'Désactiver'
                                      : 'Activer'
                                  }
                                  disabled={enregistrement}
                                  onClick={() => basculerFormation(formation)}
                                >
                                  <Power size={16} />
                                </button>
                              )}

                              <button
                                className="ga-text-action"
                                onClick={() => {
                                  changerFormation(formation.id)
                                  setOnglet('semestres')
                                }}
                              >
                                Ouvrir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* SEMESTRES */}
          {onglet === 'semestres' && (
            <section className="ga-panel">
              <div className="ga-panel-heading">
                <div>
                  <h2>Organisation des semestres</h2>
                  <p>
                    Consulte les semestres de chaque formation.
                  </p>
                </div>
              </div>

              <div className="ga-field ga-select-field">
                <label>Choisir une formation</label>

                <select
                  value={formationSelectionnee}
                  onChange={event =>
                    changerFormation(event.target.value)
                  }
                >
                  <option value="">
                    Sélectionner une formation
                  </option>

                  {formations.map(formation => (
                    <option
                      key={formation.id}
                      value={formation.id}
                    >
                      {formation.nom}
                      {formation.active ? '' : ' (Inactive)'}
                    </option>
                  ))}
                </select>
              </div>

              {!formationSelectionnee ? (
                <div className="ga-empty">
                  <Layers size={34} />
                  <p>
                    Sélectionne une formation pour afficher ses semestres.
                  </p>
                </div>
              ) : semestresFormation.length === 0 ? (
                <div className="ga-empty">
                  <Layers size={34} />
                  <p>
                    Aucun semestre créé pour cette formation.
                  </p>

                  <button
                    className="ga-btn ga-btn-primary"
                    disabled={enregistrement}
                    onClick={() => creerSemestres(formationCourante)}
                  >
                    <Plus size={17} />
                    Créer les semestres
                  </button>
                </div>
              ) : (
                <div className="ga-semester-grid">
                  {semestresFormation.map(semestre => (
                    <button
                      key={semestre.id}
                      className={`ga-semester-card ${
                        semestreCourant?.id === semestre.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => {
                        setSemestreSelectionne(semestre.id)
                        setOnglet('matieres')
                      }}
                    >
                      <span>SEMESTRE {semestre.numero}</span>
                      <strong>{semestre.nom}</strong>
                      <small>
                        {
                          matieres.filter(
                            item => item.semestre_id === semestre.id
                          ).length
                        } matière(s)
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MATIERES */}
          {onglet === 'matieres' && (
            <section className="ga-panel">
              <div className="ga-panel-heading">
                <div>
                  <h2>Gestion des matières</h2>
                  <p>
                    Ajoute et organise les matières par semestre.
                  </p>
                </div>

                <button
                  className="ga-btn ga-btn-primary"
                  onClick={ouvrirNouvelleMatiere}
                  disabled={!semestreCourant || enregistrement}
                >
                  <Plus size={17} />
                  Nouvelle matière
                </button>
              </div>

              <div className="ga-selectors">
                <div className="ga-field">
                  <label>Formation</label>

                  <select
                    value={formationSelectionnee}
                    onChange={event =>
                      changerFormation(event.target.value)
                    }
                  >
                    <option value="">
                      Sélectionner une formation
                    </option>

                    {formations.map(formation => (
                      <option
                        key={formation.id}
                        value={formation.id}
                      >
                        {formation.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ga-field">
                  <label>Semestre</label>

                  <select
                    value={semestreCourant?.id || ''}
                    onChange={event =>
                      setSemestreSelectionne(event.target.value)
                    }
                    disabled={!formationSelectionnee}
                  >
                    <option value="">
                      Sélectionner un semestre
                    </option>

                    {semestresFormation.map(semestre => (
                      <option
                        key={semestre.id}
                        value={semestre.id}
                      >
                        {semestre.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!semestreCourant ? (
                <div className="ga-empty">
                  <BookOpen size={34} />
                  <p>
                    Sélectionne une formation et un semestre.
                  </p>
                </div>
              ) : matieresSemestre.length === 0 ? (
                <div className="ga-empty">
                  <BookOpen size={34} />
                  <p>
                    Aucune matière dans ce semestre.
                  </p>
                  <p>
                    Utilise le bouton « Nouvelle matière » pour commencer.
                  </p>
                </div>
              ) : (
                <div className="ga-table-wrap">
                  <table className="ga-table">
                    <thead>
                      <tr>
                        <th>Matière</th>
                        <th>Code</th>
                        <th>Coefficient</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {matieresSemestre.map(matiere => (
                        <tr key={matiere.id}>
                          <td>
                            <strong>{matiere.nom}</strong>
                            <small>
                              {matiere.description || 'Aucune description'}
                            </small>
                          </td>

                          <td>{matiere.code || '—'}</td>
                          <td>{matiere.coefficient}</td>

                          <td>
                            <div className="ga-actions">
                              <button
                                className="ga-icon-btn"
                                title="Modifier"
                                disabled={enregistrement}
                                onClick={() =>
                                  ouvrirModificationMatiere(matiere)
                                }
                              >
                                <Pencil size={16} />
                              </button>

                              {peutSupprimerMatiere && (
                                <button
                                  className="ga-icon-btn danger"
                                  title="Supprimer"
                                  disabled={enregistrement}
                                  onClick={() => supprimerMatiere(matiere)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* MODALE FORMATION */}
      {modalFormation && (
        <div
          className="ga-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setModalFormation(false)
            }
          }}
        >
          <form
            className="ga-modal"
            onSubmit={enregistrerFormation}
          >
            <div className="ga-modal-heading">
              <div>
                <h2>
                  {formationEnEdition
                    ? 'Modifier la formation'
                    : 'Nouvelle formation'}
                </h2>
                <p>
                  Renseigne les informations du programme.
                </p>
              </div>

              <button
                type="button"
                className="ga-icon-btn"
                onClick={() => setModalFormation(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="ga-field">
              <label>Nom de la formation *</label>
              <input
                value={formFormation.nom}
                onChange={event =>
                  setFormFormation({
                    ...formFormation,
                    nom: event.target.value
                  })
                }
                placeholder="Ex. Informatique"
                required
              />
            </div>

            <div className="ga-form-row">
              <div className="ga-field">
                <label>Code</label>
                <input
                  value={formFormation.code}
                  onChange={event =>
                    setFormFormation({
                      ...formFormation,
                      code: event.target.value.toUpperCase()
                    })
                  }
                  placeholder="Ex. INFO"
                />
              </div>

              <div className="ga-field">
                <label>Nombre de semestres</label>
                <select
                  value={formFormation.duree_semestres}
                  onChange={event =>
                    setFormFormation({
                      ...formFormation,
                      duree_semestres: Number(event.target.value)
                    })
                  }
                >
                  {[1, 2, 3, 4].map(nombre => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ga-field">
              <label>Description</label>
              <textarea
                rows="3"
                value={formFormation.description}
                onChange={event =>
                  setFormFormation({
                    ...formFormation,
                    description: event.target.value
                  })
                }
                placeholder="Description de la formation..."
              />
            </div>

            {peutChangerStatutFormation && (
              <label className="ga-checkbox">
                <input
                  type="checkbox"
                  checked={formFormation.active}
                  onChange={event =>
                    setFormFormation({
                      ...formFormation,
                      active: event.target.checked
                    })
                  }
                />
                Formation active
              </label>
            )}

            {!peutChangerStatutFormation && (
              <p className="ga-description">
                Le statut de la formation est géré par la direction.
              </p>
            )}

            <div className="ga-modal-actions">
              <button
                type="button"
                className="ga-btn ga-btn-secondary"
                onClick={() => setModalFormation(false)}
                disabled={enregistrement}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="ga-btn ga-btn-primary"
                disabled={enregistrement}
              >
                <Save size={17} />
                {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODALE MATIERE */}
      {modalMatiere && (
        <div
          className="ga-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setModalMatiere(false)
            }
          }}
        >
          <form
            className="ga-modal"
            onSubmit={enregistrerMatiere}
          >
            <div className="ga-modal-heading">
              <div>
                <h2>
                  {matiereEnEdition
                    ? 'Modifier la matière'
                    : 'Nouvelle matière'}
                </h2>
                <p>
                  {formationCourante?.nom} — {semestreCourant?.nom}
                </p>
              </div>

              <button
                type="button"
                className="ga-icon-btn"
                onClick={() => setModalMatiere(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="ga-field">
              <label>Nom de la matière *</label>
              <input
                value={formMatiere.nom}
                onChange={event =>
                  setFormMatiere({
                    ...formMatiere,
                    nom: event.target.value
                  })
                }
                placeholder="Ex. Algorithmique"
                required
              />
            </div>

            <div className="ga-form-row">
              <div className="ga-field">
                <label>Code</label>
                <input
                  value={formMatiere.code}
                  onChange={event =>
                    setFormMatiere({
                      ...formMatiere,
                      code: event.target.value.toUpperCase()
                    })
                  }
                  placeholder="Ex. INFO101"
                />
              </div>

              <div className="ga-field">
                <label>Coefficient</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formMatiere.coefficient}
                  onChange={event =>
                    setFormMatiere({
                      ...formMatiere,
                      coefficient: event.target.value
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="ga-field">
              <label>Description</label>
              <textarea
                rows="3"
                value={formMatiere.description}
                onChange={event =>
                  setFormMatiere({
                    ...formMatiere,
                    description: event.target.value
                  })
                }
                placeholder="Description de la matière..."
              />
            </div>

            <div className="ga-modal-actions">
              <button
                type="button"
                className="ga-btn ga-btn-secondary"
                onClick={() => setModalMatiere(false)}
                disabled={enregistrement}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="ga-btn ga-btn-primary"
                disabled={enregistrement || !semestreCourant}
              >
                <Save size={17} />
                {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
