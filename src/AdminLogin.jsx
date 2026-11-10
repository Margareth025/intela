
import { useState } from 'react'
import { supabase } from './lib/supabase'
import { LockKeyhole, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import './AdminLogin.css'

export default function AdminLogin({ onLogin, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password
        })

      if (authError) throw authError

      const user = data.user

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, active')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      if (!profile?.active) {
        await supabase.auth.signOut()
        throw new Error('Ce compte est désactivé. Contactez la direction.')
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (roleError || !roleData) {
        await supabase.auth.signOut()
        throw new Error('Aucun rôle administratif attribué à ce compte.')
      }

      onLogin({
        user,
        profile,
        role: roleData.role
      })

    } catch (err) {
      setError(err.message || 'Impossible de vous connecter.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-decoration">
        <div className="login-brand">
          <span className="brand-symbol">I</span>
          <div>
            <strong>INTELA</strong>
            <small>INSTITUT TECHNOLOGIQUE DE L'ARTIBONITE</small>
          </div>
        </div>

        <div className="login-message">
          <span className="eyebrow">ESPACE PROFESSIONNEL</span>
          <h1>Bienvenue dans votre espace administratif.</h1>
          <p>
            Un environnement de travail dédié à la gestion,
            à l'organisation et au développement de notre institut.
          </p>
          <div className="login-security">
            <ShieldCheck size={20} />
            <span>Accès réservé au personnel autorisé</span>
          </div>
        </div>

        <small className="login-copyright">
          © {new Date().getFullYear()} INTELA — Tous droits réservés.
        </small>
      </div>

      <div className="login-form-side">
        <button className="login-back" onClick={onBack}>
          ← Retour au site
        </button>

        <div className="login-form-container">
          <div className="login-icon">
            <LockKeyhole size={27} />
          </div>

          <span className="eyebrow">CONNEXION SÉCURISÉE</span>
          <h2>Accéder à mon espace</h2>
          <p className="login-description">
            Entrez vos identifiants professionnels pour continuer.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Adresse e-mail</label>
            <div className="login-input">
              <Mail size={18} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@intela.ht"
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="login-password">Mot de passe</label>
            <div className="login-input">
              <LockKeyhole size={18} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="login-help">
            Problème de connexion ? Contactez l'administration d'INTELA.
          </p>
        </div>
      </div>
    </div>
  )
}
