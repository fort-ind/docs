import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

const FeatureList = [
  {
    title: "Create!",
    imgSrc: "img/meow.svg",
    svgClassName: clsx(styles.featureSvg, styles.featureSvgMeow),
    description: (
      <>
        the docs can help you devlop for fort.ind and putting games into html
        files or trying to mess around with fort.uwp!
      </>
    ),
  },
  {
    title: "Learn about fort.ind!",
    imgSrc: "img/readingcat.svg",
    svgClassName: clsx(styles.featureSvg, styles.featureSvgReadingCat),
    description: (
      <>
        get a feel on how to make games into HTML files, and how to connect with
        others!
      </>
    ),
  },
  {
    title: "Contribute!",
    imgSrc: "img/verybadsvgconversion.svg",
    svgClassName: styles.featureSvg,
    description: (
      <>
        feel like there is something that should be added :p well guess what YOU can add it! 
      </>
    ),
  },
];

function Feature({ imgSrc, title, description, svgClassName }) {
  const imgUrl = useBaseUrl(imgSrc);
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.featureImage}>
        <img src={imgUrl} alt={title} className={svgClassName} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
