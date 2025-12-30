export default function SubscribeSection() {
  return (
    <section className="subscribe-section reveal">
      <div className="sub-content">
        <h2>Stay in touch!</h2>
        <p>Latest offers, news, & goodies to your inbox.</p>
        <form className="sub-form">
          <input type="email" name="email" placeholder="Your email address" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}