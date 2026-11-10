
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const rolesAutorises = [
  'directeur',
  'directeur_academique',
  'secretaire',
  'responsable_pedagogique',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Méthode non autorisée.' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return jsonResponse({ error: 'Authentification requise.' }, 401)
    }

    // Vérifier l'identité du demandeur
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return jsonResponse({ error: 'Session invalide.' }, 401)
    }

    // Client administratif réservé au serveur
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Vérifier que le demandeur est un directeur actif
    const { data: profilDirecteur, error: profilError } = await admin
      .from('profiles')
      .select('id, active')
      .eq('id', user.id)
      .single()

    const { data: roleDirecteur, error: roleError } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (
      profilError ||
      roleError ||
      !profilDirecteur?.active ||
      roleDirecteur?.role !== 'directeur'
    ) {
      return jsonResponse(
        { error: 'Accès réservé à un directeur actif.' },
        403,
      )
    }

    const body = await req.json()
    const { action } = body

    // Liste du personnel
    if (action === 'list') {
      const { data: profils, error: profilsError } = await admin
        .from('profiles')
        .select('id, full_name, phone, active, created_at')
        .order('created_at', { ascending: false })

      if (profilsError) throw profilsError

      const { data: roles, error: rolesError } = await admin
        .from('user_roles')
        .select('user_id, role, assigned_by, created_at')

      if (rolesError) throw rolesError

      const personnel = profils.map((profil) => ({
        ...profil,
        role:
          roles.find((r) => r.user_id === profil.id)?.role ?? null,
        assigned_by:
          roles.find((r) => r.user_id === profil.id)?.assigned_by ?? null,
      }))

      return jsonResponse({ personnel })
    }

    // Vérifier un membre du personnel
    const userId = body.user_id

    if (['update_profile', 'set_role', 'set_active'].includes(action)) {
      if (!userId) {
        return jsonResponse({ error: 'Identifiant utilisateur manquant.' }, 400)
      }

      const { data: cible, error: cibleError } = await admin
        .from('profiles')
        .select('id, active')
        .eq('id', userId)
        .single()

      if (cibleError || !cible) {
        return jsonResponse({ error: 'Utilisateur introuvable.' }, 404)
      }

      const { data: roleCible } = await admin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      // Empêcher de retirer le dernier directeur actif
      const protegerDernierDirecteur = async () => {
        if (roleCible?.role !== 'directeur' || !cible.active) {
          return false
        }

        const { data: directeurs, error } = await admin
          .from('user_roles')
          .select('user_id')
          .eq('role', 'directeur')

        if (error) throw error

        const ids = (directeurs ?? []).map((r) => r.user_id)

        const { data: profilsActifs, error: actifsError } = await admin
          .from('profiles')
          .select('id')
          .in('id', ids)
          .eq('active', true)

        if (actifsError) throw actifsError

        return (profilsActifs ?? []).length <= 1
      }

      if (action === 'update_profile') {
        const fullName = body.full_name?.trim()
        const phone = body.phone?.trim() || null

        if (!fullName) {
          return jsonResponse({ error: 'Le nom complet est obligatoire.' }, 400)
        }

        const { error } = await admin
          .from('profiles')
          .update({ full_name: fullName, phone })
          .eq('id', userId)

        if (error) throw error

        return jsonResponse({ message: 'Profil mis à jour.' })
      }

      if (action === 'set_active') {
        if (typeof body.active !== 'boolean') {
          return jsonResponse({ error: 'Valeur active invalide.' }, 400)
        }

        if (userId === user.id && body.active === false) {
          return jsonResponse(
            { error: 'Tu ne peux pas désactiver ton propre compte.' },
            400,
          )
        }

        if (
          body.active === false &&
          await protegerDernierDirecteur()
        ) {
          return jsonResponse(
            { error: 'Impossible de désactiver le dernier directeur actif.' },
            400,
          )
        }

        const { error } = await admin
          .from('profiles')
          .update({ active: body.active })
          .eq('id', userId)

        if (error) throw error

        return jsonResponse({ message: 'Statut du profil mis à jour.' })
      }

      if (action === 'set_role') {
        const nouveauRole = body.role

        if (!rolesAutorises.includes(nouveauRole)) {
          return jsonResponse({ error: 'Rôle non autorisé.' }, 400)
        }

        if (
          nouveauRole !== 'directeur' &&
          await protegerDernierDirecteur()
        ) {
          return jsonResponse(
            { error: 'Impossible de retirer le rôle du dernier directeur actif.' },
            400,
          )
        }

        const { error } = await admin
          .from('user_roles')
          .upsert(
            {
              user_id: userId,
              role: nouveauRole,
              assigned_by: user.id,
            },
            { onConflict: 'user_id' },
          )

        if (error) throw error

        return jsonResponse({ message: 'Rôle mis à jour.' })
      }
    }

    // Inviter un nouveau membre du personnel
    // Inviter un nouveau membre du personnel
if (action === 'invite') {
  const email = body.email?.trim().toLowerCase()
  const fullName = body.full_name?.trim()
  const phone = body.phone?.trim() || null
  const role = body.role

  if (!email || !fullName) {
    return jsonResponse(
      { error: 'Adresse e-mail et nom complet obligatoires.' },
      400,
    )
  }

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  if (!emailValide) {
    return jsonResponse(
      { error: 'Adresse e-mail invalide.' },
      400,
    )
  }

  if (!rolesAutorises.includes(role)) {
    return jsonResponse({ error: 'Rôle non autorisé.' }, 400)
  }

  const redirectTo =
    Deno.env.get('APP_REDIRECT_URL') ||
    'https://margareth025.github.io/intela/'

  // Créer le compte et envoyer l'invitation
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName, phone },
      redirectTo,
    },
  )

  if (error) throw error

  if (!data.user) {
    throw new Error('Invitation créée sans utilisateur retourné.')
  }

  const invitedUserId = data.user.id

  try {
    // Créer ou mettre à jour le profil
    const { error: profileError } = await admin
      .from('profiles')
      .upsert(
        {
          id: invitedUserId,
          full_name: fullName,
          phone,
          active: true,
        },
        { onConflict: 'id' },
      )

    if (profileError) throw profileError

    // Attribuer le rôle
    const { error: roleError } = await admin
      .from('user_roles')
      .upsert(
        {
          user_id: invitedUserId,
          role,
          assigned_by: user.id,
        },
        { onConflict: 'user_id' },
      )

    if (roleError) throw roleError

    return jsonResponse({
      message: 'Invitation envoyée avec succès.',
      user_id: invitedUserId,
    })
  } catch (setupError) {
    // Annuler la création du compte si son profil ou son rôle
    // n'a pas pu être correctement configuré.
    const { error: deleteError } =
      await admin.auth.admin.deleteUser(invitedUserId)

    if (deleteError) {
      console.error(
        'Échec de la suppression du compte après erreur:',
        deleteError,
      )
    }

    throw setupError
  }
}
    return jsonResponse({ error: 'Action inconnue.' }, 400)

  } catch (error) {
    console.error('Erreur gestion-personnel:', error)

    return jsonResponse(
      {
        error: error instanceof Error
          ? error.message
          : 'Erreur serveur.',
      },
      500,
    )
  }
})