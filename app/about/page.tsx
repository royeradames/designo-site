import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { LocationLinks } from "@/components/location-links";
import { ArtPicture } from "@/components/picture";

export const metadata: Metadata = {
  title: "About us",
  description: "Founded in 2010, Designo is a team of strategists, problem-solvers and technologists who craft brands, products and digital experiences.",
};

const aboutImage = (name: string) => ({
  mobile: `/assets/about/mobile/image-${name}.jpg`,
  tablet: `/assets/about/tablet/image-${name}.jpg`,
  desktop: `/assets/about/desktop/image-${name}.jpg`,
});

export default function AboutPage() {
  return (
    <>
      <span className="leaf leaf--left" style={{ top: 320 }} aria-hidden="true" />
      <span className="leaf leaf--right" style={{ top: 1340 }} aria-hidden="true" />
      <div className="sections about-page">
        <section className="wrap-tablet" aria-labelledby="about-title">
          <div className="page-hero page-hero--about on-peach">
            <div className="page-hero__media">
              <ArtPicture className="page-hero__image" sources={aboutImage("about-hero")} alt="Overhead view of a team working with laptops, tablets and notebooks around a wooden table" width={375} height={320} priority />
            </div>
            <div className="page-hero__copy">
              <span className="page-hero__pattern page-hero__pattern--about" aria-hidden="true" />
              <h1 id="about-title" className="title-xl">About Us</h1>
              <p>Founded in 2010, we are a creative agency that produces lasting results for our clients. We’ve partnered with many startups, corporations, and nonprofits alike to craft designs that make real impact. We’re always looking forward to creating brands, products, and digital experiences that connect with our clients’ audiences.</p>
            </div>
          </div>
        </section>

        <section className="wrap-tablet about-talent" aria-labelledby="talent-title">
          <div className="story">
            <span className="story__pattern story__pattern--talent" aria-hidden="true" />
            <div className="story__media">
              <ArtPicture className="story__image" sources={aboutImage("world-class-talent")} alt="A woman pinning photos to a studio wall under hanging light bulbs" width={375} height={320} />
            </div>
            <div className="story__copy">
              <h2 id="talent-title" className="title-l">World-class talent</h2>
              <div>
                <p>We are a crew of strategists, problem-solvers, and technologists. Every design is thoughtfully crafted from concept to launch, ensuring success in its given market. We are constantly updating our skills in a myriad of platforms.</p>
                <p>Our team is multi-disciplinary and we are not merely interested in form — content and meaning are just as important. We give great importance to craftsmanship, service, and prompt delivery. Clients have always been impressed with our high-quality outcomes that encapsulates their brand’s story and mission.</p>
              </div>
            </div>
          </div>
        </section>

        <LocationLinks />

        <section className="wrap-tablet" aria-labelledby="deal-title">
          <div className="story story--reverse">
            <span className="story__pattern story__pattern--deal" aria-hidden="true" />
            <div className="story__media">
              <ArtPicture className="story__image" sources={aboutImage("real-deal")} alt="Hands arranging printed photos on a white wall" width={375} height={320} />
            </div>
            <div className="story__copy">
              <h2 id="deal-title" className="title-l">The real deal</h2>
              <div>
                <p>As strategic partners in our clients’ businesses, we are ready to take on any challenge as our own. Solving real problems require empathy and collaboration, and we strive to bring a fresh perspective to every opportunity. We make design and technology more accessible and give you tools to measure success.</p>
                <p>We are visual storytellers in appealing and captivating ways. By combining business and marketing strategies, we inspire audiences to take action and drive real results.</p>
              </div>
            </div>
          </div>
        </section>

        <CtaBand />
      </div>
    </>
  );
}
