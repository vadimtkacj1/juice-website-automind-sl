import styles from './SubscribeSection.module.css';

export default function SubscribeSection() {
  return (
    <section className={`${styles.subscribeSection} reveal`}>
      <div className={styles.subContent}>
        <h2>{'הישאר בקשר!'}</h2>
        <p>{'הצעות אחרונות, חדשות ומבצעים ישירות לתיבת הדואר שלך.'}</p>
        <form className={styles.subForm}>
          <input type="email" name="email" placeholder={'כתובת האימייל שלך'} required />
          <button type="submit">{'הירשם'}</button>
        </form>
      </div>
    </section>
  );
}