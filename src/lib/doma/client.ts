import axios from 'axios';

interface GraphResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

// Create axios client for DOMA GraphQL API
export const domaQLClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DOMA_GRAPHQL_URL || 'https://api.doma.dev/graphql',
  headers: {
    'api-key': process.env.NEXT_PUBLIC_DOMA_API_KEY || '',
  },
});

// GraphQL request helper
export async function graphRequest<T>(
  query: string,
  variables?: Record<string, string | number | boolean | object | null | string[]>
): Promise<T> {
  const res = await domaQLClient.post('/', { query, variables });

  if (res.status !== 200) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  const data = res.data as GraphResponse<T>;

  if (data.errors && data.errors.length) {
    throw new Error(data.errors.map((e) => e.message).join('; '));
  }

  return data.data as T;
}

// GraphQL queries matching DOMA API schema
export const GET_NAMES = `
  query NamesQuery(
    $skip: Int, 
    $take: Int, 
    $ownedBy: [AddressCAIP10!], 
    $claimStatus: NamesQueryClaimStatus = ALL,
    $name: String, 
    $networkIds: [String!], 
    $registrarIanaIds: [Int!], 
    $tlds: [String!], 
    $sortOrder: SortOrderType, 
    $sortBy: NamesQuerySortBy, 
    $fractionalized: Boolean, 
    $listed: Boolean, 
    $active: Boolean
  ) {
    names(
      skip: $skip,
      take: $take,
      ownedBy: $ownedBy,
      claimStatus: $claimStatus,
      name: $name,
      networkIds: $networkIds,
      registrarIanaIds: $registrarIanaIds,
      tlds: $tlds,
      sortOrder: $sortOrder,
      sortBy: $sortBy,
      fractionalized: $fractionalized,
      listed: $listed,
      active: $active
    ) {
      items { 
        name 
        claimedBy 
        eoi 
        expiresAt 
        isFractionalized 
        tokenizedAt 
        transferLock 
        registrar {
          ianaId
          name
          websiteUrl
          supportEmail
          publicKeys
        }
        tokens {
          tokenId
          tokenAddress
          networkId
          ownerAddress
          openseaCollectionSlug
          chain {
            addressUrlTemplate
            name
            networkId
          }
          listings {
            id
            offererAddress
            orderbook
            externalId
            price
            currency {
              name
              symbol
              decimals
              usdExchangeRate
            }
            createdAt
            expiresAt
          }
        }
      }
      currentPage
      hasNextPage
      hasPreviousPage
      pageSize
      totalCount
      totalPages    
    }    
  }
`;

export const GET_NAME = `
  query NameQuery($name: String!) {
    name(name: $name) {
      name 
      claimedBy 
      eoi 
      expiresAt 
      isFractionalized 
      tokenizedAt 
      transferLock
      fractionalTokenInfo {
        boughtOutAt
        boughtOutBy
        buyoutPrice
        address
        fractionalizedTxHash
        launchpadAddress
        poolAddress
        status
        vestingWalletAddress
        fractionalizedBy
        fractionalizedAt
      }
      nameservers {
        ldhName
      }
      registrar {
        ianaId
        name
        websiteUrl
        supportEmail
        publicKeys
      }
      tokens {
        tokenId
        tokenAddress
        networkId
        explorerUrl
        ownerAddress
        openseaCollectionSlug
        chain {
          addressUrlTemplate
          name
          networkId
        }
        listings {
          id
          offererAddress
          orderbook
          externalId
          price
          currency {
            name
            symbol
            decimals
            usdExchangeRate
          }
          createdAt
          expiresAt
        }
        startsAt
        createdAt
        expiresAt
        orderbookDisabled
      }
      activities {
        ... on NameClaimedActivity {
          type
          txHash
          sld
          tld
          createdAt
          claimedBy
        }
        ... on NameRenewedActivity {
          type
          txHash
          sld
          tld
          createdAt
          expiresAt
        }
        ... on NameDetokenizedActivity {
          type
          txHash
          sld
          tld
          createdAt
          networkId
        }
        ... on NameTokenizedActivity {
          type
          txHash
          sld
          tld
          createdAt
          networkId
        }
        ... on NameClaimRequestedActivity {
          type
          txHash
          sld
          tld
          createdAt
        }
        ... on NameClaimApprovedActivity {
          type
          txHash
          sld
          tld
          createdAt
        }
        ... on NameClaimRejectedActivity {
          type
          txHash
          sld
          tld
          createdAt
        }
      }
    }
  }
`;

export const GET_OFFERS = `
  query OffersQuery($skip: Int, $take: Int, $tokenId: String) {
    offers(skip: $skip, take: $take, tokenId: $tokenId) {
      items {
        externalId
        price
        currency {
          decimals
          name
          symbol
          usdExchangeRate
        }
        offererAddress
        orderbook
        expiresAt
        createdAt
      }
      currentPage
      hasNextPage
      hasPreviousPage
      pageSize
      totalCount
      totalPages
    }
  }
`;

export const GET_NAME_STATISTICS = `
  query NameStatistics($tokenId: String!) {
    nameStatistics(tokenId: $tokenId) {
      activeOffers
      offersLast3Days
      highestOffer {
        externalId
        price
        currency {
          decimals
          name
          symbol
        }
        offererAddress
        orderbook
        expiresAt
        createdAt
      }
    }
  }
`;

// Helper functions
export async function fetchNames(variables?: any) {
  try {
    const data = await graphRequest<{ names: any }>(GET_NAMES, variables);
    return data.names;
  } catch (error) {
    console.error('Error fetching names:', error);
    throw error;
  }
}

export async function fetchName(name: string) {
  try {
    const data = await graphRequest<{ name: any }>(GET_NAME, { name });
    return data.name;
  } catch (error) {
    console.error('Error fetching name:', error);
    throw error;
  }
}

export async function fetchOffers(tokenId: string, skip = 0, take = 20) {
  try {
    const data = await graphRequest<{ offers: any }>(GET_OFFERS, { skip, take, tokenId });
    return data.offers;
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
}

export async function fetchNameStatistics(tokenId: string) {
  try {
    const data = await graphRequest<{ nameStatistics: any }>(GET_NAME_STATISTICS, { tokenId });
    return data.nameStatistics;
  } catch (error) {
    console.error('Error fetching name statistics:', error);
    throw error;
  }
}
