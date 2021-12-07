import { useQuery, gql } from "@apollo/client";

const ArticleQuery = gql`
  {
    articles(options: { limit: 25, sort: { published: DESC } }) {
      title
      url
      published
    }
  }
`;

const Articles = () => {
  const { data } = useQuery(ArticleQuery);

  return (
    <div>
      <ul>
        {data?.articles.map((v) => {
          return (
            <li key={v.url}>
              <a href={v.url} target="_blank" rel="noreferrer">
                {v.title}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Articles;
