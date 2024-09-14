'use client'

import { useEffect } from 'react';
import styles from './Chat.module.css';

const Chat = ({lignes}: {lignes: string[]}) => {
  useEffect(() => {
    const element = document.getElementById((lignes.length - 1).toString());
    if (element)
      element.scrollIntoView();
  }, [lignes]);

  return (
    <div className={styles.chatContainer}>
      {lignes.map((lign, index) => {
        return <p id={index.toString()} key={index.toString()}>{lign}</p>;
      })}
    </div>
  );
}

export default Chat;