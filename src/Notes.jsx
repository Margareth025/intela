
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle,
  ClipboardList,
  RefreshCw,
  Save,
  Search,
  Eye,
} from 'lucide-react'
import { supabase } from './lib/supabase'

export default function Notes({ session, onBack }) {
  const [formations, setFormations] = useState([])
  const [semestres, setSemestres] = useState([])
  const [matieres, setMatieres] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [etudiants, setEtudiants] = useState([])
  const [notes, setNotes] = useState([])

  const [formationId, setFormationId] = useState('')
  const [semestreId, setSemestreId] = useState('')
  const [matiereId, setMatiereId] = useState('')
  const [typeEvaluation, setTypeEvaluation] = useState('Examen')
  const [recherche, setRecherche] = useState('')

  const [saisies, setSaisies] = useState({})
  const [chargement, setChargement] = useState(true)
  const [chargementNotes, setChargementNotes] = useState(false)
  const [enregistrement, setEnregistrement] = useState('')
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  // Gestion des autorisations selon le rôle
  const roleAutorise = [
    'directeur',
    'directeur_academique',
    'responsable_pedagogique',
  ].includes(session?.role)

  const lectureSeule = session?.role === 'directeur_academique'

  // Chargement des données académiques
  useEffect(() => {
    let actif = true

    async function chargerDonnees() {
      setChargement(true)
      setErreur('')

      const [
        formationsResult,
        semestresResult,
        matieresResult,
        inscriptionsResult,
        etudiantsResult,
      ] = await Promise.all([
        supabase
          .from('formations')
          .select('id, nom, active')
          .eq('active', true)
          .order('nom'),

        supabase
          .from('semestres')
          .select('id, formation_id, numero, nom')
          .order('numero'),

        supabase
          .from('matieres')
          .select('id, semestre_id, nom, code, coefficient')
          .order('nom'),

        supabase
          .from('inscriptions')
          .select('id, etudiant_id, formation_id, annee_academique, statut'),

        supabase
          .from('etudiants')
          .select('id, matricule, nom, prenom, statut')
          .order('nom'),
      ])

      if (!actif) return

      const resultats = [
        formationsResult,
        semestresResult,
        matieresResult,
        inscriptionsResult,
        etudiantsResult,
      ]

      const probleme = resultats.find((resultat) => resultat.error)

      if (probleme) {
        setErreur(probleme.error.message)
        setChargement(false)
        return
      }

      const formationsChargees = formationsResult.data || []

      setFormations(formationsChargees)
      setSemestres(semestresResult.data || [])
      setMatieres(matieresResult.data || [])
      setInscriptions(inscriptionsResult.data || [])
      setEtudiants(etudiantsResult.data || [])

      if (formationsChargees.length) {
        setFormationId(formationsChargees[0].id)
      }

      setChargement(false)
    }

    chargerDonnees()

    return () => {
      actif = false
    }
  }, [])

  // Semestres de la formation sélectionnée
  const semestresFormation = useMemo(
    () => semestres.filter((s) => s.formation_id === formationId),
    [semestres, formationId]
  )

  const semestreIdEffectif = semestresFormation.some(
    (s) => s.id === semestreId
  )
    ? semestreId
    : semestresFormation[0]?.id || ''

  const semestreCourant = semestresFormation.find(
    (s) => s.id === semestreIdEffectif
  )

  // Matières du semestre sélectionné
  const matieresSemestre = useMemo(
    () => matieres.filter((m) => m.semestre_id === semestreIdEffectif),
    [matieres, semestreIdEffectif]
  )

  const matiereIdEffectif = matieresSemestre.some(
    (m) => m.id === matiereId
  )
    ? matiereId
    : matieresSemestre[0]?.id || ''

  const matiereCourante = matieresSemestre.find(
    (m) => m.id === matiereIdEffectif
  )

  // Étudiants inscrits dans la formation sélectionnée
  const etudiantsInscrits = useMemo(() => {
    return inscriptions
      .filter(
        (inscription) =>
          inscription.formation_id === formationId &&
          inscription.statut !== 'refusee'
      )
      .map((inscription) => {
        const etudiant = etudiants.find(
          (e) => e.id === inscription.etudiant_id
        )

        if (!etudiant) return null

        return {
          ...etudiant,
          inscription_id: inscription.id,
          annee_academique: inscription.annee_academique,
        }
      })
      .filter(Boolean)
      .filter((e) => e.statut === 'actif')
      .sort((a, b) => a.nom.localeCompare(b.nom))
  }, [inscriptions, etudiants, formationId])

  const idsInscriptions = useMemo(
    () => etudiantsInscrits.map((e) => e.inscription_id),
    [etudiantsInscrits]
  )

  const idsMatieres = useMemo(
    () => matieresSemestre.map((m) => m.id),
    [matieresSemestre]
  )

  // Chargement des notes du semestre
  useEffect(() => {
    let actif = true

    async function chargerNotes() {
      if (!idsInscriptions.length || !idsMatieres.length) {
        setNotes([])
        setChargementNotes(false)
        return
      }

      setChargementNotes(true)
      setErreur('')

      const { data, error } = await supabase
        .from('notes')
        .select(
          'id, inscription_id, matiere_id, type_evaluation, note_obtenue, note_maximale, commentaire, saisi_par, created_at'
        )
        .in('inscription_id', idsInscriptions)
        .in('matiere_id', idsMatieres)
        .order('created_at', { ascending: false })

      if (!actif) return

      if (error) {
        setErreur(error.message)
        setNotes([])
      } else {
        setNotes(data || [])
      }

      setChargementNotes(false)
    }

    chargerNotes()

    return () => {
      actif = false
    }
  }, [idsInscriptions, idsMatieres])

  // Types d'évaluation déjà utilisés
  const typesExistants = useMemo(() => {
    return [
      ...new Set(
        notes
          .filter((n) => n.matiere_id === matiereIdEffectif)
          .map((n) => n.type_evaluation)
          .filter(Boolean)
      ),
    ]
  }, [notes, matiereIdEffectif])

  // Retrouver la note existante pour chaque étudiant
  const notesEvaluation = useMemo(() => {
    const resultat = {}

    notes
      .filter(
        (n) =>
          n.matiere_id === matiereIdEffectif &&
          n.type_evaluation === typeEvaluation
      )
      .forEach((note) => {
        if (!resultat[note.inscription_id]) {
          resultat[note.inscription_id] = note
        }
      })

    return resultat
  }, [notes, matiereIdEffectif, typeEvaluation])

  // Modification des champs de saisie
  function modifierSaisie(inscriptionId, champ, valeur) {
    if (lectureSeule) return

    setSaisies((precedent) => ({
      ...precedent,
      [inscriptionId]: {
        ...precedent[inscriptionId],
        [champ]: valeur,
      },
    }))

    setSucces('')
    setErreur('')
  }

  // Valeurs affichées : saisie en cours ou note existante
  function obtenirSaisie(etudiant) {
    const inscriptionId = etudiant.inscription_id
    const note = notesEvaluation[inscriptionId]
    const saisie = saisies[inscriptionId] || {}

    return {
      note_obtenue:
        saisie.note_obtenue ??
        (note ? String(note.note_obtenue) : ''),

      note_maximale:
        saisie.note_maximale ??
        (note ? String(note.note_maximale) : '100'),

      commentaire:
        saisie.commentaire ??
        note?.commentaire ??
        '',
    }
  }

  // Moyenne pondérée du semestre
  function calculerMoyenne(inscriptionId) {
    let totalPondere = 0
    let totalCoefficients = 0

    matieresSemestre.forEach((matiere) => {
      const notesMatiere = notes.filter(
        (n) =>
          n.inscription_id === inscriptionId &&
          n.matiere_id === matiere.id &&
          Number(n.note_maximale) > 0
      )

      if (!notesMatiere.length) return

      const sommePourcentages = notesMatiere.reduce(
        (total, note) =>
          total +
          (Number(note.note_obtenue) / Number(note.note_maximale)) * 100,
        0
      )

      const moyenneMatiere =
        sommePourcentages / notesMatiere.length

      const coefficient = Number(matiere.coefficient) || 1

      totalPondere += moyenneMatiere * coefficient
      totalCoefficients += coefficient
    })

    if (!totalCoefficients) return null

    return totalPondere / totalCoefficients
  }

  // Enregistrement ou modification d'une note
  async function enregistrerNote(etudiant) {
    // Protection supplémentaire côté interface
    if (lectureSeule) {
      setErreur('Vous disposez uniquement du droit de consultation.')
      return
    }

    if (!['directeur', 'responsable_pedagogique'].includes(session?.role)) {
      setErreur('Vous ne disposez pas des droits nécessaires.')
      return
    }

    setErreur('')
    setSucces('')

    const inscriptionId = etudiant.inscription_id
    const saisie = obtenirSaisie(etudiant)
    const noteExistante = notesEvaluation[inscriptionId]

    if (!matiereIdEffectif || !typeEvaluation.trim()) {
      setErreur(
        'Sélectionnez une matière et indiquez le type d’évaluation.'
      )
      return
    }

    if (saisie.note_obtenue.trim() === '') {
      setErreur(
        `Veuillez saisir la note de ${etudiant.prenom} ${etudiant.nom}.`
      )
      return
    }

    const obtenue = Number(saisie.note_obtenue)
    const maximale = Number(saisie.note_maximale)

    if (
      !Number.isFinite(obtenue) ||
      !Number.isFinite(maximale) ||
      maximale <= 0 ||
      obtenue < 0 ||
      obtenue > maximale
    ) {
      setErreur(
        'La note doit être comprise entre 0 et la note maximale.'
      )
      return
    }

    setEnregistrement(inscriptionId)

    const donnees = {
      inscription_id: inscriptionId,
      matiere_id: matiereIdEffectif,
      type_evaluation: typeEvaluation.trim(),
      note_obtenue: obtenue,
      note_maximale: maximale,
      commentaire: saisie.commentaire.trim() || null,
      saisi_par: session?.user?.id || null,
    }

    try {
      let resultat

      if (noteExistante) {
        resultat = await supabase
          .from('notes')
          .update(donnees)
          .eq('id', noteExistante.id)
          .select()
          .single()
      } else {
        resultat = await supabase
          .from('notes')
          .insert(donnees)
          .select()
          .single()
      }

      if (resultat.error) {
        setErreur(resultat.error.message)
      } else {
        setNotes((precedent) => {
          const sansAncienne = precedent.filter(
            (n) => n.id !== resultat.data.id
          )

          return [resultat.data, ...sansAncienne]
        })

        setSaisies((precedent) => ({
          ...precedent,
          [inscriptionId]: {
            note_obtenue: String(resultat.data.note_obtenue),
            note_maximale: String(resultat.data.note_maximale),
            commentaire: resultat.data.commentaire || '',
          },
        }))

        setSucces(
          `Note enregistrée pour ${etudiant.prenom} ${etudiant.nom}.`
        )
      }
    } catch (error) {
      setErreur(error.message || 'Une erreur est survenue.')
    } finally {
      setEnregistrement('')
    }
  }

  // Recherche d'étudiants
  const etudiantsFiltres = etudiantsInscrits.filter((e) => {
    const texte = recherche.toLowerCase()

    return (
      (e.nom || '').toLowerCase().includes(texte) ||
      (e.prenom || '').toLowerCase().includes(texte) ||
      (e.matricule || '').toLowerCase().includes(texte)
    )
  })

  if (!roleAutorise) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-[#172A46]">
          Accès non autorisé
        </h2>

        <p className="mt-2 text-[#647083]">
          Vous ne disposez pas des droits nécessaires pour consulter les notes.
        </p>

        <button
          onClick={onBack}
          className="mt-5 rounded-lg bg-[#172A46] px-5 py-2 text-white"
        >
          Retour
        </button>
      </div>
    )
  }

  if (chargement) {
    return (
      <div className="flex items-center justify-center gap-3 p-12 text-[#647083]">
        <RefreshCw className="animate-spin" size={20} />
        Chargement des données académiques...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-2 text-sm text-[#647083] hover:text-[#172A46]"
          >
            <ArrowLeft size={17} />
            Retour au tableau de bord
          </button>

          <h1 className="text-2xl font-bold text-[#172A46]">
            {lectureSeule ? 'Consultation des notes' : 'Gestion des notes'}
          </h1>

          <p className="mt-1 text-sm text-[#647083]">
            {lectureSeule
              ? 'Consultation des résultats et suivi des performances académiques.'
              : 'Saisie, modification et suivi des résultats académiques.'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#F5F0EB] px-4 py-3 text-sm text-[#172A46]">
          {lectureSeule ? <Eye size={20} /> : <ClipboardList size={20} />}
          {etudiantsInscrits.length} étudiant(s)
        </div>
      </div>

      {/* Indication lecture seule */}
      {lectureSeule && (
        <div className="flex items-center gap-3 rounded-xl border border-[#E8E1DC] bg-[#F5F0EB] p-4">
          <Eye className="text-[#172A46]" size={20} />

          <div>
            <p className="font-semibold text-[#172A46]">
              Mode consultation
            </p>

            <p className="text-sm text-[#647083]">
              Vous pouvez consulter les résultats académiques, mais vous ne
              pouvez ni saisir, ni modifier, ni supprimer les notes.
            </p>
          </div>
        </div>
      )}

      {/* Sélections académiques */}
      <div className="grid gap-4 rounded-xl border border-[#E8E1DC] bg-white p-5 shadow-sm md:grid-cols-3">

        <div>
          <label className="mb-2 block text-sm font-medium text-[#172A46]">
            Formation
          </label>

          <select
            value={formationId}
            onChange={(e) => {
              setFormationId(e.target.value)
              setSemestreId('')
              setMatiereId('')
              setSaisies({})
            }}
            className="w-full rounded-lg border border-[#D8DDE5] bg-white p-3 text-sm outline-none focus:border-[#C08081]"
          >
            <option value="">Choisir une formation</option>

            {formations.map((formation) => (
              <option key={formation.id} value={formation.id}>
                {formation.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#172A46]">
            Semestre
          </label>

          <select
            value={semestreIdEffectif}
            onChange={(e) => {
              setSemestreId(e.target.value)
              setMatiereId('')
              setSaisies({})
            }}
            className="w-full rounded-lg border border-[#D8DDE5] bg-white p-3 text-sm outline-none focus:border-[#C08081]"
          >
            <option value="">Choisir un semestre</option>

            {semestresFormation.map((semestre) => (
              <option key={semestre.id} value={semestre.id}>
                {semestre.nom || `Semestre ${semestre.numero}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#172A46]">
            Matière
          </label>

          <select
            value={matiereIdEffectif}
            onChange={(e) => {
              setMatiereId(e.target.value)
              setSaisies({})
            }}
            className="w-full rounded-lg border border-[#D8DDE5] bg-white p-3 text-sm outline-none focus:border-[#C08081]"
          >
            <option value="">Choisir une matière</option>

            {matieresSemestre.map((matiere) => (
              <option key={matiere.id} value={matiere.id}>
                {matiere.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type d'évaluation et recherche */}
      <div className="grid gap-4 rounded-xl border border-[#E8E1DC] bg-white p-5 shadow-sm md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium text-[#172A46]">
            Type d'évaluation
          </label>

          <input
            list="types-evaluation"
            value={typeEvaluation}
            onChange={(e) => {
              if (lectureSeule) return
              setTypeEvaluation(e.target.value)
              setSaisies({})
            }}
            disabled={lectureSeule}
            placeholder="Examen, devoir, TP..."
            className="w-full rounded-lg border border-[#D8DDE5] p-3 text-sm outline-none focus:border-[#C08081] disabled:cursor-not-allowed disabled:bg-[#F5F0EB] disabled:text-[#647083]"
          />

          <datalist id="types-evaluation">
            {typesExistants.map((type) => (
              <option key={type} value={type} />
            ))}

            <option value="Examen" />
            <option value="Devoir" />
            <option value="Travaux pratiques" />
            <option value="Projet" />
            <option value="Contrôle continu" />
          </datalist>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#172A46]">
            Rechercher un étudiant
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#647083]"
            />

            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Nom, prénom ou matricule..."
              className="w-full rounded-lg border border-[#D8DDE5] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#C08081]"
            />
          </div>
        </div>
      </div>

      {/* Informations sur la matière */}
      {matiereCourante && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F5F0EB] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-3 text-[#172A46]">
              <BookOpen size={22} />
            </div>

            <div>
              <p className="font-semibold text-[#172A46]">
                {matiereCourante.nom}
              </p>

              <p className="text-sm text-[#647083]">
                {semestreCourant?.nom ||
                  `Semestre ${semestreCourant?.numero}`}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-[#172A46]">
            Coefficient : {matiereCourante.coefficient}
          </p>
        </div>
      )}

      {/* Messages */}
      {erreur && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {succes && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle size={18} />
          {succes}
        </div>
      )}

      {/* Tableau des notes */}
      <div className="overflow-hidden rounded-xl border border-[#E8E1DC] bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E1DC] p-5">
          <div>
            <h2 className="font-semibold text-[#172A46]">
              {lectureSeule ? 'Résultats académiques' : 'Saisie des résultats'}
            </h2>

            <p className="mt-1 text-xs text-[#647083]">
              {lectureSeule
                ? 'Consultation des notes enregistrées.'
                : 'Les notes sont enregistrées individuellement.'}
            </p>
          </div>

          {chargementNotes && (
            <span className="flex items-center gap-2 text-xs text-[#647083]">
              <RefreshCw size={15} className="animate-spin" />
              Chargement des notes...
            </span>
          )}
        </div>

        {!formationId ? (
          <p className="p-8 text-center text-sm text-[#647083]">
            Sélectionnez une formation.
          </p>
        ) : !semestreIdEffectif ? (
          <p className="p-8 text-center text-sm text-[#647083]">
            Aucun semestre disponible pour cette formation.
          </p>
        ) : !matiereIdEffectif ? (
          <p className="p-8 text-center text-sm text-[#647083]">
            Aucune matière disponible pour ce semestre.
          </p>
        ) : !etudiantsFiltres.length ? (
          <p className="p-8 text-center text-sm text-[#647083]">
            Aucun étudiant inscrit dans cette formation.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">

              <thead className="bg-[#F5F0EB] text-[#172A46]">
                <tr>
                  <th className="px-4 py-3">Étudiant</th>
                  <th className="px-4 py-3">Note obtenue</th>
                  <th className="px-4 py-3">Note maximale</th>
                  <th className="px-4 py-3">Commentaire</th>
                  <th className="px-4 py-3">Moyenne semestre</th>
                  {!lectureSeule && (
                    <th className="px-4 py-3">Action</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E8E1DC]">
                {etudiantsFiltres.map((etudiant) => {
                  const saisie = obtenirSaisie(etudiant)
                  const moyenne = calculerMoyenne(etudiant.inscription_id)
                  const sauvegarde =
                    enregistrement === etudiant.inscription_id

                  return (
                    <tr key={etudiant.inscription_id}>

                      <td className="px-4 py-4">
                        <p className="font-medium text-[#172A46]">
                          {etudiant.prenom} {etudiant.nom}
                        </p>

                        <p className="text-xs text-[#647083]">
                          {etudiant.matricule}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={saisie.note_obtenue}
                          readOnly={lectureSeule}
                          onChange={(e) =>
                            modifierSaisie(
                              etudiant.inscription_id,
                              'note_obtenue',
                              e.target.value
                            )
                          }
                          placeholder="0"
                          className="w-24 rounded-lg border border-[#D8DDE5] p-2 outline-none focus:border-[#C08081] read-only:cursor-default read-only:bg-[#F5F0EB]"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={saisie.note_maximale}
                          readOnly={lectureSeule}
                          onChange={(e) =>
                            modifierSaisie(
                              etudiant.inscription_id,
                              'note_maximale',
                              e.target.value
                            )
                          }
                          className="w-24 rounded-lg border border-[#D8DDE5] p-2 outline-none focus:border-[#C08081] read-only:cursor-default read-only:bg-[#F5F0EB]"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <input
                          type="text"
                          value={saisie.commentaire}
                          readOnly={lectureSeule}
                          onChange={(e) =>
                            modifierSaisie(
                              etudiant.inscription_id,
                              'commentaire',
                              e.target.value
                            )
                          }
                          placeholder="Facultatif"
                          className="w-40 rounded-lg border border-[#D8DDE5] p-2 outline-none focus:border-[#C08081] read-only:cursor-default read-only:bg-[#F5F0EB]"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#172A46]">
                          {moyenne === null
                            ? '—'
                            : `${moyenne.toFixed(2)} / 100`}
                        </span>
                      </td>

                      {!lectureSeule && (
                        <td className="px-4 py-4">
                          <button
                            onClick={() => enregistrerNote(etudiant)}
                            disabled={Boolean(enregistrement)}
                            className="flex items-center gap-2 rounded-lg bg-[#172A46] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#263E60] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save size={15} />
                            {sauvegarde
                              ? 'Enregistrement...'
                              : 'Enregistrer'}
                          </button>
                        </td>
                      )}

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calcul de la moyenne */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E8E1DC] bg-white p-4">
        <Calculator className="mt-1 text-[#C08081]" size={21} />

        <div>
          <p className="font-medium text-[#172A46]">
            Calcul de la moyenne semestrielle
          </p>

          <p className="mt-1 text-sm text-[#647083]">
            Chaque matière est calculée sur 100, puis pondérée par son
            coefficient. Les matières sans note ne sont pas prises en compte.
            La moyenne affichée est actualisée après l'enregistrement d'une note.
          </p>
        </div>
      </div>

    </div>
  )
}
