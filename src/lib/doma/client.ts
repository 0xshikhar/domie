import { GraphQLClient } from 'graphql-request';

export const domaClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_DOMA_GRAPHQL_URL || 'https://api.doma.dev/graphql',
  {
    headers: {
      ...(process.env.DOMA_API_KEY && {
        'x-api-key': process.env.DOMA_API_KEY,
      }),
    },
  }
);

// GraphQL queries for DOMA domains
export const GET_DOMAINS = `
  query GetDomains($limit: Int, $offset: Int, $filter: DomainFilter) {
    domains(limit: $limit, offset: $offset, filter: $filter) {
      id
      name
      tld
      tokenId
      owner
      registrationDate
      expiryDate
      isListed
      price
      currency
    }
  }
`;

export const GET_DOMAIN_BY_NAME = `
  query GetDomainByName($name: String!) {
    domain(name: $name) {
      id
      name
      tld
      tokenId
      owner
      registrationDate
      expiryDate
      isListed
      price
      currency
      description
      metadata
    }
  }
`;

export const GET_DOMAIN_OFFERS = `
  query GetDomainOffers($tokenId: String!) {
    offers(tokenId: $tokenId) {
      id
      offerer
      amount
      currency
      status
      expiryDate
      createdAt
    }
  }
`;

export const GET_DOMAIN_HISTORY = `
  query GetDomainHistory($tokenId: String!) {
    transactions(tokenId: $tokenId) {
      id
      type
      from
      to
      amount
      timestamp
      txHash
    }
  }
`;

// Helper functions
export async function fetchDomains(variables?: any) {
  try {
    return await domaClient.request(GET_DOMAINS, variables);
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw error;
  }
}

export async function fetchDomainByName(name: string) {
  try {
    return await domaClient.request(GET_DOMAIN_BY_NAME, { name });
  } catch (error) {
    console.error('Error fetching domain:', error);
    throw error;
  }
}

export async function fetchDomainOffers(tokenId: string) {
  try {
    return await domaClient.request(GET_DOMAIN_OFFERS, { tokenId });
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
}

export async function fetchDomainHistory(tokenId: string) {
  try {
    return await domaClient.request(GET_DOMAIN_HISTORY, { tokenId });
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
}
