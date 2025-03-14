import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

const FeatureList = [
  {
    title: "Query",
    description: (
      <>
        All PDSIMG products are publicly queryable via ElasticSearch DSL
        queries.
      </>
    ),
  },
  {
    title: "Traverse",
    description: (
      <>Delivery folder structures are fully retained and traversable.</>
    ),
  },
  {
    title: "Public",
    description: <>All our APIs are public and will remain so.</>,
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center"></div>
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
