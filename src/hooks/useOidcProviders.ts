import { useQuery } from '@tanstack/react-query';

import { useApi } from './useApi';

export interface OidcProviderInfo {
    ProviderId: string
    Name?: string
    Authority?: string
    RedirectUri?: string
}

export const useOidcProviders = () => {
    const { __legacyApiClient__ } = useApi();

    return useQuery({
        queryKey: [ 'Oidc', 'Providers' ],
        queryFn: async () => {
            if (!__legacyApiClient__) throw new Error('No API instance available');

            return await __legacyApiClient__
                .getJSON(__legacyApiClient__.getUrl('auth/oidc/providers')) as OidcProviderInfo[];
        },
        enabled: !!__legacyApiClient__
    });
};
