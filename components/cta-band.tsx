/* eslint-disable @next/next/no-img-element -- decorative supplied SVG */
import Link from "next/link";

export function CtaBand() {
  return (
    <section className="cta-band wrap" aria-labelledby="cta-title">
      <div className="cta on-peach">
        <img className="cta__pattern" src="/assets/shared/desktop/bg-pattern-call-to-action.svg" width={876} height={584} alt="" />
        <div>
          <h2 id="cta-title" className="title-l">Let’s talk about your project</h2>
          <p>Ready to take it to the next level? Contact us today and find out how our expertise can help your business grow.</p>
        </div>
        <Link className="btn btn-light" href="/contact">Get in touch</Link>
      </div>
    </section>
  );
}
