import { translateToHebrew } from '@/lib/translations';
import styles from './SubscribeSection.module.css';

export default function SubscribeSection() {
  return (
    <section className={`${styles.subscribeSection} reveal`}>
      <div className={styles.subContent}>
        <h2>{translateToHebrew('Stay in touch!')}</h2>
        <p>{translateToHebrew('Latest offers, news, & goodies to your inbox.')}</p>
        <form className={styles.subForm}>
          <input type="email" name="email" placeholder={translateToHebrew('Your email address')} required />
          <button type="submit">{translateToHebrew('Subscribe')}</button>
        </form>
      </div>
    </section>
  );
}