import { prisma } from './prisma';

interface SyncDomainParams {
    name: string;
    tld: string;
    tokenId: string;
    owner: string;
    isListed: boolean;
    price?: string;
    currency?: string;
    description?: string;
}

/**
 * Syncs a domain from blockchain to Prisma database
 * Creates if doesn't exist, updates if it does
 */
export async function syncDomainToDatabase(params: SyncDomainParams) {
    const {
        name,
        tld,
        tokenId,
        owner,
        isListed,
        price,
        currency = 'ETH',
        description,
    } = params;

    try {
        // Use original owner address to preserve checksum
        const ownerAddress = owner.trim();

        // Check if domain exists
        const existingDomain = await prisma.domain.findUnique({
            where: { tokenId },
        });

        if (existingDomain) {
            // Update existing domain
            const updatedDomain = await prisma.domain.update({
                where: { tokenId },
                data: {
                    owner: ownerAddress,
                    isListed,
                    price: price || null,
                    currency,
                    description,
                },
            });
            return updatedDomain;
        } else {
            // Create new domain
            const newDomain = await prisma.domain.create({
                data: {
                    name,
                    tld,
                    tokenId,
                    owner: ownerAddress,
                    isListed,
                    price: price || null,
                    currency,
                    description,
                },
            });
            return newDomain;
        }
    } catch (error) {
        console.error('Error syncing domain to database:', error);
        throw error;
    }
}

/**
 * Gets domain from database by name, creates if doesn't exist
 */
export async function getOrCreateDomain(params: SyncDomainParams) {
    try {
        // Try to find by name first
        let domain = await prisma.domain.findUnique({
            where: { name: params.name },
        });

        if (!domain) {
            // If not found, sync from blockchain
            domain = await syncDomainToDatabase(params);
        }

        return domain;
    } catch (error) {
        console.error('Error getting or creating domain:', error);
        throw error;
    }
}
