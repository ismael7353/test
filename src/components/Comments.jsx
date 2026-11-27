import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addComment, fetchComments } from '../api/social'
import Avatar from './Avatar'

export default function Comments({ postId, user, onAdd }) {
  const [list, setList] = useState(null)
  const [text, setText] = useState('')
  useEffect(() => { fetchComments(postId).then(setList).catch(() => setList([])) }, [postId])
  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    const c = await addComment(postId, text.trim())
    setList((l) => [...l, c]); setText(''); onAdd()
  }
  return (
    <div className="cmts">
      {(list || []).map((c) => (
        <div key={c.id} className="row cmt">
          <Avatar url={c.author?.avatar_url} name={c.author?.username || 'Client'} size={32} />
          <div className="bubble"><b>{c.author?.username || 'Client'}</b><div>{c.body}</div></div>
        </div>
      ))}
      {user ? (
        <form className="row" onSubmit={send}>
          <input value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Écrire un commentaire…" style={{ margin: 0 }} />
          <button className="pri">Envoyer</button>
        </form>
      ) : <Link to="/login" className="mu">Connectez-vous pour commenter</Link>}
    </div>
  )
}
