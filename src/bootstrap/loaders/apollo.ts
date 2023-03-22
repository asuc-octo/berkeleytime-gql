import { ApolloServer } from "@apollo/server";
import { buildSchema } from "../../utils/buildSchema";
import responseCachePlugin from '@apollo/server-plugin-response-cache';

export default async () => {
  const schema = buildSchema();

  return new ApolloServer({
    schema,
    plugins: [responseCachePlugin()],
  });
};
