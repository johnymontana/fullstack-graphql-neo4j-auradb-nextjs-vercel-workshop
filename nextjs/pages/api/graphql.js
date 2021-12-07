import { gql, ApolloServer } from "apollo-server-micro";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";

const typeDefs = gql`
  type Article @exclude(operations: [CREATE, UPDATE, DELETE]) {
    abstract: String
    published: Date
    title: String
    url: String!
    photo: Photo @relationship(type: "HAS_PHOTO", direction: OUT)
    authors: [Author] @relationship(type: "BYLINE", direction: OUT)
    topics: [Topic] @relationship(type: "HAS_TOPIC", direction: OUT)
    people: [Person] @relationship(type: "ABOUT_PERSON", direction: OUT)
    organizations: [Organization]
      @relationship(type: "ABOUT_ORGANIZATION", direction: OUT)
    geos: [Geo] @relationship(type: "ABOUT_GEO", direction: OUT)
  }

  type Author @exclude(operations: [CREATE, UPDATE, DELETE]) {
    name: String!
    articles: [Article] @relationship(type: "BYLINE", direction: IN)
  }

  type Topic @exclude(operations: [CREATE, UPDATE, DELETE]) {
    name: String!
    articles: [Article] @relationship(type: "HAS_TOPIC", direction: IN)
  }

  type Person @exclude(operations: [CREATE, UPDATE, DELETE]) {
    name: String!
    articles: [Article] @relationship(type: "ABOUT_PERSON", direction: IN)
  }

  type Organization @exclude(operations: [CREATE, UPDATE, DELETE]) {
    name: String!
    articles: [Article] @relationship(type: "ABOUT_ORGANIZATION", direction: IN)
  }

  type Geo @exclude(operations: [CREATE, UPDATE, DELETE]) {
    name: String!
    location: Point
    articles: [Article] @relationship(type: "ABOUT_GEO", direction: IN)
  }

  type Photo @exclude(operations: [CREATE, UPDATE, DELETE]) {
    caption: String
    url: String!
    article: Article @relationship(type: "HAS_PHOTO", direction: IN)
  }
`;

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const apolloServer = new ApolloServer({
  schema: neoSchema.schema,
  playground: true,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

const startServer = apolloServer.start();

export default async function handler(req, res) {
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
