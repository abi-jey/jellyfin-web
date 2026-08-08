import React, { FC, useCallback } from 'react';

import Page from 'components/Page';
import Loading from 'components/loading/LoadingComponent';
import Button from 'elements/emby-button/Button';
import { useApi } from 'hooks/useApi';
import { useOidcProviders, type OidcProviderInfo } from 'hooks/useOidcProviders';
import globalize from 'lib/globalize';

const ProviderLinkButton: FC<{ provider: OidcProviderInfo }> = ({ provider }) => {
    const { __legacyApiClient__ } = useApi();

    const onClick = useCallback(() => {
        if (!__legacyApiClient__) return;

        __legacyApiClient__.ajax({
            type: 'POST',
            url: __legacyApiClient__.getUrl(`auth/oidc/${encodeURIComponent(provider.ProviderId)}/link/start`),
            data: JSON.stringify({ ReturnUrl: window.location.pathname }),
            contentType: 'application/json',
            dataType: 'json'
        }).then(result => {
            window.location.href = result.Url;
        }).catch(err => {
            console.error('[OIDC] failed to start account linking', err);
        });
    }, [ __legacyApiClient__, provider.ProviderId ]);

    return (
        <Button
            type='button'
            className='raised block btnLinkOidcProvider'
            title={globalize.translate('ButtonLinkProviderAccount', provider.Name ?? provider.ProviderId)}
            onClick={onClick}
        />
    );
};

const OidcLinkPage: FC = () => {
    const { data: providers, isPending } = useOidcProviders();

    if (isPending) {
        return <Loading />;
    }

    return (
        <Page
            id='oidcLinkPreferencesPage'
            title={globalize.translate('HeaderLinkedAccounts')}
            className='mainAnimatedPage libraryPage userPreferencesPage noSecondaryNavPage'
            shouldAutoFocus
        >
            <div className='padded-left padded-right padded-bottom-page'>
                <div className='readOnlyContent'>
                    <div className='verticalSection'>
                        <h2 className='sectionTitle'>
                            {globalize.translate('HeaderLinkedAccounts')}
                        </h2>
                        <div>
                            {globalize.translate('MessageLinkedAccountsDescription')}
                        </div>
                        <br />

                        {(providers ?? []).map(provider => (
                            <ProviderLinkButton
                                key={provider.ProviderId}
                                provider={provider}
                            />
                        ))}

                        {!providers?.length && (
                            <div>{globalize.translate('MessageNoOidcProviders')}</div>
                        )}
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default OidcLinkPage;
