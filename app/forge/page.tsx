'use client'

import styles from '../page.module.css';
import { Text } from '@chakra-ui/react';

export default function Page() {

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Forge</h1>
      <Text fontSize='xl' mb={4}>WIP...</Text>
    </main>
  );
};