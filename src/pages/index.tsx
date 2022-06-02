import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Home.module.css'

export default function Home() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const {signIn} = useContext(AuthContext)

  const handleSubmit  = async (event:FormEvent) => {
    event.preventDefault();
    const data = {
      email,
      password
    }

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={({target}) => setEmail(target.value)} />
      <input type="password" value={password} onChange={({target}) => setPassword(target.value)}/>
      <button type="submit">Entrar</button>
    </form>
  )
}
